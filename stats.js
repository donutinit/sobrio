// The switcher's memory: how often and how lately each bookmark was opened from it, and the
// weight that gives it in the search. Pure; the background stores it as storage.local.stats.
(() => {
  const DAY = 24 * 3600 * 1000;

  function weightOf(entry, now = Date.now()) {
    if (!entry?.count) return 0;
    const age = now - (entry.last ?? 0);
    const recency = age < DAY ? 1 : age < 7 * DAY ? 0.8 : age < 30 * DAY ? 0.5 : 0.3;
    return Math.log2(1 + entry.count) * recency;
  }

  // Added to a bookmark's search score: enough to settle close calls, never to beat a title
  // match with a url-only one.
  const boostOf = (entry, now) => Math.min(40, 8 * weightOf(entry, now));

  function recordOpen(stats, url, title, now = Date.now()) {
    const previous = stats?.[url];
    return { ...stats, [url]: { count: (previous?.count ?? 0) + 1, last: now, title: title || previous?.title || '' } };
  }

  function pruneStats(stats, max = 2000, now = Date.now()) {
    const entries = Object.entries(stats);
    if (entries.length <= max) return stats;
    entries.sort(([, a], [, b]) => weightOf(b, now) - weightOf(a, now) || b.last - a.last);
    return Object.fromEntries(entries.slice(0, max));
  }

  const api = { weightOf, boostOf, recordOpen, pruneStats };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.stats = api;
  if (typeof module === 'object') module.exports = api;
})();
