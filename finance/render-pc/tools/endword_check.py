"""endword_check.py <short_dir> [--fix DB] [--max-gap 6]

QA for ElevenLabs voices: the last word of the Short is often voiced softly. This measures the RMS level (dBFS) of the
final word (from vo/timings.json) against the rest of its line, and flags it if it is more than --max-gap dB quieter.

--fix DB writes voice.wav with that gain applied to the final word only (a 40 ms ramp in and out, a peak limit at
-1 dBFS), after saving the original once as voice.orig.wav. Re-run without --fix to confirm. Run with Python + numpy +
soundfile (the Chatterbox venv has both).
"""
import json
import shutil
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

args = sys.argv[1:]
d = Path(args[0])
fix = float(args[args.index("--fix") + 1]) if "--fix" in args else None
gap_max = float(args[args.index("--max-gap") + 1]) if "--max-gap" in args else 6.0

tm = json.loads((d / "vo" / "timings.json").read_text(encoding="utf8"))
turn = tm["turns"][-1]
words = turn["words"]
last = words[-1]
src = d / ("voice.orig.wav" if (fix is not None and (d / "voice.orig.wav").exists()) else "voice.wav")
audio, sr = sf.read(str(src), always_2d=True)
mono = audio.mean(axis=1)


def rms_db(a, b):
    s = mono[int(a * sr):max(int(a * sr) + 1, int(b * sr))]
    return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9)


line_db = rms_db(words[0]["t"], words[-2]["end"] if len(words) > 1 else last["t"])
word_end = min(last["end"], len(mono) / sr)
word_db = rms_db(last["t"], word_end)
gap = line_db - word_db
status = "FLAG" if gap > gap_max else "ok"
print(f"{d.name}: last word {last['w']!r} {last['t']:.2f}-{word_end:.2f} s: {word_db:.1f} dB vs line {line_db:.1f} dB "
      f"(gap {gap:.1f} dB, limit {gap_max:.0f}) {status}")

if fix is not None:
    if not (d / "voice.orig.wav").exists():
        shutil.copy(d / "voice.wav", d / "voice.orig.wav")
    g = np.ones(len(mono))
    a, b, ramp = int(last["t"] * sr), int(word_end * sr), int(0.04 * sr)
    k = 10 ** (fix / 20)
    env = np.ones(b - a) * k
    env[:ramp] = np.linspace(1, k, ramp)
    g[a:b] = env
    out = audio * g[:, None]
    peak = np.abs(out).max()
    if peak > 10 ** (-1 / 20):
        out = out * (10 ** (-1 / 20) / peak)
        print(f"  peak-limited by {20 * np.log10(peak / 10 ** (-1 / 20)):.1f} dB")
    sf.write(str(d / "voice.wav"), out, sr)
    print(f"  wrote voice.wav with +{fix:.1f} dB on {last['w']!r} (original kept as voice.orig.wav)")
