const test = require('node:test');
const assert = require('node:assert/strict');
const { makeBackup, readBackup, backupDetails, mergeSettings, DEFAULT_ANIM_OFF } = require('../settings.js');

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
  assert.equal('animOff' in backup, false); // not saved: the default stays a default
  assert.deepEqual(backup.stats, STORED.stats);
  assert.equal('theme' in backup, false);
});

test('reading a backup gives back what was saved', () => {
  const read = readBackup(JSON.stringify(makeBackup(STORED, '0.4.0', NOW)));
  assert.deepEqual(read.settings, mergeSettings(STORED.settings));
  assert.deepEqual(read.cssOff, ['news.ycombinator.com']);
  assert.deepEqual(read.darkOff, ['*.github.com']);
  assert.equal(read.animOff, undefined);
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
  // Memory is only looked up and shown as text, never opened: any address is kept; a bad count is not.
  assert.deepEqual(Object.keys(read.stats).sort(), ['https://a.example/', 'https://c.example/', 'javascript:alert(1)']);
  assert.equal(read.stats['https://c.example/'].title.length, 200);
});

test('a backup is held to sane sizes: lists, rules, locales and memory', () => {
  const many = (n, f) => Array.from({ length: n }, (_, i) => f(i));
  const now = Date.now();
  const read = readBackup(JSON.stringify({
    sobrio: 1,
    settings: {
      speed: { rules: many(1000, (i) => ({ pattern: `s${i}.example`, speed: 1.5 })) },
      newtab: { locales: many(100000, () => 'fr') },
    },
    cssOff: many(2000, (i) => `c${i}.example`),
    darkOff: many(2000, (i) => `d${i}.example`),
    animOff: many(2000, (i) => `a${i}.example`),
    stats: {
      'https://ok.example/': { count: 3, last: now - 1000, title: 'ok' },
      'chrome://settings/': { count: 1, last: now - 1000, title: 'kept: any page the switcher opened' },
      [`https://long.example/${'x'.repeat(3000)}`]: { count: 1, last: now, title: 'too long' },
      'https://huge.example/': { count: 1e9, last: now, title: 'count too big' },
      'https://future.example/': { count: 1, last: 1e300, title: 'from the future' },
      'https://past.example/': { count: 1, last: -5, title: 'before 1970' },
    },
  }));
  assert.equal(read.cssOff.length, 500);
  assert.equal(read.darkOff.length, 500);
  assert.equal(read.animOff.length, 500);
  assert.equal(read.settings.speed.rules.length, 200);
  assert.deepEqual(read.settings.newtab.locales, ['fr']);
  assert.deepEqual(Object.keys(read.stats).sort(), ['chrome://settings/', 'https://ok.example/']);
});

test('export keeps animOff only when it was saved, so a round trip does not freeze the default', () => {
  assert.equal('animOff' in makeBackup({ settings: {} }, '0.4.0', NOW), false);
  assert.deepEqual(makeBackup({ animOff: [] }, '0.4.0', NOW).animOff, []);
});

test('backupDetails names what an import would run: CSS hosts, engines, shortcut addresses', () => {
  const backup = readBackup(JSON.stringify({
    sobrio: 1,
    settings: {
      css: { custom: '@import url("https://collector.example/x.css");\nbody { background: url(//img.example/a.png) }\np { color: red }' },
      switcher: { customEngines: [{ id: 'custom-a', name: 'Spy', url: 'https://spy.example/?q=%s' }], defaultEngine: 'custom-a' },
      shortcuts: [
        { keys: 'Ctrl+Shift+F', action: 'openUrl', param: 'https://phish.example/login' },
        { keys: 'Ctrl+Shift+Y', action: 'toggleDark' },
      ],
    },
  }));
  assert.deepEqual(backupDetails(backup), {
    cssLength: backup.settings.css.custom.length,
    cssHosts: ['collector.example', 'img.example'],
    engines: [{ name: 'Spy', host: 'spy.example', isDefault: true }],
    addresses: [{ keys: 'Ctrl+Shift+F', host: 'phish.example' }],
  });
});
