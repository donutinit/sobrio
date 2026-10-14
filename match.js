// Pure switcher logic: bookmark search, modes, engines and commands.
// A classic script so content scripts, the popup and the background can load it;
// node --test gets the same functions through module.exports.
(() => {
  const ENGINES = [
    { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=%s' },
    { id: 'wikipedia', name: 'Wikipedia', url: 'https://es.wikipedia.org/w/index.php?search=%s' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=%s' },
  ];
  const MAX_RESULTS = 50;
  const RECENT = 20;
  const WEIGHTS = { title: 3, folder: 2, url: 1 };
  const SKIPPED_SCHEMES = /^(javascript|place|data):/i;

  // One folded char per original char, so match positions index the original text.
  const fold = (text) => Array.from(text, (c) => c.normalize('NFD')[0].toLowerCase()).join('');
  const isWordChar = (c) => /[\p{L}\p{N}]/u.test(c);

  function shortUrl(url) {
    return url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '');
  }

  function displayTitle(bookmark) {
    return bookmark.title || bookmark.url;
  }

  function flattenBookmarks(tree) {
    const out = [];
    const walk = (node, path, depth) => {
      if (node.children) {
        // depth 0 is the tree root and depth 1 the browser's own roots (toolbar, menu...).
        const next = depth >= 2 ? [...path, node.title] : path;
        for (const child of node.children) walk(child, next, depth + 1);
      } else if (node.url && !SKIPPED_SCHEMES.test(node.url)) {
        out.push({
          id: node.id,
          title: node.title ?? '',
          url: node.url,
          folder: path.join(' / '),
          dateAdded: node.dateAdded ?? 0,
        });
      }
    };
    for (const node of tree) walk(node, [], 0);
    return out;
  }

  // Best subsequence match of one folded word in one folded field: every place the first
  // letter appears is tried as a start, so "api" finds "API" and not the "a" of "Payments".
  function matchWord(field, word) {
    let best = null;
    for (let start = field.indexOf(word[0]); start !== -1; start = field.indexOf(word[0], start + 1)) {
      const m = matchFrom(field, word, start);
      if (!m) break; // a later start cannot fit what this one could not
      if (!best || m.score > best.score) best = m;
    }
    return best;
  }

  // Greedy from start: each next letter takes its first occurrence.
  function matchFrom(field, word, start) {
    let score = 0;
    let prev = -1;
    const positions = [];
    for (const c of word) {
      const i = prev === -1 ? start : field.indexOf(c, prev + 1);
      if (i === -1) return null;
      score += 1;
      if (prev >= 0 && i === prev + 1) score += 5;
      if (i === 0 || !isWordChar(field[i - 1])) score += 3;
      if (prev >= 0) score -= 0.1 * (i - prev - 1);
      positions.push(i);
      prev = i;
    }
    return { score, positions };
  }

  function scoreBookmark(fields, words) {
    let total = 0;
    const hits = { title: [], folder: [], url: [] };
    for (const word of words) {
      let best = null;
      for (const name of ['title', 'folder', 'url']) {
        const m = matchWord(fields[name], word);
        if (m && (!best || m.score * WEIGHTS[name] > best.score)) {
          best = { name, score: m.score * WEIGHTS[name], positions: m.positions };
        }
      }
      if (!best) return null;
      total += best.score;
      hits[best.name].push(...best.positions);
    }
    for (const name in hits) hits[name] = [...new Set(hits[name])].sort((a, b) => a - b);
    return { score: total, hits };
  }

  const newestFirst = (a, b) => b.bookmark.dateAdded - a.bookmark.dateAdded;

  // Folding is most of the cost, so each bookmark is folded once, not on every keystroke.
  const folded = new WeakMap();
  function foldedFields(bookmark) {
    let fields = folded.get(bookmark);
    if (!fields) {
      fields = { title: fold(bookmark.title), folder: fold(bookmark.folder), url: fold(shortUrl(bookmark.url)) };
      folded.set(bookmark, fields);
    }
    return fields;
  }

  function searchBookmarks(list, query, limit = MAX_RESULTS) {
    const words = fold(query).split(/\s+/).filter(Boolean);
    if (!words.length) {
      return list
        .map((bookmark) => ({ bookmark, score: 0, hits: { title: [], folder: [], url: [] } }))
        .sort(newestFirst)
        .slice(0, RECENT);
    }
    const results = [];
    for (const bookmark of list) {
      const scored = scoreBookmark(foldedFields(bookmark), words);
      if (scored) results.push({ bookmark, ...scored });
    }
    return results.sort((a, b) => b.score - a.score || newestFirst(a, b)).slice(0, limit);
  }

  const engineById = (id) => ENGINES.find((engine) => engine.id === id);

  // What Tab cycles through: 'bookmarks' and the ids of the engines that are on, in the
  // fixed order. Never empty: with everything off, bookmarks stay.
  function modes(switcher) {
    const list = [
      ...(switcher.bookmarks ? ['bookmarks'] : []),
      ...ENGINES.filter((engine) => switcher.engines?.[engine.id]).map((engine) => engine.id),
    ];
    return list.length ? list : ['bookmarks'];
  }

  function nextMode(list, mode, dir) {
    const i = list.indexOf(mode);
    if (i === -1) return list[0];
    return list[(i + dir + list.length) % list.length];
  }

  // Without bookmarks the switcher lives on the first engine; with them it jumps there only
  // when autoSearch is on, the query is not blank and nothing matches.
  function autoMode(state, query, hasResults, list, autoSearch) {
    if (state.manual) return state;
    if (!list.includes('bookmarks')) return { mode: list[0], manual: false };
    const engine = list.find((mode) => mode !== 'bookmarks');
    if (!autoSearch || !engine || !query.trim() || hasResults) return { mode: 'bookmarks', manual: false };
    return { mode: engine, manual: false };
  }

  const COMMANDS = new Map([['td', 'dark'], ['ta', 'css'], ['ajustes', 'settings'], ['settings', 'settings'], ['options', 'settings']]);

  function parseCommand(query) {
    return COMMANDS.get(query.trim().toLowerCase()) ?? null;
  }

  function commandsAllowed(hostname) {
    return Boolean(hostname);
  }

  function searchUrl(engine, query) {
    return engine.url.replace('%s', encodeURIComponent(query.trim()));
  }

  const api = {
    ENGINES,
    engineById,
    modes,
    flattenBookmarks,
    searchBookmarks,
    nextMode,
    autoMode,
    parseCommand,
    commandsAllowed,
    searchUrl,
    displayTitle,
    shortUrl,
  };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.match = api;
  if (typeof module === 'object') module.exports = api;
})();
