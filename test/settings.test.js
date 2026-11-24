const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULTS,
  DEFAULT_ANIM_OFF,
  mergeSettings,
  hostMatches,
  normalizePattern,
  siteState,
  isLocalHost,
  matchingPatterns,
  parseThemeHook,
  darkTheme,
  desiredSpeed,
  stepSpeed,
  classifyRateChange,
  speedKey,
  normalizeKeys,
  commandKeys,
  isValidShortcutKeys,
  cleanUrl,
  toggledPatterns,
  snapSpeed,
  pauseLeft,
  PAUSE_MINUTES,
  PAUSE_MAX,
  roundCorners,
  squircleCorner,
  squircleBorder,
  squircleClip,
} = require('../settings.js');

test('nothing stored gives the defaults, as a copy', () => {
  const settings = mergeSettings(undefined);
  assert.deepEqual(settings, DEFAULTS);
  settings.css.corners = false;
  assert.equal(DEFAULTS.css.corners, true);
});

test('defaults: every style switch on but grayscale and the focus ring, and the new tab takes the focus', () => {
  const off = ['grayscaleMedia', 'focusRing'];
  const switches = Object.keys(DEFAULTS.css).filter((key) => key !== 'custom');
  assert.ok(switches.filter((key) => !off.includes(key)).every((key) => DEFAULTS.css[key] === true));
  assert.ok(off.every((key) => DEFAULTS.css[key] === false));
  assert.equal(DEFAULTS.css.custom, '');
  assert.equal(DEFAULTS.newtab.focusPage, true);
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
  assert.deepEqual(siteState(stored, 'gist.github.com'), { dark: false, css: true, animations: true, local: false });
  assert.deepEqual(siteState(stored, 'github.com'), { dark: false, css: true, animations: true, local: false });
  assert.deepEqual(siteState(stored, 'news.ycombinator.com'), { dark: true, css: false, animations: true, local: false });
  assert.deepEqual(siteState(stored, 'ycombinator.com'), { dark: true, css: true, animations: true, local: false });
});

test('siteState in a frame: the site in the address bar turned off turns it off too', () => {
  const stored = { darkOff: ['claude.ai'], cssOff: ['*.youtube.com'], animOff: [] };
  const artifact = siteState(stored, 'www.claudeusercontent.com', 'claude.ai');
  assert.deepEqual(artifact, { dark: false, css: true, animations: true, local: false });
  // Its own host still counts: a video from a site turned off stays off inside another one.
  assert.deepEqual(siteState(stored, 'www.youtube.com', 'blog.example'), { dark: true, css: false, animations: true, local: false });
  assert.deepEqual(siteState(stored, 'cdn.example', 'blog.example'), { dark: true, css: true, animations: true, local: false });
  // A blank frame has no host of its own: only the site's.
  assert.deepEqual(siteState(stored, '', 'claude.ai'), { dark: false, css: true, animations: true, local: false });
  // Inside a local page, left alone like the page.
  assert.deepEqual(siteState(stored, 'www.youtube.com', 'localhost'), { dark: false, css: false, animations: true, local: true });
  // No site in the address bar (a file, a browser page): its own host only.
  assert.deepEqual(siteState(stored, 'claude.ai', ''), { dark: false, css: true, animations: true, local: false });
});

test('siteState with nothing stored means everything on', () => {
  assert.deepEqual(siteState(undefined, 'a.com'), { dark: true, css: true, animations: true, local: false });
  assert.deepEqual(siteState({ darkOff: 'junk', cssOff: [null, 3], animOff: [null] }, 'a.com'), { dark: true, css: true, animations: true, local: false });
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

test('parseThemeHook reads the radii and the curve of round corners', () => {
  const theme = parseThemeHook(hook({
    '--sobrio-corners': ' round ', '--sobrio-radius': ' 10px', '--sobrio-radius-small': '6', '--sobrio-corner-power': ' 6 ',
  }));
  assert.deepEqual(theme, { corners: 'round', radius: 10, radiusSmall: 6, cornerPower: 6 });
  for (const [name, value] of [['--sobrio-radius', '10em'], ['--sobrio-radius', '-2px'], ['--sobrio-radius', '41px'],
    ['--sobrio-radius-small', 'calc(1px)'], ['--sobrio-corner-power', '0'], ['--sobrio-corner-power', 'squircle'], ['--sobrio-corner-power', '21']]) {
    assert.equal(parseThemeHook(hook({ '--sobrio-corners': 'round', [name]: value })).radius, undefined, value);
    assert.deepEqual(Object.keys(parseThemeHook(hook({ '--sobrio-corners': 'round', [name]: value }))), ['corners'], `${name}: ${value}`);
  }
});

test('roundCorners: only a round theme with a radius rounds sobrio', () => {
  assert.deepEqual(roundCorners({ corners: 'round', radius: 10, radiusSmall: 6, cornerPower: 6 }), { radius: 10, small: 6, power: 6 });
  // Without a small radius or a curve: the radius and a circle.
  assert.deepEqual(roundCorners({ corners: 'round', radius: 8 }), { radius: 8, small: 8, power: 2 });
  for (const theme of [null, {}, { corners: 'square', radius: 10 }, { corners: 'round' }, { corners: 'round', radius: 0 }]) {
    assert.equal(roundCorners(theme), null, JSON.stringify(theme));
  }
});

test('squircleCorner runs along a superellipse from the left edge to the top edge', () => {
  const points = squircleCorner(10, 6);
  assert.deepEqual(points[0], [0, 10]);
  assert.deepEqual(points.at(-1), [10, 0]);
  for (const [x, y] of points) assert.ok(Math.abs(((10 - x) / 10) ** 6 + ((10 - y) / 10) ** 6 - 1) < 1e-9);
  // Hyprland's power 6 hugs the corner much closer than a circle of the same radius.
  const middle = (n) => squircleCorner(10, n, 2)[1][0];
  assert.ok(Math.abs(middle(2) - 2.929) < 0.001);
  assert.ok(Math.abs(middle(6) - 1.091) < 0.001);
});

test('squircleBorder: an SVG that border-image slices at the radius, with its fill and stroke', () => {
  const value = squircleBorder(6, 6, { stroke: '#4a5470' });
  const match = /^url\("data:image\/svg\+xml,(.+)"\) 7 fill \/ 7px$/.exec(value);
  assert.ok(match, value);
  const svg = decodeURIComponent(match[1]);
  assert.match(svg, /width="15" height="15"/);
  assert.match(svg, /fill="none" stroke="#4a5470" stroke-width="1"/);
  // The stroke sits half a pixel in, so it stays inside the box.
  assert.match(svg, /d="M0\.5 6L/);
  assert.match(decodeURIComponent(/,(.+)"\)/.exec(squircleBorder(10, 6, { fill: 'rgb(1, 2, 3)' }))[1]), /fill="rgb\(1, 2, 3\)"\/>/);
});

test('squircleClip: the outline as a polygon that fits any box', () => {
  const clip = squircleClip(6, 6);
  assert.match(clip, /^polygon\(0px 6px, /);
  assert.match(clip, /calc\(100% - 6px\) 0px/);
  assert.match(clip, /calc\(100% - 0px\) calc\(100% - 6px\)/);
  assert.equal(clip.split(',').length, 68);
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
  // The theme's text reaches pages as a gray of its lightness: its tint turned lilac on Wikipedia.
  assert.equal(themed.darkSchemeTextColor, '#f6f6f6');
  assert.equal(darkTheme(dark, { text: '#f6eefc' }).darkSchemeTextColor, '#f5f5f5');
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

test('v0.3 defaults: Google first, normal precision, the rest of the new things off', () => {
  assert.equal(DEFAULTS.switcher.precision, 'normal');
  assert.equal(DEFAULTS.switcher.defaultEngine, 'google');
  assert.deepEqual(DEFAULTS.switcher.customEngines, []);
  assert.deepEqual(
    [DEFAULTS.newtab.layout, DEFAULTS.newtab.greeting, DEFAULTS.newtab.name, DEFAULTS.newtab.focusPage,
      DEFAULTS.newtab.customTimeFont, DEFAULTS.newtab.customDateFont, DEFAULTS.newtab.customTimeWeight],
    ['clasico', false, '', true, '', '', 300]);
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

test('custom engines: an empty or missing address is dropped', () => {
  const settings = mergeSettings({ switcher: { defaultEngine: 'custom-a1', customEngines: [
    { id: 'custom-a1', name: 'Empty', url: '' },
    { id: 'custom-b2', name: 'None' },
    { id: 'custom-c3', name: 'Spaces', url: '   ' },
  ] } });
  assert.deepEqual(settings.switcher.customEngines, []);
  assert.equal(settings.switcher.defaultEngine, 'google');
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

test("commandKeys: a browser command's shortcut as normalizeKeys gives its keydown", () => {
  assert.equal(commandKeys('Ctrl+Space'), 'Ctrl+Space');
  assert.equal(commandKeys('Ctrl+Space'), normalizeKeys(ev(' ', { ctrlKey: true })));
  assert.equal(commandKeys('Alt+Shift+K'), normalizeKeys(ev('K', { altKey: true, shiftKey: true })));
  assert.equal(commandKeys('Shift+Alt+F5'), 'Alt+Shift+F5');
  assert.equal(commandKeys('Ctrl+Period'), normalizeKeys(ev('.', { ctrlKey: true })));
  assert.equal(commandKeys('Ctrl+Up'), normalizeKeys(ev('ArrowUp', { ctrlKey: true })));
  assert.equal(commandKeys('Alt+PageDown'), 'Alt+PageDown');
});

test('commandKeys: on a Mac, Ctrl is the Command key and MacCtrl the Control key', () => {
  assert.equal(commandKeys('Ctrl+Space', true), 'Meta+Space');
  assert.equal(commandKeys('Command+Space', true), 'Meta+Space');
  assert.equal(commandKeys('MacCtrl+Shift+U', true), 'Ctrl+Shift+U');
});

test('commandKeys: null without a shortcut or for one no keydown can be told to be', () => {
  for (const shortcut of ['', undefined, null, 'MediaPlayPause', 'Ctrl+MediaNextTrack', '⌘Space', 'Hyper+K', 'Ctrl+', 'Ctrl+constructor', 'toString+K']) {
    assert.equal(commandKeys(shortcut), null, String(shortcut));
  }
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

test('siteState: ChatGPT keeps its animations until the list is saved', () => {
  assert.deepEqual(DEFAULT_ANIM_OFF, ['chatgpt.com']);
  assert.equal(siteState(undefined, 'chatgpt.com').animations, false);
  assert.equal(siteState({}, 'chatgpt.com').animations, false);
  assert.equal(siteState(undefined, 'example.com').animations, true);
  // A saved list is the person's: ChatGPT out of it gets the cut, others in it keep theirs.
  assert.equal(siteState({ animOff: [] }, 'chatgpt.com').animations, true);
  assert.equal(siteState({ animOff: ['*.example.com'] }, 'app.example.com').animations, false);
  assert.equal(siteState({ animOff: ['*.example.com'] }, 'chatgpt.com').animations, true);
  assert.equal(siteState({ animOff: 'junk' }, 'chatgpt.com').animations, false);
});

test('command names: pz, px, pd and settings by default; yours if each is one word and different', () => {
  const defaults = { dark: 'pz', css: 'px', pause: 'pd', settings: 'settings' };
  assert.deepEqual(DEFAULTS.switcher.commandNames, defaults);
  const own = mergeSettings({ switcher: { commandNames: { dark: ' Oscuro ', css: 'css', pause: 'Pausa', settings: 'ajustes' } } });
  assert.deepEqual(own.switcher.commandNames, { dark: 'oscuro', css: 'css', pause: 'pausa', settings: 'ajustes' });
  // Saved before the pause existed: it comes with its default word.
  assert.deepEqual(mergeSettings({ switcher: { commandNames: { dark: 'td', css: 'ta', settings: 'settings' } } }).switcher.commandNames,
    { dark: 'td', css: 'ta', pause: 'pd', settings: 'settings' });
  // A bad one falls back alone: spaces, empty, too long, not text.
  assert.equal(mergeSettings({ switcher: { commandNames: { dark: 'modo oscuro' } } }).switcher.commandNames.dark, 'pz');
  assert.equal(mergeSettings({ switcher: { commandNames: { css: '' } } }).switcher.commandNames.css, 'px');
  assert.equal(mergeSettings({ switcher: { commandNames: { css: 'x'.repeat(17) } } }).switcher.commandNames.css, 'px');
  assert.equal(mergeSettings({ switcher: { commandNames: { pause: 'pd 5' } } }).switcher.commandNames.pause, 'pd');
  assert.equal(mergeSettings({ switcher: { commandNames: { settings: 3 } } }).switcher.commandNames.settings, 'settings');
  assert.equal(mergeSettings({ switcher: { commandNames: { dark: 'año' } } }).switcher.commandNames.dark, 'año');
  // Two commands cannot share a word: then all of them go back to the defaults.
  assert.deepEqual(mergeSettings({ switcher: { commandNames: { dark: 'px' } } }).switcher.commandNames, defaults);
  assert.deepEqual(mergeSettings({ switcher: { commandNames: { dark: 'pd' } } }).switcher.commandNames, defaults);
});

test('pauseLeft: the time left of a pause of dark mode, none when it is over or not one', () => {
  const now = 1_800_000_000_000;
  assert.equal(pauseLeft(now + 180000, now), 180000);
  assert.equal(pauseLeft(now + PAUSE_MAX * 60000, now), PAUSE_MAX * 60000);
  assert.equal(PAUSE_MINUTES, 3);
  for (const until of [now, now - 1, undefined, null, '9999999999999', NaN, now + PAUSE_MAX * 60000 + 1]) {
    assert.equal(pauseLeft(until, now), 0, String(until));
  }
});

test('classifyRateChange: a rate no person picks (0, out of range, not a number) is ignored', () => {
  // WhatsApp sets a video to 0: it must not become the page's speed for every other video.
  assert.equal(classifyRateChange({ rate: 0, ours: 1.5, sinceLoad: Infinity }), 'ignore');
  assert.equal(classifyRateChange({ rate: 0, ours: undefined, sinceLoad: 100 }), 'ignore');
  assert.equal(classifyRateChange({ rate: Number.NaN, ours: 1.5, sinceLoad: Infinity }), 'ignore');
  assert.equal(classifyRateChange({ rate: 0.05, ours: 1.5, sinceLoad: Infinity }), 'ignore');
  assert.equal(classifyRateChange({ rate: 17, ours: 1.5, sinceLoad: Infinity }), 'ignore');
  assert.equal(classifyRateChange({ rate: 0.1, ours: 1.5, sinceLoad: Infinity }), 'page');
  assert.equal(classifyRateChange({ rate: 16, ours: 1.5, sinceLoad: Infinity }), 'page');
});

test('isLocalHost: this machine and the local network', () => {
  for (const host of ['localhost', 'app.localhost', '127.0.0.1', '127.8.9.10', '0.0.0.0', '10.0.0.5', '172.16.0.1',
    '172.31.255.255', '192.168.1.20', '169.254.10.10', '100.64.0.1', '100.127.255.254', '[::1]', '::1',
    '[fd12:3456::1]', '[fe80::1]', 'printer.local', 'NAS.LOCAL', 'localhost.']) {
    assert.equal(isLocalHost(host), true, host);
  }
  for (const host of ['', 'example.com', 'localhost.example.com', 'mylocal', '172.32.0.1', '192.169.0.1', '11.0.0.1',
    '100.128.0.1', '8.8.8.8', '[2001:db8::1]', 'local', '1270.0.0.1', '999.168.1.1']) {
    assert.equal(isLocalHost(host), false, host);
  }
});

test('local addresses are left alone by default: no stylesheet, no dark mode', () => {
  assert.equal(DEFAULTS.exceptions.local, true);
  assert.deepEqual(siteState(undefined, 'localhost'), { dark: false, css: false, animations: true, local: true });
  assert.deepEqual(siteState({ settings: { exceptions: { local: true } } }, '192.168.1.20'),
    { dark: false, css: false, animations: true, local: true });
  // Turned off, a local address is a site like any other, exceptions included.
  const off = { settings: { exceptions: { local: false } } };
  assert.deepEqual(siteState(off, 'localhost'), { dark: true, css: true, animations: true, local: false });
  assert.deepEqual(siteState({ ...off, darkOff: ['localhost'] }, 'localhost'), { dark: false, css: true, animations: true, local: false });
  assert.deepEqual(siteState(undefined, 'example.com'), { dark: true, css: true, animations: true, local: false });
});
