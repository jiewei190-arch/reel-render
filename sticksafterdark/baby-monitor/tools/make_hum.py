"""A soft hummed lullaby heard through a baby-monitor speaker. Writes project/sfx/hum_monitor.wav and hum_static.wav.
  python3 tools/make_hum.py
Procedural and original: a slow 3/4 melody (own notes), voiced 'mmm' (harmonics, low-passed, light vibrato),
then a small-speaker band (300-3200 Hz) + monitor hiss. Nothing harsh: the scare is that it is there at all."""
import os, subprocess, numpy as np, soundfile as sf
SR = 48000; r = np.random.default_rng(9); D = os.path.join(os.path.dirname(__file__), "..", "project", "sfx"); os.makedirs(D, exist_ok=True)
A4 = 440.0; hz = lambda n: A4 * 2 ** ((n - 69) / 12)
# (midi note, beats); 1 beat = 0.62 s. Own melody in A minor-ish, falling phrases.
MEL = [(69, 2), (72, 1), (71, 2), (69, 1), (67, 3), (64, 2), (65, 1), (67, 2), (64, 1), (69, 3),
       (69, 2), (72, 1), (74, 2), (72, 1), (71, 3), (69, 2), (67, 1), (64, 2), (65, 1), (64, 3)]
BEAT = 0.62
def voice(seq, transpose=-12):
    out = []; ph = 0.0
    for n, b in seq:
        d = b * BEAT; m = int(d * SR); t = np.arange(m) / SR
        f = hz(n + transpose) * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * t + r.uniform(0, 6)))
        p = ph + 2 * np.pi * np.cumsum(f) / SR; ph = p[-1]
        y = sum(np.sin(k * p) * (0.55 ** (k - 1)) for k in range(1, 7))
        env = np.minimum(1, t / 0.12) * np.minimum(1, (d - t) / 0.18) ** 1.2
        out.append(y * env * 0.5)
    return np.concatenate(out)
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def write(name, y, af):
    tmp = os.path.join(D, name + ".tmp.wav"); sf.write(tmp, (y / np.abs(y).max() * 0.8).astype(np.float32), SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", af, "-ac", "2", os.path.join(D, name)], check=True); os.remove(tmp)
    print("wrote", name, f"{len(y)/SR:.2f}s")
def monitor_band(seq):
    h = bp(voice(seq), 300, 3200); return h + bp(r.normal(0, 1, len(h)), 1500, 7000) * 0.05
# 1) "Someone was humming... A lullaby." (first two phrases, ~11 s, fades out as they run to her room)
h1 = monitor_band(MEL[:10]); write("hum_monitor.wav", h1, f"lowpass=f=2600,aecho=0.6:0.4:18:0.2,afade=t=in:d=0.4,afade=t=out:st={len(h1)/SR-2.5:.2f}:d=2.5,volume=0.9")
# 2) "And it just started humming again." (the opening notes, fading in from nothing, ~4.3 s)
h2 = monitor_band(MEL[:4] + [(67, 3)]); write("hum_again.wav", h2, f"lowpass=f=2400,afade=t=in:d=1.6,afade=t=out:st={len(h2)/SR-1.0:.2f}:d=1.0,volume=0.9")
# a short crackle burst (the monitor switching on)
n = int(0.7 * SR); c = r.normal(0, 1, n) * (r.random(n) < 0.08) * np.exp(-np.linspace(0, 4, n)) + r.normal(0, 0.15, n) * np.exp(-np.linspace(0, 3, n))
write("crackle.wav", bp(c, 400, 6000), "volume=0.9")
