"""Original SFX for the 1987 signal-hijack Short, synthesized in code (no recordings of any broadcast).
buzz_<s>.wav: a harsh electrical buzz (detuned 120 Hz saw stack, clipped, slow wobble) + crackling static.
static_<s>.wav: TV snow hiss (band-passed noise with crackle). blip.wav: a short channel-flip blip.
Usage: python3 make_buzz.py  -> sfx/*.wav (44.1 kHz mono)"""
import os, numpy as np, wave
SR = 44100; D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx'); os.makedirs(D, exist_ok=True)
rng = np.random.default_rng(1987)
def write(name, x):
    x = np.clip(x, -1, 1); y = (x * 32767 * 0.9).astype(np.int16)
    with wave.open(os.path.join(D, name), 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
def onepole(x, a):
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a * (x[i] - s); y[i] = s
    return y
def fade(x, a=0.01, b=0.05):
    n = len(x); e = np.ones(n); ia, ib = int(a * SR), int(b * SR); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return x * e
def saw(f, t): return 2 * ((f * t) % 1.0) - 1
def buzz(sec):
    t = np.arange(int(sec * SR)) / SR
    wob = 1 + 0.012 * np.sin(2 * np.pi * 0.7 * t) + 0.006 * np.sin(2 * np.pi * 3.1 * t)
    x = sum(saw(f * wob, t) * g for f, g in ((120, 1.0), (120.8, 0.7), (240.5, 0.35), (59.9, 0.5)))
    x = np.tanh(x * 2.2) * 0.5
    am = 0.75 + 0.25 * np.sign(np.sin(2 * np.pi * 7.5 * t)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.37 * t))
    n = rng.standard_normal(len(t)); crack = (rng.random(len(t)) < 0.0015) * rng.standard_normal(len(t)) * 3
    hiss = (n - onepole(n, 0.25)) * 0.12 + onepole(crack, 0.5) * 0.4
    return fade(x * am + hiss, 0.02, 0.15)
def static(sec):
    n = rng.standard_normal(int(sec * SR)); hi = n - onepole(n, 0.2); band = onepole(hi, 0.6)
    crack = onepole((rng.random(len(n)) < 0.003) * rng.standard_normal(len(n)) * 4, 0.4)
    return fade(band * 0.5 + crack * 0.4, 0.01, 0.1)
def blip():
    t = np.arange(int(0.12 * SR)) / SR; f = 1400 - 6000 * t
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25) * 0.8 + static(0.12) * 0.4, 0.002, 0.03)
for s in (0.8, 1.5, 2.5, 4): write(f'buzz_{s}.wav', buzz(s))
for s in (0.4, 1.0): write(f'static_{s}.wav', static(s))
write('blip.wav', blip())
print(sorted(os.listdir(D)))
