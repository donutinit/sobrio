chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;
  // darkreader.js also forwards its own messages here. Answer them empty so
  // Chrome does not log "receiving end does not exist".
  sendResponse();
});

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
