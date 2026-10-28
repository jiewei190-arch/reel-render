# 6-still storyboard (rule 17a): python3 -I storyboard.py <name> t_hook t_but t_25 t_wow t_48 t_end
# Renders the stills with render.py (PORT env, default 9331) and writes jobs/<name>/storyboard_<name>.jpg (3x2 grid, 1080x1340).
import sys, os, subprocess, pathlib
from PIL import Image, ImageDraw, ImageFont
HERE = pathlib.Path(__file__).resolve().parent; name = sys.argv[1]; ts = [float(x) for x in sys.argv[2:8]]
LAB = ['HOOK', 'BUT-TURN', '~25 s RE-HOOK', 'WOW', '~48 s RE-HOOK', 'END CARD']
env = dict(os.environ, PORT=os.environ.get('PORT', '9331'))
subprocess.run(['python3', '-I', str(HERE / 'render.py'), name, 'stills'] + [str(t) for t in ts], check=True, env=env)
W, H, BAR = 360, 640, 30; im = Image.new('RGB', (W * 3, (H + BAR) * 2), '#1e1e1e'); d = ImageDraw.Draw(im)
try: fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
except OSError: fnt = ImageFont.load_default()
for i, t in enumerate(ts):
    a = Image.open(HERE / 'stills' / name / f's_{t:06.2f}.png').convert('RGB').resize((W, H), Image.LANCZOS)
    x, y = (i % 3) * W, (i // 3) * (H + BAR); im.paste(a, (x, y + BAR)); d.text((x + 8, y + 6), f'{i + 1}. {LAB[i]}  {t:.1f} s', fill='#f2d16b', font=fnt)
out = HERE.parent / 'jobs' / name; out.mkdir(parents=True, exist_ok=True); im.save(out / f'storyboard_{name}.jpg', quality=88); print(out / f'storyboard_{name}.jpg')
