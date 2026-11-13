"""Music bed for molasses-flood from the kit's BEANMEN beds: tense (0-25.6 s) -> sad, quieter, for the aftermath
(25.6-29.0 s, the respectful beat) -> curious for the courtroom + ending. 0.5 s crossfades. -> input/music_bed.wav"""
import numpy as np, soundfile as sf
M = "../../kits/toon3d/audio/music/"
def load(n):
    y, sr = sf.read(M + n + ".wav", always_2d=True); assert sr == 44100; return y
SR, D = 44100, 43.8
plan = [("tense", 0.0, 25.6, 0.0, 0), ("sad", 25.6, 29.0, -5.0, 0), ("curious", 29.0, D, 0.0, 0)]
out = np.zeros((int(SR * D) + SR, 2)); X = 0.5
for name, a, b, gdb, off in plan:
    y = load(name); n0, n1 = int(a * SR), int(min(D, b + X) * SR); seg = np.tile(y, (int(np.ceil((n1 - n0) / len(y))) + 1, 1))[:n1 - n0] * 10 ** (gdb / 20)
    env = np.ones(len(seg)); f = int(X * SR)
    if a > 0: env[:f] = np.linspace(0, 1, f)
    if b < D: env[-f:] = np.linspace(1, 0, f)
    out[n0:n1] += seg * env[:, None]
out = out[:int(SR * D)]; out /= max(1e-9, np.abs(out).max()) / 0.8
sf.write("input/music_bed.wav", out.astype(np.float32), SR); print("ok", len(out) / SR)
