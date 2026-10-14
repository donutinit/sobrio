// A small notice at the top left of the page (speed, shortcuts), in a closed shadow root,
// inside the fullscreen element when there is one.
(() => {
  let host = null;
  let box = null;
  let timer;

  function toast(text, detail = '', ms = 1000) {
    if (!host) {
      host = document.createElement('sobrio-toast');
      host.style.cssText =
        'all: initial !important; position: fixed !important; top: 16px !important; left: 16px !important; z-index: 2147483647 !important;';
      const shadow = host.attachShadow({ mode: 'closed' });
      const style = document.createElement('style');
      style.textContent =
        '.toast { padding: 6px 10px; border: 1px solid #333; background: #000; color: #fff;' +
        ' font: 14px/1.3 system-ui, sans-serif; font-variant-numeric: tabular-nums; }' +
        ' .toast span { color: #888; }';
      box = document.createElement('div');
      box.className = 'toast';
      shadow.append(style, box);
    }
    const small = document.createElement('span');
    small.textContent = detail ? ` · ${detail}` : '';
    box.replaceChildren(text, small);
    (document.fullscreenElement ?? document.documentElement).append(host);
    clearTimeout(timer);
    timer = setTimeout(() => host.remove(), ms);
  }

  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.toast = toast;
})();
