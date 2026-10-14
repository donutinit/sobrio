const test = require('node:test');
const assert = require('node:assert/strict');
const { siteState } = require('../boot.js');

test('no storage means everything on', () => {
  assert.deepEqual(siteState(undefined, 'a.com'), { dark: true, css: true });
  assert.deepEqual(siteState({}, 'a.com'), { dark: true, css: true });
});

test('lists apply by exact hostname', () => {
  const stored = { darkOff: ['github.com'], cssOff: [] };
  assert.deepEqual(siteState(stored, 'github.com'), { dark: false, css: true });
  assert.deepEqual(siteState(stored, 'gist.github.com'), { dark: true, css: true });
});

test('css list is independent', () => {
  assert.deepEqual(siteState({ cssOff: ['a.com'] }, 'a.com'), { dark: true, css: false });
});
