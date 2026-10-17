<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Een eigenzinnige extensie over hoe het web eruit moet zien en hoe een browser moet aanvoelen.">
  </picture>
</p>

<p align="center">
  <a href="#wat-het-doet">Wat het doet</a> ·
  <a href="#instellingen">Instellingen</a> ·
  <a href="#installeren">Installeren</a> ·
  <a href="#ontwikkeling">Ontwikkeling</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <b>Nederlands</b> ·
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

sobrio neemt één klein deel van [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) en [Global Speed](https://github.com/polywock/globalSpeed), en verder niets. Eén extensie voor Firefox, LibreWolf en Chrome, twee kleuren, geen afgeronde hoeken, en niets verlaat je browser.

![De switcher open over Wikipedia, die sobrio zwart heeft gemaakt: als je "ru" typt, staan er Rust-bladwijzers met de gevonden letters vet.](docs/screens/switcher.png)

## Wat het doet

### Één stijlblad, overal

Geen afgeronde hoeken, schaduwen, tekstschaduwen of vervaging. Animaties en overgangen worden helemaal afgekapt, behalve in de speler van YouTube. Geen scrollbalken, geen vloeiend scrollen, achtergronden die met de pagina meescrollen. Links onderstreept, elke tekst selecteerbaar, geen hoofdletters die door CSS worden afgedwongen.

Elk onderdeel is een schakelaar in de instellingen (smalle scrollbalken in plaats van geen, ook), en twee staan standaard uit: afbeeldingen en video in grijstinten, en een zichtbare rand rond het gefocuste element. Daaronder staat een vak voor je eigen CSS (tot 50.000 tekens), in een eigen stijlblad na dat van sobrio op elke site, zodat een `@import` bovenaan werkt.

### Zwart, met verstand

![Het artikel over typografie op Wikipedia: de linkerhelft zoals de site hem tekent, wit, en de rechterhelft met sobrio, zwart.](docs/screens/wikipedia.png)

De dynamische motor van Dark Reader maakt elke site zwart (`#000`), kleur voor kleur. Sites die al een eigen donker thema hebben, behouden dat. Helderheid, contrast, sepia, grijstinten en de kleuren staan in de instellingen; er zijn geen schema's.

### Een switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> opent een vak midden op de pagina, zoals de quick switcher van Obsidian. Typ om je bladwijzers te doorzoeken; hoe ruim er gezocht wordt, stel je in (strikt, normaal of ruim). Als niets past, zoekt <kbd>Enter</kbd> op het web. <kbd>Tab</kbd> loopt door Google, DuckDuckGo, YouTube, Wikipedia, GitHub en je eigen zoekmachines (elk adres met `%s`, zoals een SearXNG-instantie); de standaard zoekmachine staat eerst. Elk van die onderdelen kun je uitzetten.

Hij onthoudt wat je er vanuit opent: een bladwijzer die je vaak opent, en die recent is, stijgt in de resultaten. Het tabblad Statistieken in de instellingen laat zien hoe vaak elke pagina is geopend en hoe zwaar ze weegt, en zet één of alle pagina's terug op nul.

| Toets | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | bewegen |
| <kbd>Enter</kbd> | hier openen |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | openen in een nieuw tabblad |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | volgende / vorige zoekmachine |
| <kbd>Esc</kbd> | sluiten |

Drie opdrachten, getypt in de switcher. Ze werken ook vanaf de knop in de werkbalk, op de site van het actieve tabblad, en hun woorden kun je zelf wijzigen onder Instellingen › Switcher:

| Opdracht | |
|---|---|
| `td` | donkere modus aan of uit voor de huidige site |
| `ta` | de stijlpagina aan of uit voor de huidige site |
| `settings` | de instellingen (`options` werkt ook) |

### Een nieuw tabblad

![De zes indelingen van het nieuwe tabblad: klassiek, alleen de tijd, één regel, gestapeld, hoek en analoog.](docs/screens/layouts.png)

De datum en de tijd, zorgvuldig gezet, en daaronder de switcher. Zes indelingen: klassiek, alleen de tijd, één regel, gestapeld (uren boven minuten), hoek en een minimale analoge klok. Vier typografische stijlen: Redactioneel (Instrument Serif en Inter), Zwitsers (Inter), Machine (IBM Plex Mono) en Boek (EB Garamond), of lettertypen van jezelf die op de computer zijn geïnstalleerd. Een optionele begroeting met je naam. Geef een lijst met talen op, en elk nieuw tabblad zegt de datum willekeurig in een van die talen. In Firefox en LibreWolf is het nieuwe tabblad ook de startpagina: de browser opent erop, en elk nieuw venster ook.

Browsers houden de focus op een nieuw tabblad in de adresbalk, en een extensie kan die daar niet overnemen. Zodat je meteen in de switcher kunt typen, wordt het tabblad vervangen door een nieuw op dezelfde plek, dat begint met de focus op de pagina; de adresbalk toont dan het adres van de pagina in plaats van leeg te blijven. In een Firefox-containertabblad blijft het zoals het is. Zet *De focus uit de adresbalk halen* uit om de manier van de browser te houden.

### Mediasnelheid

Elke video en audio speelt af op de snelheid die je instelt, of op de regel van een site. <kbd>]</kbd> sneller, <kbd>[</kbd> langzamer, <kbd>\\</kbd> terug naar 1×. Alles tussen 0,91× en 1,09× is gewoon 1×. Als je de snelheid wijzigt met de eigen knoppen van een site, laat sobrio die op die pagina met rust. Optioneel worden video en audio die al geluid maken voordat je de pagina aanraakt, gepauzeerd; gedempte blijven gewoon spelen.

### Eigen sneltoetsen

Neem in de instellingen een toetscombinatie op en kies wat die doet: de switcher openen, zoeken in een zoekmachine (of de geselecteerde tekst zoeken), de donkere modus of de stijlpagina op de site aan- of uitzetten, donkere modus overal, een adres hier of in een nieuw tabblad openen, de mediasnelheid instellen, de link van de pagina kopiëren zonder trackingparameters (`utm_*`, `fbclid`, `gclid` en consorten), of de instellingen openen. Ze hebben <kbd>Ctrl</kbd>, <kbd>Alt</kbd> of <kbd>Meta</kbd> nodig, of een functietoets. Ze werken ook als de focus in een ingesloten frame zit (Google Docs, een videospeler), en ze werken altijd op de site in de adresbalk.

## Instellingen

![De instellingen, op het tabblad Stijl: een lijst met schakelaars naast de tabbladen Stijl, Donkere modus, Uitzonderingen, Switcher, Sneltoetsen, Nieuw tabblad, Media en Statistieken.](docs/screens/settings.png)

`settings` in de switcher, of de voorkeuren van de extensie in `about:addons` / `chrome://extensions`. Één tabblad per onderdeel: Stijl, Donkere modus, Uitzonderingen, Switcher, Sneltoetsen, Nieuw tabblad, Media en Statistieken. Elke wijziging wordt meteen opgeslagen en geldt direct voor open tabbladen.

Onderaan elk tabblad slaat een back-up alles op (instellingen, uitzonderingen, sneltoetsen en het geheugen van de switcher) in een bestand, en zet het terug in een andere browser. De welkomstgids, die één keer opent bij de installatie, staat er ook.

Lokale adressen (`localhost`, `127.0.0.1`, `192.168.x`, `.local`-namen en de rest van je computer of netwerk) worden standaard met rust gelaten, zodat je eigen werk er zoals het is uitziet; een schakelaar bovenaan het tabblad Uitzonderingen verandert dat.

Uitzonderingen zijn sites zoals `example.com` (alleen die site) of `*.example.com` (de site en zijn subdomeinen), apart voor de stijlpagina en voor de donkere modus. Een derde lijst houdt de eigen animaties en overgangen van een site in stand, terwijl de rest van de stijlpagina geldt; ze begint met `chatgpt.com`, waarvan het beeld wegschuift terwijl het schrijft als de animaties worden afgekapt.

### Thema instellen via `userContent.css`

In Firefox en LibreWolf leest sobrio deze variabelen uit `userContent.css` (met `toolkit.legacyUserProfileCustomizations.stylesheets` aan) en gebruikt ze voor de donkere modus, de switcher, de instellingen en het nieuwe tabblad. Ze winnen van de kleuren in de instellingen. De `@-moz-document`-regel houdt ze op extensiepagina's: geen website ziet ze.

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

De browser leest `userContent.css` bij het opstarten, dus wijzigingen zijn pas zichtbaar na een herstart.

## Installeren

- **Chrome:** `chrome://extensions`, zet *Ontwikkelaarsmodus* aan, kies *Onverpakte extensie laden* en kies deze map.
- **LibreWolf:** zet `xpinstall.signatures.required` op `false` in `about:config`, voer `scripts/pack.sh` uit en open `dist/sobrio-<version>.xpi` vanuit `about:addons` (*Add-on installeren vanuit bestand*). Voor een snelle test werkt `about:debugging` › *Tijdelijke add-on laden* zonder die voorkeur.
- **Firefox:** release-versies installeren alleen ondertekende add-ons. Upload het zipbestand naar [addons.mozilla.org](https://addons.mozilla.org/developers/) als *niet vermeld*, dan wordt het voor jezelf ondertekend.

Firefox vraagt één keer of je het nieuwe tabblad wilt houden dat een extensie heeft ingesteld; hou het. De sneltoets wijzig je in `about:addons` › *Extensiesneltoetsen beheren* of in `chrome://extensions/shortcuts`.

Op pagina's waar extensies niet kunnen draaien (`about:`- en `chrome://`-pagina's, de add-onwinkels, PDF's) opent de sneltoets de switcher vanaf de knop in de werkbalk. De knop in de werkbalk opent hem altijd. In Firefox worden een paar pagina's pas te laat herkend (een PDF zonder `.pdf` in het adres, foutpagina's): daar doet de sneltoets niets, maar werkt de knop in de werkbalk nog wel.

**Tip:** zet je browser of systeem op een donkere weergave. Sites met een eigen donker thema (GitHub, YouTube en nog veel meer) schakelen dan daarnaar over, en sobrio laat ze met rust.

## Ontwikkeling

Geen buildstap en geen npm-afhankelijkheden.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

Om uit te brengen, verhoog je de versie in `manifest.json`, commit je en push je een tag `v<versie>`. De release-workflow test en verpakt alles en publiceert een GitHub-release met het zip- en het xpi-bestand, en stuurt het xpi naar addons.mozilla.org als de repositoryvariabele `AMO_PUBLISH` op `true` staat (met de geheimen `AMO_JWT_ISSUER` en `AMO_JWT_SECRET`).

Het merk (het isotype, de twee kleuren, het lettertype en de iconen) staat in [docs/brand](docs/brand/README.md).

## Licentie

MIT. Bevat Dark Reader (MIT) en vier lettertypen onder de SIL Open Font License: zie [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
