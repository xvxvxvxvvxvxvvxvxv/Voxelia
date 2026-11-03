#!/usr/bin/env python3
# Genera source/font_data.h: tre caratteri bitmap proporzionali (testo, titoli, titolo grande) da DejaVu Sans,
# con Latin-1, qualche simbolo e le icone dei tasti del DS (al posto dei glifi della console 3DS).
import sys
from PIL import Image, ImageDraw, ImageFont
FONTS = [('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 9), ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 11), ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)]
CPS = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [0x2022, 0x2026, 0x2014, 0x2013, 0x2019, 0x2018, 0x201C, 0x201D, 0x25B2, 0x25BC, 0x2605, 0x2714, 0x2192, 0x2190, 0x266A, 0x2665, 0x20AC]
BTN = {0xE000: 'A', 0xE001: 'B', 0xE002: 'X', 0xE003: 'Y', 0xE004: 'L', 0xE005: 'R', 0xE006: '+', 0xE077: 'o'}
out = ['// generato da tools/mkfont.py (DejaVu Sans, licenza libera: vedi https://dejavu-fonts.github.io)', '#include <stdint.h>']
for fi, (path, size) in enumerate(FONTS):
    fo = ImageFont.truetype(path, size)
    asc, desc = fo.getmetrics()
    H = asc + desc
    glyphs = []
    for cp in CPS + sorted(BTN):
        img = Image.new('1', (40, H + 4), 0); d = ImageDraw.Draw(img); d.fontmode = '1'
        if cp in BTN:
            s = H - 2; d.ellipse((0, 1, s, s + 1), fill=1)
            f2 = ImageFont.truetype(FONTS[1][0], max(6, int(s * .75)))
            d.text((s / 2 + .5, s / 2 + 1.5), BTN[cp], font=f2, fill=0, anchor='mm')
            adv = s + 2
        else:
            d.text((0, 0), chr(cp), font=fo, fill=1)
            adv = int(round(fo.getlength(chr(cp))))
        px = img.load()
        rows = []
        for y in range(H):
            v = 0
            for x in range(min(adv + 1, 32)):
                if px[x, y]: v |= 1 << x
            rows.append(v)
        glyphs.append((cp, max(1, adv), rows))
    out.append('static const uint8_t F%d_W[%d] = {%s};' % (fi, len(glyphs), ','.join(str(g[1]) for g in glyphs)))
    out.append('static const uint32_t F%d_B[%d] = {%s};' % (fi, len(glyphs) * H, ','.join('0x%x' % r for g in glyphs for r in g[2])))
    out.append('#define F%d_H %d' % (fi, H))
out.append('static const uint16_t FONT_CP[%d] = {%s};' % (len(CPS) + len(BTN), ','.join('0x%x' % c for c in CPS + sorted(BTN))))
out.append('#define FONT_N %d' % (len(CPS) + len(BTN)))
open(sys.argv[1], 'w').write('\n'.join(out) + '\n')
