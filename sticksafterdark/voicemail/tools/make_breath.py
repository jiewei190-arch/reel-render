"""Breathing heard through a phone speaker (for the voicemail waveform shot). Writes project/sfx/breath.wav.
  python3 tools/make_breath.py
Procedural: band-passed noise with slow inhale/exhale envelopes, then a phone band (350-3400 Hz)."""
import os, subprocess, numpy as np, soundfile as sf
SR = 48000; r = np.random.default_rng(5); OUT = os.path.join(os.path.dirname(__file__), "..", "project", "sfx", "breath.wav")
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
parts = []
for i, (inh, exh) in enumerate([(0.9, 1.1), (0.85, 1.2), (0.95, 1.15), (0.9, 1.3)]):
    for d, lo, hi, k in [(inh, 700, 2600, 0.7), (exh, 400, 1800, 1.0)]:
        n = int(d * SR); u = np.linspace(0, 1, n); env = np.sin(np.pi * u ** 0.7) ** 1.5 * k
        parts.append(bp(r.normal(0, 1, n), lo, hi) * env)
    parts.append(np.zeros(int(0.15 * SR)))
y = np.concatenate(parts); y = y / np.abs(y).max() * 0.8
tmp = OUT + ".tmp.wav"; sf.write(tmp, y.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "highpass=f=350,lowpass=f=3400,volume=0.9", "-ac", "2", OUT], check=True); os.remove(tmp)
print("wrote", OUT, f"{len(y)/SR:.2f}s")
