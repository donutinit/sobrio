// The toolbar button, and pages where nothing can be injected (about:, chrome://, the stores),
// get the switcher here. td and ta act on the site of the active tab.
chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
  const hostname = sobrio.match.siteHost(tab?.url);
  const { onKey } = sobrio.mountSwitcher(document.body, { layout: 'popup', hostname, close: () => window.close() });
  document.addEventListener('keydown', onKey);
});
