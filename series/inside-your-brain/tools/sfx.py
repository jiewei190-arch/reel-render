# Inside Your Brain: original sound-effect library + music bed, synthesised from scratch (no samples, no licences needed).
# Usage: python3 tools/sfx.py   -> public/sfx/*.wav, public/music/*.wav
import pathlib, numpy as np, soundfile as sf
ROOT = pathlib.Path(__file__).resolve().parent.parent; SR = 44100
rng = np.random.default_rng(7)
def t(d): return np.arange(int(d * SR)) / SR
def env(x, a=.005, r=.1):
    n = len(x); e = np.ones(n); A = max(int(a * SR), 1); R = min(max(int(r * SR), 1), n)
    e[:A] = np.linspace(0, 1, A); e[-R:] *= np.linspace(1, 0, R) ** 2; return x * e
def norm(x, p=.8): return x * p / max(np.abs(x).max(), 1e-9)
def save(name, x, folder="sfx"):
    d = ROOT / "public" / folder; d.mkdir(parents=True, exist_ok=True); sf.write(d / f"{name}.wav", norm(x).astype(np.float32), SR)
def tone(f, d, shape="sine"):
    ph = 2 * np.pi * np.cumsum(np.full(int(d * SR), f) if np.isscalar(f) else f) / SR
    return np.sin(ph) if shape == "sine" else (2 * ((ph / (2 * np.pi)) % 1) - 1 if shape == "saw" else np.sign(np.sin(ph)))
def sweep(f0, f1, d, shape="sine"): return tone(np.geomspace(f0, f1, int(d * SR)), d, shape)
def noise(d): return rng.standard_normal(int(d * SR))
def lp(x, k=8): return np.convolve(x, np.ones(k) / k, "same")

save("tap", env(lp(noise(.05), 3) * np.exp(-t(.05) * 90) + .6 * tone(1800, .05) * np.exp(-t(.05) * 120), .001, .03))
pop = env(sweep(300, 900, .09) * np.exp(-t(.09) * 30), .002, .05)
spark = sum(env(tone(f, .35) * np.exp(-t(.35) * 9), .002, .2) * .35 for f in (2093, 2637, 3136))
save("like_pop", np.concatenate([pop, np.zeros(int(.02 * SR))])[:len(spark)] + spark if len(pop) > len(spark) else np.pad(pop, (0, len(spark) - len(pop))) + spark)
siren = np.concatenate([tone(np.where((t(1.6) * 2.5) % 1 < .5, 880, 660), 1.6, "saw")]); save("alarm", env(lp(siren, 4), .01, .2))
save("whoosh", env(lp(noise(.45), 6) * np.sin(np.pi * t(.45) / .45) ** 2, .01, .1))
save("boing", env(tone(220 * (1 + .35 * np.sin(2 * np.pi * 9 * t(.6)) * np.exp(-t(.6) * 4)), .6) * np.exp(-t(.6) * 5), .003, .2))
save("bonk", env(sweep(500, 120, .18, "sine") * np.exp(-t(.18) * 18) + .4 * lp(noise(.18), 2) * np.exp(-t(.18) * 60), .001, .1))
buzz = tone(170, .9, "square") * (np.sin(2 * np.pi * 2.2 * t(.9)) > -.2); save("phone_buzz", env(lp(buzz, 10), .01, .05))
save("ding", sum(env(tone(f, .8) * np.exp(-t(.8) * 5), .002, .4) * a for f, a in ((1318, 1), (1976, .5))))
save("scratch", env(lp(noise(.5), 3) * np.abs(np.sin(2 * np.pi * 7 * t(.5))) + .5 * sweep(900, 200, .5, "saw"), .005, .1))
save("slide_whistle", env(tone(np.concatenate([np.geomspace(500, 1400, int(.45 * SR)), np.geomspace(1400, 700, int(.25 * SR))]), .7), .02, .1))
save("splash", env(lp(noise(.9), 5) * np.exp(-t(.9) * 4) + .3 * sweep(300, 80, .9) * np.exp(-t(.9) * 6), .005, .3))
save("gulp", env(sweep(400, 120, .12) * np.exp(-t(.12) * 10), .005, .05))
save("stamp", env(lp(noise(.25), 2) * np.exp(-t(.25) * 30) + sweep(160, 60, .25) * np.exp(-t(.25) * 14), .001, .1))
save("sparkle", sum(np.pad(env(tone(f, .3) * np.exp(-t(.3) * 12), .002, .1), (int(i * .06 * SR), int(.6 * SR)))[:int(.6 * SR)] for i, f in enumerate((1568, 2093, 2637, 3136, 4186))))
save("dramatic_hit", env(sweep(110, 40, 1.4, "saw") * np.exp(-t(1.4) * 2.5) + lp(noise(1.4), 20) * np.exp(-t(1.4) * 6), .002, .5))

# music: bouncy comedy bed (bass + pizzicato + soft hats), 120 bpm, 16-bar loop; and a tension bed for panic
bpm = 120; beat = 60 / bpm; bars = 16; L = int(bars * 4 * beat * SR); m = np.zeros(L)
prog = [(48, 52, 55), (53, 57, 60), (55, 59, 62), (48, 52, 55)]  # C F G C
hz = lambda n: 440 * 2 ** ((n - 69) / 12)
for b in range(bars):
    ch = prog[b % 4]
    for k in range(4):
        s = int((b * 4 + k) * beat * SR)
        root = ch[0] - 12 if k % 2 == 0 else ch[2] - 12
        bass = env(tone(hz(root), beat * .9) * np.exp(-t(beat * .9) * 3), .005, .1) * .9
        m[s:s + len(bass)] += bass
        for j, off in enumerate((0, .5)):
            n = ch[(k + j) % 3] + 12; p = env(tone(hz(n), .25, "saw") * np.exp(-t(.25) * 18), .002, .1) * .18
            a = s + int(off * beat * SR); m[a:a + len(p)] += lp(p, 3)[:max(0, min(len(p), L - a))]
        h = env(np.diff(noise(.04), prepend=0) * np.exp(-t(.04) * 120), .001, .02) * .08
        a = s + int(.5 * beat * SR); m[a:a + len(h)] += h[:max(0, min(len(h), L - a))]
save("comedy_bed", m, "music")
d = 8.0; tens = sum(tone(hz(n), d, "saw") for n in (38, 39, 45)) * (.6 + .4 * np.sin(2 * np.pi * 4 * t(d)))
save("tension_bed", env(lp(tens, 30), .5, .5), "music")
print("ok", sorted(p.name for p in (ROOT / "public" / "sfx").iterdir()))
