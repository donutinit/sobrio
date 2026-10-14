// The new tab: an optional greeting, the date in a language picked at random from the list in
// settings, the time in one of several layouts, and the switcher inline.
(() => {
  const { mergeSettings } = sobrio.settings;
  const { pickLocale, formatDate, timeParts, greetingKey, handAngles } = sobrio.clock;
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions);
  const main = document.querySelector('main');
  const greetingNode = main.querySelector('.greeting');
  const dateNode = main.querySelector('.date');
  const timeNode = main.querySelector('.time');
  const analog = main.querySelector('.analog');
  const slot = main.querySelector('.switcher');
  let settings = mergeSettings(undefined);
  let theme = null;
  let locale;
  let switcher = null;
  let timer;

  document.title = t('newTab');

  const span = (className, text) => Object.assign(document.createElement('span'), { className, textContent: text });

  function setVars(vars) {
    for (const [name, value] of Object.entries(vars)) {
      if (value) document.documentElement.style.setProperty(name, value);
      else document.documentElement.style.removeProperty(name);
    }
  }

  function paint() {
    const { newtab } = settings;
    const noFonts = newtab.style === 'custom' && !newtab.customTimeFont && !newtab.customDateFont;
    main.dataset.style = (newtab.style === 'tema' && !theme?.font) || noFonts ? 'editorial' : newtab.style;
    main.dataset.layout = newtab.layout;
    setVars({
      '--bg': theme?.background,
      '--text': theme?.text,
      '--muted': theme?.textMuted,
      '--theme-font': theme?.font && `${theme.font}, system-ui, sans-serif`,
      '--custom-time-font': newtab.customTimeFont,
      '--custom-date-font': newtab.customDateFont,
      '--custom-time-weight': String(newtab.customTimeWeight),
    });
    greetingNode.hidden = !newtab.greeting;
    dateNode.hidden = !newtab.date || newtab.layout === 'hora';
    timeNode.hidden = !newtab.time || newtab.layout === 'analogico';
    // An <svg> has no hidden property: the attribute is set by hand.
    analog.toggleAttribute('hidden', !newtab.time || newtab.layout !== 'analogico');
    slot.hidden = !newtab.switcher;
    if (newtab.switcher && !switcher) {
      const shadow = slot.attachShadow({ mode: 'open' });
      switcher = sobrio.mountSwitcher(shadow, { layout: 'inline', hostname: '', close: () => {} });
      shadow.addEventListener('keydown', switcher.onKey);
    }
    tick();
  }

  // Redraws at the start of every minute.
  function tick() {
    clearTimeout(timer);
    const now = new Date();
    const { newtab } = settings;
    const name = newtab.name.trim();
    greetingNode.textContent = t(greetingKey(now.getHours())) + (name ? `, ${name}` : '');
    dateNode.textContent = formatDate(now, locale);
    dateNode.lang = locale ?? '';
    const { time, period } = timeParts(now, undefined, newtab.clock);
    const parts = newtab.layout === 'apilado' ? time.split(/[:.]/).map((part) => span('', part)) : [time];
    timeNode.replaceChildren(...parts, ...(period ? [span('period', period)] : []));
    const angles = handAngles(now);
    analog.querySelector('.hour').setAttribute('transform', `rotate(${angles.hour} 100 100)`);
    analog.querySelector('.minute').setAttribute('transform', `rotate(${angles.minute} 100 100)`);
    timer = setTimeout(tick, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50);
  }

  function apply(stored) {
    settings = mergeSettings(stored.settings);
    theme = stored.theme ?? null;
    if (locale === undefined ? settings.newtab.locales.length : !settings.newtab.locales.includes(locale)) {
      locale = pickLocale(settings.newtab.locales);
    }
    paint();
  }

  // Browsers keep the focus in the address bar on a new tab, and no page or extension can take
  // it from there. With focusPage, the tab loads itself again through tabs.update: a
  // navigation, which gives the page the focus (the address bar then shows this page's url).
  function takeFocus() {
    if (!settings.newtab.focusPage || new URLSearchParams(location.search).has('focus')) return;
    const url = chrome.runtime.getURL('newtab.html?focus');
    chrome.tabs.getCurrent().then((tab) => {
      if (!tab) return;
      // loadReplace (no extra history entry) only exists in Firefox; Chrome throws on it.
      try {
        chrome.tabs.update(tab.id, { url, loadReplace: true });
      } catch {
        chrome.tabs.update(tab.id, { url });
      }
    });
  }

  // Timers sleep in background tabs and while the computer sleeps: redraw on coming back.
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && tick());

  // A click anywhere, a typed character, or Ctrl+Space (through the background) brings the focus
  // to the switcher.
  document.addEventListener('mousedown', (e) => {
    if (switcher && !slot.hidden && e.target !== slot) {
      e.preventDefault();
      switcher.focus();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (!switcher || slot.hidden || e.target === slot) return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) switcher.focus();
  });
  chrome.tabs.getCurrent().then((tab) => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message?.sobrio === 'focus-switcher' && message.tabId === tab?.id) switcher?.focus(message.mode);
    });
  });

  chrome.storage.local.get(['settings', 'theme']).then((stored) => {
    settings = mergeSettings(stored.settings);
    takeFocus(); // the page draws anyway: if the reload does not happen, it is not left blank
    locale = pickLocale(settings.newtab.locales);
    apply(stored);
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.settings || changes.theme)) chrome.storage.local.get(['settings', 'theme']).then(apply);
  });
})();
