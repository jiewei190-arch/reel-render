import sys, pathlib, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = pathlib.Path(__file__).resolve().parents[1]; MODELS = HERE.parent / "tts"; SR = 24000
style, out = sys.argv[1], sys.argv[2]; D = 5.0; N = int(D * SR); tt = np.arange(N) / SR
rng = np.random.default_rng(3)
k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
def tts(text, voice, speed, maxd):
    while True:
        s, _ = k.create(text, voice=voice, speed=speed, lang="en-us"); s = s.astype(np.float32)
        i = np.where(np.abs(s) > .012)[0]; s = s[i[0]:i[-1] + 1]
        if len(s) / SR <= maxd or speed > 1.35: break
        speed += .04
    n = int(.01 * SR); s[:n] *= np.linspace(0, 1, n); s[-n:] *= np.linspace(1, 0, n)
    print(text, round(len(s) / SR, 2), speed); return s
voice = np.zeros(N, np.float32); mus = np.zeros(N, np.float32); fx = np.zeros(N, np.float32)
def put(buf, at, w, g=1.):
    a = int(at * SR); w = w[:max(0, N - a)]; buf[a:a + len(w)] += g * w
def env(d, a=.005, r=None):
    n = int(d * SR); x = np.arange(n) / SR; e = np.minimum(1, x / a); return e * np.exp(-x / (r or d / 4))
def tone(f, d, harm=(1,), r=None):
    n = int(d * SR); x = np.arange(n) / SR; w = sum(np.sin(2 * np.pi * f * h * x) / (j + 1) ** 1.3 for j, h in enumerate(harm)); return w * env(d, r=r)
def pluck(f, d=1.2):  # Karplus-Strong
    n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p).astype(np.float32); o = np.zeros(n, np.float32)
    for i in range(n): o[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return o * env(d, .002, d / 2.5)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x)).astype(np.float32)
def whoosh(d=.45, up=True):
    w = bp(noise(d), 300, 3000); x = np.linspace(0, 1, len(w)); return w * np.sin(np.pi * x) ** 2 * (x if up else 1 - x + .2)
mtf = lambda m: 440 * 2 ** ((m - 69) / 12)
if style == "crayon":
    put(voice, .3, tts("Baby flamingos hatch fluffy and grey.", "af_heart", 1.05, 2.45))
    put(voice, 3.05, tts("The pink comes from their food.", "af_heart", 1.05, 1.85))
    bpm = 96; b = 60 / bpm
    chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
    for bar in range(3):
        ch = chords[bar % 4]
        for st in range(6):  # ukulele strum pattern in eighths
            t = bar * 4 * b + st * (4 * b / 6)
            for j, m in enumerate(ch): put(mus, t + j * .012, pluck(mtf(m + 12), .9), .13 if st % 3 == 0 else .07)
    mel = [(0, 76), (1.5, 79), (2, 81), (3, 79), (4, 76), (6, 74), (7, 72), (8, 74), (9.5, 76)]
    for bt, m in mel: put(mus, bt * b, tone(mtf(m + 12), .8, (1, 3.01, 5.2), .25), .07)  # music box
    # crayon scribble: stick-slip noise in rhythmic swishes while drawing
    for seg in [(.05, 2.7), (2.95, 4.95)]:
        t = seg[0]
        while t < seg[1]:
            d = rng.uniform(.09, .16); w = bp(noise(d), 1800, 7000) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) * (1 + .6 * (rng.random(int(d * SR)) > .97))
            put(fx, t, w, .05); t += d + rng.uniform(.02, .06)
    put(fx, 2.82, whoosh(.4), .22)  # page turn
    put(fx, 2.82, bp(noise(.06), 2000, 6000) * env(.06), .25)
    for t, m in [(2.0, 88), (2.1, 91)]: put(fx, t, tone(mtf(m), .5, (1, 2.76), .15), .06)  # ? sparkles
else:
    put(voice, .3, tts("An octopus has three hearts.", "am_michael", 1.06, 2.3))
    put(voice, 3.5, tts("Let's look inside.", "am_michael", 1.06, 1.3))
    bpm = 104; b = 60 / bpm
    arp = [69, 72, 76, 79, 76, 72, 74, 77]
    for i in range(int(D / (b / 2)) + 1): put(mus, i * b / 2, tone(mtf(arp[i % 8]), .5, (1, 4.0, 9.2), .09), .09)  # kalimba
    for i in range(int(D / b) + 1):
        if i % 2 == 0: put(mus, i * b, tone(55, .35, (1,), .08) * 1.0, .35)  # soft kick
        put(mus, i * b + b / 2, bp(noise(.04), 4000, 9000) * env(.04), .05)  # shaker
    for i in range(0, 12, 2): put(mus, i * b, tone(mtf(45 + [0, 0, 3, 5, 3, 0][i // 2 % 6]), b * 1.8, (1, 2), .3), .12)
    put(fx, .1, tone(330, .25, (1,), .05) * np.linspace(1, 2.2, int(.25 * SR)) ** 0, .25); put(fx, .1, whoosh(.25), .12)
    for i, m in enumerate([84, 88, 91]): put(fx, 1.0 + i * .22, tone(mtf(m), .4, (1, 2), .1), .16)  # one note per heart
    put(fx, 2.95, whoosh(.5), .2)
    put(fx, 4.3, tone(70, .4, (1, 2), .07), .5); put(fx, 4.3, bp(noise(.08), 200, 1500) * env(.08), .3)  # box lands
    put(fx, 4.6, bp(noise(.5), 600, 2400) * env(.5, .05, .15), .06); put(fx, 4.6, tone(mtf(79), .5, (1, 2.4), .12), .08)  # lid hinge
mus = mus / (np.max(np.abs(mus)) + 1e-9) * .32
duck = np.convolve((np.abs(voice) > .02).astype(np.float32), np.ones(int(.15 * SR)) / int(.15 * SR), "same")
mix = voice * .9 + mus * (1 - .55 * np.clip(duck * 3, 0, 1)) + fx
mix *= np.clip(tt / .03, 0, 1) * np.clip((D - tt) / .25, 0, 1)
mix = mix / np.max(np.abs(mix)) * .89
sf.write(out, mix, SR); print("wrote", out)
