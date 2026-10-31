# script.json -> vo.wav + tl.json  (per-line timings, grouped by scene)
# usage: python3 -I voice.py <name> [voice] [speed]
import json, pathlib, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = pathlib.Path(__file__).resolve().parent; SR = 24000
D = HERE / sys.argv[1]; spec = json.load(open(D / "script.json"))
voice = sys.argv[2] if len(sys.argv) > 2 else spec["voice"]
speed = float(sys.argv[3]) if len(sys.argv) > 3 else spec.get("speed", 1.0)
k = Kokoro(str(HERE.parent.parent / "tts" / "kokoro-v1.0.onnx"), str(HERE.parent.parent / "tts" / "voices-v1.0.bin"))
t = .6; pieces = []; scenes = []
for si, sc in enumerate(spec["scenes"]):
    st = t; lines = []
    for text in sc["lines"]:
        s, _ = k.create(text, voice=voice, speed=speed, lang="en-us"); s = s.astype(np.float32)
        idx = np.where(np.abs(s) > .01)[0]; s = s[idx[0]:idx[-1] + 1]
        n = int(.01 * SR); s[:n] *= np.linspace(0, 1, n); s[-n:] *= np.linspace(1, 0, n)
        d = len(s) / SR; lines.append({"text": text, "start": round(t, 3), "end": round(t + d, 3)}); pieces.append((t, s))
        t += d + (.32 if text[-1] in ".?!" else .16)
    t += .35
    scenes.append({"v": sc["v"], "start": round(st - (.3 if si else .6), 3), "lines": lines})
TOTAL = round(t + 1.5, 3)
for i, sc in enumerate(scenes): sc["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else TOTAL
v = np.zeros(int(TOTAL * SR), np.float32)
for st, s in pieces: a = int(st * SR); v[a:a + len(s)] += s
v *= .89 / np.max(np.abs(v)); sf.write(D / "vo.wav", v, SR)
json.dump({"total": TOTAL, "scenes": scenes}, open(D / "tl.json", "w"), indent=1)
print("total", TOTAL, "s,", len(scenes), "scenes")
