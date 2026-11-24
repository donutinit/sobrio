// Pure switcher logic: bookmark search, modes, engines and commands.
// A classic script so content scripts, the popup and the background can load it;
// node --test gets the same functions through module.exports.
(() => {
  const ENGINES = [
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
    { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=%s' },
    { id: 'wikipedia', name: 'Wikipedia', url: 'https://es.wikipedia.org/w/index.php?search=%s' },
    { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=%s' },
  ];
  const MAX_RESULTS = 50;
  const RECENT = 20;
  const WEIGHTS = { title: 3, folder: 2, url: 1 };
  // A title that is the query itself is a name given to be typed (g, yt, pi): it comes first,
  // over the switcher's memory (stats.js gives at most 40) and over newer bookmarks.
  const EXACT_TITLE = 100;
  const SKIPPED_SCHEMES = /^(javascript|place|data):/i;

  // One folded char per original char (code point), so match positions index the original text.
  // ASCII only needs lower case; the rest goes char by char, and a lower-cased char never grows.
  const NON_ASCII = /[^\x00-\x7f]/gu;
  const fold = (text) => text.replace(NON_ASCII, (c) => c.normalize('NFD')[0].toLowerCase()).toLowerCase();
  const WORD_CHAR = /[\p{L}\p{N}]/u;
  // Fields are folded, so ASCII letters are lower case already.
  const isWordChar = (c) => (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || (c > '\x7f' && WORD_CHAR.test(c));

  function shortUrl(url) {
    return url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '');
  }

  // Where the host ends in a short url: the switcher shows it brighter than the path.
  function hostLength(short) {
    const end = short.search(/[/?#]/);
    return end === -1 ? short.length : end;
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
  // precision: 'loose' takes any subsequence; 'normal' (default) only one that spans at most
  // 2 × length + 2 characters; 'strict' only the word as written.
  // Gives where the best match starts, -1 without one, and leaves its score in matchScore:
  // every keystroke scores every bookmark, so nothing is built for one until it is to be shown.
  let matchScore = 0;
  let matchEnd = 0;

  function matchStart(field, word, precision = 'normal') {
    let best = -1;
    let bestScore = 0;
    for (let start = field.indexOf(word[0]); start !== -1; start = field.indexOf(word[0], start + 1)) {
      if (precision === 'strict' && !field.startsWith(word, start)) continue;
      const score = scoreFrom(field, word, start, null);
      if (score === null) break; // a later start cannot fit what this one could not
      if (precision === 'normal' && matchEnd - start + 1 > word.length * 2 + 2) continue;
      if (best === -1 || score > bestScore) {
        best = start;
        bestScore = score;
      }
    }
    matchScore = bestScore;
    return best;
  }

  // Greedy from start: each next letter takes its first occurrence. The score, null when the
  // word does not fit; the last position goes to matchEnd and each one to positions, if given.
  function scoreFrom(field, word, start, positions) {
    let score = 0;
    let prev = -1;
    for (const c of word) {
      const i = prev === -1 ? start : field.indexOf(c, prev + 1);
      if (i === -1) return null;
      score += 1;
      if (prev >= 0 && i === prev + 1) score += 5;
      if (i === 0 || !isWordChar(field[i - 1])) score += 3;
      if (prev >= 0) score -= 0.1 * (i - prev - 1);
      if (positions) positions.push(i);
      prev = i;
    }
    matchEnd = prev;
    return score;
  }

  const FIELDS = ['title', 'folder', 'url'];

  // The score of a bookmark for the words, null when one of them matches nothing. hits: where
  // to note the matched positions of each field, for the bookmarks that get shown.
  function scoreBookmark(fields, words, precision, hits) {
    let total = 0;
    for (const word of words) {
      let best = null;
      let bestScore = 0;
      let bestStart = -1;
      for (const name of FIELDS) {
        const start = matchStart(fields[name], word, precision);
        if (start !== -1 && (best === null || matchScore * WEIGHTS[name] > bestScore)) {
          best = name;
          bestScore = matchScore * WEIGHTS[name];
          bestStart = start;
        }
      }
      if (best === null) return null;
      total += bestScore;
      if (hits) scoreFrom(fields[best], word, bestStart, hits[best]);
    }
    if (hits) for (const name in hits) hits[name] = [...new Set(hits[name])].sort((a, b) => a - b);
    return total;
  }

  // Folding is most of the cost, so each bookmark is folded once, not on every keystroke, and kept
  // by id for the next time the switcher opens on the same page (the list comes anew each time).
  const folded = new WeakMap();
  const foldedById = new Map();
  function foldedFields(bookmark) {
    let fields = folded.get(bookmark);
    if (fields) return fields;
    const { id, title, folder, url } = bookmark;
    const kept = id === undefined ? null : foldedById.get(id);
    if (kept && kept.title === title && kept.folder === folder && kept.url === url) {
      fields = kept.fields;
    } else {
      fields = { title: fold(title), folder: fold(folder), url: fold(shortUrl(url)) };
      if (id !== undefined) foldedById.set(id, { title, folder, url, fields });
    }
    folded.set(bookmark, fields);
    return fields;
  }

  // Folds a whole list ahead of the first search, which otherwise pays for it in its keystroke.
  function prepare(list) {
    for (const bookmark of list) foldedFields(bookmark);
  }

  // boost(bookmark): extra score from the switcher's memory (stats.js); 0 without it.
  // Scores first, with nothing built per bookmark; then the best ones in order (the higher score,
  // then the newer, then the earlier in the list) get their object, and their hits.
  function searchBookmarks(list, query, limit = MAX_RESULTS, precision = 'normal', boost = () => 0) {
    const words = fold(query).split(/\s+/).filter(Boolean);
    const phrase = words.join(' ');
    const found = [];
    const scores = [];
    for (let i = 0; i < list.length; i++) {
      const bookmark = list[i];
      let score = 0;
      if (words.length) {
        const fields = foldedFields(bookmark);
        score = scoreBookmark(fields, words, precision, null);
        if (score === null) continue;
        if (fields.title.trim().split(/\s+/).join(' ') === phrase) score += EXACT_TITLE;
      }
      scores[i] = score + boost(bookmark);
      found.push(i);
    }
    found.sort((a, b) => scores[b] - scores[a] || list[b].dateAdded - list[a].dateAdded || a - b);
    return found.slice(0, words.length ? limit : RECENT).map((i) => {
      const hits = { title: [], folder: [], url: [] };
      if (words.length) scoreBookmark(foldedFields(list[i]), words, precision, hits);
      return { bookmark: list[i], score: scores[i], hits };
    });
  }

  // The built-in engines that are on, then the person's own (settings.switcher.customEngines).
  function allEngines(switcher) {
    return [...ENGINES.filter((engine) => switcher.engines?.[engine.id]), ...(switcher.customEngines ?? [])];
  }

  // Any engine by id, on or off, built-in or custom.
  function engineById(id, switcher = {}) {
    return [...ENGINES, ...(switcher.customEngines ?? [])].find((engine) => engine.id === id);
  }

  // What Tab cycles through: 'bookmarks', then the default engine, then the other engines that
  // are on. Never empty: with everything off, bookmarks stay.
  function modes(switcher) {
    const engines = allEngines(switcher).map((engine) => engine.id);
    const first = engines.includes(switcher.defaultEngine) ? switcher.defaultEngine : engines[0];
    const list = [
      ...(switcher.bookmarks ? ['bookmarks'] : []),
      ...(first ? [first, ...engines.filter((id) => id !== first)] : []),
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

  const DEFAULT_COMMANDS = { dark: 'pz', css: 'px', pause: 'pd', settings: 'settings' };
  const PAUSE_MINUTES = 3;

  // names: the person's words (settings.switcher.commandNames). "options" also opens the
  // settings while none of theirs uses it. The pause word takes minutes after it (pd15).
  function parseCommand(query, names = DEFAULT_COMMANDS) {
    const word = query.trim().toLowerCase();
    if (!word) return null;
    const kind = Object.keys(names).find((key) => names[key] === word);
    if (kind) return kind;
    if (pauseMinutes(word, names)) return 'pause';
    return word === 'options' ? 'settings' : null;
  }

  // The minutes pd pauses dark mode and the stylesheet for: 3 by itself, or 1 to 999 written right after the word;
  // null when the query is not the pause command.
  function pauseMinutes(query, names = DEFAULT_COMMANDS) {
    const word = query.trim().toLowerCase();
    const name = names.pause;
    if (!name || !word.startsWith(name)) return null;
    const digits = word.slice(name.length);
    if (!digits) return PAUSE_MINUTES;
    const minutes = /^\d{1,3}$/.test(digits) ? Number(digits) : 0;
    return minutes >= 1 ? minutes : null;
  }

  // The site a tab shows, for pz and px from the popup: only http(s) pages have one.
  function siteHost(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.hostname : '';
    } catch {
      return '';
    }
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
    allEngines,
    modes,
    flattenBookmarks,
    searchBookmarks,
    prepare,
    nextMode,
    autoMode,
    parseCommand,
    pauseMinutes,
    commandsAllowed,
    searchUrl,
    displayTitle,
    shortUrl,
    hostLength,
    siteHost,
  };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.match = api;
  if (typeof module === 'object') module.exports = api;
})();
