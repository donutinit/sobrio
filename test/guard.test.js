const test = require('node:test');
const assert = require('node:assert/strict');
const { MAX_BYTES, fetchAllowed, responseAllowed, toBase64, canInject } = require('../guard.js');

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
