#!/bin/sh
# Voxelia PS4 - scrive il progetto del pacchetto (formato .gp4 di LibOrbisPkg / PkgTool.Core) per la cartella del
# gioco: eboot.bin, sce_sys/ (param.sfo, icone) e data/ (zone, modelli, tabelle, musiche, carattere).
# Solo sh e find, così gira anche nell'immagine Docker di OpenOrbis.
# Uso: sh mkgp4.sh CARTELLA CONTENT_ID > voxelia.gp4
set -e
ROOT="$1"; CID="$2"
cd "$ROOT"
TS=$(date -u '+%Y-%m-%d %H:%M:%S')
cat <<XML
<?xml version="1.0"?>
<psproject fmt="gp4" version="1000">
  <volume>
    <volume_type>pkg_ps4_app</volume_type>
    <volume_id>PS4VOLUME</volume_id>
    <volume_ts>$TS</volume_ts>
    <package content_id="$CID" passcode="00000000000000000000000000000000" storage_type="digital50" app_type="full" />
    <chunk_info chunk_count="1" scenario_count="1">
      <chunks>
        <chunk id="0" layer_no="0" label="Chunk #0" />
      </chunks>
      <scenarios default_id="0">
        <scenario id="0" type="sp" initial_chunk_count="1" label="Scenario #0">0</scenario>
      </scenarios>
    </chunk_info>
  </volume>
  <files img_no="0">
XML
find . -type f ! -name '*.gp4' ! -name '*.pkg' | sed 's|^\./||' | LC_ALL=C sort | while read -r f; do
	echo "    <file targ_path=\"$f\" orig_path=\"$f\" />"
done
echo "  </files>"
echo "  <rootdir>"
# le cartelle (in questo pacchetto sono tutte al primo livello: data e sce_sys)
find . -mindepth 1 -maxdepth 1 -type d | sed 's|^\./||' | LC_ALL=C sort | while read -r d; do
	echo "    <dir targ_name=\"$d\" />"
done
echo "  </rootdir>"
echo "</psproject>"
