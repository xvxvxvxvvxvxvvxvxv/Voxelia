#!/usr/bin/env python3
# Voxelia PS4 - scrive il progetto del pacchetto (formato .gp4 di LibOrbisPkg / PkgTool.Core) per la cartella
# del gioco: eboot.bin, sce_sys/ (param.sfo, icone) e data/ (zone, modelli, tabelle, musiche, carattere).
# Uso: python3 mkgp4.py CARTELLA CONTENT_ID > voxelia.gp4
import os, sys, time
from xml.sax.saxutils import quoteattr

root, cid = sys.argv[1], sys.argv[2]
files, dirs = [], set()
for d, ds, fs in os.walk(root):
    for f in sorted(fs):
        p = os.path.relpath(os.path.join(d, f), root).replace(os.sep, '/')
        if p.endswith('.gp4') or p.endswith('.pkg'):
            continue
        files.append(p)
        parts = p.split('/')[:-1]
        for i in range(len(parts)):
            dirs.add('/'.join(parts[:i + 1]))
files.sort()
ts = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(int(os.environ.get('SOURCE_DATE_EPOCH', time.time()))))
out = ['<?xml version="1.0"?>',
       '<psproject fmt="gp4" version="1000">',
       '  <volume>',
       '    <volume_type>pkg_ps4_app</volume_type>',
       '    <volume_id>PS4VOLUME</volume_id>',
       '    <volume_ts>%s</volume_ts>' % ts,
       '    <package content_id=%s passcode="00000000000000000000000000000000" storage_type="digital50" app_type="full" />' % quoteattr(cid),
       '    <chunk_info chunk_count="1" scenario_count="1">',
       '      <chunks>',
       '        <chunk id="0" layer_no="0" label="Chunk #0" />',
       '      </chunks>',
       '      <scenarios default_id="0">',
       '        <scenario id="0" type="sp" initial_chunk_count="1" label="Scenario #0">0</scenario>',
       '      </scenarios>',
       '    </chunk_info>',
       '  </volume>',
       '  <files img_no="0">']
for p in files:
    out.append('    <file targ_path=%s orig_path=%s />' % (quoteattr(p), quoteattr(p)))
out.append('  </files>')
out.append('  <rootdir>')
def tree(prefix, ind):
    for d in sorted(x for x in dirs if os.path.dirname(x) == prefix):
        name = os.path.basename(d)
        kids = [x for x in dirs if os.path.dirname(x) == d]
        if kids:
            out.append('%s<dir targ_name=%s>' % (ind, quoteattr(name)))
            tree(d, ind + '  ')
            out.append('%s</dir>' % ind)
        else:
            out.append('%s<dir targ_name=%s />' % (ind, quoteattr(name)))
tree('', '    ')
out.append('  </rootdir>')
out.append('</psproject>')
print('\n'.join(out))
