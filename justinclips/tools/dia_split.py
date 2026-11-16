#!/usr/bin/env python3
"""Split a one-pass Dia take into per-line files, using Whisper word timings aligned to the script.

  split_take.py <take.raw.wav> <lines.json> <outdir> <name-format>   (name-format e.g. "line_{n:02d}.wav" or "{n:02d}.wav")

Each "..." in a line becomes a held beat of at least BEAT s (Dia often runs through it).
Also prints the median pitch (pyin) and the Whisper transcript of the take.
"""
import sys, json, re, difflib, os
import numpy as np, soundfile as sf, librosa
from math import gcd
from scipy.signal import resample_poly
sys.path.insert(0, os.path.dirname(__file__))
BEAT = 0.4
take, lines_p, outdir, fmt = sys.argv[1:5]
a, sr = sf.read(take, dtype="float32", always_2d=True); a = a.mean(1)

ONES = ("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "
        "seventeen eighteen nineteen").split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def n2w(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")
    if n < 1000: return ONES[n // 100] + " hundred" + (" " + n2w(n % 100) if n % 100 else "")
    return n2w(n // 1000) + " thousand" + (" " + n2w(n % 1000) if n % 1000 else "")
def year2w(y):
    hi, lo = divmod(y, 100)
    if lo == 0: return n2w(hi) + " hundred"
    return n2w(hi) + " " + ("oh-" + ONES[lo] if lo < 10 else n2w(lo))
def spell(t):
    return re.sub(r"\d+", lambda m: year2w(int(m.group())) if len(m.group()) == 4 and 1100 <= int(m.group()) <= 2099 else n2w(int(m.group())), t)
def toks(s):
    s = spell(s.replace("%", " percent")).lower().replace("-", " ")
    return ["won" if w == "one" else w for w in re.findall(r"[a-z']+", s)]

from faster_whisper import WhisperModel
asr = WhisperModel("small.en", device="cpu", compute_type="int8")
g = gcd(sr, 16000)
a16 = resample_poly(a, 16000 // g, sr // g).astype(np.float32)
segs, _ = asr.transcribe(a16, beam_size=5, language="en", word_timestamps=True)
words = [w for s in segs for w in s.words]
heard = "".join(w.word for w in words).strip()
H = []  # (token, start, end)
for w in words:
    for t in toks(w.word): H.append((t, w.start, w.end))

L = json.load(open(lines_p))["lines"]
S = []  # (token, line_idx, part_idx)
for i, l in enumerate(L):
    for k, part in enumerate(l["text"].split("...")):
        for t in toks(part): S.append((t, i, k))
sm = difflib.SequenceMatcher(a=[t for t, *_ in S], b=[t for t, *_ in H], autojunk=False)
match = {}
wrong = 0
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal":
        for d in range(i2 - i1): match[i1 + d] = H[j1 + d]
    else:
        wrong += max(i2 - i1, j2 - j1)
def span(pred):
    idx = [j for j, s in enumerate(S) if pred(s) and j in match]
    return (match[idx[0]][1], match[idx[-1]][2]) if idx else None

# cut points between consecutive units (lines and "..." parts): midpoint of the gap between them
units = sorted({(s[1], s[2]) for s in S})
spans = {u: span(lambda s, u=u: (s[1], s[2]) == u) for u in units}
cuts = {}
for u, v in zip(units, units[1:]):
    e, b = spans[u], spans[v]
    if e is None or b is None: sys.exit(f"cannot locate unit {u} or {v}: Whisper missed it")
    if u[0] == v[0]:   # a "..." beat inside a line: cut tight, drop any breath/noise Dia put in the gap
        cuts[(u, v)] = (min(e[1] + 0.02, b[0]), max(b[0] - 0.03, e[1]))
    else:
        c = (e[1] + b[0]) / 2 if b[0] > e[1] else b[0] - 0.01
        cuts[(u, v)] = (c, c)
bounds = {}
for j, u in enumerate(units):
    st = 0.0 if j == 0 else cuts[(units[j - 1], u)][1]
    en = len(a) / sr if j == len(units) - 1 else cuts[(u, units[j + 1])][0]
    bounds[u] = (st, en)
os.makedirs(outdir, exist_ok=True)
def trim(x, thr=0.02):
    idx = np.where(np.abs(x) > thr * max(np.abs(x).max(), 1e-6))[0]
    return x[max(idx[0] - int(sr * 0.03), 0): idx[-1] + int(sr * 0.08)] if len(idx) else x
report = []
for i, l in enumerate(L):
    parts = [u for u in units if u[0] == i]
    pieces = []
    for k, u in enumerate(parts):
        st, en = bounds[u]
        seg = trim(a[int(st * sr): int(en * sr)].copy())
        pieces.append(seg)
        if k < len(parts) - 1: pieces.append(np.zeros(int(sr * BEAT), np.float32))
    y = np.concatenate(pieces)
    f = int(0.008 * sr); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    p = os.path.join(outdir, fmt.format(n=i + 1)); sf.write(p, y, sr)
    report.append({"n": i + 1, "file": os.path.basename(p), "from": round(bounds[parts[0]][0], 2), "to": round(bounds[parts[-1]][1], 2)})

f0, vf, _ = librosa.pyin(librosa.resample(a, orig_sr=sr, target_sr=22050), fmin=60, fmax=400, sr=22050)
f0 = f0[vf & ~np.isnan(f0)]
out = {"heard": heard, "wrong_tokens": wrong, "median_pitch_hz": round(float(np.median(f0)), 1),
       "take_s": round(len(a) / sr, 2), "lines": report}
json.dump(out, open(os.path.join(outdir, "split_report.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
