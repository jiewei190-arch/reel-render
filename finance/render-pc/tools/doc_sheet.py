"""doc_sheet.py <out.jpg> <img...> [--cols 3] [--w 640]: a labelled contact sheet of doc stills (PIL)."""
import os
import sys

from PIL import Image, ImageDraw

args = sys.argv[1:]
cols = int(args[args.index("--cols") + 1]) if "--cols" in args else 3
w = int(args[args.index("--w") + 1]) if "--w" in args else 640
skip = {i + 1 for i, a in enumerate(args) if a in ("--cols", "--w")}
files = [a for i, a in enumerate(args) if i > 0 and not a.startswith("--") and i not in skip]
h = w * 9 // 16
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + 28)), (16, 16, 20))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((w, h))
    x, y = (i % cols) * w, (i // cols) * (h + 28)
    sheet.paste(im, (x, y + 28))
    d.text((x + 8, y + 8), os.path.basename(f), fill=(235, 235, 235))
sheet.save(args[0], quality=85)
print(args[0], len(files))
