# addons.mozilla.org

What goes in the AMO listing and in the notes for reviewers. The package is
`dist/sobrio-<version>.zip` from `scripts/pack.sh`; AMO takes the zip as is.

## Updates

The first version and the listing were submitted by hand. Later versions go out with a tag: the
release workflow runs `scripts/publish-amo.py`, which uploads the zip, waits for AMO's validation
and creates the version with the release notes and the block under "Notes for reviewers" below.
It needs, once:

1. API keys from https://addons.mozilla.org/developers/addon/api/key/, stored as repository
   secrets: `gh secret set AMO_JWT_ISSUER` and `gh secret set AMO_JWT_SECRET`.
2. A check: Actions › Release › Run workflow validates the current package with those keys and
   sends nothing.
3. The switch: `gh variable set AMO_PUBLISH --body true`. Until then a tag makes only the GitHub
   release.

## Listing

- **Name:** sobrio
- **Slug:** sobrio
- **Categories:** Appearance, Bookmarks
- **License:** MIT
- **Homepage and support site:** https://github.com/donutinit/sobrio
- **Platforms:** Firefox for desktop only (not Android: the switcher and the shortcuts need a
  keyboard).
- **Privacy policy:** none needed. sobrio sends nothing anywhere and declares
  `data_collection_permissions: none`.

### Summary (en-US, at most 250 characters)

An opinionated extension on how the web should look and how a browser should feel: black sites
through Dark Reader's engine, no rounded corners, shadows or animations, a keyboard switcher for
bookmarks and search, and a calm new tab.

### Summary (es)

Una extensión con opinión sobre cómo debe verse la web y sentirse un navegador: sitios negros con
el motor de Dark Reader, sin esquinas redondas, sombras ni animaciones, un switcher
para bookmarks y búsqueda, y una nueva pestaña tranquila.

### Description (en-US)

sobrio takes one small part of Stylus, Dark Reader, Search Bookmarks History and Tabs, Tabliss
and Global Speed, and nothing else.

One stylesheet, everywhere. No rounded corners, shadows, text shadows or blur. Animations and
transitions cut to nothing, except in YouTube's player. No scrollbars, no smooth scrolling,
backgrounds that scroll with the page, underlined links, any text selectable, no forced
capitals. Each piece is a switch, and there is a box for your own CSS.

Black, smartly. Dark Reader's dynamic engine turns every site black, color by color. Sites that
already have a dark theme of their own keep it.

A switcher. Ctrl+Space opens a box in the middle of the page, like Obsidian's quick switcher.
Type to search your bookmarks; Tab moves through Google, DuckDuckGo, YouTube, Wikipedia, GitHub
and engines of your own (any address with %s, such as a SearXNG instance). It remembers what you
open and ranks it higher. td and ta toggle dark mode and the stylesheet on the current site.

A new tab with the date and the time set with care: six layouts, four typographic styles or
fonts of your own, an optional greeting, the date in a language picked at random from your list,
and the switcher under it.

Shortcuts of your own, media speed for every video and audio with ] and [, and a pause for media
that starts playing sound by itself.

Exceptions per site, for the stylesheet, for dark mode and for animations. Everything saves
itself and applies to open tabs at once. Nothing leaves your browser.

Source and documentation: https://github.com/donutinit/sobrio

### Description (es)

sobrio toma una parte pequeña de Stylus, Dark Reader, Search Bookmarks History and Tabs, Tabliss
y Global Speed, y nada más.

Una hoja de estilo en todos lados. Sin esquinas redondas, sombras, sombras de texto ni blur.
Animaciones y transiciones cortadas, salvo en el reproductor de YouTube. Sin barras de
desplazamiento, sin desplazamiento suave, fondos que se mueven con la página, enlaces
subrayados, cualquier texto seleccionable y sin mayúsculas forzadas. Cada pieza es un
interruptor, y hay una caja para tu propio CSS.

Negro, con cabeza. El motor dinámico de Dark Reader pone cada sitio en negro, color por color.
Los sitios que ya tienen tema oscuro propio lo conservan.

Un switcher. Ctrl+Space abre una caja en medio de la página, como el quick switcher de Obsidian.
Escribe para buscar en tus bookmarks; Tab recorre Google, DuckDuckGo, YouTube, Wikipedia, GitHub
y tus propios motores (cualquier dirección con %s, como una instancia de SearXNG). Recuerda lo
que abres y lo sube en la búsqueda. td y ta prenden o apagan el modo oscuro y la hoja de estilo
en el sitio actual.

Una nueva pestaña con la fecha y la hora bien compuestas: seis diseños, cuatro estilos
tipográficos o tus propias fuentes, un saludo opcional, la fecha en un idioma al azar de tu lista
y el switcher debajo.

Atajos propios, velocidad para cada video y audio con ] y [, y pausa para lo que empieza a sonar
solo.

Excepciones por sitio para la hoja de estilo, el modo oscuro y las animaciones. Todo se guarda
solo y se aplica al momento en las pestañas abiertas. Nada sale de tu navegador.

Código y documentación: https://github.com/donutinit/sobrio

## Notes for reviewers

```
sobrio has no build step: every file in the package is the source as written, except two
third-party pieces, both unmodified:

1. darkreader.js is the "darkreader" npm package, version 4.9.133, file package/darkreader.js,
   not minified.
   Tarball: https://registry.npmjs.org/darkreader/-/darkreader-4.9.133.tgz
   Registry integrity: sha512-d3dRGpVgoBnMXl9qfnTuRvrdtO/9e6puFbsDwxfycTwbRNFI+sNX+093h6qnNo4VosyHHUaIXyunDWvbEudTRQ==
   sha256 of darkreader.js: 82619e7a0bcabbea15a91488bc74fd0f9ba8f8f2a1cc67527f78166037cce166
   tools/vendor-darkreader.py in the repository downloads it and checks that integrity.
   License: MIT (THIRD_PARTY_NOTICES.md).

2. fonts/*.woff2 and fonts.css are Instrument Serif, Inter, IBM Plex Mono and EB Garamond from
   Fontsource, unchanged, under the SIL Open Font License (licenses in fonts/).

Permissions:
- <all_urls> and the content script: the stylesheet and dark mode apply to every site.
- scripting: the switcher is injected into the current tab only when the person opens it
  (Ctrl+Space or a shortcut).
- bookmarks: the switcher searches the person's bookmarks.
- storage: settings, per-site exceptions and the switcher's memory, all in storage.local.

Network: the background fetches a cross-origin stylesheet or image when Dark Reader asks for it
(to darken it), only over http(s), without cookies, only text/css or image/*, at most 5 MB, and a
redirect may only end on a public https host (guard.js). Nothing else is sent anywhere; no
analytics, no remote code.

To try it: open any site (it turns black), press Ctrl+Space and type a bookmark's name, type td
or ta in the switcher, open a new tab, and open the settings from the add-on's preferences.
Source and tests: https://github.com/donutinit/sobrio (node --test).
```
