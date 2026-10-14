// The person's own keyboard shortcuts (settings.shortcuts): each combination runs an action.
// Top frame only, so that a shortcut means the site in the address bar.
(() => {
  if (window !== window.top) return;
  const { mergeSettings, normalizeKeys, toggledPatterns, siteState, cleanUrl } = sobrio.settings;
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions);
  const send = (message) => (sobrio.send ?? chrome.runtime.sendMessage.bind(chrome.runtime))(message);
  const onPage = !location.protocol.endsWith('-extension:') && Boolean(location.hostname);
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
    run(shortcut).catch((error) => console.warn('sobrio: shortcut failed', error));
  }, true);

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

  async function run({ action, param }) {
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
      const text = action === 'searchSelection' ? String(getSelection()).trim() : undefined;
      await send({ sobrio: 'shortcut', action, param, text });
    }
  }
})();
