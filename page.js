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
  // The hosts seen light today under the same system scheme skip the looks while they load (on
  // Wikipedia those took half a second of main thread); a theme switch on the page still gets one.
  const SEEN_LIGHT = 'seenLight';

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
  let knownLight = false; // storage has this host in seenLight, fresh
  let cutTransitions = !leftAlone && DEFAULTS.css.animations;
  let keepPlayer = DEFAULTS.css.youtubePlayer && youtubeHost(hostname);
  let waitingForArea = false;
  // speed.js and shortcuts.js take the settings from here: one read of storage per frame, not three.
  const settingsListeners = [];
  sobrio.onSettings = (listener) => settingsListeners.push(listener);

  DarkReader.setFetchMethod(fetchThroughBackground);
  // Dark Reader reads the page's own images (same site) with fetch in this world.
  const ownFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => photoStandIn(await ownFetch(...args));
  chrome.storage.local.get([...KEYS, OWN_DARK, SEEN_LIGHT]).then(apply, () => apply(undefined));
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
    if (stored && SEEN_LIGHT in stored) knownLight = detector.seenLight(stored[SEEN_LIGHT], hostname, scheme(), Date.now());
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
        // Seen light here today: no look unless the page itself says it is dark (a class or a meta,
        // read without touching Dark Reader).
        if (!knownLight || detector.hintFromPage(document) === true) look();
        if (!knownLight && document.readyState !== 'complete') addEventListener('load', () => look(), { once: true });
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
      watchImages();
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
    if (dark !== knownDark || (!dark && !knownLight)) remember(dark);
    if (dark === nativeDark) return;
    nativeDark = dark;
    if (dark) turnOff();
    else turnOn(wanted);
  }

  // Never from a private window: the lists would keep where the person went.
  async function remember(dark) {
    knownDark = dark;
    knownLight = !dark;
    if (!hostname || chrome.extension?.inIncognitoContext) return;
    try {
      const stored = await chrome.storage.local.get([OWN_DARK, SEEN_LIGHT]);
      const others = (Array.isArray(stored[OWN_DARK]) ? stored[OWN_DARK] : []).filter((host) => typeof host === 'string' && host !== hostname);
      await chrome.storage.local.set({
        [OWN_DARK]: dark ? [hostname, ...others].slice(0, OWN_DARK_MAX) : others,
        [SEEN_LIGHT]: detector.withSeenLight(stored[SEEN_LIGHT], hostname, !dark, scheme(), Date.now()),
      });
    } catch {}
  }

  const scheme = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

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

  // Dark Reader leaves <img> and <video> as they are. Each one is looked at once when it comes into
  // view (again if its source changes), and while Dark Reader is on:
  // - a large one with text drawn over it, not on a box of its own, is dimmed. Dark Reader makes
  //   the text light, so a heading made for a light photo vanished on it (Meta's sign in). Pages
  //   often draw the text after the image: without text, it is looked at once more a moment later.
  // - a small dark one on a clear background (a logo, an icon) is inverted, as Dark Reader does
  //   with the same image as a CSS background. Wikipedia's wordmark was black on black.
  const DIM = 'data-sobrio-dim';
  const INVERT = 'data-sobrio-invert';
  let imageObserver = null;

  function watchImages() {
    if (imageObserver || typeof IntersectionObserver !== 'function') return;
    addStyle('sobrio-dim', `html[data-darkreader-mode] :is(img, video)[${DIM}] { filter: brightness(.35) !important; }\n` +
      `html[data-darkreader-mode] img[${INVERT}] { filter: invert(1) hue-rotate(180deg) !important; }`);
    imageObserver = new IntersectionObserver((entries) => {
      const seen = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
      seen.forEach((media) => imageObserver.unobserve(media));
      if (seen.length) requestAnimationFrame(() => seen.forEach((media) => {
        dimUnderText(media, true);
        invertDarkIcon(media);
      }));
    }, { threshold: 0.3 });
    const watch = (media) => media instanceof HTMLImageElement || media instanceof HTMLVideoElement ? imageObserver.observe(media) : null;
    for (const media of document.querySelectorAll('img, video')) watch(media);
    // A load event stops at the document, never reaching window.
    for (const type of ['load', 'loadeddata']) document.addEventListener(type, (e) => watch(e.target), true);
  }

  function dimUnderText(media, again) {
    const rect = media.getBoundingClientRect();
    if (rect.width < 160 || rect.height < 100 || !current || !media.isConnected) return;
    for (const fx of [1 / 6, 1 / 2, 5 / 6]) {
      for (const fy of [1 / 6, 1 / 2, 5 / 6]) {
        const x = rect.left + rect.width * fx;
        const y = rect.top + rect.height * fy;
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
        const stack = document.elementsFromPoint(x, y);
        const at = stack.indexOf(media);
        if (at <= 0) continue;
        const above = stack.slice(0, at);
        if (above.some(ownText) && !above.some(opaqueBox)) {
          media.setAttribute(DIM, '');
          return;
        }
      }
    }
    media.removeAttribute(DIM);
    if (again) setTimeout(() => requestAnimationFrame(() => dimUnderText(media, false)), 1500);
  }

  // Up to 64 pixels high and 400 wide on the page, in a format that can be clear (not a JPEG, nor an
  // address that does not say): a logo or an icon, not a thumbnail or an avatar. Read the way Dark
  // Reader reads images, from the page's own copy when it is same-site (or a data: URL), else
  // through the background, once per address.
  const ICON_FORMAT = /^data:image\/(svg|png|gif|webp)|\.(svg|png|gif|webp)([?#]|$)/i;
  const iconLooks = new Map();

  async function invertDarkIcon(img) {
    if (!(img instanceof HTMLImageElement) || !current) return;
    const rect = img.getBoundingClientRect();
    const src = img.currentSrc || img.src;
    if (!src || rect.height > 64 || rect.width > 400 || rect.height < 4 || !img.naturalWidth || !img.naturalHeight) return;
    if (!/^(https?|data):/.test(src) || !ICON_FORMAT.test(src)) return;
    if (!iconLooks.has(src)) iconLooks.set(src, looksLikeDarkIcon(img, src).catch(() => false));
    if (await iconLooks.get(src)) img.setAttribute(INVERT, '');
    else img.removeAttribute(INVERT);
  }

  async function looksLikeDarkIcon(img, src) {
    let image = img;
    if (!src.startsWith('data:') && new URL(src).origin !== location.origin) {
      const blob = await (await fetchThroughBackground(src)).blob();
      const url = URL.createObjectURL(blob);
      try {
        image = new Image();
        image.src = url;
        await image.decode();
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    const width = image.naturalWidth || img.naturalWidth;
    const height = image.naturalHeight || img.naturalHeight;
    const k = Math.min(1, Math.sqrt((32 * 32) / (width * height)));
    const canvas = new OffscreenCanvas(Math.max(1, Math.ceil(width * k)), Math.max(1, Math.ceil(height * k)));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return detector.isDarkIcon(context.getImageData(0, 0, canvas.width, canvas.height).data);
  }

  const ownText = (el) => [...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && /\S/.test(node.data));
  const opaqueBox = (el) => (detector.parseColor(getComputedStyle(el).backgroundColor)?.a ?? 0) >= 0.8;

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
    return photoStandIn(new Response(fromBase64(reply.base64), init));
  }

  // Photos stay photos. Every image Dark Reader reads is looked at first the way it looks (at most
  // 32 × 32 pixels), and a photo reaches it as a flat gray square, which it leaves as it is. Large
  // images stay its to judge (it hides a large light one, which keeps text over it readable), and
  // so do SVGs.
  const STAND_IN = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNoaGgAAAMEAYFL09IQAAAAAElFTkSuQmCC';
  async function photoStandIn(response) {
    const type = response.headers.get('Content-Type') ?? '';
    if (!response.ok || !/^image\//i.test(type) || /svg/i.test(type)) return response;
    try {
      const bitmap = await createImageBitmap(await response.clone().blob());
      const { width, height } = bitmap;
      let photo = false;
      if (width * height <= 512 * 512) {
        const k = Math.min(1, Math.sqrt((32 * 32) / (width * height)));
        const canvas = new OffscreenCanvas(Math.ceil(width * k), Math.ceil(height * k));
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        photo = detector.isPhoto(context.getImageData(0, 0, canvas.width, canvas.height).data);
      }
      bitmap.close();
      if (photo) return new Response(fromBase64(STAND_IN), { headers: { 'Content-Type': 'image/png' } });
    } catch {} // not an image this browser decodes: Dark Reader's to judge, as before
    return response;
  }

  function fromBase64(text) {
    if (Uint8Array.fromBase64) return Uint8Array.fromBase64(text);
    const binary = atob(text);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
})();
