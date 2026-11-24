const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// scripts/publish-amo.py sends the fenced block under "Notes for reviewers" as the version's
// approval notes, and AMO refuses the whole version when they pass 3000 characters.
test('the notes for AMO reviewers fit in 3000 characters', () => {
  const text = fs.readFileSync(path.join(__dirname, '..', 'docs', 'amo.md'), 'utf8');
  const notes = text.split('## Notes for reviewers')[1].split('```')[1].trim();
  assert.ok(notes.length > 0);
  assert.ok(notes.length <= 3000, `${notes.length} characters`);
});
