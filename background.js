// Firefox loads the helpers through background.scripts; Chrome's service worker imports them.
if (typeof importScripts === 'function') importScripts('guard.js');

const { guard } = sobrio;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;
  if (message?.sobrio === 'fetch') {
    fetchForDarkReader(message.url).then(sendResponse, (error) =>
      sendResponse({ ok: false, error: String(error) }),
    );
    return true;
  }
  // darkreader.js also forwards its own messages here. Answer them empty so
  // Chrome does not log "receiving end does not exist".
  sendResponse();
});

// Never sends cookies and never hands back anything but CSS or images, capped in size.
async function fetchForDarkReader(url) {
  if (!guard.fetchAllowed(url)) return { ok: false, error: 'url not allowed' };
  const response = await fetch(url, { credentials: 'omit' });
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

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== 'open-switcher') return;
  openSwitcher(tab);
});

function openSwitcher(tab) {
  // Firefox only allows openPopup() synchronously inside the command handler,
  // so pages where injection cannot work go straight to the popup.
  if (!tab?.id || !/^(https?|file):/.test(tab.url ?? '')) {
    openPopup();
    return;
  }
  chrome.scripting
    .executeScript({ target: { tabId: tab.id }, files: ['match.js', 'switcher.js'] })
    .catch(openPopup);
}

function openPopup() {
  chrome.action.openPopup().catch((error) => console.warn('sobrio: cannot open the switcher', error));
}
