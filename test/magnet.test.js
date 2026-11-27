const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const guard = require('../guard.js');

const magnet = `magnet:?xt=urn:btih:${'a'.repeat(40)}&dn=A%20name`;
const key = `qbt_${'a'.repeat(28)}`;
const source = (file) => readFileSync(join(__dirname, '..', file), 'utf8');

test('only single BitTorrent magnets and HTTPS server addresses pass validation', () => {
  assert.equal(guard.magnetLink(magnet), true);
  assert.equal(guard.magnetLink(`magnet:?xt=urn:btmh:1220${'b'.repeat(64)}`), true);
  assert.equal(guard.magnetLink('magnet:?dn=no-hash'), false);
  assert.equal(guard.magnetLink('https://example.com/example.torrent'), false);
  assert.equal(guard.magnetLink(`${magnet}\nhttps://example.com/`), false);
  assert.deepEqual(guard.qbitConfig('https://qbit.example/subdir/', key),
    { address: 'https://qbit.example/subdir', key });
  assert.deepEqual(guard.qbitConfig('https://qbit.example/', ''), { address: 'https://qbit.example', key: '' });
  for (const url of ['http://example.com', 'https://user:password@example.com', 'https://example.com/?key=1']) {
    assert.equal(guard.qbitConfig(url, key), null);
  }
});

test('the background sends one magnet to the configured server and handles both API responses', async () => {
  const stored = { magnetEnabled: true, qbit: { address: 'https://qbit.example/qbit', key: '' } };
  let onMessage;
  let response = new Response('Ok.');
  let calls = [];
  let consent = ['websiteContent'];
  vm.runInNewContext(source('background.js'), {
    sobrio: { guard, match: {}, settings: { commandKeys: () => null } },
    chrome: {
      commands: { getAll: async () => [], onCommand: { addListener() {} } },
      permissions: { getAll: async () => ({ data_collection: consent }), onRemoved: { addListener() {} } },
      storage: { local: { get: async () => stored } },
      bookmarks: {},
      runtime: {
        id: 'sobrio',
        getPlatformInfo: async () => ({ os: 'linux' }),
        getURL: (path) => `moz-extension://sobrio/${path}`,
        onInstalled: { addListener() {} },
        onMessage: { addListener: (listener) => { onMessage = listener; } },
      },
    },
    FormData, AbortSignal,
    fetch: async (...args) => { calls.push(args); return response; },
  });
  const send = (url = magnet) => new Promise((resolve) => {
    assert.equal(onMessage({ sobrio: 'magnet', url }, { id: 'sobrio', tab: { id: 1 } }, resolve), true);
  });

  assert.equal((await send()).ok, true);
  const [[destination, request]] = calls;
  assert.equal(destination, 'https://qbit.example/qbit/api/v2/torrents/add');
  assert.equal(request.method, 'POST');
  assert.equal(request.body.get('urls'), magnet);
  assert.equal(request.credentials, 'omit');
  assert.equal(request.redirect, 'error');
  assert.equal(request.referrerPolicy, 'no-referrer');
  assert.equal(request.headers.Authorization, undefined);

  stored.qbit.key = key;
  assert.equal((await send()).ok, false);
  assert.equal(calls.length, 1);
  consent = ['websiteContent', 'authenticationInfo'];
  response = Response.json({ success_count: 1, failure_count: 0, pending_count: 0 });
  assert.equal((await send()).ok, true);
  assert.equal(calls[1][1].headers.Authorization, `Bearer ${key}`);

  response = new Response('Fails.');
  assert.equal((await send()).ok, false);
  calls = [];
  assert.equal((await send(`${magnet}\nhttps://example.com/`)).ok, false);
  stored.magnetEnabled = false;
  assert.equal((await send()).ok, false);
  assert.equal(calls.length, 0);
});

test('only an enabled, trusted primary activation sends the link', async () => {
  let apply, click;
  const sent = [];
  vm.runInNewContext(source('magnet.js'), {
    chrome: { i18n: { getMessage: (key) => key } },
    sobrio: {
      send: async (message) => { sent.push(message.url); return { ok: true }; },
      toast() {},
      onSettings: (listener) => { apply = listener; },
    },
    window: {
      addEventListener: (type, listener, capture) => {
        assert.equal(type, 'click');
        assert.equal(capture, true);
        click = listener;
      },
      removeEventListener: () => { click = undefined; },
    },
  });
  assert.equal(click, undefined);
  apply({}, { magnetEnabled: true });
  let cancelled = false;
  const event = {
    isTrusted: true, button: 0,
    composedPath: () => [{ localName: 'span' }, { localName: 'a', hasAttribute: () => true, getAttribute: () => magnet }],
    preventDefault: () => { cancelled = true; },
    stopImmediatePropagation() {},
  };
  await click({ ...event, isTrusted: false });
  await click({ ...event, ctrlKey: true });
  assert.equal(cancelled, false);
  assert.deepEqual(sent, []);
  await click(event);
  assert.equal(cancelled, true);
  assert.deepEqual(sent, [magnet]);
  apply({}, { magnetEnabled: false });
  assert.equal(click, undefined);
});
