# sobrio

Extensión MV3 para Firefox, LibreWolf y Chrome: el CSS de Diego en todos los sitios (por
interruptores, más un snippet propio), modo oscuro con el motor de Dark Reader, un switcher tipo
Obsidian para bookmarks y motores de búsqueda (con memoria de lo que se abre), atajos de teclado
propios, una página de ajustes en pestañas, una nueva pestaña propia y control de medios
(velocidad y pausa del autoplay). Repo público (`donutinit/sobrio`). Uso en `README.md`; diseño
en `docs/superpowers/specs/`: `2026-10-14-sobrio-design.md` (v0.1), `-v0.2-design.md` y
`-v0.3-design.md`. `CLAUDE.md` es un hard link de este archivo.

## Comandos

```sh
node --test                                         # tests: lo mismo que CI
python3 -I tools/cdp.py . <url>... --eval '<js>'    # Chromium headless (instalado en lizeth)
python3 -I tools/marionette.py . <url>... --eval '<js>'  # LibreWolf headless (en la máquina de Diego)
python3 -I tools/perf.py . <url>...                 # CPU de la página con sobrio y sin él (Chromium)
python3 -I tools/ffperf.py . <url>...               # lo mismo en Firefox (todos los hilos, 1a y 2a visita)
python3 -I tools/vendor-darkreader.py <versión>     # actualizar Dark Reader (y proxy.js)
python3 -I tools/vendor-fonts.py                    # actualizar las fuentes de la nueva pestaña
python3 -I tools/make-icons.py                      # redibujar icons/ desde la retícula del isotipo
scripts/pack.sh                                     # dist/sobrio-<versión>.zip y .xpi (con página de inicio)
scripts/publish-amo.py dist/sobrio-<versión>.xpi    # mandarla a addons.mozilla.org (lo usa CI)
```

Las dos herramientas cargan la extensión en un perfil temporal. Una URL `ext:options.html` abre
una página de la extensión. Aceptan `--ext-eval` (antes, dentro de una página de la extensión),
`--then-ext-eval` y `--keys` (después de cargar: cambiar `storage`, inyectar el switcher, teclas
reales), `--shots DIR` y `--console TEXTO`. `--keys` solo corre con `--then-ext-eval` (basta
`"return 1"`) y su resultado sale como `"after"`, no `"eval"`. `cdp.py` también tiene `--dark`,
`--autoplay` (medios con sonido sin gesto), `--switcher` (lee el shadow root cerrado),
`--busy-worker MS`, `--settle S`, `--targets`, `--full`, `--after-ext-eval`, `--sw-eval`,
`--late-load`, `--clipboard`, y en `--keys` `click@x:y` y `Ctrl+J~` (tecla sostenida, con
autorepeat). `marionette.py` tiene `--user-content
FILE` (un `userContent.css` para el perfil), `--late-install` (la pestaña ya abierta al instalar)
`--permanent` (instala un .xpi como lo haría una persona, no temporal: así corre la bienvenida de
`onInstalled`), `--pref nombre=json` (por ejemplo `media.autoplay.default=0`) y `--chrome-eval` (en el chrome de
la ventana: `gBrowser`, `gURLBar`, `BrowserCommands.openTab()`). Las páginas de prueba se sirven
con `python3 -I -m http.server` desde una carpeta fuera del repo, y se abren como
`http://sobrio.test:<puerto>/`: las dos herramientas resuelven `sobrio.test` a esta máquina, con un
nombre que no es local (`127.0.0.1` y `localhost` quedan fuera de sobrio por defecto). En lizeth
`marionette.py` corre con un Firefox oficial: `--binary ~/.cache/sobrio-firefox/firefox/firefox`.

sobrio tiene que ser rápido: un cambio a lo que corre en las páginas se mide con `tools/perf.py`
(carga y reposo, `--second` para la segunda visita) y `tools/ffperf.py` en sitios pesados (GitHub,
YouTube, Wikipedia) contra la versión anterior (`git archive HEAD` en una carpeta aparte). En
Firefox, `ffperf.py` necesita `--binary ~/.cache/sobrio-firefox/firefox/firefox` en lizeth.

## Idiomas

`_locales/en` es la fuente; hay 20 idiomas más (los textos de la interfaz) y el README en todos
ellos (`README.<idioma>.md`, con la barra de idiomas arriba), más la ficha de AMO de cada uno en
`docs/amo-listing/`. `test/locales.test.js` exige que cada idioma tenga todas las claves con los
mismos placeholders y `$TOKENS$`, sin rayas, y la descripción del manifest en 132 caracteres o
menos (el límite de Chrome). Un texto nuevo va en todos los idiomas; si cambia el README en inglés,
cambian los demás.

- Las traducciones siempre las hace un modelo barato (Haiku, o GPT Luna), un agente por idioma
  con un mismo brief; nunca el modelo principal. Diego lo pidió así. El modelo principal solo
  escribe el brief y revisa el resultado (test, validación y una mirada en el navegador).
- No se traducen: `sobrio`, `switcher`, `td`, `ta`, `settings`, `options`, las teclas, `%s` y los
  nombres de productos y fuentes. Sin rayas.
- `cdp.py --lang de` abre Chromium en otro idioma para revisarlas.
- Árabe y hebreo esperan a que las páginas sepan escribir de derecha a izquierda.

## Lo que sobrio no es

- No busca en pestañas abiertas ni en el historial: el switcher es para bookmarks y motores.
  Diego lo descartó porque va en contra de la idea de la extensión.

## Marca

Blanco y negro, nada más (lo secundario es la misma tinta al 60 %, las líneas al 20 %).
Instrument Sans y DM Mono solo en la marca y las imágenes; las páginas de la extensión usan la
fuente del lector. El isotipo es un cuadrado con un punto final cuadrado en una retícula de 16:
los PNG salen de `tools/make-icons.py`, nunca a mano. Los íconos de interfaz están en `icons.js`
(la retícula de 16 del isotipo, trazo de 1 px en medios píxeles, rellenos en píxeles enteros,
`crispEdges`: nítidos a 16 px y sus múltiplos; nada redondo). Todo en `docs/brand/README.md`; las capturas del README
en `docs/screens`. Las imágenes que muestran una página sin sobrio se sacan con una extensión vacía
en `cdp.py`: sobrio también corre en `file://` en el Chromium de pruebas.

## Reglas

- Sin build, sin `package.json` y sin dependencias de npm. JS plano: content scripts y páginas no
  usan `import`.
- La lógica pura vive en `settings.js` (modelo, patrones, gancho de tema, velocidad, atajos,
  `cleanUrl`), `style.js` (el CSS por interruptores), `match.js` (switcher y motores), `stats.js`
  (peso de lo abierto), `clock.js` (fecha, hora, saludo y agujas), `guard.js` (descargas e
  inyección), `icons.js` (los íconos como datos) y la parte pura de `detector.js`. No tocan `chrome.*` al cargar, para
  que `node --test` los pruebe. Exportan en `globalThis.sobrio` y en `module.exports`.
- `settings` en `storage.local` se lee siempre con `mergeSettings`: cada campo inválido cae a su
  default. Los defaults son los que Diego pidió: los de v0.1, más precisión `normal`, Google
  primero y comandos en inglés (v0.3), y desde 0.3.2 todos los interruptores de estilo menos
  escala de grises y contorno de foco, y `focusPage`. Guardar en ajustes escribe el objeto
  entero, así que un default nuevo no le llega a quien ya guardó: hay que avisarlo. `stats` vive aparte en
  `storage.local` (`{[url]: {count, last, title}}`, máximo 2,000), igual que `ownDark`: los hosts
  que el detector vio con tema oscuro propio (máximo 500, el más reciente primero). `page.js` lo lee
  al arrancar y ahí no enciende Dark Reader; su negro provisional queda hasta la primera mirada,
  que lo confirma o enciende Dark Reader en el mismo turno. `seenLight` es lo contrario: los hosts
  que vio claros, con el esquema del sistema y la hora (`{[host]: {scheme, at}}`, máximo 500).
  Durante un día y con el mismo esquema, `page.js` no hace las miradas de la carga (en Wikipedia
  costaban medio segundo), salvo que la página diga que es oscura (clase o meta); un cambio de
  tema en vivo sí la tiene. `cssOff`, `darkOff` y
  `animOff` son listas de patrones; `animOff` sin guardar vale `DEFAULT_ANIM_OFF`
  (`['chatgpt.com']`).
- Atajos, velocidad, aviso y pausa del autoplay solo actúan con eventos `isTrusted`: una página
  no debe poder disparar acciones de la extensión.
- `darkreader.js`, `proxy.js`, `fonts/` y `fonts.css` no se editan: se regeneran con
  `tools/vendor-*.py`, que verifican el sha512 del registro (`proxy.js` es el `injectProxy` de
  `darkreader.js`; `vendor-darkreader.py --proxy-only` lo rehace). Al actualizar Dark Reader,
  repetir las pruebas de navegador de "Cosas que ya mordieron".
- `page.js` lee `storage` una vez por frame: `speed.js` y `shortcuts.js` reciben los ajustes ya
  combinados con `sobrio.onSettings` (la nueva pestaña no tiene `page.js` y `shortcuts.js` los lee
  solo).
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
  `executeScript` (`settings.js`, `stats.js`, `match.js`, `icons.js`, `switcher-css.js`,
  `switcher.js`) la primera vez en cada página; después se abre con una sola llamada a
  `sobrio.toggleSwitcher`, y `match.js` guarda por id los marcadores ya normalizados. Su CSS es
  un string. Sus colores son variables `--s-*`.
- El gancho de tema son variables `--sobrio-*` en `userContent.css` dentro de
  `@-moz-document url-prefix("moz-extension://")`. Solo el background de Firefox (y la página de
  ajustes) las lee; `storeThemeHook` escribe `theme` solo si cambió. En dot, la plantilla
  `theme/templates/librewolf/userContent.css` las genera.

## Cosas que ya mordieron

- Chrome siempre bloquea el script inline con el que Dark Reader instala su proxy de CSSOM (CSP
  del mundo aislado), y Firefox donde la página prohíbe scripts inline. Sin proxy, Dark Reader
  revisa cada hoja de la página en cada cuadro mientras esté abierta (CPU en reposo y cuadros sin
  parar). Por eso `proxy.js` corre como content script en el mundo de la página (`"world":
  "MAIN"`) y entra después de cada `__darkreader__cleanUp` si el script inline no corrió. El
  error de CSP por frame en la consola de Chrome sigue siendo esperado.
- Un segundo `DarkReader.enable` con el motor activo se toma por "otra instancia" y no cambia
  nada: para cambiar el tema, `disable` y `enable` en el mismo turno.
- Una `transition-duration` en todos los elementos hace de cada cambio de cada propiedad una
  transición (`transition-property` empieza en `all`): cada recálculo de estilos tardaba el doble
  y GitHub gastaba CPU sin parar en reposo. El CSS solo acorta animaciones; `page.js` termina las
  transiciones de la página en `transitionrun` (siguen llegando `transitionend`), con una pasada
  por cuadro de `document.getAnimations()`: en Chromium `element.getAnimations()` cuesta lo mismo
  que el del documento (~100 ms con miles de transiciones), así que una llamada por evento congela
  la página.
- El detector marca lo que lee con `data-sobrio-still` (una regla fija le quita las transiciones)
  y fuerza un reflow antes de desmarcar. En headless, una transición pendiente no avanza sin
  cuadros: mide después de dos `requestAnimationFrame`.
- El detector apaga las hojas de Dark Reader del documento y de los shadow roots que muestrea
  (`:host`), incluida la adoptada `#__darkreader__adoptedOverride`. Corre en cuanto hay contenido,
  en `DOMContentLoaded` si ya lo hay o en `load`; `page.js` lo repite en `load` si cambiaron las
  hojas de la página (`styleSignature`), cuando `<html>` o `<body>` cambian de tema
  (`themeChanged`) y cuando cambia el modo claro u oscuro del sistema. El veredicto se revierte:
  una página que vuelve a ser clara recupera Dark Reader. El fondo negro provisional se quita
  antes de medir.
- Los colores calculados llegan como `oklch()` (Tailwind 4), `lab()`, `color(srgb …)`
  (`color-mix`) o `color(display-p3 …)`: `parseColor` los convierte a sRGB. Sin eso, un sitio
  oscuro moderno quedaba con Dark Reader encima. El negro puro (X, temas OLED) es un tema oscuro
  como cualquiera.
- Un frame sin área (`innerWidth` o `innerHeight` menor que 2: trackers, anuncios ocultos) no
  enciende Dark Reader ni el detector hasta su `resize`, que llega antes de que se pinte.
- La excepción del reproductor de YouTube (`:not(#movie_player *)`) solo entra en hosts de
  YouTube: en cualquier otro sitio hace cada recálculo 6 a 9 % más lento sin servir de nada.
- Firefox no muestra en `document.styleSheets` del mundo de la página las hojas que inserta una
  extensión: las pruebas del detector desde la página solo valen en Chromium.
- Velocidad: un `ratechange` dentro de 1.5 s después de `emptied`/`loadstart` es el sitio
  reiniciando (se reaplica); fuera de esa ventana es la persona usando el menú del sitio (se
  respeta). `emptied` llega antes que el `ratechange` de un `load()`; `loadstart`, después.
- El switcher frena en `window` (captura) teclas, `beforeinput`, `input` y composición, para que
  la página no lea lo que se escribe; por eso el escudo llama a `update` él mismo.
- `focusPage`: ni `focus()` ni navegar la pestaña (`tabs.update`) le quitan el foco a la barra
  de direcciones. Solo una pestaña que la extensión crea con otra dirección empieza con la página
  enfocada, así que se crea una nueva con `?focus` en el mismo lugar y se cierra la original
  (como New Tab Override). `tabs.create` con `cookieStoreId` pide el permiso `cookies`, incluso
  `firefox-default`: no se pasa, y en una pestaña de contenedor no se hace.
- Chrome lanza un `TypeError` en el momento de la llamada (no rechaza la promesa) ante una
  propiedad que no conoce, como `loadReplace` de Firefox.
- Chrome llama `chrome://newtab/` a la pestaña donde está la nueva pestaña de sobrio: para saber
  si un mensaje viene de ella, `sender.url`, no `tab.url`.
- Un `<svg>` no tiene la propiedad `hidden` de HTML: se oculta con `toggleAttribute('hidden')`.
- Firefox abre al arrancar y en cada ventana nueva la página de inicio (`about:home`), no la nueva
  pestaña. El .xpi de `pack.sh` agrega `chrome_settings_overrides.homepage`; `manifest.json` no la
  lleva porque Chrome en Windows y macOS no carga una extensión con una página de inicio que no sea
  http(s) (en Linux ignora la clave), y Chrome carga el zip o esta carpeta. Se prueba con
  `marionette.py dist/sobrio-<versión>.xpi` (temporal: el Firefox oficial no instala sin firma).
  Como el botón de inicio lleva a la nueva pestaña dentro de una pestaña con historial, `takeFocus`
  no la reemplaza si `history.length > 1`: se perdería ese historial.
- El foco real de la nueva pestaña no se puede medir: en headless y en Xvfb sin gestor de
  ventanas Firefox no enfoca nada, ni la barra. Se prueba la mecánica (la pestaña se reemplaza)
  con `marionette.py --chrome-eval` y el foco a mano.
- ChatGPT: con el corte de animaciones, la vista se va moviendo sola mientras genera si uno
  subió un poco. No es un elemento puntual (devolver la animación de las palabras, las
  transiciones o las animaciones del hilo con un snippet no lo arregló), así que chatgpt.com va
  en `animOff` por defecto: ahí el CSS de sobrio aplica sin el corte. ChatGPT con sesión no
  genera en un navegador automatizado (`cloudflare_challenge`); sin sesión el streaming llega a
  chorros o de golpe y no sirve para medir.
- Alt+letra choca con atajos del navegador (Alt+D va a la barra de direcciones) y Marionette no
  aplica Alt en Firefox: en pruebas, Ctrl+Shift.
- Dark Reader decide si una variable CSS es un color con la primera definición que lee. YouTube
  declara sus variables de tema como `initial` en `:root` antes de darles color, y su barra
  quedaba blanca: en el mundo de la extensión (`boot.js`), una variable de `:root` o `html` con una
  palabra global (`initial`, `inherit`, `unset`, `revert`) se lee vacía y Dark Reader la salta.
- Dark Reader reconstruye una regla en su lugar (`deleteRule(i)` y luego `insertRule(texto, i)`)
  cada vez que aprende el tipo de otra variable que declara. Las reglas de tema de GitHub
  declaran cientos y se parseaban cientos de veces: 1.7 s de CPU en la carga. `boot.js` le deja
  un marcador vacío y pone el texto final al terminar la tarea, una vez. Sus índices no cambian.
- Dark Reader invierte una imagen clara y opaca (una foto chica salía en negativo) y esconde una
  grande. `page.js` mira cada imagen que Dark Reader lee, las de otros sitios por
  `fetchThroughBackground` y las del mismo por el `fetch` de su mundo (Dark Reader las baja él
  mismo), y a una foto le pasa un cuadro gris que deja como está. Las grandes siguen siendo
  suyas: esconder una clara mantiene legible el texto encima. Dark Reader no pide por CORS
  imágenes `http`, con puerto, de IP o de `.test`: eso se prueba con imágenes del mismo sitio.
- Dark Reader no toca `<img>` ni `<video>`. `page.js` oscurece las grandes con texto encima que no
  está en una caja propia (el inicio de sesión de Meta) e invierte las chicas oscuras sobre fondo
  transparente (el logotipo de Wikipedia), cada una al entrar en pantalla. El texto encima de una
  foto puede venir dibujado en la foto (las tarjetas de Amazon): eso no se toca. El `load` de una
  imagen no llega a `window`, se escucha en `document`.
- El switcher: la primera vez en una página espera la lista y los ajustes (transparente, ya
  tomando teclas, máximo 150 ms) para no pintarse vacío ni con los colores por defecto; después
  abre con lo de la vez anterior (`sobrio.switcherCache`). Los bookmarks de Diego son alias
  (`g`, `yt`, `pi`): un título igual a la búsqueda va primero, sobre la memoria y los más nuevos.
- Pruebas de navegador que conviene repetir: Wikipedia queda negra; GitHub con `--dark` usa su
  tema propio y sin él queda negro; `td`/`ta` y los ajustes cambian en vivo; el switcher en
  GitHub no deja pasar la `s` al sitio; la nueva pestaña con cada estilo y diseño; velocidad con
  un `<audio>` local; el autoplay con una página con `<audio autoplay>` y `--autoplay`; grabar un
  atajo en los ajustes con teclas reales; el flash con una página de CSS blanco; YouTube con la
  barra de arriba negra; el logotipo de Wikipedia visible.

## Publicar

Subir la versión en `manifest.json`, commit en main y un tag `v<versión>` empujado. El workflow
`release` revisa que el tag coincida, corre los tests, arma el paquete y crea el release de GitHub
con el zip y el xpi. Si la variable del repo `AMO_PUBLISH` vale `true`, además manda el xpi a
addons.mozilla.org con los secretos `AMO_JWT_ISSUER` y `AMO_JWT_SECRET`, con las notas del release
y las notas para revisores de `docs/amo.md`. Correrlo a mano (Actions › Release › Run workflow)
solo valida el paquete y las llaves contra AMO, sin mandar nada. Cada versión que llega a AMO
entra a revisión: no mandar varias seguidas.

## Commits

En inglés, minúsculas, cortos y sin trailers.
