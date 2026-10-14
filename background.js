// Firefox loads the helpers through background.scripts; Chrome's service worker imports them.
if (typeof importScripts === 'function') importScripts('guard.js', 'match.js', 'settings.js');

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
  open: (message, sender) => openUrl(message.url, message.newTab, sender.tab),
  settings: () => chrome.runtime.openOptionsPage().then(() => true),
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

// Never sends cookies and never hands back anything but CSS or images, capped in size.
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

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'open-switcher') openSwitcher(tab);
});

function openSwitcher(tab) {
  // Firefox only allows openPopup() synchronously inside the command handler,
  // so pages where injection cannot work go straight to the popup.
  if (!tab?.id || !guard.canInject(tab.url)) {
    openPopup();
    return;
  }
  chrome.scripting
    .executeScript({ target: { tabId: tab.id }, files: ['settings.js', 'match.js', 'switcher-css.js', 'switcher.js'] })
    .catch(openPopup);
}

function openPopup() {
  chrome.action.openPopup().catch((error) => console.warn('sobrio: cannot open the switcher', error));
}
