#!/usr/bin/env python3
"""snap_words.py: move word starts that Whisper placed inside inserted silence forward to the voice onset.

    python snap_words.py --project <kit>/projects/<slug> [--check]

Whisper's word timings tend to stretch a word back over a pause before it. When the pause is digital silence that
the voice step inserted (a "..." beat or a gap between lines: voice.py --engine files, dia8.py pacing), the word's
real onset is known exactly: the first non-silent 10 ms after the silence. Only starts that sit inside a stretch of
>= 50 ms below -60 dBFS are moved; natural pauses in the take itself are never that quiet, so nothing else changes.
When input/voiceover.lines.json has per-part "start" times (voice.py --engine files), the first word of every line and
of every part after a "..." is also moved to at least its part's real start.
Rewrites timeline/words.json in place (and the start of any timeline/sentences.json sentence that began on a moved
word). --check only reports.
"""
import argparse, json, os
import numpy as np, soundfile as sf

ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True)
ap.add_argument("--check", action="store_true")
a = ap.parse_args()
P = a.project
x, sr = sf.read(os.path.join(P, "input", "voiceover.wav"), dtype="float32", always_2d=True)
x = x.mean(axis=1)
H = int(0.01 * sr)
n = len(x) // H
db = 20 * np.log10(np.sqrt((x[:n * H].reshape(n, H) ** 2).mean(axis=1)) + 1e-9)
quiet = db < -60
wp = os.path.join(P, "timeline", "words.json")
W = json.load(open(wp))
words = W.get("words", W) if isinstance(W, dict) else W
moved = []
for w in words:
    i = int(round(w["start"] * 100))
    if i >= n or not quiet[i]:
        continue
    j0 = i
    while j0 > 0 and quiet[j0 - 1]: j0 -= 1
    j1 = i
    while j1 < n and quiet[j1]: j1 += 1
    if j1 - j0 < 5:
        continue
    new = round(j1 * 0.01, 3)
    if new >= w["end"] - 0.04:
        continue
    moved.append((w["word"], w["start"], new, "inside inserted silence")); w["start"] = new
# exact part starts from the voice step (voice.py --engine files): the first word of a line, or of the part after a
# "...", can't start before its own audio does
lp = os.path.join(P, "input", "voiceover.lines.json")
if os.path.exists(lp):
    VL = json.load(open(lp)).get("lines", [])
    k = 0
    for ln in VL:
        parts = ln.get("parts") or [{}]
        toks = ln["text"].split(); starts = [ln.get("start")]
        if len(parts) > 1 and all("start" in p_ for p_ in parts):
            starts = [p_["start"] for p_ in parts]
        pi, first = 0, True
        for t in toks:
            if k >= len(words): break
            w = words[k]
            if first and pi < len(starts) and starts[pi] is not None and w["start"] < starts[pi] and starts[pi] < w["end"] - 0.04:
                moved.append((w["word"], w["start"], round(starts[pi], 3), "before its part's audio")); w["start"] = round(starts[pi], 3)
            first = False
            if "..." in t:
                pi += 1; first = True
            k += 1
for word, old, new, why in moved:
    print(f"   {word!r}: start {old:.2f} -> {new:.2f} ({why})")
print(f"snap_words: {len(moved)} word start(s) moved")
if moved and not a.check:
    json.dump(W, open(wp, "w"), indent=1, ensure_ascii=False)
    sp = os.path.join(P, "timeline", "sentences.json")
    if os.path.exists(sp):
        S = json.load(open(sp)); ss = S.get("sentences", S) if isinstance(S, dict) else S
        olds = {round(o, 3): nw for _, o, nw, _ in moved}
        for s in ss:
            if isinstance(s, dict) and round(s.get("start", -1), 3) in olds:
                s["start"] = olds[round(s["start"], 3)]
        json.dump(S, open(sp, "w"), indent=1, ensure_ascii=False)
