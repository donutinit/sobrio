// The settings model and the pure helpers around it: site patterns, the userContent.css
// theme hook, Dark Reader's theme and media speed. Loaded by content scripts, extension
// pages and the background; node --test gets the same functions through module.exports.
(() => {
  const DEFAULTS = {
    css: {
      corners: true, shadows: true, blur: true, animations: true, youtubePlayer: true,
      smoothScroll: true, thinScrollbars: true, fixedBackgrounds: true,
      hideScrollbars: true, underlineLinks: true, selectableText: true, noUppercase: true,
      grayscaleMedia: false, focusRing: false, custom: '',
    },
    dark: {
      enabled: true, detect: true, brightness: 100, contrast: 100, sepia: 0, grayscale: 0,
      background: '#000000', text: '#e8e6e3', selection: '',
    },
    switcher: {
      bookmarks: true, autoSearch: true, commands: true, hints: true,
      engines: { google: true, duckduckgo: true, youtube: true, wikipedia: true, github: true },
      precision: 'normal', defaultEngine: 'google', customEngines: [], memory: true,
      commandNames: { dark: 'td', css: 'ta', settings: 'settings' },
    },
    newtab: {
      style: 'editorial', locales: [], clock: 'auto', date: true, time: true, switcher: true,
      layout: 'clasico', greeting: false, name: '', focusPage: true,
      customTimeFont: '', customDateFont: '', customTimeWeight: 300,
    },
    speed: { enabled: true, speed: 1, step: 0.1, shortcuts: true, rules: [] },
    media: { pauseAutoplay: false },
    shortcuts: [],
  };

  const ACTIONS = {
    switcher: null, toggleDark: null, toggleCss: null, toggleDarkEverywhere: null, copyCleanUrl: null,
    settings: null, search: 'engine', searchSelection: 'engine', openUrl: 'url', openUrlNewTab: 'url', speed: 'speed',
  };
  const FONT_UNSAFE = /[;{}<>\\]/;

  const HEX = /^#[0-9a-f]{6}$/i;
  const bool = (v) => typeof v === 'boolean';
  const range = (low, high) => (v) => typeof v === 'number' && Number.isFinite(v) && v >= low && v <= high;
  const oneOf = (...options) => (v) => options.includes(v);
  const color = (v) => typeof v === 'string' && HEX.test(v);
  const canonicalLocale = (v) => {
    if (typeof v !== 'string' || !v) return null;
    try {
      return Intl.getCanonicalLocales(v)[0] ?? null;
    } catch {
      return null;
    }
  };

  const fontName = (v) => typeof v === 'string' && v.length <= 100 && !FONT_UNSAFE.test(v);

  // Same shape as DEFAULTS: each leaf says what a stored value must be to be kept.
  // A switcher command: one word of letters or digits, any alphabet, at most 16.
  const isCommandWord = (v) => typeof v === 'string' && /^[\p{L}\p{N}]{1,16}$/u.test(v.trim());

  const VALID = {
    css: { ...Object.fromEntries(Object.keys(DEFAULTS.css).map((key) => [key, bool])), custom: (v) => typeof v === 'string' },
    dark: {
      enabled: bool, detect: bool, brightness: range(50, 150), contrast: range(50, 150),
      sepia: range(0, 100), grayscale: range(0, 100), background: color, text: color,
      selection: (v) => v === '' || color(v),
    },
    switcher: {
      bookmarks: bool, autoSearch: bool, commands: bool, hints: bool,
      engines: Object.fromEntries(Object.keys(DEFAULTS.switcher.engines).map((key) => [key, bool])),
      precision: oneOf('strict', 'normal', 'loose'),
      defaultEngine: (v) => typeof v === 'string',
      customEngines: Array.isArray,
      memory: bool,
      commandNames: { dark: isCommandWord, css: isCommandWord, settings: isCommandWord },
    },
    newtab: {
      style: oneOf('editorial', 'suizo', 'maquina', 'libro', 'tema', 'custom'), locales: Array.isArray,
      clock: oneOf('auto', '24', '12'), date: bool, time: bool, switcher: bool,
      layout: oneOf('clasico', 'hora', 'linea', 'apilado', 'esquina', 'analogico'),
      greeting: bool, name: (v) => typeof v === 'string', focusPage: bool,
      customTimeFont: fontName, customDateFont: fontName,
      customTimeWeight: oneOf(100, 200, 300, 400, 500, 600, 700, 800, 900),
    },
    speed: { enabled: bool, speed: range(0.25, 4), step: oneOf(0.05, 0.1, 0.25), shortcuts: bool, rules: Array.isArray },
    media: { pauseAutoplay: bool },
    shortcuts: Array.isArray,
  };

  const httpUrl = (v) => {
    try {
      return typeof v === 'string' && ['http:', 'https:'].includes(new URL(v).protocol);
    } catch {
      return false;
    }
  };

  function mergeEngines(list) {
    const ids = new Set();
    return list
      .map((engine, i) => {
        if (!isObject(engine) || typeof engine.name !== 'string' || !engine.name.trim()) return null;
        if (!httpUrl(engine.url) || !engine.url.includes('%s')) return null;
        let id = typeof engine.id === 'string' && /^custom-[a-z0-9]+$/.test(engine.id) ? engine.id : `custom-${i + 1}`;
        if (ids.has(id)) id = `custom-${i + 1}`;
        ids.add(id);
        return { id, name: engine.name.trim().slice(0, 40), url: engine.url };
      })
      .filter(Boolean)
      .slice(0, 10);
  }

  const PARAM = {
    engine: (v) => typeof v === 'string' && /^[a-z0-9-]+$/.test(v),
    url: httpUrl,
    speed: range(0.25, 4),
  };

  function mergeShortcuts(list) {
    const seen = new Set();
    const out = [];
    for (const item of list) {
      if (!isObject(item) || !isValidShortcutKeys(item.keys) || seen.has(item.keys)) continue;
      if (!Object.hasOwn(ACTIONS, item.action)) continue;
      const kind = ACTIONS[item.action];
      if (kind && !PARAM[kind](item.param)) continue;
      seen.add(item.keys);
      out.push(kind ? { keys: item.keys, action: item.action, param: item.param } : { keys: item.keys, action: item.action });
    }
    return out.slice(0, 30);
  }

  const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

  function mergeLevel(defaults, valid, stored) {
    const from = isObject(stored) ? stored : {};
    const out = {};
    for (const [key, fallback] of Object.entries(defaults)) {
      if (isObject(fallback)) out[key] = mergeLevel(fallback, valid[key], from[key]);
      else out[key] = valid[key](from[key]) ? from[key] : structuredClone(fallback);
    }
    return out;
  }

  function mergeSettings(stored) {
    const settings = mergeLevel(DEFAULTS, VALID, stored);
    settings.css.custom = settings.css.custom.slice(0, 50000);
    settings.switcher.customEngines = mergeEngines(settings.switcher.customEngines);
    const engineIds = [...Object.keys(DEFAULTS.switcher.engines), ...settings.switcher.customEngines.map((e) => e.id)];
    if (!engineIds.includes(settings.switcher.defaultEngine)) settings.switcher.defaultEngine = 'google';
    settings.newtab.name = settings.newtab.name.slice(0, 40);
    // The switcher's commands: one word each, lower case, and no two alike (else the defaults).
    const names = settings.switcher.commandNames;
    for (const kind of Object.keys(names)) names[kind] = names[kind].trim().toLowerCase();
    if (new Set(Object.values(names)).size < Object.keys(names).length) {
      settings.switcher.commandNames = structuredClone(DEFAULTS.switcher.commandNames);
    }
    settings.shortcuts = mergeShortcuts(settings.shortcuts);
    settings.dark.background = settings.dark.background.toLowerCase();
    settings.dark.text = settings.dark.text.toLowerCase();
    settings.dark.selection = settings.dark.selection.toLowerCase();
    // The new tab picks one of these at random for the date; none means the browser's.
    settings.newtab.locales = [...new Set(settings.newtab.locales.slice(0, 100).map(canonicalLocale).filter(Boolean))].slice(0, 30);
    settings.speed.speed = snapSpeed(settings.speed.speed);
    settings.speed.rules = settings.speed.rules
      .slice(0, 1000)
      .map((rule) => isObject(rule) && { pattern: normalizePattern(rule.pattern), speed: rule.speed })
      .filter((rule) => rule && rule.pattern && range(0.25, 4)(rule.speed))
      .map((rule) => ({ ...rule, speed: snapSpeed(rule.speed) }))
      .slice(0, 200);
    settings.shortcuts = settings.shortcuts.map((s) => (s.action === 'speed' ? { ...s, param: snapSpeed(s.param) } : s));
    return settings;
  }

  // A backup of everything the person chose: the settings, the three exception lists and the
  // switcher's memory. Not the theme, which comes from this machine's userContent.css.
  function makeBackup(stored, version, now = new Date()) {
    const list = (value) => (Array.isArray(value) ? value.filter((p) => typeof p === 'string') : []);
    return {
      sobrio: 1,
      version,
      exported: now.toISOString(),
      settings: mergeSettings(stored?.settings),
      cssOff: list(stored?.cssOff),
      darkOff: list(stored?.darkOff),
      ...(Array.isArray(stored?.animOff) && { animOff: list(stored.animOff) }),
      stats: isObject(stored?.stats) ? stored.stats : {},
    };
  }

  // A backup file back into storage values, every field checked as on any read: what is wrong is
  // dropped and the rest comes in. Not a sobrio backup: null. No animOff list: undefined (the
  // default stays).
  function readBackup(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return null;
    }
    if (!isObject(data) || data.sobrio !== 1) return null;
    // At most 500 sites per list: enough for anyone, and every page reads the lists as it loads.
    const patterns = (value) => (Array.isArray(value)
      ? [...new Set(value.slice(0, 2000).map(normalizePattern).filter(Boolean))].slice(0, 500)
      : []);
    return {
      settings: mergeSettings(data.settings),
      cssOff: patterns(data.cssOff),
      darkOff: patterns(data.darkOff),
      animOff: Array.isArray(data.animOff) ? patterns(data.animOff) : undefined,
      stats: readStats(data.stats),
    };
  }

  // What an import would bring that reaches beyond sobrio, shown before it is confirmed: the hosts
  // the CSS loads from (@import, url()), the person's own engines and where URL shortcuts go.
  function backupDetails(backup) {
    const { css, switcher, shortcuts } = backup.settings;
    const hostOf = (url) => {
      try {
        const parsed = new URL(url, 'https://relative.invalid/');
        return ['http:', 'https:'].includes(parsed.protocol) && parsed.hostname !== 'relative.invalid' ? parsed.hostname : '';
      } catch {
        return '';
      }
    };
    const references = [
      ...[...css.custom.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)].map((m) => m[2]),
      ...[...css.custom.matchAll(/@import\s+(['"])([^'"]+)\1/gi)].map((m) => m[2]),
    ];
    return {
      cssLength: css.custom.length,
      cssHosts: [...new Set(references.map(hostOf).filter(Boolean))],
      engines: switcher.customEngines.map((engine) => ({
        name: engine.name, host: hostOf(engine.url), isDefault: switcher.defaultEngine === engine.id,
      })),
      addresses: shortcuts.filter((s) => s.action === 'openUrl' || s.action === 'openUrlNewTab')
        .map((s) => ({ keys: s.keys, host: hostOf(s.param) })),
    };
  }

  // The switcher's memory from a backup: any page it opened (an address up to 2,048 characters),
  // a count up to a million and a last open no later than tomorrow; at most 2,000, the newest.
  function readStats(value) {
    if (!isObject(value)) return {};
    const latest = Date.now() + 86400000;
    const entries = Object.entries(value).filter(([url, entry]) => url.length <= 2048 && isObject(entry)
      && Number.isInteger(entry.count) && entry.count > 0 && entry.count <= 1e6
      && Number.isFinite(entry.last) && entry.last >= 0 && entry.last <= latest);
    return Object.fromEntries(entries
      .sort(([, a], [, b]) => b.last - a.last)
      .slice(0, 2000)
      .map(([url, entry]) => [url, { count: entry.count, last: entry.last, title: typeof entry.title === 'string' ? entry.title.slice(0, 200) : '' }]));
  }

  // "example.com" is that host only; "*.example.com" is example.com and every subdomain.
  function hostMatches(pattern, host) {
    if (!host) return false;
    if (pattern.startsWith('*.')) {
      const base = pattern.slice(2);
      return host === base || host.endsWith(`.${base}`);
    }
    return host === pattern;
  }

  function normalizePattern(input) {
    if (typeof input !== 'string') return null;
    let value = input.trim().toLowerCase();
    const wildcard = value.startsWith('*.');
    if (wildcard) value = value.slice(2);
    if (!value || /\s/.test(value)) return null;
    let host;
    try {
      host = new URL(value.includes('://') ? value : `http://${value}`).hostname;
    } catch {
      return null;
    }
    host = host.replace(/\.$/, '');
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(host)) return null;
    return (wildcard ? '*.' : '') + host;
  }

  function matchingPatterns(list, host) {
    return (Array.isArray(list) ? list : []).filter((p) => typeof p === 'string' && hostMatches(p, host));
  }

  // td and ta: turning a site off adds its exact host; turning it on removes every pattern that
  // covers it, wildcards included.
  function toggledPatterns(list, host) {
    const patterns = Array.isArray(list) ? list.filter((p) => typeof p === 'string') : [];
    const covering = matchingPatterns(patterns, host);
    return covering.length ? patterns.filter((p) => !covering.includes(p)) : [...patterns, host];
  }

  // storage.local holds {darkOff: string[], cssOff: string[]} of patterns; true means on.
  // Sites where the stylesheet leaves animations and transitions alone (animOff), until the
  // person saves a list of their own. ChatGPT's view drifts while it writes if they are cut.
  const DEFAULT_ANIM_OFF = ['chatgpt.com'];

  function siteState(stored, host) {
    const animOff = Array.isArray(stored?.animOff) ? stored.animOff : DEFAULT_ANIM_OFF;
    return {
      dark: matchingPatterns(stored?.darkOff, host).length === 0,
      css: matchingPatterns(stored?.cssOff, host).length === 0,
      animations: matchingPatterns(animOff, host).length === 0,
    };
  }

  function hookColor(value) {
    const v = value.trim().toLowerCase();
    if (HEX.test(v)) return v;
    const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(v);
    if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
    const rgb = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})\s*(?:[,/][^)]*)?\)$/.exec(v);
    if (!rgb || rgb.slice(1).some((n) => Number(n) > 255)) return null;
    return `#${rgb.slice(1).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
  }

  const HOOK_COLORS = {
    background: '--sobrio-background', text: '--sobrio-text', textMuted: '--sobrio-text-muted',
    selection: '--sobrio-selection', border: '--sobrio-border', accent: '--sobrio-accent',
  };

  // get(name) returns a custom property as getComputedStyle gives it ('' when unset).
  function parseThemeHook(get) {
    const theme = {};
    for (const [key, name] of Object.entries(HOOK_COLORS)) {
      const value = hookColor(get(name) ?? '');
      if (value) theme[key] = value;
    }
    const corners = (get('--sobrio-corners') ?? '').trim();
    if (corners === 'square' || corners === 'round') theme.corners = corners;
    const font = (get('--sobrio-font') ?? '').trim();
    if (font && !/[;{}<>\\]/.test(font)) theme.font = font;
    return Object.keys(theme).length ? theme : null;
  }

  // Saves what the hook gives (null when userContent.css has none), only when it changed:
  // every page re-applies on a storage change, and Firefox restarts the background often.
  async function storeThemeHook(get) {
    const theme = parseThemeHook(get);
    const { theme: saved } = await chrome.storage.local.get('theme');
    if (JSON.stringify(saved ?? null) !== JSON.stringify(theme)) await chrome.storage.local.set({ theme });
    return theme;
  }

  function darkTheme(dark, theme) {
    return {
      mode: 1,
      brightness: dark.brightness,
      contrast: dark.contrast,
      sepia: dark.sepia,
      grayscale: dark.grayscale,
      darkSchemeBackgroundColor: theme?.background ?? dark.background,
      darkSchemeTextColor: theme?.text ?? dark.text,
      selectionColor: theme?.selection ?? (dark.selection || 'auto'),
    };
  }

  function desiredSpeed(speed, host) {
    return speed.rules.find((rule) => hostMatches(rule.pattern, host))?.speed ?? speed.speed;
  }

  // Diego's rule: anything from 0.91 to 1.09 is just 1.
  const nearOne = (v) => v >= 0.91 && v <= 1.09;
  const snapSpeed = (v) => (nearOne(v) ? 1 : v);

  // One step, rounded to 2 decimals and kept within 0.25 and 4. Leaving 1 jumps past the band
  // around it (1 → 1.1 with a 0.05 step), so ] and [ never stick there.
  function stepSpeed(value, step, dir) {
    const fit = (v) => Math.min(4, Math.max(0.25, Math.round(v * 100) / 100));
    let next = fit(value + dir * step);
    if (nearOne(value)) {
      while (nearOne(next) && next > 0.25 && next < 4) next = fit(next + dir * step);
      return next;
    }
    return snapSpeed(next);
  }

  const LOAD_WINDOW = 1500; // ms after a new source in which a reset to 1 is the site's doing

  // Who changed a media element's speed: sobrio itself ('ours'), the site putting it back to 1
  // for a new source ('reset', so sobrio applies its speed again), or the person through the
  // site's own controls, or the site restoring a speed it saved ('page', left alone).
  function classifyRateChange({ rate, ours, sinceLoad }) {
    const near = (a, b) => Math.abs(a - b) < 0.001;
    if (ours !== undefined && near(rate, ours)) return 'ours';
    if (sinceLoad < LOAD_WINDOW && near(rate, 1)) return 'reset';
    return 'page';
  }

  // ] faster (1), [ slower (-1), \ back to 1 (0); null for anything else. AltGr counts as
  // no modifier (Spanish layouts need it for [ and ]); Windows reports it as Ctrl+Alt.
  function speedKey({ key, ctrlKey, metaKey, altKey, altGraph }) {
    if (metaKey || (!altGraph && (ctrlKey || altKey))) return null;
    return { ']': 1, '[': -1, '\\': 0 }[key] ?? null;
  }

  const MODIFIERS = ['Ctrl', 'Alt', 'Shift', 'Meta'];
  const MODIFIER_KEYS = ['Control', 'Alt', 'Shift', 'Meta', 'AltGraph', 'OS', 'Super', 'Hyper'];

  // A keydown as "Ctrl+Alt+Shift+Meta+Key" in that order; null for a modifier alone.
  function normalizeKeys({ key, ctrlKey, altKey, shiftKey, metaKey }) {
    if (!key || MODIFIER_KEYS.includes(key)) return null;
    const name = key === ' ' ? 'Space' : key.length === 1 ? key.toUpperCase() : key;
    return [ctrlKey && 'Ctrl', altKey && 'Alt', shiftKey && 'Shift', metaKey && 'Meta', name].filter(Boolean).join('+');
  }

  // Canonical order, and Ctrl, Alt or Meta unless it is a function key: plain letters belong
  // to typing.
  function isValidShortcutKeys(keys) {
    if (typeof keys !== 'string') return false;
    const parts = keys.split('+');
    const key = parts.pop();
    if (!key) return false;
    let last = -1;
    for (const part of parts) {
      const index = MODIFIERS.indexOf(part);
      if (index <= last) return false;
      last = index;
    }
    return parts.some((part) => part !== 'Shift') || /^F([1-9]|1[0-9]|2[0-4])$/.test(key);
  }

  const TRACKING = new Set(['fbclid', 'gclid', 'dclid', 'gbraid', 'wbraid', 'msclkid', 'yclid', 'twclid', 'ttclid',
    'igshid', 'mc_cid', 'mc_eid', 'si', 'ref_src', 'ref_url', '_hsenc', '_hsmi', 'mkt_tok', 'spm', 'vero_id']);

  // The URL without tracking parameters; the rest of the query keeps its own encoding.
  function cleanUrl(url) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return url;
    }
    const kept = parsed.search.slice(1).split('&').filter((part) => {
      if (!part) return false;
      let name = part.split('=')[0];
      try {
        name = decodeURIComponent(name);
      } catch {}
      return !(name.startsWith('utm_') || TRACKING.has(name));
    });
    parsed.search = kept.length ? `?${kept.join('&')}` : '';
    return parsed.href;
  }

  const api = {
    DEFAULTS, DEFAULT_ANIM_OFF, ACTIONS, isCommandWord, mergeSettings, makeBackup, readBackup, backupDetails, hostMatches, normalizePattern, matchingPatterns, siteState,
    parseThemeHook, storeThemeHook, darkTheme, desiredSpeed, stepSpeed, classifyRateChange, speedKey,
    normalizeKeys, isValidShortcutKeys, cleanUrl, toggledPatterns, snapSpeed,
  };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.settings = api;
  if (typeof module === 'object') module.exports = api;
})();
