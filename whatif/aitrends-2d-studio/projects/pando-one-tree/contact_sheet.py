"""contact sheet: frame 1, mid of every shot, a Shorts-UI safe-zone overlay check on 2 frames, last frame. usage: sheet.py video shots.json out.png uiTimes"""
import sys, json, subprocess, os, tempfile
from PIL import Image, ImageDraw, ImageFont
v, sj, out = sys.argv[1:4]; ui = [float(x) for x in sys.argv[4].split(',')]
sh = json.load(open(sj))['shots']; dur = float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',v],capture_output=True,text=True).stdout)
items = [(0.0, 'FRAME 1 (t=0)', False)] + [(round((s['start']+s['end'])/2, 2), f"{s['id']} {round((s['start']+s['end'])/2,1)}s", False) for s in sh] + [(t, f'UI check {t}s', True) for t in ui] + [(round(dur - 1/24 - 0.005, 3), 'LAST FRAME', False)]
tmp = tempfile.mkdtemp(); tiles = []
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception: F = ImageFont.load_default()
for i, (t, lab, u) in enumerate(items):
    p = f'{tmp}/{i}.png'; subprocess.run(['ffmpeg','-y','-v','error','-ss',str(t),'-i',v,'-frames:v','1','-vf','scale=270:480',p],check=True)
    im = Image.open(p).convert('RGB')
    if u:  # Shorts UI mock: top bar, right action rail, bottom title/channel block (approximate safe zones at 270 px wide)
        o = Image.new('RGBA', im.size, (0,0,0,0)); d = ImageDraw.Draw(o)
        d.rectangle([0,0,270,30], fill=(0,0,0,120)); d.rectangle([222,180,270,420], fill=(0,0,0,110))
        for k in range(5): d.ellipse([230,190+k*45,262,222+k*45], fill=(255,255,255,170))
        d.rectangle([0,400,215,480], fill=(0,0,0,120)); d.text((8,412),'@channel  Title text...', fill=(255,255,255,220))
        im = Image.alpha_composite(im.convert('RGBA'), o).convert('RGB')
    c = Image.new('RGB', (270, 506), (20,20,20)); c.paste(im, (0,0)); ImageDraw.Draw(c).text((6,484), lab, fill=(255,255,255), font=F); tiles.append(c)
cols = 6; rows = (len(tiles)+cols-1)//cols; S = Image.new('RGB', (cols*276+6, rows*512+6), (20,20,20))
for i, c in enumerate(tiles): S.paste(c, (6+(i%cols)*276, 6+(i//cols)*512))
S.save(out); print(out, len(tiles))
