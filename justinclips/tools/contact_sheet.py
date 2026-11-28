#!/usr/bin/env python3
"""contact_sheet.py: QC sheet from the FINAL video.mp4 of a Justin clips Short.

    python contact_sheet.py <video.mp4> <shots.json> <out.png>

Row 1: frame 1 / t=1.5 s / t=3.3 s (top caption) each with the YouTube Shorts UI zones drawn on (red = covered by the
Shorts UI: top bar, right action buttons, bottom title/channel/subscribe area), then the LAST frame next to frame 1 (loop check).
Then one frame per shot at 45 % of the shot. Needs ffmpeg + Pillow."""
import json, subprocess, sys, tempfile, os
from PIL import Image, ImageDraw, ImageFont

vid, shots_p, out = sys.argv[1:4]
shots = json.load(open(shots_p))['shots']
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', vid]))
tmp = tempfile.mkdtemp(); TW = 360; TH = 640

def grab(t, name):
    p = os.path.join(tmp, name + '.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, t):.3f}', '-i', vid, '-frames:v', '1', p], check=True)
    return Image.open(p).convert('RGB')

def last_frame():
    p = os.path.join(tmp, 'last.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-0.1', '-i', vid, '-update', '1', p], check=True)
    return Image.open(p).convert('RGB')

def ui(im):
    im = im.copy(); d = ImageDraw.Draw(im, 'RGBA'); W, H = im.size
    for box in [(0, 0, W, int(H * 0.075)), (int(W * 0.86), int(H * 0.45), W, int(H * 0.86)), (0, int(H * 0.80), W, H)]:
        d.rectangle(box, fill=(255, 0, 0, 60), outline=(255, 40, 40, 255), width=4)
    return im

try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except Exception: font = ImageFont.load_default()
tiles = [(ui(grab(0, 'f1')), 'FRAME 1 + Shorts UI'), (ui(grab(1.5, 'c1')), '1.5 s + UI'), (ui(grab(3.3, 'c2')), '3.3 s caption + UI'),
         (last_frame(), f'LAST {dur:.2f} s'), (grab(0, 'f1b'), 'FRAME 1 (loop)')]
for s in shots:
    t = s['start'] + (s['end'] - s['start']) * 0.45
    tiles.append((grab(t, s['id']), f"{s['id']} {t:.1f}s"))
cols = 5; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (TW + 10) + 10, rows * (TH + 40) + 10), (18, 18, 18)); d = ImageDraw.Draw(sheet)
for i, (im, lab) in enumerate(tiles):
    x, y = 10 + (i % cols) * (TW + 10), 10 + (i // cols) * (TH + 40)
    sheet.paste(im.resize((TW, TH)), (x, y)); d.text((x + 4, y + TH + 6), lab, fill=(230, 230, 230), font=font)
sheet.save(out); print(out, sheet.size)
