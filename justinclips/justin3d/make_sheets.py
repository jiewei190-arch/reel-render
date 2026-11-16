#!/usr/bin/env python3
"""Render the review sheets: turnaround.png, expressions.png, concept_vs_render.png.

    python3 make_sheets.py            # final quality
    python3 make_sheets.py --quick    # fast low-res preview into ./_preview/
"""
import argparse, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(HERE, "render_justin.py")
EXPRS = ["smile", "smirk", "shock", "cringe", "skeptical", "angry", "sad", "laugh"]


def font(sz):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def still(out, pose, expr, framing, yaw=0.0, scale=1.0, samples=48, face=None, bg="studio"):
    cmd = [sys.executable, R, "--pose", pose, "--expr", expr, "--framing", framing, "--cam-yaw", str(yaw),
           "--still", out, "--scale", str(scale), "--samples", str(samples), "--bg", bg]
    if face:
        cmd += ["--face", face]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
    return Image.open(out).convert("RGBA")


def label(img, text, y=None, sz=54):
    d = ImageDraw.Draw(img); f = font(sz)
    w = d.textlength(text, font=f)
    y = img.height - sz - 40 if y is None else y
    d.text(((img.width - w) / 2, y), text, font=f, fill=(70, 50, 40))
    return img


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--quick", action="store_true")
    ap.add_argument("--only", default="turn,expr,concept")
    a = ap.parse_args()
    out = os.path.join(HERE, "_preview") if a.quick else HERE
    os.makedirs(out, exist_ok=True)
    sc, smp = (0.4, 12) if a.quick else (1.0, 64)
    tmp = tempfile.mkdtemp()
    only = a.only.split(",")
    if "turn" in only:
        views = [("FRONT", 0), ("3/4", -35), ("SIDE", -90)]
        ims = []
        for name, yaw in views:
            im = still(os.path.join(tmp, f"t{yaw}.png"), "idle", "neutral", "full", yaw, sc, smp)
            im = im.crop((int(im.width * 0.12), 0, int(im.width * 0.88), im.height))
            ims.append(label(im.convert("RGB"), name, sz=int(60 * sc)))
        W = sum(i.width for i in ims); H = ims[0].height
        sheet = Image.new("RGB", (W, H), (235, 214, 196))
        x = 0
        for i in ims:
            sheet.paste(i, (x, 0)); x += i.width
        sheet.save(os.path.join(out, "turnaround.png")); print("turnaround.png")
    if "expr" in only:
        tiles = []
        for e in EXPRS:
            im = still(os.path.join(tmp, f"e_{e}.png"), "idle", e, "close", 0, sc * 0.75, smp)
            im = im.convert("RGB").crop((0, int(im.height * 0.0), im.width, int(im.height * 0.78)))
            tiles.append(label(im, e.upper(), sz=int(64 * sc * 0.75)))
        tw, th = tiles[0].size
        sheet = Image.new("RGB", (tw * 4, th * 2), (235, 214, 196))
        for i, t in enumerate(tiles):
            sheet.paste(t, ((i % 4) * tw, (i // 4) * th))
        sheet.save(os.path.join(out, "expressions.png")); print("expressions.png")
    if "concept" in only:
        c = Image.open(os.path.join(HERE, "concept", "justin_D.png")).convert("RGB")
        r = still(os.path.join(tmp, "c.png"), "wave", "concept", "full", 0, sc, smp,
                  face='{"smirk_L":0.55,"smile":0.25,"look_y":0.25,"brow_up_L":0.2,"brow_up_R":0.2}').convert("RGB")
        r = r.resize((int(r.width * c.height / r.height), c.height))
        pad = 30
        sheet = Image.new("RGB", (c.width + r.width + pad * 3, c.height + 160), (245, 240, 234))
        sheet.paste(c, (pad, 130)); sheet.paste(r, (c.width + pad * 2, 130))
        d = ImageDraw.Draw(sheet); f = font(64)
        d.text((pad, 35), "Concept D (2D)", font=f, fill=(60, 40, 30))
        d.text((c.width + pad * 2, 35), "3D render (rigged)", font=f, fill=(60, 40, 30))
        sheet.save(os.path.join(out, "concept_vs_render.png")); print("concept_vs_render.png")


if __name__ == "__main__":
    main()
