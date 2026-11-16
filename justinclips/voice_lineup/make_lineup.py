#!/usr/bin/env python3
"""Build lineup.mp3: every NN_*.mp3 in this folder back to back, each preceded by a short beep and a spoken label
"Number N" (Kokoro bf_emma, a British female voice that is not in the lineup, so the label can't be mistaken for a
candidate). Mastered to -14 LUFS, true peak <= -1 dBTP.
Usage (chatterbox venv, needs kokoro-onnx):  python make_lineup.py
"""
import glob, os, pathlib, re, subprocess
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = pathlib.Path(__file__).resolve().parent
SR = 48000
WORDS = "zero one two three four five six seven eight nine ten eleven twelve".split()
d = pathlib.Path(os.environ.get("KOKORO_DIR", pathlib.Path.home() / ".cache/tts_any/kokoro"))
k = Kokoro(str(d / "kokoro-v1.0.onnx"), str(d / "voices-v1.0.bin"))

def load(path):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).copy()

def label(n):
    s, sr = k.create(f"Number {WORDS[n]}.", voice="bf_emma", speed=1.0, lang="en-gb")
    tmp = HERE / "_label.wav"; sf.write(tmp, s, sr)
    a = load(tmp); tmp.unlink()
    idx = np.where(np.abs(a) > 0.02 * np.abs(a).max())[0]
    a = a[idx[0]:idx[-1] + int(0.05 * SR)]
    # label at about the sample's loudness (samples are -14 LUFS; peak 0.5 ~ similar perceived level)
    return a / np.abs(a).max() * 0.5

t = np.arange(int(0.12 * SR)) / SR
beep = (0.25 * np.sin(2 * np.pi * 880 * t) * np.hanning(len(t))).astype(np.float32)
sil = lambda s: np.zeros(int(SR * s), np.float32)

files = sorted(glob.glob(str(HERE / "[0-9][0-9]_*.mp3")))
parts, index = [sil(0.3)], []
pos = 0.3
for f in files:
    n = int(pathlib.Path(f).name[:2])
    seg = [beep, sil(0.15), label(n), sil(0.5)]
    pos += sum(len(x) for x in seg) / SR
    index.append((pos, pathlib.Path(f).name))
    a = load(f)
    seg += [a, sil(1.2)]
    pos += (len(a) + int(1.2 * SR)) / SR
    parts += seg
mix = np.concatenate(parts)
raw = HERE / "_lineup_raw.wav"; sf.write(raw, mix, SR)
# the samples are already at -14 LUFS; only a true-peak-safe limiter and a small gain trim are applied here
out = HERE / "lineup.mp3"
gain = 0.0
for _ in range(4):
    chain = f"volume={gain:.2f}dB,aresample=192000,alimiter=limit=0.8414:attack=2:release=60:level=false,aresample=48000"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", chain, "-ac", "1", "-c:a", "libmp3lame",
                    "-b:a", "192k", str(out)], check=True)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(out), "-af", "ebur128=peak=true", "-f", "null",
                        "-"], capture_output=True, text=True)
    s = r.stderr[r.stderr.rindex("Summary:"):]
    I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", s).group(1)); P = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", s).group(1))
    if abs(I + 14) <= 0.3 and P <= -1.0:
        break
    gain += -14 - I
raw.unlink()
print(f"lineup.mp3: {len(mix) / SR:.1f} s, {I} LUFS, TP {P} dBTP")
for p, name in index:
    print(f"  {int(p // 60)}:{p % 60:04.1f}  {name}")
