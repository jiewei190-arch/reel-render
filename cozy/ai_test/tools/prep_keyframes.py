"""Cut the owner's 'stirring the sage pot' drawing out of expressions_sheet.png and build the AI keyframes.

Outputs (in --out):
  ref_bear_stir.png   RGBA cut-out of the owner's drawing (the on-model reference)
  ref_tiles/*.png     every expression tile cut out (used to calibrate the drift threshold)
  key_first.png       keyframe on flat chroma green, SIZE x SIZE (first frame)
  key_last.png        same drawing (last frame = first frame, so the clip loops and both ends are exactly on-model)
"""
import argparse, os
import numpy as np
from PIL import Image
from scipy import ndimage

CHROMA = (0, 255, 0)


def cut_tile(tile_rgb):
    """White-background tile -> RGBA. Background = white region connected to the border."""
    a = np.asarray(tile_rgb).astype(np.int16)
    whiteish = (a.min(axis=2) > 232) & (np.ptp(a, axis=2) < 22)
    lab, _ = ndimage.label(whiteish)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    alpha = (~bg).astype(np.uint8) * 255
    # keep the largest blob (drop specks), fill holes, soften edge by 1 px
    lab2, n = ndimage.label(alpha > 0)
    if n > 1:
        sizes = ndimage.sum(alpha > 0, lab2, range(1, n + 1))
        alpha = (lab2 == (np.argmax(sizes) + 1)).astype(np.uint8) * 255
    alpha = ndimage.binary_fill_holes(alpha > 0).astype(np.uint8) * 255
    alpha = ndimage.uniform_filter(alpha.astype(np.float32), 3).clip(0, 255).astype(np.uint8)
    rgba = np.dstack([np.asarray(tile_rgb), alpha])
    im = Image.fromarray(rgba, 'RGBA')
    return im.crop(im.getbbox())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sheet', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--size', type=int, default=640)
    ap.add_argument('--fill', type=float, default=0.86, help='bear height as a fraction of the canvas')
    a = ap.parse_args()
    os.makedirs(os.path.join(a.out, 'ref_tiles'), exist_ok=True)
    sheet = Image.open(a.sheet).convert('RGB')
    W, H = sheet.size
    tw, th = W // 3, H // 3
    names = ['happy', 'grumpy', 'o', 'eat_spoon', 'stir_pot', 'bowl', 'side_walk', 'cry', 'wave']
    cut = {}
    for i, nm in enumerate(names):
        r, c = divmod(i, 3)
        t = cut_tile(sheet.crop((c * tw, r * th, (c + 1) * tw, (r + 1) * th)))
        t.save(os.path.join(a.out, 'ref_tiles', f'{nm}.png'))
        cut[nm] = t
    bear = cut['stir_pot']
    bear.save(os.path.join(a.out, 'ref_bear_stir.png'))
    s = a.size * a.fill / max(bear.size)
    b = bear.resize((round(bear.width * s), round(bear.height * s)), Image.LANCZOS)
    canvas = Image.new('RGB', (a.size, a.size), CHROMA)
    x = (a.size - b.width) // 2
    y = a.size - b.height - round(a.size * 0.04)
    canvas.paste(b, (x, y), b)
    canvas.save(os.path.join(a.out, 'key_first.png'))
    canvas.save(os.path.join(a.out, 'key_last.png'))
    print('bear cut', bear.size, '-> keyframe', canvas.size, 'placed at', (x, y), 'scale', round(s, 3))


if __name__ == '__main__':
    main()
