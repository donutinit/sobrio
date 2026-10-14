#!/usr/bin/env python3
"""Draw sobrio's icon, the isotype: a square with a square full stop, on a 16-unit grid.

    python3 -I tools/make-icons.py

The square fills the grid and the dot is 3 units, 3 from the right and bottom edges. Every size
is a whole multiple of 16, so the PNGs are drawn pixel by pixel and stay exact: icons/icon-*.png
are black with a white dot (light toolbars, the add-on listing), icons/icon-light-*.png the
reverse, for dark toolbars (theme_icons). icons/icon.svg is the same drawing.
"""
import os
import struct
import zlib

GRID = 16
DOT = (10, 13)  # from, to, on both axes
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')


def png(width, rows):
    """8-bit grayscale PNG from rows of byte values."""
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xFFFFFFFF)
    raw = b''.join(b'\x00' + bytes(row) for row in rows)
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', width, len(rows), 8, 0, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw, 9))
            + chunk(b'IEND', b''))


def draw(size, ink, paper):
    scale = size // GRID
    lo, hi = DOT[0] * scale, DOT[1] * scale
    return [[paper if lo <= x < hi and lo <= y < hi else ink for x in range(size)] for y in range(size)]


def main():
    os.makedirs(ROOT, exist_ok=True)
    outputs = {f'icon-{s}.png': (s, 0, 255) for s in (16, 32, 48, 128)}
    outputs.update({f'icon-light-{s}.png': (s, 255, 0) for s in (16, 32)})
    for name, (size, ink, paper) in outputs.items():
        with open(os.path.join(ROOT, name), 'wb') as f:
            f.write(png(size, draw(size, ink, paper)))
    with open(os.path.join(ROOT, 'icon.svg'), 'w') as f:
        f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">\n'
                '  <rect width="16" height="16" fill="#000"/>\n'
                f'  <rect x="{DOT[0]}" y="{DOT[0]}" width="{DOT[1] - DOT[0]}" height="{DOT[1] - DOT[0]}" fill="#fff"/>\n'
                '</svg>\n')
    print(' '.join(sorted(outputs)) + ' icon.svg')


if __name__ == '__main__':
    main()
