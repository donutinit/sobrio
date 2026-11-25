const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', name));

// tools/darkreader.patch (diff -u) taken back out of the patched file, exactly: every line the
// patch added, and every line of context, must be where the patch says. Lines keep their ends.
function unpatch(data, patch) {
  const lines = data.toString('latin1').split('\n');
  const out = [];
  let at = 0;
  const body = patch.toString('latin1').split('\n');
  for (let i = 0; i < body.length;) {
    const header = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(body[i++]);
    if (!header) continue;
    const start = Number(header[1]) - 1;
    out.push(...lines.slice(at, start));
    at = start;
    for (; i < body.length && ' -+'.includes(body[i][0]) && body[i] !== ''; i++) {
      const kind = body[i][0];
      const text = body[i].slice(1);
      if (kind === '-') {
        out.push(text);
        continue;
      }
      assert.equal(lines[at], text, `darkreader.js line ${at + 1} is not what the patch left there`);
      if (kind === ' ') out.push(text);
      at += 1;
    }
  }
  return Buffer.from([...out, ...lines.slice(at)].join('\n'), 'latin1');
}

test('darkreader.js is the npm file plus tools/darkreader.patch, and nothing else', () => {
  const pristine = unpatch(read('darkreader.js'), read('tools/darkreader.patch'));
  const sha256 = crypto.createHash('sha256').update(pristine).digest('hex');
  const noted = /sha256 of the npm file: ([0-9a-f]{64})/.exec(read('docs/amo.md').toString())?.[1];
  assert.equal(sha256, noted, 'docs/amo.md gives another sha256 for the file as npm has it');
});

test('the patch only adds what sobrio marks as its own', () => {
  const added = read('tools/darkreader.patch').toString('latin1').split('\n').filter((line) => line.startsWith('+') && !line.startsWith('+++'));
  assert.ok(added.length > 100);
  assert.ok(added.some((line) => line.includes('sobrio:')));
  // Nothing that reaches outside the page: no network, no storage, no messages.
  for (const line of added) {
    assert.doesNotMatch(line, /\b(fetch|XMLHttpRequest|WebSocket|sendMessage|localStorage|indexedDB|eval|importScripts)\b|new Function/, line);
  }
});

test('the patched engine still hands its code to define, and gives the page a say on its slices', () => {
  const text = read('darkreader.js').toString();
  assert.match(text, /exports\.setRenderingListener = setRenderingListener;/);
  assert.match(text, /exports\.isRendering = isRendering;/);
  assert.match(read('page.js').toString(), /setRenderingListener\?\./);
});
