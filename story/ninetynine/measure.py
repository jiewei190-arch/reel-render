# measure.py: band mean colour / HSV sat / value (STYLE_STORY 3b) for frames. usage: measure.py LABEL=video@t ...
import sys, subprocess, tempfile, os, colorsys
import numpy as np
from PIL import Image
B = [('sky', .20, .30), ('near horizon', .42, .48), ('ground mid', .62, .72), ('ground low', .82, .95)]
for arg in sys.argv[1:]:
    lab, src = arg.split('=', 1); v, t = src.rsplit('@', 1); p = os.path.join(tempfile.mkdtemp(), 'f.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', t, '-i', v, '-frames:v', '1', p], check=True)
    a = np.asarray(Image.open(p).convert('RGB').resize((540, 960))).astype(float) / 255
    hsv = np.asarray(Image.open(p).convert('RGB').resize((540, 960)).convert('HSV')).astype(float) / 255
    out = []
    for n, y0, y1 in B:
        r = a[int(y0 * 960):int(y1 * 960)].reshape(-1, 3).mean(0); h = hsv[int(y0 * 960):int(y1 * 960)].reshape(-1, 3).mean(0)
        out.append(f"{n} #{''.join('%02x' % int(c * 255) for c in r)} s{h[1]:.2f} v{h[2]:.2f}")
    luma = (a @ [.299, .587, .114]) * 255
    print(f"{lab:6s} | " + ' | '.join(out) + f" | frame s{hsv[..., 1].mean():.2f} lumaSD {luma.std():.0f}")
