# sobrio

An opinionated extension on how the web should look and how a browser should feel.

Based on [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) and [Global Speed](https://github.com/polywock/globalSpeed): one small part of each, nothing else. For Firefox, LibreWolf and Chrome.

## What it does

**One stylesheet, everywhere.** No rounded corners, shadows, text shadows or blur. Animations and transitions cut to nothing, except in YouTube's player. No scrollbars, no smooth scrolling, backgrounds that scroll with the page. Links underlined, any text selectable, no capitals forced by CSS. Each piece is a switch in the settings (thin scrollbars instead of none, too), and two more start off: images and video in grayscale, and a visible focus ring. Below them, a box for your own CSS, added last on every site.

**Black, smartly.** Dark Reader's dynamic engine turns every site black (`#000`), color by color. Sites that already have a dark theme of their own keep it. Brightness, contrast, sepia, grayscale and the colors are in the settings; there are no schedules.

**A switcher.** <kbd>Ctrl</kbd>+<kbd>Space</kbd> opens a box in the middle of the page, like Obsidian's quick switcher. Type to fuzzy search your bookmarks; how fuzzy is a setting (strict, normal or loose). If nothing matches, <kbd>Enter</kbd> searches the web instead. <kbd>Tab</kbd> cycles through Google, DuckDuckGo, YouTube, Wikipedia, GitHub and your own engines (any address with `%s`, like a SearXNG instance); the default engine comes first. Any of those pieces can be turned off.

It remembers what you open from it: a bookmark you open often, and lately, climbs in the results. The Stats tab in the settings shows how many times each page was opened and its weight, and resets one or all.

| Key | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | move |
| <kbd>Enter</kbd> | open here |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | open in a new tab |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | next / previous engine |
| <kbd>Esc</kbd> | close |

Three commands, typed in the switcher:

- `td` toggles dark mode on the current site.
- `ta` toggles the stylesheet on the current site.
- `settings` (or `options`) opens the settings.

**A new tab.** The date and the time, set with care, and the switcher under them. Six layouts: classic, just the time, one line, stacked (hours over minutes), corner and a minimal analog clock. Four typographic styles: Editorial (Instrument Serif and Inter), Swiss (Inter), Machine (IBM Plex Mono) and Book (EB Garamond), or fonts of your own installed on the machine. An optional greeting with your name. Give it a list of languages and every new tab says the date in one of them, at random.

Browsers keep the focus in the address bar on a new tab, and no extension can take it from there. So that you can type into the switcher right away, the tab is replaced by a new one in the same place, which starts with the page focused; the address bar then shows the page's address instead of staying empty. In a Firefox container tab it stays as it is. Turn off *Take the focus from the address bar* to keep the browser's way.

**Media speed.** Every video and audio plays at the speed you set, or at a site's own rule. <kbd>]</kbd> faster, <kbd>[</kbd> slower, <kbd>\\</kbd> back to 1×. Anything from 0.91× to 1.09× is just 1×. If you change the speed with a site's own controls, sobrio leaves it alone on that page. Optionally, video and audio that start playing sound before you touch the page are paused; muted ones play on.

**Shortcuts of your own.** Record a key combination in the settings and pick what it does: open the switcher, search in an engine (or search the selected text), toggle dark mode or the stylesheet on the site, dark mode everywhere, open an address here or in a new tab, set the media speed, copy the page's link without tracking parameters (`utm_*`, `fbclid`, `gclid` and friends), or open the settings. They need <kbd>Ctrl</kbd>, <kbd>Alt</kbd> or <kbd>Meta</kbd>, or a function key.

## Settings

`settings` in the switcher, or the extension's preferences in `about:addons` / `chrome://extensions`. One tab per part: Style, Dark mode, Exceptions, Switcher, Shortcuts, New tab, Media and Stats. Every change saves itself and applies to open tabs right away.

Exceptions take sites as `example.com` (that site only) or `*.example.com` (the site and its subdomains), for the stylesheet and for dark mode separately. A third list keeps a site's own animations and transitions while the rest of the stylesheet applies; it starts with `chatgpt.com`, whose view drifts while it writes if its animations are cut.

## Theme it from `userContent.css`

In Firefox and LibreWolf, sobrio reads these variables from `userContent.css` (with `toolkit.legacyUserProfileCustomizations.stylesheets` on) and uses them for dark mode, the switcher, the settings and the new tab. They win over the colors in the settings. The `@-moz-document` rule keeps them on extension pages only: no website sees them.

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

The browser reads `userContent.css` when it starts, so changes show after a restart.

## Install

- **Chrome:** `chrome://extensions`, turn on *Developer mode*, *Load unpacked* and pick this folder.
- **LibreWolf:** set `xpinstall.signatures.required` to `false` in `about:config`, run `scripts/pack.sh` and open `dist/sobrio-<version>.xpi` from `about:addons` (*Install Add-on From File*). For a quick try, `about:debugging` › *Load Temporary Add-on* works without the pref.
- **Firefox:** release builds only install signed add-ons. Upload the zip to [addons.mozilla.org](https://addons.mozilla.org/developers/) as *unlisted* to get it signed for yourself.

Firefox asks once whether to keep the new tab an extension set; keep it. The shortcut can be changed in `about:addons` › *Manage Extension Shortcuts* or `chrome://extensions/shortcuts`.

On pages where extensions cannot run (`about:` and `chrome://` pages, the add-on stores, PDFs) the shortcut opens the switcher from the toolbar button instead. The toolbar button always opens it too. In Firefox a few pages are only recognized too late (a PDF without `.pdf` in its address, error pages): there the shortcut does nothing and the toolbar button still works.

**Tip:** set your browser or system to a dark appearance. Sites with a dark theme of their own (GitHub, YouTube and many more) then switch to it, and sobrio leaves them alone.

## Development

No build step and no npm dependencies.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

## License

MIT. Bundles Dark Reader (MIT) and four fonts under the SIL Open Font License: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
