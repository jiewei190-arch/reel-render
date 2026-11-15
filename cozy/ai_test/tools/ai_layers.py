"""Anti-drift pipeline for one AI shot of the cooking test -> keyed RGBA layer frames the kit scene draws over the owner's room.

python ai_layers.py --takes ../work/takes_cook1 --tiles ../work/ref_tiles --refs happy o --out <project>/ai/s1 --report <json>
    [--stand-cut 40 --keep-x0 330]   (stir shot: pot stays, the bear's feet right of x=330 are replaced by its body
                                      continuing straight down, so it reads as standing BEHIND the table)

Per frame: chroma key -> DINOv2 similarity to the closest of the shot's reference drawings (first/last keyframe drawings),
nightcap-blue and outline-brown shares vs those drawings. Threshold = lowest similarity between the reference drawing and
the owner's OTHER expression drawings (calibrated per shot). A take is rejected if its worst frame fails any check;
the passing take with the best worst-frame score is kept, palette-locked with one LUT to the reference, and exported.
Run with the ComfyUI venv python (torch).
"""
import argparse, glob, json, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from score_and_composite import key_green, on_white, crop_to, shares, Dino, match_lut, apply_lut  # noqa: E402


def stand_behind(rgb, al, cut, keep_x0):
    """Replace everything below (bottom - cut) for columns >= keep_x0 by that row repeated down to the frame edge."""
    rgb, al = rgb.copy(), al.copy()
    cols = np.where((al[:, keep_x0:] > 128).any(axis=0))[0] + keep_x0
    if not len(cols): return rgb, al
    bottom = max(np.where(al[:, c] > 128)[0].max() for c in cols)
    # cut at the widest row of the lower body (within `cut` px above the feet), so the body continues straight down
    sub = al[bottom - cut:bottom - 22, keep_x0:] > 128
    widths = [(np.where(r)[0].max() if r.any() else 0) for r in sub]
    y = bottom - cut + int(np.argmax(widths))
    rgb[y:, keep_x0:] = rgb[y:y + 1, keep_x0:]
    al[y:, keep_x0:] = al[y:y + 1, keep_x0:]
    return rgb, al


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--takes', required=True); ap.add_argument('--tiles', required=True)
    ap.add_argument('--refs', nargs='+', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--report', required=True)
    ap.add_argument('--stand-cut', type=int, default=0); ap.add_argument('--keep-x0', type=int, default=0)
    ap.add_argument('--frames', type=int, default=0, help='export only the first N frames (0 = all)')
    ap.add_argument('--force-take', default='')
    a = ap.parse_args()
    import torch
    dino = Dino('cuda' if torch.cuda.is_available() else 'cpu')
    tiles = {os.path.basename(p)[:-4]: np.asarray(Image.open(p).convert('RGBA')) for p in glob.glob(os.path.join(a.tiles, '*.png'))}
    refs = [tiles[r] for r in a.refs]
    e_refs = dino.embed([on_white(r[..., :3], r[..., 3]) for r in refs])
    others = {k: v for k, v in tiles.items() if k not in a.refs}
    e_oth = dino.embed([on_white(v[..., :3], v[..., 3]) for v in others.values()])
    cal = {k: round(float((e_refs @ e).max()), 4) for k, e in zip(others, e_oth)}
    thr = min(cal.values())
    rs = np.array([shares(r[..., :3], r[..., 3]) for r in refs]).mean(axis=0)
    rep = {'refs': a.refs, 'threshold_dino': thr, 'calibration': cal, 'ref_blue_share': float(rs[0]), 'ref_outline_share': float(rs[1]), 'takes': {}}
    cache = {}
    for td in sorted(glob.glob(os.path.join(a.takes, 'seed*'))):
        fs = sorted(glob.glob(os.path.join(td, 'frame_*.png')))
        rgbs, als = zip(*[key_green(np.asarray(Image.open(f).convert('RGB'))) for f in fs])
        e = dino.embed([on_white(*crop_to(r, al)) for r, al in zip(rgbs, als)])
        sims = (e @ e_refs.T).max(dim=1).values.numpy()
        sh = np.array([shares(r, al) for r, al in zip(rgbs, als)])
        br, orr = sh[:, 0] / rs[0], sh[:, 1] / rs[1]
        fails = []
        if sims.min() < thr: fails.append(f'dino worst {sims.min():.3f} < {thr:.3f} at frame {int(sims.argmin())}')
        if br.min() < 0.6 or br.max() > 1.6: fails.append(f'nightcap blue ratio {br.min():.2f}..{br.max():.2f}')
        if orr.min() < 0.6 or orr.max() > 1.6: fails.append(f'outline ratio {orr.min():.2f}..{orr.max():.2f}')
        n = os.path.basename(td)
        rep['takes'][n] = {'frames': len(fs), 'dino_mean': round(float(sims.mean()), 4), 'dino_worst': round(float(sims.min()), 4),
                           'worst_frame': int(sims.argmin()), 'blue_ratio': [round(float(br.min()), 3), round(float(br.max()), 3)],
                           'outline_ratio': [round(float(orr.min()), 3), round(float(orr.max()), 3)], 'pass': not fails, 'fails': fails,
                           'dino_per_frame': [round(float(s), 4) for s in sims]}
        cache[n] = (list(rgbs), list(als))
        print(n, 'PASS' if not fails else 'REJECT', rep['takes'][n]['dino_worst'], fails, flush=True)
    passing = [k for k, v in rep['takes'].items() if v['pass']]
    best = a.force_take or max(passing or list(rep['takes']), key=lambda k: rep['takes'][k]['dino_worst'])
    rep['kept'] = best
    rep['kept_note'] = ('forced by hand: ' if a.force_take else '') + ('passed all checks' if rep['takes'][best]['pass'] else 'NO take passed; least-drifted kept for review')
    rgbs, als = cache[best]
    ref0 = refs[0]
    luts = match_lut(np.concatenate([r[al > 230] for r, al in zip(rgbs, als)])[::7], ref0[..., :3][ref0[..., 3] > 230])
    rgbs = [apply_lut(r, luts) for r in rgbs]
    after = (dino.embed([on_white(*crop_to(r, al)) for r, al in zip(rgbs, als)]) @ e_refs.T).max(dim=1).values.numpy()
    rep['kept_after_palette_lock'] = {'dino_mean': round(float(after.mean()), 4), 'dino_worst': round(float(after.min()), 4)}
    os.makedirs(a.out, exist_ok=True)
    for f in glob.glob(os.path.join(a.out, '*.png')): os.remove(f)
    N = a.frames or len(rgbs)
    for i in range(N):
        r, al = rgbs[i], als[i]
        if a.stand_cut: r, al = stand_behind(r, al, a.stand_cut, a.keep_x0)
        Image.fromarray(np.dstack([r, al]), 'RGBA').save(os.path.join(a.out, f'f_{i:05d}.png'))
    rep['exported_frames'] = N
    json.dump(rep, open(a.report, 'w'), indent=1)
    print('kept', best, rep['kept_note'], rep['kept_after_palette_lock'], flush=True)


if __name__ == '__main__':
    main()
