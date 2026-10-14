// The settings page. Every change saves itself, and every open tab applies it live.
(() => {
  const { mergeSettings, normalizePattern, storeThemeHook, ACTIONS, normalizeKeys, isValidShortcutKeys } = sobrio.settings;
  const { ENGINES, allEngines, shortUrl } = sobrio.match;
  const { weightOf } = sobrio.stats;
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions) || key;
  const KEYS = ['settings', 'theme', 'darkOff', 'cssOff', 'stats'];

  let settings = mergeSettings(undefined);
  let theme = null;
  let lists = { cssOff: [], darkOff: [] };
  let stats = {};
  const syncs = []; // each one repaints a control from settings, theme and lists

  function el(tag, props = {}, ...children) {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  }

  const get = (path) => path.split('.').reduce((object, key) => object[key], settings);

  // One control that cannot paint must not leave the rest of the page stale.
  function repaint() {
    for (const sync of syncs) {
      try {
        sync();
      } catch (error) {
        console.error('sobrio: a setting could not be shown', error);
      }
    }
  }

  function set(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    keys.reduce((object, key) => object[key], settings)[last] = value;
    chrome.storage.local.set({ settings });
    repaint();
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

  // showIf(): the row is only there while it returns true.
  function row(id, label, control, { indent = false, showIf } = {}) {
    const node = el('div', { className: indent ? 'row indent' : 'row' },
      el('label', { htmlFor: id, textContent: t(label) }),
      el('div', { className: 'control' }, ...control));
    if (showIf) syncs.push(() => (node.hidden = !showIf()));
    return node;
  }

  // A switch. themeKey: the hook value that overrides it; dependsOn: dimmed while that is off;
  // allow(checked): may veto a change.
  function switchRow(path, label, { indent, themeKey, dependsOn, allow, showIf, hint } = {}) {
    const id = `field-${path}`;
    const input = el('input', { type: 'checkbox', className: 'switch', id });
    const note = el('span', { className: 'note' });
    const node = row(id, label, [note, input], { indent, showIf });
    if (hint) node.querySelector('label').append(el('span', { className: 'hint', textContent: t(hint) }));
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

  function rangeRow(path, label, min, max, { dependsOn, step = 1, format = String, extra = [] } = {}) {
    const id = `field-${path}`;
    const input = el('input', { type: 'range', className: 'range', id, min, max, step });
    const value = el('span', { className: 'value' });
    const node = row(id, label, [...extra, input, value]);
    // The label follows the drag; the value is saved once the slider is let go, since every
    // save makes each open tab redo its dark mode.
    input.addEventListener('input', () => {
      value.textContent = format(Number(input.value));
    });
    input.addEventListener('change', () => set(path, Number(input.value)));
    syncs.push(() => {
      if (document.activeElement !== input) input.value = get(path);
      value.textContent = format(get(path));
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
      // Seeded with a visible gray, so leaving Auto never picks black on black.
      if (document.activeElement !== input) input.value = current || '#3a3a3a';
      value.hidden = Boolean(fromTheme);
      value.textContent = current || t('auto');
      node.classList.toggle('off', Boolean(dependsOn) && !get(dependsOn));
    });
    return node;
  }

  // A select. choices() returns [{value, label}], so it can depend on the theme.
  function selectRow(path, label, choices, { showIf } = {}) {
    const id = `field-${path}`;
    const select = el('select', { id });
    const node = row(id, label, [select], { showIf });
    select.addEventListener('change', () => set(path, typeof get(path) === 'number' ? Number(select.value) : select.value));
    syncs.push(() => {
      const list = choices();
      const current = get(path);
      if (select.dataset.choices !== JSON.stringify(list)) {
        select.replaceChildren(...list.map(({ value, label: text }) => el('option', { value, textContent: text })));
        select.dataset.choices = JSON.stringify(list);
      }
      select.value = list.some((choice) => choice.value === String(current)) ? String(current) : list[0]?.value ?? '';
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

  const times = (value) => `${Number(value.toFixed(2))}×`;

  function speedRules() {
    const pattern = el('input', { className: 'text', placeholder: t('patternPlaceholder'), spellcheck: false });
    const value = el('input', { className: 'text number', type: 'number', min: 0.25, max: 4, step: 0.05, value: 1.5 });
    const add = el('button', { type: 'button', textContent: t('add') });
    const status = el('p', { className: 'status' });
    status.setAttribute('role', 'status');
    const items = el('ul', { className: 'patterns' });
    const submit = () => {
      const normalized = normalizePattern(pattern.value);
      const number = Number(value.value);
      if (!normalized) return flash(status, t('invalidPattern'));
      if (!(number >= 0.25 && number <= 4)) return flash(status, t('invalidSpeed'));
      pattern.value = '';
      set('speed.rules', [...settings.speed.rules.filter((r) => r.pattern !== normalized), { pattern: normalized, speed: number }]);
    };
    add.addEventListener('click', submit);
    pattern.addEventListener('keydown', (e) => e.key === 'Enter' && submit());
    syncs.push(() => {
      const rows = settings.speed.rules.map((rule) => el('li', {},
        el('span', { textContent: `${rule.pattern} · ${times(rule.speed)}` }),
        el('button', { type: 'button', textContent: '×', title: t('remove'),
          onclick: () => set('speed.rules', settings.speed.rules.filter((r) => r !== rule)) })));
      items.replaceChildren(...(rows.length ? rows : [el('li', { className: 'empty', textContent: t('emptyList') })]));
    });
    return el('div', { className: 'list' }, el('h3', { textContent: t('speedRules') }),
      el('div', { className: 'adder' }, pattern, value, add), status, items);
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

  // A short text, saved 600 ms after typing stops. valid(value) may reject it.
  function textRow(path, label, { placeholder = '', showIf, valid = () => true } = {}) {
    const id = `field-${path}`;
    const input = el('input', { className: 'text', id, placeholder: t(placeholder), spellcheck: false });
    const node = row(id, label, [input], { showIf });
    const save = debounced((value) => valid(value) && set(path, value), 600);
    input.addEventListener('input', () => save(input.value.trim()));
    syncs.push(() => {
      if (document.activeElement !== input) input.value = get(path);
    });
    return node;
  }

  // The person's own CSS: a monospaced area, saved 600 ms after typing stops.
  function snippetEditor() {
    const area = el('textarea', { className: 'snippet', id: 'field-css.custom', rows: 12, spellcheck: false,
      placeholder: 'a:visited {\n  color: #9b8aff !important;\n}' });
    const save = debounced((value) => set('css.custom', value), 600);
    area.addEventListener('input', () => save(area.value));
    syncs.push(() => {
      if (document.activeElement !== area) area.value = settings.css.custom;
    });
    return el('div', { className: 'list' },
      el('h3', {}, el('label', { htmlFor: 'field-css.custom', textContent: t('styleCustom') })),
      el('p', { className: 'help', textContent: t('styleCustomHelp') }), area);
  }

  function customEngines() {
    const name = el('input', { className: 'text', placeholder: t('engineName'), spellcheck: false });
    const url = el('input', { className: 'text', placeholder: 'https://search.example.com/search?q=%s', spellcheck: false });
    const add = el('button', { type: 'button', textContent: t('add') });
    const status = el('p', { className: 'status' });
    status.setAttribute('role', 'status');
    const items = el('ul', { className: 'patterns' });
    add.addEventListener('click', () => {
      let ok = false;
      try {
        ok = Boolean(name.value.trim()) && ['http:', 'https:'].includes(new URL(url.value).protocol) && url.value.includes('%s');
      } catch {}
      if (!ok) return flash(status, t('invalidEngine'));
      const engine = { id: `custom-${Date.now().toString(36)}`, name: name.value.trim(), url: url.value.trim() };
      name.value = url.value = '';
      set('switcher.customEngines', [...settings.switcher.customEngines, engine]);
    });
    const remove = (engine) => {
      if (settings.switcher.defaultEngine === engine.id) settings.switcher.defaultEngine = 'google';
      set('switcher.customEngines', settings.switcher.customEngines.filter((e) => e.id !== engine.id));
    };
    syncs.push(() => {
      const rows = settings.switcher.customEngines.map((engine) => el('li', {},
        el('span', { textContent: `${engine.name} · ${engine.url}` }),
        el('button', { type: 'button', textContent: '×', title: t('remove'), onclick: () => remove(engine) })));
      items.replaceChildren(...(rows.length ? rows : [el('li', { className: 'empty', textContent: t('emptyList') })]));
    });
    return el('div', { className: 'list' }, el('h3', { textContent: t('customEngines') }),
      el('p', { className: 'help', textContent: t('customEnginesHelp') }),
      el('div', { className: 'adder' }, name, url, add), status, items);
  }

  // Shortcuts: press the keys on the recorder, pick an action and its parameter, add.
  function shortcutsEditor() {
    const recorder = el('button', { type: 'button', className: 'recorder', textContent: t('shortcutRecord') });
    const action = el('select', {}, ...Object.keys(ACTIONS).map((name) => el('option', { value: name, textContent: t(`action_${name}`) })));
    const engine = el('select');
    const url = el('input', { className: 'text', placeholder: 'https://example.com/', spellcheck: false });
    const speed = el('input', { className: 'text number', type: 'number', min: 0.25, max: 4, step: 0.05, value: 1.5 });
    const add = el('button', { type: 'button', textContent: t('add') });
    const status = el('p', { className: 'status' });
    status.setAttribute('role', 'status');
    const items = el('ul', { className: 'patterns' });
    let keys = null;
    let recording = false;
    const stopRecording = () => {
      recording = false;
      recorder.textContent = keys ?? t('shortcutRecord');
      recorder.classList.remove('recording');
    };
    const showParam = () => {
      const kind = ACTIONS[action.value];
      engine.hidden = kind !== 'engine';
      url.hidden = kind !== 'url';
      speed.hidden = kind !== 'speed';
    };
    action.addEventListener('change', showParam);
    recorder.addEventListener('click', () => {
      recording = true;
      recorder.textContent = t('shortcutPress');
      recorder.classList.add('recording');
    });
    // Leaving the button stops listening: the next key typed elsewhere is not a shortcut.
    recorder.addEventListener('blur', () => recording && stopRecording());
    addEventListener('keydown', (e) => {
      if (!recording) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        stopRecording();
        return;
      }
      const combo = normalizeKeys(e);
      if (!combo) return; // a modifier alone: keep waiting for the key
      keys = combo;
      stopRecording();
    }, true);
    add.addEventListener('click', () => {
      if (!isValidShortcutKeys(keys)) return flash(status, t('invalidShortcut'));
      if (settings.shortcuts.some((s) => s.keys === keys)) return flash(status, t('duplicateShortcut'));
      const kind = ACTIONS[action.value];
      const param = kind === 'engine' ? engine.value : kind === 'url' ? url.value.trim() : kind === 'speed' ? Number(speed.value) : undefined;
      const next = mergeSettings({ ...settings, shortcuts: [...settings.shortcuts, { keys, action: action.value, param }] }).shortcuts;
      if (next.length === settings.shortcuts.length) return flash(status, t('invalidShortcutParam'));
      keys = null;
      recorder.textContent = t('shortcutRecord');
      set('shortcuts', next);
    });
    const describe = (s) => {
      const kind = ACTIONS[s.action];
      const param = kind === 'engine' ? (allEngines({ ...settings.switcher, engines: Object.fromEntries(ENGINES.map((e) => [e.id, true])) })
        .find((e) => e.id === s.param)?.name ?? s.param) : kind === 'speed' ? times(s.param) : s.param;
      return `${t(`action_${s.action}`)}${param ? ` · ${param}` : ''}`;
    };
    syncs.push(() => {
      const engines = [...ENGINES, ...settings.switcher.customEngines];
      if (engine.dataset.ids !== engines.map((e) => e.id).join()) {
        engine.replaceChildren(...engines.map((e) => el('option', { value: e.id, textContent: e.name })));
        engine.dataset.ids = engines.map((e) => e.id).join();
      }
      const rows = settings.shortcuts.map((s) => el('li', {},
        el('span', {}, el('kbd', { textContent: s.keys }), ` ${describe(s)}`),
        el('button', { type: 'button', textContent: '×', title: t('remove'),
          onclick: () => set('shortcuts', settings.shortcuts.filter((x) => x !== s)) })));
      items.replaceChildren(...(rows.length ? rows : [el('li', { className: 'empty', textContent: t('emptyList') })]));
    });
    showParam();
    return el('div', { className: 'list' },
      el('p', { className: 'help', textContent: t('shortcutsHelp') }),
      el('div', { className: 'adder wrap' }, recorder, action, engine, url, speed, add), status, items);
  }

  // What the switcher's memory knows: opens, weight and last open per page; reset one or all.
  function statsTable() {
    const table = el('ul', { className: 'patterns stats' });
    const resetAll = el('button', { type: 'button', textContent: t('statsResetAll') });
    let armed = false;
    resetAll.addEventListener('click', async () => {
      if (!armed) {
        armed = true;
        resetAll.textContent = t('statsResetConfirm');
        setTimeout(() => {
          armed = false;
          resetAll.textContent = t('statsResetAll');
        }, 3000);
        return;
      }
      await chrome.storage.local.set({ stats: {} });
    });
    const remove = async (url) => {
      const { stats: current } = await chrome.storage.local.get('stats');
      const next = { ...(current && typeof current === 'object' ? current : {}) };
      delete next[url];
      await chrome.storage.local.set({ stats: next });
    };
    const day = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });
    const readable = (url) => {
      try {
        return decodeURI(shortUrl(url));
      } catch {
        return shortUrl(url);
      }
    };
    syncs.push(() => {
      const now = Date.now();
      const entries = Object.entries(stats)
        .filter(([, entry]) => entry && typeof entry === 'object')
        .sort(([, a], [, b]) => weightOf(b, now) - weightOf(a, now) || (b.last ?? 0) - (a.last ?? 0));
      const rows = entries.map(([url, entry]) => el('li', {},
        el('span', { className: 'page' }, el('span', { textContent: entry.title || readable(url) }), el('small', { textContent: readable(url) })),
        el('span', { className: 'numbers' },
          el('span', { title: t('statsOpens'), textContent: `${entry.count}×` }),
          el('span', { title: t('statsWeight'), textContent: weightOf(entry, now).toFixed(1) }),
          el('span', { title: t('statsLast'), textContent: entry.last ? day.format(entry.last) : '' })),
        el('button', { type: 'button', textContent: '×', title: t('statsReset'), onclick: () => remove(url) })));
      table.replaceChildren(...(rows.length ? rows : [el('li', { className: 'empty', textContent: t('statsEmpty') })]));
      resetAll.hidden = !rows.length;
    });
    return el('div', { className: 'list' },
      el('p', { className: 'help', textContent: t('statsHelp') }),
      el('div', { className: 'stats-head' }, el('span', { textContent: t('statsPage') }),
        el('span', { className: 'numbers' }, el('span', { textContent: t('statsOpens') }), el('span', { textContent: t('statsWeight') }),
          el('span', { textContent: t('statsLast') })), el('span', { className: 'spacer' })),
      table, el('div', { className: 'stats-foot' }, resetAll));
  }

  const TABS = ['style', 'dark', 'exceptions', 'switcher', 'shortcuts', 'newtab', 'media', 'stats'];

  function panel(id, ...children) {
    return el('section', { className: 'panel', id: `panel-${id}` }, el('h2', { textContent: t(`tab_${id}`) }), ...children);
  }

  // Tabs: a list of buttons beside the panels (above them on narrow screens), the open one in
  // the url's hash, arrows to move.
  function tabs(panels) {
    const buttons = TABS.map((id) => {
      const button = el('button', { type: 'button', className: 'tab', id: `tab-${id}`, textContent: t(`tab_${id}`) });
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `panel-${id}`);
      button.addEventListener('click', () => open(id, true));
      return button;
    });
    const nav = el('nav', { className: 'tabs' }, ...buttons);
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-orientation', 'vertical');
    nav.addEventListener('keydown', (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const index = (TABS.indexOf(current) + step + TABS.length) % TABS.length;
      open(TABS[index], true);
      buttons[index].focus();
    });
    let current = null;
    function open(id, remember) {
      current = id;
      TABS.forEach((tab, i) => {
        buttons[i].setAttribute('aria-selected', String(tab === id));
        buttons[i].tabIndex = tab === id ? 0 : -1;
        panels[i].hidden = tab !== id;
        panels[i].setAttribute('role', 'tabpanel');
        panels[i].setAttribute('aria-labelledby', `tab-${tab}`);
      });
      if (remember) history.replaceState(null, '', `#${id}`);
    }
    open(TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'style', false);
    addEventListener('hashchange', () => TABS.includes(location.hash.slice(1)) && open(location.hash.slice(1), false));
    return el('div', { className: 'layout' }, nav, el('div', { className: 'panels' }, ...panels));
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
    const NEWTAB_STYLES = ['editorial', 'suizo', 'maquina', 'libro'];
    const LAYOUTS = ['clasico', 'hora', 'linea', 'apilado', 'esquina', 'analogico'];
    const fontName = (value) => !/[;{}<>\\]/.test(value);
    const panels = [
      panel('style',
        switchRow('css.corners', 'styleCorners', { themeKey: 'corners' }),
        switchRow('css.shadows', 'styleShadows'),
        switchRow('css.blur', 'styleBlur'),
        switchRow('css.animations', 'styleAnimations'),
        switchRow('css.youtubePlayer', 'styleYoutube', { indent: true, dependsOn: 'css.animations' }),
        switchRow('css.smoothScroll', 'styleSmoothScroll'),
        switchRow('css.thinScrollbars', 'styleThinScrollbars'),
        switchRow('css.hideScrollbars', 'styleHideScrollbars'),
        switchRow('css.fixedBackgrounds', 'styleFixedBackgrounds'),
        switchRow('css.underlineLinks', 'styleUnderlineLinks'),
        switchRow('css.selectableText', 'styleSelectableText'),
        switchRow('css.noUppercase', 'styleNoUppercase'),
        switchRow('css.grayscaleMedia', 'styleGrayscaleMedia'),
        switchRow('css.focusRing', 'styleFocusRing'),
        snippetEditor()),
      panel('dark',
        switchRow('dark.enabled', 'darkEnabled'),
        switchRow('dark.detect', 'darkDetect', { dependsOn: 'dark.enabled' }),
        rangeRow('dark.brightness', 'darkBrightness', 50, 150, { dependsOn: 'dark.enabled' }),
        rangeRow('dark.contrast', 'darkContrast', 50, 150, { dependsOn: 'dark.enabled' }),
        rangeRow('dark.sepia', 'darkSepia', 0, 100, { dependsOn: 'dark.enabled' }),
        rangeRow('dark.grayscale', 'darkGrayscale', 0, 100, { dependsOn: 'dark.enabled' }),
        colorRow('dark.background', 'darkBackground', 'background', { dependsOn: 'dark.enabled' }),
        colorRow('dark.text', 'darkText', 'text', { dependsOn: 'dark.enabled' }),
        colorRow('dark.selection', 'darkSelection', 'selection', { auto: true, dependsOn: 'dark.enabled' })),
      panel('exceptions',
        el('p', { className: 'help', textContent: t('exceptionsHelp') }),
        exceptionList('cssOff', 'exceptionsCss'),
        exceptionList('darkOff', 'exceptionsDark')),
      panel('switcher',
        selectRow('switcher.precision', 'switcherPrecision', () =>
          ['strict', 'normal', 'loose'].map((value) => ({ value, label: t(`precision_${value}`) }))),
        switchRow('switcher.memory', 'switcherMemory'),
        switchRow('switcher.bookmarks', 'switcherBookmarks', { allow: keepOnePiece(switcherStatus, 'switcher.bookmarks') }),
        selectRow('switcher.defaultEngine', 'switcherDefaultEngine', () =>
          allEngines(settings.switcher).map((engine) => ({ value: engine.id, label: engine.name })),
        { showIf: () => allEngines(settings.switcher).length > 0 }),
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
        switcherStatus,
        customEngines()),
      panel('shortcuts', shortcutsEditor()),
      panel('newtab',
        selectRow('newtab.layout', 'newtabLayout', () => LAYOUTS.map((value) => ({ value, label: t(`layout_${value}`) }))),
        selectRow('newtab.style', 'newtabStyle', () => [
          ...NEWTAB_STYLES.map((value) => ({ value, label: t(`newtabStyle_${value}`) })),
          ...(theme?.font ? [{ value: 'tema', label: t('newtabStyle_tema') }] : []),
          { value: 'custom', label: t('newtabStyle_custom') },
        ]),
        textRow('newtab.customTimeFont', 'newtabCustomTimeFont', { placeholder: 'fontPlaceholder', valid: fontName,
          showIf: () => settings.newtab.style === 'custom' }),
        selectRow('newtab.customTimeWeight', 'newtabCustomTimeWeight', () =>
          [100, 200, 300, 400, 500, 600, 700, 800, 900].map((value) => ({ value: String(value), label: String(value) })),
        { showIf: () => settings.newtab.style === 'custom' }),
        textRow('newtab.customDateFont', 'newtabCustomDateFont', { placeholder: 'fontPlaceholder', valid: fontName,
          showIf: () => settings.newtab.style === 'custom' }),
        selectRow('newtab.clock', 'newtabClock', () => ['auto', '24', '12'].map((value) => ({ value, label: t(`newtabClock_${value}`) }))),
        switchRow('newtab.greeting', 'newtabGreeting'),
        textRow('newtab.name', 'newtabName', { placeholder: 'newtabNamePlaceholder', showIf: () => settings.newtab.greeting }),
        switchRow('newtab.date', 'newtabDate'),
        switchRow('newtab.time', 'newtabTime'),
        switchRow('newtab.switcher', 'newtabSwitcher'),
        switchRow('newtab.focusPage', 'newtabFocusPage', { hint: 'newtabFocusPageHint' }),
        localesList()),
      panel('media',
        switchRow('speed.enabled', 'speedEnabled'),
        rangeRow('speed.speed', 'speedGlobal', 0.25, 4, {
          step: 0.05, format: times, dependsOn: 'speed.enabled',
          extra: [el('span', { className: 'presets' }, ...[1, 1.25, 1.5, 1.75, 2].map((preset) =>
            el('button', { type: 'button', className: 'preset', textContent: times(preset), onclick: () => set('speed.speed', preset) })))],
        }),
        selectRow('speed.step', 'speedStep', () => [0.05, 0.1, 0.25].map((step) => ({ value: String(step), label: times(step) }))),
        switchRow('speed.shortcuts', 'speedShortcuts', { dependsOn: 'speed.enabled' }),
        switchRow('media.pauseAutoplay', 'mediaPauseAutoplay'),
        speedRules()),
      panel('stats', statsTable()),
    ];
    document.querySelector('main').append(
      el('header', {}, el('h1', { textContent: 'sobrio' }), version),
      el('p', { className: 'tagline', textContent: t('description') }),
      tabs(panels),
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
    stats = stored.stats && typeof stored.stats === 'object' ? stored.stats : {};
    paintTheme();
    repaint();
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
