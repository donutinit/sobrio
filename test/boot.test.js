const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

// boot.js as a content script sees it: the extension's messages and the CSSOM it patches.
function bootContext() {
  const css = () => {
    const type = function () {};
    type.prototype.insertRule = () => 0;
    type.prototype.deleteRule = () => {};
    type.prototype.getPropertyValue = () => '';
    return type;
  };
  const context = vm.createContext({
    chrome: { runtime: { sendMessage() {} } },
    CSSStyleDeclaration: css(),
    CSSStyleSheet: css(),
    CSSGroupingRule: css(),
    queueMicrotask,
  });
  vm.runInContext(read('boot.js'), context);
  return context;
}

test('darkreader.js hands its code to an AMD define instead of running it', () => {
  const calls = [];
  const context = vm.createContext({ define: Object.assign((...args) => calls.push(args), { amd: {} }) });
  // No document, no window: running its code here would throw.
  vm.runInContext(read('darkreader.js'), context);
  assert.equal(calls.length, 1);
  assert.deepEqual([...calls[0][0]], ['exports']); // an array of another realm
  assert.equal(typeof calls[0][1], 'function');
  assert.equal(context.DarkReader, undefined);
});

test("boot.js keeps Dark Reader's code and runs it once, when asked", () => {
  const context = bootContext();
  assert.equal(typeof context.define, 'function');
  assert.ok(context.define.amd);
  let runs = 0;
  context.define(['exports'], (exported) => {
    runs += 1;
    exported.enable = () => 'on';
  });
  assert.equal(context.define, undefined, 'the define is gone once darkreader.js used it');
  assert.equal(runs, 0);
  const engine = context.sobrio.darkReader();
  assert.equal(runs, 1);
  assert.equal(engine.enable(), 'on');
  assert.equal(context.sobrio.darkReader(), engine);
  assert.equal(runs, 1);
});

test('boot.js gives darkreader.js its define: the real bundle stays asleep after both load', () => {
  const context = bootContext();
  vm.runInContext(read('darkreader.js'), context);
  assert.equal(context.DarkReader, undefined);
  assert.equal(typeof context.sobrio.darkReader, 'function');
});

test('boot.js comes before darkreader.js, and page.js after both', () => {
  const manifest = JSON.parse(read('manifest.json'));
  const { js } = manifest.content_scripts.find((script) => script.js.includes('darkreader.js'));
  assert.ok(js.indexOf('boot.js') < js.indexOf('darkreader.js'));
  assert.ok(js.indexOf('darkreader.js') < js.indexOf('page.js'));
});

test('the switcher is a content script of the top frame, with the files a late tab gets', () => {
  const manifest = JSON.parse(read('manifest.json'));
  const entry = manifest.content_scripts.find((script) => script.js.includes('switcher.js'));
  assert.deepEqual(entry.js, ['stats.js', 'match.js', 'icons.js', 'switcher-css.js', 'switcher.js']);
  assert.equal(entry.run_at, 'document_start');
  assert.equal(entry.all_frames, undefined);
  // settings.js is in the page already, from the content scripts of every frame.
  assert.ok(manifest.content_scripts.some((script) => script.all_frames && script.js.includes('settings.js')));
  const late = /files: \[([^\]]+)\]/.exec(read('background.js'))[1].split(',').map((name) => name.trim().replace(/'/g, ''));
  assert.deepEqual(late, ['settings.js', ...entry.js]);
});
