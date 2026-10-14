#!/usr/bin/env python3
"""Vendor a darkreader release into darkreader.js, unchanged.

    python3 -I tools/vendor-darkreader.py 4.9.133

Downloads the npm tarball, checks it against the registry's sha512 integrity and copies
package/darkreader.js byte for byte.
"""
import base64
import hashlib
import io
import json
import os
import sys
import tarfile
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def fetch(url):
    with urllib.request.urlopen(url) as response:
        return response.read()


def main():
    version = sys.argv[1]
    meta = json.loads(fetch(f'https://registry.npmjs.org/darkreader/{version}'))
    tgz = fetch(meta['dist']['tarball'])
    integrity = 'sha512-' + base64.b64encode(hashlib.sha512(tgz).digest()).decode()
    if integrity != meta['dist']['integrity']:
        raise SystemExit(f'integrity mismatch: {integrity}')
    with tarfile.open(fileobj=io.BytesIO(tgz)) as tar:
        bundle = tar.extractfile('package/darkreader.js').read()
    with open(os.path.join(ROOT, 'darkreader.js'), 'wb') as f:
        f.write(bundle)
    print(f'darkreader {version} vendored ({integrity[:20]}...)')


if __name__ == '__main__':
    main()
