#!/bin/sh
# Builds dist/sobrio-<version>.zip for Chrome and the same file as .xpi for LibreWolf/Firefox.
set -eu
cd "$(dirname "$0")/.."
version=$(sed -n 's/^  "version": "\(.*\)",$/\1/p' manifest.json)
out="dist/sobrio-$version.zip"
mkdir -p dist
rm -f "$out"
# The notices travel with the code: darkreader.js is MIT and its header carries no license.
zip -q -r "$out" LICENSE THIRD_PARTY_NOTICES.md manifest.json _locales icons/icon-*.png popup.html \
  boot.js settings.js style.js darkreader.js detector.js page.js \
  background.js guard.js match.js switcher-css.js switcher.js popup.js options.html options.css options.js \
  newtab.html newtab.css newtab.js clock.js fonts.css fonts
cp "$out" "dist/sobrio-$version.xpi"
echo "$out dist/sobrio-$version.xpi"
