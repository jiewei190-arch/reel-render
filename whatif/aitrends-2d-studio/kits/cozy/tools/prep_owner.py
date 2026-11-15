"""Cut the owner's character + background art into layers for the bear rig.
  python3 kits/cozy/tools/prep_owner.py --src <dir with the owner's PNGs> --out kits/cozy/owner
Inputs (owner's own art, cozy/owner_character/ on the MAIN branch): main_pose.png, turnaround.png, backgrounds_bedroom_kitchen_table.png
Outputs (RGBA): bear_body.png, bear_head.png, bear_hat.png (front rig, main_pose space 1254x1254),
  bear_q.png, bear_side.png (feet removed, walk feet are drawn in code), bear_back.png, bg_bedroom.png, bg_kitchen.png, bg_table.png (1080x1920),
  rig.json (anchor points in each sprite's pixel space).
"""
import argparse, json, os
import numpy as np
from PIL import Image
from scipy import ndimage

def cutout(rgb, thr=238):
    """alpha = everything not connected to the border through near-white pixels; soft edge."""
    white = (rgb.min(2) >= thr)
    lab, n = ndimage.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    a = (~bg).astype(np.float32)
    # soften: pixels next to the background that are light get partial alpha
    edge = ndimage.binary_dilation(bg, iterations=2) & ~bg
    light = rgb.min(2).astype(np.float32)
    a[edge] = np.clip((255 - light[edge]) / (255 - 150), 0, 1)
    a[rgb.min(2) >= 247] = 0          # enclosed paper-white holes (e.g. inside the nightcap curl)
    a = ndimage.gaussian_filter(a, 0.6)
    return a

def rgba(rgb, a): return np.dstack([rgb, (np.clip(a, 0, 1) * 255).astype(np.uint8)])

def inpaint_disc(img, cx, cy, r, ring=8):
    """replace a disc with the median colour of a ring around it (erase eyes / mouth)."""
    H, W = img.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]; d = np.hypot(xx - cx, yy - cy)
    rg = img[(d > r) & (d < r + ring)]; c = np.median(rg.reshape(-1, img.shape[2]), axis=0)
    img[d <= r] = c.astype(img.dtype)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--src", required=True); ap.add_argument("--out", required=True); a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True); rig = {}
    # ---------------- front rig from main_pose.png
    rgb = np.array(Image.open(os.path.join(a.src, "main_pose.png")).convert("RGB"))
    al = cutout(rgb); H, W = al.shape; yy, xx = np.mgrid[0:H, 0:W]
    work = rgb.copy()
    # erase eyes, mouth, belly paw arcs (drawn procedurally)
    for (cx, cy, r) in [(478, 652, 34), (768, 652, 34)]: inpaint_disc(work, cx, cy, r)
    for cx in range(560, 690, 12): inpaint_disc(work, cx, 742, 22)
    for (cx, cy) in [(490, 1040), (745, 1040)]:
        for dy in (-20, -8, 4, 16):
            for dx in range(-62, 64, 10): inpaint_disc(work, cx + dx, cy + dy, 22, 6)
    blue = (rgb[..., 2].astype(int) - rgb[..., 0].astype(int) > 22) & (yy < 400)
    band = np.full(W, 0)
    for x in range(W):
        ys = np.where(blue[:, x])[0]
        if len(ys): band[x] = ys.max()
    hat = ndimage.binary_dilation(blue, iterations=17) & (yy <= band[None, :].repeat(H, 0) + 17)
    hat |= np.hypot(xx - 855, yy - 232) < 52
    hat &= (al > 0) & (yy < 400)
    hat_a = al * hat
    Image.fromarray(rgba(rgb, hat_a)).crop((440, 100, 920, 400)).save(os.path.join(a.out, "bear_hat.png"))
    rig["hat"] = {"crop": [440, 100], "pivot": [625, 372], "pom": [855, 232]}
    # head: everything above the neck, hat removed, top of head filled under the hat, soft fade into the body
    head_a = al.copy(); head_a[hat] = 0
    fill = np.array([254, 233, 203], np.uint8)
    cap = ((xx - 627) / 330) ** 2 + ((yy - 520) / 175) ** 2 <= 1
    hole = cap & (yy < 400) & ~((al > 0) & ~hat)
    hole |= cap & hat
    work[hole] = fill; head_a[hole] = 1
    ring = (((xx - 627) / 330) ** 2 + ((yy - 520) / 175) ** 2 > 0.93) & cap & (yy < 392) & (xx > 452) & (xx < 805)
    work[ring] = np.array([107, 54, 18], np.uint8)
    head_a[(yy < 345) & (xx > 452) & (xx < 815) & ~hole] = 0
    fade = np.clip((1010 - yy) / 45.0, 0, 1)
    inner = (xx > 425) & (xx < 815)
    head_a = np.where(inner & (yy > 960), head_a * fade, head_a); head_a[yy >= 1010] = 0
    Image.fromarray(rgba(work, head_a)).crop((140, 250, 1110, 1015)).save(os.path.join(a.out, "bear_head.png"))
    rig["head"] = {"crop": [140, 250], "pivot": [627, 990], "eyes": [[478, 652], [768, 652]], "nose": [622, 682], "mouth": [622, 745], "cheeks": [[355, 730], [890, 730]]}
    # body: below the neck + filled underneath the head
    body_a = al.copy(); body_a[yy < 990] = 0; body_a[(xx < 398) | (xx > 838)] = 0
    under = (((xx - 615) / 205) ** 2 + ((yy - 1005) / 105) ** 2 <= 1) & (yy < 1005)
    work2 = work.copy(); work2[under] = fill; body_a[under] = 1
    Image.fromarray(rgba(work2, body_a)).crop((380, 890, 870, 1205)).save(os.path.join(a.out, "bear_body.png"))
    rig["body"] = {"crop": [380, 890], "neck": [627, 1000], "feet": [627, 1192], "shoulders": [[452, 1030], [800, 1030]], "hips": [[490, 1170], [745, 1170]]}
    # ---------------- turnaround views
    t = np.array(Image.open(os.path.join(a.src, "turnaround.png")).convert("RGB"))
    ta = cutout(t); TH, TW = ta.shape; ty, tx = np.mgrid[0:TH, 0:TW]
    spans = {"front": (40, 562), "q": (596, 1090), "side": (1123, 1573), "back": (1608, 2130)}
    ts = t.copy(); tal = ta.copy()
    # side: remove the visible foot and rebuild the belly outline (feet are animated in code)
    x0, x1 = 1262, 1350
    low = []
    for x in range(1180, 1520):
        ys = np.where(ta[:, x] > 0.5)[0]; low.append(ys.max() if len(ys) else 0)
    low = np.array(low, float); cols = np.arange(1180, 1520)
    keep = (cols < x0) | (cols > x1); base = np.interp(cols, cols[keep], low[keep])
    fillc = np.median(t[625:640, 1380:1420].reshape(-1, 3), axis=0).astype(np.uint8)
    for i, x in enumerate(cols):
        if x0 <= x <= x1:
            b = int(round(base[i])); top = 630
            ts[top:b - 13, x] = fillc; ts[b - 13:b + 1, x] = (107, 54, 18); tal[top:b + 1, x] = 1; tal[b + 1:, x] = 0
    for name, (s0, s1) in spans.items():
        sub_a = tal[:, s0:s1].copy(); sub = ts[:, s0:s1]
        Image.fromarray(rgba(sub, sub_a)).save(os.path.join(a.out, f"bear_{name}.png"))
    rig["side"] = {"feet": [1290 - 1123, 668], "hip": [1300 - 1123, 600], "w": 1573 - 1123}
    rig["q"] = {"feet": [843 - 596, 690]}; rig["back"] = {"feet": [1869 - 1608, 690]}; rig["front"] = {"feet": [301 - 40, 690]}
    # ---------------- backgrounds (three 9:16 panels)
    bg = Image.open(os.path.join(a.src, "backgrounds_bedroom_kitchen_table.png")).convert("RGB")
    for name, (b0, b1) in {"bedroom": (0, 541), "kitchen": (546, 1084), "table": (1089, 1629)}.items():
        p = bg.crop((b0, 0, b1, 965)).resize((1080, 1930), Image.LANCZOS).crop((0, 5, 1080, 1925))
        p.save(os.path.join(a.out, f"bg_{name}.png"))
    # table panel without the pot (our pan goes on the burner)
    tb = np.array(Image.open(os.path.join(a.out, "bg_table.png"))).astype(np.float32)
    y0, y1, xa, xb = 730, 1016, 60, 660
    rnd = np.random.default_rng(3).normal(0, 2.5, (y1 - y0, xb - xa, 1))
    u = np.linspace(0, 1, xb - xa)[:, None]
    for y in range(y0, y1):
        k = min(np.clip((y1 - y) / 16, 0, 1), np.clip((y - y0) / 24, 0, 1))
        L = tb[y, xa - 12:xa - 4].mean(0); R = tb[y, xb + 4:xb + 12].mean(0)
        tb[y, xa:xb] = tb[y, xa:xb] * (1 - k) + (L * (1 - u) + R * u + rnd[y - y0]) * k
    Image.fromarray(tb.clip(0, 255).astype(np.uint8)).save(os.path.join(a.out, "bg_table_empty.png"))
    json.dump(rig, open(os.path.join(a.out, "rig.json"), "w"), indent=1)
    print("ok", sorted(os.listdir(a.out)))

if __name__ == "__main__":
    main()
