// The switcher's own look. It lives in a closed shadow root, so pages never reach it.
globalThis.sobrio = globalThis.sobrio || {};
sobrio.SWITCHER_CSS = String.raw`
.backdrop,
.popup,
.inline {
  --s-bg: #000;
  --s-border: #333;
  --s-row: #1a1a1a;
  --s-bar: #fff;
  --s-input: #fff;
  --s-title: #c8c8c8;
  --s-hit: #fff;
  --s-host: #a6a6a6;
  --s-sub: #858585;
  --s-font: system-ui, sans-serif;
  --s-veil: rgba(0, 0, 0, .5);
}
/* sobrio's own pages (the popup, the new tab) have the userContent.css theme hook from their first
   paint, before switcher.js sets the same colors: a light theme shows no black box first. Never a
   website's switcher, where the page could set these. Without the hook, the defaults above. */
.popup,
.inline {
  --s-bg: var(--sobrio-background, #000);
  --s-border: var(--sobrio-border, #333);
  --s-row: var(--sobrio-selection, #1a1a1a);
  --s-bar: var(--sobrio-accent, #fff);
  --s-input: var(--sobrio-text, #fff);
  --s-title: color-mix(in srgb, var(--sobrio-text, #c8c8c8) 82%, var(--sobrio-background, #c8c8c8));
  --s-hit: var(--sobrio-accent, #fff);
  --s-host: color-mix(in srgb, var(--sobrio-text, #a6a6a6) 64%, var(--sobrio-background, #a6a6a6));
  --s-sub: var(--sobrio-text-muted, #858585);
}
.backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 12vh;
  background: var(--s-veil);
}
.box {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: min(640px, calc(100vw - 32px));
  max-height: 70vh;
  background: var(--s-bg);
  border: 1px solid var(--s-border);
  color: var(--s-title);
  font: 15px/1.4 var(--s-font);
  text-align: left;
}
.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--s-border);
}
.mode svg {
  display: block;
}
.mode {
  flex: none;
  color: var(--s-title);
  font-size: 13px;
}
.input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--s-input);
  caret-color: var(--s-input);
  font: inherit;
  font-size: 17px;
}
.input::placeholder {
  color: var(--s-sub);
}
.list {
  margin: 0;
  padding: 4px 0;
  overflow-y: auto;
  list-style: none;
  scrollbar-width: thin;
  scrollbar-color: var(--s-border) transparent;
}
.row {
  padding: 7px 14px 7px 12px;
  border-left: 2px solid transparent;
  cursor: pointer;
}
.row.selected {
  border-left-color: var(--s-bar);
  background: var(--s-row);
}
.row.selected .title {
  color: var(--s-input);
}
.title,
.sub {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.sub {
  margin-top: 2px;
  color: var(--s-sub);
  font-size: 13px;
}
.host {
  color: var(--s-host);
}
b {
  color: var(--s-hit);
  font-weight: 700;
}
.empty {
  padding: 10px 14px;
  color: var(--s-sub);
}
.hints {
  padding: 8px 14px;
  border-top: 1px solid var(--s-border);
  color: var(--s-sub);
  font-size: 12px;
}
.inline .box {
  width: 100%;
  max-height: 52vh;
  background: transparent;
}
.inline .box.blank .bar {
  border-bottom: 0;
}
.list[hidden],
.hints[hidden] {
  display: none;
}
.popup .box {
  width: 640px;
  max-height: 560px;
  border: 0;
}
/* Round corners from the theme: switcher.js draws the box's fill and border as one image. */
.round .box {
  border-image: var(--s-round);
  background: transparent;
}
`;
