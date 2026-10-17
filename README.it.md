<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Un'estensione con opinioni su come deve apparire il web e come deve sentirsi un browser.">
  </picture>
</p>

<p align="center">
  <a href="#cosa-fa">Cosa fa</a> ·
  <a href="#impostazioni">Impostazioni</a> ·
  <a href="#installazione">Installazione</a> ·
  <a href="#sviluppo">Sviluppo</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.fr.md">Français</a> ·
  <b>Italiano</b> ·
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

sobrio prende una piccola parte di [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) e [Global Speed](https://github.com/polywock/globalSpeed), e nient'altro. Un'unica estensione per Firefox, LibreWolf e Chrome, due colori, niente angoli arrotondati, e nulla lascia il tuo browser.

![Lo switcher aperto su Wikipedia, che sobrio ha reso nera: scrivendo "ru" compaiono i segnalibri di Rust con le lettere trovate in grassetto.](docs/screens/switcher.png)

## Cosa fa

### Un solo foglio di stile, ovunque

Niente angoli arrotondati, ombre, ombre del testo o sfocature. Animazioni e transizioni eliminate, tranne nel player di YouTube. Niente barre di scorrimento, niente scorrimento fluido, sfondi che scorrono con la pagina. Link sottolineati, qualsiasi testo selezionabile, nessuna maiuscola forzata dal CSS.

Ogni elemento è un interruttore nelle impostazioni (anche le barre di scorrimento sottili al posto di nessuna barra), e altri due partono spenti: immagini e video in scala di grigi, e un contorno visibile sull'elemento a fuoco. Più sotto c'è un riquadro per il tuo CSS (fino a 50.000 caratteri), in un foglio a sé dopo quello di sobrio su ogni sito, così un `@import` in cima funziona.

### Nero, con criterio

![L'articolo di Wikipedia sulla tipografia: la metà sinistra come lo mostra il sito, bianca, e la metà destra con sobrio, nera.](docs/screens/wikipedia.png)

Il motore dinamico di Dark Reader rende nero ogni sito (`#000`), colore per colore. I siti che hanno già un tema scuro proprio lo mantengono. Luminosità, contrasto, seppia, scala di grigi e colori sono nelle impostazioni; non ci sono pianificazioni.

### Uno switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> apre un riquadro al centro della pagina, come lo switcher rapido di Obsidian. Scrivi per cercare nei tuoi segnalibri; quanto la ricerca sia flessibile è un'impostazione (stretta, normale o flessibile). Se nulla corrisponde, <kbd>Enter</kbd> cerca invece sul web. <kbd>Tab</kbd> scorre tra Google, DuckDuckGo, YouTube, Wikipedia, GitHub e i tuoi motori (qualsiasi indirizzo con `%s`, come un'istanza di SearXNG); il motore predefinito viene per primo. Ciascuno di questi elementi si può disattivare.

Ricorda ciò che apri da lì: un segnalibro che apri spesso, e di recente, sale nei risultati. La scheda Statistiche nelle impostazioni mostra quante volte è stata aperta ogni pagina e il suo peso, e ne azzera una o tutte.

| Tasto | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | muovi |
| <kbd>Enter</kbd> | apri qui |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | apri in una nuova scheda |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | motore successivo / precedente |
| <kbd>Esc</kbd> | chiudi |

Tre comandi, scritti nello switcher. Funzionano anche dal pulsante nella barra degli strumenti, sul sito della scheda attiva, e le loro parole si possono cambiare in Impostazioni › Switcher:

| Comando | |
|---|---|
| `td` | modalità scura attiva o disattivata per il sito corrente |
| `ta` | foglio di stile attivo o disattivato per il sito corrente |
| `settings` | le impostazioni (funziona anche `options`) |

### Una nuova scheda

![I sei layout della nuova scheda: classico, solo l'ora, su una riga, impilato, angolo e analogico.](docs/screens/layouts.png)

La data e l'ora, composte con cura, e lo switcher sotto. Sei layout: classico, solo l'ora, su una riga, impilato (ore sopra minuti), angolo e un orologio analogico essenziale. Quattro stili tipografici: Editoriale (Instrument Serif e Inter), Svizzera (Inter), Macchina (IBM Plex Mono) e Libro (EB Garamond), oppure i font tuoi, installati sulla macchina. Un saluto facoltativo con il tuo nome. Dai un elenco di lingue e ogni nuova scheda mostra la data in una di esse, a caso. In Firefox e LibreWolf la nuova scheda è anche la pagina iniziale: il browser si apre su di essa, e così ogni nuova finestra.

I browser mantengono il fuoco nella barra degli indirizzi su una nuova scheda, e nessuna estensione può toglierglielo da lì. Perché tu possa scrivere subito nello switcher, la scheda viene sostituita da una nuova nello stesso punto, che parte con la pagina a fuoco; la barra degli indirizzi mostra poi l'indirizzo della pagina invece di restare vuota. In una scheda contenitore di Firefox resta com'è. Disattiva *Togli il fuoco dalla barra degli indirizzi* per mantenere il comportamento del browser.

### Velocità dei media

Ogni video e audio viene riprodotto alla velocità che imposti, o secondo la regola di un sito. <kbd>]</kbd> più veloce, <kbd>[</kbd> più lento, <kbd>\\</kbd> torna a 1×. Qualsiasi valore tra 0,91× e 1,09× è semplicemente 1×. Se cambi la velocità con i comandi di un sito, sobrio lascia stare su quella pagina. Facoltativamente, video e audio che iniziano a suonare prima che tu tocchi la pagina vengono messi in pausa; quelli muti continuano a riprodursi.

### Scorciatoie tutte tue

Registra una combinazione di tasti nelle impostazioni e scegli cosa fa: apri lo switcher, cerca in un motore (o cerca il testo selezionato), attiva o disattiva la modalità scura o il foglio di stile sul sito, modalità scura ovunque, apri un indirizzo qui o in una nuova scheda, imposta la velocità dei media, copia il link della pagina senza i parametri di tracciamento (`utm_*`, `fbclid`, `gclid` e simili) oppure apri le impostazioni. Devono includere <kbd>Ctrl</kbd>, <kbd>Alt</kbd> o <kbd>Meta</kbd>, oppure un tasto funzione. Funzionano anche con il fuoco dentro un frame incorporato (Google Docs, un player video) e agiscono sempre sul sito nella barra degli indirizzi.

## Impostazioni

![Le impostazioni, nella scheda Stile: un elenco di interruttori accanto alle schede Stile, Modalità scura, Eccezioni, Switcher, Scorciatoie, Nuova scheda, Media e Statistiche.](docs/screens/settings.png)

`settings` nello switcher, oppure le preferenze dell'estensione in `about:addons` / `chrome://extensions`. Una scheda per parte: Stile, Modalità scura, Eccezioni, Switcher, Scorciatoie, Nuova scheda, Media e Statistiche. Ogni modifica si salva da sola e si applica subito alle schede aperte.

Un backup in fondo a ogni scheda salva tutto (impostazioni, eccezioni, scorciatoie e la memoria dello switcher) in un file, e lo ripristina in un altro browser. Anche la guida di benvenuto, che si apre una volta all'installazione, è lì.

Gli indirizzi locali (`localhost`, `127.0.0.1`, `192.168.x`, i nomi `.local` e il resto della tua macchina o rete) vengono lasciati in pace per impostazione predefinita, così il tuo lavoro appare com'è; un interruttore in cima alla scheda Eccezioni cambia questo comportamento.

Le eccezioni accettano siti come `example.com` (solo quel sito) o `*.example.com` (il sito e i suoi sottodomini), separatamente per il foglio di stile e per la modalità scura. Un terzo elenco mantiene le animazioni e le transizioni proprie di un sito mentre il resto del foglio di stile si applica; inizia con `chatgpt.com`, la cui vista si sposta mentre scrive se le sue animazioni vengono tagliate.

### Personalizzala da `userContent.css`

In Firefox e LibreWolf, sobrio legge queste variabili da `userContent.css` (con `toolkit.legacyUserProfileCustomizations.stylesheets` attivo) e le usa per la modalità scura, lo switcher, le impostazioni e la nuova scheda. Hanno la precedenza sui colori delle impostazioni. La regola `@-moz-document` le riserva alle pagine delle estensioni: nessun sito web le vede.

```css
@-moz-document url-prefix("moz-extension://") {
  :root {
    --sobrio-background: #07090f;   /* modalità scura, sfondo dello switcher e della nuova scheda */
    --sobrio-text: #edf1ff;
    --sobrio-text-muted: #7c86a0;
    --sobrio-selection: #171d2b;    /* la riga selezionata, e il testo selezionato */
    --sobrio-border: #4a5470;
    --sobrio-accent: #f5a9cf;       /* la barra di selezione e le lettere trovate */
    --sobrio-corners: square;       /* square o round: sovrascrive l'interruttore degli angoli */
    --sobrio-font: "SF Pro Text";   /* facoltativo: un font installato su questa macchina */
  }
}
```

Il browser legge `userContent.css` all'avvio, quindi le modifiche si vedono dopo un riavvio.

## Installazione

- **Chrome:** `chrome://extensions`, attiva *Modalità sviluppatore*, *Carica estensione non pacchettizzata* e scegli questa cartella.
- **LibreWolf:** imposta `xpinstall.signatures.required` su `false` in `about:config`, esegui `scripts/pack.sh` e apri `dist/sobrio-<version>.xpi` da `about:addons` (*Installa componente aggiuntivo da file*). Per una prova veloce, `about:debugging` › *Carica componente aggiuntivo temporaneo* funziona senza la preferenza.
- **Firefox:** le versioni di rilascio installano solo componenti firmati. Carica lo zip su [addons.mozilla.org](https://addons.mozilla.org/developers/) come *non elencato* per farlo firmare per te.

Firefox chiede una volta se conservare la nuova scheda impostata da un'estensione: conservala. La scorciatoia si cambia in `about:addons` › *Gestisci scorciatoie delle estensioni* oppure in `chrome://extensions/shortcuts`.

Nelle pagine dove le estensioni non possono funzionare (pagine `about:` e `chrome://`, gli store dei componenti aggiuntivi, i PDF), la scorciatoia apre lo switcher dal pulsante nella barra degli strumenti. Il pulsante nella barra degli strumenti lo apre sempre. In Firefox alcune pagine vengono riconosciute troppo tardi (un PDF senza `.pdf` nell'indirizzo, le pagine di errore): lì la scorciatoia non fa nulla e il pulsante nella barra degli strumenti continua a funzionare.

**Consiglio:** imposta il browser o il sistema su un aspetto scuro. I siti con un tema scuro proprio (GitHub, YouTube e molti altri) passano a quello, e sobrio li lascia in pace.

## Sviluppo

Nessun passaggio di compilazione e nessuna dipendenza npm.

```sh
node --test                                   # test unitari
python3 -I tools/marionette.py . <url>...     # LibreWolf/Firefox senza interfaccia con sobrio caricato
python3 -I tools/cdp.py . <url>...            # Chromium senza interfaccia con sobrio caricato
python3 -I tools/vendor-darkreader.py 4.9.133 # aggiorna Dark Reader incluso
python3 -I tools/vendor-fonts.py              # aggiorna i font inclusi
python3 -I tools/make-icons.py                # ridisegna le icone dalla griglia dell'isotipo
scripts/pack.sh                               # dist/sobrio-<version>.zip e .xpi
```

Per rilasciare, aggiorna la versione in `manifest.json`, fai il commit e invia un tag `v<version>`. Il flusso di rilascio esegue i test, crea il pacchetto e pubblica una release su GitHub con lo zip e lo xpi, e invia lo xpi ad addons.mozilla.org quando la variabile del repository `AMO_PUBLISH` è `true` (con i segreti `AMO_JWT_ISSUER` e `AMO_JWT_SECRET`).

Il marchio (l'isotipo, i due colori, i caratteri e le icone) è in [docs/brand](docs/brand/README.md).

## Licenza

MIT. Include Dark Reader (MIT) e quattro font sotto la SIL Open Font License: vedi [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
