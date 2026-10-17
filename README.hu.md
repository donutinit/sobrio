<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Véleményes bővítmény arról, hogyan nézzen ki a web, és hogyan érezze magát a böngésző.">
  </picture>
</p>

<p align="center">
  <a href="#mit-tud">Mit tud</a> ·
  <a href="#beállítások">Beállítások</a> ·
  <a href="#telepítés">Telepítés</a> ·
  <a href="#fejlesztés">Fejlesztés</a>
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
  <a href="README.cs.md">Čeština</a> ·
  <b>Magyar</b> ·
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

A sobrio a [Stylus](https://github.com/openstyles/stylus), a [Dark Reader](https://github.com/darkreader/darkreader), a [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), a [Tabliss](https://github.com/joelshepherd/tabliss) és a [Global Speed](https://github.com/polywock/globalSpeed) egy kis részét veszi át, és mást nem. Egy bővítmény Firefoxhoz, LibreWolfhoz és Chrome-hoz, két szín, nincsenek lekerekített sarkok, és semmi nem hagyja el a böngészőt.

![A switcher megnyitva a Wikipedián, amelyet a sobrio feketére váltott: a „ru” beírására a Rust könyvjelzői jelennek meg, az egyezett betűk félkövéren.](docs/screens/switcher.png)

## Mit tud

### Egy stíluslap, mindenhol

Nincsenek lekerekített sarkok, árnyékok, szövegárnyékok vagy elmosás. Az animációk és átmenetek megszűnnek, kivéve a YouTube lejátszójában. Nincsenek görgetősávok, nincs finom görgetés, a háttér követi az oldal görgetését. A hivatkozások aláhúzva, bármilyen szöveg kijelölhető, a CSS nem kényszerít nagybetűket.

Minden egyes rész kapcsoló a beállításokban (a vékony görgetősávok is, a görgetősávok helyett), és további kettő alapból ki van kapcsolva: a képek és videók szürkeárnyalatosan, valamint a látható fókuszkeret. Alattuk van egy doboz a saját CSS-edhez (legfeljebb 50 000 karakter), a sobrio stíluslapja után, külön stíluslapon minden webhelyen, így az `@import` a tetején működik.

### Okosan fekete

![A Wikipedia tipográfiai cikke: a bal fele úgy, ahogy az oldal rajzolja, fehéren, a jobb fele a sobrióval, feketén.](docs/screens/wikipedia.png)

A Dark Reader dinamikus motorja minden webhelyet feketére (`#000`) változtat, színenként. A saját sötét témával rendelkező webhelyek megtartják azt. A fényerő, a kontraszt, a szépia, a szürkeárnyalat és a színek a beállításokban vannak; nincsenek ütemezések.

### Egy switcher

A <kbd>Ctrl</kbd>+<kbd>Space</kbd> az oldal közepén nyit egy dobozt, mint az Obsidian gyorsváltója. Gépelj a könyvjelzőid közötti kereséshez; hogy mennyire pontos a keresés, az a beállítás (szigorú, normál vagy laza). Ha nincs találat, az <kbd>Enter</kbd> a weben keres. A <kbd>Tab</kbd> a Google, a DuckDuckGo, a YouTube, a Wikipedia, a GitHub és a saját motorjaid között lépeget (bármilyen cím, amelyben `%s` szerepel, például egy SearXNG-példány); az alapértelmezett motor jön először. Bármelyik rész kikapcsolható.

Megjegyzi, amit a switcher-ből megnyitsz: a gyakran megnyitott könyvjelző, és a legutóbbi, feljebb kerül a találatok között. A beállítások Statisztika lapja megmutatja, hányszor nyitottak meg az egyes oldalakat, és mekkora a súlyuk, és egyet vagy mindet visszaállíthatod.

| Billentyű | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | mozgás |
| <kbd>Enter</kbd> | megnyitás itt |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | megnyitás új lapon |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | következő / előző motor |
| <kbd>Esc</kbd> | bezárás |

Három parancs, amelyeket a switcher-be írsz. Az eszköztár gombjából is működnek, az aktív lap webhelyén, a szavaikat pedig te változtathatod meg a Beállítások › Switcher menüpontban:

| Parancs | |
|---|---|
| `td` | sötét mód be- vagy kikapcsolása az aktuális webhelyen |
| `ta` | a stíluslap be- vagy kikapcsolása az aktuális webhelyen |
| `settings` | a beállítások (az `options` is működik) |

### Új lap

![Az új lap hat elrendezése: klasszikus, csak az idő, egy sorban, egymás alatt, sarok és analóg.](docs/screens/layouts.png)

A dátum és az idő, gondosan megformázva, alatta a switcher. Hat elrendezés: klasszikus, csak az idő, egy sorban, egymás alatt (az órák a percek fölött), sarok és egy minimális analóg óra. Négy tipográfiai stílus: Szerkesztőségi (Instrument Serif és Inter), Svájci (Inter), Gépies (IBM Plex Mono) és Könyves (EB Garamond), vagy a géped rendszerében telepített saját betűtípusok. Egy opcionális köszöntés a neveddel. Adj meg egy nyelvlistát, és minden új lap a dátumot véletlenszerűen valamelyik nyelven mondja. A Firefoxban és a LibreWolfban az új lap a kezdőlap is: a böngésző ezzel indul, és minden új ablak is ezzel nyílik.

A böngészők új lapon a címsorban tartják a fókuszt, és egy kiterjesztés nem veheti el onnan. Hogy azonnal a switcher-be írhass, a lap helyére ugyanott egy új lap kerül, amely az oldalra fókuszálva indul; így a címsor az oldal címét mutatja, és nem marad üres. Firefox-konténerlapon ez nem történik meg, ott minden marad a régi. Ha a böngésző módját szeretnéd megtartani, kapcsold ki a *Vedd el a fókuszt a címsortól* beállítást.

### Médiasebesség

Minden videó és hang a beállított sebességgel szól, vagy a webhely saját szabálya szerint. A <kbd>]</kbd> gyorsabban, a <kbd>[</kbd> lassabban, a <kbd>\\</kbd> vissza 1×-re. A 0,91× és 1,09× közötti sebesség egyszerűen 1×. Ha a webhely saját vezérlőivel változtatod a sebességet, a sobrio azon az oldalon nem nyúl hozzá. Opcionálisan a videók és hangok, amelyek a lapon való bármilyen érintés előtt elkezdenek szólni, szünetelnek; a némítottak szólnak tovább.

### Saját billentyűparancsok

Rögzíts egy billentyűkombinációt a beállításokban, és válaszd ki, mit tegyen: megnyitja a switcher-t, keres egy motorban (vagy a kijelölt szöveget keresi), be- vagy kikapcsolja a sötét módot vagy a stíluslapot a webhelyen, sötét módot mindenhol, megnyit egy címet itt vagy új lapon, beállítja a média sebességét, vagy a hivatkozást nyomkövetési paraméterek nélkül másolja (`utm_*`, `fbclid`, `gclid` és társaik), vagy megnyitja a beállításokat. <kbd>Ctrl</kbd>, <kbd>Alt</kbd> vagy <kbd>Meta</kbd> billentyű kell hozzájuk, vagy egy funkcióbillentyű. Beágyazott keretben (Google Docs, videólejátszó) is működnek, és mindig a címsorban lévő webhelyen hajtódnak végre.

## Beállítások

![A beállítások a Stílus lapon: kapcsolók listája, mellette a lapok: Stílus, Sötét mód, Kivételek, Switcher, Billentyűparancsok, Új lap, Média és Statisztika.](docs/screens/settings.png)

Írd be a `settings` parancsot a switcher-be, vagy nyisd meg a bővítmény beállításait a `about:addons` / `chrome://extensions` oldalon. Minden résznek külön lapja van: Stílus, Sötét mód, Kivételek, Switcher, Billentyűparancsok, Új lap, Média és Statisztika. Minden módosítás magától mentődik, és azonnal alkalmazódik a megnyitott lapokon.

Minden lap alján van egy biztonsági mentés, amely mindent (a beállításokat, a kivételeket, a billentyűparancsokat és a switcher memóriáját) egy fájlba menti, és egy másik böngészőben visszaállítja. Az üdvözlő útmutató, amely telepítéskor egyszer megnyílik, szintén itt van.

A helyi címek (`localhost`, `127.0.0.1`, `192.168.x`, `.local` nevek és a géped vagy a hálózatod többi címe) alapból érintetlenek maradnak, így a saját munkád úgy látszik, ahogy van; a Kivételek lap tetején lévő kapcsoló ezt változtatja meg.

A kivételek webhelyeket fogadnak el `example.com` (csak az a webhely) vagy `*.example.com` (a webhely és az aldomainjei) formában, külön a stíluslapra és külön a sötét módra. Egy harmadik lista megtartja egy webhely saját animációit és átmeneteit, miközben a többi stíluslap érvényes; ez a `chatgpt.com`-mal indul, amelynek a nézete elcsúszik az írás közben, ha az animációi le vannak vágva.

### Témázd a `userContent.css`-ből

A Firefoxban és a LibreWolfban a sobrio ezeket a változókat olvassa a `userContent.css` fájlból (ha a `toolkit.legacyUserProfileCustomizations.stylesheets` be van kapcsolva), és használja őket a sötét módhoz, a switcher-hez, a beállításokhoz és az új laphoz. Felülírják a beállításokban lévő színeket. Az `@-moz-document` szabály csak a bővítmények oldalain tartja meg őket: egy webhely sem látja őket.

```css
@-moz-document url-prefix("moz-extension://") {
  :root {
    --sobrio-background: #07090f;   /* sötét mód, a switcher és az új lap háttere */
    --sobrio-text: #edf1ff;
    --sobrio-text-muted: #7c86a0;
    --sobrio-selection: #171d2b;    /* a kijelölt sor és a kijelölt szöveg */
    --sobrio-border: #4a5470;
    --sobrio-accent: #f5a9cf;       /* a kijelölés sávja és az egyezett betűk */
    --sobrio-corners: square;       /* square vagy round: felülírja a sarkok kapcsolóját */
    --sobrio-font: "SF Pro Text";   /* opcionális: ezen a gépen telepített betűtípus */
  }
}
```

A böngésző indításkor olvassa a `userContent.css` fájlt, így a változtatások újraindítás után látszanak.

## Telepítés

- **Chrome:** `chrome://extensions`, kapcsold be a *Fejlesztői mód*ot, válaszd a *Kicsomagolt bővítmény betöltése* lehetőséget, és ezt a mappát.
- **LibreWolf:** állítsd a `xpinstall.signatures.required` értékét `false`-ra az `about:config` oldalon, futtasd a `scripts/pack.sh` parancsot, és nyisd meg a `dist/sobrio-<version>.xpi` fájlt az `about:addons` oldalon (*Bővítmény telepítése fájlból*). Gyors kipróbáláshoz az `about:debugging` › *Ideiglenes bővítmény betöltése* a beállítás nélkül is működik.
- **Firefox:** a kiadási verziók csak aláírt bővítményeket telepítenek. Töltsd fel a zip fájlt az [addons.mozilla.org](https://addons.mozilla.org/developers/) oldalra *nem listázott* bővítményként, hogy magadnak aláírják.

A Firefox egyszer megkérdezi, megtartod-e a bővítmény által beállított új lapot: tartsd meg. A billentyűparancs az `about:addons` › *Bővítmény-billentyűparancsok kezelése* menüpontban vagy a `chrome://extensions/shortcuts` oldalon módosítható.

Azokon az oldalakon, ahol a bővítmények nem futnak (`about:` és `chrome://` oldalak, a bővítményboltok, a PDF-ek), a billentyűparancs az eszköztár gombjából nyitja meg a switcher-t. Az eszköztár gombja mindig megnyitja. A Firefoxban néhány oldalt csak későn ismer fel (egy PDF, amelynek a címe nem tartalmaz `.pdf`-et, hibaoldalak): ott a billentyűparancs nem tesz semmit, az eszköztár gombja viszont működik.

**Tipp:** állítsd a böngészőt vagy a rendszert sötét megjelenésre. A saját sötét témával rendelkező webhelyek (GitHub, YouTube és sok más) átváltanak rá, a sobrio pedig nem nyúl hozzájuk.

## Fejlesztés

Nincs build lépés és nincs npm-függőség.

```sh
node --test                                   # egységtesztek
python3 -I tools/marionette.py . <url>...     # fejléc nélküli LibreWolf/Firefox a sobrióval
python3 -I tools/cdp.py . <url>...            # fejléc nélküli Chromium a sobrióval
python3 -I tools/vendor-darkreader.py 4.9.133 # a csomagolt Dark Reader frissítése
python3 -I tools/vendor-fonts.py              # a csomagolt betűtípusok frissítése
python3 -I tools/make-icons.py                # az ikonok újrarajzolása az izotípus rácsából
scripts/pack.sh                               # dist/sobrio-<version>.zip és .xpi
```

Kiadáshoz növeld a verziót a `manifest.json` fájlban, commitolj, és tolj egy `v<version>` címkét. A kiadási munkafolyamat tesztel, becsomagol és közzétesz egy GitHub-kiadást a zip és az xpi fájllal, és feltölti az xpi fájlt az addons.mozilla.org oldalra, ha az `AMO_PUBLISH` tárolóváltozó értéke `true` (az `AMO_JWT_ISSUER` és `AMO_JWT_SECRET` titkokkal).

A márka (az izotípus, a két szín, a betűk és az ikonok) a [docs/brand](docs/brand/README.md) mappában van.

## Licenc

MIT. Csomagolja a Dark Readert (MIT) és négy betűtípust a SIL Open Font License alatt: lásd a [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) fájlt.
