# sobrio. brand

Two colors, two typefaces, one square.

## The mark

The isotype is a black square with a square full stop: `sobrio.` said as a statement. It is drawn
on a 16-unit grid, the square filling it and the dot 3 units wide, 3 from the right and bottom
edges. Every size the extension ships (16, 32, 48 and 128 px) is a whole multiple of 16, so each
PNG is exact, pixel for pixel.

- `icons/icon.svg` is the isotype; `tools/make-icons.py` draws it and every PNG.
- `icons/icon-*.png`: black with a white dot, for light toolbars and the add-on listings.
- `icons/icon-light-*.png`: white with a black dot, for dark toolbars (`theme_icons`).

The wordmark is `sobrio` in Instrument Sans 500, tracked tight (−0.045em), always followed by its
square full stop: a square of 0.15em on the baseline. The lockup puts the isotype at the height of
the wordmark's cap height and a third of it apart.

- Clear space: one dot on every side.
- Smallest: the isotype at 16 px, the wordmark at 18 px; below that, the isotype alone.
- Never rounded, outlined, rotated or in any other color.

## Color

Black `#000000` and white `#ffffff`, nothing else. Secondary text is the same ink at 60%, lines at
20%. On a dark page everything inverts.

## Type

- **Instrument Sans** (400, 500) is the voice: the wordmark, titles and copy.
- **DM Mono** (400) is the system: labels in uppercase tracked at 0.12em, keys, commands, code.

The extension's own pages keep the reader's font (system or the `--sobrio-font` theme hook); the
brand typefaces are for the mark, the listings and images like these.

## Icons

`icons.js` holds the interface icons as data, drawn on the isotype's own 16 grid: 1 px lines on
half pixels and solid fills on whole ones, so at 16 px and at every multiple each line lands on a
pixel and nothing is blurred. Only squares, straight lines and diagonals, square ends and joins,
and fills that are solid halves or blocks, like the dot. They take the color of the text.

## Images

`banner.html` is the README banner and the GitHub social preview, 1280 × 640, with `#light` for the
light version. Rendered without sobrio (its dark mode would invert the light one):

```sh
python3 -I tools/cdp.py <an empty extension folder> "file://$PWD/docs/brand/banner.html#dark" --shots /tmp/banner
```

then cropped to 1280 × 640 as `banner-dark.png` and `banner-light.png`. The screenshots in
`docs/screens` come from `tools/marionette.py` in LibreWolf.
