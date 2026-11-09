"""Fenrir voice (same settings as whatif/voice/fenrir.py) that also writes per-sentence timings.
Usage: python3 voice_timed.py script.md out.wav segments.json [--gap 0.3] [--comma 0.15] [--section 0.85] [--lead 0.15]
segments.json = [{line, text, start, end}] (speech start/end of every sentence, seconds)."""
import re, sys, json
args = sys.argv[1:]
def opt(n, d):
    if n in args: i = args.index(n); v = float(args[i + 1]); del args[i:i + 2]; return v
    return d
GAP, COMMA, SECTION, LEAD = opt("--gap", 0.3), opt("--comma", 0.15), opt("--section", 0.85), opt("--lead", 0.15)
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
TTS = "/home/user/reel-render/tts/"
k = Kokoro(TTS + "kokoro-v1.0.onnx", TTS + "voices-v1.0.bin"); SR = 24000
pieces = [np.zeros(int(SR * LEAD), np.float32)]; segs = []; pos = LEAD
def add(a):
    global pos; pieces.append(a); pos += len(a) / SR
for raw in open(args[0], encoding="utf-8"):
    line = raw.strip()
    if line.startswith("## ") and len(segs):
        add(np.zeros(int(SR * (SECTION - GAP)), np.float32)); continue
    m = re.match(r"^(\d+)[a-z]?\.\s+(.*)", line)
    if not m: continue
    for sent in re.split(r'(?:(?<=[.!?…])|(?<=[.!?…]["”]))\s+', m.group(2)):
        if not sent.strip(): continue
        a, _ = k.create(sent, voice="am_fenrir", speed=0.95, lang="en-us"); a = a.astype(np.float32)
        nz = np.where(np.abs(a) > 0.01)[0]; s0 = nz[0] / SR if len(nz) else 0; s1 = nz[-1] / SR if len(nz) else len(a) / SR
        segs.append({"line": int(m.group(1)), "text": sent, "start": round(pos + s0, 3), "end": round(pos + s1, 3)})
        add(a); add(np.zeros(int(SR * (GAP if re.search(r'[.!?…]["”]?$', sent) else COMMA)), np.float32))
y = np.concatenate(pieces); y = y / np.abs(y).max() * 0.89
sf.write(args[1], y, SR); json.dump(segs, open(args[2], "w"), indent=1)
print(f"{len(y)/SR:.2f} s"); [print(f"{s['start']:6.2f}-{s['end']:6.2f} {s['text']}") for s in segs]
