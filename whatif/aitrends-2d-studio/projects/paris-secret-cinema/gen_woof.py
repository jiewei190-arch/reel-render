"""Procedural cartoon 'woof' (no samples): a pitch-dropping buzzy tone + breath noise, band-limited.
Writes sfx/woof.wav (44.1 kHz mono). Deterministic."""
import numpy as np, wave
SR = 44100
def woof(dur=0.26, f0=420, f1=190, seed=1):
    n = int(SR * dur); t = np.arange(n) / SR; r = np.random.default_rng(seed)
    f = f1 + (f0 - f1) * np.exp(-t / 0.06); ph = 2 * np.pi * np.cumsum(f) / SR
    tone = sum(np.sin(k * ph) / k ** 0.8 for k in range(1, 9))
    noise = r.standard_normal(n); noise = np.convolve(noise, np.ones(6) / 6, 'same')
    env = np.minimum(1, t / 0.012) * np.exp(-t / 0.09)
    x = (0.8 * tone + 0.5 * noise) * env
    x = np.convolve(x, np.hanning(9) / np.hanning(9).sum(), 'same')   # soften the top end
    return x
y = np.concatenate([woof(seed=1), np.zeros(int(SR * 0.09)), woof(0.3, 390, 170, seed=2)])
y = y / np.abs(y).max() * 0.8
with wave.open('sfx/woof.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype('<i2').tobytes())
print('sfx/woof.wav', round(len(y) / SR, 3))
