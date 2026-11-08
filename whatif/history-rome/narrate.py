"""Narrate the History Hook script.md with the locked Fenrir voice (whatif/VOICE.md settings), plus one
switch for documentary pacing: a '<!-- speed x -->' line sets the Kokoro speed for the lines after it
(default 0.95, the What If speed). Spoken text = numbered lines only; '## ' headers add a 1.4 s break.
Usage: python3 narrate.py script.md out.wav [plain.txt] [lines.json]"""
import json, re, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

TTS = "/home/user/reel-render/tts/"
k = Kokoro(TTS + "kokoro-v1.0.onnx", TTS + "voices-v1.0.bin")
SR = 24000
pieces, spoken, lines, sents = [], [], [], []
speed = 0.95
def sil(s): pieces.append(np.zeros(int(SR * s), np.float32))
def now(): return sum(len(p) for p in pieces) / SR + 0.3

for raw in open(sys.argv[1], encoding="utf-8"):
    line = raw.strip()
    m = re.match(r"<!--\s*speed\s+([\d.]+)\s*-->", line)
    if m:
        speed = float(m.group(1)); continue
    if line.startswith("## ") and pieces:
        sil(1.4 - 0.55)
        continue
    m = re.match(r"^(\d+)[a-z]?\.\s+(.*)", line)
    if not m:
        continue
    text = m.group(2).replace("**", "")
    spoken.append(text)
    t0 = now()
    # slower clip lines get longer sentence gaps (documentary weight)
    gap = 0.55 if speed >= 0.95 else 0.65
    for sent in re.split(r'(?:(?<=[.!?…:])|(?<=[.!?…]["”]))\s+', text):
        if not sent.strip():
            continue
        sents.append({"line": int(m.group(1)), "start": round(now(), 3), "text": sent})
        audio, _ = k.create(sent, voice="am_fenrir", speed=speed, lang="en-us")
        pieces.append(audio.astype(np.float32))
        sents[-1]["end"] = round(now(), 3)
        sil(gap if re.search(r'[.!?…]["”]?$', sent) else 0.25)
    lines.append({"n": int(m.group(1)), "start": round(t0, 3), "end": round(now(), 3), "speed": speed, "text": text})

y = np.concatenate([np.zeros(int(SR * 0.3), np.float32)] + pieces + [np.zeros(int(SR * 0.6), np.float32)])
y = y / np.abs(y).max() * 0.89
sf.write(sys.argv[2], y, SR)
if len(sys.argv) > 3:
    open(sys.argv[3], "w").write("\n".join(spoken) + "\n")
if len(sys.argv) > 4:
    json.dump({"lines": lines, "sentences": sents}, open(sys.argv[4], "w"), indent=1)
print(f"{len(y)/SR:.2f} s, {sum(len(s.split()) for s in spoken)} words")
