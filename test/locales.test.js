const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Every language says everything English says, with the same placeholders, and keeps the house rules.
const root = path.join(__dirname, '..', '_locales');
const read = (locale) => JSON.parse(fs.readFileSync(path.join(root, locale, 'messages.json'), 'utf8'));
const en = read('en');
const locales = fs.readdirSync(root).filter((name) => name !== 'en');
const tokens = (text) => (text.match(/\$[A-Za-z_]+\$/g) ?? []).sort();

test('there are translations', () => {
  assert.ok(locales.length >= 20, locales.join(' '));
});

for (const locale of locales) {
  test(`${locale}: every string, with the same placeholders`, () => {
    const messages = read(locale);
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(en).sort());
    for (const [key, source] of Object.entries(en)) {
      const message = messages[key].message;
      assert.ok(typeof message === 'string' && message.trim(), `${key}: empty`);
      assert.deepEqual(messages[key].placeholders, source.placeholders, `${key}: placeholders`);
      assert.deepEqual(tokens(message), tokens(source.message), `${key}: $TOKENS$`);
      assert.ok(!/[–—]/.test(message), `${key}: a dash`);
    }
    assert.equal(messages.name.message, 'sobrio');
    assert.ok(messages.description.message.length <= 132, 'the manifest description is at most 132 characters');
  });
}
