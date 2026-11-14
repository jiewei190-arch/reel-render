"""Music bed from the kit's BEANMEN beds: mystery (calm lake + the mine) -> tense (from the punch-in to the waterfall)
-> upbeat (barges pop back up, everyone got out, the loop). 0.5 s crossfades. -> input/music_bed.wav"""
import json, numpy as np, soundfile as sf
M = "../../kits/toon3d/audio/music/"
def load(n):
    y, sr = sf.read(M + n + ".wav", always_2d=True); assert sr == 44100; return y
SR = 44100
J = json.load(open("story/shots.json")); SH = {x["id"]: x for x in J["shots"]}; D = J["duration"] + 0.1
a1, a2 = SH["s05"]["start"], SH["s13"]["start"]
plan = [("mystery", 0.0, a1, 0.0), ("tense", a1, a2, 0.0), ("upbeat", a2, D, -1.0)]
out = np.zeros((int(SR * D) + SR, 2)); X = 0.5
for name, a, b, gdb in plan:
    y = load(name); n0, n1 = int(a * SR), int(min(D, b + X) * SR); seg = np.tile(y, (int(np.ceil((n1 - n0) / len(y))) + 1, 1))[:n1 - n0] * 10 ** (gdb / 20)
    env = np.ones(len(seg)); f = int(X * SR)
    if a > 0: env[:f] = np.linspace(0, 1, f)
    if b < D: env[-f:] = np.linspace(1, 0, f)
    out[n0:n1] += seg * env[:, None]
out = out[:int(SR * D)]; out /= max(1e-9, np.abs(out).max()) / 0.8
sf.write("input/music_bed.wav", out.astype(np.float32), SR); print("ok", len(out) / SR)
