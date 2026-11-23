"""tech_review_sheet.py <out.jpg> <section>=<glob> [<section>=<glob> ...]
A labelled contact sheet: one row block per section, each tile captioned with its file name (minus the extension)."""
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

out, specs = sys.argv[1], sys.argv[2:]
TW, COLS = 270, 8
font = None
for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", os.path.join(os.path.dirname(__file__), "../public/fonts/Poppins-Bold.ttf")]:
    if os.path.exists(f):
        font = ImageFont.truetype(f, 18)
        big = ImageFont.truetype(f, 30)
        break
blocks = []
for sp in specs:
    name, pat = sp.split("=", 1)
    fs = sorted(glob.glob(pat))
    if not fs:
        continue
    ims = [Image.open(f).convert("RGB") for f in fs]
    th = int(TW * ims[0].height / ims[0].width)
    rows = (len(ims) + COLS - 1) // COLS
    b = Image.new("RGB", (COLS * TW, 50 + rows * (th + 28)), "#F5F7FA")
    d = ImageDraw.Draw(b)
    d.text((12, 8), name, fill="#14213D", font=big)
    for i, (im, f) in enumerate(zip(ims, fs)):
        x, y = (i % COLS) * TW, 50 + (i // COLS) * (th + 28)
        b.paste(im.resize((TW - 6, th - 6)), (x + 3, y + 3))
        d.text((x + 6, y + th), os.path.splitext(os.path.basename(f))[0][-30:], fill="#2F80ED", font=font)
    blocks.append(b)
W = COLS * TW
H = sum(b.height for b in blocks)
sheet = Image.new("RGB", (W, H), "#F5F7FA")
y = 0
for b in blocks:
    sheet.paste(b, (0, y))
    y += b.height
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
sheet.save(out, quality=86)
print(f"{out}: {W}x{H}")
