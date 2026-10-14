// sobrio's interface icons, from its brand: a 24 grid with the drawing in 16 × 16, a 1.5 stroke
// with square ends, nothing round, and solid halves or blocks like the isotype's dot. Each icon is
// a list of [tag, attributes]; `fill: true` marks a solid piece. They take the text color.
(() => {
  const ICONS = {
    bookmark: [['path', { d: 'M6 3.75 H18 V20.25 L12 15.5 L6 20.25 Z' }]],
    style: [['path', { d: 'M4 20 V4 H20' }], ['rect', { x: 9, y: 9, width: 11, height: 11, fill: true }]],
    dark: [['rect', { x: 4, y: 4, width: 16, height: 16 }], ['rect', { x: 12, y: 3.25, width: 8.75, height: 17.5, fill: true }]],
    exceptions: [['rect', { x: 4, y: 4, width: 16, height: 16 }], ['path', { d: 'M4 20 L20 4' }]],
    switcher: [['rect', { x: 4, y: 4, width: 11, height: 11 }], ['path', { d: 'M15 15 L20 20' }]],
    shortcuts: [['rect', { x: 4, y: 6, width: 16, height: 12 }], ['rect', { x: 8, y: 13, width: 8, height: 2, fill: true }]],
    newtab: [['rect', { x: 4, y: 4, width: 16, height: 16 }], ['rect', { x: 3.25, y: 3.25, width: 17.5, height: 5, fill: true }]],
    media: [['path', { d: 'M4 6 L11 12 L4 18 Z M12 6 L19 12 L12 18 Z', fill: true }]],
    stats: [
      ['path', { d: 'M3.75 20.25 H20.25' }],
      ['rect', { x: 5, y: 13, width: 3, height: 6.5, fill: true }],
      ['rect', { x: 10.5, y: 9, width: 3, height: 10.5, fill: true }],
      ['rect', { x: 16, y: 5, width: 3, height: 14.5, fill: true }],
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
    const node = svg('0 0 24 24', size, {
      fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'square',
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
