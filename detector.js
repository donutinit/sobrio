// Does the page already have a dark theme of its own?
// A simplified port of Dark Reader's src/inject/detector.ts (MIT, see THIRD_PARTY_NOTICES.md).
(() => {
  // Computed colors come as rgb() for the classic syntaxes and in their own space for the rest:
  // oklch() (Tailwind 4), lab(), color(display-p3 …), color(srgb …) from color-mix()… All of them
  // end up here as sRGB from 0 to 255, the scale the lightness formula expects.
  const COLOR = /^([a-z-]+)\(\s*([^()]*?)\s*\)$/;

  // Linear RGB of each space to XYZ (D65, except prophoto-rgb, which is D50). CSS Color 4.
  const TO_XYZ = {
    'srgb-linear': [[0.41239079926595934, 0.357584339383878, 0.1804807884018343], [0.21263900587151027, 0.715168678767756, 0.07219231536073371], [0.01933081871559182, 0.11919477979462598, 0.9505321522496607]],
    'display-p3': [[0.4865709486482162, 0.26566769316909306, 0.1982172852343625], [0.2289745640697488, 0.6917385218365064, 0.079286914093745], [0, 0.04511338185890264, 1.043944368900976]],
    'a98-rgb': [[0.5766690429101305, 0.1855582379065463, 0.1882286462349947], [0.29734497525053605, 0.6273635662554661, 0.0752914584939979], [0.02703136138641234, 0.07068885253582723, 0.9913375368376388]],
    'prophoto-rgb': [[0.7977666449006423, 0.13518129740053308, 0.0313477341283922], [0.2880748288194013, 0.711835234241873, 0.00008993693872564], [0, 0, 0.8251046025104602]],
    rec2020: [[0.6369580483012914, 0.14461690358620832, 0.1688809751641721], [0.2627002120112671, 0.6779980715188708, 0.05930171646986196], [0, 0.028072693049087428, 1.060985057710791]],
  };
  const XYZ_TO_SRGB = [[3.2409699419045226, -1.537383177570094, -0.4986107602930034], [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559], [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]];
  const D50_TO_D65 = [[0.955473421488075, -0.02309845494876471, 0.06325924320057072], [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323], [0.012314014864481998, -0.020507649298898964, 1.330365926242124]];
  const D50_SPACES = new Set(['prophoto-rgb', 'xyz-d50', 'lab', 'lch']);

  const multiply = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
  const signed = (f) => (c) => Math.sign(c) * f(Math.abs(c));
  const SRGB_LINEAR = signed((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const SRGB_GAMMA = signed((c) => (c > 0.0031308 ? 1.055 * c ** (1 / 2.4) - 0.055 : 12.92 * c));
  const LINEAR = {
    'srgb-linear': (c) => c,
    'display-p3': SRGB_LINEAR,
    'a98-rgb': signed((c) => c ** (563 / 256)),
    'prophoto-rgb': signed((c) => (c <= 16 / 512 ? c / 16 : c ** 1.8)),
    rec2020: signed((c) => (c < 0.018053968510807 * 4.5 ? c / 4.5 : ((c + 0.09929682680944) / 1.09929682680944) ** (1 / 0.45))),
  };

  function labToXyz([l, a, b]) {
    const k = 24389 / 27;
    const e = 216 / 24389;
    const fy = (l + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;
    const cube = (f) => (f ** 3 > e ? f ** 3 : (116 * f - 16) / k);
    return [cube(fx) * 0.3457 / 0.3585, l > k * e ? fy ** 3 : l / k, cube(fz) * (1 - 0.3457 - 0.3585) / 0.3585];
  }

  function oklabToLinearSrgb([l, a, b]) {
    const lms = [
      (l + 0.3963377774 * a + 0.2158037573 * b) ** 3,
      (l - 0.1055613458 * a - 0.0638541728 * b) ** 3,
      (l - 0.0894841775 * a - 1.291485548 * b) ** 3,
    ];
    return multiply([[4.0767416621, -3.3077115913, 0.2309699292], [-1.2684380046, 2.6097574011, -0.3413193965], [-0.0041960863, -0.7034186147, 1.707614701]], lms);
  }

  const polar = ([l, c, h]) => [l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];

  // A component: a number, a percentage of its reference range, an angle in degrees, or none.
  function number(text, percentOf = 1) {
    if (text === 'none') return 0;
    const value = parseFloat(text);
    if (!Number.isFinite(value)) return NaN;
    return text.endsWith('%') ? (value / 100) * percentOf : value;
  }

  function parseColor(value) {
    const text = String(value ?? '').trim().toLowerCase();
    if (text === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    const m = COLOR.exec(text);
    if (!m) return null;
    let [, name, args] = m;
    const [channels, alphaText] = args.split('/');
    const parts = channels.trim().split(/\s*,\s*|\s+/);
    if (name === 'color') name = parts.shift();
    // rgba(1, 2, 3, 0.5): the legacy syntax puts the alpha fourth.
    const alpha = alphaText ?? (parts.length === 4 ? parts.pop() : '1');
    if (parts.length !== 3) return null;
    const a = Math.min(1, Math.max(0, number(alpha.trim(), 1)));
    const clamp = (c) => Math.min(255, Math.max(0, c));
    if (name === 'rgb' || name === 'rgba') {
      const [r, g, b] = parts.map((p) => clamp(number(p, 255)));
      return [r, g, b, a].every(Number.isFinite) ? { r, g, b, a } : null;
    }
    let rgb; // gamma-encoded sRGB, 0 to 1
    if (name === 'srgb') rgb = parts.map((p) => number(p));
    else if (LINEAR[name]) rgb = multiply(XYZ_TO_SRGB, toD65(name, multiply(TO_XYZ[name], parts.map((p) => LINEAR[name](number(p)))))).map(SRGB_GAMMA);
    else if (name === 'xyz' || name === 'xyz-d65' || name === 'xyz-d50') rgb = multiply(XYZ_TO_SRGB, toD65(name, parts.map((p) => number(p)))).map(SRGB_GAMMA);
    else if (name === 'lab') rgb = fromLab([number(parts[0], 100), number(parts[1], 125), number(parts[2], 125)]);
    else if (name === 'lch') rgb = fromLab(polar([number(parts[0], 100), number(parts[1], 150), number(parts[2])]));
    else if (name === 'oklab') rgb = oklabToLinearSrgb([number(parts[0]), number(parts[1], 0.4), number(parts[2], 0.4)]).map(SRGB_GAMMA);
    else if (name === 'oklch') rgb = oklabToLinearSrgb(polar([number(parts[0]), number(parts[1], 0.4), number(parts[2])])).map(SRGB_GAMMA);
    else return null;
    if (![...rgb, a].every(Number.isFinite)) return null;
    const [r, g, b] = rgb.map((c) => clamp(c * 255));
    return { r, g, b, a };
  }

  const toD65 = (space, xyz) => (D50_SPACES.has(space) ? multiply(D50_TO_D65, xyz) : xyz);
  const fromLab = (lab) => multiply(XYZ_TO_SRGB, toD65('lab', labToXyz(lab))).map(SRGB_GAMMA);

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

  // The computed color-scheme of the root: "dark" or "only dark", never "light dark".
  const darkScheme = (scheme) => {
    const words = String(scheme ?? '').split(/\s+/);
    return words.includes('dark') && !words.includes('light');
  };

  // page: {root: {bg, color, scheme, filter}, body: {bg} | null, samples: {bg, color}[]},
  // every color a computed CSS string, read with Dark Reader's sheets off.
  function isDarkFromSamples(page) {
    const { root, body, samples } = page;
    if (root.filter.includes('invert(1)') || darkScheme(root.scheme)) return true;

    for (const sample of samples) {
      const bg = parseColor(sample.bg);
      if (!bg) return false;
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

  // Up to 16 elements on a grid over the viewport. Hit testing only needs the layout, which
  // Dark Reader does not change, so this runs before its sheets go off.
  function sampleElements(doc) {
    const { innerWidth: width, innerHeight: height } = doc.defaultView;
    const found = new Set();
    const stepX = Math.floor(width / Math.min(MAX_ROWS, Math.ceil(width / CELL_SIZE)));
    const stepY = Math.floor(height / Math.min(MAX_ROWS, Math.ceil(height / CELL_SIZE)));
    for (let y = Math.floor(stepY / 2); y < height; y += stepY) {
      for (let x = Math.floor(stepX / 2); x < width; x += stepX) {
        const el = doc.elementFromPoint(x, y);
        if (el && el.tagName.toLowerCase() !== 'img') found.add(el);
      }
    }
    return [...found];
  }

  function readPage(doc, elements) {
    const win = doc.defaultView;
    const rootStyle = win.getComputedStyle(doc.documentElement);
    return {
      root: {
        bg: rootStyle.backgroundColor,
        color: rootStyle.color,
        scheme: rootStyle.colorScheme,
        filter: rootStyle.filter,
      },
      body: doc.body ? { bg: win.getComputedStyle(doc.body).backgroundColor } : null,
      samples: elements.map((el) => {
        const style = win.getComputedStyle(el);
        return { bg: style.backgroundColor, color: style.color };
      }),
    };
  }

  // Dark Reader's own sheets in a document or shadow root: its <style class="darkreader"> elements
  // and the override it adopts after each sheet the page adopts (first rule
  // #__darkreader__adoptedOverride). In Firefox the page's adopted list is read through
  // wrappedJSObject, as Dark Reader itself does.
  function darkReaderSheets(root) {
    const adopted = root.adoptedStyleSheets?.wrappedJSObject ?? root.adoptedStyleSheets ?? [];
    return [
      ...[...root.styleSheets].filter((s) => s.ownerNode?.classList?.contains('darkreader')),
      ...[...adopted].filter((s) => s.cssRules?.[0]?.selectorText?.startsWith('#__darkreader')),
    ];
  }

  // Marks the elements being read: transitions off for them only, through a rule that stays in
  // the page. A rule for every element would restyle the whole page once more to take it out.
  const STILL = 'data-sobrio-still';

  function ensureStillRule(doc) {
    if (doc.getElementById('sobrio-still')?.isConnected) return;
    const style = doc.createElement('style');
    style.id = 'sobrio-still';
    style.textContent = `[${STILL}] { transition: none !important; }`;
    doc.documentElement.append(style);
  }

  function hintFromPage(doc) {
    const meta = schemeFromMeta(doc.querySelector('meta[name="color-scheme"]')?.content);
    if (meta) return meta === 'dark';
    if (
      doc.documentElement.classList.contains('dark') ||
      doc.body?.classList.contains('dark') ||
      doc.documentElement.dataset.theme?.toLowerCase() === 'dark'
    ) {
      return true;
    }
    return null;
  }

  function detectDark(doc) {
    const hint = hintFromPage(doc);
    if (hint !== null) return hint;
    const elements = sampleElements(doc);
    const marked = [...new Set([doc.documentElement, doc.body, ...elements].filter(Boolean))];
    // The sampled shadow hosts can take colors from Dark Reader's sheets in their own roots (:host).
    const sheets = [doc, ...marked.map((el) => el.shadowRoot).filter(Boolean)].flatMap(darkReaderSheets);
    if (!sheets.length) return isDarkFromSamples(readPage(doc, elements));
    // Look at the page without Dark Reader. Everything happens in one task, so it never paints.
    // Transitions go off first, or getComputedStyle reports the color a transition starts from
    // (Dark Reader's) on an element the page gives one.
    ensureStillRule(doc);
    marked.forEach((el) => el.setAttribute(STILL, ''));
    sheets.forEach((s) => (s.disabled = true));
    try {
      return isDarkFromSamples(readPage(doc, elements));
    } finally {
      sheets.forEach((s) => (s.disabled = false));
      // Settle styles before transitions come back, or the marked elements animate back to dark.
      void doc.documentElement.offsetWidth;
      marked.forEach((el) => el.removeAttribute(STILL));
    }
  }

  // What the page's own styles are now, cheaply: the sheets it has (Dark Reader's apart), their
  // media and whether they are on. The same answer as last time means a new look would see the same.
  function styleSignature(doc) {
    const sheets = [...doc.styleSheets].filter((s) => !s.ownerNode?.classList?.contains('darkreader'));
    const adopted = doc.adoptedStyleSheets?.wrappedJSObject ?? doc.adoptedStyleSheets ?? [];
    return `${adopted.length}|${sheets.map((s) => `${s.href ?? ''} ${s.media.mediaText} ${s.disabled}`).join('|')}`;
  }

  // A change to an attribute of <html> or <body> that may switch the page's theme: a class with
  // dark, light, theme… in it, an attribute named or valued so (dark, data-theme, data-color-mode),
  // or a new background or color-scheme in its style. Dark Reader's and sobrio's own do not count.
  // changes: {name, oldValue, value}[]
  const THEME_WORD = /dark|light|night|theme|scheme|mode|black|dim/i;
  const STYLE_THEME = /(?:^|;)\s*(?:background(?:-color)?|color-scheme)\s*:[^;]*/gi;

  function themeChanged(changes) {
    return changes.some(({ name, oldValue, value }) => {
      if (name.startsWith('data-darkreader') || name === STILL) return false;
      const before = oldValue ?? '';
      const after = value ?? '';
      if (name === 'class') {
        const old = new Set(before.split(/\s+/));
        const now = new Set(after.split(/\s+/));
        return [...old, ...now].some((token) => old.has(token) !== now.has(token) && THEME_WORD.test(token));
      }
      if (name === 'style') {
        const themed = (text) => (text.match(STYLE_THEME) ?? []).map((d) => d.replace(/^;/, '').trim()).join(';');
        return themed(before) !== themed(after);
      }
      return oldValue !== value && (THEME_WORD.test(name) || THEME_WORD.test(before) || THEME_WORD.test(after));
    });
  }

  function hasSomeStyle(doc) {
    if (doc.querySelector('meta[name="color-scheme"]')) return true;
    if (doc.documentElement.style.backgroundColor || doc.body?.style.backgroundColor) return true;
    return [...doc.styleSheets].some((s) => s.ownerNode && !s.ownerNode.classList?.contains('darkreader'));
  }

  function canCheck(doc) {
    const body = doc.body;
    if (!body || !body.childElementCount) return false;
    if (![...body.children].some((c) => !['SCRIPT', 'STYLE', 'LINK'].includes(c.tagName))) return false;
    if (!hasSomeStyle(doc)) return false;
    return body.scrollHeight >= 32 && body.clientHeight >= 32;
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

  const api = {
    parseColor, lightness, schemeFromMeta, isDarkFromSamples, darkReaderSheets, detectDark, whenReady,
    styleSignature, themeChanged,
  };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.detector = api;
  if (typeof module === 'object') module.exports = api;
})();
