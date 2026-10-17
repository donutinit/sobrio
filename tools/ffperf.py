#!/usr/bin/env python3
"""What sobrio costs a page in headless Firefox: CPU time of the content processes while it loads,
with the extension and with none, first and second visit.

    python3 -I tools/ffperf.py . https://github.com/torvalds/linux --runs 3

Firefox has no per-page counters like Chromium's, so this sums ChromeUtils.requestProcInfo()'s
cpuTime over the web content processes across --wait seconds after each navigation: every thread
(Stylo restyles in parallel), not only the main one. Medians as JSON, one line per URL and side.
Reuses tools/marionette.py, so only the stdlib is used.
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

CPU = '''return (async () => {
  const info = await ChromeUtils.requestProcInfo();
  return info.children.filter((p) => p.type.startsWith('web')).reduce((ms, p) => ms + p.cpuTime / 1e6, 0);
})()'''


def measure(ext_dir, url, binary, wait):
    port = mn.free_port()
    profile = tempfile.mkdtemp(prefix='sobrio-ffperf-')
    with open(os.path.join(profile, 'user.js'), 'w') as f:
        for name, value in {'marionette.port': port, 'browser.shell.checkDefaultBrowser': False,
                            'datareporting.policy.dataSubmissionEnabled': False}.items():
            f.write(f'user_pref({json.dumps(name)}, {json.dumps(value)});\n')
    proc = subprocess.Popen([binary, '--headless', '--marionette', '-remote-allow-system-access', '--no-remote',
                             '--profile', profile], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        m = mn.Marionette(port)
        m.call('WebDriver:NewSession', {'capabilities': {'pageLoadStrategy': 'none'}})
        m.call('WebDriver:SetWindowRect', {'width': 1280, 'height': 800})
        if ext_dir:
            m.call('Addon:Install', {'path': os.path.abspath(ext_dir), 'temporary': True})
        time.sleep(2)
        visits = []
        for _ in range(2):
            before = m.run(CPU, 'chrome')
            m.call('WebDriver:Navigate', {'url': url})
            time.sleep(wait)
            visits.append(m.run(CPU, 'chrome') - before)
            m.call('WebDriver:Navigate', {'url': 'about:blank'})
            time.sleep(1.5)
        return visits
    finally:
        proc.terminate()
        proc.wait(timeout=10)
        shutil.rmtree(profile, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ext_dir')
    ap.add_argument('urls', nargs='+')
    ap.add_argument('--runs', type=int, default=3)
    ap.add_argument('--wait', type=float, default=10, help='seconds for each visit')
    ap.add_argument('--binary', default=shutil.which('librewolf') or shutil.which('firefox'))
    args = ap.parse_args()
    for url in args.urls:
        for side, ext in (('without', None), ('sobrio', args.ext_dir)):
            runs = [measure(ext, url, args.binary, args.wait) for _ in range(args.runs)]
            print(json.dumps({'url': url, 'side': side, 'first_ms': round(statistics.median(r[0] for r in runs)),
                              'second_ms': round(statistics.median(r[1] for r in runs))}), flush=True)


if __name__ == '__main__':
    main()
