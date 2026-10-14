// The new tab: the date in a language picked at random from the list in settings, the time,
// and the switcher inline.
(() => {
  const { mergeSettings } = sobrio.settings;
  const { pickLocale, formatDate, timeParts } = sobrio.clock;
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions);
  const main = document.querySelector('main');
  const dateNode = main.querySelector('.date');
  const timeNode = main.querySelector('.time');
  const slot = main.querySelector('.switcher');
  let settings = mergeSettings(undefined);
  let theme = null;
  let locale;
  let switcher = null;
  let timer;

  document.title = t('newTab');

  function paint() {
    const { newtab } = settings;
    main.dataset.style = newtab.style === 'tema' && !theme?.font ? 'editorial' : newtab.style;
    const vars = {
      '--bg': theme?.background,
      '--text': theme?.text,
      '--muted': theme?.textMuted,
      '--theme-font': theme?.font && `${theme.font}, system-ui, sans-serif`,
    };
    for (const [name, value] of Object.entries(vars)) {
      if (value) document.documentElement.style.setProperty(name, value);
      else document.documentElement.style.removeProperty(name);
    }
    dateNode.hidden = !newtab.date;
    timeNode.hidden = !newtab.time;
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
    dateNode.textContent = formatDate(now, locale);
    dateNode.lang = locale ?? '';
    const { time, period } = timeParts(now, undefined, settings.newtab.clock);
    timeNode.replaceChildren(time, ...(period ? [Object.assign(document.createElement('span'), { className: 'period', textContent: period })] : []));
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

  // Timers sleep in background tabs and while the computer sleeps: redraw on coming back.
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && tick());

  // Browsers keep the focus in the address bar on a new tab. A click anywhere, a typed
  // character, or Ctrl+Space (through the background) brings it to the switcher.
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
      if (message?.sobrio === 'focus-switcher' && message.tabId === tab?.id) switcher?.focus();
    });
  });

  chrome.storage.local.get(['settings', 'theme']).then((stored) => {
    locale = pickLocale(mergeSettings(stored.settings).newtab.locales);
    apply(stored);
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.settings || changes.theme)) chrome.storage.local.get(['settings', 'theme']).then(apply);
  });
})();
