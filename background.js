// Firefox loads the helpers through background.scripts; Chrome's service worker imports them.
if (typeof importScripts === 'function') importScripts('guard.js', 'match.js', 'settings.js', 'stats.js');

const { guard, match } = sobrio;

// The userContent.css theme hook. Firefox runs this in a background page, where
// userContent.css reaches; Chrome's service worker has no document and no userContent.css.
if (typeof document !== 'undefined') {
  const style = getComputedStyle(document.documentElement);
  sobrio.settings.storeThemeHook((name) => style.getPropertyValue(name));
}

const handlers = {
  fetch: (message) => fetchForDarkReader(message.url),
  bookmarks: () => getBookmarks(),
  open: async (message, sender) => {
    await openUrl(message.url, message.newTab, sender.tab);
    if (typeof message.record === 'string') await remember(message.url, message.record);
    return true;
  },
  settings: () => chrome.runtime.openOptionsPage().then(() => true),
  // A frame that cannot see the site in the address bar (page.js): the tab's.
  'top-host': async (message, sender) => match.siteHost(sender.tab?.url),
  // sender.url is the page that asked: sobrio's new tab even where Chrome calls the tab
  // chrome://newtab/.
  shortcut: (message, sender) => runShortcut(message, sender.tab, sender.url),
  // A shortcut about the site pressed inside an iframe: the tab's top frame runs it, as the site in
  // the address bar, finding it again by its keys in its own settings and only if the site is still
  // the one the tab showed. False when nothing there can run it.
  'shortcut-frame': async (message, sender) => {
    if (!sender.tab || typeof message.keys !== 'string') return false;
    const host = match.siteHost(sender.tab.url);
    return chrome.tabs.sendMessage(sender.tab.id, { sobrio: 'run-shortcut', keys: message.keys, host }, { frameId: 0 })
      .then((ran) => ran === true, () => false);
  },
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;
  const handler = handlers[message?.sobrio];
  if (!handler) {
    // darkreader.js also forwards its own messages here. Answer them empty so
    // Chrome does not log "receiving end does not exist".
    sendResponse();
    return;
  }
  handler(message, sender).then(sendResponse, (error) => sendResponse({ ok: false, error: String(error) }));
  return true;
});

// Never sends cookies and never hands back anything but CSS or images, capped in size. CSS goes
// back as text (Chrome sends messages as JSON, so bytes would cost a base64 round trip), images as
// base64.
async function fetchForDarkReader(url) {
  if (!guard.fetchAllowed(url)) return { ok: false, error: 'url not allowed' };
  const response = await fetch(url, { credentials: 'omit' });
  if (response.redirected && !guard.redirectAllowed(response.url)) {
    response.body?.cancel();
    return { ok: false, error: 'redirect not allowed' };
  }
  const type = response.headers.get('content-type');
  if (!guard.responseAllowed(type, Number(response.headers.get('content-length') ?? 0))) {
    response.body?.cancel();
    return { ok: false, error: `response not allowed: ${type}` };
  }
  const chunks = [];
  let size = 0;
  const reader = response.body.getReader();
  for (let read = await reader.read(); !read.done; read = await reader.read()) {
    size += read.value.byteLength;
    if (!guard.responseAllowed(type, size)) {
      reader.cancel();
      return { ok: false, error: 'response too large' };
    }
    chunks.push(read.value);
  }
  const body = await new Blob(chunks).arrayBuffer();
  if (guard.isCss(type)) return { ok: true, status: response.status, type, text: new TextDecoder().decode(body) };
  return { ok: true, status: response.status, type, base64: guard.toBase64(body) };
}

// Flattened once and kept until the bookmarks change. A restarted worker rebuilds it.
let bookmarks = null;

async function getBookmarks() {
  if (!bookmarks) bookmarks = match.flattenBookmarks(await chrome.bookmarks.getTree());
  return bookmarks;
}

for (const event of ['onCreated', 'onRemoved', 'onChanged', 'onMoved']) {
  chrome.bookmarks[event].addListener(() => {
    bookmarks = null;
  });
}

// The shortcut actions a page cannot run itself (shortcuts.js runs the rest).
async function runShortcut({ action, param, text }, tab, from) {
  const { settings } = await chrome.storage.local.get('settings');
  const { switcher } = sobrio.settings.mergeSettings(settings);
  if (action === 'switcher') return showSwitcher(tab, undefined, from);
  if (action === 'search') return showSwitcher(tab, param, from);
  if (action === 'searchSelection') {
    const engine = match.engineById(param, switcher);
    if (!text || !engine) return showSwitcher(tab, param, from);
    return openUrl(match.searchUrl(engine, text), true, tab);
  }
  if (action === 'openUrl' || action === 'openUrlNewTab') return openUrl(param, action === 'openUrlNewTab', tab);
  if (action === 'settings') return chrome.runtime.openOptionsPage().then(() => true);
  return false;
}

// On sobrio's own new tab the switcher is already there: focus it. Elsewhere, inject it.
async function showSwitcher(tab, mode, from = tab?.url) {
  if (guard.isOwnNewtab(from, NEWTAB)) {
    await chrome.runtime.sendMessage({ sobrio: 'focus-switcher', tabId: tab.id, mode }).catch(() => {});
    return true;
  }
  await injectSwitcher(tab.id, mode);
  return true;
}

// The switcher's memory: count the bookmark just opened, if memory is on.
async function remember(url, title) {
  const { settings, stats } = await chrome.storage.local.get(['settings', 'stats']);
  if (!sobrio.settings.mergeSettings(settings).switcher.memory) return;
  const next = sobrio.stats.recordOpen(stats && typeof stats === 'object' ? stats : {}, url, title);
  await chrome.storage.local.set({ stats: sobrio.stats.pruneStats(next) });
}

// From a page the tab is the sender's; from the popup it is the active one.
async function openUrl(url, newTab, tab) {
  tab ??= (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];
  if (newTab) {
    await chrome.tabs.create({ url, index: tab ? tab.index + 1 : undefined, openerTabId: tab?.id });
  } else {
    await chrome.tabs.update(tab.id, { url });
  }
  return true;
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const self = await Promise.resolve(chrome.management?.getSelf?.()).catch(() => null);
  if (guard.shouldWelcome(reason, self?.installType)) chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'open-switcher') openSwitcher(tab);
});

const NEWTAB = chrome.runtime.getURL('newtab.html');

function openSwitcher(tab) {
  // sobrio's own new tab has the switcher already: focus it there instead of the popup.
  if (guard.isOwnNewtab(tab?.url, NEWTAB)) {
    chrome.runtime.sendMessage({ sobrio: 'focus-switcher', tabId: tab.id }).catch(() => {});
    return;
  }
  // Firefox only allows openPopup() synchronously inside the command handler,
  // so pages where injection cannot work go straight to the popup.
  if (!tab?.id || !guard.canInject(tab.url)) {
    openPopup();
    return;
  }
  injectSwitcher(tab.id).catch(openPopup);
}

// mode: an engine id to open the switcher on, for search shortcuts. Where the switcher was
// opened before, its code is still there: it opens in one call, without loading its six files
// again and with the bookmarks folded last time.
async function injectSwitcher(tabId, mode) {
  const target = { tabId };
  const [{ result: opened } = {}] = await chrome.scripting.executeScript({
    target,
    func: (m) => {
      const sobrio = (globalThis.sobrio = globalThis.sobrio || {});
      sobrio.pendingMode = m;
      if (!sobrio.toggleSwitcher) return false;
      sobrio.toggleSwitcher();
      return true;
    },
    args: [mode ?? null],
  });
  if (opened) return;
  await chrome.scripting.executeScript({ target, files: ['settings.js', 'stats.js', 'match.js', 'icons.js', 'switcher-css.js', 'switcher.js'] });
}

function openPopup() {
  chrome.action.openPopup().catch((error) => console.warn('sobrio: cannot open the switcher', error));
}
