import sys, struct
from PIL import Image
b = open(sys.argv[1], 'rb').read(); n, lw, lh, ax, ay, sc = struct.unpack_from('<HBBbbB', b, 4); w, h = 8 << lw, 8 << lh
offs = struct.unpack_from('<%dI' % n, b, 11)
MK = {1: (220, 60, 60), 2: (170, 45, 45), 3: (130, 35, 35), 4: (240, 200, 60), 5: (190, 160, 45), 6: (140, 115, 35), 7: (80, 140, 240), 8: (62, 110, 190), 9: (45, 80, 140)}
rows = []
for vi in [int(x) for x in sys.argv[3].split(',')]:
    o = offs[vi]; pal = struct.unpack_from('<16H', b, o); P = [((v & 31) * 8, ((v >> 5) & 31) * 8, ((v >> 10) & 31) * 8) for v in pal]
    for k, c in MK.items(): P[k] = c
    nfr = 5 if vi & 1 else 15
    img = Image.new('RGB', (w * 15, h), (40, 50, 40)); px = img.load(); d = o + 32
    for f in range(nfr):
        for y in range(h):
            for x in range(w):
                v = b[d + (y * w + x) // 2]; v = (v >> 4) if x & 1 else (v & 15)
                if v: px[f * w + x, y] = P[v]
        d += w * h // 2
    rows.append(img)
out = Image.new('RGB', (w * 15, h * len(rows))); [out.paste(r, (0, i * h)) for i, r in enumerate(rows)]
out.resize((out.width * 4, out.height * 4), Image.NEAREST).save(sys.argv[2])
