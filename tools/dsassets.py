#!/usr/bin/env python3
# Voxelia DS - prepara i dati per la cartella nitro/ partendo da quelli del port 3DS (romfs/):
#  - z_<zona>.dsz: ogni casella diventa un pavimento e al massimo un blocco (il DS disegna ~2000 poligoni per
#    fotogramma, il 3DS decine di migliaia di voxel);
#  - spr.pak: i modelli animati di nemici e personaggi diventano sprite a 16 colori, in 5 direzioni (le altre
#    3 sono le stesse immagini specchiate), con lo stesso z-buffer e le stesse ombre del renderer 3DS;
#  - hero.pak: l'eroe con corazza, elmo, scudo e arma; i colori dell'equipaggiamento restano nella tavolozza
#    (indici 1-9) e il gioco li cambia con la rarità.
# Uso: python3 dsassets.py ../../voxelia3ds/romfs ../nitro
import sys, os, struct, json, shutil, glob, math
import numpy as np
from PIL import Image, ImageDraw
import vxbin

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
K = 0.5                 # scala del DS: una casella è larga 32 pixel (64 sul 3DS a scala 1)
SS = 2                  # sovracampionamento del rasterizzatore
FACINGS = [0, 1, 2, 3, 7]   # le direzioni 4, 5, 6 sono 2, 1, 0 specchiate

def rgb555(c):
    r, g, b = c
    return (r >> 3) | ((g >> 3) << 5) | ((b >> 3) << 10)

def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)

# ---------------------------------------------------------------------------------------------------------------
# rasterizzazione dei box (stesse facce e ombre di render.c del 3DS)
def box_faces(q, ox=0.0, oy=0.0):
    """facce visibili [(punti3d, ombra)] di un box; ox, oy = origine per i box girati di 45 gradi"""
    x, y, z, w, d, h = q['x'], q['y'], q['z'], q['w'], q['d'], q['h']
    T = z + h
    F = []
    if q['fl'] & 2:
        k = 0.70710678
        U = [x, x + w, x + w, x]; V = [y, y, y + d, y + d]
        QX = [ox + U[i] * k - V[i] * k for i in range(4)]; QY = [oy + U[i] * k + V[i] * k for i in range(4)]
        if h > 0:
            for i in range(4):
                j = (i + 1) & 3
                nx, ny = QY[j] - QY[i], QX[i] - QX[j]
                if nx + ny <= 1e-6: continue
                l = nx * nx + ny * ny or 1
                sf = (.58 * nx * max(0, nx) + .78 * ny * max(0, ny)) / l + .68 * (min(0, nx) ** 2 + min(0, ny) ** 2) / l
                F.append(([(QX[i], QY[i], T), (QX[j], QY[j], T), (QX[j], QY[j], z), (QX[i], QY[i], z)], sf))
        F.append(([(QX[i], QY[i], T) for i in range(4)], 1.0))
    else:
        x += ox; y += oy
        if h > 0:
            F.append(([(x, y + d, T), (x + w, y + d, T), (x + w, y + d, z), (x, y + d, z)], .78))
            F.append(([(x + w, y, T), (x + w, y + d, T), (x + w, y + d, z), (x + w, y, z)], .58))
        F.append(([(x, y, T), (x + w, y, T), (x + w, y + d, T), (x, y + d, T)], 1.0))
    return F

def proj(p, sc):
    x, y, z = p
    return (sc * 32 * (x - y), sc * 16 * (x + y) - sc * z, 16 * (x + y) + .5 * z)

class Canvas:
    def __init__(self, w, h, ax, ay, sc):
        self.w, self.h, self.ax, self.ay, self.sc = w, h, ax, ay, sc
        self.W, self.H = w * SS, h * SS
        self.zb = np.full((self.H, self.W), -1e9, np.float32)
        self.col = np.zeros((self.H, self.W), np.int32)   # 0 = vuoto, altrimenti chiave colore + 1
    def face(self, pts, key):
        P = [proj(p, self.sc) for p in pts]
        S = [((a + self.ax) * SS, (b + self.ay) * SS) for a, b, _ in P]
        x0 = max(0, int(math.floor(min(s[0] for s in S)))); x1 = min(self.W, int(math.ceil(max(s[0] for s in S))) + 1)
        y0 = max(0, int(math.floor(min(s[1] for s in S)))); y1 = min(self.H, int(math.ceil(max(s[1] for s in S))) + 1)
        if x1 <= x0 or y1 <= y0: return
        m = Image.new('1', (x1 - x0, y1 - y0), 0)
        ImageDraw.Draw(m).polygon([(s[0] - x0, s[1] - y0) for s in S], fill=1)
        mask = np.array(m, bool)
        if not mask.any(): return
        # profondità: piano per tre vertici (proiezione ortografica, quindi lineare sullo schermo)
        (ax_, ay_), (bx, by), (cx, cy) = S[0], S[1], S[2]
        da, db, dc = P[0][2], P[1][2], P[2][2]
        det = (bx - ax_) * (cy - ay_) - (cx - ax_) * (by - ay_)
        yy, xx = np.mgrid[y0:y1, x0:x1]
        if abs(det) < 1e-6:
            dep = np.full(mask.shape, max(da, db, dc), np.float32)
        else:
            u = ((xx - ax_) * (cy - ay_) - (cx - ax_) * (yy - ay_)) / det
            v = ((bx - ax_) * (yy - ay_) - (xx - ax_) * (by - ay_)) / det
            dep = (da + u * (db - da) + v * (dc - da)).astype(np.float32)
        zb = self.zb[y0:y1, x0:x1]; cb = self.col[y0:y1, x0:x1]
        win = mask & (dep >= zb - 1e-4)
        zb[win] = dep[win]; cb[win] = key
    def result(self):
        # da 2x2 a un pixel: il colore più frequente tra quelli coperti, vuoto se ne è coperta meno di metà
        c = self.col.reshape(self.h, SS, self.w, SS).transpose(0, 2, 1, 3).reshape(self.h, self.w, SS * SS)
        nz = (c > 0).sum(2)
        cnt = np.zeros(c.shape, np.int32)
        for i in range(SS * SS):
            cnt[..., i] = ((c == c[..., i:i + 1]) & (c[..., i:i + 1] > 0)).sum(2)
        best = np.take_along_axis(c, cnt.argmax(2)[..., None], 2)[..., 0]
        return np.where(nz * 2 >= SS * SS, best, 0).astype(np.int32)

# ---------------------------------------------------------------------------------------------------------------
def extents(frames, sc):
    xs, ys = [], []
    for fr in frames:
        for q in fr:
            for pts, _ in box_faces(q):
                for p in pts:
                    a, b, _ = proj(p, sc); xs.append(a); ys.append(b)
    if not xs: return (-4, 4, -4, 4)
    return min(xs), max(xs), min(ys), max(ys)

def pow2(n):
    for v in (8, 16, 32, 64, 128):
        if n <= v: return v
    return 128

def plan(frames):
    """misura della texture, origine (piedi) e scala: i modelli troppo grandi si rimpiccioliscono e il gioco li ingrandisce"""
    sc = K
    x0, x1, y0, y1 = extents(frames, sc)
    big = max(x1 - x0, y1 - y0)
    if big > 62:
        sc = K * 62 / big
        x0, x1, y0, y1 = extents(frames, sc)
    w = pow2(int(math.ceil(max(-x0, x1) * 2)) + 2)
    h = pow2(int(math.ceil(y1 - y0)) + 2)
    ax = w // 2; ay = int(math.ceil(-y0)) + 1
    return w, h, ax, ay, sc

def mirror_pts(pts):
    return [(y, x, z) for x, y, z in pts]

def render_frame(boxes, w, h, ax, ay, sc, colkey, mirror=False):
    cv = Canvas(w, h, ax, ay, sc)
    for q in boxes:
        if q['a'] < 100: continue
        for pts, sf in box_faces(q):
            if mirror: pts = mirror_pts(pts)
            cv.face(pts, colkey(q, sf))
    return cv.result()

def quantize(imgs, ncol, cols):
    """imgs: matrici di chiavi colore; cols: chiave -> rgb. Restituisce (tavolozza di ncol colori, mappa chiave->indice 1..)"""
    used = {}
    for im in imgs:
        u, c = np.unique(im[im > 0], return_counts=True)
        for k, n in zip(u, c): used[int(k)] = used.get(int(k), 0) + int(n)
    keys = list(used)
    if not keys: return [], {}
    if len(keys) <= ncol:
        pal = [cols[k] for k in keys]; return pal, {k: i + 1 for i, k in enumerate(keys)}
    # median cut pesato con PIL
    arr = np.array([cols[k] for k in keys], np.uint8)
    reps = np.repeat(arr, [max(1, min(64, used[k])) for k in keys], axis=0)
    img = Image.fromarray(reps.reshape(1, -1, 3), 'RGB').quantize(colors=ncol, method=Image.Quantize.MEDIANCUT)
    p = img.getpalette()[:ncol * 3]
    pal = [tuple(p[i * 3:i * 3 + 3]) for i in range(ncol)]
    P = np.array(pal, np.int32)
    mp = {}
    for k in keys:
        c = np.array(cols[k], np.int32); mp[k] = int(np.argmin(((P - c) ** 2).sum(1))) + 1
    return pal, mp

def pack4(idx, w, h):
    a = idx.astype(np.uint8).reshape(h, w)
    lo, hi = a[:, 0::2], a[:, 1::2]
    return (lo | (hi << 4)).astype(np.uint8).tobytes()

def logsz(v): return {8: 0, 16: 1, 32: 2, 64: 3, 128: 4}[v]

# ---------------------------------------------------------------------------------------------------------------
def build_models():
    M = vxbin.models(os.path.join(SRC, 'models.bin'))
    entries = []
    LIM = int(os.environ.get('LIM', '0')) or len(M)
    for mi, m in enumerate(M[:LIM]):
        fpd = m['fpd']; fr = m['frames']
        if not fr or not any(fr):
            entries.append(None); continue
        sel = []   # per ogni direzione del DS, i fotogrammi del 3DS
        for f in FACINGS:
            for j in range(fpd): sel.append(fr[min(len(fr) - 1, f * fpd + j)])
        w, h, ax, ay, sc = plan(sel)
        cols = {}
        def ck(q, sf):
            c = shade(q['c'], sf * q['f'])
            k = (c[0] << 16) | (c[1] << 8) | c[2]
            cols[k + 1] = c
            return k + 1
        imgs = [render_frame(b, w, h, ax, ay, sc, ck) for b in sel]
        pal, mp = quantize(imgs, 15, cols)
        data = b''
        for im in imgs:
            idx = np.zeros_like(im)
            for k, v in mp.items(): idx[im == k] = v
            data += pack4(idx, w, h)
        pal16 = [0] + [rgb555(c) for c in pal] + [0] * (15 - len(pal))
        hd = struct.pack('<BBBBbbBB', logsz(w), logsz(h), len(sel), fpd, ax - w // 2, ay, int(round(sc / K * 100)), 0)
        entries.append(hd + struct.pack('<16H', *pal16) + data)
        if mi % 20 == 0: print('modello', mi, '/', len(M), w, 'x', h, flush=True)
    with open(os.path.join(OUT, 'spr.pak'), 'wb') as f:
        f.write(b'VXS1' + struct.pack('<H', len(entries)))
        off = 6 + 4 * len(entries); offs = []
        for e in entries: offs.append(off if e else 0); off += len(e) if e else 0
        f.write(struct.pack('<%dI' % len(offs), *offs))
        for e in entries:
            if e: f.write(e)
    print('spr.pak', os.path.getsize(os.path.join(OUT, 'spr.pak')))

# ---------------------------------------------------------------------------------------------------------------
# eroe: corazza (4 tipi o niente), elmo (sì/no), scudo (sì/no), arma (8 tipi), colpo (sì/no)
MARK = {1: 1, 3: 4, 2: 7, 4: 7}     # segnaposto del 3DS (#fe0100 corazza, #fe0200 elmo, #fe0300 arma, #fe0400 scudo) -> indice base
def hero_pose(boxes, fc, walk):
    rot = (fc >> 1) & 3; odd = fc & 1; out = []
    la = 2.6 if walk == 1 else 0; lb = 2.6 if walk == 2 else 0
    for q in boxes:
        x, y, z, bw, bd, bh = q['x'], q['y'], q['z'], q['w'], q['d'], q['h']
        if walk and z < .5 and bh > 3:
            lift = la if x + bw / 2 < 0 else lb; z += lift; bh = max(1, bh - lift)
        for _ in range(rot):
            x, y, bw, bd = -(y + bd), x, bd, bw
        out.append(dict(q, x=x, y=y, z=z, w=bw, d=bd, h=bh, fl=2 if odd else 0))
    return out

def build_hero():
    H = vxbin.hero(os.path.join(SRC, 'hero.bin'))
    variants = []
    for ci in range(4):
        for hp in range(2):
            for sp in range(2):
                for tw in range(8):
                    for sw in range(2):
                        hi = 1 if hp else 0; si = 1 if sp else 0
                        idx = ((((ci * 5 + hi) * 4 + si) * 8 + tw) * 2 + sw)
                        variants.append((H[idx], sw))
    # una sola misura per tutte le varianti
    allp = []
    for boxes, sw in variants[::7]:
        for f in FACINGS: allp.append(hero_pose(boxes, f, 1))
    w, h, ax, ay, sc = plan(allp)
    entries = []
    for vi, (boxes, sw) in enumerate(variants):
        cols = {}
        def ck(q, sf):
            r, g, b = q['c']
            if r == 0xfe and b == 0 and 1 <= g <= 4:
                return 1000 + MARK[g] + (0 if sf > .9 else 1 if sf > .68 else 2)
            c = shade(q['c'], sf * q['f'])
            k = (c[0] << 16) | (c[1] << 8) | c[2]
            cols[k + 2000] = c
            return k + 2000
        frames = []
        for f in FACINGS:
            for walk in ((0,) if sw else (0, 1, 2)):
                frames.append(render_frame(hero_pose(boxes, f, walk), w, h, ax, ay, sc, ck))
        body = [np.where(im >= 2000, im, 0) for im in frames]
        pal, mp = quantize(body, 6, cols)
        data = b''
        for im in frames:
            idx = np.zeros_like(im)
            mk = (im > 1000) & (im < 2000); idx[mk] = im[mk] - 1000
            for k, v in mp.items(): idx[im == k] = v + 9
            data += pack4(idx, w, h)
        pal16 = [0] * 10 + [rgb555(c) for c in pal] + [0] * (6 - len(pal))
        entries.append(struct.pack('<16H', *pal16) + data)
        if vi % 32 == 0: print('eroe', vi, '/', len(variants), flush=True)
    with open(os.path.join(OUT, 'hero.pak'), 'wb') as f:
        f.write(b'VXE1' + struct.pack('<HBBbbB', len(entries), logsz(w), logsz(h), ax - w // 2, ay, int(round(sc / K * 100))))
        off = 6 + 5 + 4 * len(entries); offs = []
        for e in entries: offs.append(off); off += len(e)
        f.write(struct.pack('<%dI' % len(offs), *offs))
        for e in entries: f.write(e)
    print('hero.pak', os.path.getsize(os.path.join(OUT, 'hero.pak')), w, 'x', h)

# ---------------------------------------------------------------------------------------------------------------
# zone: per ogni casella un pavimento e al massimo un blocco
def build_zone(path):
    b = open(path, 'rb').read(); assert b[:4] == b'VXZ1'
    n, nb, nl = struct.unpack_from('<HHH', b, 4)
    o = 10
    grid = b[o:o + n * n]; o += n * n
    occ = b[o:o + n * n]; o += n * n
    boxes = [vxbin._box(b, o + 20 * i) for i in range(nb)]; o += 20 * nb
    lights = b[o:o + 12 * nl]
    per = [[] for _ in range(n * n)]
    for q in boxes:
        if q['a'] < 128 or q['w'] <= 0 or q['d'] <= 0: continue
        x0, x1, y0, y1 = q['x'], q['x'] + q['w'], q['y'], q['y'] + q['d']
        for ty in range(max(0, int(math.floor(y0))), min(n, int(math.ceil(y1)))):
            for tx in range(max(0, int(math.floor(x0))), min(n, int(math.ceil(x1)))):
                cx0, cx1 = max(x0, tx), min(x1, tx + 1); cy0, cy1 = max(y0, ty), min(y1, ty + 1)
                if cx1 - cx0 < .02 or cy1 - cy0 < .02: continue
                per[ty * n + tx].append((cx0 - tx, cx1 - tx, cy0 - ty, cy1 - ty, q))
    WARM = {0xffd27a, 0xffe9a8, 0xffe08a, 0xffcc33, 0xfff2a0, 0xff8a2a, 0xff7a2a, 0xffd84a, 0xfff6c0, 0xffd890, 0xff6a1a, 0xffb04a}
    def emis(q):
        c = (q['c'][0] << 16) | (q['c'][1] << 8) | q['c'][2]
        return c in WARM or q['f'] >= 1.18
    recs = bytearray()
    for t in range(n * n):
        L = per[t]
        floor = None; fz = 0
        # pavimento: il box basso più largo
        for (a0, a1, b0, b1, q) in L:
            area = (a1 - a0) * (b1 - b0)
            if q['h'] <= 8 and q['z'] <= 4 and area >= .5 and (floor is None or area > floor[0] or (area == floor[0] and q['z'] + q['h'] > floor[1]['z'] + floor[1]['h'])):
                floor = (area, q)
        if floor:
            fq = floor[1]; fz = fq['z'] + fq['h']; fcol = shade(fq['c'], fq['f'])
        else:
            fcol = (40, 44, 52); fz = 0
        objs = [(a0, a1, b0, b1, q) for (a0, a1, b0, b1, q) in L if q['z'] + q['h'] > fz + 2 and not (floor and q is floor[1])]
        flags = 0; ox0 = oy0 = 0; ox1 = oy1 = 1; z0 = z1 = 0; top = side = (0, 0, 0)
        if floor and emis(floor[1]): flags |= 4
        if objs:
            flags |= 1
            vol = sum((a1 - a0) * (b1 - b0) * q['h'] for (a0, a1, b0, b1, q) in objs)
            ox0 = min(o_[0] for o_ in objs); ox1 = max(o_[1] for o_ in objs); oy0 = min(o_[2] for o_ in objs); oy1 = max(o_[3] for o_ in objs)
            z0 = max(fz, min(o_[4]['z'] for o_ in objs)); z1 = max(o_[4]['z'] + o_[4]['h'] for o_ in objs)
            bvol = (ox1 - ox0) * (oy1 - oy0) * max(1, z1 - z0)
            if bvol > 0 and vol / bvol < .22:
                big = max(objs, key=lambda o_: (o_[1] - o_[0]) * (o_[3] - o_[2]) * o_[4]['h'])
                ox0, ox1, oy0, oy1 = big[0], big[1], big[2], big[3]
            tq = max(objs, key=lambda o_: (o_[4]['z'] + o_[4]['h'], (o_[1] - o_[0]) * (o_[3] - o_[2])))[4]
            sq = max(objs, key=lambda o_: ((o_[1] - o_[0]) + (o_[3] - o_[2])) * o_[4]['h'])[4]
            top = shade(tq['c'], tq['f']); side = shade(sq['c'], sq['f'])
            if any(emis(o_[4]) for o_ in objs): flags |= 2
        q4 = lambda v: max(0, min(15, int(round(v * 16))))
        q4b = lambda v: max(0, min(15, int(round(v * 16)) - 1))
        recs += struct.pack('<HbBBBBBHH', rgb555(fcol), max(-128, min(127, int(round(fz / 2)))), flags,
                            q4(ox0) | (q4(oy0) << 4), q4b(ox1) | (q4b(oy1) << 4),
                            max(0, min(255, int(round(z0 / 2)))), max(0, min(255, int(math.ceil(z1 / 2)))), rgb555(top), rgb555(side))
    out = os.path.join(OUT, os.path.basename(path)[:-4] + '.dsz')
    with open(out, 'wb') as f:
        f.write(b'VXD1' + struct.pack('<HH', n, nl) + grid + occ + bytes(recs) + lights)

def build_zones():
    files = sorted(glob.glob(os.path.join(SRC, 'z_*.bin')))
    for i, p in enumerate(files):
        build_zone(p)
        shutil.copy(p[:-4] + '.json', OUT)
        if i % 20 == 0: print('zona', i, '/', len(files), flush=True)

if __name__ == '__main__':
    what = sys.argv[3:] or ['data', 'zone', 'modelli', 'eroe']
    if 'data' in what: shutil.copy(os.path.join(SRC, 'data.json'), OUT)
    if 'zone' in what: build_zones()
    if 'modelli' in what: build_models()
    if 'eroe' in what: build_hero()
