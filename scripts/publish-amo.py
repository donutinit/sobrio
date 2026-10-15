#!/usr/bin/env python3
"""Send a sobrio package to addons.mozilla.org (AMO) as a new listed version.

    AMO_JWT_ISSUER=… AMO_JWT_SECRET=… python3 -I scripts/publish-amo.py dist/sobrio-<version>.zip --notes notes.md
    … --validate-only    # upload it and wait for AMO's validation; no version is created

The keys come from https://addons.mozilla.org/developers/addon/api/key/. The notes for reviewers
are the fenced block under "Notes for reviewers" in docs/amo.md. Only the standard library is used:
the API is JSON over HTTPS with a short-lived HS256 JWT. AMO_API points it at another server (tests).
"""
import argparse
import base64
import hashlib
import hmac
import http.client
import json
import os
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request

GUID = 'sobrio@donutinit'
API = os.environ.get('AMO_API', 'https://addons.mozilla.org/api/v5')
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


# AMO wants a fresh token on every request, valid for at most five minutes.
def token(issuer, secret):
    now = int(time.time())
    head = b64(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
    body = b64(json.dumps({'iss': issuer, 'jti': secrets.token_hex(16), 'iat': now, 'exp': now + 60}).encode())
    signature = b64(hmac.new(secret.encode(), f'{head}.{body}'.encode(), hashlib.sha256).digest())
    return f'{head}.{body}.{signature}'


def call(method, path, keys, data=None, content_type=None):
    request = urllib.request.Request(API + path, data=data, method=method)
    request.add_header('Authorization', 'JWT ' + token(*keys))
    if content_type:
        request.add_header('Content-Type', content_type)
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        raise SystemExit(f'{method} {path}: HTTP {error.code}: {error.read().decode(errors="replace")[:2000]}')
    except (urllib.error.URLError, OSError, http.client.HTTPException) as error:
        raise SystemExit(f'{method} {path}: {error}')


def multipart(fields, files):
    boundary = secrets.token_hex(16)
    parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode()
             for name, value in fields.items()]
    for name, (filename, content) in files.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'
                     'Content-Type: application/zip\r\n\r\n'.encode() + content + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    return b''.join(parts), f'multipart/form-data; boundary={boundary}'


def reviewer_notes():
    with open(os.path.join(ROOT, 'docs', 'amo.md'), encoding='utf-8') as f:
        section = f.read().split('## Notes for reviewers', 1)[1]
    return section.split('```', 2)[1].strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('package', help='dist/sobrio-<version>.zip')
    ap.add_argument('--notes', help='release notes, a text file')
    ap.add_argument('--validate-only', action='store_true', help='stop after the validation')
    ap.add_argument('--wait', type=int, default=900, help='seconds to wait for the validation')
    args = ap.parse_args()

    keys = (os.environ.get('AMO_JWT_ISSUER', ''), os.environ.get('AMO_JWT_SECRET', ''))
    if not all(keys):
        raise SystemExit('AMO_JWT_ISSUER and AMO_JWT_SECRET must be set (the API keys from AMO)')

    with open(args.package, 'rb') as f:
        body, content_type = multipart({'channel': 'listed'}, {'upload': (os.path.basename(args.package), f.read())})
    upload = call('POST', '/addons/upload/', keys, body, content_type)
    deadline = time.time() + args.wait
    while not upload.get('processed'):
        if time.time() > deadline:
            raise SystemExit(f"AMO had not finished validating after {args.wait} s: {upload.get('url', '')}")
        time.sleep(5)
        upload = call('GET', f"/addons/upload/{upload['uuid']}/", keys)

    validation = upload.get('validation') or {}
    print(f"validation of {upload.get('version')}: {validation.get('errors', 0)} errors, "
          f"{validation.get('warnings', 0)} warnings, {validation.get('notices', 0)} notices")
    for message in validation.get('messages', []):
        if message.get('type') in ('error', 'warning'):
            where = f" ({message['file']})" if message.get('file') else ''
            print(f"  {message['type']}: {message.get('message')}{where}")
    if not upload.get('valid'):
        raise SystemExit('AMO did not accept the package')
    if args.validate_only:
        print('valid; nothing was sent (--validate-only)')
        return

    version = {'upload': upload['uuid'], 'approval_notes': reviewer_notes()}
    if args.notes:
        with open(args.notes, encoding='utf-8') as f:
            version['release_notes'] = {'en-US': f.read().strip()}
    created = call('POST', f'/addons/addon/{urllib.parse.quote(GUID)}/versions/', keys,
                   json.dumps(version).encode(), 'application/json')
    print(f"version {created.get('version')} sent to AMO for review (id {created.get('id')})")


if __name__ == '__main__':
    main()
