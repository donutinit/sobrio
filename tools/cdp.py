#!/usr/bin/env python3
"""Drive a headless Chromium with sobrio loaded, for checks the unit tests cannot do.

    python3 tools/cdp.py . https://en.wikipedia.org/wiki/Monochrome \
        --eval 'return getComputedStyle(document.body).backgroundColor' --shots /tmp/shots

Same arguments as tools/marionette.py. Talks the DevTools protocol over
--remote-debugging-pipe (NUL-separated JSON on fds 3 and 4), so only the stdlib is used.
"""
import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

SPECIAL_KEYS = {'Tab': 9, 'Enter': 13, 'Escape': 27, 'ArrowUp': 38, 'ArrowDown': 40}
MODIFIERS = {'Alt': 1, 'Ctrl': 2, 'Meta': 4, 'Shift': 8}
SWITCHER_STATE = '''function () {
    const rows = [...this.querySelectorAll('.row')];
    return {mode: this.querySelector('.mode').textContent, value: this.querySelector('.input').value,
            focused: this.activeElement?.className ?? null, selected: rows.findIndex(r => r.classList.contains('selected')),
            rows: rows.map(r => r.querySelector('.title').textContent + ' | ' + r.querySelector('.sub').textContent),
            empty: this.querySelector('.empty')?.textContent ?? null};
}'''


def keys(tokens):
    """'rust,Ctrl+j,click@640:300' -> [(modifiers, key)]; plain words are typed letter by letter.
    A trailing ~ (Ctrl+j~) sends the key as an autorepeat, like a held key."""
    for token in tokens.split(','):
        if len(token) > 1 and token.endswith('~'):
            *mods, key = token[:-1].split('+')
            yield [*mods, 'repeat'], key
            continue
        if token.startswith('click@'):
            yield ['click'], token[len('click@'):]
            continue
        *mods, key = token.split('+')
        if mods or key in SPECIAL_KEYS or len(key) == 1:
            yield [m for m in mods], key
        else:
            for char in key:
                yield [], char


class Pipe:
    def __init__(self, binary, profile, extra):
        to_chrome_r, self.to_chrome = os.pipe()
        self.from_chrome, from_chrome_w = os.pipe()
        # Move the child's ends out of the way first so dup2 onto 3 and 4 cannot clobber them.
        hi_r, hi_w = os.dup(to_chrome_r), os.dup(from_chrome_w)

        def child_fds():
            os.dup2(hi_r, 3)
            os.dup2(hi_w, 4)

        self.proc = subprocess.Popen(
            [binary, '--headless=new', '--remote-debugging-pipe', '--enable-unsafe-extension-debugging',
             f'--user-data-dir={profile}', '--no-first-run', '--no-default-browser-check',
             '--window-size=1280,800', *extra, 'about:blank'],
            # close_fds runs after preexec_fn, so 3 and 4 themselves must be kept.
            pass_fds=(3, 4, hi_r, hi_w), preexec_fn=child_fds,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for fd in (to_chrome_r, from_chrome_w, hi_r, hi_w):
            os.close(fd)
        self.buf = b''
        self.msg_id = 0
        self.events = []

    def _read(self):
        while b'\0' not in self.buf:
            chunk = os.read(self.from_chrome, 1 << 20)
            if not chunk:
                raise SystemExit('chromium closed the pipe')
            self.buf += chunk
        msg, _, self.buf = self.buf.partition(b'\0')
        return json.loads(msg)

    def call(self, method, params=None, session=None):
        self.msg_id += 1
        msg = {'id': self.msg_id, 'method': method, 'params': params or {}}
        if session:
            msg['sessionId'] = session
        os.write(self.to_chrome, json.dumps(msg).encode() + b'\0')
        while True:
            reply = self._read()
            if reply.get('id') == self.msg_id:
                if 'error' in reply:
                    raise RuntimeError(f"{method}: {reply['error']}")
                return reply['result']
            self.events.append(reply)

    def press(self, mods, key, session):
        if mods == ['click']:
            x, y = (float(v) for v in key.split(':'))
            for kind in ('mousePressed', 'mouseReleased'):
                self.call('Input.dispatchMouseEvent',
                          {'type': kind, 'x': x, 'y': y, 'button': 'left', 'clickCount': 1}, session)
            return
        repeat = 'repeat' in mods
        bits = sum(MODIFIERS[m] for m in mods if m != 'repeat')
        if key in SPECIAL_KEYS:
            event = {'key': key, 'code': key, 'windowsVirtualKeyCode': SPECIAL_KEYS[key]}
            if key == 'Enter' and not bits:
                event['text'] = '\r'
        elif bits & ~MODIFIERS['Shift']:
            event = {'key': key, 'code': f'Key{key.upper()}', 'windowsVirtualKeyCode': ord(key.upper())}
        else:
            event = {'key': key, 'text': key, 'windowsVirtualKeyCode': ord(key.upper())}
        down = 'keyDown' if 'text' in event else 'rawKeyDown'
        if repeat:
            event['autoRepeat'] = True
        self.call('Input.dispatchKeyEvent', {'type': down, 'modifiers': bits, **event}, session)
        self.call('Input.dispatchKeyEvent', {'type': 'keyUp', 'modifiers': bits, **event}, session)

    def switcher_state(self, session):
        root = self.call('DOM.getDocument', {'depth': -1, 'pierce': True}, session)['root']
        stack = [root]
        while stack:
            node = stack.pop()
            if node.get('nodeName') == 'SOBRIO-SWITCHER' and node.get('shadowRoots'):
                shadow = self.call('DOM.resolveNode', {'backendNodeId': node['shadowRoots'][0]['backendNodeId']}, session)
                result = self.call('Runtime.callFunctionOn', {
                    'objectId': shadow['object']['objectId'], 'functionDeclaration': SWITCHER_STATE,
                    'returnByValue': True}, session)
                return result['result'].get('value')
            stack.extend(node.get('children', []))
        return None

    def evaluate(self, script, session):
        result = self.call('Runtime.evaluate', {
            'expression': f'(async () => {{ {script} }})()',
            'awaitPromise': True, 'returnByValue': True}, session)
        if 'exceptionDetails' in result:
            return {'exception': result['exceptionDetails'].get('exception', {}).get('description')}
        return result['result'].get('value')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ext_dir')
    ap.add_argument('urls', nargs='*')
    ap.add_argument('--eval', default='return null')
    ap.add_argument('--ext-eval')
    ap.add_argument('--then-ext-eval', help='after each page: run this in an extension tab, then --eval again')
    ap.add_argument('--keys', help="after --then-ext-eval, press these: 'rust,Ctrl+j,Tab,Enter,click@x:y'")
    ap.add_argument('--switcher', action='store_true', help='print the switcher state (closed shadow root)')
    ap.add_argument('--busy-worker', type=int, help='block the service worker this many ms before --then-ext-eval')
    ap.add_argument('--settle', type=float, default=0, help='seconds to wait after --keys before --eval')
    ap.add_argument('--targets', action='store_true', help='print the urls of the open pages at the end')
    ap.add_argument('--full', action='store_true', help='screenshots of the whole page, not just the window')
    ap.add_argument('--after-ext-eval', help='after --keys and --eval: run this in an extension tab')
    ap.add_argument('--sw-eval', help='after --then-ext-eval: run this inside the service worker')
    ap.add_argument('--late-load', action='store_true', help='open the first url before loading the extension')
    ap.add_argument('--clipboard', action='store_true', help='let pages read and write the clipboard')
    ap.add_argument('--shots')
    ap.add_argument('--wait', type=float, default=4)
    ap.add_argument('--dark', action='store_true', help='emulate prefers-color-scheme: dark')
    ap.add_argument('--autoplay', action='store_true', help='let media play with sound without a gesture')
    ap.add_argument('--lang', help="the browser's language, for the extension's translations (de, ja, pt-BR…)")
    ap.add_argument('--console', help='print console and log entries containing this text')
    ap.add_argument('--binary', default=shutil.which('chromium-browser') or shutil.which('chromium'))
    args = ap.parse_args()

    profile = tempfile.mkdtemp(prefix='sobrio-chromium-')
    # sobrio.test is the fixtures' server on this machine under a name that is not local
    # (sobrio leaves local addresses alone by default).
    flags = ['--host-resolver-rules=MAP sobrio.test 127.0.0.1'] + (['--force-dark-mode'] if args.dark else []) \
        + (['--autoplay-policy=no-user-gesture-required'] if args.autoplay else []) \
        + ([f'--lang={args.lang}', f'--accept-lang={args.lang}'] if args.lang else [])
    cdp = Pipe(args.binary, profile, flags)
    try:
        early = None
        if args.late_load and args.urls:  # a tab already open when the extension arrives
            early = cdp.call('Target.createTarget', {'url': args.urls[0]})['targetId']
            time.sleep(args.wait)
        if args.clipboard:
            cdp.call('Browser.grantPermissions', {'permissions': ['clipboardReadWrite', 'clipboardSanitizedWrite']})
        ext_id = cdp.call('Extensions.loadUnpacked', {'path': os.path.abspath(args.ext_dir)})['id']
        time.sleep(1)
        workers = [t['url'] for t in cdp.call('Target.getTargets')['targetInfos']
                   if t['type'] == 'service_worker' and ext_id in t['url']]
        print(json.dumps({'extension': ext_id, 'service_worker': workers}))

        target = early or cdp.call('Target.createTarget', {'url': 'about:blank'})['targetId']
        session = cdp.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
        for domain in ('Page', 'Runtime', 'Log', 'DOM'):
            cdp.call(f'{domain}.enable', {}, session)
        if args.dark:
            cdp.call('Emulation.setEmulatedMedia',
                     {'features': [{'name': 'prefers-color-scheme', 'value': 'dark'}]}, session)
        if args.ext_eval:
            if early:  # keep the early page: use a tab of its own
                ext = cdp.call('Target.createTarget', {'url': f'chrome-extension://{ext_id}/popup.html'})['targetId']
                ext_session = cdp.call('Target.attachToTarget', {'targetId': ext, 'flatten': True})['sessionId']
                time.sleep(1)
                print(json.dumps({'ext_eval': cdp.evaluate(args.ext_eval, ext_session)}))
                cdp.call('Target.closeTarget', {'targetId': ext})
            else:
                cdp.call('Page.navigate', {'url': f'chrome-extension://{ext_id}/popup.html'}, session)
                time.sleep(1)
                print(json.dumps({'ext_eval': cdp.evaluate(args.ext_eval, session)}))
        if args.shots:
            os.makedirs(args.shots, exist_ok=True)
        for i, url in enumerate(args.urls):
            if url.startswith('ext:'):  # a page of the extension, e.g. ext:options.html
                url = f'chrome-extension://{ext_id}/{url[4:]}'
            if not (early and i == 0):
                cdp.call('Page.navigate', {'url': url}, session)
            time.sleep(args.wait)
            print(json.dumps({'url': url, 'eval': cdp.evaluate(args.eval, session)}))
            if args.then_ext_eval:
                if args.busy_worker:
                    worker = next(t['targetId'] for t in cdp.call('Target.getTargets')['targetInfos']
                                  if t['type'] == 'service_worker' and ext_id in t['url'])
                    worker_session = cdp.call('Target.attachToTarget',
                                              {'targetId': worker, 'flatten': True})['sessionId']
                    cdp.call('Runtime.evaluate', {'expression': 'setTimeout(() => { const end = Date.now() + '
                             f'{args.busy_worker}; while (Date.now() < end); }}, 0); 1'}, worker_session)
                other = cdp.call('Target.createTarget',
                                 {'url': f'chrome-extension://{ext_id}/popup.html'})['targetId']
                other_session = cdp.call('Target.attachToTarget',
                                         {'targetId': other, 'flatten': True})['sessionId']
                time.sleep(1)
                print(json.dumps({'then_ext_eval': cdp.evaluate(args.then_ext_eval, other_session)}))
                cdp.call('Target.closeTarget', {'targetId': other})
                cdp.call('Target.activateTarget', {'targetId': target})
                time.sleep(1.5)
                if args.sw_eval:
                    worker = next(t['targetId'] for t in cdp.call('Target.getTargets')['targetInfos']
                                  if t['type'] == 'service_worker' and ext_id in t['url'])
                    worker_session = cdp.call('Target.attachToTarget', {'targetId': worker, 'flatten': True})['sessionId']
                    print(json.dumps({'sw_eval': cdp.evaluate(args.sw_eval, worker_session)}))
                for mods, key in keys(args.keys or ''):
                    if key:
                        cdp.press(mods, key, session)
                        time.sleep(0.15)
                time.sleep(args.settle)
                print(json.dumps({'url': url, 'after': cdp.evaluate(args.eval, session)}))
                if args.switcher:
                    print(json.dumps({'switcher': cdp.switcher_state(session)}))
                if args.after_ext_eval:
                    last = cdp.call('Target.createTarget', {'url': f'chrome-extension://{ext_id}/popup.html'})['targetId']
                    last_session = cdp.call('Target.attachToTarget', {'targetId': last, 'flatten': True})['sessionId']
                    time.sleep(1)
                    print(json.dumps({'after_ext_eval': cdp.evaluate(args.after_ext_eval, last_session)}))
                    cdp.call('Target.closeTarget', {'targetId': last})
                if args.shots:
                    png = cdp.call('Page.captureScreenshot', {'format': 'png'}, session)['data']
                    with open(os.path.join(args.shots, f'chromium-{i}-after.png'), 'wb') as f:
                        f.write(base64.b64decode(png))
            if args.shots:
                png = cdp.call('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': args.full},
                               session)['data']
                with open(os.path.join(args.shots, f'chromium-{i}.png'), 'wb') as f:
                    f.write(base64.b64decode(png))
        if args.targets:
            print(json.dumps({'pages': [t['url'] for t in cdp.call('Target.getTargets')['targetInfos'] if t['type'] == 'page']}))
        if args.console:
            for event in cdp.events:
                params = event.get('params', {})
                text = params.get('entry', {}).get('text') or ' '.join(
                    str(a.get('value', a.get('description', ''))) for a in params.get('args', []))
                if text and args.console in text:
                    print(json.dumps({'console': text[:300]}))
    finally:
        cdp.proc.terminate()
        cdp.proc.wait(timeout=10)
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == '__main__':
    sys.exit(main())
