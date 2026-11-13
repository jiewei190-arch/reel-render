"""Tardigrade Short voiceover: Kokoro am_fenrir 0.95 (same as whatif/voice/fenrir.py), Shorts gaps.
Segments: (spoken text, silence after in s). Years/numbers spelled out for TTS; captions use input/script.txt (digits).
Run from the project folder: python3 input/make_voice.py"""
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
TTS = "/home/user/reel-render/tts/"
k = Kokoro(TTS + "kokoro-v1.0.onnx", TTS + "voices-v1.0.bin")
SR = 24000
SEG = [
 ("In two thousand seven, scientists strapped tiny animals to the outside of a satellite.", 0.28),
 ("No suits.", 0.12), ("No oxygen.", 0.15), ("Just open space, for ten straight days.", 0.28),
 ("The radiation out there is a thousand times stronger than on Earth.", 0.30),
 ("When the satellite came home, they checked the bodies.", 0.42),   # beat before the punchline
 ("And the animals were alive.", 0.30),
 ("Some even laid eggs.", 0.32),
 ("They're called tardigrades.", 0.18),
 ("Half a millimeter long, lives in moss, looks like a gummy bear with eight legs.", 0.30),
 ("And now it's the first animal in history to survive outer space.", 0.38),
 ("Naked.", 0.34),
 ("Which means the toughest astronaut ever.", 0.38),
 ("Is this guy.", 0.22),
 ("Subscribe for more.", 0.10),
]
out = [np.zeros(int(SR * 0.12), np.float32)]
for txt, gap in SEG:
    a, _ = k.create(txt, voice="am_fenrir", speed=0.95, lang="en-us")
    out += [a.astype(np.float32), np.zeros(int(SR * gap), np.float32)]
y = np.concatenate(out); y = y / np.abs(y).max() * 0.89
sf.write("input/voiceover.wav", y, SR); print(f"{len(y)/SR:.2f} s")
