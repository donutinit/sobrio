// Runs in every frame at document_start: custom CSS and dark mode.
(() => {
  const css = document.createElement('style');
  css.id = 'sobrio-css';
  css.textContent = sobrio.CUSTOM_CSS;
  document.documentElement.append(css);

  DarkReader.enable({ darkSchemeBackgroundColor: '#000000' });
})();
