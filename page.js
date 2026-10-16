// Runs in every frame at document_start: the stylesheet, dark mode and per-site state,
// all following settings and the userContent.css theme hook live.
(() => {
  const root = document.documentElement;
  const hostname = location.hostname;
  const { detector, buildCss, customCss, youtubeHost } = sobrio;
  const { DEFAULTS, mergeSettings, siteState, darkTheme, isLocalHost } = sobrio.settings;
  const KEYS = ['darkOff', 'cssOff', 'animOff', 'settings', 'theme'];
  // The hosts last seen with a dark theme of their own, newest first: read once, at the start.
  const OWN_DARK = 'ownDark';
  const OWN_DARK_MAX = 500;

  // Both go in before storage answers, with the defaults: the usual case waits for nothing. A local
  // address is left alone by default, so there neither goes in (no black blink on a dev server).
  const leftAlone = DEFAULTS.exceptions.local && isLocalHost(hostname);
  const css = leftAlone ? Object.assign(document.createElement('style'), { id: 'sobrio-css' }) : addStyle('sobrio-css', buildCss(DEFAULTS.css, null, hostname));
  // The person's CSS (settings.css.custom), right after sobrio's; in once storage answers.
  const custom = document.createElement('style');
  custom.id = 'sobrio-css-custom';
  // Until storage answers, everything dark, as strict as Dark Reader's own fallback (which takes
  // over in the same task when it starts): only the html would let a white body flash.
  const fallback = leftAlone ? null : addStyle('sobrio-fallback',
    'html, body, body :not(iframe) { background-color: #000 !important; border-color: #404040 !important;' +
    ' color: #e8e6e3 !important; }');
  let current = null; // the Dark Reader theme in use, as JSON; null while it is off
  let wanted = null; // the theme dark mode asks for on this page; null when it is off here
  let detect = false; // settings.dark.detect
  let nativeDark = false; // the detector's last verdict: the page has a dark theme of its own
  let watching = false;
  let lastLook = null; // the page's styles at the last look with Dark Reader on
  let looked = false; // the detector has seen this page
  let knownDark = false; // storage lists this host in ownDark
  let cutTransitions = !leftAlone && DEFAULTS.css.animations;
  let keepPlayer = DEFAULTS.css.youtubePlayer && youtubeHost(hostname);
  let waitingForArea = false;
  // speed.js and shortcuts.js take the settings from here: one read of storage per frame, not three.
  const settingsListeners = [];
  sobrio.onSettings = (listener) => settingsListeners.push(listener);

  DarkReader.setFetchMethod(fetchThroughBackground);
  chrome.storage.local.get([...KEYS, OWN_DARK]).then(apply, () => apply(undefined));
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
    for (const listener of settingsListeners) listener(settings);
    const theme = stored?.theme ?? null;
    const state = siteState(stored, hostname);
    // On a site that keeps its animations, the rest of the stylesheet still applies.
    const switches = state.animations ? settings.css : { ...settings.css, animations: false };
    const text = state.css ? buildCss(switches, theme, hostname) : '';
    cutTransitions = state.css && switches.animations;
    keepPlayer = switches.youtubePlayer && youtubeHost(hostname);
    if (text) {
      if (css.textContent !== text) css.textContent = text; // rewriting restyles the whole page
      if (!css.isConnected) root.append(css);
    } else {
      css.remove();
    }
    const own = state.css ? customCss(settings.css) : '';
    if (own) {
      if (custom.textContent !== own) custom.textContent = own;
      // After sobrio's sheet, not necessarily right after it (Dark Reader puts its own there).
      // Moving it re-parses it and restyles the page, so it moves only when it is out of place.
      const after = (node) => node.compareDocumentPosition(custom) & Node.DOCUMENT_POSITION_FOLLOWING;
      if (!custom.isConnected || (css.isConnected && !after(css))) {
        if (css.isConnected) css.after(custom);
        else root.append(custom);
      }
    } else {
      custom.remove();
    }
    if (stored && OWN_DARK in stored) knownDark = Array.isArray(stored[OWN_DARK]) && stored[OWN_DARK].includes(hostname);
    const dark = settings.dark.enabled && state.dark ? darkTheme(settings.dark, theme) : null;
    // A site seen with its own dark theme last time starts without Dark Reader, whose work at load
    // is the heaviest part of sobrio. The black stays until the detector's first look confirms it,
    // and if the site turned light, Dark Reader comes in that same task.
    if (dark && settings.dark.detect && !looked && knownDark) nativeDark = true;
    // Else out before setDark, in the same task (so nothing paints in between): the detector may
    // measure right away and must not see this black as the page's own.
    else fallback?.remove();
    setDark(dark, settings.dark.detect);
  }

  // A frame without area (a tracker, a hidden ad) shows nothing: Dark Reader and the detector wait
  // until it has one. The resize comes before the frame first paints at its new size.
  const noArea = () => window !== window.top && (innerWidth < 2 || innerHeight < 2);

  function setDark(theme, detectOn) {
    wanted = theme;
    detect = detectOn;
    if (wanted && noArea()) {
      if (!waitingForArea) addEventListener('resize', gotArea);
      waitingForArea = true;
      return;
    }
    if (!wanted || (detect && nativeDark)) turnOff();
    else turnOn(wanted);
    if (wanted && detect && !watching) {
      watching = true;
      // Once there is content, again on load, when late stylesheets have arrived, and whenever
      // the page switches its theme.
      detector.whenReady(document, () => {
        look();
        if (document.readyState !== 'complete') addEventListener('load', () => look(), { once: true });
        watchTheme();
      });
    }
  }

  function gotArea() {
    if (noArea()) return;
    removeEventListener('resize', gotArea);
    waitingForArea = false;
    setDark(wanted, detect);
  }

  function turnOn(theme) {
    const key = JSON.stringify(theme);
    if (key === current) return;
    try {
      // A second enable while on is taken for another Dark Reader instance and ignored,
      // so a new theme goes through disable first (same task: nothing paints in between).
      if (current) DarkReader.disable();
      DarkReader.enable(theme);
      current = key;
      lastLook = null;
    } catch (error) {
      console.error('sobrio: dark mode failed, leaving the page as it was', error);
      DarkReader.disable();
      current = null;
    }
  }

  function turnOff() {
    if (current) DarkReader.disable();
    current = null;
  }

  // With Dark Reader on, a look turns its sheets off and on again (the whole page restyles twice),
  // so it is skipped while the page's styles stay as they were at the last one. With it off, a look
  // only reads a few colors. Either way the verdict can go back: a page that turns light again gets
  // dark mode again.
  function look(force = false) {
    if (!wanted || !detect) return;
    if (current) {
      const signature = detector.styleSignature(document);
      if (!force && signature === lastLook) return;
      lastLook = signature;
    }
    fallback?.remove();
    const dark = detector.detectDark(document);
    looked = true;
    if (dark !== knownDark) remember(dark);
    if (dark === nativeDark) return;
    nativeDark = dark;
    if (dark) turnOff();
    else turnOn(wanted);
  }

  // Never from a private window: the list would keep where the person went.
  async function remember(dark) {
    knownDark = dark;
    if (!hostname || chrome.extension?.inIncognitoContext) return;
    try {
      const stored = (await chrome.storage.local.get(OWN_DARK))[OWN_DARK];
      const others = (Array.isArray(stored) ? stored : []).filter((host) => typeof host === 'string' && host !== hostname);
      await chrome.storage.local.set({ [OWN_DARK]: dark ? [hostname, ...others].slice(0, OWN_DARK_MAX) : others });
    } catch {}
  }

  // A theme switch is a class or attribute on <html> or <body> (dark, data-theme, a new
  // background), or the system's light or dark changing for the pages that follow it.
  function watchTheme() {
    let timer;
    const lookSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => look(true), 200);
    };
    const observer = new MutationObserver((records) => {
      const changes = records.map(({ target, attributeName, oldValue }) =>
        ({ name: attributeName, oldValue, value: target.getAttribute(attributeName) }));
      if (detector.themeChanged(changes)) lookSoon();
    });
    for (const el of [root, document.body]) if (el) observer.observe(el, { attributes: true, attributeOldValue: true });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', lookSoon);
  }

  // The stylesheet only shortens animations. A transition-duration on every element made every
  // change of every property a transition (transition-property starts as all), and every restyle
  // twice as slow, so the page's own transitions are finished here as they start instead.
  // transitionend still comes: pages wait for it. One pass per frame, for all of them: Chrome's
  // getAnimations gathers and sorts every animation of the document even when asked for one element.
  let finishing = false;
  addEventListener('transitionrun', (e) => {
    if (!cutTransitions || !e.isTrusted || finishing) return;
    if (keepPlayer && e.target.closest?.('#movie_player')) return;
    finishing = true;
    queueMicrotask(finishTransitions);
    requestAnimationFrame(() => {
      finishing = false;
    });
  }, true);

  // The stylesheet's reach: the document, not shadow roots, and never YouTube's player.
  function finishTransitions() {
    for (const animation of document.getAnimations()) {
      const target = animation.effect?.target;
      if (typeof animation.transitionProperty !== 'string' || !target || target.getRootNode() !== document) continue;
      if (keepPlayer && target.closest('#movie_player')) continue;
      try {
        animation.finish();
      } catch {} // a transition the page paused at rate 0 cannot be finished
    }
  }

  // Dark Reader reads cross-origin stylesheets and images; the background may, a content script may not.
  // Stylesheets come back as text, images as base64.
  async function fetchThroughBackground(url) {
    const reply = await sobrio.send({ sobrio: 'fetch', url });
    if (!reply?.ok) throw new Error(`sobrio: ${url}: ${reply?.error ?? 'no answer'}`);
    const init = { status: reply.status, headers: { 'Content-Type': reply.type } };
    if (typeof reply.text === 'string') return new Response(reply.text, init);
    return new Response(fromBase64(reply.base64), init);
  }

  function fromBase64(text) {
    if (Uint8Array.fromBase64) return Uint8Array.fromBase64(text);
    const binary = atob(text);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
})();
