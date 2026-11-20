"""Original synthesized 'Woodpecker' tapping SFX (no recordings): 10 sharp clicks per second (10 Hz), each a short
band-passed noise burst + a ringing tone, over a faint shortwave hiss. Writes sfx/taps_<n>.wav for n in DURS seconds.
Usage: python make_taps.py"""
import os, numpy as np, soundfile as sf
from scipy.signal import butter, lfilter
SR = 44100; D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx'); os.makedirs(D, exist_ok=True)
DURS = [0.8, 1.5, 2.5, 4.0]
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def make(dur, seed=1, hiss=0.05):
    r = np.random.default_rng(seed); n = int(dur * SR); y = np.zeros(n)
    k = int(0.035 * SR); tt = np.arange(k) / SR
    for i, t0 in enumerate(np.arange(0, dur, 0.1)):          # 10 Hz grid
        burst = bp(r.standard_normal(k), 900, 4200) * np.exp(-tt / 0.004)
        ring = np.sin(2 * np.pi * (1450 + 40 * (i % 3)) * tt) * np.exp(-tt / 0.009) * 0.8
        thump = np.sin(2 * np.pi * 180 * tt) * np.exp(-tt / 0.006) * 0.6
        p = (burst * 0.7 + ring + thump) * (0.9 + 0.1 * r.random())
        s = int(t0 * SR); e = min(n, s + k); y[s:e] += p[:e - s]
    y = np.tanh(y * 1.6)                                      # a little radio grit
    y += bp(r.standard_normal(n), 300, 5000) * hiss            # shortwave hiss
    f = int(0.03 * SR); y[:f] *= np.linspace(0, 1, f); y[-int(0.08 * SR):] *= np.linspace(1, 0, int(0.08 * SR))
    return (y / np.abs(y).max() * 0.9).astype(np.float32)
for d in DURS: sf.write(f'{D}/taps_{d:g}.wav', make(d), SR); print('wrote', f'sfx/taps_{d:g}.wav')
