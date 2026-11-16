#!/usr/bin/env python3
"""snap_words.py --project P --kit KIT: move word edges in timeline/words.json out of silences in the voiceover.

Whisper word timings stretch across pauses: after a held "..." beat the next word often "starts" at the end of the
previous word (e.g. "caused" 6.36-7.16 s while it is spoken from ~6.95 s), and script words Whisper did not hear get
zero-length interpolated times. Shot cuts and captions follow these times, so they would land inside the pause.
This pass (run right after the kit's tools/transcribe.py, before shot timing):
  - silence = 10 ms RMS frames below 10% of the speech level (p90), runs of >= 150 ms;
  - a word whose span starts in (or within 0.15 s / 30% of its span of) such a silence starts at its end (onset - 30 ms);
  - a word whose span runs on into such a silence ends 50 ms into it;
  - zero-length (unheard, interpolated) words get the speech between their neighbours, split evenly.
Then sentences.json / transcript.txt are rebuilt with the kit's own functions. Word count and order never change.
"""
import argparse, json, os, sys
import numpy as np, soundfile as sf

ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True); ap.add_argument("--kit", required=True)
a = ap.parse_args()
sys.path.insert(0, os.path.join(os.path.abspath(a.kit), "tools"))
from common import sentences_from_words, write_timeline

P = os.path.abspath(a.project)
wj = json.load(open(os.path.join(P, "timeline", "words.json"), encoding="utf-8"))
W = wj["words"]
x, sr = sf.read(os.path.join(P, "input", "voiceover.wav"), dtype="float32")
if x.ndim > 1: x = x.mean(axis=1)
hop = int(sr * 0.01)
rms = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, mode="same"))[::hop]
thr = 0.1 * np.percentile(rms, 90)
sil, k0 = [], None
for i, q in enumerate(list(rms < thr) + [False]):
    if q and k0 is None: k0 = i
    if not q and k0 is not None:
        if i - k0 >= 15: sil.append((k0 * 0.01, i * 0.01))
        k0 = None
dur = len(x) / sr


def onset_after(t):
    """first speech time >= t (end of a silence that contains t, else t)"""
    for s0, s1 in sil:
        if s0 <= t < s1: return s1
    return t


changes = []
for i, w in enumerate(W):
    s, e = w["start"], w["end"]
    if e - s < 0.02: continue
    ns, ne = s, e
    for s0, s1 in sil:
        if s1 <= s or s0 >= e: continue
        if s0 <= s + max(0.05, min(0.15, 0.3 * (e - s))) and s1 < e - 0.05:   # word "starts" inside a pause
            ns = max(ns, s1 - 0.03)
        elif s1 >= e - 0.05 and s0 > ns + 0.05:       # word runs on into a pause
            ne = min(ne, s0 + 0.05)
    if (ns, ne) != (s, e):
        changes.append(f"{w['word']}: {s:.2f}-{e:.2f} -> {ns:.2f}-{ne:.2f}")
        w["start"], w["end"] = round(ns, 3), round(ne, 3)
# zero-length (interpolated) words
i = 0
while i < len(W):
    if W[i]["end"] - W[i]["start"] < 0.02:
        j = i
        while j < len(W) and W[j]["end"] - W[j]["start"] < 0.02: j += 1
        lo = onset_after(W[i - 1]["end"]) if i else onset_after(0.0)
        hi = W[j]["start"] - 0.02 if j < len(W) else min(dur, lo + 0.4 * (j - i))
        q0 = i
        if not hi > lo + 0.05 * (j - i) and i:       # no room: share the previous word's span with them
            q0, lo = i - 1, W[i - 1]["start"]
        if hi > lo + 0.05 * (j - q0):
            step = (hi - lo) / (j - q0); i = q0
            for q in range(i, j):
                old = (W[q]["start"], W[q]["end"])
                W[q]["start"], W[q]["end"] = round(lo + (q - i) * step, 3), round(lo + (q - i + 1) * step - 0.01, 3)
                changes.append(f"{W[q]['word']} (unheard): {old[0]:.2f}-{old[1]:.2f} -> {W[q]['start']:.2f}-{W[q]['end']:.2f}")
        i = j
    else:
        i += 1
for k in range(1, len(W)):                            # keep order
    if W[k]["start"] < W[k - 1]["start"]: W[k]["start"] = W[k - 1]["start"]
    if W[k]["end"] < W[k]["start"]: W[k]["end"] = W[k]["start"]
print(f"snap_words: {len(changes)} word edges moved out of pauses")
for c in changes: print("  " + c)
write_timeline(os.path.join(P, "timeline"), W, sentences_from_words(W), wj.get("source", "") + "+snap")
