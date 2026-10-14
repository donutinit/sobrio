// The stylesheet sobrio puts on every site, built from the switches in settings.css.
// With everything on it is the stylesheet v0.1 shipped as custom-css.js.
(() => {
  const EVERY = '*,\n*::before,\n*::after';
  const OUTSIDE_YOUTUBE_PLAYER =
    '*:not(#movie_player, #movie_player *),\n' +
    '*:not(#movie_player, #movie_player *)::before,\n' +
    '*:not(#movie_player, #movie_player *)::after';

  const rule = (selector, declarations) =>
    `${selector} {\n${declarations.map((d) => `  ${d} !important;`).join('\n')}\n}`;

  // theme.corners comes from --sobrio-corners in userContent.css and wins over the switch.
  function buildCss(css, theme) {
    const corners = theme?.corners ? theme.corners === 'square' : css.corners;
    const rules = [];
    if (css.smoothScroll) rules.push(rule('html', ['scroll-behavior: auto']));
    const effects = [];
    if (corners) effects.push('border-radius: 0');
    if (css.shadows) effects.push('box-shadow: none', 'text-shadow: none');
    if (css.blur) effects.push('backdrop-filter: none', '-webkit-backdrop-filter: none');
    if (css.fixedBackgrounds) effects.push('background-attachment: scroll');
    if (effects.length) rules.push(rule(EVERY, effects));
    if (css.animations) {
      rules.push(rule(css.youtubePlayer ? OUTSIDE_YOUTUBE_PLAYER : EVERY, [
        'animation-duration: .01ms',
        'animation-iteration-count: 1',
        'transition-duration: .01ms',
        'transition-delay: 0s',
      ]));
    }
    if (css.hideScrollbars) rules.push(rule('*', ['scrollbar-width: none']));
    else if (css.thinScrollbars) rules.push(rule('*', ['scrollbar-width: thin']));
    if (css.underlineLinks) rules.push(rule('a[href]', ['text-decoration: underline']));
    if (css.selectableText) rules.push(rule('*', ['user-select: text', '-webkit-user-select: text']));
    if (css.noUppercase) rules.push(rule('*', ['text-transform: none']));
    if (css.grayscaleMedia) rules.push(rule('img,\nvideo,\npicture,\ncanvas,\nsvg image', ['filter: grayscale(1)']));
    if (css.focusRing) rules.push(rule(':focus-visible', ['outline: 2px solid currentColor', 'outline-offset: 2px']));
    // The person's own snippet goes last, as written, so it can override everything above.
    if (typeof css.custom === 'string' && css.custom.trim()) rules.push(css.custom);
    return rules.join('\n\n');
  }

  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.buildCss = buildCss;
  if (typeof module === 'object') module.exports = { buildCss };
})();
