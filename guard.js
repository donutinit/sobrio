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

  const api = { MAX_BYTES, fetchAllowed, responseAllowed, toBase64 };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.guard = api;
  if (typeof module === 'object') module.exports = api;
})();
