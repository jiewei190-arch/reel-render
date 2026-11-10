# 1280x720 thumbnail for jobs/long_tech: big 3-5 word text + 3 reel visuals, same studio look as the long-form panels
import pathlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent
ANTON = str(HERE / "styles/aidoom/fonts/Anton.ttf"); INTER = str(HERE / "styles/distilbook/fonts/Inter.ttf")
W, H = 1280, 720; GOLD, INK = (255, 205, 64), (22, 22, 28)
bg = np.ones((H, W, 3), np.float32) * np.array((239, 232, 218), np.float32) + np.random.default_rng(1).normal(0, 6, (H, W, 1))
im = Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
f = ImageFont.truetype(ANTON, 132)
d.text((48, 70), "6 TECH", font=f, fill=INK); d.text((48, 220), "SECRETS", font=f, fill=INK)
d.rounded_rectangle((48, 400, 520, 480), radius=40, fill=GOLD); d.text((284, 440), "YOU USE DAILY", font=ImageFont.truetype(ANTON, 56), fill=INK, anchor="mm")
fi = ImageFont.truetype(INTER, 30)
try: fi.set_variation_by_axes([700])
except Exception: pass
d.text((52, 520), "barcodes · Face ID · tap to pay", font=fi, fill=(90, 88, 84)); d.text((52, 560), "+ 3 more, explained", font=fi, fill=(90, 88, 84))
for k, (n, x, rot) in enumerate((("barcode", 620, 6), ("faceid", 830, -3), ("tap", 1040, 5))):
    th = Image.open(ROOT / f"jobs/{n}/thumb_{n}.jpg").convert("RGB").resize((240, 427))
    fr = Image.new("RGB", (252, 439), (255, 253, 248)); fr.paste(th, (6, 6)); fr = fr.convert("RGBA").rotate(rot, expand=True, resample=Image.BICUBIC)
    sh = Image.new("RGBA", fr.size, (0, 0, 0, 0)); sh.paste((40, 30, 20, 120), (0, 0), fr.split()[3]); sh = sh.filter(ImageFilter.GaussianBlur(10))
    y = 150 + (k % 2) * 40; im.paste(sh, (x - 110 + 8, y + 12), sh); im.paste(fr, (x - 110, y), fr)
d = ImageDraw.Draw(im); d.text((W - 40, 30), "HOW IT REALLY WORKS", font=ImageFont.truetype(INTER, 22), fill=(90, 88, 84), anchor="ra")
im.save(ROOT / "jobs/long_tech/thumb_long_tech.jpg", quality=92); print("ok")
