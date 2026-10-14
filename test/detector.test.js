const test = require('node:test');
const assert = require('node:assert/strict');
const { parseColor, lightness, schemeFromMeta, isDarkFromSamples, darkReaderSheets } = require('../detector.js');

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
  assert.equal(parseColor('color(srgb 1 0 0)'), null);
  assert.equal(parseColor(''), null);
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
  assert.equal(isDarkFromSamples(page({ rootBg: DARK, samples: [{ bg: 'color(srgb 0 0 0)', color: LIGHT_TEXT }] })), false);
});

test('pure black sample is inconclusive, so light', () => {
  // sobrio's own dark background: seeing it means Dark Reader's sheets were still applied.
  assert.equal(isDarkFromSamples(page({ rootBg: DARK, samples: [{ bg: 'rgb(0, 0, 0)', color: LIGHT_TEXT }] })), false);
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
