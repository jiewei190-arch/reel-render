"""Contact sheet from the FINAL video: frame 1, the hook caption under a mock YouTube Shorts UI (safe-zone check), a caption
frame under the same UI, the last frame (next to frame 1 for the loop), then one frame per shot (mid-shot).
Usage: python contact_sheet.py video.mp4 shots.json out.png [ui_t1] [ui_t2]"""
import json, subprocess, sys, tempfile, os
from PIL import Image, ImageDraw, ImageFont
V, SJ, OUT = sys.argv[1:4]
UI1 = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
UI2 = float(sys.argv[5]) if len(sys.argv) > 5 else 9.5
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
tmp = tempfile.mkdtemp()
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', V]))
def grab(t, name):
    p = os.path.join(tmp, name + '.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, t):.3f}', '-i', V, '-frames:v', '1', p], check=True)
    return Image.open(p).convert('RGB')
def last():
    p = os.path.join(tmp, 'last.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-sseof', '-0.1', '-i', V, '-update', '1', p], check=True)
    return Image.open(p).convert('RGB')
def shorts_ui(im):
    """Approximate Shorts overlay on a 1080x1920 frame: top bar, right action rail, bottom channel/title block."""
    im = im.copy(); d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle([0, 0, 1080, 150], fill=(0, 0, 0, 90)); d.text((40, 60), 'Shorts', fill='white', font=FONT)
    for i in range(5): y = 1000 + i * 150; d.ellipse([950, y, 1050, y + 100], fill=(30, 30, 30, 170))
    d.rectangle([0, 1600, 1080, 1920], fill=(0, 0, 0, 120)); d.ellipse([40, 1640, 110, 1710], fill=(200, 200, 200, 200))
    d.text((130, 1655), '@channel  Subscribe', fill='white', font=FONT); d.text((40, 1740), 'Title of the Short ...', fill='white', font=FONT)
    d.rectangle([0, 1900, 1080, 1920], fill=(255, 0, 0, 200))
    return im
S = json.load(open(SJ))['shots']
tiles = [(grab(0, 'f1'), 'frame 1 (0.00 s)'), (shorts_ui(grab(UI1, 'ui1')), f'hook vs Shorts UI ({UI1:.1f} s)'),
         (shorts_ui(grab(UI2, 'ui2')), f'caption vs Shorts UI ({UI2:.1f} s)'), (last(), f'last frame ({dur:.2f} s) -> loops to frame 1')]
for s in S:
    t = s['start'] + (s['end'] - s['start']) * 0.5; tiles.append((grab(t, s['id']), f"{s['id']} {t:.1f} s"))
W, H, cols = 360, 640, 4; rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * W, rows * (H + 44)), (18, 18, 18)); d = ImageDraw.Draw(sheet)
for i, (im, lab) in enumerate(tiles):
    x, y = (i % cols) * W, (i // cols) * (H + 44); sheet.paste(im.resize((W - 8, H - 8)), (x + 4, y + 4)); d.text((x + 8, y + H + 4), lab, fill='white', font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20))
sheet.save(OUT); print(OUT, sheet.size, f'{len(tiles)} tiles, duration {dur:.2f}')
