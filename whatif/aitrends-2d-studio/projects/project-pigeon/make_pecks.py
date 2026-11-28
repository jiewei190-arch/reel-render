"""Original synthesized pigeon-peck SFX (no recordings): hard little beak taps on a glass screen. Three birds pecking at
slightly different rates (about 4-5 pecks a second each), each tap = a short band-passed click + a glassy ring + a tiny wood knock.
Writes sfx/pecks_<n>.wav (three birds) and sfx/peck1_<n>.wav (one fast bird). Usage: python make_pecks.py"""
import os, numpy as np, soundfile as sf
from scipy.signal import butter, lfilter
SR = 44100; D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx'); os.makedirs(D, exist_ok=True)
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def tap(r, pitch=1.0):
    k = int(0.05 * SR); tt = np.arange(k) / SR
    click = bp(r.standard_normal(k), 2000, 7000) * np.exp(-tt / 0.0025)
    ring = np.sin(2 * np.pi * 3100 * pitch * tt) * np.exp(-tt / 0.012) * 0.35 + np.sin(2 * np.pi * 4700 * pitch * tt) * np.exp(-tt / 0.007) * 0.2
    knock = np.sin(2 * np.pi * 620 * pitch * tt) * np.exp(-tt / 0.005) * 0.5
    return click * 0.8 + ring + knock
def make(dur, rates, seed=1):
    r = np.random.default_rng(seed); n = int(dur * SR); y = np.zeros(n)
    for bi, rate in enumerate(rates):
        t0 = r.random() * 0.15; p = 0.9 + 0.12 * bi
        while t0 < dur - 0.06:
            a = tap(r, p * (0.97 + 0.06 * r.random())) * (0.7 + 0.3 * r.random()) * (1.0 if bi == 0 else 0.75)
            s = int(t0 * SR); e = min(n, s + len(a)); y[s:e] += a[:e - s]
            t0 += (1 / rate) * (0.85 + 0.3 * r.random())
    f = int(0.01 * SR); y[:f] *= np.linspace(0, 1, f); y[-int(0.06 * SR):] *= np.linspace(1, 0, int(0.06 * SR))
    return (y / np.abs(y).max() * 0.9).astype(np.float32)
for d in [1, 2, 3, 5]:
    sf.write(f'{D}/pecks_{d}.wav', make(d, [4.2, 4.5, 4.8], seed=d), SR)
    sf.write(f'{D}/peck1_{d}.wav', make(d, [6.5], seed=10 + d), SR)
print('wrote', sorted(os.listdir(D)))
