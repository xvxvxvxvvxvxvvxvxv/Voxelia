#!/bin/sh
# Costruisce voxelia.html unendo head.html e i sorgenti JS.
# Il changelog (CHANGELOG.md) viene incorporato nel gioco come stringa, per la finestra "Novità" del menu.
cd "$(dirname "$0")"
node -e "const fs=require('fs');const s=fs.readFileSync('CHANGELOG.md','utf8');fs.writeFileSync('src/9_changelog.js','/* generato da build.sh a partire da CHANGELOG.md: non modificare a mano */\nconst CHANGELOG_MD='+JSON.stringify(s).replace(/</g,'\\\\u003c')+';\n')"
{ cat src/head.html; for f in $(LC_ALL=C ls src/[0-9]*_*.js); do cat "$f"; echo; done; echo '</script></body></html>'; } > voxelia.html
