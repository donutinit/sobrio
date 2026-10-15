<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Ett tillägg med åsikter om hur webben bör se ut och hur en webbläsare bör kännas.">
  </picture>
</p>

<p align="center">
  <a href="#vad-den-gör">Vad den gör</a> ·
  <a href="#inställningar">Inställningar</a> ·
  <a href="#installera">Installera</a> ·
  <a href="#utveckling">Utveckling</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.nl.md">Nederlands</a> ·
  <b>Svenska</b> ·
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

sobrio tar en liten del av [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) och [Global Speed](https://github.com/polywock/globalSpeed), och inget annat. Ett tillägg för Firefox, LibreWolf och Chrome, två färger, inga rundade hörn, och ingenting lämnar din webbläsare.

![Switcher öppen över Wikipedia, som sobrio gjorde svart: när man skriver "ru" visas Rust-bokmärken med de matchade bokstäverna i fetstil.](docs/screens/switcher.png)

## Vad den gör

### En stilmall överallt

Inga rundade hörn, skuggor, textskuggor eller oskärpa. Animationer och övergångar klipps bort helt, utom i YouTubes spelare. Inga rullningslister, ingen mjuk scrollning, bakgrunder som rullar med sidan. Länkar understrykta, all text går att markera och inga versaler tvingas fram av CSS.

Varje del är en brytare i inställningarna (smala rullningslister i stället för inga, också), och två till är avstängda från början: bilder och video i gråskala, och en synlig fokusram. Under dem finns en ruta för din egen CSS (upp till 50 000 tecken), i en egen stilmall efter sobrios på varje webbplats, så att en `@import` överst fungerar.

### Svart, med omdöme

![Wikipedias artikel om typografi: den vänstra halvan som sajten ritar den, vit, och den högra med sobrio, svart.](docs/screens/wikipedia.png)

Dark Readers dynamiska motor gör varje webbplats svart (`#000`), färg för färg. Webbplatser som redan har ett eget mörkt tema behåller det. Ljusstyrka, kontrast, sepia, gråskala och färgerna finns i inställningarna; det finns inga scheman.

### En switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> öppnar en ruta mitt på sidan, som Obsidians snabbväxlare. Skriv för att söka bland dina bokmärken; hur luddig sökningen är avgör en inställning (strikt, normal eller lös). Om inget matchar söker <kbd>Enter</kbd> på webben i stället. <kbd>Tab</kbd> går runt bland Google, DuckDuckGo, YouTube, Wikipedia, GitHub och dina egna sökmotorer (valfri adress med `%s`, som en instans av SearXNG); standardsökmotorn kommer först. Alla dessa delar kan stängas av.

Den minns vad du öppnar härifrån: ett bokmärke du öppnar ofta, och nyligen, stiger i resultaten. Fliken Statistik i inställningarna visar hur många gånger varje sida öppnats och dess vikt, och nollställer en eller alla.

| Tangent | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | flytta |
| <kbd>Enter</kbd> | öppna här |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | öppna i en ny flik |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | nästa / föregående sökmotor |
| <kbd>Esc</kbd> | stäng |

Tre kommandon, skrivna i switcher. De fungerar även från verktygsfältsknappen, på den aktiva fliken, och orden kan du ändra under Inställningar › Switcher:

| Kommando | |
|---|---|
| `td` | mörkt läge på eller av för den aktuella webbplatsen |
| `ta` | stilmallen på eller av för den aktuella webbplatsen |
| `settings` | inställningarna (`options` fungerar också) |

### En ny flik

![De sex layouterna för den nya fliken: klassisk, bara klockslaget, en rad, staplad, hörn och analog.](docs/screens/layouts.png)

Datumet och klockslaget, väl komponerade, och switcher under dem. Sex layouter: klassisk, bara klockslaget, en rad, staplad (timmar över minuter), hörn och en minimal analog klocka. Fyra typografiska stilar: Redaktionell (Instrument Serif och Inter), Schweizisk (Inter), Maskin (IBM Plex Mono) och Bok (EB Garamond), eller typsnitt du själv installerat på datorn. En valfri hälsning med ditt namn. Ge den en lista med språk, så visar varje ny flik datumet på ett av dem, slumpvis.

Webbläsare behåller fokus i adressfältet på en ny flik, och inget tillägg kan flytta det därifrån. För att du ska kunna skriva i switcher direkt ersätts fliken av en ny på samma plats, som börjar med sidan i fokus; adressfältet visar då sidans adress i stället för att stå tomt. I en containerflik i Firefox förblir den som den är. Stäng av *Flytta fokus från adressfältet* för att behålla webbläsarens sätt.

### Mediehastighet

Varje video och ljud spelas i den hastighet du väljer, eller i en webbplats egen regel. <kbd>]</kbd> snabbare, <kbd>[</kbd> långsammare, <kbd>\\</kbd> tillbaka till 1×. Allt mellan 0,91× och 1,09× är bara 1×. Om du ändrar hastigheten med en webbplats egna reglage lämnar sobrio den ifred på just den sidan. Valfritt pausas video och ljud som börjar spela upp ljud innan du rör sidan; tysta spelas vidare.

### Egna genvägar

Spela in en tangentkombination i inställningarna och välj vad den gör: öppna switcher, söka i en sökmotor (eller söka i markerad text), slå på eller av mörkt läge eller stilmallen på webbplatsen, mörkt läge överallt, öppna en adress här eller i en ny flik, ställa in mediehastigheten eller kopiera sidans länk utan spårningsparametrar (`utm_*`, `fbclid`, `gclid` och liknande), eller öppna inställningarna. De behöver <kbd>Ctrl</kbd>, <kbd>Alt</kbd> eller <kbd>Meta</kbd>, eller en funktionstangent. De fungerar även när fokus ligger i en inbäddad ram (Google Docs, en videospelare), och agerar alltid på webbplatsen i adressfältet.

## Inställningar

![Inställningarna, på fliken Stil: en lista med brytare bredvid flikarna Stil, Mörkt läge, Undantag, Switcher, Genvägar, Ny flik, Media och Statistik.](docs/screens/settings.png)

`settings` i switcher, eller tilläggets inställningar i `about:addons` / `chrome://extensions`. En flik per del: Stil, Mörkt läge, Undantag, Switcher, Genvägar, Ny flik, Media och Statistik. Varje ändring sparas automatiskt och tillämpas direkt på öppna flikar.

En säkerhetskopia längst ned på varje flik sparar allt (inställningar, undantag, genvägar och switcherns minne) till en fil, och återställer den i en annan webbläsare. Välkomstguiden, som öppnas en gång vid installation, finns också där.

Lokala adresser (`localhost`, `127.0.0.1`, `192.168.x`, `.local`-namn och resten av din dator eller ditt nätverk) lämnas ifred som standard, så att ditt eget arbete visas som det är; en brytare överst på fliken Undantag ändrar det.

Undantag anges som `example.com` (bara den webbplatsen) eller `*.example.com` (webbplatsen och dess underdomäner), för stilmallen och för mörkt läge var för sig. En tredje lista behåller en webbplats egna animationer och övergångar medan resten av stilmallen gäller; den börjar med `chatgpt.com`, vars vy glider medan den skriver om dess animationer klipps bort.

### Tema från `userContent.css`

I Firefox och LibreWolf läser sobrio dessa variabler från `userContent.css` (med `toolkit.legacyUserProfileCustomizations.stylesheets` på) och använder dem för mörkt läge, switcher, inställningar och den nya fliken. De går före färgerna i inställningarna. Regeln `@-moz-document` håller dem på tilläggets sidor: ingen webbplats ser dem.

```css
@-moz-document url-prefix("moz-extension://") {
  :root {
    --sobrio-background: #07090f;   /* bakgrund för mörkt läge, switcher och ny flik */
    --sobrio-text: #edf1ff;
    --sobrio-text-muted: #7c86a0;
    --sobrio-selection: #171d2b;    /* den markerade raden och markerad text */
    --sobrio-border: #4a5470;
    --sobrio-accent: #f5a9cf;       /* markeringsstapeln och de matchade bokstäverna */
    --sobrio-corners: square;       /* square eller round: går före brytaren för hörn */
    --sobrio-font: "SF Pro Text";   /* valfritt: ett typsnitt installerat på den här datorn */
  }
}
```

Webbläsaren läser `userContent.css` när den startar, så ändringar syns efter en omstart.

## Installera

- **Chrome:** `chrome://extensions`, slå på *Utvecklarläge*, *Läs in paketerat tillägg* och välj den här mappen.
- **LibreWolf:** sätt `xpinstall.signatures.required` till `false` i `about:config`, kör `scripts/pack.sh` och öppna `dist/sobrio-<version>.xpi` från `about:addons` (*Installera tillägg från fil*). För en snabb provkörning fungerar `about:debugging` › *Läs in tillfälligt tillägg* utan inställningen.
- **Firefox:** versioner för användare installerar bara signerade tillägg. Ladda upp zip-filen till [addons.mozilla.org](https://addons.mozilla.org/developers/) som *ej listad* för att få den signerad för dig själv.

Firefox frågar en gång om du vill behålla den nya fliken som ett tillägg ställt in; behåll den. Genvägen kan ändras under `about:addons` › *Hantera tilläggens genvägar* eller `chrome://extensions/shortcuts`.

På sidor där tillägg inte kan köras (`about:`- och `chrome://`-sidor, tilläggsbutikerna, PDF-filer) öppnar genvägen switcher från verktygsfältsknappen i stället. Verktygsfältsknappen öppnar den alltid. I Firefox känns några sidor igen för sent (en PDF utan `.pdf` i adressen, felsidor): där gör genvägen ingenting, men verktygsfältsknappen fungerar.

**Tips:** ställ in webbläsaren eller systemet på ett mörkt utseende. Webbplatser med ett eget mörkt tema (GitHub, YouTube och många fler) byter då till det, och sobrio lämnar dem ifred.

## Utveckling

Inget byggsteg och inga npm-beroenden.

```sh
node --test                                   # enhetstester
python3 -I tools/marionette.py . <url>...     # huvudlös LibreWolf/Firefox med sobrio inlästs
python3 -I tools/cdp.py . <url>...            # huvudlös Chromium med sobrio inläst
python3 -I tools/vendor-darkreader.py 4.9.133 # uppdatera det medföljande Dark Reader
python3 -I tools/vendor-fonts.py              # uppdatera de medföljande typsnitten
python3 -I tools/make-icons.py                # rita om ikonerna från isotypens rutnät
scripts/pack.sh                               # dist/sobrio-<version>.zip och .xpi
```

För att släppa en version, höj versionen i `manifest.json`, committa och skicka en tagg `v<version>`. Release-arbetsflödet testar, paketerar och publicerar en GitHub-release med zip- och xpi-filen, och skickar zip-filen till addons.mozilla.org när repositoryvariabeln `AMO_PUBLISH` är `true` (med hemligheterna `AMO_JWT_ISSUER` och `AMO_JWT_SECRET`).

Varumärket (isotypen, de två färgerna, typsnitten och ikonerna) finns i [docs/brand](docs/brand/README.md).

## Licens

MIT. Medföljer Dark Reader (MIT) och fyra typsnitt under SIL Open Font License: se [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
