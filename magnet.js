// Capture the link before the site's click handlers can swap its destination.
(() => {
  const t = (key) => chrome.i18n.getMessage(key);
  const click = async (event) => {
    if (!event.isTrusted || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const link = event.composedPath().find((node) => node.localName === 'a' && node.hasAttribute('href'));
    const url = link?.getAttribute('href');
    if (typeof url !== 'string' || !/^magnet:\?/i.test(url)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const result = await sobrio.send({ sobrio: 'magnet', url }).catch(() => null);
    sobrio.toast('qBittorrent', t(result?.ok ? 'magnetSent' : 'magnetFailed'), 3500);
  };

  let active = false;
  sobrio.onSettings((settings, stored) => {
    const enabled = stored?.magnetEnabled === true;
    if (enabled === active) return;
    active = enabled;
    if (active) window.addEventListener('click', click, true);
    else window.removeEventListener('click', click, true);
  });
})();
