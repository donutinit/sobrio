// The stylesheet sobrio puts on every site, built from the switches in settings.css.
// With everything on it is the stylesheet v0.1 shipped as custom-css.js, except for transitions,
// which page.js finishes as they start.
(() => {
  const EVERY = '*,\n*::before,\n*::after';
  const OUTSIDE_YOUTUBE_PLAYER =
    '*:not(#movie_player, #movie_player *),\n' +
    '*:not(#movie_player, #movie_player *)::before,\n' +
    '*:not(#movie_player, #movie_player *)::after';

  const rule = (selector, declarations) =>
    `${selector} {\n${declarations.map((d) => `  ${d} !important;`).join('\n')}\n}`;

  // YouTube and its embeds on other sites, which are its own pages in an iframe.
  const youtubeHost = (host) => /(^|\.)youtube(-nocookie)?\.com$/.test(host ?? '');

  // theme.corners comes from --sobrio-corners in userContent.css and wins over the switch.
  // host: the page's; the player's exception goes in only on YouTube, since checking every element
  // for a #movie_player around it makes each restyle slower everywhere else.
  function buildCss(css, theme, host) {
    const corners = theme?.corners ? theme.corners === 'square' : css.corners;
    const rules = [];
    if (css.smoothScroll) rules.push(rule('html', ['scroll-behavior: auto']));
    const effects = [];
    if (corners) effects.push('border-radius: 0');
    if (css.shadows) effects.push('box-shadow: none', 'text-shadow: none');
    if (css.blur) effects.push('backdrop-filter: none', '-webkit-backdrop-filter: none');
    if (css.fixedBackgrounds) effects.push('background-attachment: scroll');
    if (effects.length) rules.push(rule(EVERY, effects));
    // Transitions are cut by page.js as each one starts: a transition-duration here would turn
    // every property change of every element into a transition.
    if (css.animations) {
      rules.push(rule(css.youtubePlayer && youtubeHost(host) ? OUTSIDE_YOUTUBE_PLAYER : EVERY, [
        'animation-duration: .01ms',
        'animation-iteration-count: 1',
      ]));
    }
    if (css.hideScrollbars) rules.push(rule('*', ['scrollbar-width: none']));
    else if (css.thinScrollbars) rules.push(rule('*', ['scrollbar-width: thin']));
    if (css.underlineLinks) rules.push(rule('a[href]', ['text-decoration: underline']));
    if (css.selectableText) rules.push(rule('*', ['user-select: text', '-webkit-user-select: text']));
    if (css.noUppercase) rules.push(rule('*', ['text-transform: none']));
    if (css.grayscaleMedia) rules.push(rule('img,\nvideo,\npicture,\ncanvas,\nsvg image', ['filter: grayscale(1)']));
    if (css.focusRing) rules.push(rule(':focus-visible', ['outline: 2px solid currentColor', 'outline-offset: 2px']));
    return rules.join('\n\n');
  }

  // The person's own snippet, as written. It gets a sheet of its own after sobrio's: an @import
  // at its top works, and a broken rule in it cannot reach the rules before it.
  function customCss(css) {
    return typeof css.custom === 'string' && css.custom.trim() ? css.custom : '';
  }

  globalThis.sobrio = globalThis.sobrio || {};
  globalThis.sobrio.buildCss = buildCss;
  globalThis.sobrio.customCss = customCss;
  globalThis.sobrio.youtubeHost = youtubeHost;
  if (typeof module === 'object') module.exports = { buildCss, customCss, youtubeHost };
})();
