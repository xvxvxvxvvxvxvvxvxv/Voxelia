#!/usr/bin/env python3
# Voxelia PS Vita - immagini della LiveArea e icona, da un'immagine del gioco (960x544).
# Uso: python3 mkassets.py immagine_del_gioco.png ../sce_sys
# La Vita vuole PNG a 8 bit con tavolozza per icona e LiveArea.
import sys, os
from PIL import Image, ImageDraw, ImageFont
src = Image.open(sys.argv[1]).convert('RGB')
out = sys.argv[2] if len(sys.argv) > 2 else 'sce_sys'
os.makedirs(os.path.join(out, 'livearea/contents'), exist_ok=True)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def logo(im, size, y, sub=None):
    d = ImageDraw.Draw(im); f = ImageFont.truetype(B, size)
    w = d.textlength('VOXELIA', font=f); x = (im.width - w) / 2
    d.text((x + size * .05, y + size * .05), 'VOXELIA', font=f, fill=(0, 0, 0))
    d.text((x, y), 'VOXELIA', font=f, fill=(255, 216, 74))
    if sub:
        f2 = ImageFont.truetype(B, int(size * .38)); w2 = d.textlength(sub, font=f2)
        d.text(((im.width - w2) / 2 + 1, y + size * 1.15 + 1), sub, font=f2, fill=(0, 0, 0))
        d.text(((im.width - w2) / 2, y + size * 1.15), sub, font=f2, fill=(240, 236, 224))
def pal(im, path):
    im.convert('P', palette=Image.ADAPTIVE, colors=255).save(path, optimize=True)
# icona 128x128: un pezzo del mondo con la V
ic = src.crop((300, 150, 600, 450)).resize((128, 128), Image.LANCZOS)
d = ImageDraw.Draw(ic); f = ImageFont.truetype(B, 92)
d.text((26, 14), 'V', font=f, fill=(0, 0, 0)); d.text((22, 10), 'V', font=f, fill=(255, 216, 74))
pal(ic, os.path.join(out, 'icon0.png'))
# sfondo della LiveArea 840x500
bg = src.resize((840, 476), Image.LANCZOS).crop((0, 0, 840, 476)); bg2 = Image.new('RGB', (840, 500), (16, 19, 26)); bg2.paste(bg, (0, 12))
logo(bg2, 70, 30, 'Il Regno Perduto')
pal(bg2, os.path.join(out, 'livearea/contents/bg.png'))
# immagine di avvio 280x158
st = src.resize((280, 159), Image.LANCZOS).crop((0, 0, 280, 158)); logo(st, 40, 50)
pal(st, os.path.join(out, 'livearea/contents/startup.png'))
# pic0 960x544 (sfondo nel menu delle applicazioni)
p0 = src.copy(); logo(p0, 110, 150, 'Il Regno Perduto')
pal(p0, os.path.join(out, 'pic0.png'))
print('fatto')
