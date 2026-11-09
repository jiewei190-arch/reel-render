"""QC contact sheet: frames at given times with the YouTube Shorts UI zones outlined (red = bottom title/description area,
right action-button column, top bar). Usage: python3 contact.py video.mp4 out.png t1 t2 ... ('last' = final frame)"""
import sys, subprocess, json, io
from PIL import Image, ImageDraw
v, out, ts = sys.argv[1], sys.argv[2], sys.argv[3:]
info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", v], capture_output=True, text=True).stdout)
dur = float(info["format"]["duration"]); tiles = []
for t in ts:
    tt = dur - 0.05 if t == "last" else float(t)
    png = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{tt}", "-i", v, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
    im = Image.open(io.BytesIO(png)).convert("RGB"); W, H = im.size; d = ImageDraw.Draw(im)
    d.rectangle([0, int(H * 0.80), W - 1, H - 1], outline=(255, 40, 40), width=3)       # title / description / sound
    d.rectangle([int(W * 0.84), int(H * 0.45), W - 1, int(H * 0.80)], outline=(255, 40, 40), width=3)   # like/comment/share
    d.rectangle([0, 0, W - 1, int(H * 0.07)], outline=(255, 40, 40), width=3)
    d.text((8, 8), f"{t} s" if t != "last" else f"last {tt:.2f} s", fill=(255, 255, 0)); tiles.append(im)
cols = 6; W, H = tiles[0].size; rows = (len(tiles) + cols - 1) // cols; sc = 0.5
sheet = Image.new("RGB", (int(W * sc) * cols, int(H * sc) * rows), (20, 20, 20))
for i, im in enumerate(tiles): sheet.paste(im.resize((int(W * sc), int(H * sc))), ((i % cols) * int(W * sc), (i // cols) * int(H * sc)))
sheet.save(out); print(out, sheet.size)
