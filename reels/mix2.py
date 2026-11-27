# Step B: vo_<name>.wav + style music + events ev_<name>.json -> mix_<name>.wav
# events: [kind, t, *args]. kinds: scribble t0 t1 | pageturn t | note t midi | pop t | whoosh t | thud t | chime t midi
#         heartbeat t n gap | bubbles t | slide t | silence t0 t1 (music dips) | sparkle t
import json, pathlib, sys, re, numpy as np, soundfile as sf
HERE = pathlib.Path(__file__).resolve().parent; SR = 24000
name = sys.argv[1]; spec = json.load(open(HERE / "specs" / f"{name}.json"))
TL = json.loads(re.sub(r"^window.TL=|;$", "", (HERE / f"tl_{name}.js").read_text().strip()))
v, _ = sf.read(HERE / f"vo_{name}.wav"); v = v.astype(np.float32)
D = TL["total"]; N = int(D * SR); v = np.pad(v, (0, max(0, N - len(v))))[:N]; tt = np.arange(N) / SR
rng = np.random.default_rng(7)
mus = np.zeros(N, np.float32); fx = np.zeros(N, np.float32)
def put(buf, at, w, g=1.):
    a = int(at * SR)
    if a >= N or a < 0: return
    w = w[:N - a]; buf[a:a + len(w)] += g * w
def env(d, a=.005, r=None): n = int(d * SR); x = np.arange(n) / SR; return np.minimum(1, x / a) * np.exp(-x / (r or d / 4))
def tone(f, d, harm=(1,), r=None):
    n = int(d * SR); x = np.arange(n) / SR; return sum(np.sin(2 * np.pi * f * h * x) / (j + 1) ** 1.3 for j, h in enumerate(harm)) * env(d, r=r)
def pluck(f, d=1.0):
    n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p).astype(np.float32); o = np.zeros(n, np.float32)
    for i in range(n): o[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return o * env(d, .002, d / 2.5)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x)).astype(np.float32)
def whoosh(d=.45): w = bp(noise(d), 300, 3000); x = np.linspace(0, 1, len(w)); return w * np.sin(np.pi * x) ** 2
mtf = lambda m: 440 * 2 ** ((m - 69) / 12)
bpm = spec.get("bpm", 100); b = 60 / bpm; bars = int(D / (4 * b)) + 1
if spec["music"] == "crayon":
    chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
    pl = {}
    def pk(m):
        if m not in pl: pl[m] = pluck(mtf(m), .9)
        return pl[m]
    melody = [(0, 76), (1.5, 79), (2, 81), (3, 79), (4, 76), (6, 74), (7, 72), (8, 74), (9.5, 76), (10, 72), (12, 69), (13, 72), (14, 71)]
    for bar in range(bars):
        ch = chords[bar % 4]
        for st in range(6):
            t = bar * 4 * b + st * (4 * b / 6)
            for j, m in enumerate(ch): put(mus, t + j * .012, pk(m + 12), .13 if st % 3 == 0 else .07)
        put(mus, bar * 4 * b, tone(mtf(ch[0] - 12), 4 * b, (1, 2), .6), .10)  # soft bassoon-ish root
        if bar % 8 in (0, 1, 2, 3):
            for bt, m in melody:
                if (bar % 4) * 4 <= bt < (bar % 4) * 4 + 4: put(mus, bar * 4 * b + (bt - (bar % 4) * 4) * b, tone(mtf(m + 12), .8, (1, 3.01, 5.2), .25), .06)
elif spec["music"] == "jazz":
    # West-coast cool jazz: vibraphone comping, walking pizzicato bass, brushes, sparse flute
    prog = [([50, 53, 57, 60], 38), ([55, 59, 62, 65], 43), ([48, 52, 55, 59], 36), ([57, 61, 64, 67], 45)]  # Dm7 G7 Cmaj7 A7
    sw = b * 2 / 3; plc = {}
    def bassn(m):
        if m not in plc: plc[m] = pluck(mtf(m), .7)
        return plc[m]
    vib = {}
    def vibn(m):
        if m not in vib:
            n = int(1.1 * SR); x = np.arange(n) / SR; w = (np.sin(2 * np.pi * mtf(m) * x) + .25 * np.sin(2 * np.pi * mtf(m) * 4 * x) * np.exp(-x * 6)) * np.exp(-x * 2.6) * (1 + .22 * np.sin(2 * np.pi * 5.2 * x)); vib[m] = w.astype(np.float32) * np.minimum(1, x / .004)
        return vib[m]
    bar_len = 4 * b; nb = int(D / bar_len) + 1
    brush = bp(noise(.22), 3500, 9500) * np.sin(np.pi * np.linspace(0, 1, int(.22 * SR))) ** 2
    for bar in range(nb):
        ch, root = prog[bar % 4]; t0 = bar * bar_len
        walk = [root, root + 7 if bar % 2 else root + 4, root + 12 - 5, root + 2 if bar % 4 == 3 else root + 5]
        for i, m in enumerate(walk): put(mus, t0 + i * b, bassn(m + 12 if m < 40 else m), .30)
        for off in (0, 1.5, 2.5):  # comping stabs
            for j, m in enumerate(ch[1:]): put(mus, t0 + off * b + j * .01, vibn(m + 12), .075)
        for i in range(4):  # brushes: swish on every beat, accent on 2 and 4, swung skip note
            put(mus, t0 + i * b, brush, .05 if i % 2 == 0 else .09)
            put(mus, t0 + i * b + sw, brush[: int(.12 * SR)], .035)
    mel = [(0, 81), (1, 84), (2.5, 86), (3.5, 84), (4, 81), (6, 79), (8, 77), (9.5, 81), (10, 84), (12, 83)]
    for bar in range(2, nb, 4):
        for bt, m in mel:
            tt0 = bar * bar_len + bt * b
            n = int(.9 * SR); x = np.arange(n) / SR; f = mtf(m + 12) * (1 + .004 * np.sin(2 * np.pi * 5 * x) * np.minimum(1, x / .25)); fl = (np.sin(2 * np.pi * np.cumsum(f) / SR) + .12 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.minimum(1, x / .06) * np.exp(-x * 2.2)
            if bt < 16: put(mus, tt0, fl.astype(np.float32), .05)
elif spec["music"] == "popup":
    # toy piano melody + pizzicato bass + woodblock ticks (music-box-ish bounce)
    chords = [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]]
    bassn = [36, 41, 43, 36]
    cache = {}
    def toy(m):
        if m not in cache: cache[m] = tone(mtf(m), .45, (1, 2.0, 3.01, 4.2), .11)
        return cache[m]
    pz = {}
    def pzk(m):
        if m not in pz: pz[m] = pluck(mtf(m), .7)
        return pz[m]
    wb = tone(1400, .05, (1, 2.3), .012); _n = bp(noise(.03), 1500, 4000) * env(.03); wb[:len(_n)] += _n
    mel = [0, 2, 4, 2, 5, 4, 2, 0]
    for bar in range(bars):
        ch = chords[bar % 4]
        put(mus, bar * 4 * b, pzk(bassn[bar % 4]), .22); put(mus, bar * 4 * b + 2 * b, pzk(bassn[bar % 4] + 7), .15)
        for i in range(8):
            t = bar * 4 * b + i * b / 2
            m = ch[mel[i] % 3] + 12 * (1 + mel[i] // 3) if bar % 2 == 0 else ch[(mel[i] + 1) % 3] + 12 * (1 + (mel[i] + 1) // 3)
            if i % 2 == 0 or bar % 4 == 3: put(mus, t, toy(m), .08)
            put(mus, t + b / 4, wb, .05 if i % 2 else .03)
else:
    arp = [69, 72, 76, 79, 76, 72, 74, 77]; bass = [45, 45, 48, 50, 48, 45, 43, 45]
    cache = {}
    def kal(m):
        if m not in cache: cache[m] = tone(mtf(m), .5, (1, 4.0, 9.2), .09)
        return cache[m]
    kick = tone(55, .35, (1,), .08); shk = bp(noise(.04), 4000, 9000) * env(.04)
    for i in range(int(D / (b / 2)) + 1):
        bar = i // 8; put(mus, i * b / 2, kal(arp[i % 8] + (2 if bar % 4 == 2 else 0)), .09)
    for i in range(int(D / b) + 1):
        if i % 2 == 0: put(mus, i * b, kick, .32)
        put(mus, i * b + b / 2, shk, .05)
    for i in range(0, int(D / b) + 1, 2): put(mus, i * b, tone(mtf(bass[(i // 2) % 8]), b * 1.8, (1, 2), .3), .12)
mus = mus / (np.max(np.abs(mus)) + 1e-9) * .30 * spec.get("music_gain", 1.0)   # optional: lower the bed so the voice clears qa.py's voice-over-bed WARN (default unchanged)
gate = np.ones(N, np.float32)
for e in json.load(open(HERE / f"ev_{name}.json")):
    k, t = e[0], e[1]; a = e[2:]
    if k == "scribble":
        x = t
        while x < a[0]:
            d = rng.uniform(.09, .16); n = int(d * SR); w = bp(noise(d), 1800, 7000) * np.sin(np.pi * np.linspace(0, 1, n)); put(fx, x, w, .045); x += d + rng.uniform(.03, .08)
    elif k == "pageturn": put(fx, t, whoosh(.4), .22); put(fx, t + .3, bp(noise(.06), 2000, 6000) * env(.06), .25)
    elif k == "note": put(fx, t, tone(mtf(a[0]), .6, (1, 2.76, 5.4), .18), .08)
    elif k == "pop": put(fx, t, tone(520, .14, (1, 2), .03) , .25); put(fx, t, bp(noise(.03), 800, 3000) * env(.03), .2)
    elif k == "whoosh": put(fx, t, whoosh(.5), .2)
    elif k == "thud": put(fx, t, tone(70, .4, (1, 2), .07), .5); put(fx, t, bp(noise(.08), 200, 1500) * env(.08), .3)
    elif k == "chime": put(fx, t, tone(mtf(a[0]), .9, (1, 2.01, 3.02), .25), .09)
    elif k == "sparkle":
        for j, m in enumerate([88, 91, 95]): put(fx, t + j * .07, tone(mtf(m), .5, (1, 2.76), .12), .05)
    elif k == "heartbeat":
        for j in range(int(a[0])): put(fx, t + j * a[1], tone(60, .18, (1,), .05), .45); put(fx, t + j * a[1] + .16, tone(55, .16, (1,), .05), .3)
    elif k == "bubbles":
        for j in range(6): f = rng.uniform(500, 1100); n = int(.08 * SR); x = np.arange(n) / SR; put(fx, t + j * rng.uniform(.06, .14), np.sin(2 * np.pi * (f + 2500 * x) * x) * env(.08, .002, .02), .08)
    elif k == "snap":
        n = int(.12 * SR); x = np.arange(n) / SR; put(fx, t, np.sin(2 * np.pi * (900 - 5000 * x) * x) * env(.12, .001, .025), .22); put(fx, t, bp(noise(.05), 1500, 7000) * env(.05, .001, .015), .30)
    elif k == "tick": put(fx, t, tone(1700, .05, (1, 2.4), .012), .18)
    elif k == "slide": n = int(.6 * SR); x = np.arange(n) / SR; put(fx, t, np.sin(2 * np.pi * np.cumsum(600 + 900 * (x / .6) ** 2) / SR) * env(.6, .02, .3), .06)
    elif k == "silence":
        a0, a1 = int(t * SR), int(a[0] * SR); r = int(.25 * SR)
        gate[a0:a1] = .12; gate[max(0, a0 - r):a0] = np.minimum(gate[max(0, a0 - r):a0], np.linspace(1, .12, a0 - max(0, a0 - r)))
        gate[a1:a1 + r] = np.minimum(gate[a1:a1 + r], np.linspace(.12, 1, len(gate[a1:a1 + r])))
duck = np.convolve((np.abs(v) > .02).astype(np.float32), np.ones(int(.2 * SR)) / int(.2 * SR), "same")
fade = np.clip(tt / .05, 0, 1) * np.clip((D - tt) / 1.2, 0, 1)
# owner (Oct 27): effects must sit under the voice. Default fx level .5 (spec "fx_gain" overrides), and effects duck a further 40% while she speaks.
FXG = spec.get("fx_gain", .5); vd = np.clip(duck * 3, 0, 1)
mix = v * .9 + mus * gate * (1 - .5 * vd) * fade + fx * FXG * (1 - .4 * vd)
mix = mix / np.max(np.abs(mix)) * .89
sf.write(HERE / f"mix_{name}.wav", mix, SR); print("mix", name, D)
