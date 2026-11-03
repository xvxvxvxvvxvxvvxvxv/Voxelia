# Lettori dei file del port 3DS (romfs): models.bin, hero.bin, z_*.bin
import struct
def _box(b, o):
    x, y, z, h, w, d = struct.unpack_from('<hhhhHH', b, o)
    r, g, bl, f, a, fl, tile = struct.unpack_from('<BBBBBBH', b, o + 12)
    return dict(x=x / 256, y=y / 256, z=z / 8, h=h / 8, w=w / 256, d=d / 256, c=(r, g, bl), f=f / 100, a=a, fl=fl, tile=tile)
def models(path):
    b = open(path, 'rb').read(); assert b[:4] == b'VXM1'
    n, = struct.unpack_from('<H', b, 4); o = 6; M = []
    for _ in range(n):
        nf, fpd = b[o], b[o + 1]; o += 2; fr = []
        for _ in range(nf):
            k, = struct.unpack_from('<H', b, o); o += 2
            fr.append([_box(b, o + 20 * i) for i in range(k)]); o += 20 * k
        M.append(dict(fpd=fpd, frames=fr))
    return M
def hero(path):
    b = open(path, 'rb').read(); assert b[:4] == b'VXH1'
    n, = struct.unpack_from('<H', b, 4); o = 6; H = []
    for _ in range(n):
        k = b[o]; o += 1
        H.append([_box(b, o + 20 * i) for i in range(k)]); o += 20 * k
    return H
