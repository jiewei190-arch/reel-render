"""Full-resolution caption-edge check (critic.py works at quarter size, where bright sky can read as white).
python tools/edgefull.py video.mp4"""
import subprocess, sys
import numpy as np

v = sys.argv[1]
vf = "select='not(mod(n,3))',crop=1080:480:0:1056"
p = subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vf", vf, "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True)
if p.returncode:
    sys.exit(p.stderr.decode()[-400:])
c = np.frombuffer(p.stdout, np.uint8).reshape(-1, 480, 1080, 3)
cols = (c.min(axis=3) > 246).any(axis=1)
worst, wi = 1.0, -1
for i, r in enumerate(cols):
    if r.any():
        l = int(np.argmax(r))
        rr = 1079 - int(np.argmax(r[::-1]))
        m = min(l, 1079 - rr) / 1080
        if m < worst:
            worst, wi = m, i * 3
print("full-res closest white pixel in the caption band: %.1f%% from the edge (frame %d)" % (worst * 100, wi))
