// Does the page already have a dark theme of its own?
// A simplified port of Dark Reader's src/inject/detector.ts (MIT, see THIRD_PARTY_NOTICES.md).
(() => {
  const COLOR = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/i;

  function parseColor(value) {
    if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    const m = COLOR.exec(value ?? '');
    if (!m) return null;
    const alpha = m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1);
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: alpha };
  }

  function lightness(r, g, b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }
  const lightnessOf = (c) => lightness(c.r, c.g, c.b);

  function schemeFromMeta(content) {
    const value = (content ?? '').trim().toLowerCase();
    if (value === 'dark' || value === 'only dark') return 'dark';
    if (value === 'light' || value === 'only light') return 'light';
    return null;
  }

  // page: {root: {bg, color, scheme, filter}, body: {bg} | null, samples: {bg, color}[]},
  // every color a computed CSS string.
  function isDarkFromSamples(page) {
    const { root, body, samples } = page;
    if (root.filter.includes('invert(1)') || root.scheme === 'dark') return true;

    for (const sample of samples) {
      const bg = parseColor(sample.bg);
      if (!bg) return false;
      // sobrio's dark background: Dark Reader's sheets were still applied, so no verdict.
      if (bg.r === 0 && bg.g === 0 && bg.b === 0 && bg.a === 1) return false;
      if (bg.a === 1) {
        if (lightnessOf(bg) > 0.6) return false;
      } else {
        const text = parseColor(sample.color);
        if (!text || lightnessOf(text) < 0.4) return false;
      }
    }

    const rootBg = parseColor(root.bg);
    const bodyBg = body ? parseColor(body.bg) : { r: 0, g: 0, b: 0, a: 0 };
    if (!rootBg || !bodyBg) return false;
    if (rootBg.a === 0 && bodyBg.a === 0) {
      const text = parseColor(root.color);
      if (text) return lightnessOf(text) > 0.5;
    }
    const rootLightness = 1 - rootBg.a + rootBg.a * lightnessOf(rootBg);
    return (1 - bodyBg.a) * rootLightness + bodyBg.a * lightnessOf(bodyBg) < 0.5;
  }

  const CELL_SIZE = 256;
  const MAX_ROWS = 4;

  function samplePage(doc) {
    const win = doc.defaultView;
    const rootStyle = win.getComputedStyle(doc.documentElement);
    const samples = [];
    const seen = new Set();
    const { innerWidth: width, innerHeight: height } = win;
    const stepX = Math.floor(width / Math.min(MAX_ROWS, Math.ceil(width / CELL_SIZE)));
    const stepY = Math.floor(height / Math.min(MAX_ROWS, Math.ceil(height / CELL_SIZE)));
    for (let y = Math.floor(stepY / 2); y < height; y += stepY) {
      for (let x = Math.floor(stepX / 2); x < width; x += stepX) {
        const el = doc.elementFromPoint(x, y);
        if (!el || seen.has(el) || el.tagName.toLowerCase() === 'img') continue;
        seen.add(el);
        const style = win.getComputedStyle(el);
        samples.push({ bg: style.backgroundColor, color: style.color });
      }
    }
    return {
      root: {
        bg: rootStyle.backgroundColor,
        color: rootStyle.color,
        scheme: rootStyle.colorScheme,
        filter: rootStyle.filter,
      },
      body: doc.body ? { bg: win.getComputedStyle(doc.body).backgroundColor } : null,
      samples,
    };
  }

  // Dark Reader's own sheets: its <style class="darkreader"> elements and the override it adopts
  // after each sheet the page adopts (first rule #__darkreader__adoptedOverride). In Firefox
  // the page's adopted list is read through wrappedJSObject, as Dark Reader itself does.
  function darkReaderSheets(doc) {
    const adopted = doc.adoptedStyleSheets?.wrappedJSObject ?? doc.adoptedStyleSheets ?? [];
    return [
      ...[...doc.styleSheets].filter((s) => s.ownerNode?.classList?.contains('darkreader')),
      ...[...adopted].filter((s) => s.cssRules?.[0]?.selectorText?.startsWith('#__darkreader')),
    ];
  }

  function detectDark(doc) {
    const meta = schemeFromMeta(doc.querySelector('meta[name="color-scheme"]')?.content);
    if (meta) return meta === 'dark';
    if (
      doc.documentElement.classList.contains('dark') ||
      doc.body?.classList.contains('dark') ||
      doc.documentElement.dataset.theme?.toLowerCase() === 'dark'
    ) {
      return true;
    }
    // Look at the page without Dark Reader. Everything happens in one task, so it never paints.
    // Transitions go off first: with them, getComputedStyle reports the color a transition
    // starts from (Dark Reader's), and the custom CSS gives every element one.
    const still = doc.createElement('style');
    still.textContent = '*, *::before, *::after { transition: none !important; }';
    doc.documentElement.append(still);
    const sheets = darkReaderSheets(doc);
    sheets.forEach((s) => (s.disabled = true));
    try {
      return isDarkFromSamples(samplePage(doc));
    } finally {
      sheets.forEach((s) => (s.disabled = false));
      // Settle styles before transitions come back, or every element animates back to dark.
      void doc.documentElement.offsetWidth;
      still.remove();
    }
  }

  function hasSomeStyle(doc) {
    if (doc.querySelector('meta[name="color-scheme"]')) return true;
    if (doc.documentElement.style.backgroundColor || doc.body?.style.backgroundColor) return true;
    return [...doc.styleSheets].some((s) => s.ownerNode && !s.ownerNode.classList?.contains('darkreader'));
  }

  function canCheck(doc) {
    const body = doc.body;
    if (!body || body.scrollHeight < 32 || body.clientHeight < 32 || !body.childElementCount) return false;
    if (!hasSomeStyle(doc)) return false;
    return [...body.children].some((c) => !['SCRIPT', 'STYLE', 'LINK'].includes(c.tagName));
  }

  // Calls back once the page has enough content to judge: as soon as it does, on
  // DOMContentLoaded if it does by then, or at the latest on load.
  function whenReady(doc, callback) {
    if (canCheck(doc)) {
      callback();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      observer.disconnect();
      doc.removeEventListener('readystatechange', onState);
      callback();
    };
    const observer = new MutationObserver(() => canCheck(doc) && finish());
    observer.observe(doc.documentElement, { childList: true });
    const onState = () => {
      if (doc.readyState === 'complete' || (doc.readyState === 'interactive' && canCheck(doc))) finish();
    };
    doc.addEventListener('readystatechange', onState);
    onState();
  }

  const api = { parseColor, lightness, schemeFromMeta, isDarkFromSamples, darkReaderSheets, detectDark, whenReady };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.detector = api;
  if (typeof module === 'object') module.exports = api;
})();
