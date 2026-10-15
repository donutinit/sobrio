#!/usr/bin/env python3
"""Drive a headless LibreWolf/Firefox with sobrio installed, for checks the unit tests cannot do.

    python3 tools/marionette.py . https://en.wikipedia.org/wiki/Monochrome \
        --eval 'return getComputedStyle(document.body).backgroundColor' --shots /tmp/shots

--ext-eval runs once inside an extension page (full chrome.* access) before the URLs.
--eval runs in each page and its return value is printed as JSON. Only the stdlib is used:
Marionette is length-prefixed JSON over TCP.
"""
import argparse
import base64
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time

ADDON_ID = 'sobrio@donutinit'
WEBDRIVER_KEYS = {'Ctrl': '\ue009', 'Shift': '\ue008', 'Alt': '\ue00a', 'Meta': '\ue03d', 'Tab': '\ue004',
                  'Enter': '\ue007', 'Escape': '\ue00c', 'ArrowUp': '\ue013', 'ArrowDown': '\ue015'}


def key_actions(tokens):
    """'rust,Ctrl+j,Shift+Tab' as WebDriver key actions; plain words are typed letter by letter."""
    actions = []
    for token in tokens.split(','):
        *mods, key = token.split('+')
        presses = [key] if mods or key in WEBDRIVER_KEYS or len(key) == 1 else list(key)
        for press in presses:
            values = [WEBDRIVER_KEYS[m] for m in mods] + [WEBDRIVER_KEYS.get(press, press)]
            actions += [{'type': 'keyDown', 'value': v} for v in values]
            actions += [{'type': 'keyUp', 'value': v} for v in reversed(values)]
            actions.append({'type': 'pause', 'duration': 150})
    return [{'type': 'key', 'id': 'keyboard', 'actions': actions}]


class Marionette:
    def __init__(self, port):
        for _ in range(100):
            try:
                self.sock = socket.create_connection(('127.0.0.1', port))
                break
            except OSError:
                time.sleep(0.2)
        else:
            raise SystemExit('marionette did not start')
        self.buf = b''
        self.msg_id = 0
        self._read()  # handshake

    def _read(self):
        while b':' not in self.buf:
            self.buf += self.sock.recv(65536)
        size, _, rest = self.buf.partition(b':')
        size = int(size)
        while len(rest) < size:
            rest += self.sock.recv(65536)
        self.buf = rest[size:]
        return json.loads(rest[:size])

    def call(self, name, params=None):
        self.msg_id += 1
        data = json.dumps([0, self.msg_id, name, params or {}]).encode()
        self.sock.sendall(str(len(data)).encode() + b':' + data)
        while True:
            _, msg_id, error, result = self._read()
            if msg_id == self.msg_id:
                if error:
                    raise RuntimeError(f"{name}: {error.get('error')}: {error.get('message')}")
                return result.get('value', result) if isinstance(result, dict) else result

    def run(self, script, context='content'):
        self.call('Marionette:SetContext', {'value': context})
        try:
            return self.call('WebDriver:ExecuteScript', {'script': script, 'args': []})
        finally:
            self.call('Marionette:SetContext', {'value': 'content'})


def wrap(script):
    # Same contract as tools/cdp.py: the script may use await and returns a value.
    return f'return (async () => {{ {script} }})()'


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ext_dir')
    ap.add_argument('urls', nargs='*')
    ap.add_argument('--eval', default='return null')
    ap.add_argument('--ext-eval')
    ap.add_argument('--then-ext-eval', help='after each page: run this in an extension tab, then --eval again')
    ap.add_argument('--keys', help="after --then-ext-eval, press these: 'rust,Ctrl+j,Tab,Enter'")
    ap.add_argument('--user-content', help='a userContent.css for the temporary profile')
    ap.add_argument('--late-install', action='store_true',
                    help='load the first url before installing, like a tab already open at install time')
    ap.add_argument('--shots')
    ap.add_argument('--wait', type=float, default=4)
    ap.add_argument('--pref', action='append', default=[], help='name=json value')
    ap.add_argument('--permanent', action='store_true',
                    help='install ext_dir (then an .xpi) as a normal add-on, as a person would, not a temporary one')
    ap.add_argument('--chrome-eval', help="after --ext-eval: run this in the browser window's chrome (gBrowser, gURLBar)")
    ap.add_argument('--console', help='print browser console messages containing this text')
    ap.add_argument('--binary', default=shutil.which('librewolf') or shutil.which('firefox'))
    args = ap.parse_args()

    port = free_port()
    profile = tempfile.mkdtemp(prefix='sobrio-profile-')
    prefs = {
        'marionette.port': port,
        'browser.shell.checkDefaultBrowser': False,
        'xpinstall.signatures.required': False,
        'datareporting.policy.dataSubmissionEnabled': False,
    }
    if args.user_content:
        os.makedirs(os.path.join(profile, 'chrome'))
        shutil.copy(args.user_content, os.path.join(profile, 'chrome', 'userContent.css'))
        prefs['toolkit.legacyUserProfileCustomizations.stylesheets'] = True
    for pref in args.pref:
        name, _, value = pref.partition('=')
        prefs[name] = json.loads(value)
    with open(os.path.join(profile, 'user.js'), 'w') as f:
        for name, value in prefs.items():
            f.write(f'user_pref({json.dumps(name)}, {json.dumps(value)});\n')

    proc = subprocess.Popen(
        [args.binary, '--headless', '--marionette', '-remote-allow-system-access', '--no-remote',
         '--profile', profile],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        m = Marionette(port)
        m.call('WebDriver:NewSession', {'capabilities': {}})
        m.call('WebDriver:SetWindowRect', {'width': 1280, 'height': 800})
        if args.late_install and args.urls:
            m.call('WebDriver:Navigate', {'url': args.urls[0]})
            time.sleep(args.wait)
        m.call('Addon:Install', {'path': os.path.abspath(args.ext_dir), 'temporary': not args.permanent})
        host = m.run(
            f'return WebExtensionPolicy.getByID({json.dumps(ADDON_ID)}).mozExtensionHostname',
            'chrome')
        if args.ext_eval:
            m.call('WebDriver:Navigate', {'url': f'moz-extension://{host}/popup.html'})
            print(json.dumps({'ext_eval': m.call('WebDriver:ExecuteScript',
                                                  {'script': wrap(args.ext_eval), 'args': []})}))
        if args.chrome_eval:
            print(json.dumps({'chrome_eval': m.run(wrap(args.chrome_eval), 'chrome')}))
        if args.shots:
            os.makedirs(args.shots, exist_ok=True)
        for i, url in enumerate(args.urls):
            if url.startswith('ext:'):  # a page of the extension, e.g. ext:options.html
                url = f'moz-extension://{host}/{url[4:]}'
            if not (args.late_install and i == 0 and not args.ext_eval):
                m.call('WebDriver:Navigate', {'url': url})
            time.sleep(args.wait)
            result = m.call('WebDriver:ExecuteScript', {'script': wrap(args.eval), 'args': []})
            print(json.dumps({'url': url, 'eval': result}))
            if args.then_ext_eval:
                page = m.call('WebDriver:GetWindowHandle')
                tab = m.call('WebDriver:NewWindow', {'type': 'tab'})['handle']
                m.call('WebDriver:SwitchToWindow', {'handle': tab})
                m.call('WebDriver:Navigate', {'url': f'moz-extension://{host}/popup.html'})
                print(json.dumps({'then_ext_eval': m.call('WebDriver:ExecuteScript',
                                                          {'script': wrap(args.then_ext_eval), 'args': []})}))
                m.call('WebDriver:CloseWindow')
                m.call('WebDriver:SwitchToWindow', {'handle': page})
                time.sleep(1.5)
                if args.keys:
                    m.call('WebDriver:PerformActions', {'actions': key_actions(args.keys)})
                    m.call('WebDriver:ReleaseActions')
                    time.sleep(0.5)
                after = m.call('WebDriver:ExecuteScript', {'script': wrap(args.eval), 'args': []})
                print(json.dumps({'url': url, 'after': after}))
                if args.shots:
                    png = base64.b64decode(m.call('WebDriver:TakeScreenshot', {'full': False}))
                    with open(os.path.join(args.shots, f'firefox-{i}-after.png'), 'wb') as f:
                        f.write(png)
            if args.shots:
                png = base64.b64decode(m.call('WebDriver:TakeScreenshot', {'full': False}))
                with open(os.path.join(args.shots, f'firefox-{i}.png'), 'wb') as f:
                    f.write(png)
        if args.console:
            messages = m.run('return Services.console.getMessageArray().map(m => m.message)', 'chrome')
            for message in messages or []:
                if args.console in message:
                    print(json.dumps({'console': message[:300]}))
    finally:
        proc.terminate()
        proc.wait(timeout=10)
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == '__main__':
    sys.exit(main())
