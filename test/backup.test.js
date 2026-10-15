const test = require('node:test');
const assert = require('node:assert/strict');
const { makeBackup, readBackup, mergeSettings, DEFAULT_ANIM_OFF } = require('../settings.js');

const NOW = new Date('2026-10-14T20:00:00Z');
const STORED = {
  settings: { css: { corners: false, custom: 'p {}' }, switcher: { commandNames: { dark: 'oscuro', css: 'ta', settings: 'settings' } } },
  cssOff: ['news.ycombinator.com'],
  darkOff: ['*.github.com'],
  stats: { 'https://doc.rust-lang.org/book/': { count: 4, last: 1760000000000, title: 'Rust' } },
  theme: { background: '#07090f' },
};

test('a backup holds the settings, the three lists and the memory, not the theme', () => {
  const backup = makeBackup(STORED, '0.4.0', NOW);
  assert.equal(backup.sobrio, 1);
  assert.equal(backup.version, '0.4.0');
  assert.equal(backup.exported, '2026-10-14T20:00:00.000Z');
  assert.deepEqual(backup.settings, mergeSettings(STORED.settings));
  assert.deepEqual(backup.cssOff, ['news.ycombinator.com']);
  assert.deepEqual(backup.darkOff, ['*.github.com']);
  assert.deepEqual(backup.animOff, DEFAULT_ANIM_OFF);
  assert.deepEqual(backup.stats, STORED.stats);
  assert.equal('theme' in backup, false);
});

test('reading a backup gives back what was saved', () => {
  const read = readBackup(JSON.stringify(makeBackup(STORED, '0.4.0', NOW)));
  assert.deepEqual(read.settings, mergeSettings(STORED.settings));
  assert.deepEqual(read.cssOff, ['news.ycombinator.com']);
  assert.deepEqual(read.darkOff, ['*.github.com']);
  assert.deepEqual(read.animOff, ['chatgpt.com']);
  assert.deepEqual(read.stats, STORED.stats);
});

test('not a backup: nothing', () => {
  for (const text of ['', 'nope', '[]', '{}', '{"sobrio": 2}', JSON.stringify({ settings: {} }), 'null']) {
    assert.equal(readBackup(text), null, text);
  }
});

test('every field is checked: the bad ones are dropped, the rest comes in', () => {
  const read = readBackup(JSON.stringify({
    sobrio: 1,
    settings: { css: { corners: 'yes', shadows: false }, dark: { brightness: 9000 } },
    cssOff: ['ok.example', 'not a host', 3, 'OK.example'],
    darkOff: 'junk',
    stats: {
      'https://a.example/': { count: 2, last: 5, title: 'A' },
      'javascript:alert(1)': { count: 1, last: 5, title: 'x' },
      'https://b.example/': { count: -1, last: 5, title: 'B' },
      'https://c.example/': { count: 1, last: 5, title: 'C'.repeat(500) },
    },
  }));
  assert.equal(read.settings.css.corners, true); // invalid: the default
  assert.equal(read.settings.css.shadows, false);
  assert.equal(read.settings.dark.brightness, 100);
  assert.deepEqual(read.cssOff, ['ok.example']);
  assert.deepEqual(read.darkOff, []);
  assert.equal(read.animOff, undefined); // missing: the default list stays
  assert.deepEqual(Object.keys(read.stats).sort(), ['https://a.example/', 'https://c.example/']);
  assert.equal(read.stats['https://c.example/'].title.length, 200);
});
