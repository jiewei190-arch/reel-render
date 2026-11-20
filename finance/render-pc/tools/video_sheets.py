"""video_sheets.py <video.mp4> <plan.gen.ts> <out_dir> [tag]

From a rendered video: frame0.jpg (frame 0, full size), strip_0-2s.jpg (frames 0,10,...,60 with times),
contact_sheet.jpg (each plan shot at 60 % of its length, labelled with shot id, frame and time).
Frames are pulled with ffmpeg, so the sheets show exactly what was rendered (overlays and captions included).
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

video, plan, out = sys.argv[1], sys.argv[2], Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
shots = json.loads(re.search(r"SHOTS = (\[.*?\]) as const", Path(plan).read_text()).group(1))
FPS = 30
tmp = Path(tempfile.mkdtemp())


def grab(n):
    p = tmp / f"f{n:05d}.png"
    if not p.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", f"select=eq(n\\,{n})", "-vframes", "1", str(p)], check=True)
    return Image.open(p).convert("RGB")


try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 17)
except OSError:
    font = ImageFont.load_default()


def sheet(frames, labels, cols, scale, path):
    ims = [grab(n) for n in frames]
    w, h = int(ims[0].width * scale), int(ims[0].height * scale)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new("RGB", (w * cols, (h + 40) * rows), "white")
    d = ImageDraw.Draw(S)
    for k, (im, lab) in enumerate(zip(ims, labels)):
        x, y = (k % cols) * w, (k // cols) * (h + 40)
        S.paste(im.resize((w, h)), (x, y + 40))
        d.text((x + 8, y + 6), lab, fill="black", font=font)
    S.save(path, quality=88)
    print(path, len(ims))


grab(0).save(out / "frame0.jpg", quality=92)
print(out / "frame0.jpg")
strip = [0, 10, 20, 30, 40, 50, 60]
sheet(strip, [f"f{n} {n / FPS:.2f}s" for n in strip], len(strip), 0.25, out / "strip_0-2s.jpg")
fr = [min(int(round((s["t"] * 0.4 + s["end"] * 0.6) * FPS)), int(shots[-1]["end"] * FPS) - 1) for s in shots]
sheet(fr, [f"{s['id']} f{n} {n / FPS:.2f}s" for s, n in zip(shots, fr)], 6, 0.25, out / "contact_sheet.jpg")
