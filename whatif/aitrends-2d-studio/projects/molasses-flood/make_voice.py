"""Voice for molasses-flood: Kokoro am_fenrir, speed 0.95 (same settings as whatif/voice/fenrir.py), Shorts gaps
(0.3 s after a sentence, 0.15 s after a comma-piece) plus the explicit '|beat' silences in input/voice_lines.txt.
Usage: python3 make_voice.py  -> input/voiceover.wav (24 kHz)"""
import re, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
TTS = "/home/user/reel-render/tts/"
k = Kokoro(TTS + "kokoro-v1.0.onnx", TTS + "voices-v1.0.bin"); SR = 24000
GAP, COMMA, LEAD, TAIL = 0.24, 0.1, 0.1, 0.05
out = [np.zeros(int(SR * LEAD), np.float32)]
lines = [l.rstrip("\n") for l in open("input/voice_lines.txt", encoding="utf-8") if l.strip() and not l.startswith("#")]
for i, l in enumerate(lines):
    text, beat = (l.split("|") + ["0"])[:2]
    a, _ = k.create(text.strip(), voice="am_fenrir", speed=0.95, lang="en-us")
    # trim Kokoro's own leading/trailing near-silence so the gaps are what we set
    nz = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, nz[0] - 240): nz[-1] + 480]
    out.append(a.astype(np.float32))
    last = i == len(lines) - 1
    g = TAIL if last else (GAP if re.search(r'[.!?]$', text.strip()) else COMMA) + float(beat)
    out.append(np.zeros(int(SR * g), np.float32))
y = np.concatenate(out); y = y / np.abs(y).max() * 0.89
sf.write("input/voiceover.wav", y, SR); print(f"{len(y)/SR:.2f} s")
