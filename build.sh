#!/bin/sh
# Costruisce voxelia.html unendo head.html e i sorgenti JS.
# 8.7: il changelog in inglese (CHANGELOG.md) e in italiano (CHANGELOG.it.md) vengono incorporati entrambi.
# Il changelog (CHANGELOG.md) viene incorporato nel gioco come stringa, per la finestra "Novità" del menu.
# 8.1: i sorgenti stanno in cartelle per modalità (src/base, src/storia, src/tomorrow…), ma si uniscono
#      sempre in ordine alfabetico del NOME del file, come prima: la cartella non cambia l'ordine.
#      Due file con lo stesso nome in cartelle diverse non sono ammessi.
# 7.53: alla fine controlla che lo script del gioco si possa leggere (sintassi): se no si ferma con un errore e la riga.
cd "$(dirname "$0")"
node -e "const fs=require('fs');const j=s=>JSON.stringify(s).replace(/</g,'\\\\u003c');const s=fs.readFileSync('CHANGELOG.md','utf8'),it=fs.existsSync('CHANGELOG.it.md')?fs.readFileSync('CHANGELOG.it.md','utf8'):'';fs.writeFileSync('src/9_changelog.js','/* generato da build.sh a partire da CHANGELOG.md (inglese) e CHANGELOG.it.md (italiano): non modificare a mano */\nlet CHANGELOG_MD='+j(s)+';\nconst CHANGELOG_IT='+j(it)+';\n')"
D=$(find src -name '[0-9]*_*.js' | awk -F/ '{print $NF}' | sort | uniq -d); [ -n "$D" ] && { echo "build.sh: questi file hanno lo stesso nome in due cartelle: $D"; exit 1; }
{ cat src/head.html; for f in $(find src -name '[0-9]*_*.js' | awk -F/ '{print $NF"\t"$0}' | LC_ALL=C sort | cut -f2); do cat "$f"; echo; done; echo '</script></body></html>'; } > voxelia.html
node -e "
const fs=require('fs'),vm=require('vm');const h=fs.readFileSync('voxelia.html','utf8');
const i=h.indexOf('<script>'),j=h.lastIndexOf('</script>');
if(i<0||j<i){console.error('build.sh: nella pagina non trovo lo script del gioco');process.exit(1)}
const pre=h.slice(0,i+8).split('\n').length-1;
try{new vm.Script(h.slice(i+8,j),{filename:'voxelia.html',lineOffset:pre})}catch(e){const m=String(e.stack).split('\n').slice(0,4).join('\n');console.error('build.sh: ERRORE DI SINTASSI nel gioco\n'+m);process.exit(1)}
console.log('voxelia.html costruito: '+(fs.statSync('voxelia.html').size/1048576).toFixed(2)+' MB, sintassi a posto')
" || exit 1
