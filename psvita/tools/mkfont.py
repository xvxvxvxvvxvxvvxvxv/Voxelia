#!/usr/bin/env python3
# Voxelia PS Vita - genera data/font.bin: un atlante "signed distance field" del carattere del gioco.
# Il testo resta nitido a qualunque grandezza (le scritte dell'interfaccia vanno da 14 a 90 pixel).
# Carattere: Liberation Sans (SIL OFL), con DejaVu Sans (licenza Bitstream Vera) per i simboli che mancano.
# In più ci sono i simboli dei tasti della Vita (croce, cerchio, triangolo, quadrato, L, R, croce direzionale,
# levette, START e SELECT) ai codici privati che il gioco usa nei testi (U+E000...).
# Uso: python3 mkfont.py ../data/font.bin
import sys, struct
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import distance_transform_edt

BIG = 96            # grandezza di disegno
DS = 3              # riduzione: cella finale a 32 pixel di carattere
SPREAD = 18         # raggio del campo di distanza (in pixel grandi)
PRIMARY = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
FALLBACK = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

cps = list(range(32, 127)) + list(range(160, 384))
cps += list(range(0x2010, 0x2028)) + [0x2030, 0x2039, 0x203A, 0x20AC, 0x2122]
cps += list(range(0x2190, 0x2194)) + list(range(0x25A0, 0x2600))
cps += [0x2302, 0x23F8, 0x2600, 0x2601, 0x2605, 0x2606, 0x2660, 0x2663, 0x2665, 0x2666, 0x266A, 0x266B, 0x2694, 0x2699,
        0x26A0, 0x26D4, 0x2709, 0x2713, 0x2714, 0x2715, 0x2716, 0x2717, 0x2718, 0x2726, 0x2727, 0x2728, 0x2764, 0x3010, 0x3011]
PAD = [0xE000 + i for i in range(10)] + [0xE077]

fp = ImageFont.truetype(PRIMARY, BIG)
ff = ImageFont.truetype(FALLBACK, int(BIG * .92))
asc, desc = fp.getmetrics()

_tofu = {}
def has(font, ch):
    # un carattere che manca esce come il "quadratino" del font: si confronta con quello di un codice inesistente
    if ch == ' ':
        return True
    try:
        if font not in _tofu:
            _tofu[font] = bytes(font.getmask('\U0010FFFD'))
        m = font.getmask(ch)
        return m.getbbox() is not None and bytes(m) != _tofu[font]
    except Exception:
        return False

def pad_glyph(cp):
    # i simboli dei tasti, disegnati qui: un cerchio pieno con il segno "scavato" (prende il colore del testo)
    W = int(BIG * 1.0); H = asc + desc
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
    cx, cy, r = W / 2, asc * .62, BIG * .40
    k = cp - 0xE000
    if k in (0, 1, 2, 3):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
        s = r * .52; w = max(4, int(BIG * .085))
        if k == 0:   # croce
            d.line([cx - s, cy - s, cx + s, cy + s], fill=0, width=w); d.line([cx - s, cy + s, cx + s, cy - s], fill=0, width=w)
        elif k == 1:  # cerchio
            d.ellipse([cx - s, cy - s, cx + s, cy + s], outline=0, width=w)
        elif k == 2:  # triangolo
            d.polygon([(cx, cy - s * 1.05), (cx + s, cy + s * .75), (cx - s, cy + s * .75)], outline=0, width=w)
        else:         # quadrato
            d.rectangle([cx - s * .8, cy - s * .8, cx + s * .8, cy + s * .8], outline=0, width=w)
    elif k in (4, 5, 7, 8):   # L, R, START, SELECT: pastiglia con la lettera
        lab = {4: 'L', 5: 'R', 7: 'ST', 8: 'SE'}[k]
        ww = r * (1.25 if len(lab) == 1 else 1.7)
        d.rounded_rectangle([cx - ww, cy - r * .8, cx + ww, cy + r * .8], radius=r * .45, fill=255)
        f2 = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', int(BIG * (.55 if len(lab) == 1 else .4)))
        bb = d.textbbox((0, 0), lab, font=f2)
        d.text((cx - (bb[0] + bb[2]) / 2, cy - (bb[1] + bb[3]) / 2), lab, fill=0, font=f2)
    elif k == 6:   # croce direzionale
        a, b = r * .95, r * .34
        d.rectangle([cx - b, cy - a, cx + b, cy + a], fill=255); d.rectangle([cx - a, cy - b, cx + a, cy + b], fill=255)
        d.ellipse([cx - b * .55, cy - b * .55, cx + b * .55, cy + b * .55], fill=0)
    else:          # levette (sinistra E077, destra E009)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
        d.ellipse([cx - r * .55, cy - r * .55, cx + r * .55, cy + r * .55], fill=0)
        d.ellipse([cx - r * .3, cy - r * .3, cx + r * .3, cy + r * .3], fill=255)
    return im, W

def glyph(cp):
    if cp >= 0xE000:
        return pad_glyph(cp)
    ch = chr(cp)
    font = fp if has(fp, ch) else ff if has(ff, ch) else None
    if font is None:
        return None
    adv = font.getlength(ch)
    H = asc + desc
    W = max(1, int(adv + BIG * .3))
    im = Image.new('L', (W + BIG // 2, H), 0)
    ImageDraw.Draw(im).text((BIG // 8, 0 if font is fp else (asc - ff.getmetrics()[0])), ch, fill=255, font=font)
    return im, adv

def sdf(img):
    a = np.asarray(img).astype(np.float32) / 255 > .5
    a = np.pad(a, SPREAD)
    din = distance_transform_edt(a)
    dout = distance_transform_edt(~a)
    d = np.where(a, din - .5, -(dout - .5))
    v = np.clip(d / SPREAD * .5 + .5, 0, 1)
    h, w = v.shape
    h2, w2 = h // DS, w // DS
    v = v[:h2 * DS, :w2 * DS].reshape(h2, DS, w2, DS).mean(axis=(1, 3))
    return (v * 255 + .5).astype(np.uint8)

ATW = 1024
cells = []
for cp in cps + PAD:
    g = glyph(cp)
    if g is None:
        continue
    im, adv = g
    xoff = 0 if cp >= 0xE000 else BIG // 8
    s = sdf(im)
    cells.append((cp, s, adv / DS, (xoff + SPREAD) / DS))

# impacchettamento a righe
x = y = rowh = 0
placed = []
for cp, s, adv, ox in cells:
    h, w = s.shape
    if x + w + 1 > ATW:
        x = 0; y += rowh + 1; rowh = 0
    placed.append((cp, x, y, w, h, adv, ox))
    x += w + 1; rowh = max(rowh, h)
ATH = 1
while ATH < y + rowh + 1:
    ATH *= 2
atlas = np.zeros((ATH, ATW), np.uint8)
for (cp, s, adv, ox), (_, px, py, w, h, _, _) in zip(cells, placed):
    atlas[py:py + h, px:px + w] = s
# un quadratino pieno per i rettangoli (campo = 1)
atlas[ATH - 4:ATH, ATW - 4:ATW] = 255

lineh = (asc + desc) / DS
top = SPREAD / DS          # la cella comincia SPREAD sopra la riga
out = open(sys.argv[1] if len(sys.argv) > 1 else 'font.bin', 'wb')
out.write(b'VXF1')
out.write(struct.pack('<HHHff', ATW, ATH, len(placed), lineh, top))
for cp, px, py, w, h, adv, ox in placed:
    out.write(struct.pack('<IHHHHff', cp, px, py, w, h, adv, ox))
out.write(atlas.tobytes())
out.close()
Image.fromarray(atlas).save('/tmp/claude-0/-home-user-Voxelia/024150b2-92fa-5afd-8a54-c050cd88c042/scratchpad/atlas.png') if len(sys.argv) > 2 else None
print('glifi', len(placed), 'atlante', ATW, 'x', ATH, 'riga', round(lineh, 2), 'px a scala 32')
