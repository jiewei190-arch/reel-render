"""Compose the FX demo sheet (every new reaction FX, insert card, transition frame, and the new lighting next to the old).
   node render.mjs --project kits/toon3d/demo/sheet --scale 0.5 --stills <times from kits/toon3d/demo/sheet/stills.json>
   python3 kits/toon3d/tools/make_fx_sheet.py   -> kits/toon3d/demo/fx_sheet.png"""
import json, os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SH = os.path.join(HERE, 'demo', 'sheet'); S = os.path.join(SH, 'build', 'stills')
stills = json.load(open(os.path.join(SH, 'stills.json')))
def path(t):
    for f in os.listdir(S):
        if f.endswith(f'_{t:.2f}.png'): return os.path.join(S, f)
    raise FileNotFoundError(t)
def font(sz):
    for c in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(c): return ImageFont.truetype(c, sz)
    return ImageFont.load_default()
tiles = [(lab, Image.open(path(t)).convert('RGB')) for t, lab in stills]
groups = [('Reaction FX over the 3D head  (react.js: reactions(g, t, s, [{ fx, on, at, until }]))', [x for x in tiles if x[0].startswith('fx:')]),
          ('Full-screen INSERT cards over the blurred, dimmed scene  (insert.js: insertShot / drawInsert)', [x for x in tiles if x[0].startswith('insert:')]),
          ('Transitions, mid-transition frames  (transitions.js: iris, whipBlur; engine: flash, whip, fade)', [x for x in tiles if x[0].startswith('tr:')]),
          ('Lighting: OLD flat pale sky (light: day)  vs  NEW sunny sky + clouds + god rays + warm soft-light (sky.js)', [x for x in tiles if x[0].startswith('light:')])]
TW, TH, cols, pad, head, lab = 270, 480, 9, 14, 64, 34
W = pad + cols * (TW + pad)
rows = sum(-(-len(g) // cols) for _, g in groups) + 1  # lighting tiles are double size
H = 120 + sum(head + (-(-len(g) // cols)) * (TH + lab + pad) for _, g in groups[:-1]) + head + 2 * TH + lab + pad * 2
img = Image.new('RGB', (W, H), '#1c1418'); d = ImageDraw.Draw(img)
d.text((pad, 30), 'Toon 3D kit  -  BEANMEN effects port  (kits/toon3d: react.js, insert.js, transitions.js, sky.js, audio/)', font=font(40), fill='#ffd25a')
y = 120
for title, g in groups:
    d.text((pad, y + 16), title, font=font(28), fill='#f2ead6'); y += head
    big = title.startswith('Lighting')
    tw, th = (TW * 2, TH * 2) if big else (TW, TH)
    for i, (l, im) in enumerate(g):
        c, r = i % cols, i // cols; x = pad + c * ((tw if big else TW) + pad); yy = y + r * (th + lab + pad)
        img.paste(im.resize((tw, th), Image.LANCZOS), (x, yy)); d.text((x + 4, yy + th + 6), l.split(':', 1)[1], font=font(22), fill='#c9bfae')
    y += (-(-len(g) // cols)) * (th + lab + pad)
img = img.crop((0, 0, W, y + pad))
out = os.path.join(HERE, 'demo', 'fx_sheet.png'); img.save(out, optimize=True); print(out, img.size)
