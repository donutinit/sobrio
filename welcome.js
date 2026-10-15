// The welcome guide: opened once on install (background.js) and from the settings. Five things
// to know, with the command words the person chose.
(() => {
  const { mergeSettings } = sobrio.settings;
  const { icon, isotype } = sobrio.icons;
  const t = (key, ...substitutions) => chrome.i18n.getMessage(key, substitutions) || key;
  const main = document.querySelector('main');

  function el(tag, props = {}, ...children) {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children);
    return node;
  }

  function thing(name, title, text, keys = false) {
    return el('li', {}, icon(name, 16),
      el('div', {}, el('h2', { className: keys ? 'keys' : '', textContent: title }), el('p', { textContent: text })));
  }

  function build(settings) {
    const { dark, css } = settings.switcher.commandNames;
    const open = el('button', { type: 'button', textContent: t('welcomeSettings') });
    open.addEventListener('click', () => chrome.runtime.openOptionsPage());
    main.replaceChildren(
      el('header', {}, isotype(28), el('span', { className: 'wordmark' }, 'sobrio', el('span', { className: 'stop' }))),
      el('h1', { textContent: t('welcomeTitle') }),
      el('p', { className: 'lead', textContent: t('welcomeLead') }),
      el('ol', { className: 'things' },
        thing('switcher', 'Ctrl+Space', t('welcomeSwitcher'), true),
        thing('dark', t('welcomeCommandsTitle', dark, css), t('welcomeCommands', dark, css), true),
        thing('newtab', t('welcomeNewtabTitle'), t('welcomeNewtab')),
        thing('shortcuts', t('welcomeShortcutsTitle'), t('welcomeShortcuts')),
        thing('style', t('welcomeSystemTitle'), t('welcomeSystem'))),
      el('div', { className: 'actions' }, open),
      el('p', { className: 'footer', textContent: t('welcomeFooter') }),
    );
  }

  // The userContent.css theme, as on the settings page.
  function paint(theme) {
    const vars = {
      '--bg': theme?.background,
      '--text': theme?.text,
      '--muted': theme?.textMuted,
      '--line': theme?.border && `color-mix(in srgb, ${theme.border} 40%, ${theme.background ?? '#000'})`,
      '--font': theme?.font && `${theme.font}, system-ui, sans-serif`,
    };
    for (const [name, value] of Object.entries(vars)) {
      if (value) document.documentElement.style.setProperty(name, value);
      else document.documentElement.style.removeProperty(name);
    }
  }

  const apply = (stored) => {
    paint(stored.theme ?? null);
    build(mergeSettings(stored.settings));
  };
  document.title = `sobrio · ${t('welcomeTitle')}`;
  build(mergeSettings(undefined));
  chrome.storage.local.get(['settings', 'theme']).then(apply);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.settings || changes.theme)) chrome.storage.local.get(['settings', 'theme']).then(apply);
  });
})();
