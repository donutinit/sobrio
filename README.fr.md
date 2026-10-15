<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Une extension qui a un avis sur l'apparence du web et sur la façon dont doit se sentir un navigateur.">
  </picture>
</p>

<p align="center">
  <a href="#ce-que-fait-sobrio">Ce que fait sobrio</a> ·
  <a href="#réglages">Réglages</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#développement">Développement</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <b>Français</b> ·
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

sobrio prend une petite partie de [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) et [Global Speed](https://github.com/polywock/globalSpeed), et rien d'autre. Une seule extension pour Firefox, LibreWolf et Chrome, deux couleurs, pas de coins arrondis, et rien ne quitte votre navigateur.

![Le switcher ouvert sur Wikipedia, que sobrio a rendu noir : en tapant « ru », les marque-pages de Rust s'affichent, avec les lettres trouvées en gras.](docs/screens/switcher.png)

## Ce que fait sobrio

### Une feuille de style, partout

Pas de coins arrondis, d'ombres, d'ombres de texte ni de flou. Animations et transitions supprimées, sauf dans le lecteur de YouTube. Pas de barres de défilement, pas de défilement fluide, arrière-plans qui défilent avec la page. Liens soulignés, tout texte sélectionnable, pas de majuscules imposées par le CSS.

Chaque élément est un interrupteur dans les paramètres (les barres de défilement fines, à la place d'aucune, en font partie), et deux autres sont désactivés par défaut : les images et vidéos en niveaux de gris, et un contour visible sur l'élément qui a le focus. En dessous, une zone pour votre propre CSS (jusqu'à 50 000 caractères), dans une feuille à part, après celle de sobrio, sur chaque site : un `@import` en haut fonctionne donc.

### Du noir, avec intelligence

![L'article de Wikipedia sur la typographie : la moitié gauche telle que le site l'affiche, en blanc, et la moitié droite avec sobrio, en noir.](docs/screens/wikipedia.png)

Le moteur dynamique de Dark Reader rend chaque site noir (`#000`), couleur par couleur. Les sites qui ont déjà leur propre thème sombre le gardent. La luminosité, le contraste, le sépia, les niveaux de gris et les couleurs se règlent dans les paramètres ; il n'y a pas de programmation horaire.

### Un switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> ouvre une boîte au milieu de la page, comme le quick switcher d'Obsidian. Tapez pour chercher dans vos marque-pages ; la finesse de la recherche se règle (stricte, normale ou souple). Si rien ne correspond, <kbd>Enter</kbd> cherche sur le web à la place. <kbd>Tab</kbd> passe en revue Google, DuckDuckGo, YouTube, Wikipedia, GitHub et vos propres moteurs (toute adresse contenant `%s`, comme une instance de SearXNG) ; le moteur par défaut vient en premier. Chacun de ces éléments peut être désactivé.

Il retient ce que vous ouvrez depuis lui : un marque-page que vous ouvrez souvent, et récemment, monte dans les résultats. L'onglet Statistiques des paramètres indique combien de fois chaque page a été ouverte et son poids, et remet à zéro une page ou toutes.

| Touche | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | déplacer |
| <kbd>Enter</kbd> | ouvrir ici |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | ouvrir dans un nouvel onglet |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | moteur suivant / précédent |
| <kbd>Esc</kbd> | fermer |

Trois commandes, tapées dans le switcher. Elles marchent aussi depuis le bouton de la barre d'outils, sur le site de l'onglet actif, et leurs mots se changent dans Paramètres › Switcher :

| Commande | |
|---|---|
| `td` | mode sombre activé ou désactivé pour le site actuel |
| `ta` | la feuille de style activée ou désactivée pour le site actuel |
| `settings` | les paramètres (`options` marche aussi) |

### Un nouvel onglet

![Les six mises en page du nouvel onglet : classique, juste l'heure, sur une ligne, empilée, coin et analogique.](docs/screens/layouts.png)

La date et l'heure, soigneusement composées, et le switcher en dessous. Six mises en page : classique, juste l'heure, sur une ligne, empilée (heures au-dessus des minutes), coin, et une horloge analogique minimale. Quatre styles typographiques : Éditorial (Instrument Serif et Inter), Suisse (Inter), Machine (IBM Plex Mono) et Livre (EB Garamond), ou vos propres polices installées sur la machine. Une salutation facultative avec votre nom. Donnez-lui une liste de langues, et chaque nouvel onglet affiche la date dans l'une d'elles, au hasard.

Les navigateurs gardent le focus dans la barre d'adresse sur un nouvel onglet, et aucune extension ne peut l'en retirer. Pour que vous puissiez écrire dans le switcher tout de suite, l'onglet est remplacé par un nouveau au même endroit, qui démarre avec le focus sur la page ; la barre d'adresse affiche alors l'adresse de la page au lieu de rester vide. Dans un onglet conteneur Firefox, il reste tel quel. Désactivez *Retirer le focus de la barre d'adresse* pour garder la façon de faire du navigateur.

### Vitesse des médias

Chaque vidéo et chaque audio se lit à la vitesse que vous réglez, ou à la règle propre à un site. <kbd>]</kbd> plus vite, <kbd>[</kbd> plus lent, <kbd>\\</kbd> retour à 1×. Toute vitesse entre 0,91× et 1,09× vaut 1×. Si vous changez la vitesse avec les commandes propres à un site, sobrio n'y touche plus sur cette page. Facultativement, les vidéos et l'audio qui se mettent à sonner avant que vous ne touchiez la page sont mis en pause ; les lectures muettes continuent.

### Vos propres raccourcis

Enregistrez une combinaison de touches dans les paramètres et choisissez ce qu'elle fait : ouvrir le switcher, chercher dans un moteur (ou chercher le texte sélectionné), activer ou désactiver le mode sombre ou la feuille de style sur le site, mode sombre partout, ouvrir une adresse ici ou dans un nouvel onglet, régler la vitesse des médias, copier le lien de la page sans ses paramètres de pistage (`utm_*`, `fbclid`, `gclid` et les autres), ou ouvrir les paramètres. Elles doivent comporter <kbd>Ctrl</kbd>, <kbd>Alt</kbd> ou <kbd>Meta</kbd>, ou une touche de fonction. Elles marchent aussi quand le focus est dans un cadre intégré (Google Docs, un lecteur vidéo), et elles agissent toujours sur le site affiché dans la barre d'adresse.

## Réglages

![Les paramètres, onglet Style : une liste d'interrupteurs à côté des onglets Style, Mode sombre, Exceptions, Switcher, Raccourcis, Nouvel onglet, Médias et Statistiques.](docs/screens/settings.png)

`settings` dans le switcher, ou les préférences de l'extension dans `about:addons` / `chrome://extensions`. Un onglet par partie : Style, Mode sombre, Exceptions, Switcher, Raccourcis, Nouvel onglet, Médias et Statistiques. Chaque modification s'enregistre toute seule et s'applique tout de suite aux onglets ouverts.

Une sauvegarde, en bas de chaque onglet, enregistre tout (réglages, exceptions, raccourcis et la mémoire du switcher) dans un fichier, et la restaure dans un autre navigateur. Le guide de bienvenue, qui s'ouvre une fois à l'installation, est là aussi.

Les adresses locales (`localhost`, `127.0.0.1`, `192.168.x`, les noms `.local` et le reste de votre machine ou de votre réseau) sont laissées telles quelles par défaut, pour que votre propre travail s'affiche comme il est ; un interrupteur en haut de l'onglet Exceptions change cela.

Les exceptions désignent des sites sous la forme `example.com` (ce site seulement) ou `*.example.com` (le site et ses sous-domaines), pour la feuille de style et pour le mode sombre, séparément. Une troisième liste conserve les animations et transitions propres à un site pendant que le reste de la feuille de style s'applique ; elle commence avec `chatgpt.com`, dont la vue dérive pendant qu'il écrit si ses animations sont coupées.

### Thématiser depuis `userContent.css`

Dans Firefox et LibreWolf, sobrio lit ces variables dans `userContent.css` (avec `toolkit.legacyUserProfileCustomizations.stylesheets` activé) et les utilise pour le mode sombre, le switcher, les paramètres et le nouvel onglet. Elles l'emportent sur les couleurs des paramètres. La règle `@-moz-document` les réserve aux pages de l'extension : aucun site web ne les voit.

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

Le navigateur lit `userContent.css` au démarrage, donc les changements apparaissent après un redémarrage.

## Installation

- **Chrome :** `chrome://extensions`, activez *Mode développeur*, *Charger l'extension non empaquetée* et choisissez ce dossier.
- **LibreWolf :** réglez `xpinstall.signatures.required` sur `false` dans `about:config`, lancez `scripts/pack.sh` et ouvrez `dist/sobrio-<version>.xpi` depuis `about:addons` (*Installer un module depuis un fichier*). Pour un essai rapide, `about:debugging` › *Charger un module temporaire* fonctionne sans cette préférence.
- **Firefox :** les versions publiées n'installent que des extensions signées. Envoyez le zip sur [addons.mozilla.org](https://addons.mozilla.org/developers/) en tant que *non listée* pour l'obtenir signée pour vous.

Firefox demande une fois s'il faut garder le nouvel onglet défini par l'extension : gardez-le. Le raccourci se change dans `about:addons` › *Gérer les raccourcis des extensions* ou dans `chrome://extensions/shortcuts`.

Sur les pages où les extensions ne peuvent pas s'exécuter (pages `about:` et `chrome://`, boutiques d'extensions, PDF), le raccourci ouvre le switcher depuis le bouton de la barre d'outils. Ce bouton l'ouvre toujours. Dans Firefox, certaines pages ne sont reconnues que trop tard (un PDF sans `.pdf` dans son adresse, les pages d'erreur) : là, le raccourci ne fait rien, mais le bouton de la barre d'outils marche toujours.

**Astuce :** réglez votre navigateur ou votre système en apparence sombre. Les sites qui ont leur propre thème sombre (GitHub, YouTube et bien d'autres) passent alors dessus, et sobrio les laisse tranquilles.

## Développement

Aucune étape de compilation et aucune dépendance npm.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

Pour publier une version, augmentez le numéro dans `manifest.json`, faites un commit et poussez un tag `v<version>`. Le workflow de publication teste, empaquette et publie une version GitHub avec le zip et le xpi, et envoie le zip à addons.mozilla.org quand la variable de dépôt `AMO_PUBLISH` vaut `true` (avec les secrets `AMO_JWT_ISSUER` et `AMO_JWT_SECRET`).

La marque (l'isotype, les deux couleurs, la typographie et les icônes) se trouve dans [docs/brand](docs/brand/README.md).

## Licence

MIT. Intègre Dark Reader (MIT) et quatre polices sous la SIL Open Font License : voir [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
