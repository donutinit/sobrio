# addons.mozilla.org

What goes in the AMO listing and in the notes for reviewers. The package is
`dist/sobrio-<version>.xpi` from `scripts/pack.sh` (the zip plus the home page, which only
Firefox takes); AMO takes the xpi as is.

## Updates

The first version and the listing were submitted by hand. Later versions go out with a tag: the
release workflow runs `scripts/publish-amo.py`, which uploads the xpi, waits for AMO's validation
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
- **Data permissions:** none required. The optional qBittorrent integration sends the clicked
  magnet URL and, if configured, the API key to the user's HTTPS server. Firefox asks for
  website content and, when a key is used, authentication information.

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
open and ranks it higher. pz and px toggle dark mode and the stylesheet on the current site, and
pd pauses both everywhere for 3 minutes (pd15 for 15).

A new tab with the date and the time set with care: six layouts, four typographic styles or
fonts of your own, an optional greeting, the date in a language picked at random from your list,
and the switcher under it.

Shortcuts of your own, media speed for every video and audio with ] and [, and a pause for media
that starts playing sound by itself.

Exceptions per site, for the stylesheet, for dark mode and for animations. Everything saves
itself and applies to open tabs at once.

In Settings › Media, you can opt in to sending clicked magnet links over HTTPS to your own
qBittorrent server. The API key, if configured, stays out of backups.

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
que abres y lo sube en la búsqueda. pz y px prenden o apagan el modo oscuro y la hoja de estilo
en el sitio actual, y pd pausa los dos en todos lados por 3 minutos (pd15 por 15).

Una nueva pestaña con la fecha y la hora bien compuestas: seis diseños, cuatro estilos
tipográficos o tus propias fuentes, un saludo opcional, la fecha en un idioma al azar de tu lista
y el switcher debajo.

Atajos propios, velocidad para cada video y audio con ] y [, y pausa para lo que empieza a sonar
solo.

Excepciones por sitio para la hoja de estilo, el modo oscuro y las animaciones. Todo se guarda
solo y se aplica al momento en las pestañas abiertas.

En Ajustes › Medios puedes activar el envío de enlaces magnet a tu servidor de qBittorrent
por HTTPS. Si configuras una clave de API, queda fuera de los respaldos.

Código y documentación: https://github.com/donutinit/sobrio

## Notes for reviewers

```
sobrio has no build step: every file in the package is the source as written, except:

1. darkreader.js is the "darkreader" npm package, version 4.9.135, file package/darkreader.js,
   not minified, plus tools/darkreader.patch (its changes are marked "sobrio:"): it goes
   through a page's stylesheets in slices, so the page keeps answering.
   Tarball: https://registry.npmjs.org/darkreader/-/darkreader-4.9.135.tgz
   Registry integrity: sha512-h/gmS/KzY8HgmsgOSFh7ssJnsC5ymuhIwZqxksPKCS1K400OUJyjDPZN1L2YIrzX+oezhVUNnCDZPfmPUvdJNA==
   sha256 of the npm file: 6bc5cb7bc3dd4014902a73898cfad95e07474755d64abbfe9e7bac02c2f59937
   tools/vendor-darkreader.py downloads it, checks the integrity and applies the patch;
   test/darkreader.test.js undoes the patch and checks that sha256. License: MIT
   (THIRD_PARTY_NOTICES.md). boot.js gives the bundle an AMD define; page.js runs its code
   when dark mode first turns on.

2. proxy.js is darkreader.js's injectProxy function, copied by the same tool
   (test/proxy.test.js checks it), run as a content script in the page's world ("world":
   "MAIN") where the page's CSP blocked Dark Reader's inline copy; without it Dark Reader polls
   every stylesheet on every frame. It only wraps the CSSOM methods it needs.

3. fonts/*.woff2 and fonts.css are Instrument Serif, Inter, IBM Plex Mono and EB Garamond from
   Fontsource, unchanged, under the SIL Open Font License (licenses in fonts/).

Permissions:
- <all_urls> and the content scripts: the stylesheet and dark mode apply to every site; the
  switcher waits in each top frame for Ctrl+Space.
- scripting: opens the switcher when the shortcut comes from outside the page (address bar,
  iframe) and in tabs older than the install.
- bookmarks: the switcher searches the person's bookmarks.
- storage: settings, per-site exceptions, the switcher's memory and the hosts seen with a dark
  theme of their own in storage.local; the bookmark list in storage.session (in memory).

Network: guard.js limits Dark Reader fetches to CSS and images over HTTP(S), 5 MB, no cookies,
and redirects to public HTTPS hosts. User CSS can request URLs. Opt-in magnet forwarding
(Settings > Media) sends a clicked link and optional key to the user's HTTPS qBittorrent server.
No cookies or redirects. The key stays out of backups.

On a real install (management.getSelf() tells it from a temporary one) sobrio opens
welcome.html once.

The new tab page is also Firefox's home page (chrome_settings_overrides.homepage). That key,
added by scripts/pack.sh, is the only difference from the repository's manifest.json.

Site shortcuts pressed in an iframe go to the tab's top frame (tabs.sendMessage, frameId 0),
which looks them up again.

To try it: open any site (it turns black), press Ctrl+Space, type a bookmark's name or pz, px
or pd, open a new tab and the settings (the add-on's preferences).
Source and tests: https://github.com/donutinit/sobrio (node --test).
```
