"""Kokoro samples for the voice test (A baseline, B voice candidates, C prosody)."""
import sys, time, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
TTS = "/home/user/reel-render/tts/"
k = Kokoro(TTS + "kokoro-v1.0.onnx", TTS + "voices-v1.0.bin")
SR = 24000
OUT = sys.argv[1]
SENTS = ["In two thousand seven, scientists strapped tiny animals to the outside of a satellite.",
         "No suits.", "No oxygen.", "Just open space for ten straight days.",
         "When the satellite came home, they checked the bodies...", "and the animals were alive."]
sil = lambda s: np.zeros(int(SR * s), np.float32)

def baseline(voice, speed=0.95, gap=0.3, comma=0.15, lead=0.15):
    # exactly the production Shorts settings of whatif/voice/fenrir.py
    text = " ".join(SENTS).replace("bodies... and", "bodies... and")
    import re
    parts = [sil(lead)]
    for sent in re.split(r'(?:(?<=[.!?…])|(?<=[.!?…]["”]))\s+', text):
        a, _ = k.create(sent, voice=voice, speed=speed, lang="en-us")
        parts += [a.astype(np.float32), sil(gap if re.search(r'[.!?…]["”]?$', sent) else comma)]
    return np.concatenate(parts)

def prosody(voice):
    # per-sentence speed + hand-placed pauses; reveal gets a long beat before it
    plan = [(SENTS[0], 0.97, 0.45), (SENTS[1], 0.93, 0.28), (SENTS[2], 0.95, 0.38),
            (SENTS[3], 1.00, 0.55), ("When the satellite came home, they checked the bodies.", 0.96, 0.95),
            ("And the animals were alive.", 0.92, 0.5)]
    parts = [sil(0.2)]
    for t, sp, gap in plan:
        a, _ = k.create(t, voice=voice, speed=sp, lang="en-us")
        a = a.astype(np.float32)
        # trim Kokoro's built-in edge silence so our pauses are what you hear
        idx = np.where(np.abs(a) > 0.01)[0]
        a = a[max(idx[0] - 600, 0): idx[-1] + 1200]
        parts += [a, sil(gap)]
    return np.concatenate(parts)

if __name__ == "__main__":
    mode, voice, name = sys.argv[2], sys.argv[3], sys.argv[4]
    t = time.time()
    y = baseline(voice) if mode == "base" else prosody(voice)
    dt = time.time() - t
    sf.write(f"{OUT}/{name}.wav", y / np.abs(y).max() * 0.89, SR)
    print(f"{name}\t{len(y)/SR:.2f}s\trender {dt:.1f}s\t{dt/(len(y)/SR)*10:.2f}s per 10s")
