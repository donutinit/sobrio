// What the background may download for Dark Reader: stylesheets and images, nothing else.
// The URLs come from pages, so this keeps a page from using sobrio to read other sites.
(() => {
  const MAX_BYTES = 5 * 1024 * 1024;

  function fetchAllowed(url) {
    try {
      return ['http:', 'https:'].includes(new URL(url).protocol);
    } catch {
      return false;
    }
  }

  function responseAllowed(contentType, size) {
    const type = (contentType ?? '').split(';')[0].trim().toLowerCase();
    return (type === 'text/css' || type.startsWith('image/')) && size <= MAX_BYTES;
  }

  function toBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  }

  // Where browsers never let an extension inject: Firefox's
  // extensions.webextensions.restrictedDomains and Chrome's web store.
  const RESTRICTED_HOSTS = new Set([
    'accounts-static.cdn.mozilla.net',
    'accounts.firefox.com',
    'addons.cdn.mozilla.net',
    'addons.mozilla.org',
    'api.accounts.firefox.com',
    'content.cdn.mozilla.net',
    'discovery.addons.mozilla.org',
    'install.mozilla.org',
    'oauth.accounts.firefox.com',
    'profile.accounts.firefox.com',
    'support.mozilla.org',
    'sync.services.mozilla.com',
    'chromewebstore.google.com',
  ]);

  function canInject(url) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return false;
    }
    if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) return false;
    if (RESTRICTED_HOSTS.has(parsed.hostname)) return false;
    return !(parsed.hostname === 'chrome.google.com' && parsed.pathname.startsWith('/webstore'));
  }

  const api = { MAX_BYTES, fetchAllowed, responseAllowed, toBase64, canInject };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.guard = api;
  if (typeof module === 'object') module.exports = api;
})();
