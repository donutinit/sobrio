<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. O extensie cu opinii despre cum ar trebui să arate web-ul și cum ar trebui să se simtă un browser.">
  </picture>
</p>

<p align="center">
  <a href="#ce-face">Ce face</a> ·
  <a href="#setări">Setări</a> ·
  <a href="#instalare">Instalare</a> ·
  <a href="#dezvoltare">Dezvoltare</a>
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
  <a href="README.hu.md">Magyar</a> ·
  <b>Română</b> ·
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

sobrio ia o parte mică din [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) și [Global Speed](https://github.com/polywock/globalSpeed), și nimic altceva. O extensie pentru Firefox, LibreWolf și Chrome, două culori, fără colțuri rotunjite, iar nimic nu părăsește browserul tău.

![Switcher-ul deschis peste Wikipedia, pe care sobrio a făcut-o neagră: scriind „ru” apar marcajele Rust, cu literele potrivite în bold.](docs/screens/switcher.png)

## Ce face

### Un singur stil, peste tot

Fără colțuri rotunjite, umbre, umbre ale textului sau estompare. Animațiile și tranzițiile sunt tăiate complet, cu excepția playerului de pe YouTube. Fără bare de derulare, fără derulare lină, fundaluri care se derulează odată cu pagina. Linkurile sunt subliniate, orice text poate fi selectat, iar CSS-ul nu forțează majuscule.

Fiecare lucru este un comutator în setări (bare de derulare subțiri în loc de niciuna, de asemenea), iar alte două pornesc dezactivate: imaginile și video-urile în tonuri de gri, și un contur vizibil pentru elementul activ. Mai jos este o casetă pentru CSS-ul tău (până la 50.000 de caractere), într-o foaie separată după cea a sobrio, pe fiecare site, astfel încât un `@import` la început funcționează.

### Negru, cu judecată

![Articolul Wikipedia despre tipografie: jumătatea din stânga așa cum o desenează site-ul, alb, și jumătatea din dreapta cu sobrio, negru.](docs/screens/wikipedia.png)

Motorul dinamic al Dark Reader face fiecare site negru (`#000`), culoare cu culoare. Site-urile care au deja o temă întunecată proprie o păstrează. Luminozitatea, contrastul, sepia, tonurile de gri și culorile sunt în setări; nu există programări.

### Un switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> deschide o casetă în mijlocul paginii, ca quick switcher-ul din Obsidian. Scrie ca să cauți în marcajele tale; cât de permisiv este potrivirea este o setare (strictă, normală sau relaxată). Dacă nimic nu se potrivește, <kbd>Enter</kbd> caută pe web. <kbd>Tab</kbd> trece prin Google, DuckDuckGo, YouTube, Wikipedia, GitHub și motoarele tale (orice adresă cu `%s`, ca o instanță SearXNG); motorul implicit vine primul. Oricare dintre acestea poate fi dezactivată.

Ține minte ce deschizi din el: un marcaj pe care îl deschizi des, și cele deschise recent, urcă în rezultate. Fila Statistici din setări arată de câte ori a fost deschisă fiecare pagină și greutatea ei și resetează una sau toate.

| Tastă | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | mută |
| <kbd>Enter</kbd> | deschide aici |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | deschide într-o filă nouă |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | motorul următor / anterior |
| <kbd>Esc</kbd> | închide |

Trei comenzi, scrise în switcher. Funcționează și din butonul din bara de instrumente, pe site-ul filei active, iar cuvintele lor pot fi schimbate în Setări › Switcher:

| Comandă | |
|---|---|
| `td` | modul întunecat pornit sau oprit pentru site-ul curent |
| `ta` | foaia de stiluri pornită sau oprită pentru site-ul curent |
| `settings` | setările (`options` merge și el) |

### O filă nouă

![Cele șase aspecte ale filei noi: clasic, doar ora, pe o linie, stivuit, colț și analogic.](docs/screens/layouts.png)

Data și ora, compuse cu grijă, iar sub ele switcher-ul. Șase aspecte: clasic, doar ora, pe o linie, stivuit (ore deasupra minutelor), colț și un ceas analogic minimal. Patru stiluri tipografice: Editorial (Instrument Serif și Inter), Elvețian (Inter), Mașină (IBM Plex Mono) și Carte (EB Garamond), sau fonturi proprii, instalate pe calculator. Un salut opțional cu numele tău. Dacă îi dai o listă de limbi, fiecare filă nouă spune data într-una dintre ele, aleasă la întâmplare. În Firefox și LibreWolf, fila nouă este și pagina de pornire: browserul pornește pe ea, și la fiecare fereastră nouă.

Browserele păstrează focusul în bara de adrese pe o filă nouă, iar nicio extensie nu îl poate lua de acolo. Ca să poți scrie imediat în switcher, fila este înlocuită cu una nouă în același loc, care pornește cu pagina în focus; bara de adrese arată apoi adresa paginii în loc să rămână goală. Într-o filă de container Firefox rămâne cum este. Oprește *Scoate focusul din bara de adrese* ca să păstrezi felul browserului.

### Viteza media

Fiecare video și audio se redă la viteza pe care o setezi sau la regula proprie a site-ului. <kbd>]</kbd> mai rapid, <kbd>[</kbd> mai lent, <kbd>\\</kbd> înapoi la 1×. Orice între 0,91× și 1,09× este doar 1×. Dacă schimbi viteza cu comenzile proprii ale site-ului, sobrio nu se atinge de ea pe pagina respectivă. Opțional, video și audio care încep să sune înainte să atingi pagina sunt oprite; cele fără sunet se redau.

### Comenzi rapide proprii

Înregistrează o combinație de taste în setări și alege ce face: deschide switcher-ul, caută într-un motor (sau caută textul selectat), comută modul întunecat sau foaia de stiluri pe site, modul întunecat peste tot, deschide o adresă aici sau într-o filă nouă, setează viteza media, copiază linkul paginii fără parametrii de urmărire (`utm_*`, `fbclid`, `gclid` și alții asemenea) sau deschide setările. Trebuie <kbd>Ctrl</kbd>, <kbd>Alt</kbd> sau <kbd>Meta</kbd>, ori o tastă de funcție. Funcționează și cu focusul într-un cadru încorporat (Google Docs, un player video), iar acționează mereu asupra site-ului din bara de adrese.

## Setări

![Setările, pe fila Stil: o listă de comutatoare lângă filele Stil, Mod întunecat, Excepții, Switcher, Comenzi rapide, Filă nouă, Media și Statistici.](docs/screens/settings.png)

`settings` în switcher, sau preferințele extensiei din `about:addons` / `chrome://extensions`. Câte o filă pentru fiecare parte: Stil, Mod întunecat, Excepții, Switcher, Comenzi rapide, Filă nouă, Media și Statistici. Fiecare modificare se salvează singură și se aplică imediat în filele deschise.

Jos, pe fiecare filă, o copie de rezervă salvează totul (setările, excepțiile, comenzile rapide și memoria switcher-ului) într-un fișier și îl restaurează în alt browser. Ghidul de bun venit, care se deschide o singură dată la instalare, este și el acolo.

Adresele locale (`localhost`, `127.0.0.1`, `192.168.x`, numele `.local` și restul mașinii sau rețelei tale) sunt lăsate neatinse implicit, ca lucrurile tale să arate ca rămân; un comutator din capul filei Excepții schimbă asta.

Excepțiile se scriu ca `example.com` (doar acel site) sau `*.example.com` (site-ul și subdomeniile lui), separat pentru foaia de stiluri și pentru modul întunecat. O a treia listă păstrează animațiile și tranzițiile proprii ale unui site, în timp ce restul foii de stiluri sobrio se aplică; începe cu `chatgpt.com`, a cărui vedere se mișcă atunci când scrie dacă animațiile îi sunt tăiate.

### Temă din `userContent.css`

În Firefox și LibreWolf, sobrio citește aceste variabile din `userContent.css` (cu `toolkit.legacyUserProfileCustomizations.stylesheets` pornit) și le folosește pentru modul întunecat, switcher, setări și fila nouă. Au prioritate față de culorile din setări. Regula `@-moz-document` le păstrează doar pe paginile extensiei: niciun site web nu le vede.

```css
@-moz-document url-prefix("moz-extension://") {
  :root {
    --sobrio-background: #07090f;   /* fundalul modului întunecat, al switcher-ului și al filei noi */
    --sobrio-text: #edf1ff;
    --sobrio-text-muted: #7c86a0;
    --sobrio-selection: #171d2b;    /* rândul selectat și textul selectat */
    --sobrio-border: #4a5470;
    --sobrio-accent: #f5a9cf;       /* bara de selecție și literele potrivite */
    --sobrio-corners: square;       /* square sau round: înlocuiește comutatorul pentru colțuri */
    --sobrio-font: "SF Pro Text";   /* opțional: un font instalat pe acest calculator */
  }
}
```

Browserul citește `userContent.css` la pornire, deci schimbările se văd după o repornire.

## Instalare

- **Chrome:** `chrome://extensions`, pornește *Modul dezvoltator*, *Încarcă neempachetat* și alege acest folder.
- **LibreWolf:** setează `xpinstall.signatures.required` pe `false` în `about:config`, rulează `scripts/pack.sh` și deschide `dist/sobrio-<version>.xpi` din `about:addons` (*Instalează extensia din fișier*). Pentru o încercare rapidă, `about:debugging` › *Încarcă extensie temporară* funcționează fără această preferință.
- **Firefox:** versiunile oficiale instalează doar extensii semnate. Încarcă arhiva zip pe [addons.mozilla.org](https://addons.mozilla.org/developers/) ca *nelistată*, ca să o semnezi pentru tine.

Firefox întreabă o dată dacă să păstreze fila nouă setată de o extensie; păstreaz-o. Comanda rapidă se poate schimba în `about:addons` › *Gestionează comenzile rapide ale extensiilor* sau în `chrome://extensions/shortcuts`.

Pe paginile unde extensiile nu pot rula (paginile `about:` și `chrome://`, magazinele de extensii, PDF-urile), comanda rapidă deschide switcher-ul din butonul din bara de instrumente. Butonul din bara de instrumente îl deschide oricând. În Firefox, câteva pagini sunt recunoscute prea târziu (un PDF fără `.pdf` în adresă, pagini de eroare): acolo comanda rapidă nu face nimic, dar butonul din bara de instrumente funcționează.

**Sfat:** setează browserul sau sistemul pe aspect întunecat. Site-urile cu o temă întunecată proprie (GitHub, YouTube și multe altele) trec atunci la ea, iar sobrio le lasă în pace.

## Dezvoltare

Fără pas de compilare și fără dependențe npm.

```sh
node --test                                   # teste unitare
python3 -I tools/marionette.py . <url>...     # LibreWolf/Firefox fără interfață, cu sobrio încărcat
python3 -I tools/cdp.py . <url>...            # Chromium fără interfață, cu sobrio încărcat
python3 -I tools/vendor-darkreader.py 4.9.133 # actualizează Dark Reader inclus
python3 -I tools/vendor-fonts.py              # actualizează fonturile incluse
python3 -I tools/make-icons.py                # redesenează iconițele din grila isotipului
scripts/pack.sh                               # dist/sobrio-<version>.zip și .xpi
```

Pentru o lansare, crește versiunea din `manifest.json`, fă commit și trimite un tag `v<version>`. Fluxul de lansare testează, împachetează și publică o lansare GitHub cu arhiva zip și xpi-ul, și trimite xpi-ul pe addons.mozilla.org când variabila de depozit `AMO_PUBLISH` este `true` (cu secretele `AMO_JWT_ISSUER` și `AMO_JWT_SECRET`).

Brandul (isotipul, cele două culori, tipografia și iconițele) se află în [docs/brand](docs/brand/README.md).

## Licență

MIT. Include Dark Reader (MIT) și patru fonturi sub SIL Open Font License: vezi [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
