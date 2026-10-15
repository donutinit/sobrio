<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Una extensión con opinión sobre cómo debe verse la web y cómo debe sentirse un navegador.">
  </picture>
</p>

<p align="center">
  <a href="#qué-hace">Qué hace</a> ·
  <a href="#ajustes">Ajustes</a> ·
  <a href="#instalar">Instalar</a> ·
  <a href="#desarrollo">Desarrollo</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <b>Español</b> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.nl.md">Nederlands</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.pl.md">Polski</a> ·
  <a href="README.cs.md">Čeština</a> ·
  <a href="README.hu.md">Magyar</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.tr.md">Türkçe</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.uk.md">Українська</a> ·
  <a href="README.id.md">Bahasa Indonesia</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a>
</sub></p>

sobrio toma una pequeña parte de [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) y [Global Speed](https://github.com/polywock/globalSpeed), y nada más. Una extensión para Firefox, LibreWolf y Chrome, dos colores, sin esquinas redondeadas, y nada sale de tu navegador.

![El switcher abierto sobre Wikipedia, que sobrio volvió negra: al escribir "ru" aparecen los bookmarks de Rust con las letras coincidentes en negrita.](docs/screens/switcher.png)

## Qué hace

### Una hoja de estilo, en todos lados

Sin esquinas redondeadas, sombras, sombras de texto ni blur. Las animaciones y las transiciones se cortan por completo, excepto en el reproductor de YouTube. Sin barras de desplazamiento, sin scroll suave, y los fondos se mueven con la página. Enlaces subrayados, cualquier texto se puede seleccionar, y el CSS no fuerza MAYÚSCULAS.

Cada parte es un interruptor en los ajustes (las barras delgadas en vez de ninguna, también), y otras dos empiezan apagadas: las imágenes y el video en escala de grises, y un contorno visible en el elemento con foco. Debajo hay una caja para tu propio CSS (hasta 50,000 caracteres), en una hoja aparte después de la de sobrio en cada sitio, así que un `@import` al inicio funciona.

### Negro, con criterio

![El artículo de Wikipedia sobre tipografía: la mitad izquierda como lo dibuja el sitio, blanca, y la derecha con sobrio, negra.](docs/screens/wikipedia.png)

El motor dinámico de Dark Reader vuelve negro cada sitio (`#000`), color por color. Los sitios que ya tienen un tema oscuro propio lo conservan. El brillo, el contraste, el sepia, la escala de grises y los colores están en los ajustes; no hay horarios.

### Un switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> abre una caja en medio de la página, como el quick switcher de Obsidian. Escribe para buscar en tus bookmarks; qué tan flexible es la búsqueda es un ajuste (estricta, normal o flexible). Si nada coincide, <kbd>Enter</kbd> busca en la web. <kbd>Tab</kbd> recorre Google, DuckDuckGo, YouTube, Wikipedia, GitHub y tus propios motores (cualquier dirección con `%s`, como una instancia de SearXNG); el motor por defecto va primero. Cada una de esas piezas se puede apagar.

Recuerda lo que abres desde ahí: un bookmark que abres seguido, y uno que abriste hace poco, sube en los resultados. La pestaña Estadísticas de los ajustes muestra cuántas veces se abrió cada página y su peso, y reinicia una o todas.

| Tecla | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | mover |
| <kbd>Enter</kbd> | abrir aquí |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | abrir en una pestaña nueva |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | motor siguiente / anterior |
| <kbd>Esc</kbd> | cerrar |

Tres comandos, escritos en el switcher. También funcionan desde el botón de la barra, sobre el sitio de la pestaña activa, y sus palabras se pueden cambiar en Ajustes › Switcher:

| Comando | |
|---|---|
| `td` | modo oscuro prendido o apagado en el sitio actual |
| `ta` | la hoja de estilo prendida o apagada en el sitio actual |
| `settings` | los ajustes (`options` también funciona) |

### Una nueva pestaña

![Los seis diseños de la nueva pestaña: clásico, solo la hora, en una línea, apilado, esquina y analógico.](docs/screens/layouts.png)

La fecha y la hora, con cuidado, y el switcher debajo. Seis diseños: clásico, solo la hora, en una línea, apilado (horas sobre minutos), esquina y un reloj analógico minimalista. Cuatro tipografías: Editorial (Instrument Serif e Inter), Suizo (Inter), Máquina (IBM Plex Mono) y Libro (EB Garamond), o las fuentes que tengas instaladas en la computadora. Un saludo opcional con tu nombre. Dale una lista de idiomas y cada nueva pestaña dice la fecha en uno de ellos, al azar.

Los navegadores mantienen el foco en la barra de direcciones en una pestaña nueva, y ninguna extensión puede quitárselo desde ahí. Para que puedas escribir en el switcher de inmediato, la pestaña se cambia por una nueva en el mismo lugar, que empieza con la página enfocada; la barra de direcciones entonces muestra la dirección de la página en vez de quedar vacía. En una pestaña de contenedor de Firefox se queda como está. Apaga *Quitarle el foco a la barra de direcciones* si prefieres la forma del navegador.

### Velocidad de medios

Cada video y audio se reproduce a la velocidad que elijas, o a la regla propia de un sitio. <kbd>]</kbd> más rápido, <kbd>[</kbd> más lento, <kbd>\\</kbd> vuelve a 1×. Todo lo que está entre 0.91× y 1.09× es simplemente 1×. Si cambias la velocidad con los controles propios de un sitio, sobrio no se mete en esa página. Opcionalmente, los videos y audios que empiezan a sonar antes de que toques la página se pausan; los que están silenciados siguen reproduciéndose.

### Tus propios atajos

Graba una combinación de teclas en los ajustes y elige qué hace: abrir el switcher, buscar en un motor (o buscar la selección de texto), prender o apagar el modo oscuro o la hoja de estilo en el sitio, modo oscuro en todos lados, abrir una dirección aquí o en una pestaña nueva, fijar la velocidad de medios, copiar el enlace de la página sin parámetros de rastreo (`utm_*`, `fbclid`, `gclid` y similares), o abrir los ajustes. Necesitan <kbd>Ctrl</kbd>, <kbd>Alt</kbd> o <kbd>Meta</kbd>, o una tecla de función. También funcionan con el foco dentro de un marco incrustado (Google Docs, un reproductor de video), y siempre actúan sobre el sitio de la barra de direcciones.

## Ajustes

![Los ajustes, en la pestaña Estilo: una lista de interruptores junto a las pestañas Estilo, Modo oscuro, Excepciones, Switcher, Atajos, Nueva pestaña, Medios y Estadísticas.](docs/screens/settings.png)

`settings` en el switcher, o las preferencias de la extensión en `about:addons` / `chrome://extensions`. Una pestaña por parte: Estilo, Modo oscuro, Excepciones, Switcher, Atajos, Nueva pestaña, Medios y Estadísticas. Cada cambio se guarda solo y se aplica de inmediato a las pestañas abiertas.

Un respaldo al final de cada pestaña guarda todo (ajustes, excepciones, atajos y la memoria del switcher) en un archivo, y lo restaura en otro navegador. La guía de bienvenida, que se abre una vez al instalar, también está ahí.

Las direcciones locales (`localhost`, `127.0.0.1`, `192.168.x`, los nombres `.local` y el resto de tu máquina o tu red) se dejan en paz por defecto, así que tu trabajo local se ve tal cual; un interruptor arriba de la pestaña Excepciones cambia eso.

Las excepciones aceptan sitios como `example.com` (solo ese sitio) o `*.example.com` (el sitio y sus subdominios), para la hoja de estilo y para el modo oscuro por separado. Una tercera lista, Con sus animaciones, conserva las animaciones y transiciones de un sitio mientras el resto de la hoja de estilo se aplica; empieza con `chatgpt.com`, cuya vista se mueve mientras escribe si se le cortan las animaciones.

### Cambiar el tema desde `userContent.css`

En Firefox y LibreWolf, sobrio lee estas variables de `userContent.css` (con `toolkit.legacyUserProfileCustomizations.stylesheets` activado) y las usa para el modo oscuro, el switcher, los ajustes y la nueva pestaña. Tienen prioridad sobre los colores de los ajustes. La regla `@-moz-document` las deja solo en las páginas de la extensión: ningún sitio web las ve.

```css
@-moz-document url-prefix("moz-extension://") {
  :root {
    --sobrio-background: #07090f;   /* dark mode, switcher and new tab background */
    --sobrio-text: #edf1ff;
    --sobrio-text-muted: #7c86a0;
    --sobrio-selection: #171d2b;    /* the selected row, and selected text */
    --sobrio-border: #4a5470;
    --sobrio-accent: #f5a9cf;       /* the selection bar and the matched letters */
    --sobrio-corners: square;       /* square or round: overrides the corners switch */
    --sobrio-font: "SF Pro Text";   /* optional: a font installed on this machine */
  }
}
```

El navegador lee `userContent.css` al arrancar, así que los cambios se ven después de reiniciarlo.

## Instalar

- **Chrome:** `chrome://extensions`, activa *Modo de desarrollador*, *Cargar descomprimida* y elige esta carpeta.
- **LibreWolf:** pon `xpinstall.signatures.required` en `false` en `about:config`, ejecuta `scripts/pack.sh` y abre `dist/sobrio-<version>.xpi` desde `about:addons` (*Instalar complemento desde archivo*). Para probarla rápido, `about:debugging` › *Cargar complemento temporal* funciona sin esa preferencia.
- **Firefox:** las versiones de publicación solo instalan complementos firmados. Sube el zip a [addons.mozilla.org](https://addons.mozilla.org/developers/) como *no listado* para que lo firmen para ti.

Firefox pregunta una vez si quieres conservar la nueva pestaña que puso la extensión; consérvala. El atajo se cambia en `about:addons` › *Administrar atajos de extensiones* o en `chrome://extensions/shortcuts`.

En las páginas donde las extensiones no pueden correr (las páginas `about:` y `chrome://`, las tiendas de complementos, los PDF), el atajo abre el switcher desde el botón de la barra. El botón de la barra siempre lo abre también. En Firefox, algunas páginas se reconocen demasiado tarde (un PDF sin `.pdf` en su dirección, las páginas de error): ahí el atajo no hace nada y el botón de la barra sigue funcionando.

**Consejo:** pon tu navegador o tu sistema en apariencia oscura. Los sitios con tema oscuro propio (GitHub, YouTube y muchos más) entonces lo usan, y sobrio los deja en paz.

## Desarrollo

No hay paso de compilación ni dependencias de npm.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

Para publicar, sube la versión en `manifest.json`, haz commit y empuja una etiqueta `v<version>`. El flujo de trabajo de publicación prueba, empaqueta y publica una release en GitHub con el zip y el xpi, y envía el zip a addons.mozilla.org cuando la variable del repositorio `AMO_PUBLISH` es `true` (con los secretos `AMO_JWT_ISSUER` y `AMO_JWT_SECRET`).

La marca (el isotipo, los dos colores, la tipografía y los íconos) está en [docs/brand](docs/brand/README.md).

## Licencia

MIT. Incluye Dark Reader (MIT) y cuatro fuentes bajo la SIL Open Font License: ver [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
