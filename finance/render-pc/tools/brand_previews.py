"""Previews for the Scam Files TV branding: the banner's 1546x423 safe area (what a phone shows) at 1080 wide, and
the profile picture masked to YouTube's circle at 98 px and 240 px, on dark and light page backgrounds."""
import sys
from PIL import Image, ImageDraw

out = sys.argv[1]
ban = Image.open(f"{out}/banner.png").convert("RGB")
assert ban.size == (2560, 1440), ban.size
sw, sh = 1546, 423
x0, y0 = (2560 - sw) // 2, (1440 - sh) // 2
safe = ban.crop((x0, y0, x0 + sw, y0 + sh))
safe.resize((1080, round(1080 * sh / sw)), Image.LANCZOS).save(f"{out}/preview_phone.png")

pfp = Image.open(f"{out}/pfp.png").convert("RGB")
assert pfp.size == (800, 800), pfp.size
def circ(s):
    big = pfp.resize((s * 4, s * 4), Image.LANCZOS)
    m = Image.new("L", big.size, 0)
    ImageDraw.Draw(m).ellipse((0, 0, s * 4 - 1, s * 4 - 1), fill=255)
    big.putalpha(m)
    return big.resize((s, s), Image.LANCZOS)
pad = 40
W, H = pad * 3 + 240 + 98, pad * 2 + 240
sheet = Image.new("RGB", (W, H * 2), (15, 15, 15))
ImageDraw.Draw(sheet).rectangle((0, H, W, H * 2), fill=(255, 255, 255))
for row in (0, 1):
    y = row * H
    sheet.paste(c := circ(240), (pad, y + pad), c)
    sheet.paste(c := circ(98), (pad * 2 + 240, y + pad + 71), c)
sheet.save(f"{out}/preview_circle.png")
print(f"{out}/preview_phone.png  {out}/preview_circle.png")
