const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCss, customCss, youtubeHost } = require('../style.js');
const { DEFAULTS } = require('../settings.js');

const ALL_OFF = Object.fromEntries(Object.keys(DEFAULTS.css).map((key) => [key, false]));
const V01 = ['corners', 'shadows', 'blur', 'animations', 'youtubePlayer', 'smoothScroll', 'thinScrollbars', 'fixedBackgrounds'];
const ALL_ON = { ...ALL_OFF, ...Object.fromEntries(V01.map((key) => [key, true])) };
const only = (key, extra = {}) => ({ ...ALL_OFF, [key]: true, ...extra });

test('the v0.1 switches together are the v0.1 stylesheet', () => {
  const css = buildCss(ALL_ON, null, 'www.youtube.com');
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
    'scrollbar-width: thin !important',
  ]) {
    assert.ok(css.includes(piece), piece);
  }
});

test('the defaults: no scrollbars, underlined links, selectable text, no forced capitals', () => {
  const css = buildCss(DEFAULTS.css, null);
  for (const piece of ['scrollbar-width: none', 'text-decoration: underline', 'user-select: text', 'text-transform: none']) {
    assert.ok(css.includes(piece), piece);
  }
  for (const piece of ['scrollbar-width: thin', 'grayscale', ':focus-visible']) assert.ok(!css.includes(piece), piece);
});

test('transitions are left to page.js: a duration on every element makes every change a transition', () => {
  assert.ok(!buildCss({ ...ALL_ON, animations: true }, null).includes('transition'));
});

test('all off is empty', () => {
  assert.equal(buildCss(ALL_OFF, null), '');
});

test('each switch brings only its own rules', () => {
  const cases = {
    corners: ['border-radius'],
    shadows: ['box-shadow', 'text-shadow'],
    blur: ['backdrop-filter'],
    animations: ['animation-duration', 'animation-iteration-count'],
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
  const css = buildCss(only('animations'), null, 'www.youtube.com');
  assert.ok(!css.includes('movie_player'));
  assert.ok(buildCss(only('animations', { youtubePlayer: true }), null, 'www.youtube.com').includes('#movie_player'));
});

test("the YouTube exception goes in only on YouTube and its embeds: elsewhere it only slows restyles", () => {
  const css = (host) => buildCss(only('animations', { youtubePlayer: true }), null, host);
  for (const host of ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'music.youtube.com', 'www.youtube-nocookie.com']) {
    assert.ok(css(host).includes('#movie_player'), host);
  }
  for (const host of ['github.com', 'notyoutube.com', 'youtube.com.evil.test', '', undefined]) {
    assert.ok(!css(host).includes('#movie_player'), String(host));
    assert.ok(css(host).includes('*::after'), String(host));
  }
  assert.equal(youtubeHost('www.youtube.com'), true);
  assert.equal(youtubeHost('example.com'), false);
});

test('the YouTube exception alone adds nothing', () => {
  assert.equal(buildCss(only('youtubePlayer'), null), '');
});

test('--sobrio-corners from the theme hook wins over the switch', () => {
  assert.ok(buildCss(ALL_OFF, { corners: 'square' }).includes('border-radius: 0'));
  assert.ok(!buildCss(ALL_ON, { corners: 'round' }).includes('border-radius'));
  assert.ok(buildCss(ALL_ON, { text: '#ffffff' }).includes('border-radius: 0'));
});

test('v0.3 switches bring their own rules', () => {
  const cases = {
    hideScrollbars: 'scrollbar-width: none !important',
    underlineLinks: 'text-decoration: underline !important',
    selectableText: 'user-select: text !important',
    noUppercase: 'text-transform: none !important',
    grayscaleMedia: 'filter: grayscale(1) !important',
    focusRing: 'outline: 2px solid currentColor !important',
  };
  for (const [key, rule] of Object.entries(cases)) {
    assert.ok(buildCss(only(key), null).includes(rule), key);
    assert.ok(!buildCss(ALL_OFF, null).includes(rule), key);
  }
  assert.ok(buildCss(only('focusRing'), null).includes(':focus-visible'));
  assert.ok(buildCss(only('underlineLinks'), null).includes('a[href]'));
});

test('hidden scrollbars win over thin ones', () => {
  const css = buildCss({ ...ALL_OFF, thinScrollbars: true, hideScrollbars: true }, null);
  assert.ok(css.includes('scrollbar-width: none'));
  assert.ok(!css.includes('scrollbar-width: thin'));
});

test('the custom snippet is not part of sobrio\'s sheet: it gets a sheet of its own', () => {
  assert.equal(buildCss({ ...ALL_OFF, custom: 'p { color: red; }' }, null), '');
  assert.ok(!buildCss({ ...ALL_ON, custom: '@import url(x.css);' }, null).includes('@import'));
});

test('customCss: the snippet as written, nothing for blanks', () => {
  assert.equal(customCss({ custom: 'p { color: red; }' }), 'p { color: red; }');
  assert.equal(customCss({ custom: '@import url(x.css);\np {}' }), '@import url(x.css);\np {}');
  assert.equal(customCss({ custom: '   ' }), '');
  assert.equal(customCss({ custom: 3 }), '');
  assert.equal(customCss({}), '');
});

test('sobrio\'s sheet is balanced, so a broken snippet in its own sheet cannot reach it', () => {
  const clean = buildCss(ALL_ON, null);
  assert.equal(clean.split('{').length, clean.split('}').length);
});
