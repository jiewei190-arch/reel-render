"""Contact sheet of a preview mp4 with the YouTube Shorts UI zones drawn on (red = bottom title/description area,
right-hand action buttons). Usage: python3 contact_sheet.py preview.mp4 out.png t1,t2,...  (first = frame 1, 'last' = last frame)"""
import sys, subprocess, json, tempfile, os
from PIL import Image, ImageDraw, ImageFont
v, out, ts = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=duration', '-of', 'csv=p=0', v]).decode())
fps = 24; tiles = []; d = tempfile.mkdtemp()
for i, t in enumerate(ts):
    tt = (dur - 2.5 / fps) if t == 'last' else float(t); p = f'{d}/{i}.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', v, '-ss', f'{tt:.3f}', '-frames:v', '1', p], check=True)
    im = Image.open(p).convert('RGB'); W, H = im.size; ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(ov)
    dr.rectangle([0, int(H * 0.80), W, H], outline=(255, 40, 40, 255), width=3, fill=(255, 40, 40, 40))       # title/description/subscribe row
    dr.rectangle([int(W * 0.85), int(H * 0.45), W, int(H * 0.80)], outline=(255, 40, 40, 255), width=3, fill=(255, 40, 40, 40))  # like/comment/share
    im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB'); dr = ImageDraw.Draw(im)
    lab = 'frame 1' if i == 0 else ('last frame' if t == 'last' else f'{float(t):.2f}s')
    dr.rectangle([0, 0, 150, 26], fill=(0, 0, 0)); dr.text((6, 5), lab, fill=(255, 255, 255)); tiles.append(im)
cols = 6; W, H = tiles[0].size; s = 0.5; tw, th = int(W * s), int(H * s); rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * th), (20, 20, 20))
for i, im in enumerate(tiles): sheet.paste(im.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
sheet.save(out); print(out, sheet.size)
