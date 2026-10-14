# sobrio

Extensión MV3 para Firefox, LibreWolf y Chrome: el CSS de Diego en todos los sitios, modo oscuro
con el motor de Dark Reader y un switcher tipo Obsidian para bookmarks y motores de búsqueda.
Repo público (`donutinit/sobrio`). Uso en `README.md`; diseño en
`docs/superpowers/specs/2026-10-14-sobrio-design.md`. `CLAUDE.md` es un hard link de este archivo.

## Comandos

```sh
node --test                                         # tests: lo mismo que CI
python3 -I tools/cdp.py . <url>... --eval '<js>'    # Chromium headless (instalado en lizeth)
python3 -I tools/marionette.py . <url>... --eval '<js>'  # LibreWolf headless (en la máquina de Diego)
python3 -I tools/vendor-darkreader.py <versión>     # actualizar Dark Reader
scripts/pack.sh                                     # dist/sobrio-<versión>.zip y .xpi
```

Las dos herramientas cargan la extensión en un perfil temporal y aceptan `--ext-eval` (antes,
dentro de una página de la extensión), `--then-ext-eval` y `--keys` (después de cargar: cambiar
`storage`, inyectar el switcher, teclas reales), `--shots DIR` y `--console TEXTO`. `cdp.py`
también tiene `--dark` y `--switcher`, que lee el shadow root cerrado del switcher.

## Reglas

- Sin build, sin `package.json` y sin dependencias de npm. JS plano: content scripts y popup no
  usan `import`.
- `match.js`, `guard.js`, `siteState` de `boot.js` y la parte pura de `detector.js` no tocan
  `chrome.*` al cargar, para que `node --test` los pruebe. Exportan en `globalThis.sobrio` y en
  `module.exports`.
- `darkreader.js` no se edita: se reemplaza con `tools/vendor-darkreader.py`, que verifica el
  sha512 del registro. Al actualizarlo, repetir las pruebas de navegador de "Cosas que ya
  mordieron".
- Los content scripts mandan mensajes con `sobrio.send`, nunca con
  `chrome.runtime.sendMessage`: `darkreader.js` parcha `sendMessage` y su versión no devuelve la
  respuesta. `boot.js` guarda la original antes.
- El background responde vacío a los mensajes que no conoce, porque Dark Reader le reenvía los
  suyos.
- Las descargas que pide Dark Reader pasan por `guard.js`: solo `http(s)`, sin cookies, solo
  `text/css` o `image/*` y máximo 5 MB. No relajes esos candados: las URLs vienen de las páginas.
- Firefox solo deja abrir el popup de forma síncrona dentro del handler del atajo. Por eso
  `guard.canInject` decide antes de intentar inyectar.
- El switcher vive en un shadow root cerrado. Lo que necesita entra por `files` de
  `executeScript` (`match.js`, `switcher-css.js`, `switcher.js`); su CSS es un string para no
  exponer archivos con `web_accessible_resources`.

## Cosas que ya mordieron

- Chrome siempre bloquea el script inline con el que Dark Reader instala su proxy de CSSOM (CSP
  del mundo aislado) y deja un error de CSP por frame en la consola. Es esperado: el motor tiene
  respaldo y oscurece igual reglas de `insertRule`, `adoptedStyleSheets` y shadow DOM (probado
  con y sin el proxy).
- El CSS de Diego da `transition-duration` a todos los elementos, así que `getComputedStyle`
  devuelve el color inicial de cualquier transición. El detector pone `transition: none`
  mientras mide y fuerza un reflow antes de quitarlo. Sin eso, Chromium veía los colores de Dark
  Reader y apagaba el modo oscuro en Wikipedia.
- El detector corre en cuanto hay contenido, en `DOMContentLoaded` si ya lo hay o en `load`, y
  `page.js` lo repite en `load`. En Chromium headless, GitHub nunca llega a `complete`.
- Una muestra de negro puro opaco cuenta como "sin veredicto" (es el fondo de sobrio).
- Pruebas de navegador que conviene repetir: Wikipedia queda negra; GitHub con `--dark` usa su
  tema propio y sin él queda negro; `td`/`ta` con `--then-ext-eval` cambian en vivo; el
  switcher en GitHub no deja pasar la `s` al sitio.

## Commits

En inglés, minúsculas, cortos y sin trailers.
