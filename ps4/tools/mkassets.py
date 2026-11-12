#!/usr/bin/env python3
# Voxelia PS4 - icona e immagini del pacchetto (sce_sys), da due immagini del gioco a 1920x1080 senza interfaccia
# (la build per PC: VOX_AUTO="new; time 1050; hud 0; zoom 1.0; wait 2; shot citta.ppm; zoom 1.15; wait 1; shot vicino.ppm").
#   icon0.png 512x512 · pic0.png 1920x1080 con il titolo · pic1.png 1920x1080 (sfondo)
# Uso: python3 mkassets.py citta.ppm vicino.ppm ../sce_sys
import sys, os
from PIL import Image, ImageDraw, ImageFont
B = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
R = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
bg = Image.open(sys.argv[1]).convert('RGB')
close = Image.open(sys.argv[2]).convert('RGB')
out = sys.argv[3] if len(sys.argv) > 3 else 'sce_sys'
os.makedirs(out, exist_ok=True)

def title(img, cx, y, size):
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(B, size); t = 'VOXELIA'
    bb = d.textbbox((0, 0), t, font=f); w = bb[2] - bb[0]
    for o in range(6, 0, -1):
        d.text((cx - w / 2 + o, y + o), t, font=f, fill=(0, 0, 0))
    d.text((cx - w / 2, y), t, font=f, fill=(255, 216, 74))
    f2 = ImageFont.truetype(R, int(size * .36)); s = 'Il Regno Perduto'
    bb = d.textbbox((0, 0), s, font=f2); w2 = bb[2] - bb[0]
    d.text((cx - w2 / 2 + 3, y + size * 1.08 + 3), s, font=f2, fill=(0, 0, 0))
    d.text((cx - w2 / 2, y + size * 1.08), s, font=f2, fill=(240, 240, 240))

def shade(img, top, h, a):
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    for i in range(h):
        y = i if top else img.size[1] - 1 - i
        od.line([(0, y), (img.size[0], y)], fill=(10, 12, 24, int(a * (1 - i / h))))
    return Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB')

bg.save(os.path.join(out, 'pic1.png'))
p0 = shade(bg, True, 420, 150); title(p0, 960, 70, 190); p0.save(os.path.join(out, 'pic0.png'))
ic = close.crop((960 - 420, 540 - 470, 960 + 420, 540 + 370)).resize((512, 512), Image.LANCZOS)
ic = shade(ic, False, 190, 220)
d = ImageDraw.Draw(ic); f = ImageFont.truetype(B, 92); t = 'VOXELIA'
bb = d.textbbox((0, 0), t, font=f); w = bb[2] - bb[0]
for o in range(4, 0, -1):
    d.text((256 - w / 2 + o, 385 + o), t, font=f, fill=(0, 0, 0))
d.text((256 - w / 2, 385), t, font=f, fill=(255, 216, 74))
f3 = ImageFont.truetype(B, 30)
d.rounded_rectangle([392, 18, 494, 62], radius=10, fill=(0, 48, 135)); d.text((405, 21), 'PS4', font=f3, fill=(255, 255, 255))
ic.save(os.path.join(out, 'icon0.png'))
