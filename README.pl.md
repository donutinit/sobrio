<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Rozszerzenie z własnym zdaniem o tym, jak powinna wyglądać sieć i jak powinna działać przeglądarka.">
  </picture>
</p>

<p align="center">
  <a href="#co-robi">Co robi</a> ·
  <a href="#ustawienia">Ustawienia</a> ·
  <a href="#instalacja">Instalacja</a> ·
  <a href="#rozwój">Rozwój</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.nl.md">Nederlands</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <b>Polski</b> ·
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

sobrio bierze jedną małą część z [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) i [Global Speed](https://github.com/polywock/globalSpeed), i nic poza tym. Jedno rozszerzenie dla przeglądarek Firefox, LibreWolf i Chrome, dwa kolory, bez zaokrąglonych rogów, a nic nie opuszcza przeglądarki.

![Switcher otwarty nad Wikipedią, którą sobrio zaczernił: wpisanie „ru” wypisuje zakładki o Rust, z pasującymi literami pogrubionymi.](docs/screens/switcher.png)

## Co robi

### Jeden arkusz stylów, wszędzie

Bez zaokrąglonych rogów, cieni, cieni tekstu i rozmycia. Animacje i przejścia wycięte do zera, poza odtwarzaczem YouTube. Bez pasków przewijania, bez płynnego przewijania, tła przewijają się razem ze stroną. Odnośniki podkreślone, dowolny tekst można zaznaczyć, CSS nie wymusza wielkich liter.

Każdy element to przełącznik w ustawieniach (cienkie paski przewijania zamiast braku też), a dwa kolejne są wyłączone na starcie: obrazy i wideo w skali szarości oraz widoczny obrys elementu z fokusem. Poniżej jest pole na twój własny CSS (do 50 000 znaków), w osobnym arkuszu, za arkuszem sobrio, na każdej witrynie, więc `@import` na jego początku działa.

### Czarne, z rozsądkiem

![Artykuł Wikipedii o typografii: lewa połowa tak, jak rysuje ją witryna, biała, a prawa z sobrio, czarna.](docs/screens/wikipedia.png)

Dynamiczny silnik Dark Readera zamienia każdą witrynę na czarną (`#000`), kolor po kolorze. Witryny, które mają własny ciemny motyw, go zachowują. Jasność, kontrast, sepię, skalę szarości i kolory znajdziesz w ustawieniach; nie ma harmonogramów.

### Switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> otwiera pole na środku strony, jak szybki przełącznik w Obsidianie. Pisz, aby przeszukiwać zakładki; to, jak dokładnie szuka, ustawiasz w ustawieniach (ścisłe, normalne lub luźne). Jeśli nic nie pasuje, <kbd>Enter</kbd> szuka w sieci. <kbd>Tab</kbd> przechodzi między wyszukiwarkami: Google, DuckDuckGo, YouTube, Wikipedia, GitHub i twoje własne (dowolny adres z `%s`, jak instancja SearXNG); domyślna wyszukiwarka jest pierwsza. Każdy z tych elementów można wyłączyć.

Zapamiętuje, co z niego otwierasz: zakładka, którą otwierasz często i ostatnio, wspina się wyżej w wynikach. Karta Statystyki w ustawieniach pokazuje, ile razy otwarto każdą stronę i jaka jest jej waga, i resetuje jedną albo wszystkie.

| Klawisz | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | przesuń |
| <kbd>Enter</kbd> | otwórz tutaj |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | otwórz w nowej karcie |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | następna / poprzednia wyszukiwarka |
| <kbd>Esc</kbd> | zamknij |

Trzy polecenia, wpisywane w switcherze. Działają też z przycisku na pasku narzędzi, na witrynie aktywnej karty, a ich słowa możesz zmienić w Ustawienia › Switcher:

| Polecenie | |
|---|---|
| `td` | tryb ciemny włączony lub wyłączony dla bieżącej witryny |
| `ta` | arkusz stylów włączony lub wyłączony dla bieżącej witryny |
| `settings` | ustawienia (działa też `options`) |

### Nowa karta

![Sześć układów nowej karty: klasyczny, sama godzina, w jednej linii, piętrowy, w rogu i analogowy.](docs/screens/layouts.png)

Data i godzina, starannie zestawione, a pod nimi switcher. Sześć układów: klasyczny, sama godzina, w jednej linii, piętrowy (godziny nad minutami), w rogu i minimalistyczny zegar analogowy. Cztery style typograficzne: Redakcyjna (Instrument Serif i Inter), Szwajcarska (Inter), Maszyna (IBM Plex Mono) i Książka (EB Garamond), albo czcionki własne, zainstalowane na tym komputerze. Opcjonalne powitanie z twoim imieniem. Podaj listę języków, a każda nowa karta poda datę w jednym z nich, losowo.

Przeglądarki zostawiają fokus na pasku adresu w nowej karcie i żadne rozszerzenie nie może go stamtąd zabrać. Żeby od razu móc pisać w switcherze, karta zostaje zastąpiona nową w tym samym miejscu, która startuje z ustawionym fokusem; pasek adresu pokazuje wtedy adres strony zamiast być pusty. W karcie kontenera Firefox zostaje tak, jak jest. Wyłącz *Odbierz fokus z paska adresu*, by zachować sposób działania przeglądarki.

### Szybkość mediów

Każde wideo i dźwięk odtwarza się z szybkością, którą ustawisz, albo z regułą danej witryny. <kbd>]</kbd> szybciej, <kbd>[</kbd> wolniej, <kbd>\\</kbd> z powrotem do 1×. Wszystko od 0,91× do 1,09× to po prostu 1×. Jeśli zmienisz szybkość przyciskami samej witryny, sobrio na tej stronie jej nie rusza. Opcjonalnie wideo i dźwięk, które zaczynają grać przed tym, zanim dotkniesz strony, są wstrzymywane; wyciszone grają dalej.

### Własne skróty

Nagraj kombinację klawiszy w ustawieniach i wybierz, co robi: otwiera switcher, szuka w wyszukiwarce (albo zaznaczonego tekstu), przełącza tryb ciemny lub CSS na witrynie, włącza tryb ciemny wszędzie, otwiera adres tutaj albo w nowej karcie, ustawia szybkość mediów, kopiuje link strony bez parametrów śledzących (`utm_*`, `fbclid`, `gclid` i podobne) albo otwiera ustawienia. Wymagają <kbd>Ctrl</kbd>, <kbd>Alt</kbd> lub <kbd>Meta</kbd> albo klawisza funkcyjnego. Działają też, gdy fokus jest w osadzonej ramce (Google Docs, odtwarzacz wideo), i zawsze dotyczą witryny w pasku adresu.

## Ustawienia

![Ustawienia na karcie Styl: lista przełączników obok kart Styl, Tryb ciemny, Wyjątki, Switcher, Skróty, Nowa karta, Media i Statystyki.](docs/screens/settings.png)

`settings` w switcherze albo preferencje rozszerzenia w `about:addons` / `chrome://extensions`. Jedna karta na każdą część: Styl, Tryb ciemny, Wyjątki, Switcher, Skróty, Nowa karta, Media i Statystyki. Każda zmiana zapisuje się sama i od razu działa w otwartych kartach.

Kopia zapasowa na dole każdej karty zapisuje wszystko (ustawienia, wyjątki, skróty i pamięć switchera) do pliku i przywraca je w innej przeglądarce. Jest tu też przewodnik powitalny, który otwiera się raz po instalacji.

Adresy lokalne (`localhost`, `127.0.0.1`, `192.168.x`, nazwy `.local` i reszta twojego komputera lub sieci) są domyślnie zostawiane w spokoju, więc twoja własna praca wygląda tak, jak ma wyglądać; przełącznik na górze karty Wyjątki to zmienia.

Wyjątki przyjmują witryny jako `example.com` (tylko ta witryna) albo `*.example.com` (witryna i jej subdomeny), osobno dla arkusza stylów i dla trybu ciemnego. Trzecia lista zachowuje własne animacje i przejścia witryny, podczas gdy reszta CSS sobrio działa; zaczyna się od `chatgpt.com`, którego widok dryfuje podczas pisania, jeśli animacje zostaną wycięte.

### Motyw z `userContent.css`

W Firefox i LibreWolf sobrio odczytuje te zmienne z `userContent.css` (przy włączonym `toolkit.legacyUserProfileCustomizations.stylesheets`) i używa ich do trybu ciemnego, switchera, ustawień i nowej karty. Mają pierwszeństwo przed kolorami z ustawień. Reguła `@-moz-document` zostawia je tylko stronom rozszerzeń: żadna witryna ich nie widzi.

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

Przeglądarka czyta `userContent.css` przy starcie, więc zmiany widać po ponownym uruchomieniu.

## Instalacja

- **Chrome:** `chrome://extensions`, włącz *Tryb dewelopera*, *Załaduj rozpakowane* i wybierz ten folder.
- **LibreWolf:** ustaw `xpinstall.signatures.required` na `false` w `about:config`, uruchom `scripts/pack.sh` i otwórz `dist/sobrio-<version>.xpi` z `about:addons` (*Zainstaluj dodatek z pliku*). Do szybkiego testu działa `about:debugging` › *Załaduj tymczasowy dodatek*, bez tego ustawienia.
- **Firefox:** wydania przyjmują tylko podpisane dodatki. Wyślij zip na [addons.mozilla.org](https://addons.mozilla.org/developers/) jako *niepubliczny* (unlisted), by dostać podpis dla siebie.

Firefox pyta raz, czy zachować nową kartę ustawioną przez rozszerzenie; zachowaj ją. Skrót zmienisz w `about:addons` › *Zarządzaj skrótami rozszerzeń* albo w `chrome://extensions/shortcuts`.

Na stronach, na których rozszerzenia nie mogą działać (strony `about:` i `chrome://`, sklepy z dodatkami, PDF-y), skrót otwiera switcher z przycisku na pasku narzędzi. Przycisk na pasku narzędzi zawsze go też otwiera. W przeglądarce Firefox kilka stron jest rozpoznawanych za późno (PDF bez `.pdf` w adresie, strony błędów): tam skrót nic nie robi, ale przycisk na pasku narzędzi nadal działa.

**Wskazówka:** ustaw przeglądarkę lub system na ciemny wygląd. Witryny z własnym ciemnym motywem (GitHub, YouTube i wiele innych) przełączą się na niego, a sobrio zostawi je w spokoju.

## Rozwój

Brak kroku budowania i zależności npm.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

Żeby wydać nową wersję, podbij numer w `manifest.json`, zatwierdź zmiany i wypchnij tag `v<wersja>`. Workflow wydania testuje, pakuje i publikuje wydanie na GitHubie z plikami zip i xpi, a wysyła zip na addons.mozilla.org, gdy zmienna repozytorium `AMO_PUBLISH` ma wartość `true` (z sekretami `AMO_JWT_ISSUER` i `AMO_JWT_SECRET`).

Marka (izotyp, dwa kolory, typografia i ikony) znajduje się w [docs/brand](docs/brand/README.md).

## Licencja

MIT. Zawiera Dark Readera (MIT) i cztery czcionki na licencji SIL Open Font License: zobacz [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
