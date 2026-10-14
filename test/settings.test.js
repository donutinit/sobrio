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
} = require('../settings.js');

test('nothing stored gives the defaults, as a copy', () => {
  const settings = mergeSettings(undefined);
  assert.deepEqual(settings, DEFAULTS);
  settings.css.corners = false;
  assert.equal(DEFAULTS.css.corners, true);
});

test('defaults keep v0.1 behavior', () => {
  assert.deepEqual(DEFAULTS.css, {
    corners: true, shadows: true, blur: true, animations: true, youtubePlayer: true,
    smoothScroll: true, thinScrollbars: true, fixedBackgrounds: true,
  });
  assert.equal(DEFAULTS.dark.background, '#000000');
  assert.equal(DEFAULTS.dark.text, '#e8e6e3');
  assert.equal(DEFAULTS.speed.speed, 1);
});

test('valid stored values win', () => {
  const settings = mergeSettings({
    css: { corners: false },
    dark: { brightness: 80, background: '#07090F', selection: '#171d2b' },
    switcher: { engines: { google: false } },
    newtab: { style: 'libro', locale: 'ja-JP', clock: '12' },
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
  assert.equal(settings.newtab.locale, 'ja-JP');
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
    newtab: { style: 'comic', locale: 'not a locale!!', clock: 24 },
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
  assert.equal(stepSpeed(1, 0.05, -1), 0.95);
  assert.equal(stepSpeed(3.9, 0.25, 1), 4);
  assert.equal(stepSpeed(0.3, 0.1, -1), 0.25);
});
