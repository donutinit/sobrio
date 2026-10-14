// Media speed, the essentials of Global Speed: every <video> and <audio> plays at the global
// speed or at its site's rule, and ] faster, [ slower, \ back to 1 change it.
(() => {
  const { mergeSettings, desiredSpeed, stepSpeed, hostMatches, classifyRateChange, speedKey } = sobrio.settings;
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions);
  const host = location.hostname;
  let speed = mergeSettings(undefined).speed;
  let target = 1; // what sobrio wants here
  let pageOwn = null; // a speed the page chose itself (its own menu): left alone until navigation
  const ours = new WeakMap(); // media → the rate sobrio set last, to know its own ratechange
  const loads = new WeakMap(); // media → when it last started loading a source

  const close = (a, b) => Math.abs(a - b) < 0.001;
  const allMedia = () => document.querySelectorAll('video, audio');

  // Both rates: a new source resets playbackRate to defaultPlaybackRate. Either write fires a
  // ratechange, so ours is set before writing.
  function write(media, rate) {
    if (close(media.playbackRate, rate) && close(media.defaultPlaybackRate, rate)) return;
    ours.set(media, rate);
    media.defaultPlaybackRate = rate;
    media.playbackRate = rate;
  }

  function apply(media) {
    if (speed.enabled) write(media, pageOwn ?? target);
  }

  const applyAll = () => allMedia().forEach(apply);

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
    const kind = classifyRateChange({
      rate: media.playbackRate,
      ours: ours.get(media),
      sinceLoad: performance.now() - (loads.get(media) ?? -Infinity),
    });
    if (kind === 'reset') apply(media);
    if (kind === 'page') {
      ours.delete(media);
      pageOwn = media.playbackRate;
    }
  }, true);

  const isEditable = (node) => node?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node?.tagName ?? '');
  // Media that can actually play: a silent notification <audio> must not take [ and ] from
  // the page (Gmail uses them).
  const hasLiveMedia = () => [...allMedia()].some((media) => media.currentSrc && media.readyState > 0);

  addEventListener('keydown', (e) => {
    // isTrusted: a page could otherwise press ] for the person and save the global speed.
    if (!e.isTrusted || !speed.enabled || !speed.shortcuts || sobrio.switcher) return;
    const dir = speedKey({
      key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, altGraph: e.getModifierState('AltGraph'),
    });
    if (dir === null || isEditable(e.composedPath()[0]) || !hasLiveMedia()) return;
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

  // Holding ] repeats the key: save once it settles, so every tab is not woken on each repeat.
  let saveTimer;
  function saveGlobal(value) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const { settings: raw } = await chrome.storage.local.get('settings');
      const next = raw && typeof raw === 'object' ? raw : {};
      next.speed = { ...(next.speed && typeof next.speed === 'object' ? next.speed : {}), speed: value };
      await chrome.storage.local.set({ settings: next });
    }, 300);
  }

  // The shared notice from toast.js.
  function toast(value, pageOnly) {
    sobrio.toast?.(`${Number(value.toFixed(2))}×`, pageOnly ? t('speedPageOnly') : '', 900);
  }

  function update(stored) {
    const wasOn = speed.enabled;
    speed = mergeSettings(stored?.settings).speed;
    target = desiredSpeed(speed, host);
    if (wasOn && !speed.enabled && pageOwn === null) {
      // Turned off: what sobrio sped up goes back to normal; a speed the page chose stays.
      allMedia().forEach((media) => ours.has(media) && write(media, 1));
    }
    applyAll();
  }

  chrome.storage.local.get('settings').then(update, () => update(undefined));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.settings) update({ settings: changes.settings.newValue });
  });
})();
