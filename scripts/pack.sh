#!/bin/sh
# Builds dist/sobrio-<version>.zip for Chrome and the same file as .xpi for LibreWolf/Firefox.
set -eu
cd "$(dirname "$0")/.."
version=$(sed -n 's/^  "version": "\(.*\)",$/\1/p' manifest.json)
out="dist/sobrio-$version.zip"
mkdir -p dist
rm -f "$out"
zip -q -r "$out" manifest.json _locales icons/icon-*.png popup.html \
  boot.js custom-css.js darkreader.js detector.js page.js \
  background.js guard.js match.js switcher-css.js switcher.js popup.js
cp "$out" "dist/sobrio-$version.xpi"
echo "$out dist/sobrio-$version.xpi"
