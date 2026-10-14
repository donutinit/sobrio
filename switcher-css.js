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
  --s-title: #888;
  --s-hit: #fff;
  --s-sub: #555;
  --s-font: system-ui, sans-serif;
}
.backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 12vh;
  background: rgba(0, 0, 0, .5);
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
.title,
.sub {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.sub {
  margin-top: 2px;
  color: var(--s-sub);
  font-size: 12px;
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
.popup .box {
  width: 640px;
  max-height: 560px;
  border: 0;
}
`;
