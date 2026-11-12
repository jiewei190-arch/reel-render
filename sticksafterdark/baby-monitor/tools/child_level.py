"""Lower the [CHILD] line in project/input/voiceover.wav so it sits ~1.5 dB under the narrator (kit voice.py renders it ~5 dB hot).
  python3 tools/child_level.py      (run once, right after kits/sticks/tools/voice.py)"""
import os, json, numpy as np, soundfile as sf
P = os.path.join(os.path.dirname(__file__), "..", "project"); f = os.path.join(P, "input", "voiceover.wav")
y, sr = sf.read(f); W = json.load(open(os.path.join(P, "timeline", "words.json")))["words"]
i = [k for k, w in enumerate(W) if w["word"] == "The" and W[k + 1]["word"] == "tall"][0]
a, b = W[i]["start"] - 0.1, W[i + 7]["end"] + 0.15            # "The tall lady. She stopped when you came."
def rms(s): s = s[np.abs(s) > 0.01]; return 20 * np.log10(np.sqrt((s ** 2).mean()))
narr = rms(y[int((W[i - 7]["start"]) * sr): int(W[i - 1]["end"] * sr)]); child = rms(y[int(a * sr): int(b * sr)])
gdb = (narr - 1.5) - child; g = np.ones(len(y)); n0, n1, fd = int(a * sr), int(b * sr), int(0.03 * sr)
g[n0:n1] = 10 ** (gdb / 20); g[n0 - fd:n0] = np.linspace(1, 10 ** (gdb / 20), fd); g[n1:n1 + fd] = np.linspace(10 ** (gdb / 20), 1, fd)
sf.write(f, (y * g).astype(np.float32), sr); print(f"child {child:.1f} dB, narrator {narr:.1f} dB -> gain {gdb:+.1f} dB on {a:.2f}-{b:.2f} s")
