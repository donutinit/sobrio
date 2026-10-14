// The switcher's own look. It lives in a closed shadow root, so pages never reach it.
globalThis.sobrio = globalThis.sobrio || {};
sobrio.SWITCHER_CSS = String.raw`
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
  background: #000;
  border: 1px solid #333;
  color: #888;
  font: 15px/1.4 system-ui, sans-serif;
  text-align: left;
}
.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #333;
}
.mode {
  flex: none;
  color: #888;
  font-size: 13px;
}
.input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  caret-color: #fff;
  font: inherit;
  font-size: 17px;
}
.input::placeholder {
  color: #555;
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
  border-left-color: #fff;
  background: #1a1a1a;
}
.title,
.sub {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.sub {
  margin-top: 2px;
  color: #555;
  font-size: 12px;
}
b {
  color: #fff;
  font-weight: 700;
}
.empty {
  padding: 10px 14px;
  color: #555;
}
.hints {
  padding: 8px 14px;
  border-top: 1px solid #333;
  color: #555;
  font-size: 12px;
}
.popup .box {
  width: 640px;
  max-height: 560px;
  border: 0;
}
`;
