// Pure switcher logic: bookmark search, modes, engines and commands.
// A classic script so content scripts, the popup and the background can load it;
// node --test gets the same functions through module.exports.
(() => {
  const ENGINES = [
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
    { name: 'Google', url: 'https://www.google.com/search?q=%s' },
    { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=%s' },
    { name: 'Wikipedia', url: 'https://es.wikipedia.org/w/index.php?search=%s' },
    { name: 'GitHub', url: 'https://github.com/search?q=%s' },
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

  // Greedy subsequence match of one folded word in one folded field.
  function matchWord(field, word) {
    let score = 0;
    let prev = -1;
    const positions = [];
    for (const c of word) {
      const i = field.indexOf(c, prev + 1);
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
      const fields = {
        title: fold(bookmark.title),
        folder: fold(bookmark.folder),
        url: fold(shortUrl(bookmark.url)),
      };
      const scored = scoreBookmark(fields, words);
      if (scored) results.push({ bookmark, ...scored });
    }
    return results.sort((a, b) => b.score - a.score || newestFirst(a, b)).slice(0, limit);
  }

  // mode 0 is bookmarks, mode i >= 1 is ENGINES[i - 1].
  function nextMode(mode, dir) {
    const count = ENGINES.length + 1;
    return (mode + dir + count) % count;
  }

  function autoMode(state, query, hasResults) {
    if (state.manual) return state;
    if (!query.trim() || hasResults) return { mode: 0, manual: false };
    return { mode: 1, manual: false };
  }

  function parseCommand(query) {
    const q = query.trim().toLowerCase();
    if (q === 'td') return 'dark';
    if (q === 'ta') return 'css';
    return null;
  }

  function commandsAllowed(hostname) {
    return Boolean(hostname);
  }

  function searchUrl(engine, query) {
    return engine.url.replace('%s', encodeURIComponent(query.trim()));
  }

  const api = {
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
  };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.match = api;
  if (typeof module === 'object') module.exports = api;
})();
