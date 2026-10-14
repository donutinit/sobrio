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

  function mountSwitcher(root, { popup, hostname, close }) {
    const input = el('input', 'input');
    input.spellcheck = false;
    input.autocomplete = 'off';
    const mode = el('span', 'mode');
    const list = el('ul', 'list');
    const box = el('div', 'box', el('div', 'bar', mode, input), list, el('div', 'hints', t('hints')));
    const frame = el('div', popup ? 'popup' : 'backdrop', box);
    root.append(el('style', null, sobrio.SWITCHER_CSS), frame);
    if (!popup) frame.addEventListener('mousedown', (e) => e.target === frame && close());
    // Clicks inside keep the focus in the input: the keyboard shield only covers events that
    // come from the switcher, and Esc and typing must keep working.
    box.addEventListener('mousedown', (e) => e.target !== input && e.preventDefault());

    const commandsOn = !popup && Boolean(sobrio.siteState) && match.commandsAllowed(hostname);
    let bookmarks = [];
    let site = { dark: true, css: true };
    let state = { mode: 0, manual: false };
    let rows = [];
    let selected = 0;

    send({ sobrio: 'bookmarks' }).then((answer) => {
      bookmarks = Array.isArray(answer) ? answer : [];
      update();
    });
    if (commandsOn) {
      chrome.storage.local.get(['darkOff', 'cssOff']).then((stored) => {
        site = sobrio.siteState(stored, hostname);
        update();
      });
    }

    const open = (url, newTab) => send({ sobrio: 'open', url, newTab });

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
      const on = kind === 'dark' ? site.dark : site.css;
      const key = kind === 'dark' ? (on ? 'darkOff' : 'darkOn') : on ? 'cssOff' : 'cssOn';
      return { title: t(key, hostname), sub: kind === 'dark' ? 'td' : 'ta', run: () => toggle(kind) };
    }

    async function toggle(kind) {
      const key = kind === 'dark' ? 'darkOff' : 'cssOff';
      const hosts = new Set((await chrome.storage.local.get(key))[key] ?? []);
      if (hosts.has(hostname)) hosts.delete(hostname);
      else hosts.add(hostname);
      await chrome.storage.local.set({ [key]: [...hosts] });
    }

    function update() {
      const query = input.value;
      const results = match.searchBookmarks(bookmarks, query);
      const command = commandsOn ? match.parseCommand(query) : null;
      state = match.autoMode(state, query, results.length > 0 || command !== null);
      rows = [];
      if (state.mode === 0) {
        if (command) rows.push(commandRow(command));
        rows.push(...results.map(bookmarkRow));
      } else if (query.trim()) {
        rows.push(engineRow(match.ENGINES[state.mode - 1], query));
      }
      selected = 0;
      render();
    }

    function render() {
      const engine = match.ENGINES[state.mode - 1];
      mode.textContent = engine ? engine.name : '★';
      input.placeholder = engine ? t('placeholderEngine', engine.name) : t('placeholderBookmarks');
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
        state = { mode: match.nextMode(state.mode, e.shiftKey ? -1 : 1), manual: true };
        update();
      } else if (key === 'Enter') activate(selected, ctrl);
      else if (key === 'Escape') close();
      else return;
      e.preventDefault();
    }

    input.addEventListener('input', update);
    update();
    input.focus();
    return { onKey, onInput: update };
  }

  function toggleSwitcher() {
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
    const { onKey, onInput } = mountSwitcher(shadow, { popup: false, hostname: location.hostname, close });
    sobrio.switcher = { close };
  }

  sobrio.mountSwitcher = mountSwitcher;
  sobrio.toggleSwitcher = toggleSwitcher;
  // Injected into a page by the shortcut: open or close. The popup mounts it itself.
  if (!location.protocol.endsWith('-extension:')) toggleSwitcher();
})();
