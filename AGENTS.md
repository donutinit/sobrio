# sobrio

Extensión MV3 para Firefox, LibreWolf y Chrome: el CSS de Diego en todos los sitios (por
interruptores), modo oscuro con el motor de Dark Reader, un switcher tipo Obsidian para bookmarks
y motores de búsqueda, una página de ajustes, una nueva pestaña propia y control de velocidad de
medios. Repo público (`donutinit/sobrio`). Uso en `README.md`; diseño en
`docs/superpowers/specs/2026-10-14-sobrio-design.md` (v0.1) y
`docs/superpowers/specs/2026-10-14-sobrio-v0.2-design.md` (v0.2). `CLAUDE.md` es un hard link de
este archivo.

## Comandos

```sh
node --test                                         # tests: lo mismo que CI
python3 -I tools/cdp.py . <url>... --eval '<js>'    # Chromium headless (instalado en lizeth)
python3 -I tools/marionette.py . <url>... --eval '<js>'  # LibreWolf headless (en la máquina de Diego)
python3 -I tools/vendor-darkreader.py <versión>     # actualizar Dark Reader
python3 -I tools/vendor-fonts.py                    # actualizar las fuentes de la nueva pestaña
scripts/pack.sh                                     # dist/sobrio-<versión>.zip y .xpi
```

Las dos herramientas cargan la extensión en un perfil temporal. Una URL `ext:options.html` abre
una página de la extensión. Aceptan `--ext-eval` (antes, dentro de una página de la extensión),
`--then-ext-eval` y `--keys` (después de cargar: cambiar `storage`, inyectar el switcher, teclas
reales), `--shots DIR` y `--console TEXTO`. `cdp.py` también tiene `--dark`, `--switcher` (lee el
shadow root cerrado), `--busy-worker MS`, `--settle S`, `--targets`, `--full`, `--after-ext-eval`
y `click@x:y` en `--keys`. `marionette.py` tiene `--user-content FILE` (un `userContent.css` para
el perfil) y `--late-install` (la pestaña ya abierta al instalar).

## Reglas

- Sin build, sin `package.json` y sin dependencias de npm. JS plano: content scripts y páginas no
  usan `import`.
- La lógica pura vive en `settings.js` (modelo, patrones, gancho de tema, velocidad), `style.js`
  (el CSS por interruptores), `match.js` (switcher), `clock.js` (fecha y hora), `guard.js`
  (descargas e inyección) y la parte pura de `detector.js`. No tocan `chrome.*` al cargar, para
  que `node --test` los pruebe. Exportan en `globalThis.sobrio` y en `module.exports`.
- `settings` en `storage.local` se lee siempre con `mergeSettings`: cada campo inválido cae a su
  default. Los defaults reproducen v0.1.
- `darkreader.js`, `fonts/` y `fonts.css` no se editan: se regeneran con `tools/vendor-*.py`, que
  verifican el sha512 del registro. Al actualizar Dark Reader, repetir las pruebas de navegador
  de "Cosas que ya mordieron".
- Los content scripts mandan mensajes con `sobrio.send`, nunca con
  `chrome.runtime.sendMessage`: `darkreader.js` parcha `sendMessage` y su versión no devuelve la
  respuesta. `boot.js` guarda la original antes.
- El background responde vacío a los mensajes que no conoce, porque Dark Reader le reenvía los
  suyos.
- Las descargas que pide Dark Reader pasan por `guard.js`: solo `http(s)`, sin cookies, solo
  `text/css` o `image/*`, máximo 5 MB y una redirección solo puede terminar en un host https
  público. No relajes esos candados: las URLs vienen de las páginas.
- Firefox solo deja abrir el popup de forma síncrona dentro del handler del atajo. Por eso
  `guard.canInject` decide antes de intentar inyectar.
- El switcher vive en un shadow root cerrado. Lo que necesita entra por `files` de
  `executeScript` (`settings.js`, `match.js`, `switcher-css.js`, `switcher.js`); su CSS es un
  string. Sus colores son variables `--s-*`.
- El gancho de tema son variables `--sobrio-*` en `userContent.css` dentro de
  `@-moz-document url-prefix("moz-extension://")`. Solo el background de Firefox (y la página de
  ajustes) las lee; `storeThemeHook` escribe `theme` solo si cambió. En dot, la plantilla
  `theme/templates/librewolf/userContent.css` las genera.

## Cosas que ya mordieron

- Chrome siempre bloquea el script inline con el que Dark Reader instala su proxy de CSSOM (CSP
  del mundo aislado) y deja un error de CSP por frame en la consola. Es esperado: el motor tiene
  respaldo y oscurece igual reglas de `insertRule`, `adoptedStyleSheets` y shadow DOM (probado
  con y sin el proxy).
- Un segundo `DarkReader.enable` con el motor activo se toma por "otra instancia" y no cambia
  nada: para cambiar el tema, `disable` y `enable` en el mismo turno.
- El CSS de Diego da `transition-duration` a todos los elementos, así que `getComputedStyle`
  devuelve el color inicial de cualquier transición. El detector pone `transition: none`
  mientras mide y fuerza un reflow antes de quitarlo. En headless, una transición pendiente no
  avanza sin cuadros: mide después de dos `requestAnimationFrame`.
- El detector apaga también la hoja adoptada `#__darkreader__adoptedOverride`, corre en cuanto
  hay contenido, en `DOMContentLoaded` si ya lo hay o en `load`, y `page.js` lo repite en `load`.
  El fondo negro provisional se quita antes de medir.
- Firefox no muestra en `document.styleSheets` del mundo de la página las hojas que inserta una
  extensión: las pruebas del detector desde la página solo valen en Chromium.
- Velocidad: un `ratechange` dentro de 1.5 s después de `emptied`/`loadstart` es el sitio
  reiniciando (se reaplica); fuera de esa ventana es la persona usando el menú del sitio (se
  respeta). `emptied` llega antes que el `ratechange` de un `load()`; `loadstart`, después.
- El switcher frena en `window` (captura) teclas, `beforeinput`, `input` y composición, para que
  la página no lea lo que se escribe; por eso el escudo llama a `update` él mismo.
- Pruebas de navegador que conviene repetir: Wikipedia queda negra; GitHub con `--dark` usa su
  tema propio y sin él queda negro; `td`/`ta` y los ajustes cambian en vivo; el switcher en
  GitHub no deja pasar la `s` al sitio; la nueva pestaña con cada estilo; velocidad con un
  `<audio>` local.

## Commits

En inglés, minúsculas, cortos y sin trailers.
