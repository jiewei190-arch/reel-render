"""Original SFX for the Boring & Dull Short, synthesized in code (no recordings).
yawn_a.wav / yawn_b.wav: a cartoon yawn (a voiced tone that rises, holds and slides down, through a moving vowel formant, + breath).
snore.wav: two slow cartoon snores. kazoo_fanfare.wav: a limp three-note 'ta-da' that droops. cricket.wav: a few cricket chirps.
Usage: python3 make_sfx.py  -> sfx/*.wav (44.1 kHz mono)"""
import os, numpy as np, wave
SR = 44100; D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx'); os.makedirs(D, exist_ok=True)
rng = np.random.default_rng(9)
def write(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9; y = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(D, name), 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
def bp(x, f, q, sr=SR):   # 2-pole resonator, time-varying centre f (array)
    y = np.zeros_like(x); y1 = y2 = 0.0
    for i in range(len(x)):
        w = 2 * np.pi * f[i] / sr; r = np.exp(-w / (2 * q)); a1, a2 = 2 * r * np.cos(w), -r * r
        y0 = x[i] * (1 - r) + a1 * y1 + a2 * y2; y[i] = y0; y2, y1 = y1, y0
    return y
def env(n, a, d):
    e = np.ones(n); ia, idd = int(a * SR), int(d * SR); e[:ia] = np.linspace(0, 1, ia) ** 2; e[n - idd:] = np.linspace(1, 0, idd) ** 1.5; return e
def yawn(sec=1.6, f0=170, seed=0):
    n = int(sec * SR); t = np.arange(n) / SR; u = t / sec
    pitch = f0 * (1 + 0.6 * np.sin(np.pi * np.clip(u / 0.45, 0, 1)) * (u < 0.45) + 0.6 * (u >= 0.45) * np.clip(1 - (u - 0.45) / 0.55, 0, 1) ** 1.3) * (1 + 0.01 * np.sin(2 * np.pi * 5 * t))
    ph = 2 * np.pi * np.cumsum(pitch) / SR; src = sum(np.sin(k * ph) / k ** 1.1 for k in range(1, 14))
    breath = rng.standard_normal(n) * 0.35
    f1 = 500 + 400 * np.sin(np.pi * np.clip(u / 0.5, 0, 1)) - 200 * np.clip((u - 0.6) / 0.4, 0, 1)   # 'aah' opening then 'oh'
    f2 = 1000 + 300 * np.sin(np.pi * np.clip(u / 0.5, 0, 1)) - 300 * np.clip((u - 0.6) / 0.4, 0, 1)
    v = bp(src + breath, f1, 6) + 0.6 * bp(src + breath, f2, 8)
    return v * env(n, 0.25, 0.45) * (0.7 + 0.3 * np.sin(np.pi * u))
def snore():
    out = []
    for k in range(2):
        n = int(1.1 * SR); t = np.arange(n) / SR; u = t / 1.1
        buzz = np.sign(np.sin(2 * np.pi * (38 + 10 * u) * t)) * 0.6 + rng.standard_normal(n) * 0.5
        out.append(bp(buzz, np.full(n, 300.0), 3) * np.sin(np.pi * np.clip(u / 0.6, 0, 1)) ** 2 * (u < 0.6))
        wh = rng.standard_normal(int(0.7 * SR)); out.append(bp(wh, np.linspace(1800, 900, len(wh)), 5) * 0.25 * np.sin(np.linspace(0, np.pi, len(wh))))
    return np.concatenate(out)
def kazoo():
    notes = [(392, 0.18), (523, 0.18), (659, 0.55)]; out = []
    for i, (f, d) in enumerate(notes):
        n = int(d * SR); t = np.arange(n) / SR; ff = f * (1 - (0.25 * (t / d) ** 2 if i == 2 else 0))
        ph = 2 * np.pi * np.cumsum(ff) / SR; s = np.sign(np.sin(ph)) * 0.5 + np.sin(2 * ph) * 0.3
        s = bp(s + rng.standard_normal(n) * 0.1, np.full(n, 1200.0), 4) * env(n, 0.01, 0.06 if i < 2 else 0.3); out.append(s)
    return np.concatenate(out)
def cricket():
    n = int(1.6 * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for c in (0.1, 0.65, 1.2):
        m = (t > c) & (t < c + 0.22); x += m * np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 30 * t) > 0)
    return x * 0.5
write('yawn_a.wav', yawn(1.6, 165)); write('yawn_b.wav', yawn(1.4, 120)); write('snore.wav', snore()); write('kazoo_fanfare.wav', kazoo()); write('cricket.wav', cricket())
print(sorted(os.listdir(D)))
