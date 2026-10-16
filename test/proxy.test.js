const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

// The same cut tools/vendor-darkreader.py makes: from "    function injectProxy(" to its "    }".
function injectProxyOf(bundle) {
  const lines = bundle.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => line.startsWith('    function injectProxy('));
  const end = lines.findIndex((line, i) => i > start && line === '    }');
  return lines.slice(start, end + 1).map((line) => (line.startsWith('  ') ? line.slice(2) : line)).join('\n');
}

test('proxy.js carries the injectProxy of the darkreader.js next to it', () => {
  const source = injectProxyOf(read('darkreader.js'));
  assert.ok(source.startsWith('  function injectProxy('));
  assert.ok(read('proxy.js').includes(source), 'run python3 -I tools/vendor-darkreader.py --proxy-only');
});

test("proxy.js runs in the page's own world, in every frame, before the page's scripts", () => {
  const manifest = JSON.parse(read('manifest.json'));
  const entry = manifest.content_scripts.find((script) => script.js.includes('proxy.js'));
  assert.deepEqual(entry.js, ['proxy.js']);
  assert.equal(entry.world, 'MAIN');
  assert.equal(entry.run_at, 'document_start');
  assert.equal(entry.all_frames, true);
  assert.equal(entry.match_about_blank, true);
  assert.ok(read('scripts/pack.sh').includes(' proxy.js '));
});
