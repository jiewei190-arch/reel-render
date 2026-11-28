#!/usr/bin/env python3
"""Make an English SRT caption track from a Short's timeline/sentences.json (timings match the final video.mp4).
Usage: make_srt.py sentences.json out.srt   (cues <= 42 chars, split on word boundaries, time shared by characters)"""
import json, sys

def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

def chunks(text, n=42):
    out, cur = [], ""
    for w in text.split():
        if cur and len(cur) + 1 + len(w) > n:
            out.append(cur); cur = w
        else:
            cur = f"{cur} {w}".strip()
    return out + ([cur] if cur else [])

cues = []
for s in json.load(open(sys.argv[1], encoding="utf-8")):
    parts, t0, dur = chunks(s["text"].strip()), s["start"], s["end"] - s["start"]
    total = sum(len(p) for p in parts) or 1
    for p in parts:
        t1 = t0 + dur * len(p) / total
        cues.append((t0, t1, p)); t0 = t1
with open(sys.argv[2], "w", encoding="utf-8") as f:
    for i, (a, b, t) in enumerate(cues, 1):
        f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n")
print(sys.argv[2], len(cues), "cues")
