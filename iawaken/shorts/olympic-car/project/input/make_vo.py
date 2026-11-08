# Fenrir (am_fenrir, 0.95) like whatif/voice/fenrir.py, but with a per-piece gap (beats before punchlines).
import sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
T = "/home/user/reel-render/tts/"; k = Kokoro(T + "kokoro-v1.0.onnx", T + "voices-v1.0.bin"); SR = 24000
P = [("The Olympic marathon winner rode in a car.", .35),
     ("He crossed the line first.", .5),
     ("Then someone noticed.", .35),
     ("Fred Lorz quit at mile nine,", .12), ("and hopped in a car.", .3),
     ("When it broke down,", .1), ("he jogged the rest.", .35),
     ("The real winner, Thomas Hicks, was kept going with strychnine, egg whites, and brandy.", .55),
     ("Nineteen-oh-four sports science.", .4),
     ("And according to legend, a Cuban runner stopped for some rotten apples,", .12), ("took a nap,", .55), ("and still finished fourth.", .4),
     ("The winning time?", .3), ("The slowest in Olympic history.", .5), ("By almost half an hour.", .45),
     ("Subscribe for more.", .25)]
out = [np.zeros(int(SR * .12), np.float32)]; marks = []
for txt, gap in P:
    a, _ = k.create(txt, voice="am_fenrir", speed=0.95, lang="en-us"); a = a.astype(np.float32)
    # trim leading/trailing near-silence so gaps are exact
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - 240): idx[-1] + 480]
    t0 = sum(len(x) for x in out) / SR; out.append(a); marks.append((round(t0, 2), round(t0 + len(a) / SR, 2), txt)); out.append(np.zeros(int(SR * gap), np.float32))
y = np.concatenate(out); y = y / np.abs(y).max() * 0.89; sf.write(sys.argv[1], y, SR)
for m in marks: print(*m)
print(f"{len(y)/SR:.2f} s")
