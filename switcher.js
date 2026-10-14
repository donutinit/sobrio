// The switcher: an overlay on the page (injected on Ctrl+Space) or the toolbar popup.
(() => {
  const { match } = sobrio;
  // Everything typing fires and pages could listen to: keys, and the text itself.
  const SHIELDED_EVENTS = ['keydown', 'keypress', 'keyup', 'beforeinput', 'input', 'textInput',
    'compositionstart', 'compositionupdate', 'compositionend'];
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions);
  // boot.js keeps the native sendMessage before darkreader.js patches it. Popups and tabs
  // opened before sobrio was installed have no boot.js, and nothing patched either.
  const send = (message) => (sobrio.send ?? chrome.runtime.sendMessage.bind(chrome.runtime))(message);

  function el(tag, className, ...children) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children);
    return node;
  }

  // positions index code points, as match.js reports them.
  function highlight(text, positions) {
    const hits = new Set(positions);
    const fragment = document.createDocumentFragment();
    let run = '';
    let bold = false;
    const flush = () => {
      if (run) fragment.append(bold ? el('b', null, run) : run);
      run = '';
    };
    Array.from(text).forEach((char, i) => {
      if (hits.has(i) !== bold) {
        flush();
        bold = !bold;
      }
      run += char;
    });
    flush();
    return fragment;
  }

  // The theme hook's colors and font, as the custom properties switcher-css.js reads.
  function themeVariables(theme) {
    if (!theme) return {};
    const vars = {
      '--s-bg': theme.background,
      '--s-border': theme.border,
      '--s-row': theme.selection,
      '--s-bar': theme.accent,
      '--s-hit': theme.accent,
      '--s-input': theme.text,
      '--s-title': theme.textMuted,
      '--s-sub': theme.textMuted && `color-mix(in srgb, ${theme.textMuted} 65%, ${theme.background ?? '#000'})`,
      '--s-font': theme.font && `${theme.font}, system-ui, sans-serif`,
    };
    return Object.fromEntries(Object.entries(vars).filter(([, value]) => value));
  }

  // layout: 'overlay' (on a page), 'popup' (the toolbar popup) or 'inline' (the new tab).
  // startMode: start on that engine (a shortcut asked for it) instead of bookmarks.
  function mountSwitcher(root, { layout, hostname, close, startMode }) {
    const popup = layout === 'popup';
    const input = el('input', 'input');
    input.spellcheck = false;
    input.autocomplete = 'off';
    const mode = el('span', 'mode');
    const list = el('ul', 'list');
    const hints = el('div', 'hints', t('hints'));
    const box = el('div', 'box', el('div', 'bar', mode, input), list, hints);
    const frame = el('div', layout === 'overlay' ? 'backdrop' : layout, box);
    root.append(el('style', null, sobrio.SWITCHER_CSS), frame);
    if (layout === 'overlay') frame.addEventListener('mousedown', (e) => e.target === frame && close());
    // Clicks inside keep the focus in the input: the keyboard shield only covers events that
    // come from the switcher, and Esc and typing must keep working.
    box.addEventListener('mousedown', (e) => e.target !== input && e.preventDefault());

    const { mergeSettings, siteState, matchingPatterns } = sobrio.settings;
    let settings = mergeSettings(undefined);
    let stored = {};
    let bookmarks = [];
    // Until the list arrives nothing jumps to an engine, and an early Enter waits for it:
    // a quick "gh" + Enter means the bookmark, not a web search.
    let loaded = false;
    let pendingEnter = null;
    let state = startMode ? { mode: startMode, manual: true } : { mode: 'bookmarks', manual: false };
    let rows = [];
    let selected = 0;

    send({ sobrio: 'bookmarks' })
      .catch(() => [])
      .then((answer) => {
        bookmarks = Array.isArray(answer) ? answer : [];
        loaded = true;
        update();
        if (pendingEnter) activate(selected, pendingEnter.newTab);
      });
    chrome.storage.local.get(['settings', 'theme', 'darkOff', 'cssOff']).then((answer) => {
      stored = answer;
      settings = mergeSettings(answer.settings);
      for (const [name, value] of Object.entries(themeVariables(answer.theme))) frame.style.setProperty(name, value);
      if (popup && answer.theme?.background) document.documentElement.style.background = answer.theme.background;
      update();
    });

    const open = (url, newTab) => send({ sobrio: 'open', url, newTab });
    // td and ta act through page.js, which only runs where boot.js did (sobrio.send): not in
    // the popup, nor in tabs that were open before sobrio was installed or updated.
    const commandAllowed = (kind) =>
      settings.switcher.commands &&
      (kind === 'settings' || (!popup && Boolean(sobrio.send) && match.commandsAllowed(hostname)));

    function bookmarkRow({ bookmark, hits }) {
      const sub = document.createDocumentFragment();
      if (bookmark.folder) sub.append(highlight(bookmark.folder, hits.folder), ' · ');
      sub.append(highlight(match.shortUrl(bookmark.url), hits.url));
      return {
        title: highlight(match.displayTitle(bookmark), bookmark.title ? hits.title : []),
        sub,
        run: (newTab) => open(bookmark.url, newTab),
      };
    }

    function engineRow(engine, query) {
      return {
        title: t('searchOn', query.trim(), engine.name),
        sub: new URL(engine.url).hostname,
        run: (newTab) => open(match.searchUrl(engine, query), newTab),
      };
    }

    function commandRow(kind) {
      if (kind === 'settings') {
        return { title: t('openSettings'), sub: 'settings', run: () => send({ sobrio: 'settings' }) };
      }
      const sub = kind === 'dark' ? 'td' : 'ta';
      if (kind === 'dark' && !settings.dark.enabled) {
        return { title: t('darkOnEverywhere'), sub, run: () => toggle(kind) };
      }
      const key = kind === 'dark' ? 'darkOff' : 'cssOff';
      const on = siteState(stored, hostname)[kind];
      const wildcards = matchingPatterns(stored[key], hostname).filter((p) => p.startsWith('*.'));
      const name = kind === 'dark' ? (on ? 'darkOff' : 'darkOn') : on ? 'cssOff' : 'cssOn';
      const title = t(name, hostname) + (!on && wildcards.length ? ` ${t('removesPatterns', wildcards.join(', '))}` : '');
      return { title, sub, run: () => toggle(kind) };
    }

    // Off adds this exact host; on removes every pattern that covers it, wildcards included.
    async function toggle(kind) {
      if (kind === 'dark' && !settings.dark.enabled) {
        const { settings: raw } = await chrome.storage.local.get('settings');
        const next = raw && typeof raw === 'object' ? raw : {};
        next.dark = { ...(next.dark && typeof next.dark === 'object' ? next.dark : {}), enabled: true };
        await chrome.storage.local.set({ settings: next });
        return;
      }
      const key = kind === 'dark' ? 'darkOff' : 'cssOff';
      const current = (await chrome.storage.local.get(key))[key];
      const patterns = Array.isArray(current) ? current : [];
      const covering = matchingPatterns(patterns, hostname);
      const next = covering.length ? patterns.filter((p) => !covering.includes(p)) : [...patterns, hostname];
      await chrome.storage.local.set({ [key]: next });
    }

    function update() {
      const query = input.value;
      const modes = match.modes(settings.switcher);
      if (state.manual && !modes.includes(state.mode)) state = { mode: modes[0], manual: false };
      const results = settings.switcher.bookmarks
        ? match.searchBookmarks(bookmarks, query, undefined, settings.switcher.precision)
        : [];
      const parsed = match.parseCommand(query);
      const command = parsed && commandAllowed(parsed) ? parsed : null;
      state = match.autoMode(state, query, !loaded || results.length > 0 || command !== null, modes, settings.switcher.autoSearch);
      rows = [];
      if (state.mode === 'bookmarks') {
        if (command) rows.push(commandRow(command));
        rows.push(...results.map(bookmarkRow));
      } else if (query.trim()) {
        rows.push(engineRow(match.engineById(state.mode, settings.switcher), query));
      }
      selected = 0;
      render();
    }

    function render() {
      const engine = match.engineById(state.mode, settings.switcher);
      mode.textContent = engine ? engine.name : '★';
      input.placeholder = engine ? t('placeholderEngine', engine.name) : t('placeholderBookmarks');
      hints.hidden = !settings.switcher.hints;
      // On the new tab the page stays clean until something is typed.
      const blank = layout === 'inline' && !input.value.trim();
      box.classList.toggle('blank', blank);
      list.hidden = blank;
      if (blank) hints.hidden = true;
      list.replaceChildren(
        ...rows.map((row, i) => {
          const item = el('li', 'row', el('div', 'title', row.title), el('div', 'sub', row.sub));
          item.addEventListener('mousemove', () => select(i));
          item.addEventListener('click', (e) => activate(i, e.ctrlKey || e.metaKey));
          return item;
        }),
      );
      if (!rows.length && !engine) list.append(el('li', 'empty', t('noBookmarks')));
      select(selected);
    }

    function select(i) {
      selected = i;
      [...list.children].forEach((item, j) => item.classList.toggle('selected', j === i && item.classList.contains('row')));
      list.children[i]?.scrollIntoView({ block: 'nearest' });
    }

    async function activate(i, newTab) {
      if (!loaded && state.mode === 'bookmarks') {
        pendingEnter = { newTab };
        return;
      }
      const row = rows[i];
      if (!row) return;
      await row.run(newTab);
      close();
    }

    function onKey(e) {
      if (e.isComposing) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === 'ArrowDown' || (ctrl && key === 'j')) select(Math.min(selected + 1, rows.length - 1));
      else if (key === 'ArrowUp' || (ctrl && key === 'k')) select(Math.max(selected - 1, 0));
      else if (key === 'Tab') {
        state = { mode: match.nextMode(match.modes(settings.switcher), state.mode, e.shiftKey ? -1 : 1), manual: true };
        update();
      } else if (key === 'Enter') activate(selected, ctrl);
      else if (key === 'Escape' && layout === 'inline') {
        input.value = '';
        update();
      } else if (key === 'Escape') close();
      else return;
      e.preventDefault();
    }

    input.addEventListener('input', update);
    update();
    input.focus();
    return { onKey, onInput: update, focus: () => input.focus() };
  }

  function toggleSwitcher() {
    const mode = sobrio.pendingMode; // set by the background just before, for a search shortcut
    sobrio.pendingMode = null;
    if (sobrio.switcher) {
      sobrio.switcher.close();
      return;
    }
    const previous = document.activeElement;
    const host = document.createElement('sobrio-switcher');
    host.style.cssText =
      'all: initial !important; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important;';
    const shadow = host.attachShadow({ mode: 'closed' });
    // Window capture runs before the page's own document and element listeners, so typing
    // here never reaches site shortcuts (YouTube's k, GitHub's s) nor page scripts reading the
    // text. Stopped there, input never reaches the input's own listener: the shield calls it.
    const shield = (e) => {
      if (!e.composedPath().includes(host)) return;
      if (e.type === 'keydown') onKey(e);
      if (e.type === 'input') onInput();
      e.stopImmediatePropagation();
    };
    const close = () => {
      SHIELDED_EVENTS.forEach((type) => removeEventListener(type, shield, true));
      host.remove();
      sobrio.switcher = null;
      previous?.focus?.({ preventScroll: true });
    };
    document.documentElement.append(host);
    SHIELDED_EVENTS.forEach((type) => addEventListener(type, shield, true));
    const { onKey, onInput } = mountSwitcher(shadow, { layout: 'overlay', hostname: location.hostname, close, startMode: mode });
    sobrio.switcher = { close };
  }

  sobrio.mountSwitcher = mountSwitcher;
  sobrio.toggleSwitcher = toggleSwitcher;
  // Injected into a page by the shortcut: open or close. The popup mounts it itself.
  if (!location.protocol.endsWith('-extension:')) toggleSwitcher();
})();
