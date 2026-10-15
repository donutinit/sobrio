// sobrio's interface icons, from its brand: drawn on the isotype's 16 grid, so at 16 px (and at
// any multiple) every line lands on whole pixels and nothing is blurred. 1 px outlines on half
// pixels, solid fills on whole ones, nothing round, and solid halves or blocks like the isotype's
// dot. Each icon is a list of [tag, attributes]; `fill: true` marks a solid piece. They take the
// text color.
(() => {
  const BOX = { x: 1.5, y: 1.5, width: 13, height: 13 };
  const ICONS = {
    bookmark: [['path', { d: 'M3.5 1.5 H12.5 V14.5 L8 11 L3.5 14.5 Z' }]],
    style: [['path', { d: 'M1.5 15 V1.5 H15' }], ['rect', { x: 5, y: 5, width: 10, height: 10, fill: true }]],
    dark: [['rect', BOX], ['rect', { x: 8, y: 1, width: 7, height: 14, fill: true }]],
    exceptions: [['rect', BOX], ['path', { d: 'M2 14 L14 2' }]],
    switcher: [['rect', { x: 1.5, y: 1.5, width: 8, height: 8 }], ['path', { d: 'M10 10 L14.5 14.5' }]],
    shortcuts: [['rect', { x: 1.5, y: 3.5, width: 13, height: 9 }], ['rect', { x: 5, y: 9, width: 6, height: 1, fill: true }]],
    newtab: [['rect', BOX], ['rect', { x: 1, y: 1, width: 14, height: 4, fill: true }]],
    media: [['path', { d: 'M1 3 L7 8 L1 13 Z M8 3 L14 8 L8 13 Z', fill: true }]],
    stats: [
      ['path', { d: 'M1 14.5 H15' }],
      ['rect', { x: 2, y: 9, width: 2, height: 5, fill: true }],
      ['rect', { x: 7, y: 6, width: 2, height: 8, fill: true }],
      ['rect', { x: 12, y: 3, width: 2, height: 11, fill: true }],
    ],
  };

  // The isotype on its 16 grid, the dot cut out so the background shows through.
  const ISOTYPE = 'M0 0H16V16H0Z M10 10V13H13V10Z';

  const NS = 'http://www.w3.org/2000/svg';

  function svg(viewBox, size, attrs = {}) {
    const node = document.createElementNS(NS, 'svg');
    const all = { viewBox, width: size, height: size, 'aria-hidden': 'true', focusable: 'false', ...attrs };
    for (const [name, value] of Object.entries(all)) node.setAttribute(name, String(value));
    return node;
  }

  function icon(name, size = 16) {
    const node = svg('0 0 16 16', size, {
      fill: 'none', stroke: 'currentColor', 'stroke-width': 1, 'stroke-linecap': 'square', 'shape-rendering': 'crispEdges',
    });
    for (const [tag, { fill, ...attrs }] of ICONS[name] ?? []) {
      const part = document.createElementNS(NS, tag);
      for (const [key, value] of Object.entries(attrs)) part.setAttribute(key, String(value));
      if (fill) {
        part.setAttribute('fill', 'currentColor');
        part.setAttribute('stroke', 'none');
      }
      node.append(part);
    }
    return node;
  }

  function isotype(size = 16) {
    const node = svg('0 0 16 16', size, { 'shape-rendering': 'crispEdges' });
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', ISOTYPE);
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('fill-rule', 'evenodd');
    node.append(path);
    return node;
  }

  const api = { ICONS, ISOTYPE, icon, isotype };
  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.icons = api;
  if (typeof module === 'object') module.exports = api;
})();
