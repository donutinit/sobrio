const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ENGINES,
  flattenBookmarks,
  searchBookmarks,
  nextMode,
  autoMode,
  parseCommand,
  commandsAllowed,
  searchUrl,
  displayTitle,
  shortUrl,
} = require('../match.js');

let nextId = 0;
function bm(title, url = `https://example.com/${nextId}`, folder = '', dateAdded = 0) {
  return { id: String(nextId++), title, url, folder, dateAdded };
}
function many(count) {
  return Array.from({ length: count }, (_, i) => bm(`Bookmark ${i}`, `https://site${i}.com/`, '', i));
}

test('subsequence in order, not contiguous', () => {
  const r = searchBookmarks([bm('Rust Book: Ownership', 'https://doc.rust-lang.org/book/ch04')], 'rbo');
  assert.equal(r.length, 1);
  assert.deepEqual(r[0].hits.title, [0, 5, 6]);
});

test('letters out of order do not match', () => {
  assert.equal(searchBookmarks([bm('Rust', 'https://a.dev/')], 'tsur').length, 0);
});

test('words in any order', () => {
  assert.equal(searchBookmarks([bm('Rust Book: Ownership', 'https://a.dev/')], 'ownership rust').length, 1);
});

test('every word must match', () => {
  assert.equal(searchBookmarks([bm('Rust Book', 'https://a.dev/')], 'rust zzz').length, 0);
});

test('title beats url', () => {
  const r = searchBookmarks([bm('Other', 'https://x.dev/rust'), bm('Rust', 'https://x.dev/a')], 'rust');
  assert.equal(r[0].bookmark.title, 'Rust');
});

test('folder beats url', () => {
  const r = searchBookmarks(
    [bm('One', 'https://x.dev/rust', 'Misc'), bm('Two', 'https://x.dev/a', 'Rust')],
    'rust',
  );
  assert.equal(r[0].bookmark.title, 'Two');
  assert.deepEqual(r[0].hits.folder, [0, 1, 2, 3]);
});

test('consecutive beats scattered', () => {
  const r = searchBookmarks([bm('oxwxnx', 'https://a.dev/'), bm('Ownership', 'https://b.dev/')], 'own');
  assert.equal(r[0].bookmark.title, 'Ownership');
});

test('word start beats middle', () => {
  const r = searchBookmarks([bm('Legit stuff', 'https://a.dev/'), bm('GitHub', 'https://b.dev/')], 'git');
  assert.equal(r[0].bookmark.title, 'GitHub');
});

test('tie goes to newest', () => {
  const r = searchBookmarks([bm('Rust', 'https://a.dev/', '', 1), bm('Rust', 'https://a.dev/', '', 2)], 'rust');
  assert.equal(r[0].bookmark.dateAdded, 2);
});

test('no match returns []', () => {
  assert.deepEqual(searchBookmarks([bm('Rust', 'https://a.dev/')], 'zzz'), []);
});

test('results are capped at 50', () => {
  assert.equal(searchBookmarks(many(80), 'bookmark').length, 50);
});

test('empty or blank query returns 20 newest', () => {
  const r = searchBookmarks(many(30), '   ');
  assert.equal(r.length, 20);
  assert.equal(r[0].bookmark.dateAdded, 29);
  assert.deepEqual(r[0].hits, { title: [], folder: [], url: [] });
});

test('empty title searchable by url and displayed as url', () => {
  const b = bm('', 'https://example.org/notes');
  assert.equal(searchBookmarks([b], 'notes').length, 1);
  assert.equal(displayTitle(b), 'https://example.org/notes');
});

test('url hits index into the short url', () => {
  const r = searchBookmarks([bm('Zed', 'https://www.rust-lang.org/')], 'lang');
  assert.equal(shortUrl(r[0].bookmark.url), 'rust-lang.org/');
  assert.deepEqual(r[0].hits.url, [5, 6, 7, 8]);
});

test('case and accents fold, hits map to original', () => {
  const r = searchBookmarks([bm('Canción Única', 'https://a.dev/')], 'cancion');
  assert.deepEqual(r[0].hits.title, [0, 1, 2, 3, 4, 5, 6]);
  assert.equal(searchBookmarks([bm('Canción Única', 'https://a.dev/')], 'UNICA').length, 1);
});

test('query with regex characters is literal', () => {
  assert.equal(searchBookmarks([bm('C++ (notes)', 'https://a.dev/')], 'c++ (').length, 1);
  assert.equal(searchBookmarks([bm('Cnotes', 'https://a.dev/')], '.*').length, 0);
});

test('10k bookmarks search under 200 ms', () => {
  const list = many(10000);
  const start = performance.now();
  searchBookmarks(list, 'bk 99');
  assert.ok(performance.now() - start < 200);
});

const toolbar = (children) => [{ id: '0', title: '', children: [{ id: '1', title: 'Bookmarks bar', children }] }];

test('flatten skips folders, separators, javascript:, place:, data:', () => {
  const list = flattenBookmarks(toolbar([
    { id: 'a', title: 'A', url: 'https://a.com/', dateAdded: 1 },
    { id: 'b', title: 'Bookmarklet', url: 'javascript:alert(1)', dateAdded: 2 },
    { id: 'c', title: 'Smart', url: 'place:sort=8', dateAdded: 3 },
    { id: 'd', title: '', url: 'data:', type: 'separator', dateAdded: 4 },
    { id: 'e', title: 'Empty folder', children: [], dateAdded: 5 },
  ]));
  assert.deepEqual(list.map((b) => b.id), ['a']);
});

test('flatten builds folder path without browser roots', () => {
  const list = flattenBookmarks(toolbar([
    { id: 'f', title: 'Dev', children: [
      { id: 'g', title: 'Rust', children: [{ id: 'h', title: 'Book', url: 'https://doc.rust-lang.org/', dateAdded: 7 }] },
    ] },
    { id: 'i', title: 'Top', url: 'https://top.com/', dateAdded: 8 },
  ]));
  assert.deepEqual(list, [
    { id: 'h', title: 'Book', url: 'https://doc.rust-lang.org/', folder: 'Dev / Rust', dateAdded: 7 },
    { id: 'i', title: 'Top', url: 'https://top.com/', folder: '', dateAdded: 8 },
  ]);
});

test('engines in the spec order', () => {
  assert.deepEqual(ENGINES.map((e) => e.name), ['DuckDuckGo', 'Google', 'YouTube', 'Wikipedia', 'GitHub']);
});

test('nextMode cycles both ways', () => {
  assert.equal(nextMode(5, 1), 0);
  assert.equal(nextMode(0, -1), 5);
  assert.equal(nextMode(0, 1), 1);
  assert.equal(nextMode(3, -1), 2);
});

test('autoMode jumps to first engine when nothing matches', () => {
  assert.deepEqual(autoMode({ mode: 0, manual: false }, 'zzz', false), { mode: 1, manual: false });
});

test('autoMode returns to bookmarks when matches come back', () => {
  assert.deepEqual(autoMode({ mode: 1, manual: false }, 'ru', true), { mode: 0, manual: false });
});

test('autoMode keeps manual mode', () => {
  assert.deepEqual(autoMode({ mode: 3, manual: true }, 'zzz', true), { mode: 3, manual: true });
});

test('autoMode blank query stays in bookmarks', () => {
  assert.deepEqual(autoMode({ mode: 1, manual: false }, '  ', false), { mode: 0, manual: false });
});

test('parseCommand exact only', () => {
  assert.equal(parseCommand(' TD '), 'dark');
  assert.equal(parseCommand('ta'), 'css');
  assert.equal(parseCommand('tda'), null);
  assert.equal(parseCommand('t d'), null);
  assert.equal(parseCommand(''), null);
});

test('commandsAllowed needs a hostname', () => {
  assert.equal(commandsAllowed(''), false);
  assert.equal(commandsAllowed('github.com'), true);
});

test('searchUrl encodes', () => {
  assert.equal(searchUrl(ENGINES[1], 'a&b #c ñ'), 'https://www.google.com/search?q=a%26b%20%23c%20%C3%B1');
  assert.equal(searchUrl(ENGINES[0], '  rust  '), 'https://duckduckgo.com/?q=rust');
});
