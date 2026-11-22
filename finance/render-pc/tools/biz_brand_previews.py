"""Previews for the channel branding: the banner's 1546x423 safe area at 1080 wide (what a phone shows), and the
profile picture circle-masked at 98 px and 240 px on YouTube's light and dark page colours."""
import sys
from PIL import Image, ImageDraw

out = sys.argv[1]
b = Image.open(f"{out}/banner.png").convert("RGB")
W, H = b.size
sw, sh = 1546, 423
x, y = (W - sw) // 2, (H - sh) // 2
b.crop((x, y, x + sw, y + sh)).resize((1080, round(sh * 1080 / sw)), Image.LANCZOS).save(f"{out}/preview_phone.png")

p = Image.open(f"{out}/pfp.png").convert("RGB")
def circ(n):
    big = p.resize((n * 4, n * 4), Image.LANCZOS)
    m = Image.new("L", big.size, 0)
    ImageDraw.Draw(m).ellipse((0, 0, n * 4 - 1, n * 4 - 1), fill=255)
    return big.resize((n, n), Image.LANCZOS), m.resize((n, n), Image.LANCZOS)
pad = 30
sheet = Image.new("RGB", (pad * 3 + 240 + 98, (pad * 2 + 240) * 2), "#ffffff")
for row, bg in enumerate(["#ffffff", "#0f0f0f"]):
    oy = row * (pad * 2 + 240)
    sheet.paste(bg, (0, oy, sheet.width, oy + pad * 2 + 240))
    for n, ox in [(240, pad), (98, pad * 2 + 240)]:
        im, m = circ(n)
        sheet.paste(im, (ox, oy + pad + (240 - n) // 2), m)
sheet.save(f"{out}/preview_circle.png")
print("previews ->", out)
