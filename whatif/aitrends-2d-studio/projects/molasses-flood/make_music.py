"""Music bed for molasses-flood from the kit's BEANMEN beds: tense (to the s12 cut) -> sad, quieter, for the aftermath
(s12, the respectful beat) -> curious for the courtroom + ending. 0.5 s crossfades. -> input/music_bed.wav"""
import numpy as np, soundfile as sf
M = "../../kits/toon3d/audio/music/"
def load(n):
    y, sr = sf.read(M + n + ".wav", always_2d=True); assert sr == 44100; return y
SR, D = 44100, 43.8
import json
SH = {x["id"]: x for x in json.load(open("story/shots.json"))["shots"]}; D = json.load(open("story/shots.json"))["duration"] + 0.1
a1, a2 = SH["s12"]["start"], SH["s13"]["start"]
plan = [("tense", 0.0, a1, 0.0, 0), ("sad", a1, a2, -5.0, 0), ("curious", a2, D, 0.0, 0)]
out = np.zeros((int(SR * D) + SR, 2)); X = 0.5
for name, a, b, gdb, off in plan:
    y = load(name); n0, n1 = int(a * SR), int(min(D, b + X) * SR); seg = np.tile(y, (int(np.ceil((n1 - n0) / len(y))) + 1, 1))[:n1 - n0] * 10 ** (gdb / 20)
    env = np.ones(len(seg)); f = int(X * SR)
    if a > 0: env[:f] = np.linspace(0, 1, f)
    if b < D: env[-f:] = np.linspace(1, 0, f)
    out[n0:n1] += seg * env[:, None]
out = out[:int(SR * D)]; out /= max(1e-9, np.abs(out).max()) / 0.8
sf.write("input/music_bed.wav", out.astype(np.float32), SR); print("ok", len(out) / SR)
