# sobrio

An opinionated extension on how the web should look and how a browser should feel.

Based on [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader) and [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs): one small part of each, nothing else. No options page, no schedules, no settings. For Firefox, LibreWolf and Chrome.

## What it does

**One stylesheet, everywhere.** No rounded corners, shadows, text shadows or blur. Animations and transitions cut to nothing, except in YouTube's player. Thin scrollbars. It lives in [`custom-css.js`](custom-css.js) as plain CSS; edit it there.

**Black, smartly.** Dark Reader's dynamic engine turns every site black (`#000`), color by color. Sites that already have a dark theme of their own keep it.

**A switcher.** <kbd>Ctrl</kbd>+<kbd>Space</kbd> opens a box in the middle of the page, like Obsidian's quick switcher. Type to fuzzy search your bookmarks. If nothing matches, <kbd>Enter</kbd> searches the web instead. <kbd>Tab</kbd> cycles through DuckDuckGo, Google, YouTube, Wikipedia and GitHub.

| Key | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | move |
| <kbd>Enter</kbd> | open here |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> | open in a new tab |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | next / previous engine |
| <kbd>Esc</kbd> | close |

Two commands, typed in the switcher:

- `td` toggles dark mode on the current site.
- `ta` toggles the stylesheet on the current site.

The change applies at once in every tab of that site and is remembered.

On pages where extensions cannot run (`about:` and `chrome://` pages, the add-on stores) the shortcut opens the switcher from the toolbar button instead. The toolbar button always opens it too.

## Install

- **Chrome:** `chrome://extensions`, turn on *Developer mode*, *Load unpacked* and pick this folder.
- **LibreWolf:** set `xpinstall.signatures.required` to `false` in `about:config`, run `scripts/pack.sh` and open `dist/sobrio-<version>.xpi` from `about:addons` (*Install Add-on From File*). For a quick try, `about:debugging` › *Load Temporary Add-on* works without the pref.
- **Firefox:** release builds only install signed add-ons. Upload the zip to [addons.mozilla.org](https://addons.mozilla.org/developers/) as *unlisted* to get it signed for yourself.

The shortcut can be changed in `about:addons` › *Manage Extension Shortcuts* or `chrome://extensions/shortcuts`.

**Tip:** set your browser or system to a dark appearance. Sites with a dark theme of their own (GitHub, YouTube and many more) then switch to it, and sobrio leaves them alone.

## Development

No build step and no npm dependencies.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

## License

MIT. Bundles Dark Reader, also MIT: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
