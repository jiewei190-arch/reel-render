"""Project-local SFX for "Two Texts" (the kit has no knock): a wooden door knock and a knuckle-on-glass knock.
   python3 make_knocks.py  -> knock_door.wav, knock_glass.wav (48 kHz mono, one hit each; place them several times in shots.json)"""
import numpy as np, soundfile as sf
SR = 48000; rng = np.random.default_rng(5)
def env(n, tau): return np.exp(-np.arange(n) / (SR * tau))
def hit(freqs, tau, click, dur, noise_lp):
    n = int(SR * dur); t = np.arange(n) / SR; y = np.zeros(n)
    for f, a, tt in freqs: y += a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * env(n, tt)
    nz = rng.normal(0, 1, n); k = int(noise_lp); nz = np.convolve(nz, np.ones(k) / k, 'same')
    y += click * nz * env(n, 0.006) * 4
    y += 0.25 * nz * env(n, tau)
    att = int(SR * 0.0015); y[:att] *= np.linspace(0, 1, att)
    return (y / np.abs(y).max() * 0.9).astype(np.float32)
sf.write('knock_door.wav', hit([(118, 1.0, 0.07), (205, 0.7, 0.05), (410, 0.35, 0.03), (760, 0.15, 0.015)], 0.04, 0.9, 0.35, 9), SR)
sf.write('knock_glass.wav', hit([(1350, 0.6, 0.05), (2260, 0.45, 0.035), (3900, 0.25, 0.02), (240, 0.5, 0.03)], 0.02, 0.6, 0.4, 3), SR)
print('ok')
