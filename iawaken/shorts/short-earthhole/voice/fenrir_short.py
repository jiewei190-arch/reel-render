"""Narrate a What If script.md with the locked Fenrir voice (whatif/VOICE.md).
Spoken text = numbered lines only; '## ' headers (sections, rule cards) add a 1.4 s break.
Usage: python fenrir.py script.md out.wav [plain.txt]"""
import re, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

TTS = "/home/user/reel-render/tts/"
k = Kokoro(TTS + "kokoro-v1.0.onnx", TTS + "voices-v1.0.bin")
SR = 24000
pieces, spoken = [], []
def sil(s): pieces.append(np.zeros(int(SR * s), np.float32))

for raw in open(sys.argv[1], encoding="utf-8"):
    line = raw.strip()
    if line.startswith("## ") and pieces:
        pass  # topped up to 1.4 s on top of the last sentence gap
        continue
    m = re.match(r"^\d+[a-z]?\.\s+(.*)", line)
    if not m:
        continue
    text = m.group(1).replace("**", "")
    spoken.append(text)
    for sent in re.split(r'(?:(?<=[.!?…])|(?<=[.!?…]["”]))\s+', text):
        if not sent.strip():
            continue
        audio, _ = k.create(sent, voice="am_fenrir", speed=0.95, lang="en-us")
        pieces.append(audio.astype(np.float32))
        sil(0.3 if re.search(r'[.!?…]["”]?$', sent) else 0.15)

y = np.concatenate([np.zeros(int(SR * 0.05), np.float32)] + pieces)
y = y / np.abs(y).max() * 0.89
sf.write(sys.argv[2], y, SR)
if len(sys.argv) > 3:
    open(sys.argv[3], "w").write("\n".join(spoken) + "\n")
print(f"{len(y)/SR:.2f} s, {sum(len(s.split()) for s in spoken)} words")
