#!/usr/bin/env python3
"""Split a one-pass Dia narration (tts_any.py output) into per-line wavs for shortbuild.py --voice wavdir:DIR.

  split_lines.py lines.json take.wav outdir
Whisper small.en word times (audio passed as a numpy array) are aligned to the script; each line is cut at the
middle of the silence before the next line. Also prints the Whisper transcript, wrong-word count and median pitch.
"""
import sys, os, re, json, difflib
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

LINES_PATH, WAV, OUT = sys.argv[1:4]
# reuse tts_any's text normalizer (digits spelled, "won"/"one")
ONES = ("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "
        "seventeen eighteen nineteen").split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def n2w(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")
    if n < 1000: return ONES[n // 100] + " hundred" + (" " + n2w(n % 100) if n % 100 else "")
    for div, name in ((10**9, "billion"), (10**6, "million"), (1000, "thousand")):
        if n >= div: return n2w(n // div) + " " + name + (" " + n2w(n % div) if n % div else "")
def year2w(y):
    hi, lo = divmod(y, 100)
    if lo == 0: return n2w(hi) + " hundred"
    return n2w(hi) + " " + ("oh-" + ONES[lo] if lo < 10 else n2w(lo))
def spell(t):
    def rep(m):
        raw = m.group(0); n = int(raw.replace(",", ""))
        if "," not in raw and len(raw) == 4 and 1100 <= n <= 2099: return year2w(n)
        return n2w(n)
    t = re.sub(r"(\d+)s\b", lambda m: m.group(1) + "s", t)
    return re.sub(r"\d{1,3}(?:,\d{3})+|\d+", rep, t)
def toks(s):
    s = spell(s.replace("%", " percent")).lower().replace("-", " ")
    return ["won" if w == "one" else w for w in re.findall(r"[a-z']+", s)]

lines = [l["text"] for l in json.load(open(LINES_PATH))["lines"]]
a, sr = sf.read(WAV, dtype="float32", always_2d=True); a = a.mean(1)
from math import gcd
g = gcd(sr, 16000); a16 = resample_poly(a, 16000 // g, sr // g).astype(np.float32)
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a16, beam_size=5, language="en", word_timestamps=True)
words = [w for s in segs for w in s.words]
heard = "".join(w.word for w in words).strip()
wt = []  # (token, start, end)
for w in words:
    for t in toks(w.word): wt.append((t, w.start, w.end))
st = []; owner = []
for i, l in enumerate(lines):
    for t in toks(l): st.append(t); owner.append(i)
sm = difflib.SequenceMatcher(a=st, b=[x[0] for x in wt], autojunk=False)
bad = sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal")
mp = {}
for blk in sm.get_matching_blocks():
    for k in range(blk.size): mp[blk.a + k] = blk.b + k
span = []
for i in range(len(lines)):
    idx = [mp[k] for k in range(len(st)) if owner[k] == i and k in mp]
    if not idx: sys.exit(f"line {i + 1} not found in the take: {lines[i]}")
    span.append((wt[min(idx)][1], wt[max(idx)][2]))
cuts = [0.0] + [(span[i][1] + span[i + 1][0]) / 2 for i in range(len(lines) - 1)] + [len(a) / sr]
os.makedirs(OUT, exist_ok=True)
for i in range(len(lines)):
    seg = a[int(cuts[i] * sr): int(cuts[i + 1] * sr)].copy(); f = int(0.01 * sr)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    sf.write(os.path.join(OUT, f"line_{i + 1:02d}.wav"), seg, sr)
import librosa
y = librosa.resample(a, orig_sr=sr, target_sr=22050)
f0, vf, _ = librosa.pyin(y, fmin=70, fmax=400, sr=22050)
f0 = f0[vf & ~np.isnan(f0)]
rep = {"heard": heard, "wrong_words": bad, "median_pitch_hz": round(float(np.median(f0)), 1),
       "duration_s": round(len(a) / sr, 2), "line_spans": [[round(x, 2), round(y_, 2)] for x, y_ in span],
       "laughs_in_transcript": bool(re.search(r"laugh|haha|ha ha", heard.lower()))}
json.dump(rep, open(os.path.join(OUT, "split_report.json"), "w"), indent=1)
print(json.dumps(rep, indent=1))
print("diff:", [(op, st[i1:i2], [x[0] for x in wt[j1:j2]]) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"])
