const test = require('node:test');
const assert = require('node:assert/strict');
const { MAX_BYTES, fetchAllowed, responseAllowed, toBase64, canInject, redirectAllowed } = require('../guard.js');

test('only http and https', () => {
  assert.equal(fetchAllowed('https://cdn.x/a.css'), true);
  assert.equal(fetchAllowed('http://cdn.x/a.png'), true);
  assert.equal(fetchAllowed('file:///etc/passwd'), false);
  assert.equal(fetchAllowed('chrome://settings'), false);
  assert.equal(fetchAllowed('moz-extension://abc/x.css'), false);
  assert.equal(fetchAllowed('not a url'), false);
});

test('only css and images under 5 MB', () => {
  assert.equal(MAX_BYTES, 5 * 1024 * 1024);
  assert.equal(responseAllowed('text/css; charset=utf-8', 10), true);
  assert.equal(responseAllowed('image/png', 10), true);
  assert.equal(responseAllowed('Image/SVG+XML', 10), true);
  assert.equal(responseAllowed('image/png', MAX_BYTES), true);
  assert.equal(responseAllowed('image/png', MAX_BYTES + 1), false);
  assert.equal(responseAllowed('application/json', 10), false);
  assert.equal(responseAllowed('text/html', 10), false);
  assert.equal(responseAllowed('', 10), false);
  assert.equal(responseAllowed(null, 10), false);
});

test('toBase64 roundtrip', () => {
  const bytes = new Uint8Array(70000).map((_, i) => (i * 7) % 256);
  const decoded = Uint8Array.from(atob(toBase64(bytes.buffer)), (c) => c.charCodeAt(0));
  assert.deepEqual(decoded, bytes);
});

test('canInject: regular pages yes, browser pages and stores no', () => {
  assert.equal(canInject('https://github.com/x'), true);
  assert.equal(canInject('http://localhost:3000/'), true);
  assert.equal(canInject('file:///home/me/notes.html'), true);
  assert.equal(canInject(undefined), false);
  assert.equal(canInject('about:addons'), false);
  assert.equal(canInject('chrome://settings'), false);
  assert.equal(canInject('moz-extension://abc/popup.html'), false);
  assert.equal(canInject('view-source:https://github.com/'), false);
  assert.equal(canInject('https://addons.mozilla.org/en-US/firefox/'), false);
  assert.equal(canInject('https://accounts.firefox.com/'), false);
  assert.equal(canInject('https://chromewebstore.google.com/detail/x'), false);
  assert.equal(canInject('https://chrome.google.com/webstore/detail/x'), false);
  assert.equal(canInject('https://chrome.google.com/search'), true);
});

test('redirects may only land on public https hosts, like Dark Reader allows', () => {
  assert.equal(redirectAllowed('https://cdn.example.com/x.css'), true);
  assert.equal(redirectAllowed('https://example.com./x.css'), true);
  assert.equal(redirectAllowed('http://cdn.example.com/x.css'), false);
  assert.equal(redirectAllowed('https://cdn.example.com:8443/x.css'), false);
  assert.equal(redirectAllowed('https://localhost/x.css'), false);
  assert.equal(redirectAllowed('https://localhost./x.css'), false);
  assert.equal(redirectAllowed('https://192.168.1.1/app.css'), false);
  assert.equal(redirectAllowed('https://0x7f000001/app.css'), false);
  assert.equal(redirectAllowed('https://[::1]/app.css'), false);
  assert.equal(redirectAllowed('https://printer.local/x.css'), false);
  assert.equal(redirectAllowed('https://router.lan/x.css'), false);
  assert.equal(redirectAllowed('https://wiki.corp.internal/x.css'), false);
  assert.equal(redirectAllowed('https://lvh.me/x.css'), false);
  assert.equal(redirectAllowed('https://10.0.0.1.nip.io/x.css'), false);
  assert.equal(redirectAllowed('not a url'), false);
});

test('canInject: pdfs open in the browser viewer, so they go to the popup', () => {
  assert.equal(canInject('https://example.com/paper.pdf'), false);
  assert.equal(canInject('https://example.com/Paper.PDF?download=0#page=2'), false);
  assert.equal(canInject('file:///home/me/scan.pdf'), false);
  assert.equal(canInject('https://example.com/pdf-guide'), true);
});
