#!/bin/sh
# Builds dist/sobrio-<version>.zip for Chrome and the same plus the home page as .xpi for
# LibreWolf/Firefox (and addons.mozilla.org).
set -eu
cd "$(dirname "$0")/.."
version=$(sed -n 's/^  "version": "\(.*\)",$/\1/p' manifest.json)
out="dist/sobrio-$version.zip"
mkdir -p dist
rm -f "$out"
# The notices travel with the code: darkreader.js is MIT and its header carries no license.
zip -q -r "$out" LICENSE THIRD_PARTY_NOTICES.md manifest.json _locales icons/icon-*.png popup.html \
  boot.js settings.js style.js darkreader.js proxy.js detector.js page.js toast.js speed.js shortcuts.js \
  background.js guard.js match.js icons.js switcher-css.js switcher.js popup.js options.html options.css options.js \
  newtab.html newtab.css newtab.js clock.js fonts.css fonts stats.js welcome.html welcome.css welcome.js
cp "$out" "dist/sobrio-$version.xpi"
# Firefox and LibreWolf open the home page on start and in new windows, not the new tab: the xpi
# makes the new tab the home page too. Only the xpi: Chrome on Windows and macOS refuses to load
# an extension whose home page is not an http(s) address, and it loads the zip or this folder.
firefox=$(mktemp -d)
trap 'rm -rf "$firefox"' EXIT
python3 -I - manifest.json "$firefox/manifest.json" <<'PY'
import json, sys
manifest = json.load(open(sys.argv[1], encoding='utf-8'))
manifest['chrome_settings_overrides'] = {'homepage': 'newtab.html'}
with open(sys.argv[2], 'w', encoding='utf-8') as f:
    f.write(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
PY
zip -q -j "dist/sobrio-$version.xpi" "$firefox/manifest.json"
echo "$out dist/sobrio-$version.xpi"
