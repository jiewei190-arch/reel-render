# Episode badge for TikTok/YouTube copies: jobs/<n>/<n>.mp4 -> jobs/<n>/<n>_ep.mp4
# Usage: python3 -I brand.py <name> [<name> ...]   (episode numbers come from handoff/episodes.csv)
import csv, pathlib, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parent
F_EP = str(HERE / "styles/aidoom/fonts/Anton.ttf"); F_TX = str(HERE / "styles/distilbook/fonts/Inter.ttf")
EPS = {r["reel"]: int(r["episode"]) for r in csv.DictReader(open(ROOT / "handoff/episodes.csv"))}
X, Y = 44, 196  # top-left, below the TikTok/Shorts top bar, clear of the right-side buttons

def badge(ep):
    s = 2; ep_f = ImageFont.truetype(F_EP, 50 * s); tx_f = ImageFont.truetype(F_TX, 19 * s)
    try: tx_f.set_variation_by_axes([700])
    except Exception: pass
    ep_t = f"EP {ep:02d}"; tx_t = "HOW IT REALLY WORKS"
    ew = ep_f.getbbox(ep_t)[2]; tw = tx_f.getbbox(tx_t)[2]
    pad = 18 * s; gap = 16 * s; h = 74 * s; w = pad + ew + gap + 3 * s + gap + tw + pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=(14, 14, 18, 178), outline=(255, 255, 255, 60), width=s)
    d.text((pad, h / 2), ep_t, font=ep_f, fill=(255, 205, 64, 255), anchor="lm")
    x = pad + ew + gap; d.rectangle((x, h * .28, x + 3 * s, h * .72), fill=(255, 255, 255, 110))
    d.text((x + 3 * s + gap, h / 2), tx_t, font=tx_f, fill=(255, 255, 255, 235), anchor="lm")
    return im.resize((w // s, h // s), Image.LANCZOS)

for n in sys.argv[1:]:
    src = ROOT / f"jobs/{n}/{n}.mp4"; dst = ROOT / f"jobs/{n}/{n}_ep.mp4"; png = HERE / f"stills/badge_{n}.png"
    png.parent.mkdir(exist_ok=True); badge(EPS[n]).save(png)
    # fade in at 0.4 s so frame 0 stays the hook image; hold to the end
    fc = f"[1]format=rgba,fade=in:st=0.4:d=0.35:alpha=1[b];[0][b]overlay={X}:{Y}:shortest=1"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-loop", "1", "-i", str(png), "-filter_complex", fc,
                    "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-maxrate", "14M", "-bufsize", "20M", "-pix_fmt", "yuv420p",
                    "-c:a", "copy", "-movflags", "+faststart", str(dst)], check=True)
    print(n, EPS[n], dst.stat().st_size)
