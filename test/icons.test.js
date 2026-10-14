const test = require('node:test');
const assert = require('node:assert/strict');
const { ICONS, ISOTYPE } = require('../icons.js');

test('every settings tab and the switcher have an icon', () => {
  for (const name of ['style', 'dark', 'exceptions', 'switcher', 'shortcuts', 'newtab', 'media', 'stats', 'bookmark']) {
    assert.ok(Array.isArray(ICONS[name]) && ICONS[name].length, name);
  }
});

test('icons are drawn inside the 24 grid with plain shapes only', () => {
  for (const [name, parts] of Object.entries(ICONS)) {
    for (const [tag, attrs] of parts) {
      assert.ok(['path', 'rect'].includes(tag), `${name}: ${tag}`);
      const numbers = tag === 'rect'
        ? [attrs.x, attrs.y, attrs.x + attrs.width, attrs.y + attrs.height]
        : attrs.d.match(/-?\d+(\.\d+)?/g).map(Number);
      assert.ok(numbers.every((n) => n >= 0 && n <= 24), `${name}: ${numbers}`);
      // Nothing round: no arcs or curves in a path.
      if (tag === 'path') assert.ok(!/[aAcCqQsStT]/.test(attrs.d), `${name}: ${attrs.d}`);
    }
  }
});

test('the isotype: a 16 square with a 3 dot, 3 from the edges', () => {
  assert.equal(ISOTYPE, 'M0 0H16V16H0Z M10 10V13H13V10Z');
});
