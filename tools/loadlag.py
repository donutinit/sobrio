#!/usr/bin/env python3
"""How long a page keeps a key waiting while it loads, with sobrio and without it, in headless
Firefox.

    python3 -I tools/loadlag.py . https://github.com/torvalds/linux --binary ~/.cache/sobrio-firefox/firefox/firefox

For each URL and side, a fresh profile loads the page once (caches, and what sobrio learns of the
site) and then --visits more times. During each of those a key the page has no use for (F15) is
pressed every 25 ms for --secs seconds, from the browser's own process, as a keyboard does; a tiny
second extension notes how late each one reached the page. Prints the medians as JSON, one line
per URL and side: first_ms, when the page got its first key after the navigation started; max_ms
and p95_ms, the longest waits; over100_ms, how much of the load a key would have waited more than
100 ms. What Dark Reader does to a heavy page shows here: in one go it held GitHub for a second.
--pref name=json sets a preference (ui.systemUsesDarkTheme=1 for sites with a dark theme of their
own). Reuses tools/marionette.py, so only the stdlib is used.
"""
import argparse
import importlib.util
import json
import os
import shutil
import statistics
import subprocess
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('marionette', os.path.join(HERE, 'marionette.py'))
mn = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mn)

# The probe: each F15 with when it was sent (the event's own time) and how late it got here.
PROBE = '''
const waits = [];
addEventListener('keydown', (e) => {
  if (!e.isTrusted || e.key !== 'F15') return;
  waits.push([Math.round(e.timeStamp), Math.round(performance.now() - e.timeStamp)]);
  document.documentElement.dataset.loadlag = JSON.stringify(waits);
}, true);
'''
PROBE_MANIFEST = {
    'manifest_version': 3, 'name': 'loadlag probe', 'version': '1',
    'browser_specific_settings': {'gecko': {'id': 'loadlag-probe@donutinit'}},
    'content_scripts': [{'matches': ['<all_urls>'], 'js': ['probe.js'], 'run_at': 'document_start'}],
}
PRESS = '''
const [ms] = arguments;
const tip = Cc["@mozilla.org/text-input-processor;1"].createInstance(Ci.nsITextInputProcessor);
tip.beginInputTransactionForTests(window);
const end = Date.now() + ms;
return new Promise((resolve) => {
  const timer = setInterval(() => {
    const event = new KeyboardEvent('', {key: 'F15', code: 'F15', keyCode: KeyboardEvent.DOM_VK_F15});
    tip.keydown(event);
    tip.keyup(event);
    if (Date.now() > end) {
      clearInterval(timer);
      resolve(1);
    }
  }, 25);
});
'''
GO = '''gBrowser.selectedBrowser.fixupAndLoadURIString(arguments[0],
  {triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()});'''


def chrome(m, script, args=()):
    m.call('Marionette:SetContext', {'value': 'chrome'})
    try:
        return m.call('WebDriver:ExecuteScript', {'script': script, 'args': list(args)})
    finally:
        m.call('Marionette:SetContext', {'value': 'content'})


def visits(ext_dir, probe, url, binary, secs, count, prefs):
    port = mn.free_port()
    profile = tempfile.mkdtemp(prefix='sobrio-loadlag-')
    # The timer of a page is cut to 1 ms steps by default: the waits are read in whole ms anyway.
    with open(os.path.join(profile, 'user.js'), 'w') as f:
        for name, value in {'marionette.port': port, 'browser.shell.checkDefaultBrowser': False,
                            'datareporting.policy.dataSubmissionEnabled': False, **prefs}.items():
            f.write(f'user_pref({json.dumps(name)}, {json.dumps(value)});\n')
    proc = subprocess.Popen([binary, '--headless', '--marionette', '-remote-allow-system-access', '--no-remote',
                             '--profile', profile], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        m = mn.Marionette(port)
        m.call('WebDriver:NewSession', {'capabilities': {}})
        m.call('WebDriver:SetWindowRect', {'width': 1280, 'height': 800})
        m.call('Addon:Install', {'path': probe, 'temporary': True})
        if ext_dir:
            m.call('Addon:Install', {'path': os.path.abspath(ext_dir), 'temporary': True})
        time.sleep(1.5)
        chrome(m, GO, [url])
        time.sleep(secs + 2)
        results = []
        for _ in range(count):
            chrome(m, GO, ['about:blank'])
            time.sleep(1)
            chrome(m, GO, [url])
            chrome(m, PRESS, [int(secs * 1000)])
            time.sleep(0.5)
            try:
                waits = json.loads(m.call('WebDriver:ExecuteScript', {
                    'script': 'return document.documentElement.dataset.loadlag || "[]"', 'args': []}))
            except RuntimeError:
                waits = []
            if waits:
                late = sorted(wait for _, wait in waits)
                results.append({'first_ms': waits[0][0] + waits[0][1], 'max_ms': late[-1],
                                'p95_ms': late[max(0, int(len(late) * 0.95) - 1)],
                                'over100_ms': 25 * sum(1 for wait in late if wait > 100)})
        return results
    finally:
        proc.terminate()
        proc.wait(timeout=10)
        shutil.rmtree(profile, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ext_dir')
    ap.add_argument('urls', nargs='+')
    ap.add_argument('--runs', type=int, default=2, help='fresh profiles per URL and side')
    ap.add_argument('--visits', type=int, default=2, help='measured visits in each profile, after the first')
    ap.add_argument('--secs', type=float, default=6, help='seconds of keys for each visit')
    ap.add_argument('--pref', action='append', default=[], help='name=json value')
    ap.add_argument('--binary', default=shutil.which('librewolf') or shutil.which('firefox'))
    args = ap.parse_args()
    prefs = {}
    for pref in args.pref:
        name, _, value = pref.partition('=')
        prefs[name] = json.loads(value)
    probe = tempfile.mkdtemp(prefix='sobrio-loadlag-probe-')
    with open(os.path.join(probe, 'manifest.json'), 'w') as f:
        json.dump(PROBE_MANIFEST, f)
    with open(os.path.join(probe, 'probe.js'), 'w') as f:
        f.write(PROBE)
    try:
        for url in args.urls:
            for side, ext in (('without', None), ('sobrio', args.ext_dir)):
                results = [r for _ in range(args.runs)
                           for r in visits(ext, probe, url, args.binary, args.secs, args.visits, prefs)]
                if not results:
                    print(json.dumps({'url': url, 'side': side, 'error': 'no key reached the page'}), flush=True)
                    continue
                medians = {key: round(statistics.median(r[key] for r in results)) for key in results[0]}
                print(json.dumps({'url': url, 'side': side, **medians,
                                  'max_all': [r['max_ms'] for r in results]}), flush=True)
    finally:
        shutil.rmtree(probe, ignore_errors=True)


if __name__ == '__main__':
    main()
