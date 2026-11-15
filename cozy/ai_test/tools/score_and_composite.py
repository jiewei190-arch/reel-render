"""Anti-drift pipeline for one AI shot: key -> score every frame vs the owner's reference -> reject/pick ->
palette lock -> composite over the owner's room -> mp4 + side-by-side with the puppet version.

Run with a Python that has torch (e.g. the ComfyUI venv):
  python score_and_composite.py --work ../work --bg <bg_table_empty.png> --puppet <MOTION_TEST.mp4> --out ../ --ffmpeg <ffmpeg.exe>

Drift scoring (rule 4 of the brief), per frame, on the keyed bear composited on white:
  * DINOv2 ViT-L/14 (reg4) CLS cosine similarity to the owner's stirring drawing.
    Threshold = the LOWEST similarity between that drawing and the owner's 8 other expression drawings
    (i.e. a frame must look at least as much like the reference as the owner's own other poses do).
  * nightcap check: share of nightcap-blue pixels vs the reference (must stay within 0.6x..1.6x).
  * outline check: share of warm-brown outline pixels vs the reference (0.6x..1.6x).
A take is rejected if its WORST frame fails any check. The kept take is the passing one with the best worst-frame score.
"""
import argparse, glob, json, os, subprocess
import numpy as np
import torch
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

DINO_REPO = os.path.expanduser('~/.cache/torch/hub/facebookresearch_dinov2_main')


# ---------- keying ----------
def key_green(rgb):
    a = rgb.astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    spill = g - np.maximum(r, b)
    alpha = 1.0 - np.clip((spill - 35.0) / 70.0, 0, 1)
    solid = alpha > 0.5
    lab, n = ndimage.label(solid)
    if n > 1:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        keep = lab == (np.argmax(sizes) + 1)
        keep = ndimage.binary_fill_holes(ndimage.binary_dilation(keep, iterations=2))
        alpha = alpha * keep
    # despill: pull green down toward the other channels where it dominates
    g2 = np.where(spill > 0, np.maximum(r, b) + 0.15 * np.clip(spill, 0, None), g)
    out = np.dstack([r, np.minimum(g, g2), b]).clip(0, 255)
    return out.astype(np.uint8), (alpha * 255).astype(np.uint8)


def on_white(rgb, alpha):
    a = alpha[..., None] / 255.0
    return (rgb * a + 255 * (1 - a)).astype(np.uint8)


def crop_to(rgb, alpha, pad=8):
    ys, xs = np.where(alpha > 128)
    y0, y1, x0, x1 = max(ys.min() - pad, 0), ys.max() + pad, max(xs.min() - pad, 0), xs.max() + pad
    return rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1]


# ---------- colour checks ----------
def hsv(rgb):
    return np.asarray(Image.fromarray(rgb).convert('HSV')).astype(np.float32)


def shares(rgb, alpha):
    m = alpha > 200
    h = hsv(rgb)
    H, S, V = h[..., 0] * 360 / 255, h[..., 1] / 255, h[..., 2] / 255
    blue = m & (H > 195) & (H < 250) & (S > 0.22) & (V > 0.45)
    brown = m & (H > 8) & (H < 40) & (S > 0.45) & (V < 0.55)
    n = max(m.sum(), 1)
    return blue.sum() / n, brown.sum() / n


# ---------- DINOv2 ----------
class Dino:
    def __init__(self, device):
        self.m = torch.hub.load(DINO_REPO, 'dinov2_vitl14_reg', source='local', pretrained=False)
        sd = torch.load(os.path.expanduser('~/.cache/torch/hub/checkpoints/dinov2_vitl14_reg4_pretrain.pth'), map_location='cpu')
        self.m.load_state_dict(sd)
        self.m.eval().to(device)
        self.dev = device
        self.mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
        self.std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)

    @torch.no_grad()
    def embed(self, imgs):
        xs = []
        for im in imgs:
            im = Image.fromarray(im).convert('RGB')
            s = 224 / max(im.size)
            im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.BICUBIC)
            c = Image.new('RGB', (224, 224), (255, 255, 255))
            c.paste(im, ((224 - im.width) // 2, (224 - im.height) // 2))
            xs.append(torch.from_numpy(np.asarray(c)).permute(2, 0, 1).float() / 255)
        out = []
        for i in range(0, len(xs), 16):
            x = (torch.stack(xs[i:i + 16]) - self.mean) / self.std
            f = self.m(x.to(self.dev)).float().cpu()
            out.append(torch.nn.functional.normalize(f, dim=-1))
        return torch.cat(out)


# ---------- palette lock ----------
def match_lut(src, ref):
    """Per-channel histogram-matching LUTs (src pixels -> ref distribution)."""
    luts = []
    for c in range(3):
        sh = np.bincount(src[:, c], minlength=256).astype(np.float64)
        rh = np.bincount(ref[:, c], minlength=256).astype(np.float64)
        sc, rc = np.cumsum(sh) / sh.sum(), np.cumsum(rh) / rh.sum()
        luts.append(np.interp(sc, rc, np.arange(256)))
    return luts


def apply_lut(rgb, luts, amount=0.85):
    out = rgb.astype(np.float32).copy()
    for c in range(3):
        out[..., c] = (1 - amount) * out[..., c] + amount * luts[c][rgb[..., c]]
    return out.clip(0, 255).astype(np.uint8)


# ---------- steam (drawn, not AI) ----------
def steam(draw_layer, t, cx, top, scale):
    d = ImageDraw.Draw(draw_layer)
    for k in range(3):
        ph = (t * 0.55 + k / 3.0) % 1.0
        x0 = cx + (k - 1) * 34 * scale
        pts = []
        for j in range(14):
            u = j / 13
            y = top - (40 + 230 * ph + 120 * u) * scale
            x = x0 + 16 * scale * np.sin(6.0 * u + t * 3.2 + k) - 0.55 * (40 + 230 * ph + 120 * u) * scale  # lean left, away from the face
            pts.append((x, y))
        a = int(150 * np.sin(np.pi * ph) ** 1.2)
        d.line(pts, fill=(255, 250, 240, a), width=int(14 * scale), joint='curve')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--work', required=True)
    ap.add_argument('--bg', required=True)
    ap.add_argument('--puppet', required=True)
    ap.add_argument('--puppet-span', default='5.3,7.5')
    ap.add_argument('--out', required=True)
    ap.add_argument('--ffmpeg', default='ffmpeg')
    ap.add_argument('--fps', type=int, default=24)
    a = ap.parse_args()
    dev = 'cuda' if torch.cuda.is_available() else 'cpu'
    W = a.work
    ref = np.asarray(Image.open(os.path.join(W, 'ref_bear_stir.png')).convert('RGBA'))
    ref_rgb, ref_a = ref[..., :3], ref[..., 3]
    tiles = {os.path.basename(p)[:-4]: np.asarray(Image.open(p).convert('RGBA')) for p in glob.glob(os.path.join(W, 'ref_tiles', '*.png'))}

    dino = Dino(dev)
    e_ref = dino.embed([on_white(ref_rgb, ref_a)])[0]
    others = {k: v for k, v in tiles.items() if k != 'stir_pot'}
    e_oth = dino.embed([on_white(v[..., :3], v[..., 3]) for v in others.values()])
    cal = {k: round(float(e @ e_ref), 4) for k, e in zip(others, e_oth)}
    thr = min(cal.values())
    rb, rbr = shares(ref_rgb, ref_a)
    print('calibration (owner drawings vs stir ref):', cal, 'threshold', thr, 'ref blue', round(rb, 4), 'ref outline', round(rbr, 4))

    takes = sorted(glob.glob(os.path.join(W, 'takes', 'seed*')))
    report = {'threshold_dino': thr, 'calibration': cal, 'ref_blue_share': rb, 'ref_outline_share': rbr, 'takes': {}}
    keyed_cache = {}
    for td in takes:
        frames = sorted(glob.glob(os.path.join(td, 'frame_*.png')))
        rgbs, alphas, crops = [], [], []
        for f in frames:
            rgb, al = key_green(np.asarray(Image.open(f).convert('RGB')))
            rgbs.append(rgb); alphas.append(al)
            c_rgb, c_a = crop_to(rgb, al)
            crops.append(on_white(c_rgb, c_a))
        e = dino.embed(crops)
        sims = (e @ e_ref).numpy()
        sh = np.array([shares(r, al) for r, al in zip(rgbs, alphas)])
        blue_ratio, out_ratio = sh[:, 0] / rb, sh[:, 1] / rbr
        fails = []
        if sims.min() < thr: fails.append(f'dino worst {sims.min():.3f} < {thr:.3f} at frame {int(sims.argmin())}')
        if blue_ratio.min() < 0.6 or blue_ratio.max() > 1.6: fails.append(f'nightcap blue ratio {blue_ratio.min():.2f}..{blue_ratio.max():.2f}')
        if out_ratio.min() < 0.6 or out_ratio.max() > 1.6: fails.append(f'outline ratio {out_ratio.min():.2f}..{out_ratio.max():.2f}')
        name = os.path.basename(td)
        report['takes'][name] = {'frames': len(frames), 'dino_mean': round(float(sims.mean()), 4), 'dino_worst': round(float(sims.min()), 4),
                                 'worst_frame': int(sims.argmin()), 'blue_ratio': [round(float(blue_ratio.min()), 3), round(float(blue_ratio.max()), 3)],
                                 'outline_ratio': [round(float(out_ratio.min()), 3), round(float(out_ratio.max()), 3)],
                                 'pass': not fails, 'fails': fails, 'dino_per_frame': [round(float(s), 4) for s in sims]}
        keyed_cache[name] = (rgbs, alphas)
        print(name, 'PASS' if not fails else 'REJECT', report['takes'][name]['dino_worst'], fails)

    passing = [k for k, v in report['takes'].items() if v['pass']]
    pool = passing or list(report['takes'])
    best = max(pool, key=lambda k: report['takes'][k]['dino_worst'])
    report['kept'] = best
    report['kept_note'] = 'passed all checks' if passing else 'NO take passed; kept the least-drifted one for review'
    rgbs, alphas = keyed_cache[best]

    # palette lock: one LUT from the whole kept take to the owner's drawing (stable, no per-frame flicker)
    src = np.concatenate([r[al > 230] for r, al in zip(rgbs, alphas)])[::7]
    luts = match_lut(src, ref_rgb[ref_a > 230])
    rgbs = [apply_lut(r, luts) for r in rgbs]
    sims_after = (dino.embed([on_white(*crop_to(r, al)) for r, al in zip(rgbs, alphas)]) @ e_ref).numpy()
    report['kept_after_palette_lock'] = {'dino_mean': round(float(sims_after.mean()), 4), 'dino_worst': round(float(sims_after.min()), 4)}

    # composite over the owner's room (bg never changes) + drawn steam; table front re-drawn over the bear
    bg = Image.open(a.bg).convert('RGBA')
    BW, BH = bg.size
    front = bg.crop((0, 1092, BW, BH))
    S = 1.55                       # 640 px AI frame -> on-screen size
    side = round(640 * S)
    burner_x = 330
    ox = burner_x - round(205 * S)  # pot centre in the AI frame is ~x=205
    oy = 1100 - round(600 * S)      # pot bottom in the AI frame is ~y=600 -> table top 1100
    fr_dir = os.path.join(W, 'final_frames'); os.makedirs(fr_dir, exist_ok=True)
    for f in glob.glob(os.path.join(fr_dir, '*.png')): os.remove(f)
    for i, (r, al) in enumerate(zip(rgbs, alphas)):
        t = i / a.fps
        layer = Image.fromarray(np.dstack([r, al]), 'RGBA').resize((side, side), Image.LANCZOS)
        im = bg.copy()
        im.alpha_composite(layer, (ox, oy))
        st = Image.new('RGBA', bg.size, (0, 0, 0, 0))
        steam(st, t, burner_x - 40, oy + round(445 * S), 1.3)
        im.alpha_composite(st.filter(ImageFilter.GaussianBlur(6)))
        im.alpha_composite(front, (0, 1092))
        im.convert('RGB').save(os.path.join(fr_dir, f'f_{i:05d}.png'))

    out_mp4 = os.path.join(a.out, 'stir.mp4')
    subprocess.run([a.ffmpeg, '-y', '-v', 'error', '-framerate', str(a.fps), '-i', os.path.join(fr_dir, 'f_%05d.png'),
                    '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out_mp4], check=True)
    # side by side: puppet (kit) | AI, both 540x960, same length
    t0, t1 = map(float, a.puppet_span.split(','))
    dur = len(rgbs) / a.fps
    sbs = os.path.join(a.out, 'stir_vs_puppet.mp4')
    fc = (f"[0:v]trim={t0}:{t1},setpts=PTS-STARTPTS,loop=-1:size=999,trim=0:{dur:.3f},setpts=PTS-STARTPTS,scale=540:960,"
          f"drawtext=fontfile='C\:/Windows/Fonts/arial.ttf':text='puppet (kit)':x=20:y=20:fontsize=34:fontcolor=white:box=1:boxcolor=black@0.5[l];"
          f"[1:v]scale=540:960,drawtext=fontfile='C\:/Windows/Fonts/arial.ttf':text='AI - Wan 2.2 5B first+last frame':x=20:y=20:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.5[r];"
          f"[l][r]hstack=inputs=2[v]")
    subprocess.run([a.ffmpeg, '-y', '-v', 'error', '-i', a.puppet, '-i', out_mp4, '-filter_complex', fc, '-map', '[v]',
                    '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', str(a.fps), sbs], check=True)
    for k in report['takes']:
        report['takes'][k].pop('dino_per_frame_short', None)
    json.dump(report, open(os.path.join(a.out, 'drift_scores.json'), 'w'), indent=1)
    print('kept', best, report['kept_note'], report['kept_after_palette_lock'])


if __name__ == '__main__':
    main()
