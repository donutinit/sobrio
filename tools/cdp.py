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
    ap.add_argument('--shots')
    ap.add_argument('--wait', type=float, default=4)
    ap.add_argument('--dark', action='store_true', help='emulate prefers-color-scheme: dark')
    ap.add_argument('--console', help='print console and log entries containing this text')
    ap.add_argument('--binary', default=shutil.which('chromium-browser') or shutil.which('chromium'))
    args = ap.parse_args()

    profile = tempfile.mkdtemp(prefix='sobrio-chromium-')
    cdp = Pipe(args.binary, profile, ['--force-dark-mode'] if args.dark else [])
    try:
        ext_id = cdp.call('Extensions.loadUnpacked', {'path': os.path.abspath(args.ext_dir)})['id']
        time.sleep(1)
        workers = [t['url'] for t in cdp.call('Target.getTargets')['targetInfos']
                   if t['type'] == 'service_worker' and ext_id in t['url']]
        print(json.dumps({'extension': ext_id, 'service_worker': workers}))

        target = cdp.call('Target.createTarget', {'url': 'about:blank'})['targetId']
        session = cdp.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
        for domain in ('Page', 'Runtime', 'Log'):
            cdp.call(f'{domain}.enable', {}, session)
        if args.dark:
            cdp.call('Emulation.setEmulatedMedia',
                     {'features': [{'name': 'prefers-color-scheme', 'value': 'dark'}]}, session)
        if args.ext_eval:
            cdp.call('Page.navigate', {'url': f'chrome-extension://{ext_id}/popup.html'}, session)
            time.sleep(1)
            print(json.dumps({'ext_eval': cdp.evaluate(args.ext_eval, session)}))
        if args.shots:
            os.makedirs(args.shots, exist_ok=True)
        for i, url in enumerate(args.urls):
            cdp.call('Page.navigate', {'url': url}, session)
            time.sleep(args.wait)
            print(json.dumps({'url': url, 'eval': cdp.evaluate(args.eval, session)}))
            if args.then_ext_eval:
                other = cdp.call('Target.createTarget',
                                 {'url': f'chrome-extension://{ext_id}/popup.html'})['targetId']
                other_session = cdp.call('Target.attachToTarget',
                                         {'targetId': other, 'flatten': True})['sessionId']
                time.sleep(1)
                print(json.dumps({'then_ext_eval': cdp.evaluate(args.then_ext_eval, other_session)}))
                cdp.call('Target.closeTarget', {'targetId': other})
                time.sleep(1.5)
                print(json.dumps({'url': url, 'after': cdp.evaluate(args.eval, session)}))
            if args.shots:
                png = cdp.call('Page.captureScreenshot', {'format': 'png'}, session)['data']
                with open(os.path.join(args.shots, f'chromium-{i}.png'), 'wb') as f:
                    f.write(base64.b64decode(png))
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
