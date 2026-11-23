# Step A: TTS timeline -> vo_<name>.wav + tl_<name>.js (window.TL={total,p:[{i,cap,start,end}]})
import json, pathlib, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = pathlib.Path(__file__).resolve().parent; MODELS = HERE.parent / "tts"; SR = 24000
spec = json.load(open(HERE / "specs" / f"{sys.argv[1]}.json")); name = spec["name"]
k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
BREATH = set(spec.get("breath", [])); t = spec.get("lead", .35); tl = []; pieces = []
for i, (cap, text) in enumerate(spec["phrases"]):
    s, _ = k.create(text, voice=spec["voice"], speed=spec.get("speed", 1.04), lang="en-us"); s = s.astype(np.float32)
    idx = np.where(np.abs(s) > .012)[0]; s = s[idx[0]:idx[-1] + 1]
    n = int(.01 * SR); s[:n] *= np.linspace(0, 1, n); s[-n:] *= np.linspace(1, 0, n)
    d = len(s) / SR; tl.append({"i": i, "cap": cap, "start": round(t, 3), "end": round(t + d, 3)}); pieces.append((t, s))
    gap = .38 if text[-1] in ".?" else .14
    if i in BREATH: gap += .32
    gap += float(spec.get("pause", {}).get(str(i), 0))
    t += d + gap
TOTAL = round(t + 1.6, 3); N = int(TOTAL * SR); v = np.zeros(N, np.float32)
for st, s in pieces: a = int(st * SR); v[a:a + len(s)] += s
v *= .9 / np.max(np.abs(v)); sf.write(HERE / f"vo_{name}.wav", v, SR)
(HERE / f"tl_{name}.js").write_text("window.TL=" + json.dumps({"total": TOTAL, "p": tl}) + ";")
print(name, "total", TOTAL); print("\n".join(f"{d['i']:2d} {d['start']:6.2f}-{d['end']:6.2f} {d['cap']}" for d in tl))
