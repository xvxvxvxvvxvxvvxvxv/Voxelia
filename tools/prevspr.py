# anteprima di spr.pak: i primi modelli, tutte le direzioni, ingranditi
import sys, struct
from PIL import Image
b = open(sys.argv[1], 'rb').read(); n, = struct.unpack_from('<H', b, 4); offs = struct.unpack_from('<%dI' % n, b, 6)
rows = []
for mi in [int(x) for x in sys.argv[3].split(',')]:
    o = offs[mi]
    if not o: continue
    lw, lh, nfr, fpd, ax, ay, sc, _ = struct.unpack_from('<BBBBbbBB', b, o); w, h = 8 << lw, 8 << lh
    pal = struct.unpack_from('<16H', b, o + 8); P = [((v & 31) * 8, ((v >> 5) & 31) * 8, ((v >> 10) & 31) * 8) for v in pal]
    img = Image.new('RGB', (w * nfr, h), (40, 50, 40)); px = img.load(); d = o + 40
    for f in range(nfr):
        for y in range(h):
            for x in range(w):
                v = b[d + (y * w + x) // 2]; v = (v >> 4) if x & 1 else (v & 15)
                if v: px[f * w + x, y] = P[v]
        d += w * h // 2
    rows.append(img)
W = max(r.width for r in rows); H = sum(r.height for r in rows)
out = Image.new('RGB', (W, H), (20, 20, 20)); y = 0
for r in rows: out.paste(r, (0, y)); y += r.height
out.resize((out.width * 3, out.height * 3), Image.NEAREST).save(sys.argv[2])
