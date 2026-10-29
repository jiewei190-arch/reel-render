# compare.py: side-by-side sheet, reference frame left / ours right, matched by kind of shot.
# usage: python3 -I compare.py REF.mp4 OURS(.mp4 | stills dir) OUT.jpg   (pairs below: ref time, our time, label)
import subprocess, sys, os, tempfile
from PIL import Image, ImageDraw, ImageFont
PAIRS = [(7.5, 0.6, 'counter sign (open prop)'), (1.5, 2.0, 'wide: two rivals, one set'), (16.6, 15.0, 'wide down the set, rivals at the edges'), (12.3, 22.0, 'top-down graphic, red vs teal'),
         (19.5, 38.6, 'time-lapse night grade'), (30.0, 50.0, 'medium, symmetrical rivals'), (41.5, 33.5, 'medium close, one face'), (35.0, 56.0, 'blueprint states the idea')]
ref, ours, out = sys.argv[1:4]
tmp = tempfile.mkdtemp(); W, H = 405, 720
def grab(src, t, p):
    if os.path.isdir(src): return Image.open(os.path.join(src, 's_%06.2f.png' % t)).convert('RGB').resize((W, H))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(t), '-i', src, '-frames:v', '1', '-vf', f'scale={W}:{H}', p], check=True); return Image.open(p).convert('RGB')
cols = 4; rows = (len(PAIRS) + cols - 1) // cols; sheet = Image.new('RGB', (cols * (2 * W + 30), rows * (H + 60)), (24, 24, 28)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype(os.path.join(os.path.dirname(__file__), '../../reels/styles/fieldbook/fonts/Nunito.ttf'), 26)
except Exception: font = None
for k, (rt, ot, lab) in enumerate(PAIRS):
    x = (k % cols) * (2 * W + 30) + 10; y = (k // cols) * (H + 60) + 50
    sheet.paste(grab(ref, rt, f'{tmp}/r{k}.png'), (x, y)); sheet.paste(grab(ours, ot, f'{tmp}/o{k}.png'), (x + W + 10, y))
    d.text((x, y - 40), f'{lab}   REF {rt}s | OURS {ot}s', fill=(240, 240, 240), font=font)
sheet.save(out, quality=86); print(out)
