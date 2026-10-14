// First content script. darkreader.js patches chrome.runtime.sendMessage and its
// version drops the returned promise, so keep the native one for sobrio's own messages.
globalThis.sobrio = globalThis.sobrio || {};
sobrio.send = chrome.runtime.sendMessage.bind(chrome.runtime);
