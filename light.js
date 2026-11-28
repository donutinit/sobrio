// A content script the background registers only while the userContent.css theme hook is light
// (background.js, lightScript). At document_start, before storage answers, it tells page.js not to
// put up its black cover: on paper, that would blink. Either one may run first.
globalThis.sobrio = globalThis.sobrio || {};
sobrio.light = true;
sobrio.onLight?.();
