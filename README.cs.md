<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Rozšíření s názorem na to, jak má web vypadat a jak má prohlížeč působit.">
  </picture>
</p>

<p align="center">
  <a href="#co-dělá">Co dělá</a> ·
  <a href="#nastavení">Nastavení</a> ·
  <a href="#instalace">Instalace</a> ·
  <a href="#vývoj">Vývoj</a>
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
  <a href="README.pl.md">Polski</a> ·
  <b>Čeština</b> ·
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

sobrio bere malou část z [Stylus](https://github.com/openstyles/stylus), [Dark Readeru](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) a [Global Speed](https://github.com/polywock/globalSpeed), a nic dalšího. Jedno rozšíření pro Firefox, LibreWolf a Chrome, dvě barvy, žádné zaoblené rohy a nic neopouští váš prohlížeč.

![Switcher otevřený nad Wikipedií, kterou sobrio ztmavilo: psaní „ru“ vypíše záložky Rust se shodnými písmeny tučně.](docs/screens/switcher.png)

## Co dělá

### Jeden styl, všude

Žádné zaoblené rohy, stíny, stíny textu ani rozostření. Animace a přechody jsou seříznuté na nulu, kromě přehrávače YouTube. Žádné posuvníky, žádné plynulé posouvání, pozadí se posouvají se stránkou. Odkazy jsou podtržené, jakýkoli text jde označit a CSS nevynucuje velká písmena.

Každá položka je v nastavení přepínačem (i tenké posuvníky místo žádných), a dva další jsou vypnuté od začátku: obrázky a video ve stupních šedi a viditelný rámeček na zaměřeném prvku. Pod nimi je pole pro vlastní CSS (až 50 000 znaků), v samostatném listu za stylem sobrio na každém webu, takže `@import` na jeho začátku funguje.

### Černě, chytře

![Článek Wikipedie o typografii: levá polovina tak, jak ji web kreslí, bílá, a pravá se sobrio, černá.](docs/screens/wikipedia.png)

Dynamický engine Dark Readeru zčerní každý web (`#000`), barvu po barvě. Weby, které už mají vlastní tmavý motiv, si ho ponechají. Jas, kontrast, sépie, stupně šedi a barvy najdete v nastavení; žádné plány nejsou.

### Switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> otevře box uprostřed stránky, podobně jako rychlý přepínač v Obsidianu. Pište pro hledání v záložkách; jak přesné má hledání být, je v nastavení (přísné, normální nebo volné). Když nic neodpovídá, <kbd>Enter</kbd> hledá na webu. <kbd>Tab</kbd> prochází Google, DuckDuckGo, YouTube, Wikipedia, GitHub a vaše vlastní vyhledávače (libovolná adresa s `%s`, třeba instance SearXNG); výchozí vyhledávač je první. Každou z těchto částí lze vypnout.

Pamatuje si, co z něj otevíráte: záložka, kterou otevíráte často a nedávno, stoupá ve výsledcích. Karta Statistiky v nastavení ukazuje, kolikrát byla každá stránka otevřena a jaká je její váha, a dá se vynulovat jedna nebo všechny.

| Klávesa | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | pohyb |
| <kbd>Enter</kbd> | otevřít zde |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | otevřít v nové kartě |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | další / předchozí vyhledávač |
| <kbd>Esc</kbd> | zavřít |

Tři příkazy, napsané do switcheru. Fungují i z tlačítka na panelu nástrojů, na webu aktivní karty, a jejich slova lze změnit v Nastavení › Switcher:

| Příkaz | |
|---|---|
| `td` | tmavý režim na tomto webu zapnout nebo vypnout |
| `ta` | styl na tomto webu zapnout nebo vypnout |
| `settings` | nastavení (funguje i `options`) |

### Nová karta

![Šest rozložení nové karty: klasické, jen čas, jedna řádka, pod sebou, v rohu a analogové.](docs/screens/layouts.png)

Datum a čas, pečlivě sestavené, a switcher pod nimi. Šest rozložení: klasické, jen čas, jedna řádka, pod sebou (hodiny nad minutami), v rohu a minimalistické analogové hodiny. Čtyři typografické styly: Editorial (Instrument Serif a Inter), Swiss (Inter), Machine (IBM Plex Mono) a Book (EB Garamond), nebo vlastní písma nainstalovaná v počítači. Volitelný pozdrav s vaším jménem. Když zadáte seznam jazyků, každá nová karta řekne datum v jednom z nich, náhodně.

Prohlížeče drží zaměření v adresním řádku na nové kartě a žádné rozšíření ho odtud nemůže převzít. Aby bylo možné hned psát do switcheru, karta se nahradí novou na stejném místě, která začíná se zaměřenou stránkou; adresní řádek pak ukáže adresu stránky místo prázdna. V kartě kontejneru Firefoxu zůstává, jak je. Chcete-li zachovat způsob prohlížeče, vypněte *Převzít zaměření z adresního řádku*.

### Rychlost médií

Každé video a zvuk se přehrává rychlostí, kterou nastavíte, nebo podle pravidla daného webu. <kbd>]</kbd> rychleji, <kbd>[</kbd> pomaleji, <kbd>\\</kbd> zpět na 1×. Cokoli od 0,91× do 1,09× je prostě 1×. Pokud rychlost změníte ovládacími prvky webu, sobrio na té stránce nezasahuje. Volitelně se pozastaví video a zvuk, které začnou hrát dřív, než se stránky dotknete; ztlumené se přehrávají dál.

### Vlastní zkratky

V nastavení nahrajte kombinaci kláves a vyberte, co dělá: otevřít switcher, hledat přes vyhledávač (nebo hledat vybraný text), přepnout tmavý režim nebo CSS na webu, tmavý režim všude, otevřít adresu zde nebo v nové kartě, nastavit rychlost médií, zkopírovat odkaz stránky bez sledovacích parametrů (`utm_*`, `fbclid`, `gclid` a podobné) nebo otevřít nastavení. Potřebují <kbd>Ctrl</kbd>, <kbd>Alt</kbd> nebo <kbd>Meta</kbd>, nebo funkční klávesu. Fungují i se zaměřením uvnitř vloženého rámu (Google Docs, přehrávač videa) a vždy se týkají webu v adresním řádku.

## Nastavení

![Nastavení na kartě Styl: seznam přepínačů vedle karet Styl, Tmavý režim, Výjimky, Switcher, Zkratky, Nová karta, Média a Statistiky.](docs/screens/settings.png)

`settings` v switcheru, nebo předvolby rozšíření v `about:addons` / `chrome://extensions`. Jedna karta pro každou část: Styl, Tmavý režim, Výjimky, Switcher, Zkratky, Nová karta, Média a Statistiky. Každá změna se uloží sama a hned se projeví v otevřených kartách.

Záloha na konci každé karty uloží vše (nastavení, výjimky, zkratky a paměť switcheru) do souboru a obnoví ji v jiném prohlížeči. Je tu i uvítací průvodce, který se jednou otevře při instalaci.

Místní adresy (`localhost`, `127.0.0.1`, `192.168.x`, názvy `.local` a zbytek vašeho počítače nebo sítě) jsou ve výchozím stavu nedotčené, takže vaše vlastní práce se zobrazí tak, jak je. Přepínač nahoře na kartě Výjimky to změní.

Výjimky přijímají weby jako `example.com` (jen ten web) nebo `*.example.com` (web a jeho subdomény), a to zvlášť pro styl a pro tmavý režim. Třetí seznam si ponechá vlastní animace a přechody webu, zatímco zbytek stylu platí; začíná s `chatgpt.com`, jehož zobrazení se při psaní posouvá, pokud se jeho animace seříznou.

### Motiv z `userContent.css`

Ve Firefoxu a LibreWolfu čte sobrio tyto proměnné z `userContent.css` (se zapnutým `toolkit.legacyUserProfileCustomizations.stylesheets`) a používá je pro tmavý režim, switcher, nastavení a novou kartu. Mají přednost před barvami v nastavení. Pravidlo `@-moz-document` je drží jen na stránkách rozšíření: žádný web je nevidí.

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

Prohlížeč čte `userContent.css` při startu, takže změny se ukážou po restartu.

## Instalace

- **Chrome:** `chrome://extensions`, zapněte *Režim pro vývojáře*, *Načíst rozbalené* a vyberte tuto složku.
- **LibreWolf:** nastavte v `about:config` hodnotu `xpinstall.signatures.required` na `false`, spusťte `scripts/pack.sh` a otevřete `dist/sobrio-<version>.xpi` v `about:addons` (*Instalovat doplněk ze souboru*). Pro rychlou zkoušku funguje `about:debugging` › *Načíst dočasný doplněk* i bez tohoto nastavení.
- **Firefox:** vydané verze přijímají jen podepsané doplňky. Nahrajte zip na [addons.mozilla.org](https://addons.mozilla.org/developers/) jako *nelistovaný*, abyste si ho nechali podepsat.

Firefox se jednou zeptá, zda si ponechat novou kartu, kterou nastavilo rozšíření; ponechte ji. Zkratku lze změnit v `about:addons` › *Spravovat klávesové zkratky rozšíření* nebo v `chrome://extensions/shortcuts`.

Na stránkách, kde rozšíření nemohou běžet (stránky `about:` a `chrome://`, obchody s doplňky, PDF), zkratka otevře switcher z tlačítka na panelu nástrojů. Tlačítko ho vždy otevře také. Ve Firefoxu je několik stránek rozpoznáno příliš pozdě (PDF bez `.pdf` v adrese, chybové stránky): tam zkratka nic neudělá, tlačítko na panelu nástrojů ale funguje.

**Tip:** nastavte prohlížeč nebo systém na tmavý vzhled. Weby s vlastním tmavým motivem (GitHub, YouTube a mnoho dalších) pak na něj přejdou a sobrio je nechá být.

## Vývoj

Bez kroku sestavení a bez závislostí npm.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

Pro vydání zvyšte verzi v `manifest.json`, potvrďte změny a odešlete tag `v<version>`. Workflow vydání otestuje a zabalí projekt, zveřejní GitHub release se zipem a xpi a pošle zip na addons.mozilla.org, pokud je proměnná repozitáře `AMO_PUBLISH` nastavena na `true` (se secrety `AMO_JWT_ISSUER` a `AMO_JWT_SECRET`).

Značka (izotyp, dvě barvy, písmo a ikony) je v [docs/brand](docs/brand/README.md).

## Licence

MIT. Obsahuje Dark Reader (MIT) a čtyři písma pod SIL Open Font License: viz [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
