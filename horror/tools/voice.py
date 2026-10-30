"""THE RULES voice: narrator = Kokoro am_fenrir, slower than What If; [MONITOR] lines = af_nicole whisper, pitched up and band-passed
like a cheap baby monitor, with static. Spoken text = numbered lines; '## ' headers add a long beat.
Usage: python voice.py script.md out.wav plain.txt"""
import re, sys, subprocess, tempfile, os
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

TTS = "/home/user/reel-render/tts/"
k = Kokoro(TTS + "kokoro-v1.0.onnx", TTS + "voices-v1.0.bin")
SR = 24000
rng = np.random.default_rng(7)
pieces, spoken = [], []
def sil(s): pieces.append(np.zeros(int(SR * s), np.float32))

def monitor(text):
    a, _ = k.create(text, voice="af_nicole", speed=0.9, lang="en-us")
    with tempfile.TemporaryDirectory() as d:
        i, o = os.path.join(d, "i.wav"), os.path.join(d, "o.wav")
        sf.write(i, a, SR)
        # pitch up ~4 semitones (child-like), keep tempo; tinny speaker band; light saturation
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", i, "-af",
                        f"asetrate={SR}*1.26,aresample={SR},atempo=1/1.26,highpass=f=450,lowpass=f=3200,acompressor=threshold=-20dB:ratio=6,volume=1.6",
                        o], check=True)
        y, _ = sf.read(o, dtype="float32")
    st = rng.normal(0, 1, len(y) + int(SR * 0.6)).astype(np.float32) * 0.035          # static bed, a bit longer than the words
    st[: int(SR * 0.3)] *= np.linspace(3, 1, int(SR * 0.3))                                # crackle on key-up
    out = st.copy(); out[int(SR * 0.3): int(SR * 0.3) + len(y)] += y
    return out

for raw in open(sys.argv[1], encoding="utf-8"):
    line = raw.strip()
    if line.startswith("## ") and pieces:
        sil(0.9); continue
    m = re.match(r"^\d+\.\s+(.*)", line)
    if not m: continue
    text = m.group(1)
    if text.startswith("[MONITOR]"):
        t = text[len("[MONITOR]"):].strip(); spoken.append(t)
        pieces.append(monitor(t)); sil(0.9); continue
    spoken.append(text)
    for sent in re.split(r"(?<=[.!?])\s+", text):
        a, _ = k.create(sent, voice="am_fenrir", speed=0.86, lang="en-us")
        pieces.append(a.astype(np.float32)); sil(0.7)

y = np.concatenate([np.zeros(int(SR * 0.4), np.float32)] + pieces + [np.zeros(int(SR * 1.2), np.float32)])
y = y / np.abs(y).max() * 0.89
sf.write(sys.argv[2], y, SR)
open(sys.argv[3], "w").write("\n".join(spoken) + "\n")
print(f"{len(y)/SR:.2f} s, {sum(len(s.split()) for s in spoken)} words")
