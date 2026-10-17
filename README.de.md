<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Eine Erweiterung mit Haltung darüber, wie das Web aussehen und wie sich ein Browser anfühlen sollte.">
  </picture>
</p>

<p align="center">
  <a href="#was-sobrio-tut">Was sobrio tut</a> ·
  <a href="#einstellungen">Einstellungen</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#entwicklung">Entwicklung</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <b>Deutsch</b> ·
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

sobrio übernimmt einen kleinen Teil von [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) und [Global Speed](https://github.com/polywock/globalSpeed), und sonst nichts. Eine Erweiterung für Firefox, LibreWolf und Chrome, zwei Farben, keine abgerundeten Ecken, und nichts verlässt deinen Browser.

![Der Switcher offen über Wikipedia, das sobrio schwarz gefärbt hat: Wer "ru" tippt, bekommt Rust-Lesezeichen, deren passende Buchstaben fett erscheinen.](docs/screens/switcher.png)

## Was sobrio tut

### Ein Stylesheet, überall

Keine abgerundeten Ecken, Schatten, Textschatten oder Unschärfe. Animationen und Übergänge werden auf nichts gekürzt, außer im Player von YouTube. Keine Scrollleisten, kein weiches Scrollen, Hintergründe, die mit der Seite scrollen. Links unterstrichen, jeder Text auswählbar, keine per CSS erzwungenen Großbuchstaben.

Jeder Teil ist ein Schalter in den Einstellungen (schmale Scrollleisten statt keiner, auch das). Zwei weitere sind standardmäßig aus: Bilder und Videos in Graustufen sowie ein sichtbarer Fokusrahmen. Darunter gibt es ein Feld für dein eigenes CSS (bis zu 50.000 Zeichen), das auf jeder Website in einem eigenen Stylesheet nach dem von sobrio steht, sodass ein `@import` ganz oben funktioniert.

### Schwarz, mit Verstand

![Der Artikel über Typografie auf Wikipedia: die linke Hälfte so, wie die Seite sie zeigt, weiß, und die rechte Hälfte mit sobrio, schwarz.](docs/screens/wikipedia.png)

Die dynamische Engine von Dark Reader macht jede Website schwarz (`#000`), Farbe für Farbe. Websites, die bereits ein eigenes dunkles Design haben, behalten es. Helligkeit, Kontrast, Sepia, Graustufen und die Farben stehen in den Einstellungen; Zeitpläne gibt es keine.

### Ein Switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> öffnet ein Feld in der Mitte der Seite, ähnlich dem Quick Switcher von Obsidian. Tippe, um deine Lesezeichen zu durchsuchen; wie unscharf die Suche ist, ist eine Einstellung (streng, normal oder locker). Passt nichts, sucht <kbd>Enter</kbd> stattdessen im Web. Mit <kbd>Tab</kbd> wechselst du durch Google, DuckDuckGo, YouTube, Wikipedia, GitHub und deine eigenen Suchmaschinen (jede Adresse mit `%s`, etwa eine SearXNG-Instanz); die Standard-Suchmaschine steht zuerst. Jeder dieser Teile lässt sich abschalten.

Der Switcher merkt sich, was du von dort öffnest: Ein Lesezeichen, das du oft und zuletzt geöffnet hast, rückt in den Ergebnissen nach oben. Der Reiter Statistik in den Einstellungen zeigt, wie oft jede Seite geöffnet wurde und wie groß ihr Gewicht ist, und setzt eine oder alle zurück.

| Taste | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | bewegen |
| <kbd>Enter</kbd> | hier öffnen |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | in einem neuen Tab öffnen |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | nächste / vorherige Suchmaschine |
| <kbd>Esc</kbd> | schließen |

Drei Befehle, die du im Switcher tippst. Sie funktionieren auch über den Button in der Symbolleiste, auf der Website des aktiven Tabs, und ihre Wörter kannst du unter Einstellungen › Switcher ändern:

| Befehl | |
|---|---|
| `td` | Dunkelmodus für die aktuelle Website ein- oder ausschalten |
| `ta` | das Stylesheet für die aktuelle Website ein- oder ausschalten |
| `settings` | die Einstellungen (`options` funktioniert auch) |

### Ein neuer Tab

![Die sechs Layouts des neuen Tabs: klassisch, nur die Uhrzeit, eine Zeile, gestapelt, Ecke und analog.](docs/screens/layouts.png)

Das Datum und die Uhrzeit, sorgfältig gesetzt, darunter der Switcher. Sechs Layouts: klassisch, nur die Uhrzeit, eine Zeile, gestapelt (Stunden über Minuten), Ecke und eine minimale Analoguhr. Vier Typografien: Editorial (Instrument Serif und Inter), Swiss (Inter), Machine (IBM Plex Mono) und Book (EB Garamond), oder Schriften deiner Wahl, die auf dem Rechner installiert sind. Ein optionaler Gruß mit deinem Namen. Gib eine Liste von Sprachen an, und jeder neue Tab nennt das Datum in einer davon, zufällig gewählt. In Firefox und LibreWolf ist der neue Tab auch die Startseite: Der Browser startet damit, und jedes neue Fenster auch.

Browser lassen den Fokus in einem neuen Tab in der Adressleiste, und keine Erweiterung kann ihn von dort nehmen. Damit du sofort im Switcher tippen kannst, wird der Tab an derselben Stelle durch einen neuen ersetzt, der mit dem Fokus auf der Seite beginnt; die Adressleiste zeigt dann die Adresse der Seite statt leer zu bleiben. In einem Container-Tab von Firefox bleibt alles, wie es ist. Schalte *Den Fokus aus der Adressleiste nehmen* aus, um das Verhalten des Browsers zu behalten.

### Medien-Geschwindigkeit

Jedes Video und jede Audiodatei läuft mit der Geschwindigkeit, die du einstellst, oder mit der Regel einer Website. <kbd>]</kbd> schneller, <kbd>[</kbd> langsamer, <kbd>\\</kbd> zurück auf 1×. Alles zwischen 0,91× und 1,09× ist einfach 1×. Änderst du die Geschwindigkeit über die eigenen Bedienelemente einer Website, lässt sobrio sie auf dieser Seite in Ruhe. Optional werden Video und Audio pausiert, die schon Ton abspielen, bevor du die Seite berührst; stumme laufen weiter.

### Eigene Tastenkürzel

Nimm in den Einstellungen eine Tastenkombination auf und wähle, was sie tut: den Switcher öffnen, in einer Suchmaschine suchen (oder den markierten Text suchen), den Dunkelmodus oder das Stylesheet auf der Website umschalten, Dunkelmodus überall, eine Adresse hier oder in einem neuen Tab öffnen, die Medien-Geschwindigkeit festlegen, den Link der Seite ohne Tracking-Parameter kopieren (`utm_*`, `fbclid`, `gclid` und Verwandte) oder die Einstellungen öffnen. Sie brauchen <kbd>Ctrl</kbd>, <kbd>Alt</kbd> oder <kbd>Meta</kbd> oder eine Funktionstaste. Sie funktionieren auch, wenn der Fokus in einem eingebetteten Rahmen liegt (Google Docs, ein Videoplayer), und sie wirken immer auf die Website in der Adressleiste.

## Einstellungen

![Die Einstellungen, auf dem Reiter Stil: eine Liste von Schaltern neben den Reitern Stil, Dunkelmodus, Ausnahmen, Switcher, Tastenkürzel, Neuer Tab, Medien und Statistik.](docs/screens/settings.png)

`settings` im Switcher oder die Einstellungen der Erweiterung in `about:addons` / `chrome://extensions`. Ein Reiter pro Bereich: Stil, Dunkelmodus, Ausnahmen, Switcher, Tastenkürzel, Neuer Tab, Medien und Statistik. Jede Änderung wird sofort gespeichert und gilt sofort für offene Tabs.

Eine Sicherung unten auf jedem Reiter speichert alles (Einstellungen, Ausnahmen, Tastenkürzel und das Gedächtnis des Switchers) in eine Datei und stellt es in einem anderen Browser wieder her. Die Willkommensanleitung, die sich bei der Installation einmal öffnet, ist ebenfalls dabei.

Lokale Adressen (`localhost`, `127.0.0.1`, `192.168.x`, `.local`-Namen und der Rest deines Rechners oder Netzwerks) bleiben standardmäßig unberührt, damit deine eigene Arbeit so aussieht, wie sie ist; ein Schalter oben im Reiter Ausnahmen ändert das.

Ausnahmen nehmen Websites als `example.com` (nur diese Website) oder `*.example.com` (die Website und ihre Subdomains) auf, getrennt für das Stylesheet und für den Dunkelmodus. Eine dritte Liste behält die eigenen Animationen und Übergänge einer Website, während der Rest des Stylesheets gilt; sie beginnt mit `chatgpt.com`, dessen Ansicht beim Schreiben verrutscht, wenn seine Animationen gekürzt werden.

### Mit `userContent.css` gestalten

In Firefox und LibreWolf liest sobrio diese Variablen aus `userContent.css` (wenn `toolkit.legacyUserProfileCustomizations.stylesheets` eingeschaltet ist) und verwendet sie für den Dunkelmodus, den Switcher, die Einstellungen und den neuen Tab. Sie setzen sich gegen die Farben in den Einstellungen durch. Die Regel `@-moz-document` hält sie nur auf den Seiten der Erweiterung: Keine Website sieht sie.

```css
@-moz-document url-prefix("moz-extension://") {
  :root {
    --sobrio-background: #07090f;   /* Hintergrund für Dunkelmodus, Switcher und neuen Tab */
    --sobrio-text: #edf1ff;
    --sobrio-text-muted: #7c86a0;
    --sobrio-selection: #171d2b;    /* die ausgewählte Zeile und der markierte Text */
    --sobrio-border: #4a5470;
    --sobrio-accent: #f5a9cf;       /* die Auswahlleiste und die passenden Buchstaben */
    --sobrio-corners: square;       /* square oder round: überschreibt den Schalter für Ecken */
    --sobrio-font: "SF Pro Text";   /* optional: eine auf diesem Rechner installierte Schrift */
  }
}
```

Der Browser liest `userContent.css` beim Start, Änderungen erscheinen also nach einem Neustart.

## Installation

- **Chrome:** `chrome://extensions`, *Entwicklermodus* einschalten, *Entpackte Erweiterung laden* und diesen Ordner wählen.
- **LibreWolf:** setze `xpinstall.signatures.required` in `about:config` auf `false`, führe `scripts/pack.sh` aus und öffne `dist/sobrio-<version>.xpi` in `about:addons` (*Add-on aus Datei installieren*). Für einen schnellen Test funktioniert `about:debugging` › *Temporäres Add-on laden* ohne diese Einstellung.
- **Firefox:** Veröffentlichte Versionen lassen sich nur mit einer Signatur installieren. Lade die ZIP-Datei bei [addons.mozilla.org](https://addons.mozilla.org/developers/) als *nicht gelistet* hoch, damit sie für dich signiert wird.

Firefox fragt einmal, ob der neue Tab, den eine Erweiterung gesetzt hat, behalten werden soll; behalte ihn. Das Tastenkürzel lässt sich in `about:addons` › *Tastenkürzel für Erweiterungen verwalten* oder unter `chrome://extensions/shortcuts` ändern.

Auf Seiten, auf denen Erweiterungen nicht laufen können (`about:`- und `chrome://`-Seiten, die Add-on-Stores, PDFs), öffnet das Tastenkürzel stattdessen den Switcher über den Button in der Symbolleiste. Der Button in der Symbolleiste öffnet ihn immer. In Firefox werden ein paar Seiten erst zu spät erkannt (ein PDF ohne `.pdf` in der Adresse, Fehlerseiten): dort tut das Tastenkürzel nichts, der Button in der Symbolleiste funktioniert trotzdem.

**Tipp:** Stell deinen Browser oder dein System auf ein dunkles Erscheinungsbild. Websites mit eigenem dunklen Design (GitHub, YouTube und viele mehr) wechseln dann dorthin, und sobrio lässt sie in Ruhe.

## Entwicklung

Kein Build-Schritt und keine npm-Abhängigkeiten.

```sh
node --test                                   # Unit-Tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox mit geladenem sobrio
python3 -I tools/cdp.py . <url>...            # headless Chromium mit geladenem sobrio
python3 -I tools/vendor-darkreader.py 4.9.133 # das mitgelieferte Dark Reader aktualisieren
python3 -I tools/vendor-fonts.py              # die mitgelieferten Schriften aktualisieren
python3 -I tools/make-icons.py                # die Icons aus dem Raster der Bildmarke neu zeichnen
scripts/pack.sh                               # dist/sobrio-<version>.zip und .xpi
```

Zum Veröffentlichen erhöhst du die Version in `manifest.json`, committest und pushst einen Tag `v<version>`. Der Release-Workflow testet, packt und veröffentlicht ein GitHub-Release mit ZIP und XPI und schickt das XPI an addons.mozilla.org, wenn die Repository-Variable `AMO_PUBLISH` auf `true` steht (mit den Secrets `AMO_JWT_ISSUER` und `AMO_JWT_SECRET`).

Die Marke (die Bildmarke, die zwei Farben, die Schrift und die Icons) steht in [docs/brand](docs/brand/README.md).

## Lizenz

MIT. Enthält Dark Reader (MIT) und vier Schriften unter der SIL Open Font License: siehe [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
