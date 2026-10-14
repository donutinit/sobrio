// First content script. darkreader.js patches chrome.runtime.sendMessage and its
// version drops the returned promise, so keep the native one for sobrio's own messages.
(() => {
  // storage.local holds {darkOff: string[], cssOff: string[]}; true means on.
  function siteState(stored, hostname) {
    return {
      dark: !(stored?.darkOff ?? []).includes(hostname),
      css: !(stored?.cssOff ?? []).includes(hostname),
    };
  }

  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.siteState = siteState;
  if (globalThis.chrome?.runtime?.sendMessage) {
    globalThis.sobrio.send = chrome.runtime.sendMessage.bind(chrome.runtime);
  }
  if (typeof module === 'object') module.exports = { siteState };
})();
