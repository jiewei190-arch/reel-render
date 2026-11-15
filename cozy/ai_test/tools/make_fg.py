"""Cut foreground layers from the owner's table room (bg_table_empty.png) so a bear layer can stand BEHIND the table.
fg_table.png  : everything from the table's back edge (y>=1092) down
fg_plate.png  : the hot plate (stove) incl. its top above the table edge, flame ON
fg_plate_off.png : same, flame OFF (blue flame pixels filled from the surrounding grill)
fg_bowl.png   : the lilac bowl above the table edge
python make_fg.py --bg <bg_table_empty.png> --out <dir>
"""
import argparse, os
import numpy as np
from PIL import Image
from scipy import ndimage

ap = argparse.ArgumentParser(); ap.add_argument('--bg', required=True); ap.add_argument('--out', required=True); a = ap.parse_args()
im = np.asarray(Image.open(a.bg).convert('RGB')).astype(np.int16)
H, W, _ = im.shape
EDGE = 1092
# objects are closed by the owner's thick dark-brown outline: anything above the table edge NOT connected to the wall
v = im.max(axis=2); line = (v < 110)
line = ndimage.binary_dilation(line, iterations=1)
free = ~line; free[:930] = True; free[EDGE:] = False
lab, n = ndimage.label(free)
wall = lab == lab[5, 5]
obj = ~wall; obj[EDGE:] = False; obj[:930] = False
obj = ndimage.binary_opening(obj, iterations=2)
lab, n = ndimage.label(obj)
plate = np.zeros_like(obj); bowl = np.zeros_like(obj)
for i in range(1, n + 1):
    m = lab == i
    if m.sum() < 2000: continue
    xs = np.where(m)[1]
    (plate if xs.mean() < 620 else bowl)[m] = True
diff = np.ones(im.shape[:2], bool)
plate[EDGE:1215, 115:605] = True
alpha = lambda m: (ndimage.uniform_filter(m.astype(np.float32), 3) * 255).astype(np.uint8)
def save(m, name, rgb=None):
    rgb = im if rgb is None else rgb
    Image.fromarray(np.dstack([rgb.clip(0, 255).astype(np.uint8), alpha(m)]), 'RGBA').save(os.path.join(a.out, name))
tab = np.zeros_like(obj); tab[EDGE:] = True
save(tab, 'fg_table.png'); save(plate, 'fg_plate.png'); save(bowl, 'fg_bowl.png')
# flame off: blue pixels in the burner box -> nearest non-blue pixel
r, g, b = im[..., 0], im[..., 1], im[..., 2]
blue = (b > r + 25) & (b > g) & (np.arange(H)[:, None] > 1000) & (np.arange(H)[:, None] < 1075) & (np.arange(W)[None] > 220) & (np.arange(W)[None] < 470)
blue = ndimage.binary_dilation(blue, iterations=3)
idx = ndimage.distance_transform_edt(blue, return_distances=False, return_indices=True)
off = im[idx[0], idx[1]]
save(plate, 'fg_plate_off.png', off)
print('plate px', int(plate.sum()), 'bowl px', int(bowl.sum()), 'flame px', int(blue.sum()))
