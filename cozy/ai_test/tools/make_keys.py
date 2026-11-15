"""Build AI keyframes on flat chroma green from the owner's expression tiles (cut by prep_keyframes.py).

python make_keys.py --tiles ../work/ref_tiles --out <comfy input dir> --name cook1 --first happy --last o
Writes <name>_first.png and <name>_last.png (640x640, bear 86 % of the height, same placement as the stir test).
"""
import argparse, os
from PIL import Image


def key(tile_path, size=640, fill=0.86):
    bear = Image.open(tile_path).convert('RGBA')
    s = size * fill / max(bear.size)
    b = bear.resize((round(bear.width * s), round(bear.height * s)), Image.LANCZOS)
    c = Image.new('RGB', (size, size), (0, 255, 0))
    c.paste(b, ((size - b.width) // 2, size - b.height - round(size * 0.04)), b)
    return c


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--tiles', required=True); ap.add_argument('--out', required=True); ap.add_argument('--name', required=True)
    ap.add_argument('--first', required=True); ap.add_argument('--last', required=True)
    a = ap.parse_args()
    key(os.path.join(a.tiles, a.first + '.png')).save(os.path.join(a.out, f'{a.name}_first.png'))
    key(os.path.join(a.tiles, a.last + '.png')).save(os.path.join(a.out, f'{a.name}_last.png'))
    print('ok', a.name, a.first, '->', a.last)
