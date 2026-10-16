#!/usr/bin/env python3
"""What sobrio costs a page's main thread, against the same page without it, in headless Chromium.

    python3 -I tools/perf.py . https://github.com/torvalds/linux --runs 3

For each URL, a fresh profile loads the page with the extension and with an empty one, waits
--wait seconds and reads the renderer's counters (CPU time of its main thread): the load, then
--idle seconds of the page sitting still. Prints the medians as JSON, one line per URL and side.
Reuses the DevTools pipe of tools/cdp.py, so only the stdlib is used.
"""
import argparse
import importlib.util
import json
import os
import shutil
import statistics
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('cdp', os.path.join(HERE, 'cdp.py'))
cdp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cdp)

COUNTERS = ('TaskDuration', 'ScriptDuration', 'RecalcStyleDuration', 'LayoutDuration')


def counters(pipe, session):
    values = {m['name']: m['value'] for m in pipe.call('Performance.getMetrics', {}, session)['metrics']}
    return {name: values.get(name, 0) * 1000 for name in COUNTERS}


def measure(ext_dir, url, binary, wait, idle):
    profile = tempfile.mkdtemp(prefix='sobrio-perf-')
    pipe = cdp.Pipe(binary, profile, ['--host-resolver-rules=MAP sobrio.test 127.0.0.1'])
    try:
        pipe.call('Extensions.loadUnpacked', {'path': os.path.abspath(ext_dir)})
        time.sleep(1)
        target = pipe.call('Target.createTarget', {'url': 'about:blank'})['targetId']
        session = pipe.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
        pipe.call('Performance.enable', {'timeDomain': 'threadTicks'}, session)
        start = counters(pipe, session)
        pipe.call('Page.navigate', {'url': url}, session)
        time.sleep(wait)
        loaded = counters(pipe, session)
        time.sleep(idle)
        still = counters(pipe, session)
        result = {f'load.{name}': loaded[name] - start[name] for name in COUNTERS}
        result.update({f'idle.{name}': still[name] - loaded[name] for name in COUNTERS})
        return result
    finally:
        pipe.proc.terminate()
        pipe.proc.wait(timeout=10)
        shutil.rmtree(profile, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ext_dir')
    ap.add_argument('urls', nargs='+')
    ap.add_argument('--runs', type=int, default=3)
    ap.add_argument('--wait', type=float, default=8, help='seconds for the load')
    ap.add_argument('--idle', type=float, default=5, help='seconds of the page sitting still')
    ap.add_argument('--binary', default=shutil.which('chromium-browser') or shutil.which('chromium'))
    args = ap.parse_args()
    empty = tempfile.mkdtemp(prefix='sobrio-empty-')
    with open(os.path.join(empty, 'manifest.json'), 'w') as f:
        json.dump({'manifest_version': 3, 'name': 'empty', 'version': '1'}, f)
    try:
        for url in args.urls:
            for side, ext in (('without', empty), ('sobrio', args.ext_dir)):
                runs = [measure(ext, url, args.binary, args.wait, args.idle) for _ in range(args.runs)]
                medians = {key: round(statistics.median(run[key] for run in runs)) for key in runs[0]}
                print(json.dumps({'url': url, 'side': side, 'ms': medians}))
    finally:
        shutil.rmtree(empty, ignore_errors=True)


if __name__ == '__main__':
    main()
