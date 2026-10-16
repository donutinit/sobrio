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

  const mimeType = (contentType) => (contentType ?? '').split(';')[0].trim().toLowerCase();
  const isCss = (contentType) => mimeType(contentType) === 'text/css';

  function responseAllowed(contentType, size) {
    return (isCss(contentType) || mimeType(contentType).startsWith('image/')) && size <= MAX_BYTES;
  }

  function toBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    if (bytes.toBase64) return bytes.toBase64();
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
    // The built-in PDF viewers take no content scripts, and Firefox cannot fall back to the
    // popup after a failed injection.
    if (/\.pdf$/i.test(parsed.pathname)) return false;
    return !(parsed.hostname === 'chrome.google.com' && parsed.pathname.startsWith('/webstore'));
  }

  // Dark Reader only sends cross-origin requests for public https hosts, but the background
  // follows redirects, so where a redirect lands gets the same check (Dark Reader's
  // shouldIgnoreCors): no LAN, localhost or IP hosts, no custom ports.
  const LOCAL_ALIASES = [
    '127-0-0-1.org.uk', '42foo.com', 'domaincontrol.com', 'fbi.com', 'fuf.me', 'lacolhost.com',
    'local.sisteminha.com', 'localfabriek.nl', 'localhost', 'localhst.co.uk', 'localmachine.info',
    'localmachine.name', 'localtest.me', 'lvh.me', 'mouse-potato.com', 'nip.io', 'sslip.io', 'vcap.me',
    'xip.io', 'yoogle.com',
  ];
  const LOCAL_SUFFIXES = [
    '.corp', '.direct', '.home', '.internal', '.intranet', '.lan', '.local', '.localdomain', '.test', '.zz',
    ...LOCAL_ALIASES.map((alias) => `.${alias}`),
  ];

  function redirectAllowed(url) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return false;
    }
    const host = parsed.hostname.replace(/\.$/, '');
    const last = host.split('.').pop();
    return (
      parsed.protocol === 'https:' &&
      parsed.port === '' &&
      !host.startsWith('[') &&
      !/^(0x[0-9a-f]+|\d+)$/i.test(last) &&
      !LOCAL_ALIASES.includes(host) &&
      !LOCAL_SUFFIXES.some((suffix) => host.endsWith(suffix))
    );
  }

  // sobrio's new tab page (the extension sees its own pages' urls without the tabs
  // permission). about:newtab, about:home or chrome://newtab mean sobrio's is not in use.
  function isOwnNewtab(url, newtabUrl) {
    return typeof url === 'string' && url.split(/[?#]/)[0] === newtabUrl;
  }

  // The welcome guide opens once, on a real install: not on updates, and not for unpacked or
  // temporary loads (installType "development"), where every test run would get a tab.
  function shouldWelcome(reason, installType) {
    return reason === 'install' && installType !== 'development';
  }

  const api = { MAX_BYTES, fetchAllowed, responseAllowed, isCss, toBase64, canInject, redirectAllowed, isOwnNewtab, shouldWelcome };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.guard = api;
  if (typeof module === 'object') module.exports = api;
})();
