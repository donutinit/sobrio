// The switcher: an overlay on the page (Ctrl+Space), the toolbar popup, or the new tab's own.
// A page has this from its start, as a content script of its top frame, so it opens in the keydown.
(() => {
  const { match } = sobrio;
  // Everything typing fires and pages could listen to: keys, and the text itself.
  const SHIELDED_EVENTS = ['keydown', 'keypress', 'keyup', 'beforeinput', 'input', 'textInput',
    'compositionstart', 'compositionupdate', 'compositionend'];
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions);
  // boot.js keeps the native sendMessage before darkreader.js patches it. Popups and tabs
  // opened before sobrio was installed have no boot.js, and nothing patched either.
  const send = (message) => (sobrio.send ?? chrome.runtime.sendMessage.bind(chrome.runtime))(message);

  // What the switcher shows. The bookmarks and the memory come from the background in one message,
  // each as JSON text (a string crosses to a page several times faster than thousands of objects,
  // and the background reads storage faster than a page does). The settings, the theme and the
  // exceptions are the ones page.js keeps for the page (sobrio.stored); where there is no page.js
  // (the popup, the new tab, a tab from before sobrio was installed) they come from storage.
  // The last answers stay for the next open on this page, which starts complete with them; asked
  // twice within a moment, the same answers serve both.
  const STORED = ['settings', 'theme', 'darkOff', 'cssOff', 'darkPause'];
  const FRESH = 500; // ms an answer counts as new
  const WARM = 30000; // ms the answers kept are good enough to open with
  const cache = {}; // lists: { text, bookmarks, stats }, stored, at
  let asking = null;

  function parse(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  // The same text as last time is the same list: the one here stays, with what match.js keeps
  // about each of its bookmarks.
  function take(answer) {
    const last = cache.lists;
    // No answer (the background could not be reached): what is here stays, or nothing is listed.
    if (typeof answer?.bookmarks !== 'string') return last ?? (cache.lists = { text: {}, bookmarks: [], stats: {} });
    const same = (name) => Boolean(last) && answer[name] === last.text[name];
    if (same('bookmarks') && same('stats')) return last;
    const bookmarks = same('bookmarks') ? last.bookmarks : parse(answer.bookmarks);
    const stats = same('stats') ? last.stats : parse(answer.stats);
    cache.lists = {
      text: { bookmarks: answer.bookmarks, stats: answer.stats },
      bookmarks: Array.isArray(bookmarks) ? bookmarks : [],
      stats: stats && typeof stats === 'object' ? stats : {},
    };
    return cache.lists;
  }

  function ask() {
    if (asking) return asking;
    const first = send({ sobrio: 'bookmarks' }).catch(() => null);
    const lists = first.then(take);
    // A background that just started answers with the bookmarks the one before it left, not
    // checked against the tree yet: the checked ones come behind, and are most often the same.
    const checked = first.then((answer) => (answer?.checked === false
      ? send({ sobrio: 'bookmarks', checked: true }).then(take, () => cache.lists)
      : lists));
    const stored = sobrio.stored ? null : chrome.storage.local.get(STORED).catch(() => ({})).then((answer) => {
      cache.stored = answer;
      return answer;
    });
    asking = { lists, checked, stored };
    Promise.all([checked, stored]).then(() => {
      cache.at = Date.now();
      setTimeout(() => {
        asking = null;
      }, FRESH);
    });
    return asking;
  }

  // The first key of the shortcut is down (shortcuts.js): what the switcher shows is asked for now,
  // so it is here when the second key opens it.
  function warmSwitcher() {
    if (!sobrio.switcher && !(Date.now() - cache.at < WARM)) ask();
  }

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
      '--s-title': theme.text && `color-mix(in srgb, ${theme.text} 82%, ${theme.background ?? '#000'})`,
      '--s-host': theme.text && `color-mix(in srgb, ${theme.text} 64%, ${theme.background ?? '#000'})`,
      '--s-sub': theme.textMuted,
      '--s-font': theme.font && `${theme.font}, system-ui, sans-serif`,
      // On paper, the ink at a quarter dims the page behind: the box stands out lighter than it.
      '--s-veil': theme.scheme === 'light' && theme.text && `color-mix(in srgb, ${theme.text} 25%, transparent)`,
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
    // The bookmarks and the memory (storage.local.stats). Until they arrive no bookmark shows,
    // nothing jumps to an engine, and an early Enter waits for them: a quick "gh" + Enter means
    // the bookmark, not a web search.
    let lists = cache.lists ?? null;
    let pendingEnter = null;
    let state = startMode ? { mode: startMode, manual: true } : { mode: 'bookmarks', manual: false };
    let rows = [];
    let selected = 0;

    function useStored(answer) {
      stored = answer;
      settings = mergeSettings(answer.settings);
      for (const [name, value] of Object.entries(themeVariables(answer.theme))) frame.style.setProperty(name, value);
      roundBox(answer.theme);
      if (popup && answer.theme?.background) document.documentElement.style.background = answer.theme.background;
      if (popup) document.documentElement.style.colorScheme = answer.theme?.scheme ?? '';
    }
    // It opens in the keydown itself, drawn with what is here. Without the settings and the theme
    // (no page.js, and nothing kept from a last open), an overlay stays transparent until storage
    // answers, at most 150 ms, taking the keys already: it never paints in the default colors first.
    const known = sobrio.stored ?? cache.stored;
    const show = () => frame.style.removeProperty('opacity');
    if (known) useStored(known);
    else if (layout === 'overlay') {
      frame.style.opacity = '0';
      setTimeout(show, 150);
    }

    // Round corners when the theme asks for them (settings.roundCorners): the box drawn as an image
    // in the theme's curve, the radius of a window, with the colors just set. The popup's box has no
    // border: the browser draws that window.
    function roundBox(theme) {
      const corners = layout === 'popup' ? null : sobrio.settings.roundCorners(theme);
      frame.classList.toggle('round', Boolean(corners));
      if (!corners) {
        frame.style.removeProperty('--s-round');
        return;
      }
      const style = getComputedStyle(frame);
      const color = (name) => style.getPropertyValue(name).trim();
      const fill = layout === 'inline' ? '' : color('--s-bg');
      frame.style.setProperty('--s-round', sobrio.settings.squircleBorder(corners.radius, corners.power, { fill, stroke: color('--s-border') }));
    }

    // The answers of a moment ago are the ones it opened with: nothing to draw again.
    const answers = ask();
    const useLists = (answer) => {
      if (answer === lists) return;
      lists = answer;
      refresh();
      getReady();
    };
    answers.lists.then(useLists);
    answers.checked.then(useLists);
    // While nothing else is going on, the list is made ready for the first search, so the first
    // letter typed does not pay for it (10 to 20 ms for 1,500 bookmarks).
    const idle = (run) => (window.requestIdleCallback ? window.requestIdleCallback(run) : setTimeout(run, 50));
    function getReady() {
      const { bookmarks } = lists;
      idle(() => match.prepare(bookmarks));
    }
    if (lists) getReady();
    answers.stored?.then((answer) => {
      show();
      if (answer === stored) return;
      useStored(answer);
      refresh();
    });

    // New answers under an open switcher: the selection stays on its row if it is still there.
    function refresh() {
      const key = rows[selected]?.key;
      update();
      const same = key === undefined ? -1 : rows.findIndex((row) => row.key === key);
      if (same > 0) select(same);
      if (pendingEnter && lists) activate(selected, pendingEnter.newTab);
    }

    // record: the title to remember the page under (bookmarks only; searches are not counted).
    const open = (url, newTab, record) => send({ sobrio: 'open', url, newTab, record });
    // The dark and css commands change the site's exceptions. In a page they need page.js
    // (sobrio.send, from boot.js), else nothing would change until a reload; the popup acts on the
    // active tab's site. The settings and the pause are not about a site: they work anywhere.
    const commandAllowed = (kind) =>
      settings.switcher.commands &&
      (kind === 'settings' || kind === 'pause' || ((popup || Boolean(sobrio.send)) && match.commandsAllowed(hostname)));

    // title and sub as functions: a row is drawn when it is about to show (render), and most of
    // the fifty never are.
    function bookmarkRow({ bookmark, hits }) {
      const sub = () => {
        const line = document.createDocumentFragment();
        if (bookmark.folder) line.append(highlight(bookmark.folder, hits.folder), ' · ');
        // The host brighter than the rest, so it reads first.
        const url = match.shortUrl(bookmark.url);
        const cut = match.hostLength(url);
        line.append(
          el('span', 'host', highlight(url.slice(0, cut), hits.url.filter((i) => i < cut))),
          highlight(url.slice(cut), hits.url.filter((i) => i >= cut).map((i) => i - cut)),
        );
        return line;
      };
      return {
        key: `b:${bookmark.id ?? bookmark.url}`,
        title: () => highlight(match.displayTitle(bookmark), bookmark.title ? hits.title : []),
        sub,
        run: (newTab) => open(bookmark.url, newTab, match.displayTitle(bookmark)),
      };
    }

    function engineRow(engine, query) {
      return {
        title: t('searchOn', query.trim(), engine.name),
        sub: new URL(engine.url).hostname,
        run: (newTab) => open(match.searchUrl(engine, query), newTab),
      };
    }

    function commandRow(kind, query) {
      if (kind === 'settings') {
        return { title: t('openSettings'), sub: settings.switcher.commandNames.settings, run: () => send({ sobrio: 'settings' }) };
      }
      if (kind === 'pause') return pauseRow(query);
      const sub = settings.switcher.commandNames[kind];
      // A local address is left alone as a whole: the switch for that is in the settings.
      if (siteState(stored, hostname).local) {
        return { title: t('localLeftAlone'), sub, run: () => send({ sobrio: 'settings' }) };
      }
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

    // Dark mode and the stylesheet off on every site for a few minutes (pd, pd15), back on by
    // themselves: every page follows storage.local.darkPause. pd alone during a pause ends it.
    function pauseRow(query) {
      const sub = query.trim().toLowerCase();
      const minutes = match.pauseMinutes(query, settings.switcher.commandNames);
      const left = sobrio.settings.pauseLeft(stored.darkPause, Date.now());
      if (left && sub === settings.switcher.commandNames.pause) {
        const until = new Date(Date.now() + left).toLocaleTimeString(chrome.i18n.getUILanguage(), { hour: 'numeric', minute: '2-digit' });
        return { title: t('pauseEnd', until), sub, run: () => chrome.storage.local.remove('darkPause') };
      }
      return { title: t('pauseDark', String(minutes)), sub, run: () => chrome.storage.local.set({ darkPause: Date.now() + minutes * 60000 }) };
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
      const next = sobrio.settings.toggledPatterns((await chrome.storage.local.get(key))[key], hostname);
      await chrome.storage.local.set({ [key]: next });
    }

    function update() {
      const query = input.value;
      const modes = match.modes(settings.switcher);
      if (state.manual && !modes.includes(state.mode)) state = { mode: modes[0], manual: false };
      const now = Date.now();
      const boost = settings.switcher.memory && lists ? (b) => sobrio.stats.boostOf(lists.stats[b.url], now) : undefined;
      const results = settings.switcher.bookmarks && lists
        ? match.searchBookmarks(lists.bookmarks, query, undefined, settings.switcher.precision, boost)
        : [];
      const parsed = match.parseCommand(query, settings.switcher.commandNames);
      const command = parsed && commandAllowed(parsed) ? parsed : null;
      state = match.autoMode(state, query, !lists || results.length > 0 || command !== null, modes, settings.switcher.autoSearch);
      rows = [];
      if (state.mode === 'bookmarks') {
        if (command) rows.push(commandRow(command, query));
        rows.push(...results.map(bookmarkRow));
      } else if (query.trim()) {
        rows.push(engineRow(match.engineById(state.mode, settings.switcher), query));
      }
      selected = 0;
      render();
    }

    function render() {
      const engine = match.engineById(state.mode, settings.switcher);
      // Bookmarks show the brand's bookmark icon; an engine, its name.
      if (engine) mode.textContent = engine.name;
      else if (!mode.querySelector('svg')) mode.replaceChildren(sobrio.icons.icon('bookmark', 16));
      mode.title = engine ? '' : t('placeholderBookmarks');
      input.placeholder = engine ? t('placeholderEngine', engine.name) : t('placeholderBookmarks');
      hints.hidden = !settings.switcher.hints;
      // On the new tab the page stays clean until something is typed.
      const blank = layout === 'inline' && !input.value.trim();
      box.classList.toggle('blank', blank);
      list.hidden = blank;
      if (blank) hints.hidden = true;
      clearTimeout(filling);
      items = rows.slice(0, onScreen()).map(drawRow);
      list.replaceChildren(...items);
      if (items.length < rows.length) filling = setTimeout(fill, 60);
      if (!rows.length && !engine && lists) list.append(el('li', 'empty', t('noBookmarks')));
      // Back to the top if the list was scrolled. Not scrollIntoView: it lays the page out on the
      // spot, once for every key, where waiting for the frame does it once.
      if (scrolled) list.scrollTop = 0;
      mark(selected);
    }

    // The rows that fit on screen are drawn in the keystroke; the rest a moment later, or as soon
    // as the selection goes to one of them. Drawing all fifty took longer than finding them.
    let items = []; // the <li> of the rows drawn so far, in order
    let filling = 0;
    let scrolled = false;
    let lit = null; // the <li> shown as selected
    const onScreen = () => Math.ceil((window.innerHeight * 0.7) / 55) + 2;
    const part = (value) => (typeof value === 'function' ? value() : value);
    const drawRow = (row) => el('li', 'row', el('div', 'title', part(row.title)), el('div', 'sub', part(row.sub)));

    function fill() {
      clearTimeout(filling);
      if (items.length >= rows.length) return;
      const more = rows.slice(items.length).map(drawRow);
      items.push(...more);
      list.append(...more);
    }

    function mark(i) {
      selected = i;
      lit?.classList.remove('selected');
      lit = items[i] ?? null;
      lit?.classList.add('selected');
    }

    function select(i) {
      if (i >= items.length) fill();
      mark(i);
      lit?.scrollIntoView({ block: 'nearest' });
    }

    // One listener for the whole list, not two for each row drawn on every key.
    const rowAt = (target) => items.indexOf(target.closest?.('.row'));
    list.addEventListener('mousemove', (e) => {
      const i = rowAt(e.target);
      if (i !== -1 && i !== selected) select(i);
    });
    list.addEventListener('click', (e) => {
      const i = rowAt(e.target);
      if (i !== -1) activate(i, e.ctrlKey || e.metaKey || e.altKey);
    });
    list.addEventListener('scroll', () => {
      scrolled = list.scrollTop > 0;
    }, { passive: true });

    async function activate(i, newTab) {
      if (!lists && state.mode === 'bookmarks') {
        pendingEnter = { newTab };
        return;
      }
      pendingEnter = null;
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
      } else if (key === 'Enter') activate(selected, ctrl || e.altKey); // Ctrl, Alt or Meta: a new tab
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
    // focus(mode): a search shortcut on the new tab starts on its engine.
    function focus(mode) {
      if (mode && match.modes(settings.switcher).includes(mode)) {
        state = { mode, manual: true };
        update();
      }
      input.focus();
    }

    return { onKey, onInput: update, focus };
  }

  // mode: an engine id to open on, for a search shortcut.
  function toggleSwitcher(mode) {
    if (sobrio.switcher) {
      sobrio.switcher.close();
      return;
    }
    if (!document.documentElement) return; // a document with nothing in it yet
    const previous = document.activeElement;
    const host = document.createElement('sobrio-switcher');
    host.style.cssText =
      'all: initial !important; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important;';
    const shadow = host.attachShadow({ mode: 'closed' });
    // Window capture runs before the page's own document and element listeners, so typing
    // here never reaches site shortcuts (YouTube's k, GitHub's s) nor page scripts reading the
    // text. Stopped there, input never reaches the input's own listener: the shield calls it.
    // Only the person's own events act: the host is in the page's DOM, and a page could
    // otherwise dispatch an Enter at it and open a bookmark.
    const shield = (e) => {
      if (!e.composedPath().includes(host)) return;
      if (e.isTrusted && e.type === 'keydown') onKey(e);
      if (e.isTrusted && e.type === 'input') onInput();
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
    let onKey;
    let onInput;
    try {
      ({ onKey, onInput } = mountSwitcher(shadow, { layout: 'overlay', hostname: location.hostname, close, startMode: mode }));
    } catch (error) {
      close(); // never left half open, taking the keys
      throw error;
    }
    sobrio.switcher = { close };
  }

  sobrio.mountSwitcher = mountSwitcher;
  sobrio.toggleSwitcher = toggleSwitcher;
  sobrio.warmSwitcher = warmSwitcher;
  // A page has all this from its start (a content script of the top frame). A tab from before
  // sobrio was installed gets it from the background on the shortcut, which is waiting to open.
  if (sobrio.pendingOpen) {
    const { mode } = sobrio.pendingOpen;
    sobrio.pendingOpen = null;
    toggleSwitcher(mode);
  }
})();
