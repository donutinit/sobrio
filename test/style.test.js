const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCss } = require('../style.js');
const { DEFAULTS } = require('../settings.js');

const ALL_ON = DEFAULTS.css;
const ALL_OFF = Object.fromEntries(Object.keys(ALL_ON).map((key) => [key, false]));
const only = (key, extra = {}) => ({ ...ALL_OFF, [key]: true, ...extra });

test('all on is the v0.1 stylesheet', () => {
  const css = buildCss(ALL_ON, null);
  for (const piece of [
    'scroll-behavior: auto !important',
    'border-radius: 0 !important',
    'box-shadow: none !important',
    'text-shadow: none !important',
    'backdrop-filter: none !important',
    '-webkit-backdrop-filter: none !important',
    'background-attachment: scroll !important',
    '*:not(#movie_player, #movie_player *)::after',
    'animation-duration: .01ms !important',
    'animation-iteration-count: 1 !important',
    'transition-duration: .01ms !important',
    'transition-delay: 0s !important',
    'scrollbar-width: thin !important',
  ]) {
    assert.ok(css.includes(piece), piece);
  }
});

test('all off is empty', () => {
  assert.equal(buildCss(ALL_OFF, null), '');
});

test('each switch brings only its own rules', () => {
  const cases = {
    corners: ['border-radius'],
    shadows: ['box-shadow', 'text-shadow'],
    blur: ['backdrop-filter'],
    animations: ['animation-duration', 'transition-duration'],
    smoothScroll: ['scroll-behavior'],
    thinScrollbars: ['scrollbar-width'],
    fixedBackgrounds: ['background-attachment'],
  };
  const everything = Object.values(cases).flat();
  for (const [key, wanted] of Object.entries(cases)) {
    const css = buildCss(only(key), null);
    for (const word of everything) assert.equal(css.includes(word), wanted.includes(word), `${key}: ${word}`);
  }
});

test('animations without the YouTube exception cover every element', () => {
  const css = buildCss(only('animations'), null);
  assert.ok(!css.includes('movie_player'));
  assert.ok(buildCss(only('animations', { youtubePlayer: true }), null).includes('#movie_player'));
});

test('the YouTube exception alone adds nothing', () => {
  assert.equal(buildCss(only('youtubePlayer'), null), '');
});

test('--sobrio-corners from the theme hook wins over the switch', () => {
  assert.ok(buildCss(ALL_OFF, { corners: 'square' }).includes('border-radius: 0'));
  assert.ok(!buildCss(ALL_ON, { corners: 'round' }).includes('border-radius'));
  assert.ok(buildCss(ALL_ON, { text: '#ffffff' }).includes('border-radius: 0'));
});
