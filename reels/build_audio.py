import json, pathlib, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = pathlib.Path(__file__).resolve().parent
MODELS = HERE.parent / "tts"
SR = 24000
spec = json.load(open(HERE / "specs" / f"{sys.argv[1]}.json"))
name = spec["name"]
P = spec["phrases"]
VOICE = spec.get("voice", "am_michael"); SPEED = spec.get("speed", 1.04)
ROOT = spec.get("root", 55); BPM = spec.get("bpm", 104)
ARP = spec.get("arp", [220, 261.6, 329.6, 392, 329.6, 261.6, 293.7, 392])
BREATH = set(spec.get("breath", []))

k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
segs = []
for cap, text in P:
    s, _ = k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    s = s.astype(np.float32)
    idx = np.where(np.abs(s) > 0.012)[0]
    s = s[idx[0]:idx[-1] + 1]
    n = int(.01 * SR); s[:n] *= np.linspace(0, 1, n); s[-n:] *= np.linspace(1, 0, n)
    segs.append(s)

t = 0.45; tl = []; pieces = []
for i, ((cap, text), s) in enumerate(zip(P, segs)):
    dur = len(s) / SR
    tl.append({"i": i, "cap": cap, "start": round(t, 3), "end": round(t + dur, 3)})
    pieces.append((t, s))
    last = text[-1]
    gap = 0.36 if last in ".?" else (0.12 if last in ",:" else 0.1)
    if i in BREATH: gap += 0.25
    gap *= spec.get('gapscale',1)
    t += dur + gap
TOTAL = round(t + 1.1, 3)
N = int(TOTAL * SR)
voice = np.zeros(N, np.float32)
for st, s in pieces:
    a = int(st * SR); voice[a:a + len(s)] += s
voice *= 0.9 / np.max(np.abs(voice))

tt = np.arange(N) / SR
rng = np.random.default_rng(5)
def fade(x): return x * np.clip(tt / 2.0, 0, 1) * np.clip((TOTAL - tt) / 2.0, 0, 1)
pad = (np.sin(2*np.pi*ROOT*tt) * .6 + np.sin(2*np.pi*ROOT*1.5*tt) * .35 + np.sin(2*np.pi*ROOT*2*tt) * .25 + np.sin(2*np.pi*ROOT*3*tt) * .12)
pad *= 0.6 + 0.4 * np.sin(2*np.pi*0.11*tt)
pad = fade(pad); pad = pad / np.max(np.abs(pad)) * 0.06
pl = np.zeros(N, np.float32); step = 60 / BPM / 2; kk = 0; tn = 2.0
while tn < TOTAL - 1.5:
    f = ARP[kk % len(ARP)] * (2 if (kk // 8) % 3 == 2 else 1)
    n = int(0.5 * SR); x = np.arange(n) / SR
    w = (np.sin(2*np.pi*f*x) + .3*np.sin(2*np.pi*2*f*x)) * np.exp(-x * 7)
    a = int(tn * SR); pl[a:a + n] += (w[: N - a] * 0.018).astype(np.float32); tn += step; kk += 1
bed = (pad + fade(pl)).astype(np.float32)

def add(at, w, g=1.0):
    a = int(at * SR)
    if a < 0 or a >= N: return
    w = w[: N - a]; bed[a:a + len(w)] += (w * g).astype(np.float32)
def whoosh(d=.5, g=.11, up=True):
    n = int(d * SR); x = rng.standard_normal(n).astype(np.float32); y = np.zeros(n, np.float32); prev = 0
    for i in range(n):
        a = (.02 + .5 * (i / n)) if up else (.52 - .5 * (i / n)); prev += a * (x[i] - prev); y[i] = prev
    y = y * np.sin(np.pi * np.linspace(0, 1, n)) ** 2; return y / (np.max(np.abs(y)) + 1e-9) * g
def chime(f, d=.7, g=.10):
    n = int(d * SR); x = np.arange(n) / SR
    return (np.sin(2*np.pi*f*x) + .5*np.sin(2*np.pi*2.01*f*x) + .25*np.sin(2*np.pi*3.02*f*x)) * np.exp(-x * 5) * g / 1.75
def thud(d=.5, g=.35):
    n = int(d * SR); x = np.arange(n) / SR; return np.sin(2*np.pi*(70 - 35*x/d)*x) * np.exp(-x * 9) * g
def tick(g=.05):
    n = int(.03 * SR); x = np.arange(n) / SR; return np.sin(2*np.pi*1800*x) * np.exp(-x * 160) * g
def blip(f=1200, g=.06):
    n = int(.08 * SR); x = np.arange(n) / SR; return np.sin(2*np.pi*f*x) * np.exp(-x * 40) * g
def riser(d=1.0, g=.12):
    n = int(d * SR); x = np.arange(n) / SR; f = 200 + 1800 * (x / d) ** 2
    return np.sin(2*np.pi*np.cumsum(f) / SR) * (x / d) ** 2 * g

S = {d["i"]: d["start"] for d in tl}
for item in spec.get("sfx", []):
    kind, idx, off = item[0], item[1], item[2]; at = S[idx] + off; a = item[3:]
    if kind == "whoosh": add(at, whoosh(*(a[:3] if a else [])))
    elif kind == "chime": add(at, chime(*a))
    elif kind == "thud": add(at, thud(*a))
    elif kind == "tick": add(at, tick(*a))
    elif kind == "blip": add(at, blip(*a))
    elif kind == "riser": add(at, riser(*a))
    elif kind == "ticks":  # n ticks spaced
        for j in range(int(a[0])): add(at + j * a[1], tick(.04))

mix = voice + bed; mix *= 0.97 / np.max(np.abs(mix))
sf.write(HERE / f"mix_{name}.wav", mix, SR)
(HERE / f"tl_{name}.js").write_text("window.TL=" + json.dumps({"total": TOTAL, "p": tl}) + ";")
print(name, "total", TOTAL, "phrases", len(tl))
print(" ".join(f"{d['i']}:{d['start']}" for d in tl))
