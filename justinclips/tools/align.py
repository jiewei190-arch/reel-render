"""align.py vo.wav spoken.txt words.json [--merge "Eighteen fifty-nine.=1859." ...]
Whisper word timestamps aligned onto the exact spoken script tokens; --merge joins spoken token runs into one caption word."""
import sys, json, re, difflib
from faster_whisper import WhisperModel
wav, spoken, out = sys.argv[1:4]
merges = [a.split("=", 1) for a in sys.argv[4:] if "=" in a]
toks = open(spoken).read().split()
m = WhisperModel("small.en", device="cpu", compute_type="int8")
import wave, numpy as np
wf = wave.open(wav); sr = wf.getframerate(); AUD = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
if wf.getnchannels() > 1: AUD = AUD.reshape(-1, wf.getnchannels()).mean(1)
if sr != 16000: AUD = np.interp(np.arange(0, len(AUD), sr / 16000), np.arange(len(AUD)), AUD).astype(np.float32)
segs, _ = m.transcribe(AUD, word_timestamps=True, language="en", beam_size=5)
W = [w for s in segs for w in s.words]
print("WHISPER:", " ".join(w.word.strip() for w in W))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
# expand whisper tokens split on hyphens for matching
wt = []
num = {norm(d): [norm(x) for x in re.split(r"[-\s]", src) if norm(x)] for src, d in merges}
for w in W:
    parts = num.get(norm(w.word)) or [p for p in re.split(r"[-\s]", w.word.strip()) if norm(p)] or [w.word]
    d = (w.end - w.start) / len(parts)
    for i, p in enumerate(parts): wt.append((norm(p), w.start + i * d, w.start + (i + 1) * d))
st = []
for t in toks:
    parts = [p for p in t.split("-") if norm(p)] or [t]
    st.append(parts)
flat = [(i, norm(p)) for i, ps in enumerate(st) for p in ps]
sm = difflib.SequenceMatcher(a=[f[1] for f in flat], b=[w[0] for w in wt], autojunk=False)
times = [None] * len(flat)
for a, b, n in sm.get_matching_blocks():
    for k in range(n): times[a + k] = (wt[b + k][1], wt[b + k][2])
# interpolate gaps
for i in range(len(flat)):
    if times[i] is None:
        j = i
        while j < len(flat) and times[j] is None: j += 1
        t0 = times[i - 1][1] if i > 0 else 0.0
        if j < len(flat): t1 = times[j][0]
        else:  # unmatched tail (e.g. the closer): use the voiced region after the last match
            env = np.abs(AUD[: len(AUD) // 160 * 160]).reshape(-1, 160).max(1); on = np.where(env > 0.02)[0] / 100.0
            after = on[on > t0 + 0.15]; t0 = float(after[0]) if len(after) else t0; t1 = float(on[-1]) if len(on) else t0 + 0.3 * (j - i)
        for k in range(i, j): times[k] = (t0 + (t1 - t0) * (k - i) / (j - i), t0 + (t1 - t0) * (k - i + 1) / (j - i))
miss = sum(1 for a, b, n in [(0, 0, 0)])  # placeholder
words = []
for i, t in enumerate(toks):
    ix = [k for k, f in enumerate(flat) if f[0] == i]
    words.append({"word": t, "start": round(times[ix[0]][0], 3), "end": round(times[ix[-1]][1], 3)})
for src, dst in merges:
    s = src.split(); n = len(s); i = 0
    while i <= len(words) - n:
        if [w["word"] for w in words[i:i + n]] == s:
            words[i:i + n] = [{"word": dst, "start": words[i]["start"], "end": words[i + n - 1]["end"]}]
        i += 1
matched = sum(n for a, b, n in sm.get_matching_blocks())
print(f"matched {matched}/{len(flat)} spoken tokens")
json.dump({"source": "whisper:small.en word timestamps aligned to the TTS script (justinclips/tools/align.py)", "words": words}, open(out, "w"), indent=1)
