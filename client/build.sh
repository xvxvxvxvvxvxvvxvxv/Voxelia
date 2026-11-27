#!/bin/sh
# Builds the Voxelia client for Windows and Linux.
# Needs: node/npm, curl, unzip, tar. Output goes to dist/release/.
set -e
cd "$(dirname "$0")"
NL=6.5.0
VER=$(node -p "require('./neutralino.config.json').version")

[ -d node_modules/@neutralinojs/neu ] || npm i --no-save --no-audit --no-fund @neutralinojs/neu@11.8.0 resedit@3 pe-library@1

if [ ! -f bin/neutralino-win_x64.exe ] || [ ! -f bin/neutralino-linux_x64 ]; then
  mkdir -p bin
  curl -fsSL -o bin/nl.zip "https://github.com/neutralinojs/neutralinojs/releases/download/v$NL/neutralinojs-v$NL.zip"
  unzip -o -q bin/nl.zip neutralino-win_x64.exe neutralino-linux_x64 -d bin
  rm bin/nl.zip
fi

rm -rf dist
npx neu build --embed-resources

OUT=dist/release; mkdir -p "$OUT"

# Windows
cp dist/voxelia/voxelia-win_x64.exe "$OUT/Voxelia.exe"
node tools/set-exe-icon.js "$OUT/Voxelia.exe" icon.ico "$VER"

# Linux
L="$OUT/Voxelia-linux-x64"; mkdir -p "$L"
cp dist/voxelia/voxelia-linux_x64 "$L/voxelia-bin"
cp linux/voxelia linux/install.sh resources/icon.png "$L/"
cp linux/README.txt "$L/README.txt"
chmod +x "$L/voxelia" "$L/voxelia-bin" "$L/install.sh"
tar -C "$OUT" -czf "$OUT/Voxelia-linux-x64.tar.gz" Voxelia-linux-x64

echo "Built client $VER:"; ls -l "$OUT"
