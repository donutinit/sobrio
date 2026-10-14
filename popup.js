// Pages where nothing can be injected (about:, chrome://, the stores) get the switcher here.
const { onKey } = sobrio.mountSwitcher(document.body, { layout: 'popup', hostname: '', close: () => window.close() });
document.addEventListener('keydown', onKey);
