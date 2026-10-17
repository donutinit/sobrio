// First content script. darkreader.js patches chrome.runtime.sendMessage and its
// version drops the returned promise, so keep the native one for sobrio's own messages.
globalThis.sobrio = globalThis.sobrio || {};
sobrio.send = chrome.runtime.sendMessage.bind(chrome.runtime);

// Dark Reader takes a CSS variable for a color only if the first value it reads is one. YouTube
// first resets its theme variables to initial on :root and gives them their colors after, so
// they stayed light (its top bar white). In this world only (the page never sees it), a CSS-wide
// keyword given to a variable on :root or html reads as empty, and Dark Reader skips it: there
// it is no value at all, the same as not declaring the variable.
(() => {
  const CSS_WIDE = /^\s*(initial|inherit|unset|revert|revert-layer)\s*$/i;
  const ROOT = /^\s*(:root|html)(\s*,\s*(:root|html|:host))*\s*$/i;
  const { getPropertyValue } = CSSStyleDeclaration.prototype;
  CSSStyleDeclaration.prototype.getPropertyValue = function (property) {
    const value = getPropertyValue.call(this, property);
    if (property.startsWith?.('--') && CSS_WIDE.test(value) && ROOT.test(this.parentRule?.selectorText ?? '')) return '';
    return value;
  };
})();

// Dark Reader rebuilds a rule where it is (deleteRule(i), then insertRule(text, i)) each time it
// learns the type of one more variable the rule declares. GitHub's theme rules declare hundreds,
// and each was parsed again hundreds of times while the page loaded: a second of main thread. A
// big rule being rebuilt takes an empty placeholder at once and its last text at the end of the
// task, parsed once. Its place in the sheet never changes, so Dark Reader's indexes stay right.
(() => {
  const BIG = 2000; // characters; below this, parsing again costs less than the placeholder
  const PLACEHOLDER = '#__sobrio-pending {}';
  const pending = new Map(); // placeholder rule → [sheet or grouping rule, text, its insertRule, deleteRule]
  let deleted = null; // [target, index] of the deleteRule just made: an insertRule there is a rebuild
  for (const proto of [CSSStyleSheet.prototype, CSSGroupingRule.prototype]) {
    const { insertRule, deleteRule } = proto;
    proto.deleteRule = function (index) {
      deleteRule.call(this, index);
      deleted = [this, index];
    };
    proto.insertRule = function (text, index = 0) {
      const rebuild = deleted?.[0] === this && deleted[1] === index;
      deleted = null;
      if (!rebuild || typeof text !== 'string' || text.length < BIG) return insertRule.call(this, text, index);
      const at = insertRule.call(this, PLACEHOLDER, index);
      if (!pending.size) queueMicrotask(flush);
      pending.set(this.cssRules[at], [this, text, insertRule, deleteRule]);
      return at;
    };
  }

  // A placeholder rebuilt again in the same task, or cleared with its sheet, is no longer there.
  function flush() {
    for (const [placeholder, [target, text, insertRule, deleteRule]] of pending) {
      if (!placeholder.parentStyleSheet) continue;
      const index = Array.prototype.indexOf.call(target.cssRules, placeholder);
      if (index === -1) continue;
      deleteRule.call(target, index);
      try {
        insertRule.call(target, text, index);
      } catch {
        insertRule.call(target, PLACEHOLDER, index); // as before: a rule that does not parse is left out
      }
    }
    pending.clear();
  }
})();
