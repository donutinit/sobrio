const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULTS,
  mergeSettings,
  hostMatches,
  normalizePattern,
  siteState,
  matchingPatterns,
  parseThemeHook,
  darkTheme,
  desiredSpeed,
  stepSpeed,
  classifyRateChange,
  speedKey,
  normalizeKeys,
  isValidShortcutKeys,
  cleanUrl,
  toggledPatterns,
  snapSpeed,
} = require('../settings.js');

test('nothing stored gives the defaults, as a copy', () => {
  const settings = mergeSettings(undefined);
  assert.deepEqual(settings, DEFAULTS);
  settings.css.corners = false;
  assert.equal(DEFAULTS.css.corners, true);
});

test('defaults keep v0.1 behavior', () => {
  const v01 = ['corners', 'shadows', 'blur', 'animations', 'youtubePlayer', 'smoothScroll', 'thinScrollbars', 'fixedBackgrounds'];
  assert.ok(v01.every((key) => DEFAULTS.css[key] === true));
  assert.ok(Object.keys(DEFAULTS.css).filter((key) => !v01.includes(key)).every((key) => !DEFAULTS.css[key]));
  assert.equal(DEFAULTS.dark.background, '#000000');
  assert.equal(DEFAULTS.dark.text, '#e8e6e3');
  assert.equal(DEFAULTS.speed.speed, 1);
});

test('valid stored values win', () => {
  const settings = mergeSettings({
    css: { corners: false },
    dark: { brightness: 80, background: '#07090F', selection: '#171d2b' },
    switcher: { engines: { google: false } },
    newtab: { style: 'libro', locales: ['fr', 'de-DE', 'fr', 'it'], clock: '12' },
    speed: { speed: 1.5, step: 0.25, rules: [{ pattern: 'YouTube.com', speed: 2 }] },
  });
  assert.equal(settings.css.corners, false);
  assert.equal(settings.css.shadows, true);
  assert.equal(settings.dark.brightness, 80);
  assert.equal(settings.dark.background, '#07090f');
  assert.equal(settings.dark.selection, '#171d2b');
  assert.equal(settings.switcher.engines.google, false);
  assert.equal(settings.switcher.engines.duckduckgo, true);
  assert.equal(settings.newtab.style, 'libro');
  assert.deepEqual(settings.newtab.locales, ['fr', 'de-DE', 'it']);
  assert.equal(settings.newtab.clock, '12');
  assert.equal(settings.speed.speed, 1.5);
  assert.equal(settings.speed.step, 0.25);
  assert.deepEqual(settings.speed.rules, [{ pattern: 'youtube.com', speed: 2 }]);
});

test('corrupt or out of range values fall back field by field', () => {
  const settings = mergeSettings({
    css: { corners: 'yes', blur: 0 },
    dark: { enabled: null, brightness: 400, contrast: Number.NaN, sepia: -1, background: 'black', text: '#fff' },
    switcher: { bookmarks: 1, engines: { google: 'no', altavista: true } },
    newtab: { style: 'comic', locales: 'fr', clock: 24 },
    speed: { speed: 9, step: 0.3, shortcuts: 'on', rules: [{ pattern: 'a b', speed: 2 }, { pattern: 'x.com', speed: 99 }, 'junk'] },
  });
  assert.deepEqual(settings, DEFAULTS);
});

test('garbage at the top level gives defaults', () => {
  assert.deepEqual(mergeSettings('nope'), DEFAULTS);
  assert.deepEqual(mergeSettings({ css: 'x', dark: [], switcher: null }), DEFAULTS);
});

test('hostMatches: exact and wildcard', () => {
  assert.equal(hostMatches('example.com', 'example.com'), true);
  assert.equal(hostMatches('example.com', 'docs.example.com'), false);
  assert.equal(hostMatches('*.example.com', 'example.com'), true);
  assert.equal(hostMatches('*.example.com', 'a.b.example.com'), true);
  assert.equal(hostMatches('*.example.com', 'badexample.com'), false);
  assert.equal(hostMatches('*.example.com', ''), false);
});

test('normalizePattern cleans what people paste', () => {
  assert.equal(normalizePattern('  Example.COM '), 'example.com');
  assert.equal(normalizePattern('https://Docs.Example.com/path?q=1#x'), 'docs.example.com');
  assert.equal(normalizePattern('example.com:8080'), 'example.com');
  assert.equal(normalizePattern('example.com.'), 'example.com');
  assert.equal(normalizePattern('*.Example.com'), '*.example.com');
  assert.equal(normalizePattern('*.https://example.com/x'), '*.example.com');
  assert.equal(normalizePattern('localhost'), 'localhost');
  assert.equal(normalizePattern('café.com'), 'xn--caf-dma.com');
});

test('normalizePattern rejects what is not a site', () => {
  for (const bad of ['', '   ', '*', '*.', 'a b.com', '*.*.com', 'exa*mple.com', null, undefined, 42]) {
    assert.equal(normalizePattern(bad), null, String(bad));
  }
});

test('siteState with patterns', () => {
  const stored = { darkOff: ['*.github.com'], cssOff: ['news.ycombinator.com'] };
  assert.deepEqual(siteState(stored, 'gist.github.com'), { dark: false, css: true });
  assert.deepEqual(siteState(stored, 'github.com'), { dark: false, css: true });
  assert.deepEqual(siteState(stored, 'news.ycombinator.com'), { dark: true, css: false });
  assert.deepEqual(siteState(stored, 'ycombinator.com'), { dark: true, css: true });
});

test('siteState with nothing stored means everything on', () => {
  assert.deepEqual(siteState(undefined, 'a.com'), { dark: true, css: true });
  assert.deepEqual(siteState({ darkOff: 'junk', cssOff: [null, 3] }, 'a.com'), { dark: true, css: true });
});

test('matchingPatterns lists every pattern that covers the site', () => {
  assert.deepEqual(matchingPatterns(['a.example.com', '*.example.com', 'other.com'], 'a.example.com'),
    ['a.example.com', '*.example.com']);
  assert.deepEqual(matchingPatterns(undefined, 'a.com'), []);
});

const hook = (values) => (name) => values[name] ?? '';

test('parseThemeHook reads the --sobrio-* variables', () => {
  const theme = parseThemeHook(hook({
    '--sobrio-background': ' #07090F',
    '--sobrio-text': '#edf1ff',
    '--sobrio-text-muted': 'rgb(124, 134, 160)',
    '--sobrio-selection': '#171d2b',
    '--sobrio-border': '#456',
    '--sobrio-accent': '#f5a9cf',
    '--sobrio-corners': ' square ',
    '--sobrio-font': ' "Acumin Pro", sans-serif ',
  }));
  assert.deepEqual(theme, {
    background: '#07090f', text: '#edf1ff', textMuted: '#7c86a0', selection: '#171d2b',
    border: '#445566', accent: '#f5a9cf', corners: 'square', font: '"Acumin Pro", sans-serif',
  });
});

test('parseThemeHook ignores invalid values one by one', () => {
  const theme = parseThemeHook(hook({
    '--sobrio-background': 'red',
    '--sobrio-text': '#edf1ff',
    '--sobrio-corners': 'banana',
    '--sobrio-font': 'x; } body { display: none',
  }));
  assert.deepEqual(theme, { text: '#edf1ff' });
});

test('parseThemeHook without any variable is null', () => {
  assert.equal(parseThemeHook(hook({})), null);
});

test('darkTheme uses the settings, and the theme hook wins for colors', () => {
  const dark = { ...DEFAULTS.dark, brightness: 90, sepia: 10 };
  assert.deepEqual(darkTheme(dark, null), {
    mode: 1, brightness: 90, contrast: 100, sepia: 10, grayscale: 0,
    darkSchemeBackgroundColor: '#000000', darkSchemeTextColor: '#e8e6e3', selectionColor: 'auto',
  });
  const themed = darkTheme(dark, { background: '#07090f', text: '#edf1ff', selection: '#171d2b' });
  assert.equal(themed.darkSchemeBackgroundColor, '#07090f');
  assert.equal(themed.darkSchemeTextColor, '#edf1ff');
  assert.equal(themed.selectionColor, '#171d2b');
  assert.equal(darkTheme({ ...dark, selection: '#333333' }, { text: '#ffffff' }).selectionColor, '#333333');
});

test('desiredSpeed: the first matching rule, else the global speed', () => {
  const speed = { ...DEFAULTS.speed, speed: 1.25, rules: [{ pattern: '*.youtube.com', speed: 2 }, { pattern: 'youtube.com', speed: 3 }] };
  assert.equal(desiredSpeed(speed, 'www.youtube.com'), 2);
  assert.equal(desiredSpeed(speed, 'youtube.com'), 2);
  assert.equal(desiredSpeed(speed, 'vimeo.com'), 1.25);
});

test('stepSpeed adds steps, rounds and stays within 0.25 and 4', () => {
  assert.equal(stepSpeed(1.1, 0.1, 1), 1.2);
  assert.equal(stepSpeed(1, 0.05, -1), 0.9);
  assert.equal(stepSpeed(3.9, 0.25, 1), 4);
  assert.equal(stepSpeed(0.3, 0.1, -1), 0.25);
});

test('newtab locales: invalid entries drop out one by one', () => {
  assert.deepEqual(mergeSettings({ newtab: { locales: ['es-MX', 'not a locale!!', 3, '', 'EN-us'] } }).newtab.locales, ['es-MX', 'en-US']);
  assert.deepEqual(DEFAULTS.newtab.locales, []);
});

test('classifyRateChange: our own write', () => {
  assert.equal(classifyRateChange({ rate: 1.5, ours: 1.5, sinceLoad: Infinity }), 'ours');
});

test('classifyRateChange: back to 1 right after a new source is the site resetting', () => {
  assert.equal(classifyRateChange({ rate: 1, ours: 1.5, sinceLoad: 200 }), 'reset');
});

test('classifyRateChange: a site restoring its own speed after a new source is the page', () => {
  assert.equal(classifyRateChange({ rate: 1.5, ours: 1, sinceLoad: 200 }), 'page');
});

test('classifyRateChange: a change later on is the person using the site', () => {
  assert.equal(classifyRateChange({ rate: 1, ours: 1.5, sinceLoad: 5000 }), 'page');
  assert.equal(classifyRateChange({ rate: 2, ours: undefined, sinceLoad: Infinity }), 'page');
});

const key = (k, mods = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, altGraph: false, ...mods });

test('speedKey: ] [ and backslash', () => {
  assert.equal(speedKey(key(']')), 1);
  assert.equal(speedKey(key('[')), -1);
  assert.equal(speedKey(key('\\')), 0);
  assert.equal(speedKey(key('a')), null);
});

test('speedKey: modifiers are not shortcuts, AltGr is (Spanish layouts)', () => {
  assert.equal(speedKey(key(']', { ctrlKey: true })), null);
  assert.equal(speedKey(key(']', { metaKey: true })), null);
  assert.equal(speedKey(key(']', { altKey: true })), null);
  assert.equal(speedKey(key(']', { altGraph: true })), 1);
  // Windows reports AltGr as Ctrl+Alt.
  assert.equal(speedKey(key(']', { ctrlKey: true, altKey: true, altGraph: true })), 1);
});

test('v0.3 defaults: new things off, Google first, normal precision', () => {
  assert.deepEqual(
    [DEFAULTS.css.hideScrollbars, DEFAULTS.css.underlineLinks, DEFAULTS.css.selectableText,
      DEFAULTS.css.noUppercase, DEFAULTS.css.grayscaleMedia, DEFAULTS.css.focusRing, DEFAULTS.css.custom],
    [false, false, false, false, false, false, '']);
  assert.equal(DEFAULTS.switcher.precision, 'normal');
  assert.equal(DEFAULTS.switcher.defaultEngine, 'google');
  assert.deepEqual(DEFAULTS.switcher.customEngines, []);
  assert.deepEqual(
    [DEFAULTS.newtab.layout, DEFAULTS.newtab.greeting, DEFAULTS.newtab.name, DEFAULTS.newtab.focusPage,
      DEFAULTS.newtab.customTimeFont, DEFAULTS.newtab.customDateFont, DEFAULTS.newtab.customTimeWeight],
    ['clasico', false, '', false, '', '', 300]);
  assert.deepEqual(DEFAULTS.media, { pauseAutoplay: false });
  assert.deepEqual(DEFAULTS.shortcuts, []);
});

test('custom css: kept as text, cut at 50,000 characters', () => {
  assert.equal(mergeSettings({ css: { custom: 'a { color: red }' } }).css.custom, 'a { color: red }');
  assert.equal(mergeSettings({ css: { custom: 'x'.repeat(60000) } }).css.custom.length, 50000);
  assert.equal(mergeSettings({ css: { custom: 42 } }).css.custom, '');
});

test('custom engines: http(s) with %s, a name, at most 10, ids kept', () => {
  const settings = mergeSettings({ switcher: { customEngines: [
    { id: 'custom-a1', name: 'SearXNG', url: 'https://search.example.com/search?q=%s' },
    { id: 'custom-b2', name: 'No placeholder', url: 'https://example.com/search' },
    { id: 'custom-c3', name: 'Script', url: 'javascript:alert(%s)' },
    { id: 'custom-d4', name: '', url: 'https://a.com/?q=%s' },
    { name: 'No id', url: 'http://b.com/?q=%s' },
    'junk',
  ] } });
  assert.deepEqual(settings.switcher.customEngines, [
    { id: 'custom-a1', name: 'SearXNG', url: 'https://search.example.com/search?q=%s' },
    { id: 'custom-5', name: 'No id', url: 'http://b.com/?q=%s' },
  ]);
  const many = Array.from({ length: 14 }, (_, i) => ({ id: `custom-${i}`, name: `E${i}`, url: `https://e${i}.com/?q=%s` }));
  assert.equal(mergeSettings({ switcher: { customEngines: many } }).switcher.customEngines.length, 10);
});

test('defaultEngine: a built-in or an existing custom engine, else Google', () => {
  const custom = [{ id: 'custom-a1', name: 'SearXNG', url: 'https://s.example.com/?q=%s' }];
  assert.equal(mergeSettings({ switcher: { defaultEngine: 'duckduckgo' } }).switcher.defaultEngine, 'duckduckgo');
  assert.equal(mergeSettings({ switcher: { defaultEngine: 'custom-a1', customEngines: custom } }).switcher.defaultEngine, 'custom-a1');
  assert.equal(mergeSettings({ switcher: { defaultEngine: 'custom-gone' } }).switcher.defaultEngine, 'google');
  assert.equal(mergeSettings({ switcher: { precision: 'fuzzy' } }).switcher.precision, 'normal');
});

test('new tab: layouts, greeting, name and custom fonts validated', () => {
  const settings = mergeSettings({ newtab: {
    layout: 'analogico', greeting: true, name: 'Diego', style: 'custom',
    customTimeFont: '"Acumin Pro", sans-serif', customDateFont: 'x; } body {', customTimeWeight: 700, focusPage: true,
  } });
  assert.deepEqual(
    [settings.newtab.layout, settings.newtab.greeting, settings.newtab.name, settings.newtab.style,
      settings.newtab.customTimeFont, settings.newtab.customDateFont, settings.newtab.customTimeWeight, settings.newtab.focusPage],
    ['analogico', true, 'Diego', 'custom', '"Acumin Pro", sans-serif', '', 700, true]);
  assert.equal(mergeSettings({ newtab: { layout: 'tiles', customTimeWeight: 350, name: 'x'.repeat(80) } }).newtab.layout, 'clasico');
  assert.equal(mergeSettings({ newtab: { customTimeWeight: 350 } }).newtab.customTimeWeight, 300);
  assert.equal(mergeSettings({ newtab: { name: 'x'.repeat(80) } }).newtab.name.length, 40);
});

const ev = (key, mods = {}) => ({ key, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...mods });

test('normalizeKeys: modifiers in a fixed order, letters upper case', () => {
  assert.equal(normalizeKeys(ev('d', { altKey: true })), 'Alt+D');
  assert.equal(normalizeKeys(ev('K', { ctrlKey: true, shiftKey: true })), 'Ctrl+Shift+K');
  assert.equal(normalizeKeys(ev('F5')), 'F5');
  assert.equal(normalizeKeys(ev(' ', { metaKey: true, ctrlKey: true })), 'Ctrl+Meta+Space');
  assert.equal(normalizeKeys(ev('ArrowUp', { altKey: true })), 'Alt+ArrowUp');
  assert.equal(normalizeKeys(ev('Control', { ctrlKey: true })), null);
  assert.equal(normalizeKeys(ev('Shift', { shiftKey: true })), null);
});

test('isValidShortcutKeys: needs Ctrl, Alt or Meta, or a function key', () => {
  assert.equal(isValidShortcutKeys('Alt+D'), true);
  assert.equal(isValidShortcutKeys('Ctrl+Shift+K'), true);
  assert.equal(isValidShortcutKeys('F5'), true);
  assert.equal(isValidShortcutKeys('Shift+F12'), true);
  assert.equal(isValidShortcutKeys('D'), false);
  assert.equal(isValidShortcutKeys('Shift+D'), false);
  assert.equal(isValidShortcutKeys('Alt+'), false);
  assert.equal(isValidShortcutKeys('Shift+Alt+D'), false);
  assert.equal(isValidShortcutKeys(''), false);
});

test('shortcuts: valid ones kept with their param, duplicates and junk out', () => {
  const settings = mergeSettings({ shortcuts: [
    { keys: 'Alt+D', action: 'toggleDark', param: 'ignored' },
    { keys: 'Alt+D', action: 'toggleCss' },
    { keys: 'Alt+G', action: 'openUrlNewTab', param: 'https://github.com/' },
    { keys: 'Alt+J', action: 'openUrl', param: 'javascript:alert(1)' },
    { keys: 'Alt+1', action: 'speed', param: 1.5 },
    { keys: 'Alt+2', action: 'speed', param: 9 },
    { keys: 'Alt+S', action: 'search', param: 'youtube' },
    { keys: 'D', action: 'toggleDark' },
    { keys: 'Alt+X', action: 'format c:' },
  ] });
  assert.deepEqual(settings.shortcuts, [
    { keys: 'Alt+D', action: 'toggleDark' },
    { keys: 'Alt+G', action: 'openUrlNewTab', param: 'https://github.com/' },
    { keys: 'Alt+1', action: 'speed', param: 1.5 },
    { keys: 'Alt+S', action: 'search', param: 'youtube' },
  ]);
});

test('cleanUrl drops tracking parameters only', () => {
  assert.equal(cleanUrl('https://a.com/x?utm_source=n&utm_medium=e&id=7#top'), 'https://a.com/x?id=7#top');
  assert.equal(cleanUrl('https://youtu.be/abc?si=XYZ&t=42'), 'https://youtu.be/abc?t=42');
  assert.equal(cleanUrl('https://a.com/?fbclid=1&gclid=2&msclkid=3&igshid=4&mc_cid=5&q=ok'), 'https://a.com/?q=ok');
  assert.equal(cleanUrl('https://a.com/path'), 'https://a.com/path');
  assert.equal(cleanUrl('https://a.com/?utm_campaign=x'), 'https://a.com/');
  assert.equal(cleanUrl('not a url'), 'not a url');
});

test('memory is on by default and must be a boolean', () => {
  assert.equal(DEFAULTS.switcher.memory, true);
  assert.equal(mergeSettings({ switcher: { memory: false } }).switcher.memory, false);
  assert.equal(mergeSettings({ switcher: { memory: 'yes' } }).switcher.memory, true);
});

test('toggledPatterns: off adds the exact host, on removes every pattern that covers it', () => {
  assert.deepEqual(toggledPatterns(['a.com'], 'b.com'), ['a.com', 'b.com']);
  assert.deepEqual(toggledPatterns(['a.com', 'b.com'], 'b.com'), ['a.com']);
  assert.deepEqual(toggledPatterns(['*.example.com', 'docs.example.com', 'x.com'], 'docs.example.com'), ['x.com']);
  assert.deepEqual(toggledPatterns(undefined, 'b.com'), ['b.com']);
});

test('snapSpeed: from 0.91 to 1.09 is just 1', () => {
  assert.equal(snapSpeed(0.91), 1);
  assert.equal(snapSpeed(1.09), 1);
  assert.equal(snapSpeed(1.05), 1);
  assert.equal(snapSpeed(0.9), 0.9);
  assert.equal(snapSpeed(1.1), 1.1);
});

test('stepSpeed never sticks at 1 and snaps into it', () => {
  assert.equal(stepSpeed(1, 0.05, 1), 1.1);
  assert.equal(stepSpeed(1, 0.05, -1), 0.9);
  assert.equal(stepSpeed(1.1, 0.05, -1), 1);
  assert.equal(stepSpeed(0.9, 0.05, 1), 1);
  assert.equal(stepSpeed(1, 0.25, 1), 1.25);
});

test('saved speeds near 1 are 1', () => {
  const settings = mergeSettings({ speed: { speed: 1.05, rules: [{ pattern: 'a.com', speed: 0.95 }] },
    shortcuts: [{ keys: 'Alt+1', action: 'speed', param: 1.08 }] });
  assert.equal(settings.speed.speed, 1);
  assert.equal(settings.speed.rules[0].speed, 1);
  assert.equal(settings.shortcuts[0].param, 1);
});
