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
python3 -I tools/keylag.py .                        # cuánto tarda Ctrl+Space en una página que sigue cargando (Firefox)
python3 -I tools/loadlag.py . <url>...              # cuánto espera una tecla mientras la página carga, con sobrio y sin él (Firefox)
python3 -I tools/vendor-darkreader.py <versión>     # actualizar Dark Reader (con su parche) y proxy.js
python3 -I tools/vendor-fonts.py                    # actualizar las fuentes de la nueva pestaña
python3 -I tools/make-icons.py                      # redibujar icons/ desde la retícula del isotipo
scripts/pack.sh                                     # dist/sobrio-<versión>.zip y .xpi (con página de inicio)
scripts/publish-amo.py dist/sobrio-<versión>.xpi    # mandarla a addons.mozilla.org (lo usa CI)
```

Las dos herramientas cargan la extensión en un perfil temporal. Una URL `ext:options.html` abre
una página de la extensión. Aceptan `--ext-eval` (antes, dentro de una página de la extensión),
`--then-ext-eval` y `--keys` (después de cargar: cambiar `storage`, teclas reales), `--switcher`
(lee el shadow root cerrado), `--shots DIR` y `--console TEXTO`. `--keys` solo corre con
`--then-ext-eval` (basta `"return 1"`) y su resultado sale como `"after"`, no `"eval"`.
`--keys Ctrl+Space,yt,Enter` abre el switcher con su atajo en las dos (en Chromium headless la
tecla llega a la página; en un Chrome de verdad se la queda el navegador). `cdp.py` también tiene
`--dark`, `--autoplay` (medios con sonido sin gesto),
`--busy-worker MS`, `--settle S`, `--targets`, `--full`, `--after-ext-eval`, `--sw-eval`,
`--late-load`, `--clipboard`, y en `--keys` `click@x:y` y `Ctrl+J~` (tecla sostenida, con
autorepeat). `marionette.py` tiene `--user-content
FILE` (un `userContent.css` para el perfil), `--late-install` (la pestaña ya abierta al instalar)
`--permanent` (instala un .xpi como lo haría una persona, no temporal: así corre la bienvenida de
`onInstalled`), `--pref nombre=json` (por ejemplo `media.autoplay.default=0`) y `--chrome-eval` (en el chrome de
la ventana: `gBrowser`, `gURLBar`, `BrowserCommands.openTab()`). Las páginas de prueba se sirven
con `python3 -I -m http.server` desde una carpeta fuera del repo, y se abren como
`http://sobrio.test:<puerto>/`: las dos herramientas resuelven `sobrio.test` a esta máquina, con un
nombre que no es local (`127.0.0.1` y `localhost` quedan fuera de sobrio por defecto), y
`frame.sobrio.test` al mismo servidor como otro sitio, para iframes. En lizeth
`marionette.py` corre con un Firefox oficial: `--binary ~/.cache/sobrio-firefox/firefox/firefox`.
Para sitios que bloquean navegadores automatizados (claude.ai) está Camoufox en
`~/.cache/sobrio-camoufox/venv` (`from camoufox.sync_api import Camoufox`, `addons=[carpeta]`).
Sus `page.frames` no siempre listan los iframes de otro sitio: se revisan con capturas.

sobrio tiene que ser rápido: un cambio a lo que corre en las páginas se mide con `tools/perf.py`
(carga y reposo, `--second` para la segunda visita) y `tools/ffperf.py` en sitios pesados (GitHub,
YouTube, Wikipedia) contra la versión anterior (`git archive HEAD` en una carpeta aparte). En
Firefox, `ffperf.py` necesita `--binary ~/.cache/sobrio-firefox/firefox/firefox` en lizeth, y
`keylag.py` y `loadlag.py` también. Un cambio a lo que Dark Reader hace al cargar se mide además
con `loadlag.py`: durante la carga aprieta una tecla cada 25 ms y dice cuánto esperó la peor
(`max_ms`) y cuánto tiempo una tecla habría esperado más de 100 ms. Un cambio al switcher o a
cómo se abre se mide con `keylag.py`: sirve una
página que tarda 3 s en cargar con el hilo ocupado, aprieta Ctrl+Space con teclas de verdad y dice
cuánto tardó el switcher desde que la página recibió la tecla (`switcher_ms`: 14 ms; 2,374 en la
0.4.7) y si lo tecleado después llegó a la página.

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
- No se traducen: `sobrio`, `switcher`, `pz`, `px`, `pd`, `settings`, `options`, las teclas, `%s` y los
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
  escala de grises y contorno de foco, y `focusPage`, y desde el 2026-11-24 los comandos `pz`
  (modo oscuro en el sitio), `px` (la hoja de estilo) y `pd` (pausa). Guardar en ajustes escribe el objeto
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
  (`['chatgpt.com']`). `darkPause` es cuándo termina la pausa de `pd` (ms desde la época): mientras
  dura, `page.js` apaga Dark Reader y la hoja de estilo en todos los sitios y deja un timer para volver a prenderlos. `pd`
  solo son 3 minutos, `pd15` son 15 (de 1 a 999) y `pd` durante una pausa la termina. No va en el
  respaldo. `switcherKey` son las teclas del atajo del navegador que abre el switcher
  (`"Ctrl+Space"`, como las da `normalizeKeys`; `commandKeys` las convierte): el background las
  escribe al arrancar y cuando Firefox avisa que cambiaron, y tampoco va en el respaldo.
- Atajos, velocidad, aviso y pausa del autoplay solo actúan con eventos `isTrusted`: una página
  no debe poder disparar acciones de la extensión.
- `darkreader.js`, `proxy.js`, `fonts/` y `fonts.css` no se editan: se regeneran con
  `tools/vendor-*.py`, que verifican el sha512 del registro (`proxy.js` es el `injectProxy` de
  `darkreader.js`; `vendor-darkreader.py --proxy-only` lo rehace). Al actualizar Dark Reader,
  repetir las pruebas de navegador de "Cosas que ya mordieron".
- `darkreader.js` es el archivo de npm más `tools/darkreader.patch` (Diego lo aprobó el
  2026-11-24), y nada más: `test/darkreader.test.js` deshace el parche y compara el sha256 con el
  de `docs/amo.md`, y `git apply -R tools/darkreader.patch` hace lo mismo a mano. Cada cambio del
  parche lleva un comentario `sobrio:`. Para cambiarlo: editar `darkreader.js`, sacar el archivo
  original con `vendor-darkreader.py <versión> --pristine RUTA` y rehacer el parche con
  `diff -u --label a/darkreader.js --label b/darkreader.js RUTA darkreader.js`. El archivo tiene
  fines de línea CRLF: al editarlo con Python hay que abrirlo con `newline=''`, o el parche pasa
  a ser el archivo entero. Si una versión nueva no encaja con el parche, `vendor-darkreader.py`
  se detiene y hay que portarlo a mano.
- El parche hace que Dark Reader recorra las hojas de una página en trozos (generadores que
  devuelven el hilo; `runSliced`), no de un jalón: primero las variables de todas las hojas
  (`collectAhead`), luego cada hoja (`renderSteps`, `modifySheetSteps`), igual que cuando lo
  hacía en una sola tarea, así que el CSS que genera es el mismo. El primer tramo dura hasta
  100 ms: ahí termina casi toda página, de un jalón como antes y sin costo; lo que pasa de eso
  sigue en trozos de 10 ms que van por delante de las tareas de la página (`scheduler.postTask`
  con `user-blocking`: solo se cuelan teclas y cuadros). Mientras trabaja, las hojas que genera
  quedan apagadas (`holdStyle`) y se encienden juntas al final. Las hojas que llegan mientras la
  página carga van igual (`addLateStyles`); con la página ya cargada, de un jalón como siempre,
  y una hoja ya oscurecida que se rehace reconstruye su CSS de un jalón y sin apagarse (partida
  se vería clara). `setRenderingListener` avisa cuándo la página se ve a medias. Además, una
  regla que declara cientos de variables (el `:root` de un tema) se reconstruía una vez por cada
  variable cuyo tipo se descubría: ahora una sola vez por tanda (`rebuildVarRule`), que es lo
  que más pesaba cuando las hojas llegan de una en una (2,236 reconstrucciones y 392 ms en un
  paso en GitHub).
- Mientras Dark Reader trabaja en trozos la página va tapada (`cover` en `page.js`, el mismo
  negro provisional de antes, con clase `darkreader` para que Dark Reader no lo tome por una
  hoja de la página): sin tapa se verían claras las hojas que faltan. Se quita cuando termina
  y, si trabajó en trozos y la página sigue cargando, cuando pasan 80 ms sin hojas nuevas
  (`settle`), para que sea una sola transición. El detector mide a media tapa (la quita, mide y la vuelve a poner en la
  misma tarea) y las miradas a imágenes esperan a que se quite (`afterRendering`).
- `darkreader.js` se carga en cada frame pero no corre hasta que hace falta: es un paquete UMD y
  `boot.js` le pone un `define` de AMD, así que entrega su código en vez de ejecutarlo.
  `page.js` lo corre (`sobrio.darkReader()`) la primera vez que el modo oscuro se enciende en el
  frame. Correrlo era la mitad del arranque de sobrio en cada frame (5 a 7 ms de 13) y muchos
  nunca lo usan: un sitio con tema oscuro propio, uno apagado, un frame sin área.
  `test/boot.test.js` avisa si una versión nueva deja de pasar por `define`.
- `page.js` lee `storage` una vez por frame: `speed.js` y `shortcuts.js` reciben los ajustes ya
  combinados con `sobrio.onSettings` (la nueva pestaña no tiene `page.js` y `shortcuts.js` los lee
  solo). En el frame de arriba deja además lo leído en `sobrio.stored`, que es de donde el
  switcher saca ajustes, tema y excepciones: abre dibujado sin preguntar nada.
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
- El switcher vive en un shadow root cerrado y está en cada página desde que empieza: `stats.js`,
  `match.js`, `icons.js`, `switcher-css.js` y `switcher.js` son un content script del frame de
  arriba (0.45 ms por página). Así `sobrio.toggleSwitcher` lo abre en la misma tarea de la tecla.
  En Firefox lo abre `shortcuts.js` en el `keydown` del atajo del navegador (`switcherKey`), y con
  `preventDefault` el navegador ya no corre el comando; en Chrome, y cuando el foco está en la
  barra de direcciones o en un iframe, lo abre el background con una llamada a `executeScript`
  con `injectImmediately`. A una pestaña de antes de instalar sobrio le manda los archivos
  (`pendingOpen`). La primera tecla del atajo (Ctrl) ya pide la lista (`warmSwitcher`), para que
  esté cuando llega la segunda. La lista y la memoria llegan del background en un mensaje, cada
  una como texto JSON; el background guarda el de los bookmarks en `storage.session`. `match.js`
  guarda por id los marcadores ya normalizados. Su CSS es un string. Sus colores son variables
  `--s-*`.
- El gancho de tema son variables `--sobrio-*` en `userContent.css` dentro de
  `@-moz-document url-prefix("moz-extension://")`. Solo el background de Firefox (y la página de
  ajustes) las lee; `storeThemeHook` escribe `theme` solo si cambió. En dot, la plantilla
  `theme/templates/librewolf/userContent.css` las genera. A Dark Reader, `--sobrio-text` le llega
  como el gris de su misma luz (`darkTheme`): Dark Reader le pone a todo texto gris de la página el
  tono y la saturación de ese color con menos luz, y el `#edf1ff` del tema travesti dejaba lila el
  texto de Wikipedia (`#b6c6ff`).
- Las páginas de sobrio y su switcher son cuadrados, salvo que el gancho diga `--sobrio-corners:
  round` con un radio: entonces siguen la curva del tema (`roundCorners`), la superelipse de
  `rounding_power` de Hyprland, con `--sobrio-radius` (el switcher), `--sobrio-radius-small` (campos
  y botones) y `--sobrio-corner-power`, que dot genera desde `bin/theme`. Firefox 158 acepta
  `corner-shape` con `layout.css.corner-shape.enabled`, pero la dibuja como círculo: cada borde es
  una imagen SVG en `border-image` (`squircleBorder`, con los colores ya resueltos de la página y
  una por estado) y `border-radius` solo da forma al anillo de foco. Lo que muestra su propio fondo
  (la muestra de color) se recorta con `squircleClip`.

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
- Cada frame sigue las excepciones de su propio host y las del sitio de la barra de direcciones
  (`siteState(stored, host, top)`): pz o px apagados en un sitio lo apagan también en sus iframes
  (el artifact de claude.ai vive en `claudeusercontent.com` y salía negro). `page.js` saca el sitio
  de `location.ancestorOrigins` (Chromium y Firefox 158 la tienen); sin ella, o con el origen
  escondido (`"null"`, por la política de referrer), se lo pregunta al background (`top-host`), que
  lo lee de la pestaña.
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
  imagen no llega a `window`, se escucha en `document`. Un `<video>` solo se oscurece si es fondo
  (silenciado y en loop): sobre un reproductor el texto es su propia interfaz, y en YouTube la
  tarjeta de un anuncio dejaba oscuro el video (es el mismo `<video>` para el anuncio y el video).
- El switcher abre dibujado, con los colores del tema, en la tecla misma: no espera nada. La
  lista llega unos milisegundos después (o ya está, por la tecla Ctrl o por la vez anterior en la
  página) y hasta entonces no muestra bookmarks, no salta a un motor y un Enter la espera. Solo
  donde no hay `page.js` (una pestaña de antes de instalar) se queda transparente hasta saber el
  tema, máximo 150 ms. Los bookmarks de Diego son alias (`g`, `yt`, `pi`): un título igual a la
  búsqueda va primero, sobre la memoria y los más nuevos.
- `scripting.executeScript` sin `injectImmediately` espera a `document_idle`: en una página que
  tardaba 3 s en cargar, el switcher salía 2.4 s después de Ctrl+Space, y lo tecleado mientras
  tanto se iba a la página (y a sus atajos).
- Firefox le da cada tecla a la página antes de correr sus propios atajos, también los comandos
  de una extensión, y si la página hace `preventDefault` el comando no corre. Chrome se queda la
  tecla de un comando y la página nunca la ve (sí ve el Ctrl solo). Probarlo en Chromium pide
  teclas del sistema: `Xvfb`, un Chromium con ventana (`--ozone-platform=x11`) y
  `xdotool key ctrl+space`; las de CDP van directo a la página. Con "Bloquear" en el permiso
  "Anular atajos de teclado" de un sitio (o `permissions.default.shortcuts` en 2), Firefox
  tampoco le da la tecla a la página y el switcher abre por el background.
- En Firefox un mensaje con miles de objetos es lento: la lista de 1,500 bookmarks tardaba 50 ms
  en llegar a la página y como un solo texto JSON tarda 8. `bookmarks.getTree()` tarda ahí de 60
  a 90 ms, el background se detiene a los 30 s sin trabajo (despertarlo cuesta unos 45 ms; la
  preferencia `extensions.background.idle.timeout` lo alarga) y `storage.local` desde un content
  script tarda unos 20 ms contra 3 desde el background. Por eso el texto de los bookmarks vive en
  `storage.session` y la memoria viaja en el mismo mensaje. Un background recién despertado
  contesta con el texto guardado (`checked: false`) y el switcher vuelve a pedir el verificado.
- Cada tecla en el switcher corre la búsqueda y redibuja la lista en la misma tarea: con 1,500
  bookmarks eran 21 ms por tecla en Firefox (10 de búsqueda, 11 de dibujar 50 filas). `match.js`
  puntúa todos sin construir nada y solo arma los que se muestran; `switcher.js` dibuja en la
  tecla las filas que caben en pantalla y el resto 60 ms después, con un solo listener para toda
  la lista, y no llama `scrollIntoView` al redibujar (obliga a calcular el layout en el acto).
  Quedó en 3 a 13 ms.
- Marionette apaga cosas de Firefox que una persona sí tiene: el retraso de teclas tras navegar
  (`dom.input_events.security.minNumTicks` 3 y `minTimeElapsedInMS` 100: la página no recibe
  teclas en los primeros 100 ms y 3 cuadros de cada carga) y el aviso de script lento. Para
  medir como en un Firefox real hay que devolverlos con `--pref`, más
  `dom.input_events.security.isUserInputHandlingDelayTest=true` para que alcance a las teclas
  sintéticas. Medido, ese retraso pesa poco (en Wikipedia la primera tecla llega a los 238 ms de
  empezar la carga con él y a los 160 sin él): no vale la pena tocarlo.
- Dark Reader procesaba todas las hojas de una página en una sola tarea y mientras tanto la
  página no atendía ni una tecla: en GitHub claro 1.2 s (347 ms casando variables y 779
  reescribiendo 17,600 reglas), en YouTube claro 1 s (21,900 reglas en una hoja que llega
  después del arranque). Con el parche, la peor espera de una tecla durante la carga
  (`tools/loadlag.py`) bajó en GitHub de 950 ms (hasta 1,650 en algunas visitas) a 125, y en
  YouTube de 1,018 a unos 450 (sin sobrio son 380, de YouTube); Wikipedia sigue en 98, de un
  jalón. Los colores finales llegan unos 100 ms después que antes en GitHub (1,388 a 1,498; la
  página se ve antes, tapada). En CPU, en Firefox la primera visita a GitHub cuesta 21 % menos
  (las reglas ya no se reconstruyen cientos de veces) y las siguientes 7 % más (la página se
  estila una vez bajo la tapa y otra al quitarla); en Chromium, 25 % menos de hilo principal.
  Con el tema oscuro propio del sitio Dark Reader ni arranca.
- Lecciones de ese parche. Partir sin prioridad (`MessageChannel`) dejaba pasar todas las tareas
  de la página entre trozo y trozo: los colores finales llegaban 1 s tarde (2.35 s en GitHub).
  Una hoja que no se podía leer al recoger variables pero sí al dibujar se dibujaba sin sus
  variables y ya no se corregía (un `background: var(--x, #eee)` con respaldo no se suscribe a
  nada): solo se dibuja lo ya recogido. Los vigilantes arrancan después de recoger variables, o
  el de estilos en línea mete un `matchVariablesAndDependents` a medias. La tapa de sobrio no
  debe parecerle a Dark Reader una hoja de la página (clase `darkreader`). Para saber si la
  salida cambió: copias locales de las hojas reales de un sitio en una página propia, encender
  el modo oscuro con la página ya cargada (`darkOff` puesto y luego quitado) y comparar las
  reglas de cada `style.darkreader`: sale idéntico. Durante la carga el propio Dark Reader sin
  parche varía entre corridas (qué hojas habían cargado), y en Chromium una imagen generada
  puede salir como `blob:` en vez de `data:`. Decidir si partir por el número de reglas falla:
  las hojas que anidan reglas en `@media` o `@layer` parecen chicas, y veinte hojas medianas
  que llegan juntas suman un segundo; decide el tiempo (el primer tramo largo). Un banco con
  `privacy.reduceTimerPrecision` apagado escondió ese caso: las cifras buenas son las de
  `loadlag.py`, sin preferencias. Lo que queda sin partir: los recorridos del DOM con que
  arrancan sus vigilantes (unos 45 ms cada uno en GitHub) y rehacer el CSS de una hoja ya
  oscurecida.
- Pruebas de navegador que conviene repetir: Wikipedia queda negra; GitHub con `--dark` usa su
  tema propio y sin él queda negro; `pz`/`px`, la pausa `pd` y los ajustes cambian en vivo; el switcher en
  GitHub no deja pasar la `s` al sitio; Ctrl+Space en una página que sigue cargando (sale al
  momento y lo tecleado no llega a la página), con el foco dentro de un iframe y en una pestaña
  de antes de instalar; una página pesada cuadro por cuadro (ninguna caja clara mientras Dark
  Reader trabaja, la tapa quitada y todas sus hojas encendidas al final), apagar el modo oscuro
  a media carga y una pestaña que carga en segundo plano; la nueva pestaña con cada estilo y diseño; velocidad con
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
entra a revisión: no mandar varias seguidas. `AMO_PUBLISH` está en `true` desde el 2026-11-24.

- AMO bloquea algunas IPs de los runners de GitHub ("The IP address has been blocked", HTTP 403):
  "Re-run failed jobs" lo intenta desde otra máquina; el release de GitHub ya creado se queda.
- AMO rechaza la versión entera si las notas para revisores pasan de 3000 caracteres
  (`test/amo.test.js` lo revisa). Por eso la 0.4.6 no llegó a AMO y salió la 0.4.7.

## Commits

En inglés, minúsculas, cortos y sin trailers.
