#!/usr/bin/env python3
"""storytime_amp.py: the voice's loudness per output frame (30 fps), for the storytime kit's mouth flaps.

  python3 tools/storytime_amp.py <voice.mp3|wav> <out amp.json>

Decodes with ffmpeg to 48 kHz mono, takes the RMS of each 1/30 s window, normalises by the 98th percentile (so the
loudest shouts reach 1.0 and normal speech sits around 0.3-0.6) and writes {"fps": 30, "amp": [...]} (3 decimals).
Deterministic: same file in, same numbers out. Standard library only (array, math, subprocess).
"""
import array
import json
import math
import subprocess
import sys

if len(sys.argv) != 3:
    sys.exit(__doc__)
src, out = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "48000", "-f", "s16le", "-"], check=True, capture_output=True).stdout
a = array.array("h")
a.frombytes(raw[: len(raw) // 2 * 2])
F = 48000 // 30
n = (len(a) + F - 1) // F
rms = []
for i in range(n):
    seg = a[i * F:(i + 1) * F]
    rms.append(math.sqrt(sum(x * x for x in seg) / max(1, len(seg))) / 32768.0)
ref = sorted(rms)[int(0.98 * (len(rms) - 1))] or 1.0
amp = [round(min(1.0, r / ref), 3) for r in rms]
json.dump({"fps": 30, "source": src.split("/")[-1], "frames": n, "ref_rms": round(ref, 5), "amp": amp}, open(out, "w"))
print(f"{out}: {n} frames, 98th-percentile RMS {ref:.4f}")
