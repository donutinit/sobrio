const test = require('node:test');
const assert = require('node:assert/strict');
const { parseColor, lightness, schemeFromMeta, isDarkFromSamples, darkReaderSheets, themeChanged, seenLight, withSeenLight, isPhoto, isDarkIcon } = require('../detector.js');

const WHITE = 'rgb(255, 255, 255)';
const DARK = 'rgb(30, 30, 30)';
const LIGHT_TEXT = 'rgb(230, 230, 230)';
const DARK_TEXT = 'rgb(20, 20, 20)';
const CLEAR = 'rgba(0, 0, 0, 0)';

function page({ rootBg = CLEAR, rootColor = DARK_TEXT, scheme = 'normal', filter = 'none', bodyBg = CLEAR, samples = [] } = {}) {
  return { root: { bg: rootBg, color: rootColor, scheme, filter }, body: { bg: bodyBg }, samples };
}

test('parseColor rgb and rgba', () => {
  assert.deepEqual(parseColor('rgb(0, 0, 0)'), { r: 0, g: 0, b: 0, a: 1 });
  assert.deepEqual(parseColor('rgba(1, 2, 3, 0.5)'), { r: 1, g: 2, b: 3, a: 0.5 });
  assert.deepEqual(parseColor('rgb(1 2 3 / 0.5)'), { r: 1, g: 2, b: 3, a: 0.5 });
  assert.deepEqual(parseColor('rgb(1 2 3 / 50%)'), { r: 1, g: 2, b: 3, a: 0.5 });
  assert.deepEqual(parseColor('transparent'), { r: 0, g: 0, b: 0, a: 0 });
  assert.equal(parseColor(''), null);
  assert.equal(parseColor('rgb(1 2)'), null);
  assert.equal(parseColor('hsl(0 0% 0%)'), null);
});

// Within one step of 255 of what Chromium draws for each.
const near = (color, [r, g, b, a = 1]) => {
  const parsed = parseColor(color);
  assert.ok(parsed, color);
  for (const [got, want] of [[parsed.r, r], [parsed.g, g], [parsed.b, b]]) assert.ok(Math.abs(got - want) <= 1, `${color}: ${JSON.stringify(parsed)}`);
  assert.ok(Math.abs(parsed.a - a) < 1e-9, color);
};

test('parseColor reads the spaces computed colors come in', () => {
  near('oklch(0.985 0.002 247.839)', [249, 250, 251]); // Tailwind 4 gray-50
  near('oklch(0.21 0.034 264.665)', [16, 24, 40]); // Tailwind 4 gray-900
  near('oklch(0.2 none 260 / 0.5)', [22, 22, 22, 0.5]);
  near('oklab(0.299998 0.0000136703 0.00000602603)', [46, 46, 46]);
  near('lab(20 5 -10)', [50, 46, 63]);
  near('lch(20 10 260)', [39, 49, 63]);
  near('color(srgb 0.3 0.3 0.3)', [77, 77, 77]);
  near('color(srgb-linear 0.5 0.5 0.5)', [188, 188, 188]);
  near('color(display-p3 1 1 1)', [255, 255, 255]);
  near('color(xyz-d50 0.9642 1 0.8251)', [255, 255, 255]);
  near('color(rec2020 0 0 0 / 25%)', [0, 0, 0, 0.25]);
  assert.equal(parseColor('color(unknown 0 0 0)'), null);
});

test('lightness follows the sRGB weights', () => {
  assert.ok(Math.abs(lightness(255, 255, 255) - 1) < 1e-9);
  assert.equal(lightness(0, 0, 0), 0);
  assert.ok(Math.abs(lightness(0, 255, 0) - 0.7152) < 1e-9);
});

test('meta scheme strict only', () => {
  assert.equal(schemeFromMeta('dark'), 'dark');
  assert.equal(schemeFromMeta(' Only Dark '), 'dark');
  assert.equal(schemeFromMeta('only light'), 'light');
  assert.equal(schemeFromMeta('light'), 'light');
  assert.equal(schemeFromMeta('light dark'), null);
  assert.equal(schemeFromMeta(''), null);
});

test('white sample means light', () => {
  assert.equal(isDarkFromSamples(page({ rootBg: DARK, samples: [{ bg: WHITE, color: DARK_TEXT }] })), false);
});

test('opaque dark samples and dark root means dark', () => {
  assert.equal(isDarkFromSamples(page({ rootBg: DARK, samples: [{ bg: DARK, color: LIGHT_TEXT }] })), true);
});

test('transparent sample with dark text means light', () => {
  assert.equal(isDarkFromSamples(page({ rootBg: DARK, samples: [{ bg: CLEAR, color: DARK_TEXT }] })), false);
});

test('transparent sample with light text defers to root', () => {
  assert.equal(isDarkFromSamples(page({ rootBg: DARK, samples: [{ bg: CLEAR, color: LIGHT_TEXT }] })), true);
});

test('root scheme dark or invert filter means dark', () => {
  assert.equal(isDarkFromSamples(page({ rootBg: WHITE, scheme: 'dark' })), true);
  assert.equal(isDarkFromSamples(page({ rootBg: WHITE, filter: 'invert(1) hue-rotate(180deg)' })), true);
});

test('html and body blend under 0.5 means dark', () => {
  assert.equal(isDarkFromSamples(page({ rootBg: WHITE, bodyBg: DARK })), true);
  assert.equal(isDarkFromSamples(page({ rootBg: DARK, bodyBg: 'rgba(255, 255, 255, 0.9)' })), false);
  assert.equal(isDarkFromSamples(page({ rootBg: DARK, bodyBg: 'rgba(255, 255, 255, 0.2)' })), true);
});

test('both transparent falls back to root text color', () => {
  assert.equal(isDarkFromSamples(page({ rootColor: LIGHT_TEXT })), true);
  assert.equal(isDarkFromSamples(page({ rootColor: DARK_TEXT })), false);
});

test('a missing body counts as transparent', () => {
  assert.equal(isDarkFromSamples({ ...page({ rootBg: DARK }), body: null }), true);
});

test('unparseable sample means light', () => {
  assert.equal(isDarkFromSamples(page({ rootBg: DARK, samples: [{ bg: 'hsl(0 0% 0%)', color: LIGHT_TEXT }] })), false);
});

test('pure black is a dark theme like any other', () => {
  // Dark Reader's sheets are off while sampling, so black is the page's own (X, OLED themes).
  assert.equal(isDarkFromSamples(page({ rootBg: 'rgb(0, 0, 0)', samples: [{ bg: 'rgb(0, 0, 0)', color: LIGHT_TEXT }] })), true);
});

test('a dark theme in oklch is seen', () => {
  const dark = 'oklch(0.21 0.034 264.665)';
  assert.equal(isDarkFromSamples(page({ rootBg: dark, samples: [{ bg: dark, color: 'oklch(0.985 0.002 247.839)' }] })), true);
  assert.equal(isDarkFromSamples(page({ rootBg: 'oklch(1 0 0)', samples: [{ bg: 'oklch(0.985 0.002 247.839)', color: dark }] })), false);
});

test('color-scheme only dark counts, light dark does not', () => {
  assert.equal(isDarkFromSamples(page({ rootBg: WHITE, scheme: 'only dark' })), true);
  assert.equal(isDarkFromSamples(page({ rootBg: WHITE, scheme: 'light dark' })), false);
});

test('darkReaderSheets finds its style elements and its adopted overrides', () => {
  const classes = (...names) => ({ classList: { contains: (c) => names.includes(c) } });
  const mine = { ownerNode: classes('darkreader', 'darkreader--sync') };
  const page = { ownerNode: classes() };
  const override = { cssRules: [{ selectorText: '#__darkreader__adoptedOverride' }] };
  const pageAdopted = { cssRules: [{ selectorText: 'body' }] };
  const emptyAdopted = { cssRules: [] };
  const doc = { styleSheets: [mine, page], adoptedStyleSheets: [pageAdopted, override, emptyAdopted] };
  assert.deepEqual(darkReaderSheets(doc), [mine, override]);
});

test('darkReaderSheets copes without adoptedStyleSheets', () => {
  assert.deepEqual(darkReaderSheets({ styleSheets: [] }), []);
});

test('darkReaderSheets reads a shadow root as well as a document', () => {
  const mine = { ownerNode: { classList: { contains: (c) => c === 'darkreader' } } };
  assert.deepEqual(darkReaderSheets({ styleSheets: [mine], adoptedStyleSheets: [] }), [mine]);
});

test('themeChanged: theme classes and attributes on html or body', () => {
  const change = (name, oldValue, value) => [{ name, oldValue, value }];
  assert.equal(themeChanged(change('class', 'a b', 'a b dark')), true);
  assert.equal(themeChanged(change('class', 'skin-theme-clientpref-day', 'skin-theme-clientpref-night')), true);
  assert.equal(themeChanged(change('class', 'a', 'a modal-open')), false);
  assert.equal(themeChanged(change('class', 'dark x', 'x dark')), false);
  assert.equal(themeChanged(change('dark', null, '')), true);
  assert.equal(themeChanged(change('data-color-mode', 'light', 'dark')), true);
  assert.equal(themeChanged(change('data-bs-theme', null, 'dark')), true);
  assert.equal(themeChanged(change('data-page', 'home', 'about')), false);
  assert.equal(themeChanged(change('aria-busy', 'true', 'false')), false);
});

test('themeChanged: a new background or color-scheme in the style, not other declarations', () => {
  const style = (oldValue, value) => [{ name: 'style', oldValue, value }];
  assert.equal(themeChanged(style('background-color: rgb(255, 255, 255);', 'background-color: rgb(0, 0, 0);')), true);
  assert.equal(themeChanged(style('', 'color-scheme: dark;')), true);
  assert.equal(themeChanged(style('background-color: #fff;', 'background-color: #fff; overflow: hidden;')), false);
  assert.equal(themeChanged(style('color: red', 'color: red; --darkreader-inline-bgcolor: #000;')), false);
});

test("themeChanged ignores Dark Reader's and the detector's own attributes", () => {
  assert.equal(themeChanged([{ name: 'data-darkreader-mode', oldValue: null, value: 'dynamic' }]), false);
  assert.equal(themeChanged([{ name: 'data-darkreader-scheme', oldValue: null, value: 'dark' }]), false);
  assert.equal(themeChanged([{ name: 'data-sobrio-still', oldValue: null, value: '' }]), false);
});

const DAY = 24 * 3600 * 1000;

test('seenLight: a host seen light today under the same scheme', () => {
  const seen = { 'a.com': { scheme: 'light', at: 1000 } };
  assert.equal(seenLight(seen, 'a.com', 'light', 1000 + DAY - 1), true);
  assert.equal(seenLight(seen, 'a.com', 'light', 1000 + DAY), false, 'a day later it is looked at again');
  assert.equal(seenLight(seen, 'a.com', 'dark', 2000), false, 'the system turned dark since');
  assert.equal(seenLight(seen, 'b.com', 'light', 2000), false);
  assert.equal(seenLight(seen, 'a.com', 'light', 500), false, 'a date from the future');
  assert.equal(seenLight(undefined, 'a.com', 'light', 2000), false);
  assert.equal(seenLight('junk', 'a.com', 'light', 2000), false);
});

test('withSeenLight adds and refreshes light hosts, drops dark ones and keeps the newest', () => {
  const seen = { 'a.com': { scheme: 'light', at: 1 }, 'b.com': { scheme: 'dark', at: 2 }, bad: null };
  assert.deepEqual(withSeenLight(seen, 'c.com', true, 'light', 3), {
    'c.com': { scheme: 'light', at: 3 }, 'b.com': { scheme: 'dark', at: 2 }, 'a.com': { scheme: 'light', at: 1 },
  });
  assert.deepEqual(withSeenLight(seen, 'a.com', true, 'dark', 5)['a.com'], { scheme: 'dark', at: 5 });
  assert.deepEqual(Object.keys(withSeenLight(seen, 'a.com', false, 'light', 5)), ['b.com']);
  assert.deepEqual(Object.keys(withSeenLight(seen, 'c.com', true, 'light', 3, 2)), ['c.com', 'b.com']);
  assert.deepEqual(withSeenLight(undefined, 'c.com', true, 'light', 3), { 'c.com': { scheme: 'light', at: 3 } });
});

// RGBA pixels from [r, g, b, a] quadruples.
const pixels = (...colors) => new Uint8ClampedArray(colors.flat());
const many = (count, color) => Array.from({ length: count }, () => color);

test('isPhoto: a light opaque image with dark parts or color is a photo', () => {
  assert.equal(isPhoto(pixels(...many(8, [240, 238, 235, 255]), [40, 40, 40, 255], [60, 50, 40, 255])), true);
  assert.equal(isPhoto(pixels(...many(9, [250, 200, 210, 255]), [190, 225, 250, 255])), true, 'pastel color');
});

test('isPhoto: textures, gradients and solids stay with Dark Reader', () => {
  assert.equal(isPhoto(pixels(...many(10, [255, 255, 255, 255]))), false, 'solid');
  assert.equal(isPhoto(pixels([230, 230, 230, 255], [245, 245, 245, 255], [238, 238, 238, 255], [250, 250, 250, 255])), false, 'light gray noise');
});

test('isPhoto: icons with clear pixels, dark images and nothing at all are not photos', () => {
  assert.equal(isPhoto(pixels(...many(5, [0, 0, 0, 0]), ...many(5, [250, 250, 250, 255]))), false, 'transparent');
  assert.equal(isPhoto(pixels(...many(8, [30, 30, 30, 255]), [250, 250, 250, 255], [200, 100, 50, 255])), false, 'dark');
  assert.equal(isPhoto(new Uint8ClampedArray(0)), false);
});

test('isDarkIcon: dark marks on a clear background, as Dark Reader inverts them', () => {
  assert.equal(isDarkIcon(pixels(...many(6, [0, 0, 0, 0]), ...many(4, [20, 20, 20, 255]))), true);
  assert.equal(isDarkIcon(pixels(...many(6, [0, 0, 0, 0]), ...many(4, [240, 240, 240, 255]))), false, 'light icon');
  assert.equal(isDarkIcon(pixels(...many(10, [20, 20, 20, 255]))), false, 'no clear background');
  assert.equal(isDarkIcon(pixels(...many(10, [0, 0, 0, 0]))), false, 'nothing drawn');
  assert.equal(isDarkIcon(pixels(...many(6, [0, 0, 0, 0]), [20, 20, 20, 255], [250, 190, 0, 255], [66, 133, 244, 255], [52, 168, 83, 255])), false, 'colored logo');
});
