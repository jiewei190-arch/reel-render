"""Original SFX for the Toledo War Short, synthesized in code (no recordings).
stare.wav: the staring-contest sting — a tense tremolo twang (plucked string, falling bend) under a crackling electric 'zap'
between the two governors' eyes. Usage: python make_sfx.py -> sfx/stare.wav"""
import numpy as np, soundfile as sf, os
SR = 44100; D = os.path.dirname(os.path.abspath(__file__)); rng = np.random.default_rng(3)
t = np.arange(int(SR * 2.6)) / SR
# plucked twang: Karplus-Strong-ish via decaying harmonics with a slow downward bend + tremolo
f0 = 196 * (1 - 0.06 * (1 - np.exp(-t * 1.2)))
ph = 2 * np.pi * np.cumsum(f0) / SR
tw = sum(np.sin(ph * k) / k ** 1.3 for k in range(1, 9)) * np.exp(-t * 1.4) * (1 + 0.35 * np.sin(2 * np.pi * 7 * t))
# crackle: sparse band-limited clicks, denser in bursts (the zap)
cr = np.zeros_like(t); idx = rng.choice(len(t), 900, replace=False); cr[idx] = rng.uniform(-1, 1, 900)
k = np.exp(-np.arange(60) / 8.0) * np.sin(np.arange(60) * 0.9); cr = np.convolve(cr, k, 'same') * (0.5 + 0.5 * (np.sin(2 * np.pi * 3.3 * t) > 0.3))
hum = np.sin(2 * np.pi * 120 * t + 0.4 * np.sin(2 * np.pi * 9 * t)) * 0.15
y = 0.7 * tw + 0.35 * cr + hum * np.exp(-t * 0.6); y *= np.minimum(1, t / 0.01) * np.minimum(1, (t[-1] - t) / 0.4)
y = np.tanh(y * 1.4); y /= np.abs(y).max() / 0.9
os.makedirs(f'{D}/sfx', exist_ok=True); sf.write(f'{D}/sfx/stare.wav', y.astype(np.float32), SR); print('sfx/stare.wav', round(len(y) / SR, 2), 's')
