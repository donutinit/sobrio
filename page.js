// Runs in every frame at document_start: the stylesheet, dark mode and per-site state,
// all following settings and the userContent.css theme hook live.
(() => {
  const root = document.documentElement;
  const hostname = location.hostname;
  const { detector, buildCss } = sobrio;
  const { DEFAULTS, mergeSettings, siteState, darkTheme } = sobrio.settings;
  const KEYS = ['darkOff', 'cssOff', 'settings', 'theme'];

  // Both go in before storage answers, with the defaults: the usual case waits for nothing.
  const css = addStyle('sobrio-css', buildCss(DEFAULTS.css, null));
  const fallback = addStyle('sobrio-fallback', 'html { background: #000 !important; }');
  let current = null; // the Dark Reader theme in use, as JSON; null while it is off
  let nativeDark = false; // the detector found the page's own dark theme
  let checking = false;

  DarkReader.setFetchMethod(fetchThroughBackground);
  chrome.storage.local.get(KEYS).then(apply, () => apply(undefined));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && KEYS.some((key) => changes[key])) chrome.storage.local.get(KEYS).then(apply);
  });

  function addStyle(id, text) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = text;
    root.append(style);
    return style;
  }

  function apply(stored) {
    const settings = mergeSettings(stored?.settings);
    const theme = stored?.theme ?? null;
    const state = siteState(stored, hostname);
    const text = state.css ? buildCss(settings.css, theme) : '';
    if (text) {
      css.textContent = text;
      if (!css.isConnected) root.append(css);
    } else {
      css.remove();
    }
    // Out before setDark, in the same task (so nothing paints in between): the detector may
    // measure right away and must not see this black as the page's own.
    fallback.remove();
    setDark(settings.dark.enabled && state.dark, darkTheme(settings.dark, theme), settings.dark.detect);
  }

  function setDark(on, theme, detect) {
    if (!on || (detect && nativeDark)) {
      if (current) DarkReader.disable();
      current = null;
      return;
    }
    const key = JSON.stringify(theme);
    if (key !== current) {
      try {
        // A second enable while on is taken for another Dark Reader instance and ignored,
        // so a new theme goes through disable first (same task: nothing paints in between).
        if (current) DarkReader.disable();
        DarkReader.enable(theme);
        current = key;
      } catch (error) {
        console.error('sobrio: dark mode failed, leaving the page as it was', error);
        DarkReader.disable();
        current = null;
        return;
      }
    }
    if (detect && !checking) {
      checking = true;
      // Once there is content, and again on load, when late stylesheets have arrived.
      detector.whenReady(document, check);
      if (document.readyState !== 'complete') addEventListener('load', check, { once: true });
    }
  }

  function check() {
    if (current && DarkReader.isEnabled() && detector.detectDark(document)) {
      nativeDark = true;
      DarkReader.disable();
      current = null;
    }
  }

  // Dark Reader reads cross-origin stylesheets and images; the background may, a content script may not.
  async function fetchThroughBackground(url) {
    const reply = await sobrio.send({ sobrio: 'fetch', url });
    if (!reply?.ok) throw new Error(`sobrio: ${url}: ${reply?.error ?? 'no answer'}`);
    const bytes = Uint8Array.from(atob(reply.base64), (c) => c.charCodeAt(0));
    return new Response(new Blob([bytes], { type: reply.type }), { status: reply.status });
  }
})();
