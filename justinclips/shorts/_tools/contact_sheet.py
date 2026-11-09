"""Contact sheet for a Short preview: python3 contact_sheet.py video.mp4 out.png "0:frame 1" "4.5:twist" ... [--zones 0,1]
Each arg is time:label. --zones lists panel indexes that get the YouTube Shorts UI zones drawn on top
(red = bottom title/description zone ~ lowest 20 %, right action-button column ~ right 15 % of the lower 45 %, top bar ~ 8 %)."""
import sys, subprocess, io
from PIL import Image, ImageDraw, ImageFont
args = sys.argv[1:]; zones = set()
if '--zones' in args: i = args.index('--zones'); zones = {int(x) for x in args[i + 1].split(',')}; del args[i:i + 2]
vid, out, items = args[0], args[1], args[2:]
W = 360; panels = []
for it in items:
    t, lab = it.split(':', 1)
    png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', t, '-i', vid, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    im = Image.open(io.BytesIO(png)).convert('RGB'); im = im.resize((W, int(im.height * W / im.width)))
    if len(panels) in zones:
        ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov); H = im.height
        d.rectangle([0, int(H * 0.80), W, H], fill=(255, 40, 40, 70), outline=(255, 40, 40, 200), width=2)
        d.rectangle([int(W * 0.85), int(H * 0.55), W, int(H * 0.80)], fill=(255, 40, 40, 70), outline=(255, 40, 40, 200), width=2)
        d.rectangle([0, 0, W, int(H * 0.08)], fill=(255, 40, 40, 50), outline=(255, 40, 40, 160), width=2)
        im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB'); lab += ' [UI zones]'
    panels.append((im, f'{float(t):.2f}s  {lab}'))
cols = 4; ph = panels[0][0].height + 26; rows = (len(panels) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (W + 8) + 8, rows * (ph + 8) + 8), (18, 16, 20)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
except Exception: font = ImageFont.load_default()
for i, (im, lab) in enumerate(panels):
    x, y = 8 + (i % cols) * (W + 8), 8 + (i // cols) * (ph + 8); sheet.paste(im, (x, y)); d.text((x + 2, y + im.height + 5), lab, fill=(235, 225, 200), font=font)
sheet.save(out); print(out, sheet.size)
