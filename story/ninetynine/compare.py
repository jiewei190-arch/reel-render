# compare.py: side-by-side sheet, reference frame (left) next to ours (right) for matching shot types.
# usage: python3 -I compare.py REF.mp4 OURS.mp4 OUT.jpg VERSION_LABEL
import subprocess, sys, tempfile, os
from PIL import Image, ImageDraw, ImageFont
ref, ours, out, lab = sys.argv[1:5]
PAIRS = [  # (shot type, reference time, our time)
    ('hook: counter prop', 0.5, 0.6), ('medium: character', 3.5, 8.0), ('wide: two sides', 16.6, 55.0), ('medium: other side', 5.0, 12.0),
    ('blueprint', 36.5, 27.6), ('overhead', 12.2, 38.0), ('candle-lit night', 24.5, 46.0), ('loop end: same prop', 44.0, 66.5)]
FONT = '/home/user/reel-render/reels/styles/fieldbook/fonts/Nunito.ttf'
td = tempfile.mkdtemp()
def grab(src, t, name):
    p = os.path.join(td, name); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', src, '-frames:v', '1', p], check=True); return Image.open(p).convert('RGB').resize((360, 640))
cw, ch, top = 360, 640, 60
sheet = Image.new('RGB', (cw * 4 + 30, (ch + top) * 4 + 80), (24, 22, 30)); d = ImageDraw.Draw(sheet)
f1 = ImageFont.truetype(FONT, 34); f2 = ImageFont.truetype(FONT, 24)
d.text((20, 18), f'ninetynine {lab}: reference (left) vs ours (right)', fill=(255, 246, 226), font=f1)
for i, (name, tr, to) in enumerate(PAIRS):
    col, row = i % 2, i // 2; x = col * (cw * 2 + 30); y = 80 + row * (ch + top)
    d.text((x + 10, y + 14), f'{name}   ref {tr}s  |  ours {to}s', fill=(230, 220, 200), font=f2)
    sheet.paste(grab(ref, tr, f'r{i}.png'), (x, y + top)); sheet.paste(grab(ours, to, f'o{i}.png'), (x + cw, y + top))
sheet.save(out, quality=88); print(out)
