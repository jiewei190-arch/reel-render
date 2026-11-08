"""Compose the toon3d style sheet PNG from the sheet project's stills.
   node render.mjs --project kits/toon3d/sheet --stills 0.5,1.5,2.5,3.5,4.5
   python3 kits/toon3d/tools/make_sheet.py   -> kits/toon3d/style_sheet.png"""
import os, glob
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(HERE, 'sheet', 'build', 'stills')
f = lambda t: os.path.join(S, f'{t}s_{t:.2f}.png')
FONT = None
for p in glob.glob(os.path.join(HERE, '..', '..', 'node_modules', '@fontsource', 'fredoka', 'files', '*')):
    pass
def font(sz):
    for cand in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(cand): return ImageFont.truetype(cand, sz)
    return ImageFont.load_default()
W = 1920; pad = 24; head = 70
ex, cast = Image.open(f(0.5)), Image.open(f(1.5))
sets = [Image.open(f(t)).resize((int((W - 4 * pad) / 3), int((W - 4 * pad) / 3 * 9 / 16)), Image.LANCZOS) for t in (2.5, 3.5, 4.5)]
H = 110 + head + 1080 + head + 1080 + head + sets[0].height + pad * 2
img = Image.new('RGB', (W, H), '#1c1418'); d = ImageDraw.Draw(img)
d.text((pad, 28), 'I.Awaken  —  "Toon 3D" style sheet  (kits/toon3d)', font=font(52), fill='#ffd25a')
y = 110
for title, im in (('6 expressions  (EXPR.*: lids, brows, pupils, mouth)', ex), ('outfits + headgear  (bean({ outfit, head, hair }))', cast)):
    d.text((pad, y + 14), title, font=font(38), fill='#f2ead6'); y += head; img.paste(im, (0, y)); y += im.height
d.text((pad, y + 14), '3 sets  (SETS.romanStreet / romanHouse / cityGate)', font=font(38), fill='#f2ead6'); y += head
for i, s in enumerate(sets): img.paste(s, (pad + i * (s.width + pad), y))
out = os.path.join(HERE, 'style_sheet.png'); img.save(out, optimize=True); print(out, img.size)
