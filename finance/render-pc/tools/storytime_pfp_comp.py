"""Composite a green-screen pfp render: soft green key + edge despill, a white sticker outline, a soft drop shadow,
over an orange sunburst with a warm glow behind the head. usage: python pfp_comp.py <in.png> <out.png>"""
import subprocess, sys
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
W = H = 1080
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
img = np.frombuffer(raw, np.uint8).reshape(H, W, 3).astype(np.float32) / 255
r, g, b = img[..., 0], img[..., 1], img[..., 2]

# key: how much greener than the other channels
d = g - np.maximum(r, b)
a = 1 - np.clip((d - 0.25) / 0.3, 0, 1)
# despill only on the soft edge (the gold chain inside stays untouched)
edge = a < 0.999
img[..., 1] = np.where(edge, np.minimum(g, np.maximum(r, b)), g)

def shift(m, dy, dx):
    p = max(abs(dy), abs(dx))
    q = np.pad(m, p, mode="edge")
    return q[p - dy:p - dy + m.shape[0], p - dx:p - dx + m.shape[1]]

def dilate(m, rad):
    o = m.copy()
    for dy in range(-rad, rad + 1):
        for dx in range(-rad, rad + 1):
            if dx * dx + dy * dy <= rad * rad:
                o = np.maximum(o, shift(m, dy, dx))
    return o

def blur(m, rad):
    k = np.ones(2 * rad + 1) / (2 * rad + 1)
    m = np.apply_along_axis(lambda v: np.convolve(v, k, "same"), 0, m)
    return np.apply_along_axis(lambda v: np.convolve(v, k, "same"), 1, m)

small = a[::2, ::2]
out_w = np.kron(dilate(small, 8), np.ones((2, 2)))  # ~16 px white sticker rim (computed at half res for speed)
out_w = np.clip(blur(out_w, 1), 0, 1)
shadow = shift(blur(out_w, 12), 18, 10) * 0.35

# background: orange sunburst + a warm glow behind the head
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
cx, cy = 540, 470
ang = np.arctan2(y - cy, x - cx)
rays = (np.sin(ang * 14) > 0).astype(np.float32)
dist = np.hypot(x - cx, y - cy) / 760
base = np.array([1.0, 0.56, 0.10])   # #FF8F1A
ray = np.array([1.0, 0.66, 0.16])    # lighter ray
glow = np.array([1.0, 0.86, 0.45])
bg = base + (ray - base) * rays[..., None]
bg = bg + (glow - bg) * np.clip(1 - dist * 1.6, 0, 1)[..., None] ** 1.5
bg = bg * (1 - shadow[..., None])

white = np.ones(3)
comp = bg * (1 - out_w[..., None]) + white * out_w[..., None]
comp = comp * (1 - a[..., None]) + img * a[..., None]
o = (np.clip(comp, 0, 1) * 255).astype(np.uint8).tobytes()
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-i", "-", "-frames:v", "1", dst], input=o, check=True)
print("wrote", dst)
