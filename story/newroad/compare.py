# compare.py: side-by-side sheet, reference frames (left of each pair) next to ours (right) at matching kinds of shot,
# plus the STYLE_STORY 3b band measurements for the wide field shot. Usage:
#   python3 -I story/newroad/compare.py <ref.mp4> <ours.mp4> <out.jpg>
import sys, subprocess, tempfile, pathlib
from PIL import Image, ImageDraw, ImageStat
import colorsys
ref, ours, out = sys.argv[1:4]
PAIRS = [  # (ref t, our t, label)
    (1.0, 1.0, 'medium: characters + sign'), (8.0, 38.0, 'open/close prop'), (16.6, 8.0, 'wide: two sides, path to VP'),
    (12.0, 15.0, 'overhead graphic'), (25.0, 24.5, 'night interior, candle'), (35.0, 44.5, 'blueprint + stamp'),
    (29.0, 34.0, 'two sides in one shot'), (40.0, 50.5, 'character close-up')]
tmp = pathlib.Path(tempfile.mkdtemp())
def grab(src, t, name):
    p = tmp / f'{name}.png'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', src, '-frames:v', '1', str(p)], check=True); return Image.open(p).convert('RGB')
def bands(im):
    im = im.resize((540, 960)); out = []
    for lab, a, b in [('sky', .20, .30), ('horizon', .42, .48), ('ground mid', .62, .72), ('ground low', .82, .95)]:
        c = im.crop((0, int(960 * a), 540, int(960 * b))); m = ImageStat.Stat(c).mean[:3]; h, s, v = colorsys.rgb_to_hsv(*[x / 255 for x in m]); out.append(f'{lab} #{"".join(f"{int(x):02x}" for x in m)} s{s:.2f} v{v:.2f}')
    return out
TW, TH = 300, 533
sheet = Image.new('RGB', (4 * 2 * TW + 3 * 16, 2 * (TH + 40) + 140), (24, 22, 30)); d = ImageDraw.Draw(sheet)
for i, (rt, ot, lab) in enumerate(PAIRS):
    col, row = i % 4, i // 4; x = col * (2 * TW + 16); y = row * (TH + 40)
    r, o = grab(ref, rt, f'r{i}'), grab(ours, ot, f'o{i}')
    sheet.paste(r.resize((TW, TH)), (x, y + 30)); sheet.paste(o.resize((TW, TH)), (x + TW, y + 30))
    d.text((x + 6, y + 8), f'REF {rt}s | OURS {ot}s  {lab}', fill=(240, 236, 220))
    if i == 2:
        rb, ob = bands(r), bands(o); yy = 2 * (TH + 40) + 8
        d.text((8, yy), 'band means (540x960)   REF wide field                      OURS wide shot', fill=(240, 236, 220))
        for j, (a, b) in enumerate(zip(rb, ob)): d.text((8, yy + 22 + j * 22), f'{a:44s}   {b}', fill=(220, 220, 200))
sheet.save(out, quality=88); print(out)
