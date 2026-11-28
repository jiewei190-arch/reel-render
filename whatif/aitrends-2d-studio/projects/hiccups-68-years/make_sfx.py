"""Original SFX for the hiccups Short, synthesized in code (no recordings, no voice samples).
hic.wav: a cartoon "hic" — a glottal click, then a short rising 'ih' vowel (pulse train through two formant resonators),
plus a tiny chest thump. hic2.wav: the same, slightly higher/shorter (variation). Usage: python make_sfx.py -> sfx/hic*.wav"""
import numpy as np, soundfile as sf, os
from scipy.signal import lfilter
SR = 44100; D = os.path.dirname(os.path.abspath(__file__))
def reson(x, f, bw):
    r = np.exp(-np.pi * bw / SR); th = 2 * np.pi * f / SR
    return lfilter([1 - r], [1, -2 * r * np.cos(th), r * r], x)
def hic(f0=240, dur=0.15, seed=1, bright=1.0):
    rng = np.random.default_rng(seed); n = int(SR * dur); t = np.arange(n) / SR
    f = f0 * (1 + 0.45 * np.minimum(1, t / dur))                          # pitch jumps up through the 'ic'
    ph = np.cumsum(f) / SR; pulses = (np.diff(np.floor(ph), prepend=0) > 0).astype(float)
    v = reson(pulses, 420, 90) * 1.0 + reson(pulses, 2100 * bright, 160) * 0.55 + reson(pulses, 2900, 220) * 0.25
    env = np.minimum(1, t / 0.006) * np.exp(-np.maximum(0, t - 0.05) / 0.035)
    v = v * env
    click = np.zeros(n); k = int(0.004 * SR); click[:k] = rng.uniform(-1, 1, k) * np.linspace(1, 0, k)   # glottal stop onset
    stop = np.zeros(n); s0 = int(0.11 * SR); m = min(int(0.03 * SR), n - s0); stop[s0:s0 + m] = rng.uniform(-1, 1, m) * np.exp(-np.arange(m) / (0.006 * SR)) * 0.35  # the 'c' release
    thump = np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.03) * 0.5
    y = v / (np.abs(v).max() + 1e-9) + click * 0.6 + reson(stop, 3500, 1500) * 4 + thump
    y = np.concatenate([y, np.zeros(int(0.05 * SR))]); return (y / np.abs(y).max() * 0.9).astype(np.float32)
os.makedirs(f'{D}/sfx', exist_ok=True)
sf.write(f'{D}/sfx/hic.wav', hic(), SR); sf.write(f'{D}/sfx/hic2.wav', hic(275, 0.13, 2, 1.08), SR); print('sfx/hic.wav, sfx/hic2.wav')
