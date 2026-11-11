"""Contact sheet of a preview with the YouTube Shorts UI zones outlined (red: right-side buttons, bottom title/channel area).
Usage: python3 contact_sheet.py video.mp4 out.png t1 t2 ... ('last' = the last frame)"""
import sys, subprocess, json, os
from PIL import Image, ImageDraw
v, out, ts = sys.argv[1], sys.argv[2], sys.argv[3:]
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v], capture_output=True, text=True).stdout)
ims = []
for t in ts:
    tt = dur - 0.15 if t == 'last' else float(t); f = f'/tmp/_cs_{len(ims)}.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{tt:.3f}', '-i', v, '-frames:v', '1', f], check=True)
    im = Image.open(f).convert('RGB'); W, H = im.size; ov = Image.new('RGBA', im.size); d = ImageDraw.Draw(ov)
    d.rectangle([W * 0.86, H * 0.42, W, H * 0.86], outline=(255, 40, 40, 255), width=3)      # like/comment/share/remix buttons
    d.rectangle([0, H * 0.83, W * 0.86, H], outline=(255, 40, 40, 255), width=3)             # title, channel, music line
    im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB'); ImageDraw.Draw(im).text((8, 8), f'{tt:.2f}s', fill=(255, 255, 0)); ims.append(im)
W, H = ims[0].size; cols = 6; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * W, rows * H), (20, 20, 20))
for i, im in enumerate(ims): S.paste(im, ((i % cols) * W, (i // cols) * H))
S.save(out); print(out, S.size)
