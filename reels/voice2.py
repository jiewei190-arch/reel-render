# Step A: TTS timeline -> vo_<name>.wav + tl_<name>.js (window.TL={total,p:[{i,cap,start,end}]})
import json, pathlib, re, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = pathlib.Path(__file__).resolve().parent; MODELS = HERE.parent / "tts"; SR = 24000
spec = json.load(open(HERE / "specs" / f"{sys.argv[1]}.json")); name = spec["name"]
k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def two(n): return ONES[n] if n < 20 else TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")
def plural(w): return w[:-1] + "ies" if w.endswith("y") else w + "s"
def year(m):  # owner rule: say years the way people do, "nineteen ninety-nine", never "one thousand nine hundred ..."
    y, s = int(m.group(1)), m.group(2)
    if 2000 <= y <= 2009: w = "two thousand" + (" " + ONES[y % 10] if y % 10 else "")
    elif y % 100 == 0: w = two(y // 100) + " hundred"
    elif y % 100 < 10: w = two(y // 100) + " oh " + ONES[y % 100]
    else: w = two(y // 100) + " " + two(y % 100)
    return w.rsplit(" ", 1)[0] + " " + plural(w.rsplit(" ", 1)[1]) if s else w
def say(text):  # 1100-2099 standalone = a year; write "1,853" to force a plain number
    return re.sub(r"(?<![\d$])(?<!\d[,.])(1[1-9]\d\d|20\d\d)('?s)?(?!\d|[,.]\d|%)", year, text)
BREATH = set(spec.get("breath", [])); t = spec.get("lead", .35); tl = []; pieces = []
for i, (cap, text) in enumerate(spec["phrases"]):
    s, _ = k.create(say(text), voice=spec["voice"], speed=spec.get("speed", 1.04), lang="en-us"); s = s.astype(np.float32)
    idx = np.where(np.abs(s) > .012)[0]; s = s[idx[0]:idx[-1] + 1]
    n = int(.01 * SR); s[:n] *= np.linspace(0, 1, n); s[-n:] *= np.linspace(1, 0, n)
    d = len(s) / SR; tl.append({"i": i, "cap": cap, "start": round(t, 3), "end": round(t + d, 3)}); pieces.append((t, s))
    gap = .38 if text[-1] in ".?" else .14
    if i in BREATH: gap += .32
    t += d + gap
TOTAL = round(t + spec.get("tail", 1.6), 3);  # spec "tail": seconds of end card after the closing line's gap (default 1.6)
N = int(TOTAL * SR); v = np.zeros(N, np.float32)
for st, s in pieces: a = int(st * SR); v[a:a + len(s)] += s
v *= .9 / np.max(np.abs(v)); sf.write(HERE / f"vo_{name}.wav", v, SR)
(HERE / f"tl_{name}.js").write_text("window.TL=" + json.dumps({"total": TOTAL, "p": tl}) + ";")
print(name, "total", TOTAL); print("\n".join(f"{d['i']:2d} {d['start']:6.2f}-{d['end']:6.2f} {d['cap']}" for d in tl))
