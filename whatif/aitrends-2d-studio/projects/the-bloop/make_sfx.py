"""Original synthesized SFX for the Bloop Short (no recordings of the real sound are used).
- sfx/sweep_<n>.wav : an ultra-low rumble that rises in pitch (fundamental 34 -> 70 Hz with harmonics up to ~600 Hz so phones can
  play it), slow swell and fade, faint deep-water noise. A cartoon re-creation, not the NOAA recording.
- sfx/bloop.wav     : the "sped up" version: a short watery rising chirp (180 -> 720 Hz) with a bubble pop at the end.
- sfx/icecrack.wav  : an ice crack: sharp broadband snap + creaking low groan.
Usage: python make_sfx.py"""
import os, numpy as np, soundfile as sf
from scipy.signal import butter, lfilter
SR = 44100; D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx'); os.makedirs(D, exist_ok=True)
r = np.random.default_rng(3)
def lp(x, f): b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def norm(y, p=0.9): return (y / np.abs(y).max() * p).astype(np.float32)
def sweep(dur, f0=34, f1=70):
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur
    f = f0 + (f1 - f0) * k ** 1.4; ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(ph * h) * (0.9 / h ** 0.9) for h in range(1, 10))
    y *= 1 + 0.25 * np.sin(2 * np.pi * 3.2 * t)                      # slow wobble
    y += lp(r.standard_normal(n), 220) * 0.6                          # deep-water rumble
    env = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.6) * (0.75 + 0.25 * np.sin(np.pi * k))
    return norm(np.tanh(y * env * 0.9))
def bloop():
    dur = 0.85; n = int(dur * SR); t = np.arange(n) / SR; k = t / dur
    f = 180 * (4 ** (k ** 0.8)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = (np.sin(ph) + 0.35 * np.sin(2 * ph)) * np.minimum(1, t / 0.03) * np.exp(-((k - 0.55) ** 2) / 0.12)
    pt = t[t > 0.68] - 0.68; pop = np.zeros(n); pop[t > 0.68] = np.sin(2 * np.pi * (600 + 2500 * pt) * pt) * np.exp(-pt / 0.03)
    return norm(y + 0.6 * pop)
def icecrack():
    dur = 1.6; n = int(dur * SR); t = np.arange(n) / SR
    snap = bp(r.standard_normal(n), 1500, 9000) * np.exp(-t / 0.025) * 1.2
    for d in (0.12, 0.27, 0.41):
        tt = np.clip(t - d, 0, None); snap += bp(r.standard_normal(n), 1200, 7000) * np.exp(-tt / 0.02) * (t > d) * 0.6
    groan = np.sin(2 * np.pi * np.cumsum(70 + 25 * np.sin(2 * np.pi * 1.3 * t)) / SR) * np.exp(-t / 0.7) * 0.7
    groan += lp(r.standard_normal(n), 300) * np.exp(-t / 0.5) * 0.5
    return norm(np.tanh(snap + groan))
for d in (3.0, 5.0): sf.write(f'{D}/sweep_{d:g}.wav', sweep(d), SR)
sf.write(f'{D}/bloop.wav', bloop(), SR); sf.write(f'{D}/icecrack.wav', icecrack(), SR); print('ok', sorted(os.listdir(D)))
