const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ENGINES,
  flattenBookmarks,
  searchBookmarks,
  modes,
  nextMode,
  autoMode,
  engineById,
  allEngines,
  parseCommand,
  commandsAllowed,
  searchUrl,
  displayTitle,
  shortUrl,
  hostLength,
  siteHost,
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

test('a word inside the title beats letters scattered from the left', () => {
  const r = searchBookmarks(
    [bm('Rapid prototyping notes', 'https://a.dev/', '', 1), bm('Stripe Payments: API reference', 'https://b.dev/', '', 0)],
    'api',
  );
  assert.equal(r[0].bookmark.title, 'Stripe Payments: API reference');
  assert.deepEqual(r[0].hits.title, [17, 18, 19]);
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

test('a title that is the whole query comes first, over newer ones and the memory', () => {
  const g = bm('g', 'https://chatgpt.com/', '', 1);
  const git = bm('git', 'https://github.com/', '', 2);
  const gmail = bm('gmail', 'https://mail.google.com/', '', 3);
  const boost = (b) => (b === gmail ? 40 : 0);
  assert.equal(searchBookmarks([g, git, gmail], 'g', 50, 'normal', boost)[0].bookmark, g);
  assert.equal(searchBookmarks([bm('Rust  Book'), bm('Rust Book notes', undefined, '', 9)], ' rust book ')[0].bookmark.title, 'Rust  Book');
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

test('5k realistic bookmarks: under 40 ms per keystroke once loaded', () => {
  const words = ['react', 'hooks', 'rust', 'ownership', 'design', 'system', 'notes', 'guide', 'api', 'reference',
    'docs', 'video', 'music', 'recipe', 'travel', 'photo', 'font', 'color', 'grid', 'layout'];
  const pick = (i, n) => Array.from({ length: n }, (_, k) => words[(i * 7 + k * 13) % words.length]).join(' ');
  const list = Array.from({ length: 5000 }, (_, i) => bm(
    `${pick(i, 6)} ${i}`,
    `https://www.${words[i % 20]}-site${i}.com/path/to/${pick(i + 3, 3).replace(/ /g, '/')}?q=${i}`,
    `Dev / ${words[i % 7]} / ${words[i % 5]}`,
    i,
  ));
  searchBookmarks(list, 'warm');
  const start = performance.now();
  for (const q of ['re', 'rea', 'reac', 'react', 'react h']) searchBookmarks(list, q);
  assert.ok((performance.now() - start) / 5 < 40);
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

test('engines in the spec order, with ids', () => {
  assert.deepEqual(ENGINES.map((e) => e.name), ['Google', 'DuckDuckGo', 'YouTube', 'Wikipedia', 'GitHub']);
  assert.deepEqual(ENGINES.map((e) => e.id), ['google', 'duckduckgo', 'youtube', 'wikipedia', 'github']);
  assert.equal(engineById('youtube').name, 'YouTube');
  assert.equal(engineById('bookmarks'), undefined);
});

const ALL = { bookmarks: true, engines: { google: true, duckduckgo: true, youtube: true, wikipedia: true, github: true } };
const ALL_MODES = ['bookmarks', 'google', 'duckduckgo', 'youtube', 'wikipedia', 'github'];

test('modes: bookmarks then the engines that are on, in order', () => {
  assert.deepEqual(modes(ALL), ALL_MODES);
  assert.deepEqual(modes({ bookmarks: false, engines: { ...ALL.engines, google: false } }),
    ['duckduckgo', 'youtube', 'wikipedia', 'github']);
  assert.deepEqual(modes({ ...ALL, defaultEngine: 'youtube' }),
    ['bookmarks', 'youtube', 'google', 'duckduckgo', 'wikipedia', 'github']);
});

test('modes: everything off still leaves bookmarks', () => {
  assert.deepEqual(modes({ bookmarks: false, engines: {} }), ['bookmarks']);
});

test('nextMode cycles both ways over the modes that are on', () => {
  assert.equal(nextMode(ALL_MODES, 'github', 1), 'bookmarks');
  assert.equal(nextMode(ALL_MODES, 'bookmarks', -1), 'github');
  assert.equal(nextMode(ALL_MODES, 'bookmarks', 1), 'google');
  assert.equal(nextMode(['bookmarks', 'youtube'], 'youtube', 1), 'bookmarks');
  assert.equal(nextMode(['bookmarks', 'youtube'], 'google', 1), 'bookmarks');
});

test('autoMode jumps to the first engine that is on when nothing matches', () => {
  assert.deepEqual(autoMode({ mode: 'bookmarks', manual: false }, 'zzz', false, ALL_MODES, true), { mode: 'google', manual: false });
  assert.deepEqual(autoMode({ mode: 'bookmarks', manual: false }, 'zzz', false, ['bookmarks', 'youtube'], true), { mode: 'youtube', manual: false });
});

test('autoMode returns to bookmarks when matches come back', () => {
  assert.deepEqual(autoMode({ mode: 'google', manual: false }, 'ru', true, ALL_MODES, true), { mode: 'bookmarks', manual: false });
});

test('autoMode keeps manual mode', () => {
  assert.deepEqual(autoMode({ mode: 'youtube', manual: true }, 'zzz', true, ALL_MODES, true), { mode: 'youtube', manual: true });
});

test('autoMode blank query stays in bookmarks', () => {
  assert.deepEqual(autoMode({ mode: 'google', manual: false }, '  ', false, ALL_MODES, true), { mode: 'bookmarks', manual: false });
});

test('autoMode with autoSearch off never jumps', () => {
  assert.deepEqual(autoMode({ mode: 'bookmarks', manual: false }, 'zzz', false, ALL_MODES, false), { mode: 'bookmarks', manual: false });
});

test('autoMode without bookmarks starts on the first engine', () => {
  const engines = ['google', 'github'];
  assert.deepEqual(autoMode({ mode: 'bookmarks', manual: false }, '', false, engines, true), { mode: 'google', manual: false });
  assert.deepEqual(autoMode({ mode: 'bookmarks', manual: false }, 'x', false, engines, false), { mode: 'google', manual: false });
});

test('autoMode with only bookmarks has nowhere to jump', () => {
  assert.deepEqual(autoMode({ mode: 'bookmarks', manual: false }, 'zzz', false, ['bookmarks'], true), { mode: 'bookmarks', manual: false });
});

test('parseCommand exact only', () => {
  assert.equal(parseCommand(' TD '), 'dark');
  assert.equal(parseCommand('ta'), 'css');
  assert.equal(parseCommand('Settings'), 'settings');
  assert.equal(parseCommand('ajustes'), null);
  assert.equal(parseCommand(' options '), 'settings');
  assert.equal(parseCommand('tda'), null);
  assert.equal(parseCommand('t d'), null);
  assert.equal(parseCommand('setting'), null);
  assert.equal(parseCommand('constructor'), null);
  assert.equal(parseCommand('toString'), null);
  assert.equal(parseCommand(''), null);
});

test('commandsAllowed needs a hostname', () => {
  assert.equal(commandsAllowed(''), false);
  assert.equal(commandsAllowed('github.com'), true);
});

test('searchUrl encodes', () => {
  assert.equal(searchUrl(engineById('google'), 'a&b #c ñ'), 'https://www.google.com/search?q=a%26b%20%23c%20%C3%B1');
  assert.equal(searchUrl(engineById('duckduckgo'), '  rust  '), 'https://duckduckgo.com/?q=rust');
});

const SEARX = { id: 'custom-a1', name: 'SearXNG', url: 'https://search.example.com/search?q=%s' };

test('custom engines come after the built-in ones, and can be the default', () => {
  const switcher = { ...ALL, customEngines: [SEARX] };
  assert.deepEqual(allEngines(switcher).map((e) => e.id), ['google', 'duckduckgo', 'youtube', 'wikipedia', 'github', 'custom-a1']);
  assert.deepEqual(modes({ ...switcher, defaultEngine: 'custom-a1' }).slice(0, 3), ['bookmarks', 'custom-a1', 'google']);
  assert.equal(engineById('custom-a1', switcher).name, 'SearXNG');
  assert.equal(searchUrl(engineById('custom-a1', switcher), 'rust book'), 'https://search.example.com/search?q=rust%20book');
});

test('a default engine that is off does not lead the cycle', () => {
  assert.deepEqual(modes({ ...ALL, engines: { ...ALL.engines, youtube: false }, defaultEngine: 'youtube' }),
    ['bookmarks', 'google', 'duckduckgo', 'wikipedia', 'github']);
});

const LONG = bm('clasesentrenamientoguillecolladonatacionsabados', 'https://example.com/clases');

test('normal precision: letters strewn across a long word do not match', () => {
  assert.deepEqual(searchBookmarks([LONG], 'satanas', 50, 'normal'), []);
  assert.equal(searchBookmarks([LONG], 'satanas', 50, 'loose').length, 1);
});

test('normal precision still forgives a few skipped letters', () => {
  assert.equal(searchBookmarks([bm('Rust Book: Ownership', 'https://a.dev/')], 'rbo', 50, 'normal').length, 1);
  assert.equal(searchBookmarks([bm('GitHub', 'https://a.dev/')], 'gthb', 50, 'normal').length, 1);
});

test('normal is the default precision', () => {
  assert.deepEqual(searchBookmarks([LONG], 'satanas'), []);
});

test('strict precision: each word must appear as it is written', () => {
  const book = bm('Rust Book: Ownership', 'https://a.dev/');
  assert.equal(searchBookmarks([book], 'own rust', 50, 'strict').length, 1);
  assert.equal(searchBookmarks([book], 'rbo', 50, 'strict').length, 0);
  assert.deepEqual(searchBookmarks([book], 'book', 50, 'strict')[0].hits.title, [5, 6, 7, 8]);
  assert.equal(searchBookmarks([bm('Canción Única', 'https://a.dev/')], 'cancion', 50, 'strict').length, 1);
});

test('strict precision: a word split between title and folder does not match', () => {
  const book = bm('Rust Book', 'https://doc.rust-lang.org/', 'docs');
  assert.equal(searchBookmarks([book], 'bookdocs', 50, 'strict').length, 0);
  assert.equal(searchBookmarks([book], 'book docs', 50, 'strict').length, 1);
});

test('memory: a page opened often rises among similar matches', () => {
  const often = bm('Rust Book', 'https://often.dev/', '', 1);
  const rare = bm('Rust Blog', 'https://rare.dev/', '', 2);
  const boost = (b) => (b === often ? 16 : 0);
  assert.equal(searchBookmarks([often, rare], 'rust', 50, 'normal')[0].bookmark, rare);
  assert.equal(searchBookmarks([often, rare], 'rust', 50, 'normal', boost)[0].bookmark, often);
});

test('memory never lifts a url-only match over a title match', () => {
  const titled = bm('Rust', 'https://a.dev/', '', 1);
  const urlOnly = bm('Other', 'https://x.dev/rust', '', 2);
  const boost = (b) => (b === urlOnly ? 40 : 0);
  assert.equal(searchBookmarks([titled, urlOnly], 'rust', 50, 'normal', boost)[0].bookmark, titled);
});

test('memory: with an empty query the most used come first', () => {
  const list = many(5);
  const boost = (b) => (b === list[1] ? 10 : 0);
  assert.equal(searchBookmarks(list, '', 50, 'normal', boost)[0].bookmark, list[1]);
});

test('hostLength: where the host ends in a short url', () => {
  assert.equal(hostLength('dash.cloudflare.com/'), 19);
  assert.equal(hostLength('github.com/donutinit?tab=repositories'), 10);
  assert.equal(hostLength('localhost:8080/x'), 14);
  assert.equal(hostLength('about:addons'), 12);
  assert.equal(hostLength('example.com?q=1'), 11);
  assert.equal(hostLength('example.com#top'), 11);
});

test('parseCommand with names of your own', () => {
  const names = { dark: 'oscuro', css: 'css', settings: 'ajustes' };
  assert.equal(parseCommand(' Oscuro ', names), 'dark');
  assert.equal(parseCommand('css', names), 'css');
  assert.equal(parseCommand('ajustes', names), 'settings');
  assert.equal(parseCommand('td', names), null);
  assert.equal(parseCommand('settings', names), null);
  // options stays a way to the settings unless a command of yours took the word.
  assert.equal(parseCommand('options', names), 'settings');
  assert.equal(parseCommand('options', { dark: 'options', css: 'ta', settings: 'settings' }), 'dark');
});

test('siteHost: the host of an http(s) page, else nothing', () => {
  assert.equal(siteHost('https://github.com/donutinit/sobrio'), 'github.com');
  assert.equal(siteHost('http://127.0.0.1:8765/a'), '127.0.0.1');
  assert.equal(siteHost('about:addons'), '');
  assert.equal(siteHost('moz-extension://abc/newtab.html'), '');
  assert.equal(siteHost('file:///home/a.html'), '');
  assert.equal(siteHost(undefined), '');
  assert.equal(siteHost('not a url'), '');
});
