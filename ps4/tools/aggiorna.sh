#!/bin/sh
# Voxelia PS4 - riesporta i dati dalla versione browser (voxelia.html del branch main) in ../data:
# zone, modelli, tabelle (export.js), musiche (songs.js) e il carattere (mkfont.py).
# Uso: VOXELIA_HTML=/percorso/di/voxelia.html ./aggiorna.sh
set -e
cd "$(dirname "$0")"
[ -n "$VOXELIA_HTML" ] || { echo "Imposta VOXELIA_HTML (voxelia.html della versione browser)"; exit 1; }
[ -d node_modules ] || npm install
node --max-old-space-size=8000 export.js ../data
node songs.js ../data/music.json
python3 mkfont.py ../data/font.bin
