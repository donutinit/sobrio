#!/usr/bin/env python3
"""How long the switcher takes to answer Ctrl+Space on a page that is still loading, in headless
Firefox, and whether what is typed right after reaches the page.

    python3 -I tools/keylag.py . --binary ~/.cache/sobrio-firefox/firefox/firefox

Serves a document that keeps arriving for --load ms, with inline scripts that hold the main
thread --busy ms each and --gap ms apart, like a heavy site. --at ms into it, presses Ctrl+Space
and two letters with keys sent from the browser's own process, as a keyboard does (the page gets
them first, then the browser's shortcuts). Prints key_ms, what the page took to get to the key
(its own scripts held the main thread: not sobrio's doing), switcher_ms, how long after that the
switcher was in the page, and the letters the page got to see instead of the switcher. One JSON
line per run, then the medians. Reuses tools/marionette.py, so only the stdlib is used.
"""
import argparse
import http.server
import importlib.util
import json
import os
import shutil
import socketserver
import statistics
import subprocess
import tempfile
import threading
import time
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('marionette', os.path.join(HERE, 'marionette.py'))
mn = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mn)

# The page keeps its own clock: when it started, when it got the first key of the shortcut, when
# the switcher's host came in, and the letters that got past the switcher to the document.
HEAD = '''<!doctype html><html><head><meta charset="utf-8"><title>loading</title><script>
window.lag = {start: Date.now(), key: null, switcher: null, leaked: []};
addEventListener('keydown', (e) => { if (e.key === 'Control' && lag.key === null) lag.key = Date.now(); }, true);
new MutationObserver((records) => {
  for (const record of records) for (const node of record.addedNodes) {
    if (node.localName === 'sobrio-switcher' && lag.switcher === null) lag.switcher = Date.now();
  }
}).observe(document.documentElement, {childList: true});
document.addEventListener('keydown', (e) => e.key.length === 1 && e.key !== ' ' && lag.leaked.push(e.key));
addEventListener('DOMContentLoaded', () => { lag.loaded = Date.now(); });
</script><style>body { background: #fff; color: #111; font: 16px sans-serif; }</style></head><body><h1>loading</h1>'''
BUSY = '<p>part %d</p><script>{ const end = performance.now() + %d; while (performance.now() < end); }</script>'

# Keys from the parent process, through the widget: the path a keyboard takes.
PRESS = '''
const tip = Cc["@mozilla.org/text-input-processor;1"].createInstance(Ci.nsITextInputProcessor);
tip.beginInputTransactionForTests(window);
const key = (init) => new KeyboardEvent('', init);
const control = key({key: 'Control', code: 'ControlLeft', keyCode: KeyboardEvent.DOM_VK_CONTROL});
const space = key({key: ' ', code: 'Space', keyCode: KeyboardEvent.DOM_VK_SPACE});
const pressed = Date.now();
tip.keydown(control); tip.keydown(space); tip.keyup(space); tip.keyup(control);
for (const letter of arguments[0]) {
  const event = key({key: letter, code: 'Key' + letter.toUpperCase(), keyCode: letter.toUpperCase().charCodeAt(0)});
  tip.keydown(event); tip.keyup(event);
}
return pressed;
'''
GO = '''gBrowser.selectedBrowser.fixupAndLoadURIString(arguments[0],
  {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()});'''


class Slow(http.server.BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *args):
        pass

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path != '/':  # the favicon
            self.send_response(404)
            self.send_header('Content-Length', '0')
            self.end_headers()
            return
        query = {k: int(v[0]) for k, v in urllib.parse.parse_qs(url.query).items()}
        self.send_response(200)
        for name, value in (('Content-Type', 'text/html; charset=utf-8'), ('Transfer-Encoding', 'chunked'),
                            ('Cache-Control', 'no-store')):
            self.send_header(name, value)
        self.end_headers()

        def chunk(text):
            data = text.encode()
            self.wfile.write(b'%x\r\n%s\r\n' % (len(data), data))
            self.wfile.flush()

        chunk(HEAD)
        end = time.time() + query['load'] / 1000
        part = 0
        while time.time() < end:
            part += 1
            chunk(BUSY % (part, query['busy']))
            time.sleep((query['busy'] + query['gap']) / 1000)
        chunk('<p>done</p></body></html>')
        self.wfile.write(b'0\r\n\r\n')


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


def chrome(m, script, args=()):
    m.call('Marionette:SetContext', {'value': 'chrome'})
    try:
        return m.call('WebDriver:ExecuteScript', {'script': script, 'args': list(args)})
    finally:
        m.call('Marionette:SetContext', {'value': 'content'})


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ext_dir')
    ap.add_argument('--runs', type=int, default=3)
    ap.add_argument('--load', type=int, default=3000, help='ms the document keeps arriving')
    ap.add_argument('--busy', type=int, default=120, help='ms each of its scripts holds the main thread')
    ap.add_argument('--gap', type=int, default=60, help='ms between those scripts')
    ap.add_argument('--at', type=int, default=700, help='ms into the load when Ctrl+Space is pressed')
    ap.add_argument('--binary', default=shutil.which('librewolf') or shutil.which('firefox'))
    args = ap.parse_args()

    server = Server(('127.0.0.1', 0), Slow)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://sobrio.test:{server.server_address[1]}/?load={args.load}&busy={args.busy}&gap={args.gap}'
    port = mn.free_port()
    profile = tempfile.mkdtemp(prefix='sobrio-keylag-')
    with open(os.path.join(profile, 'user.js'), 'w') as f:
        for name, value in {'marionette.port': port, 'browser.shell.checkDefaultBrowser': False,
                            'datareporting.policy.dataSubmissionEnabled': False,
                            'network.dns.localDomains': 'sobrio.test'}.items():
            f.write(f'user_pref({json.dumps(name)}, {json.dumps(value)});\n')
    proc = subprocess.Popen([args.binary, '--headless', '--marionette', '-remote-allow-system-access', '--no-remote',
                             '--profile', profile], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    results = []
    try:
        m = mn.Marionette(port)
        m.call('WebDriver:NewSession', {'capabilities': {}})
        m.call('WebDriver:SetWindowRect', {'width': 1280, 'height': 800})
        m.call('Addon:Install', {'path': os.path.abspath(args.ext_dir), 'temporary': True})
        time.sleep(1.5)  # the background writes the shortcut's keys for the pages
        for run in range(args.runs):
            chrome(m, GO, [f'{base}&run={run}'])
            time.sleep(args.at / 1000)
            pressed = chrome(m, PRESS, ['yt'])
            time.sleep(args.load / 1000 + 1.5)
            lag = m.call('WebDriver:ExecuteScript', {'script': 'return window.lag', 'args': []})
            seen = lag['key'] if lag['key'] is not None else pressed
            result = {'pressed_at': pressed - lag['start'], 'loaded_at': lag.get('loaded', 0) - lag['start'],
                      'key_ms': seen - pressed,
                      'switcher_ms': None if lag['switcher'] is None else lag['switcher'] - seen,
                      'page_got': ''.join(lag['leaked'])}
            print(json.dumps(result), flush=True)
            results.append(result)
            chrome(m, GO, ['about:blank'])
            time.sleep(0.5)
    finally:
        proc.terminate()
        proc.wait(timeout=10)
        shutil.rmtree(profile, ignore_errors=True)
        server.shutdown()
    shown = [r['switcher_ms'] for r in results if r['switcher_ms'] is not None]
    print(json.dumps({'key_ms': round(statistics.median(r['key_ms'] for r in results)),
                      'switcher_ms': round(statistics.median(shown)) if shown else None,
                      'page_got_keys_in': sum(1 for r in results if r['page_got']), 'runs': len(results)}))


if __name__ == '__main__':
    main()
