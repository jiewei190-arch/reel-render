# Compare a reference frame and one of ours: band colours, saturation, contrast, detail (texture) energy.
import sys, colorsys
from PIL import Image, ImageFilter, ImageStat

def load(path, crop=None):
    im = Image.open(path).convert('RGB')
    if crop: im = im.crop(crop)
    return im.resize((540, 960))

def band(im, y0, y1):
    r = im.crop((0, int(y0 * 960), 540, int(y1 * 960)))
    m = ImageStat.Stat(r).mean
    h, s, v = colorsys.rgb_to_hsv(*[c / 255 for c in m])
    return '#%02x%02x%02x' % tuple(int(c) for c in m), round(s, 2), round(v, 2)

def detail(im):
    g = im.convert('L')
    lap = g.filter(ImageFilter.Kernel((3, 3), [0, 1, 0, 1, -4, 1, 0, 1, 0], 1, 128))
    return round(ImageStat.Stat(lap).stddev[0], 2)

def sat(im):
    hsv = im.convert('HSV'); return round(ImageStat.Stat(hsv).mean[1] / 255, 3)

for label, path, crop in [a.split('|') + [None] if a.count('|') == 1 else a.split('|') for a in sys.argv[1:]]:
    c = tuple(int(x) for x in crop.split(',')) if crop else None
    im = load(path, c)
    print(f'== {label}')
    for name, (y0, y1) in {'sky top': (.03, .12), 'sky mid': (.2, .3), 'near horizon': (.42, .48), 'ground mid': (.62, .72), 'ground low': (.82, .95)}.items():
        print(f'  {name:13s}', *band(im, y0, y1))
    print('  mean saturation', sat(im), ' contrast(L std)', round(ImageStat.Stat(im.convert("L")).stddev[0], 1), ' detail', detail(im))
