// The settings model and the pure helpers around it: site patterns, the userContent.css
// theme hook, Dark Reader's theme and media speed. Loaded by content scripts, extension
// pages and the background; node --test gets the same functions through module.exports.
(() => {
  const DEFAULTS = {
    css: {
      corners: true, shadows: true, blur: true, animations: true, youtubePlayer: true,
      smoothScroll: true, thinScrollbars: true, fixedBackgrounds: true,
    },
    dark: {
      enabled: true, detect: true, brightness: 100, contrast: 100, sepia: 0, grayscale: 0,
      background: '#000000', text: '#e8e6e3', selection: '',
    },
    switcher: {
      bookmarks: true, autoSearch: true, commands: true, hints: true,
      engines: { duckduckgo: true, google: true, youtube: true, wikipedia: true, github: true },
    },
    newtab: { style: 'editorial', locales: [], clock: 'auto', date: true, time: true, switcher: true },
    speed: { enabled: true, speed: 1, step: 0.1, shortcuts: true, rules: [] },
  };

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

  // Same shape as DEFAULTS: each leaf says what a stored value must be to be kept.
  const VALID = {
    css: Object.fromEntries(Object.keys(DEFAULTS.css).map((key) => [key, bool])),
    dark: {
      enabled: bool, detect: bool, brightness: range(50, 150), contrast: range(50, 150),
      sepia: range(0, 100), grayscale: range(0, 100), background: color, text: color,
      selection: (v) => v === '' || color(v),
    },
    switcher: {
      bookmarks: bool, autoSearch: bool, commands: bool, hints: bool,
      engines: Object.fromEntries(Object.keys(DEFAULTS.switcher.engines).map((key) => [key, bool])),
    },
    newtab: {
      style: oneOf('editorial', 'suizo', 'maquina', 'libro', 'tema'), locales: Array.isArray,
      clock: oneOf('auto', '24', '12'), date: bool, time: bool, switcher: bool,
    },
    speed: { enabled: bool, speed: range(0.25, 4), step: oneOf(0.05, 0.1, 0.25), shortcuts: bool, rules: Array.isArray },
  };

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
    settings.dark.background = settings.dark.background.toLowerCase();
    settings.dark.text = settings.dark.text.toLowerCase();
    settings.dark.selection = settings.dark.selection.toLowerCase();
    // The new tab picks one of these at random for the date; none means the browser's.
    settings.newtab.locales = [...new Set(settings.newtab.locales.map(canonicalLocale).filter(Boolean))].slice(0, 30);
    settings.speed.rules = settings.speed.rules
      .map((rule) => isObject(rule) && { pattern: normalizePattern(rule.pattern), speed: rule.speed })
      .filter((rule) => rule && rule.pattern && range(0.25, 4)(rule.speed));
    return settings;
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

  // storage.local holds {darkOff: string[], cssOff: string[]} of patterns; true means on.
  function siteState(stored, host) {
    return {
      dark: matchingPatterns(stored?.darkOff, host).length === 0,
      css: matchingPatterns(stored?.cssOff, host).length === 0,
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

  function stepSpeed(value, step, dir) {
    return Math.min(4, Math.max(0.25, Math.round((value + dir * step) * 100) / 100));
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

  const api = {
    DEFAULTS, mergeSettings, hostMatches, normalizePattern, matchingPatterns, siteState,
    parseThemeHook, storeThemeHook, darkTheme, desiredSpeed, stepSpeed, classifyRateChange, speedKey,
  };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.settings = api;
  if (typeof module === 'object') module.exports = api;
})();
