# compare.py: side-by-side sheet, reference frames (left) next to ours (right) at matching kinds of shot,
# plus the STYLE_STORY 3b band measurements on the wide field frame.
# usage: python3 -I story/lemonade/compare.py <ref.mp4> <ours.mp4> <out.jpg> [label]
import sys, subprocess, colorsys, numpy as np
from PIL import Image, ImageDraw, ImageFont
REF, OURS, OUT = sys.argv[1:4]; LABEL = sys.argv[4] if len(sys.argv) > 4 else ''
PAIRS = [  # (kind, reference time, our time)
    ('open/close prop', 7.5, 0.6), ('roaming medium', 3.0, 6.0), ('wide, track to vanishing point', 16.6, 10.0),
    ('medium close-up', 40.5, 21.0), ('time-lapse grade', 19.5, 23.0), ('night scene', 26.5, 39.0),
    ('blueprint', 36.0, 50.0), ('symmetric two-sided', 30.0, 35.0), ('loop ending', 43.5, 69.5)]
def frame(path, t):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', str(t), '-i', path, '-frames:v', '1', '-vf', 'scale=540:960', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return Image.frombytes('RGB', (540, 960), raw)
def bands(im):
    a = np.asarray(im).astype(float) / 255; out = []
    for name, y0, y1 in [('sky', .20, .30), ('horizon', .42, .48), ('ground mid', .62, .72), ('ground low', .82, .95)]:
        b = a[int(y0 * 960):int(y1 * 960)].reshape(-1, 3); m = b.mean(0); hsv = np.array([colorsys.rgb_to_hsv(*p) for p in b[::37]])
        out.append(f"{name}: #{''.join(f'{int(v * 255):02x}' for v in m)} sat {hsv[:, 1].mean():.2f} val {hsv[:, 2].mean():.2f}")
    l = (a @ [.299, .587, .114]) * 255; hsv = np.array([colorsys.rgb_to_hsv(*p) for p in a.reshape(-1, 3)[::97]])
    out.append(f"frame: sat {hsv[:, 1].mean():.2f} luma std {l.std():.0f}"); return out
try: font = ImageFont.truetype('/home/user/reel-render/reels/styles/fieldbook/fonts/Nunito.ttf', 22)
except Exception: font = ImageFont.load_default()
TW, TH = 270, 480; cols = 3; rows = (len(PAIRS) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (TW * 2 + 20), rows * (TH + 40) + 230), '#202020'); d = ImageDraw.Draw(sheet)
for i, (kind, tr, to) in enumerate(PAIRS):
    x, y = (i % cols) * (TW * 2 + 20), (i // cols) * (TH + 40)
    sheet.paste(frame(REF, tr).resize((TW, TH)), (x, y + 34)); sheet.paste(frame(OURS, to).resize((TW, TH)), (x + TW, y + 34))
    d.text((x + 6, y + 6), f"{kind}   ref {tr}s | ours {to}s", fill='#ffd37a', font=font)
rb, ob = bands(frame(REF, 16.6)), bands(frame(OURS, 10.0)); y = rows * (TH + 40) + 10
d.text((10, y), f"bands (STYLE_STORY 3b), wide field frame   {LABEL}", fill='#ffffff', font=font)
for j, (a, b) in enumerate(zip(rb, ob)): d.text((10, y + 34 + j * 36), f"ref  {a}", fill='#9fd3ff', font=font); d.text((sheet.width // 2, y + 34 + j * 36), f"ours {b}", fill='#ffb3a8', font=font)
sheet.save(OUT, quality=88); print(OUT); print('\n'.join(f'ref {a}\nours {b}' for a, b in zip(rb, ob)))
