"""Fenrir narration for this Short: same engine + settings as whatif/voice/fenrir.py (Kokoro am_fenrir, speed 0.95,
Shorts gaps --gap 0.3 --comma 0.15 --lead 0.15), plus a "[beat]" marker = an extra 0.35 s of silence before a punchline.
Usage (from the kit folder): python3 projects/lonely-guinea-pig/input/make_voice.py"""
import re, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
D = os.path.dirname(os.path.abspath(__file__)); TTS = "/home/user/reel-render/tts/"
k = Kokoro(TTS + "kokoro-v1.0.onnx", TTS + "voices-v1.0.bin"); SR = 24000
GAP, COMMA, LEAD, BEAT = 0.3, 0.15, 0.15, 0.35
pieces, spoken = [np.zeros(int(SR * LEAD), np.float32)], []
sil = lambda s: pieces.append(np.zeros(int(SR * s), np.float32))
for raw in open(os.path.join(D, "tts_script.md"), encoding="utf-8"):
    m = re.match(r"^\d+\.\s+(.*)", raw.strip())
    if not m: continue
    text = m.group(1)
    if text.startswith("[beat]"): sil(BEAT); text = text[6:].strip()
    spoken.append(text)
    for sent in re.split(r'(?<=[.!?…])\s+', text):
        if not sent.strip(): continue
        a, _ = k.create(sent, voice="am_fenrir", speed=0.95, lang="en-us"); pieces.append(a.astype(np.float32))
        sil(GAP if re.search(r'[.!?…]$', sent) else COMMA)
y = np.concatenate(pieces); y = y / np.abs(y).max() * 0.89
sf.write(os.path.join(D, "voiceover.wav"), y, SR)
open(os.path.join(D, "spoken.txt"), "w").write("\n".join(spoken) + "\n")
print(f"{len(y)/SR:.2f} s, {sum(len(s.split()) for s in spoken)} words")
