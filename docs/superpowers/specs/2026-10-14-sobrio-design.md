# sobrio: diseño

Fecha: 2026-10-14. Estado: aprobado por secciones en conversación, pendiente de revisión escrita.

> sobrio: an opinionated extension on how the web should look and how a browser should feel.
> Based on Stylus, Dark Reader and Search Bookmarks, History and Tabs.

## Intención

Diego usa tres extensiones (Stylus, Dark Reader y Search Bookmarks, History and Tabs) y de cada
una ocupa una parte chica. sobrio junta esas partes en una sola extensión mínima y con opinión
propia para Firefox, LibreWolf y Chrome:

1. **Su CSS** en todos los sitios: sin esquinas redondeadas, sombras ni blur, animaciones
   apagadas salvo en el reproductor de YouTube y scrollbars delgadas.
2. **Modo oscuro inteligente:** los sitios se ven negros con el motor dinámico de Dark Reader.
   Sin horarios, shaders, CSS personalizado ni ajustes.
3. **Switcher tipo Obsidian:** una caja centrada que busca bookmarks con fuzzy search y, con Tab,
   busca el mismo texto en motores de búsqueda.

**Éxito:** Diego desinstala las tres extensiones en LibreWolf y Chrome y no extraña nada de lo
que usaba. Los tests pasan y la lista de pruebas manuales pasa en los dos navegadores.

**Fuera de alcance:** historial, pestañas abiertas, página de opciones, editor de estilos,
horarios, ajustes de brillo o contraste, arreglos por sitio de Dark Reader (se pueden agregar
después, ver "Después"), sincronización entre dispositivos y publicación en tiendas.

## Arquitectura

JS plano, sin build, sin `package.json` y sin dependencias de npm. Manifest V3 único para los tres
navegadores.

### Manifest

- `background`: `{"scripts": ["background.js"], "service_worker": "background.js"}`. Firefox usa
  `scripts` (event page) y Chrome usa `service_worker`.
- `browser_specific_settings.gecko`: `id` `sobrio@donutinit`, `strict_min_version` `128.0`
  (ESR). `minimum_chrome_version` `127` (necesario para `action.openPopup()`).
- `permissions`: `bookmarks`, `storage`, `scripting`. `host_permissions`: `<all_urls>`.
- `content_scripts`: un solo bloque en `<all_urls>`, `run_at: document_start`, `all_frames: true`,
  `match_about_blank: true`, con los archivos en este orden: `boot.js`, `custom-css.js`,
  `darkreader.js`, `detector.js`, `page.js`.
- `action.default_popup`: `popup.html`. Clic en el ícono abre el switcher en modo popup.
- `commands.open-switcher`: `suggested_key.default` `Ctrl+Space`.
- `default_locale`: `en`, con `_locales/en` y `_locales/es`.

### Archivos

| Archivo | Responsabilidad |
|---|---|
| `boot.js` | Primer script en cargar. Guarda `chrome.runtime.sendMessage` nativo en una global antes de que Dark Reader lo parche (ver "Dark Reader dentro de un content script"). |
| `custom-css.js` | El CSS de Diego, tal cual, en un string. Es el único lugar donde se edita. |
| `darkreader.js` | Paquete npm `darkreader` 4.9.133 (`darkreader.js`, MIT), copiado sin cambios. |
| `detector.js` | Detecta si la página ya es oscura. Separa la decisión pura del muestreo en el DOM. |
| `page.js` | Aplica el CSS, el modo oscuro y el estado por sitio en cada frame. |
| `match.js` | Lógica pura del switcher: fuzzy, modos, motores, comandos y URLs de búsqueda. |
| `switcher.js` + `switcher.css` | La UI. Monta el switcher como overlay en la página o dentro del popup. |
| `popup.html` | Carga `match.js` y `switcher.js` en modo popup. |
| `background.js` | Atajo, lista de bookmarks, abrir URLs y descargas para Dark Reader. |
| `icons/` | `icon.svg` de origen y PNG de 16, 32, 48 y 128. |
| `test/*.test.js` | Tests con `node --test`. |

`match.js` y la parte pura de `detector.js` son scripts clásicos (los content scripts no pueden
usar `import`). Exponen sus funciones en una global y, si existe `module`, también en
`module.exports` para que `node --test` las cargue.

### Estado

`storage.local` guarda `{darkOff: string[], cssOff: string[]}`: listas de `hostname` exactos.
`github.com` y `gist.github.com` son sitios distintos. Cada frame usa su propio `hostname`.

## Su CSS (`custom-css.js` y `page.js`)

El CSS va tal cual lo usa en Stylus:

```css
html {
  scroll-behavior: auto !important;
}

/* Eliminar efectos visuales globalmente */
*,
*::before,
*::after {
  border-radius: 0 !important;
  box-shadow: none !important;
  text-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background-attachment: scroll !important;
}

/* Desactivar animaciones EXCEPTO en el reproductor de YouTube */
*:not(#movie_player, #movie_player *),
*:not(#movie_player, #movie_player *)::before,
*:not(#movie_player, #movie_player *)::after {
  animation-duration: .01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: .01ms !important;
  transition-delay: 0s !important;
}

/* Scrollbars */
* {
  scrollbar-width: thin !important;
}
```

`page.js` lo inserta como `<style>` en `document.documentElement` en cuanto arranca, sin esperar
a `storage`. Lo quita si el dominio está en `cssOff`. Lo normal (todo prendido) no espera nada;
en un sitio con el CSS apagado puede verse aplicado un instante mientras se lee `storage`.

## Modo oscuro

### Arranque de cada frame (`page.js`)

1. En `document_start` inserta un fondo provisional `html { background: #000 !important }` para
   evitar el flash blanco.
2. Lee `storage.local`. Si falla, todo queda prendido.
3. Si el dominio está en `darkOff`, quita el fondo provisional y termina.
4. Si no, configura `DarkReader.setFetchMethod` (ver "Descargas por el background") y llama
   `DarkReader.enable({darkSchemeBackgroundColor: '#000000'})`. Lo demás queda en los defaults
   del motor: modo oscuro, brillo y contraste 100 y texto `#e8e6e3`. Después quita el fondo
   provisional; el motor pone su propio respaldo mientras procesa las hojas.
5. Si `enable` lanza un error, llama `disable`, quita el fondo provisional y deja la página como
   venía. El error queda en consola.

### Detector de sitios oscuros (`detector.js`)

Es un port simplificado de `src/inject/detector.ts` de Dark Reader (MIT). Corre cuando la página
tiene contenido (`body` con hijos que no son `script`, `style` ni `link` y al menos 32 px de alto,
o `DOMContentLoaded`, lo que llegue primero) y se queda con la primera respuesta:

1. `<meta name="color-scheme">` dice exactamente `dark` u `only dark` (oscuro) o `light` u
   `only light` (claro).
2. `<html>` o `<body>` tienen la clase `dark`, o `<html>` tiene `data-theme="dark"`: oscuro.
3. Si no, desactiva las hojas de Dark Reader (las que tienen clase `darkreader`), revisa
   `color-scheme` y `filter` del root y toma muestras de `backgroundColor` con
   `elementFromPoint` en una cuadrícula de hasta 4×4 puntos. Vuelve a activar las hojas. Todo
   pasa en el mismo turno de JS, así que el navegador no llega a pintar el cambio.

La decisión con las muestras de color es una función pura (`isDarkFromSamples`) con los mismos
umbrales del original: un fondo opaco con luminosidad mayor a 0.6 es claro; un fondo
transparente con texto de luminosidad menor a 0.4 es claro; si ninguna muestra decide, se mezcla
el fondo de `html` con el de `body` y por debajo de 0.5 es oscuro.

Si el sitio ya es oscuro, `page.js` llama `DarkReader.disable()` y respeta su tema. El README
recomienda pedir tema oscuro en el navegador (`prefers-color-scheme: dark`): muchos sitios
(GitHub, YouTube) se ponen oscuros solos y el detector los deja en paz.

### Descargas por el background

Dark Reader necesita leer hojas CSS de otros dominios (CDNs) e imágenes para decidir cuáles
invertir. El content script no puede por CORS. `setFetchMethod` recibe una función que pide la
URL al background con el `sendMessage` nativo guardado por `boot.js`. El background descarga y
regresa `{status, type, base64}`; el content script arma un `Response` con un `Blob`. Se manda en
base64 porque la mensajería de Chrome serializa como JSON.

Candados en el background, para que una página no use la extensión para leer datos de otros
sitios:
- solo `http:` y `https:`;
- `fetch(url, {credentials: 'omit', redirect: 'follow'})`: nada de cookies;
- solo respuestas `text/css` o `image/*`; cualquier otra cosa es error;
- máximo 5 MB por respuesta;
- solo mensajes de los propios content scripts (`sender.id === chrome.runtime.id`).

### Dark Reader dentro de un content script

El paquete de npm está pensado para páginas, no para extensiones. Lo que hay que saber:

- Al cargar parcha `chrome.runtime.sendMessage` y `chrome.runtime.onMessage.addListener`. Su
  versión de `sendMessage` **no devuelve la promesa**. Por eso `boot.js` guarda la original antes
  y todo el código de sobrio (incluido `switcher.js`, que corre en el mismo mundo aislado) usa
  esa copia. Si la copia no existe (pestaña abierta antes de instalar la extensión, donde los
  content scripts no corrieron), `switcher.js` usa `chrome.runtime.sendMessage` directo, que en
  ese caso no está parchado.
- Por el mismo parche, cada descarga del motor también llega al background como mensaje de tipo
  propio de Dark Reader. El background responde vacío a cualquier mensaje que no reconoce, para
  que Chrome no deje errores de "receiving end does not exist" en la consola.
- El motor intenta inyectar scripts inline en la página. En sitios con CSP estricta eso falla
  sin romper nada, pero puede dejar avisos de CSP en la consola. Se verifica en el primer paso
  del plan (ver "Riesgos").
- En Chrome usa `chrome.dom.openOrClosedShadowRoot`, que solo existe en content scripts. No
  afecta al switcher porque su shadow root no cuelga del `body`.

## Switcher

### Cómo se abre

`Ctrl+Space` dispara `commands.onCommand` en el background, que intenta
`scripting.executeScript({files: ['match.js', 'switcher.js']})` en la pestaña activa (solo el
frame principal). Si falla (about:, chrome://, tiendas, visor de PDF), llama
`chrome.action.openPopup()`. Si eso también falla, no pasa nada visible y queda un aviso en la
consola del background. Clic en el ícono de la barra abre el popup.

`switcher.js` es idempotente: si ya está abierto, el atajo lo cierra.

### Cómo se ve

- Overlay: elemento `<sobrio-switcher>` en `document.documentElement`, `position: fixed`,
  `inset: 0`, `z-index: 2147483647`, con Shadow DOM **cerrado**: el CSS del sitio y el de Diego
  no entran.
- Fondo de la página oscurecido con `rgba(0, 0, 0, .5)`, sin blur.
- Caja de 640 px de ancho (100% menos 32 px en pantallas chicas), a 12% de la parte de arriba.
  Fondo `#000`, borde de 1 px `#333`, sin esquinas ni sombras. Fuente del sistema, 15 px.
- Input arriba con la etiqueta del modo a la izquierda: `★` en bookmarks o el nombre del motor.
- Filas: título arriba; abajo, más chico y en gris, la carpeta y el dominio. La fila seleccionada
  lleva fondo `#1a1a1a` y una barra blanca de 2 px a la izquierda. Las letras que coinciden van
  en blanco y negrita y el resto en `#888`.
- Hasta 50 resultados con scroll; se ven unos 10.
- En el popup, la misma caja ocupa el popup completo, sin fondo oscurecido.

### Búsqueda de bookmarks

- El background aplana el árbol de bookmarks en `{id, title, url, folder, dateAdded}` y lo
  guarda en memoria. Lo invalida con `bookmarks.onCreated/onRemoved/onChanged/onMoved`. Si el
  service worker muere, lo recalcula.
- Fuera: carpetas, separadores, `javascript:` (MV3 no puede ejecutar bookmarklets) y `place:`.
- El switcher pide la lista una vez al abrir y filtra localmente en cada tecla.
- Fuzzy (en `match.js`): la consulta se parte por espacios; cada palabra debe aparecer como
  subsecuencia (letras en orden, no necesariamente juntas) en el título, la URL o la carpeta, en
  cualquier orden. Puntos extra por letras seguidas y por inicio de palabra, y castigo por los
  huecos. Pesa más el título que la carpeta y la carpeta más que la URL. Empates: el bookmark más
  nuevo primero. Devuelve las posiciones que coinciden para resaltarlas.
- Con el input vacío se ven los 20 bookmarks guardados más recientemente.

### Modos y Tab

Ciclo fijo: bookmarks → DuckDuckGo → Google → YouTube → Wikipedia (es) → GitHub → bookmarks.
Tab avanza y Shift+Tab retrocede. El texto escrito se conserva.

| Motor | URL (`%s` = consulta con `encodeURIComponent`) |
|---|---|
| DuckDuckGo | `https://duckduckgo.com/?q=%s` |
| Google | `https://www.google.com/search?q=%s` |
| YouTube | `https://www.youtube.com/results?search_query=%s` |
| Wikipedia | `https://es.wikipedia.org/w/index.php?search=%s` |
| GitHub | `https://github.com/search?q=%s` |

En modo motor hay una sola fila: `Search "<texto>" on <motor>` (en español
`Buscar "<texto>" en <motor>`). Con el input vacío no hay fila.

**Salto automático:** si el texto no está vacío y ningún bookmark coincide, el modo pasa solo al
primer motor. Si el texto cambia y vuelven a coincidir bookmarks, regresa a bookmarks. Si el
usuario eligió el modo con Tab, ya no hay saltos automáticos mientras el switcher siga abierto.
La regla vive en `match.js` como función pura: `(estado, texto, hayResultados) → modo`.

### Comandos `td` y `ta`

Si el texto, sin espacios a los lados y en minúsculas, es exactamente `td` o `ta`, la primera fila
es el comando con el estado actual del sitio:

- `td`: `Turn off dark mode on github.com` o `Turn on dark mode on github.com`.
- `ta`: `Turn off custom CSS on github.com` o `Turn on custom CSS on github.com`.

(En español: `Apagar modo oscuro en github.com`, `Prender CSS en github.com`.) Debajo siguen los
bookmarks que coincidan. Enter ejecuta el comando: agrega o quita el `hostname` de `darkOff` o
`cssOff` y cierra. Cada `page.js` escucha `storage.onChanged` y aplica el cambio al momento en
todas las pestañas de ese dominio, sin recargar. `ta` prende o apaga todo el CSS de Diego, no
solo las animaciones. En el popup no hay comandos.

### Teclas

| Tecla | Acción |
|---|---|
| ↓, Ctrl+J | bajar |
| ↑, Ctrl+K | subir |
| Enter | abrir en la pestaña actual |
| Ctrl+Enter | abrir en pestaña nueva, a la derecha de la actual |
| Tab, Shift+Tab | siguiente o anterior modo |
| Esc, clic afuera | cerrar |

El listener de teclado va en fase de captura dentro del shadow root, con `preventDefault` en las
teclas que usa y `stopPropagation` en todas, para que no disparen atajos del sitio (YouTube,
GitHub). Al cerrar, el foco regresa al elemento que lo tenía. Abrir una URL se hace por el
background: `tabs.update` en la pestaña actual o `tabs.create` con `index` siguiente. Desde el
popup, la pestaña actual es la activa de la ventana.

## Idioma

Textos de interfaz en `_locales/en` y `_locales/es` (unos 10: nombre, descripción, descripción del
atajo, fila de búsqueda, "No bookmarks", textos de `td` y `ta`). El navegador elige según su
idioma. README en inglés, `AGENTS.md` en español.

## Errores

| Caso | Comportamiento |
|---|---|
| Dark Reader lanza al activar | `disable`, quitar fondo provisional, página como venía, error en consola |
| `storage` falla | todo prendido |
| Descarga rechazada por los candados o fallida | el motor la trata como hoja o imagen no disponible |
| Sin bookmarks | fila "No bookmarks"; Tab sigue llevando a los motores |
| No se puede inyectar ni abrir el popup | nada visible, aviso en consola del background |

## Pruebas

**Automáticas**, con `node --test test/` (Node 22 de lizeth, sin dependencias):
- `match.js`: orden de resultados y posiciones resaltadas del fuzzy, palabras en cualquier orden,
  exclusión de bookmarklets, ciclo de Tab en los dos sentidos, salto automático y regreso, que
  Tab apague el salto automático, detección de `td`/`ta`, URLs de búsqueda con `&`, `#`, espacios
  y acentos.
- `detector.js`: `isDarkFromSamples` con casos fijos (fondo blanco, negro, transparente con texto
  claro u oscuro, mezcla de `html` y `body`), y la lectura del `meta color-scheme`.

**Manuales**, en LibreWolf y Chrome:
- Wikipedia (clara, se vuelve negra) y GitHub con tema oscuro del sistema (oscura propia, no se
  toca).
- YouTube: el reproductor conserva sus animaciones y el resto no tiene esquinas ni sombras.
- Un sitio con CSS en un CDN se oscurece completo.
- `about:addons` y `chrome://settings`: `Ctrl+Space` abre el popup.
- `td` y `ta` con dos pestañas del mismo sitio: cambian las dos sin recargar y el estado
  sobrevive a una recarga.
- Ctrl+Space, Ctrl+J, Ctrl+K, Tab y Ctrl+Enter dentro de YouTube y GitHub.
- La consola de la página no muestra errores de sobrio (los avisos de CSP del motor se anotan).

**CI:** un workflow de GitHub Actions que corre `node --test test/`.

## Repo, licencia y distribución

- Repo público `donutinit/sobrio`, desarrollado en lizeth `~/src/sobrio` (con `nodebox-grant` y
  `liz-doc --fix`). Descripción de GitHub: "An opinionated extension on how the web should look
  and how a browser should feel." El repo en GitHub se crea al terminar la primera versión, con
  confirmación de Diego antes del primer push.
- Licencia MIT. `THIRD_PARTY_NOTICES.md` con la licencia MIT de Dark Reader por `darkreader.js` y
  por el detector portado. El README da crédito a Stylus y a Search Bookmarks, History and Tabs
  como inspiración; no se copia código de ellos.
- `AGENTS.md` en español con `CLAUDE.md` como hard link, como en los demás repos.
- Commits en inglés, en minúsculas, cortos, sin trailers.
- `scripts/pack.sh` arma `dist/sobrio-<versión>.zip` con `zip` del sistema. El mismo archivo sirve
  como `.xpi`.
- Instalación: Chrome con "Cargar descomprimida" en modo desarrollador. LibreWolf con el `.xpi`
  sin firmar y `xpinstall.signatures.required = false`, o con carga temporal desde
  `about:debugging`. Firefox normal necesita firmarlo en AMO como "unlisted"; se documenta y no
  se automatiza.
- Versión inicial `0.1.0`.

## Riesgos que se verifican primero

El plan empieza con una prueba mínima en los dos navegadores antes de construir lo demás:

1. El manifest con las dos claves de `background` carga sin errores en Chrome 127+ y en LibreWolf.
2. `darkreader.js` corre dentro del content script en página e iframes, con el `sendMessage`
   nativo guardado por `boot.js`. Se anota cuánto ruido de CSP deja.
3. `Ctrl+Space` se registra en los dos navegadores y Ctrl+J/Ctrl+K se pueden capturar dentro del
   shadow root.
4. `action.openPopup()` funciona desde el atajo en una página protegida en los dos.

Si alguno falla, se para y se replantea esa parte con Diego antes de seguir.

## Después (no en esta versión)

- Arreglos por sitio de Dark Reader (`dynamic-theme-fixes.config`, 822 KB, unos 2,900 sitios) con
  un parser de unas 100 líneas, si algún sitio se ve roto.
- Publicar en AMO y en Chrome Web Store.
