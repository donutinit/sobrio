// Runs in every frame at document_start: custom CSS, dark mode and per-site state.
(() => {
  const root = document.documentElement;
  const hostname = location.hostname;
  const { detector, siteState } = sobrio;

  // Both go in before storage answers: sites with everything on (the usual case) wait for nothing.
  const css = addStyle('sobrio-css', sobrio.CUSTOM_CSS);
  const fallback = addStyle('sobrio-fallback', 'html { background: #000 !important; }');
  let dark = false;

  DarkReader.setFetchMethod(fetchThroughBackground);
  chrome.storage.local.get(['darkOff', 'cssOff']).then(apply, () => apply(undefined));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.darkOff || changes.cssOff)) {
      chrome.storage.local.get(['darkOff', 'cssOff']).then(apply);
    }
  });

  function addStyle(id, text) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = text;
    root.append(style);
    return style;
  }

  function apply(stored) {
    const state = siteState(stored, hostname);
    if (state.css && !css.isConnected) root.append(css);
    if (!state.css) css.remove();
    // Out before setDark, in the same task (so nothing paints in between): the detector may
    // measure right away and must not see this black as the page's own.
    fallback.remove();
    setDark(state.dark);
  }

  function setDark(on) {
    if (on === dark) return;
    dark = on;
    if (!on) {
      DarkReader.disable();
      return;
    }
    try {
      DarkReader.enable({ darkSchemeBackgroundColor: '#000000' });
    } catch (error) {
      console.error('sobrio: dark mode failed, leaving the page as it was', error);
      DarkReader.disable();
      return;
    }
    // Once there is content, and again on load, when late stylesheets have arrived.
    const check = () => {
      if (dark && DarkReader.isEnabled() && detector.detectDark(document)) DarkReader.disable();
    };
    detector.whenReady(document, check);
    if (document.readyState !== 'complete') addEventListener('load', check, { once: true });
  }

  // Dark Reader reads cross-origin stylesheets and images; the background may, a content script may not.
  async function fetchThroughBackground(url) {
    const reply = await sobrio.send({ sobrio: 'fetch', url });
    if (!reply?.ok) throw new Error(`sobrio: ${url}: ${reply?.error ?? 'no answer'}`);
    const bytes = Uint8Array.from(atob(reply.base64), (c) => c.charCodeAt(0));
    return new Response(new Blob([bytes], { type: reply.type }), { status: reply.status });
  }
})();
