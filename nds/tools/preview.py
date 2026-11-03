# anteprima isometrica di una zona .dsz (come la disegnerà il DS)
import sys, struct
from PIL import Image, ImageDraw
b = open(sys.argv[1], 'rb').read(); n, nl = struct.unpack_from('<HH', b, 4); o = 8 + 2 * n * n
recs = [struct.unpack_from('<HbBBBBBHH', b, o + 12 * i) for i in range(n * n)]
def c5(v, f=1.0): return tuple(min(255, int(((v >> s) & 31) * 255 / 31 * f)) for s in (0, 5, 10))
S = 16; W = n * S * 2 + 40; H = n * S + 400
img = Image.new('RGB', (W, H), (20, 24, 32)); d = ImageDraw.Draw(img)
def P(x, y, z): return (W / 2 + S * (x - y), 300 + S / 2 * (x + y) - z * S / 64)
for s in range(2 * n):
    for y in range(n):
        x = s - y
        if x < 0 or x >= n: continue
        fc, fz, fl, a, bb, z0, z1, tc, sc = recs[y * n + x]
        fz *= 2
        d.polygon([P(x, y, fz), P(x + 1, y, fz), P(x + 1, y + 1, fz), P(x, y + 1, fz)], fill=c5(fc))
        if fl & 1:
            x0, y0 = x + (a & 15) / 16, y + (a >> 4) / 16; x1, y1 = x + ((bb & 15) + 1) / 16, y + ((bb >> 4) + 1) / 16
            Z0, Z1 = z0 * 2, z1 * 2
            d.polygon([P(x0, y1, Z1), P(x1, y1, Z1), P(x1, y1, Z0), P(x0, y1, Z0)], fill=c5(sc, .78))
            d.polygon([P(x1, y0, Z1), P(x1, y1, Z1), P(x1, y1, Z0), P(x1, y0, Z0)], fill=c5(sc, .58))
            d.polygon([P(x0, y0, Z1), P(x1, y0, Z1), P(x1, y1, Z1), P(x0, y1, Z1)], fill=c5(tc))
img.save(sys.argv[2])
