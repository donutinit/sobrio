// The person's own keyboard shortcuts (settings.shortcuts): each combination runs an action.
// Every frame listens, since the focus may be inside an iframe (Google Docs, an embedded player),
// but the action runs in the top frame, so that a shortcut means the site in the address bar.
(() => {
  const top = window === window.top;
  const { mergeSettings, normalizeKeys, toggledPatterns, siteState, cleanUrl } = sobrio.settings;
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions);
  const send = (message) => (sobrio.send ?? chrome.runtime.sendMessage.bind(chrome.runtime))(message);
  const onPage = top && !location.protocol.endsWith('-extension:') && Boolean(location.hostname);
  let settings = mergeSettings(undefined);

  const load = (raw) => {
    settings = mergeSettings(raw);
  };
  chrome.storage.local.get('settings').then((stored) => load(stored.settings), () => {});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.settings) load(changes.settings.newValue);
  });

  const isEditable = (node) => node?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node?.tagName ?? '');

  addEventListener('keydown', (e) => {
    // isTrusted: a page must not run the person's shortcuts. With the switcher open, keys are its.
    if (!e.isTrusted || !settings.shortcuts.length || sobrio.switcher) return;
    const keys = normalizeKeys(e);
    const shortcut = keys && settings.shortcuts.find((s) => s.keys === keys);
    if (!shortcut) return;
    // A function key alone stays with a text field; combinations with Ctrl, Alt or Meta do not.
    if (!keys.includes('+') && isEditable(e.composedPath()[0])) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // A held key repeats: the shortcut runs once per press (one tab, one toggle).
    if (e.repeat) return;
    if (top) {
      run(shortcut).catch((error) => console.warn('sobrio: shortcut failed', error));
    } else {
      // The top frame runs it, found again by its keys; the frame sends only its selection.
      const text = shortcut.action === 'searchSelection' ? selectionText() : undefined;
      send({ sobrio: 'shortcut-frame', keys, text }).catch((error) => console.warn('sobrio: shortcut failed', error));
    }
  }, true);

  if (top) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.sobrio !== 'run-shortcut') return;
      const shortcut = settings.shortcuts.find((s) => s.keys === message.keys);
      if (shortcut) run(shortcut, message.text).catch((error) => console.warn('sobrio: shortcut failed', error));
    });
  }

  // The selected text, also inside a text field, at most 500 characters: a search, not an essay.
  function selectionText() {
    const field = document.activeElement;
    const inField = /^(INPUT|TEXTAREA)$/.test(field?.tagName ?? '') && typeof field.selectionStart === 'number';
    const text = inField ? field.value.slice(field.selectionStart, field.selectionEnd) : String(getSelection());
    return text.trim().slice(0, 500);
  }

  async function rawSettings() {
    const { settings: raw } = await chrome.storage.local.get('settings');
    return raw && typeof raw === 'object' ? raw : {};
  }

  async function setDarkEverywhere(enabled) {
    const raw = await rawSettings();
    raw.dark = { ...(raw.dark && typeof raw.dark === 'object' ? raw.dark : {}), enabled };
    await chrome.storage.local.set({ settings: raw });
  }

  async function toggleSite(kind) {
    const key = kind === 'dark' ? 'darkOff' : 'cssOff';
    const next = toggledPatterns((await chrome.storage.local.get(key))[key], location.hostname);
    await chrome.storage.local.set({ [key]: next });
    return siteState({ [key]: next }, location.hostname)[kind];
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = Object.assign(document.createElement('textarea'), { value: text });
      document.documentElement.append(area);
      area.select();
      const done = document.execCommand('copy');
      area.remove();
      return done;
    }
  }

  // frameText: the selection of the iframe the shortcut came from.
  async function run({ action, param }, frameText) {
    const toast = sobrio.toast ?? (() => {});
    if (action === 'toggleDark' && onPage && !settings.dark.enabled) {
      // Like td: with dark mode off everywhere, it turns it back on.
      await setDarkEverywhere(true);
      toast(t('toastDarkEverywhereOn'));
    } else if (action === 'toggleDark' && onPage) {
      toast(t((await toggleSite('dark')) ? 'toastDarkOn' : 'toastDarkOff'), location.hostname);
    } else if (action === 'toggleCss' && onPage) {
      toast(t((await toggleSite('css')) ? 'toastCssOn' : 'toastCssOff'), location.hostname);
    } else if (action === 'toggleDarkEverywhere') {
      const enabled = !settings.dark.enabled;
      await setDarkEverywhere(enabled);
      toast(t(enabled ? 'toastDarkEverywhereOn' : 'toastDarkEverywhereOff'));
    } else if (action === 'speed' && sobrio.setSpeed) {
      // speed.js applies it as ] and [ do; off in the settings, it says so.
      if (!sobrio.setSpeed(param)) toast(t('toastSpeedOff'));
    } else if (action === 'speed') {
      // The new tab has no media and no speed.js: only the global speed changes.
      const raw = await rawSettings();
      raw.speed = { ...(raw.speed && typeof raw.speed === 'object' ? raw.speed : {}), speed: param };
      await chrome.storage.local.set({ settings: raw });
      toast(`${Number(param.toFixed(2))}×`);
    } else if (action === 'copyCleanUrl' && onPage) {
      const url = cleanUrl(location.href);
      toast(t((await copy(url)) ? 'toastCopied' : 'toastCopyFailed'), url.length > 60 ? `${url.slice(0, 57)}…` : url, 1600);
    } else {
      // switcher, search, searchSelection, openUrl, openUrlNewTab, settings: the background's.
      const text = action === 'searchSelection' ? frameText || selectionText() : undefined;
      await send({ sobrio: 'shortcut', action, param, text });
    }
  }
})();
