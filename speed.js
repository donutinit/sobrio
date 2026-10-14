// Media speed, the essentials of Global Speed: every <video> and <audio> plays at the global
// speed or at its site's rule, and ] faster, [ slower, \ back to 1 change it.
(() => {
  const { mergeSettings, desiredSpeed, stepSpeed, hostMatches } = sobrio.settings;
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions);
  const host = location.hostname;
  const LOAD_WINDOW = 1500; // ms after a new source in which a rate change is the site resetting
  let speed = mergeSettings(undefined).speed;
  let target = 1; // what sobrio wants here
  let pageOwn = null; // a speed the page chose itself (its own menu): left alone until navigation
  const ours = new WeakMap(); // media → the rate sobrio set last, to know its own ratechange
  const loads = new WeakMap(); // media → when it last started loading a source

  const close = (a, b) => Math.abs(a - b) < 0.001;

  function apply(media) {
    if (!speed.enabled) return;
    const want = pageOwn ?? target;
    // defaultPlaybackRate too: a new source resets playbackRate to it.
    media.defaultPlaybackRate = want;
    if (!close(media.playbackRate, want)) {
      ours.set(media, want);
      media.playbackRate = want;
    }
  }

  const applyAll = () => document.querySelectorAll('video, audio').forEach(apply);

  // Media events do not bubble, but capture on document still sees them.
  const isMedia = (node) => node instanceof HTMLMediaElement;
  // emptied comes first when a source is replaced; loadstart when it is the first one.
  for (const type of ['emptied', 'loadstart']) {
    document.addEventListener(type, (e) => isMedia(e.target) && loads.set(e.target, performance.now()), true);
  }
  for (const type of ['loadedmetadata', 'play']) {
    document.addEventListener(type, (e) => isMedia(e.target) && apply(e.target), true);
  }
  document.addEventListener('ratechange', (e) => {
    const media = e.target;
    if (!isMedia(media) || !speed.enabled) return;
    if (ours.has(media) && close(media.playbackRate, ours.get(media))) return;
    if (performance.now() - (loads.get(media) ?? -Infinity) < LOAD_WINDOW) {
      apply(media); // the site resetting the rate for a new video
      return;
    }
    pageOwn = media.playbackRate; // the person chose it in the site's own controls
  }, true);

  const isEditable = (node) => node?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node?.tagName ?? '');

  addEventListener('keydown', (e) => {
    if (!speed.enabled || !speed.shortcuts || sobrio.switcher) return;
    if (e.ctrlKey || e.metaKey || (e.altKey && !e.getModifierState('AltGraph'))) return;
    const dir = { ']': 1, '[': -1, '\\': 0 }[e.key];
    if (dir === undefined || isEditable(e.composedPath()[0])) return;
    if (!document.querySelector('video, audio')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const next = dir === 0 ? 1 : stepSpeed(pageOwn ?? target, speed.step, dir);
    const ruled = speed.rules.some((rule) => hostMatches(rule.pattern, host));
    if (ruled) {
      pageOwn = next; // a site with a rule: only this page
    } else {
      pageOwn = null;
      target = next;
      saveGlobal(next);
    }
    applyAll();
    toast(next, ruled);
  }, true);

  async function saveGlobal(value) {
    const { settings: raw } = await chrome.storage.local.get('settings');
    const next = raw && typeof raw === 'object' ? raw : {};
    next.speed = { ...(next.speed && typeof next.speed === 'object' ? next.speed : {}), speed: value };
    await chrome.storage.local.set({ settings: next });
  }

  let toastHost = null;
  let toastTimer;

  // A small box at the top left, inside the fullscreen element when there is one.
  function toast(value, pageOnly) {
    if (!toastHost) {
      toastHost = document.createElement('sobrio-speed');
      toastHost.style.cssText =
        'all: initial !important; position: fixed !important; top: 16px !important; left: 16px !important; z-index: 2147483647 !important;';
      const shadow = toastHost.attachShadow({ mode: 'closed' });
      const style = document.createElement('style');
      style.textContent =
        '.toast { padding: 6px 10px; border: 1px solid #333; background: #000; color: #fff;' +
        ' font: 14px/1.3 system-ui, sans-serif; font-variant-numeric: tabular-nums; }' +
        ' .toast span { color: #888; }';
      toastHost.box = document.createElement('div');
      toastHost.box.className = 'toast';
      shadow.append(style, toastHost.box);
    }
    const label = document.createElement('span');
    label.textContent = pageOnly ? ` · ${t('speedPageOnly')}` : '';
    toastHost.box.replaceChildren(`${Number(value.toFixed(2))}×`, label);
    (document.fullscreenElement ?? document.documentElement).append(toastHost);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastHost.remove(), 900);
  }

  function update(stored) {
    speed = mergeSettings(stored?.settings).speed;
    target = desiredSpeed(speed, host);
    applyAll();
  }

  chrome.storage.local.get('settings').then(update, () => update(undefined));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.settings) update({ settings: changes.settings.newValue });
  });
})();
