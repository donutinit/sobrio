// The settings page. Every change saves itself, and every open tab applies it live.
(() => {
  const { mergeSettings, normalizePattern, storeThemeHook } = sobrio.settings;
  const { ENGINES } = sobrio.match;
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions) || key;
  const KEYS = ['settings', 'theme', 'darkOff', 'cssOff'];

  let settings = mergeSettings(undefined);
  let theme = null;
  let lists = { cssOff: [], darkOff: [] };
  const syncs = []; // each one repaints a control from settings, theme and lists

  function el(tag, props = {}, ...children) {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  }

  const get = (path) => path.split('.').reduce((object, key) => object[key], settings);

  function set(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    keys.reduce((object, key) => object[key], settings)[last] = value;
    chrome.storage.local.set({ settings });
    syncs.forEach((sync) => sync());
  }

  function debounced(fn, ms = 200) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function flash(status, text) {
    status.textContent = text;
    setTimeout(() => {
      if (status.textContent === text) status.textContent = '';
    }, 3000);
  }

  function row(id, label, control, { indent = false } = {}) {
    return el('div', { className: indent ? 'row indent' : 'row' },
      el('label', { htmlFor: id, textContent: t(label) }),
      el('div', { className: 'control' }, ...control));
  }

  // A switch. themeKey: the hook value that overrides it; dependsOn: dimmed while that is off;
  // allow(checked): may veto a change.
  function switchRow(path, label, { indent, themeKey, dependsOn, allow } = {}) {
    const id = `field-${path}`;
    const input = el('input', { type: 'checkbox', className: 'switch', id });
    const note = el('span', { className: 'note' });
    const node = row(id, label, [note, input], { indent });
    input.addEventListener('change', () => {
      if (allow && !allow(input.checked)) {
        input.checked = !input.checked;
        return;
      }
      set(path, input.checked);
    });
    syncs.push(() => {
      const fromTheme = themeKey && theme?.[themeKey];
      input.checked = fromTheme ? theme.corners === 'square' : get(path);
      input.disabled = Boolean(fromTheme);
      note.textContent = fromTheme ? t('fromTheme') : '';
      node.classList.toggle('off', Boolean(dependsOn) && !get(dependsOn));
    });
    return node;
  }

  function rangeRow(path, label, min, max, { dependsOn } = {}) {
    const id = `field-${path}`;
    const input = el('input', { type: 'range', className: 'range', id, min, max, step: 1 });
    const value = el('span', { className: 'value' });
    const node = row(id, label, [input, value]);
    const save = debounced((number) => set(path, number));
    input.addEventListener('input', () => {
      value.textContent = input.value;
      save(Number(input.value));
    });
    syncs.push(() => {
      if (document.activeElement !== input) input.value = get(path);
      value.textContent = String(get(path));
      node.classList.toggle('off', Boolean(dependsOn) && !get(dependsOn));
    });
    return node;
  }

  // A color. With auto, an empty value means "let Dark Reader choose".
  function colorRow(path, label, themeKey, { auto = false, dependsOn } = {}) {
    const id = `field-${path}`;
    const input = el('input', { type: 'color', className: 'color', id });
    const value = el('span', { className: 'value' });
    const swatch = el('span', { className: 'swatch' });
    const autoSwitch = el('input', { type: 'checkbox', className: 'switch', title: t('auto') });
    const note = el('span', { className: 'note' });
    const parts = [note, swatch, input, value];
    if (auto) parts.push(autoSwitch);
    const node = row(id, label, parts);
    const save = debounced((color) => set(path, color));
    input.addEventListener('input', () => {
      value.textContent = input.value;
      save(input.value);
    });
    autoSwitch.addEventListener('change', () => set(path, autoSwitch.checked ? '' : input.value));
    syncs.push(() => {
      const fromTheme = theme?.[themeKey];
      const current = get(path);
      swatch.hidden = !fromTheme;
      swatch.style.background = fromTheme ?? '';
      note.textContent = fromTheme ? t('fromTheme') : '';
      input.hidden = autoSwitch.hidden = Boolean(fromTheme);
      autoSwitch.hidden = !auto || Boolean(fromTheme);
      autoSwitch.checked = current === '';
      if (auto && current === '') input.hidden = true;
      if (document.activeElement !== input && current) input.value = current;
      value.hidden = Boolean(fromTheme);
      value.textContent = current || t('auto');
      node.classList.toggle('off', Boolean(dependsOn) && !get(dependsOn));
    });
    return node;
  }

  // A select. choices() returns [{value, label}], so it can depend on the theme.
  function selectRow(path, label, choices) {
    const id = `field-${path}`;
    const select = el('select', { id });
    const node = row(id, label, [select]);
    select.addEventListener('change', () => set(path, select.value));
    syncs.push(() => {
      const list = choices();
      const current = get(path);
      if (select.dataset.choices !== JSON.stringify(list)) {
        select.replaceChildren(...list.map(({ value, label: text }) => el('option', { value, textContent: text })));
        select.dataset.choices = JSON.stringify(list);
      }
      select.value = list.some((choice) => choice.value === current) ? current : list[0].value;
    });
    return node;
  }

  // Each language written in itself: "français", "Deutsch", "日本語".
  const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'sv', 'nb', 'da', 'fi', 'pl', 'cs', 'sk', 'hu',
    'ro', 'tr', 'el', 'ru', 'uk', 'bg', 'sr', 'hr', 'sl', 'lt', 'lv', 'et', 'ca', 'eu', 'gl', 'ga', 'cy', 'is',
    'ja', 'ko', 'zh-Hans', 'zh-Hant', 'ar', 'he', 'hi', 'th', 'vi', 'id', 'ms', 'sw', 'fil'];
  function languageName(code) {
    let name = code;
    try {
      name = new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code;
    } catch {}
    return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  }

  function localesList() {
    const select = el('select', {}, ...LANGUAGES.map((code) => el('option', { value: code, textContent: languageName(code) })));
    const add = el('button', { type: 'button', textContent: t('add') });
    const items = el('ul', { className: 'patterns' });
    add.addEventListener('click', () => {
      if (!settings.newtab.locales.includes(select.value)) set('newtab.locales', [...settings.newtab.locales, select.value]);
    });
    syncs.push(() => {
      const rows = settings.newtab.locales.map((code) => el('li', {},
        el('span', { textContent: `${languageName(code)} · ${code}` }),
        el('button', { type: 'button', textContent: '×', title: t('remove'),
          onclick: () => set('newtab.locales', settings.newtab.locales.filter((c) => c !== code)) })));
      items.replaceChildren(...(rows.length ? rows : [el('li', { className: 'empty', textContent: t('localesEmpty') })]));
    });
    return el('div', { className: 'list' },
      el('h3', { textContent: t('newtabLocales') }),
      el('p', { className: 'help', textContent: t('newtabLocalesHelp') }),
      el('div', { className: 'adder' }, select, add), items);
  }

  function exceptionList(key, title) {
    const input = el('input', { className: 'text', placeholder: t('patternPlaceholder'), spellcheck: false });
    const add = el('button', { type: 'button', textContent: t('add') });
    const status = el('p', { className: 'status' });
    status.setAttribute('role', 'status');
    const patterns = el('ul', { className: 'patterns' });
    const submit = async () => {
      const pattern = normalizePattern(input.value);
      if (!pattern) {
        flash(status, t('invalidPattern'));
        return;
      }
      input.value = '';
      status.textContent = '';
      const current = (await chrome.storage.local.get(key))[key];
      const list = Array.isArray(current) ? current : [];
      if (!list.includes(pattern)) await chrome.storage.local.set({ [key]: [...list, pattern] });
    };
    add.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => e.key === 'Enter' && submit());
    const remove = async (pattern) => {
      const current = (await chrome.storage.local.get(key))[key];
      await chrome.storage.local.set({ [key]: (Array.isArray(current) ? current : []).filter((p) => p !== pattern) });
    };
    syncs.push(() => {
      const items = lists[key].map((pattern) => el('li', {},
        el('span', { textContent: pattern }),
        el('button', { type: 'button', textContent: '×', title: t('remove'), onclick: () => remove(pattern) })));
      patterns.replaceChildren(...(items.length ? items : [el('li', { className: 'empty', textContent: t('emptyList') })]));
    });
    return el('div', { className: 'list' }, el('h3', { textContent: t(title) }), el('div', { className: 'adder' }, input, add), status, patterns);
  }

  function section(title, ...children) {
    return el('section', {}, el('h2', { textContent: t(title) }), ...children);
  }

  // The switcher must keep bookmarks or at least one engine.
  function keepOnePiece(status, path) {
    return (checked) => {
      if (checked) return true;
      const next = structuredClone(settings.switcher);
      const [, key, engine] = path.split('.');
      if (engine) next.engines[engine] = false;
      else next[key] = false;
      if (next.bookmarks || Object.values(next.engines).some(Boolean)) return true;
      flash(status, t('lastPiece'));
      return false;
    };
  }

  function build() {
    const switcherStatus = el('p', { className: 'status' });
    switcherStatus.setAttribute('role', 'status');
    const version = el('span', { className: 'version', textContent: chrome.runtime.getManifest().version });
    document.querySelector('main').append(
      el('header', {}, el('h1', { textContent: 'sobrio' }), version),
      el('p', { className: 'tagline', textContent: t('description') }),
      section('sectionStyle',
        switchRow('css.corners', 'styleCorners', { themeKey: 'corners' }),
        switchRow('css.shadows', 'styleShadows'),
        switchRow('css.blur', 'styleBlur'),
        switchRow('css.animations', 'styleAnimations'),
        switchRow('css.youtubePlayer', 'styleYoutube', { indent: true, dependsOn: 'css.animations' }),
        switchRow('css.smoothScroll', 'styleSmoothScroll'),
        switchRow('css.thinScrollbars', 'styleThinScrollbars'),
        switchRow('css.fixedBackgrounds', 'styleFixedBackgrounds')),
      section('sectionDark',
        switchRow('dark.enabled', 'darkEnabled'),
        switchRow('dark.detect', 'darkDetect', { dependsOn: 'dark.enabled' }),
        rangeRow('dark.brightness', 'darkBrightness', 50, 150, { dependsOn: 'dark.enabled' }),
        rangeRow('dark.contrast', 'darkContrast', 50, 150, { dependsOn: 'dark.enabled' }),
        rangeRow('dark.sepia', 'darkSepia', 0, 100, { dependsOn: 'dark.enabled' }),
        rangeRow('dark.grayscale', 'darkGrayscale', 0, 100, { dependsOn: 'dark.enabled' }),
        colorRow('dark.background', 'darkBackground', 'background', { dependsOn: 'dark.enabled' }),
        colorRow('dark.text', 'darkText', 'text', { dependsOn: 'dark.enabled' }),
        colorRow('dark.selection', 'darkSelection', 'selection', { auto: true, dependsOn: 'dark.enabled' })),
      section('sectionExceptions',
        el('p', { className: 'help', textContent: t('exceptionsHelp') }),
        exceptionList('cssOff', 'exceptionsCss'),
        exceptionList('darkOff', 'exceptionsDark')),
      section('sectionSwitcher',
        switchRow('switcher.bookmarks', 'switcherBookmarks', { allow: keepOnePiece(switcherStatus, 'switcher.bookmarks') }),
        ...ENGINES.map((engine) => {
          const node = switchRow(`switcher.engines.${engine.id}`, 'switcherEngine', {
            indent: true, allow: keepOnePiece(switcherStatus, `switcher.engines.${engine.id}`),
          });
          node.querySelector('label').textContent = engine.name;
          return node;
        }),
        switchRow('switcher.autoSearch', 'switcherAutoSearch'),
        switchRow('switcher.commands', 'switcherCommands'),
        switchRow('switcher.hints', 'switcherHints'),
        switcherStatus),
      section('sectionNewtab',
        selectRow('newtab.style', 'newtabStyle', () => [
          ...['editorial', 'suizo', 'maquina', 'libro'].map((value) => ({ value, label: t(`newtabStyle_${value}`) })),
          ...(theme?.font ? [{ value: 'tema', label: t('newtabStyle_tema') }] : []),
        ]),
        selectRow('newtab.clock', 'newtabClock', () => ['auto', '24', '12'].map((value) => ({ value, label: t(`newtabClock_${value}`) }))),
        switchRow('newtab.date', 'newtabDate'),
        switchRow('newtab.time', 'newtabTime'),
        switchRow('newtab.switcher', 'newtabSwitcher'),
        localesList()),
      el('p', { className: 'footer', textContent: t('optionsFooter') }),
    );
  }

  function paintTheme() {
    const vars = {
      '--bg': theme?.background,
      '--text': theme?.text,
      '--muted': theme?.textMuted,
      '--line-strong': theme?.border,
      '--line': theme?.border && `color-mix(in srgb, ${theme.border} 40%, ${theme.background ?? '#000'})`,
      '--accent': theme?.accent,
      '--font': theme?.font && `${theme.font}, system-ui, sans-serif`,
    };
    for (const [name, value] of Object.entries(vars)) {
      if (value) document.documentElement.style.setProperty(name, value);
      else document.documentElement.style.removeProperty(name);
    }
  }

  function apply(stored) {
    settings = mergeSettings(stored.settings);
    theme = stored.theme ?? null;
    const array = (value) => (Array.isArray(value) ? value.filter((p) => typeof p === 'string') : []);
    lists = { cssOff: array(stored.cssOff), darkOff: array(stored.darkOff) };
    paintTheme();
    syncs.forEach((sync) => sync());
  }

  document.title = `sobrio · ${t('settingsTitle')}`;
  build();
  const style = getComputedStyle(document.documentElement);
  storeThemeHook((name) => style.getPropertyValue(name))
    .catch(() => {})
    .then(() => chrome.storage.local.get(KEYS))
    .then(apply);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && KEYS.some((key) => changes[key])) chrome.storage.local.get(KEYS).then(apply);
  });
})();
