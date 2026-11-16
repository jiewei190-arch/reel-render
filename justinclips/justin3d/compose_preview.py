#!/usr/bin/env python3
"""Composite rendered Justin reaction clips (RGBA PNG frames) over a finished Short.

    python3 compose_preview.py base.mp4 out.mp4 plan.json

plan.json: {"overlays": [{"frames": "dir/", "start": 5.3, "x": 0, "y": 1440, "w": 360,
                          "slide": "left|right|bottom|none", "slide_dur": 0.12}]}
Each overlay gets a soft drop shadow and a slight warm rim light so he sits in a
bright toon scene. The base audio is copied untouched (its loudness master is kept).
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter

base, out, plan = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3]))
pr = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                         "stream=width,height,r_frame_rate", "-of", "json", base]))["streams"][0]
W, H = pr["width"], pr["height"]; n, d = map(int, pr["r_frame_rate"].split("/")); fps = n / d

ovs = []
for o in plan["overlays"]:
    files = sorted(f for f in os.listdir(o["frames"]) if f.endswith(".png"))
    frames = []
    for f in files:
        im = Image.open(os.path.join(o["frames"], f)).convert("RGBA")
        h = int(o["w"] * im.height / im.width)
        im = im.resize((o["w"], h), Image.LANCZOS)
        a = im.getchannel("A")
        # soft shadow (down-right) and warm rim on the up-left/up edges
        sh = a.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.38))
        an = np.asarray(a, dtype=np.float32) / 255
        shift = np.zeros_like(an); shift[4:, 3:] = an[:-4, :-3]
        rim = np.clip(an - shift, 0, 1)
        rim = np.asarray(Image.fromarray((rim * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)),
                         dtype=np.float32) / 255 * an
        rgb = np.asarray(im, dtype=np.float32)[..., :3]
        rgb = rgb + rim[..., None] * 0.45 * (np.array([255, 244, 220]) - rgb)
        frames.append((rgb, an, np.asarray(sh, dtype=np.float32) / 255))
    ovs.append(dict(o, frames=frames))

dec = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-i", base, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                       stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                        "-r", pr["r_frame_rate"], "-i", "-", "-i", base, "-map", "0:v", "-map", "1:a", "-c:a", "copy",
                        "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p",
                        "-movflags", "+faststart", "-shortest", out], stdin=subprocess.PIPE)
fi = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    img = np.frombuffer(buf, dtype=np.uint8).reshape(H, W, 3).astype(np.float32)
    t = fi / fps
    for o in ovs:
        k = int(round((t - o["start"]) * fps))
        if k < 0 or k >= len(o["frames"]):
            continue
        rgb, a, sh = o["frames"][k]
        oh, ow = a.shape
        x, y = o["x"], o["y"]
        sd = o.get("slide_dur", 0.12); sl = o.get("slide", "none")
        tin = (t - o["start"]) / sd; tout = (o["start"] + len(o["frames"]) / fps - t) / sd
        e = min(1.0, tin, tout if o.get("slide_out", True) else 1.0)
        e = 1 - (1 - max(0.0, e)) ** 3
        if sl == "left": x = int(x - (1 - e) * (ow + x))
        elif sl == "right": x = int(x + (1 - e) * (W - x))
        elif sl == "bottom": y = int(y + (1 - e) * (H - y))
        for (lay, dx, dy) in ((sh, 14, 16), (None, 0, 0)):
            X0, Y0 = x + dx, y + dy
            xa, ya = max(0, X0), max(0, Y0); xb, yb = min(W, X0 + ow), min(H, Y0 + oh)
            if xb <= xa or yb <= ya:
                continue
            sub = (slice(ya - Y0, yb - Y0), slice(xa - X0, xb - X0))
            reg = img[ya:yb, xa:xb]
            if lay is not None:
                reg *= (1 - lay[sub][..., None] * np.array([1, 1, 0.95]))
            else:
                al = a[sub][..., None]
                reg[:] = rgb[sub] * al + reg * (1 - al)   # PNG from Blender is straight alpha
    enc.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
    fi += 1
enc.stdin.close(); enc.wait(); dec.wait()
print("wrote", out, fi, "frames")
