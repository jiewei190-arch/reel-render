"""kits/cozy/tools/cozy_audio.py — no-voice soundtrack for the Cozy kit: generated lo-fi bed + synthesized cooking ASMR.

  python3 kits/cozy/tools/cozy_audio.py --project <project>            # mix + mux (needs build/video_silent.mp4 for the mux)
  python3 kits/cozy/tools/cozy_audio.py --sfx sizzle --out test.wav    # audition one sound
  python3 kits/cozy/tools/cozy_audio.py --list

Everything is synthesized here (royalty-free, no samples, no voice). Reads story/shots.json:
  shot "sfx":  [{"at": 0.3, "name": "crack", "gain": -4, "dur": 0.5, "seed": 2}]   at = seconds from shot start
  top  "beds": [{"start": 14, "end": 36, "name": "sizzle", "gain": -10, "seed": 1}]  looped bed with 0.3 s fades
  top  "lofi": {"bpm": 76, "seed": 4, "gainDb": -9, "sections": [{"start":0,"end":5,"level":0.6,"drums":false}, ...]}
Master: 30 Hz high-pass, soft clip, two-pass loudnorm to config.loudness (default -14 LUFS), true peak -1.5 dBTP.
Outputs build/mix.wav and out/<title>.mp4 (copies the video stream).
"""
import argparse, json, os, re, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "audio"))
from dsp import SR, secs, t_axis, rng, db, noise, lp, hp, bp, sine, stereo, as_stereo, reverb, fade, normalize, place, write_wav, midi_hz

LIB = {}
def snd(fn): LIB[fn.__name__] = fn; return fn
def env(n, a=0.005, tau=0.1):
    t = t_axis(n); e = np.exp(-t / tau); k = secs(a)
    if k: e[:k] *= np.linspace(0, 1, k)
    return e.astype(np.float32)
def sweep(f0, f1, n, curve=1.0):
    f = f0 + (f1 - f0) * np.linspace(0, 1, n) ** curve; return np.sin(2 * np.pi * np.cumsum(f) / SR).astype(np.float32)
def impulses(n, rate, seed, tau=0.004, lo=2500, hi=9000, amp=(0.3, 1.0)):
    """Poisson clicks (crackle / grains)."""
    r = rng(seed); x = np.zeros(n, np.float32); k = int(rate * n / SR)
    pos = r.integers(0, n, k); amps = r.uniform(*amp, k) * np.where(r.random(k) < 0.5, -1, 1)
    np.add.at(x, pos, amps); ker = np.exp(-np.arange(secs(tau * 6)) / secs(tau)).astype(np.float32)
    x = np.convolve(x, ker)[:n] * noise(n, seed + 1) * 0.6 + np.convolve(x, ker)[:n] * 0.4
    return bp(x, lo, hi)

# ------------------------------------------------------------------ ASMR / cute sounds
@snd
def sizzle(dur=4.0, seed=1, **_):
    n = secs(dur); r = rng(seed)
    hiss = bp(noise(n, seed), 3500, 11000) * 0.18
    crack = impulses(n, 900, seed + 2, 0.0025, 3000, 12000) * 1.4 + impulses(n, 120, seed + 3, 0.006, 1200, 5000) * 0.8
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * 0.37 * t_axis(n) + r.random() * 6)
    return stereo((hiss + crack) * swell.astype(np.float32), 0, 0.8, seed)
@snd
def growl(dur=1.0, seed=2, **_):
    n = secs(dur); t = t_axis(n); f = 70 + 25 * np.sin(2 * np.pi * 2.2 * t)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 19 * t)) + lp(noise(n, seed), 300) * 1.5
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7
    return stereo(lp(body * e, 500).astype(np.float32))
@snd
def pop(dur=0.2, seed=3, pitch=1.0, **_):
    n = secs(dur); return stereo(sweep(450 * pitch, 1300 * pitch, n, 0.6) * env(n, 0.002, 0.05))
@snd
def bloop(dur=0.3, seed=4, pitch=1.0, **_):
    n = secs(dur); return stereo(sweep(950 * pitch, 380 * pitch, n, 0.7) * env(n, 0.003, 0.08))
@snd
def tiptoe(dur=0.12, seed=5, **_):
    n = secs(dur); x = bp(noise(n, seed), 600, 2600) * env(n, 0.001, 0.012) * 0.8 + sine(140, n) * env(n, 0.001, 0.02) * 0.6
    return stereo(x.astype(np.float32), rng(seed).uniform(-0.3, 0.3))
@snd
def fridge(dur=2.5, seed=6, **_):
    n = secs(dur); t = t_axis(n)
    suck = lp(noise(n, seed), 900) * env(n, 0.01, 0.09) * 1.2 + sine(110, n) * env(n, 0.002, 0.06)
    hum = (sine(60, n) * 0.5 + sine(120, n) * 0.35 + sine(180, n) * 0.1) * np.clip(t / 0.4, 0, 1) * 0.25
    rattle = impulses(n, 25, seed, 0.003, 2000, 6000) * np.exp(-t / 0.25) * 0.6
    return reverb(stereo((suck + hum + rattle).astype(np.float32)), 0.6, 0.15, seed)
@snd
def click(dur=0.15, seed=7, **_):
    n = secs(dur); x = np.zeros(n, np.float32); m = secs(0.05)
    x[:m] += bp(noise(m, seed), 2500, 7000) * env(m, 0.0005, 0.004); x[m:2 * m] += bp(noise(m, seed + 1), 2000, 6000) * env(m, 0.0005, 0.005) * 0.7
    return stereo(x)
@snd
def plop(dur=0.25, seed=8, pitch=1.0, **_):
    n = secs(dur); x = sweep(420 * pitch, 160 * pitch, n, 0.5) * env(n, 0.002, 0.04) + lp(noise(n, seed), 1500) * env(n, 0.001, 0.015) * 0.5
    return stereo(x.astype(np.float32), rng(seed).uniform(-0.25, 0.25))
@snd
def butter(dur=1.2, seed=9, **_):
    n = secs(dur); x = as_stereo(plop(dur, seed, 0.7)) * 0.8; s = sizzle(dur, seed + 4) * np.clip(t_axis(n) / 0.15, 0, 1)[:, None] * 0.8
    return (x + s).astype(np.float32)
@snd
def rice(dur=1.0, seed=10, **_):
    n = secs(dur); t = t_axis(n); dens = np.clip(1 - t / dur, 0, 1) ** 0.5
    g = impulses(n, 1400, seed, 0.0015, 1800, 7000) * dens.astype(np.float32) * 1.6
    thud = lp(noise(n, seed + 5), 400) * env(n, 0.005, 0.08)
    return stereo((g + thud).astype(np.float32), 0, 0.6, seed)
@snd
def crack(dur=0.5, seed=11, **_):
    n = secs(dur); x = np.zeros(n, np.float32)
    for k, (tt, a) in enumerate([(0.0, 1.0), (0.035, 0.6), (0.08, 0.35)]):
        m = secs(0.04); s = secs(tt); x[s:s + m] += bp(noise(m, seed + k), 1500, 8000) * env(m, 0.0003, 0.006) * a
    x += impulses(n, 200, seed + 9, 0.002, 2500, 8000) * np.exp(-t_axis(n) / 0.08) * 0.6
    return stereo(x)
@snd
def eggdrop(dur=1.0, seed=12, **_):
    n = secs(dur); x = as_stereo(plop(0.3, seed, 0.6)); y = sizzle(dur, seed + 3) * np.clip((t_axis(n) - 0.05) / 0.1, 0, 1)[:, None] * 1.1
    out = y.copy(); out[:len(x)] += x; return out
@snd
def stir(dur=1.2, seed=13, strokes=2, **_):
    n = secs(dur); t = t_axis(n); e = np.abs(np.sin(np.pi * strokes * t / dur)) ** 1.5
    x = bp(noise(n, seed), 700, 3200) * e * 0.8 + impulses(n, 500, seed + 1, 0.002, 2000, 7000) * e * 0.8
    return stereo(x.astype(np.float32), 0, 0.5, seed)
@snd
def chop(dur=0.2, seed=14, **_):
    n = secs(dur); x = sweep(200, 70, n, 0.4) * env(n, 0.001, 0.03) * 0.9 + bp(noise(n, seed), 2500, 8000) * env(n, 0.0005, 0.006) * 0.8
    return stereo(x.astype(np.float32))
@snd
def pour(dur=1.2, seed=15, **_):
    n = secs(dur); t = t_axis(n); x = noise(n, seed); out = np.zeros(n, np.float32); blk = secs(0.02); r = rng(seed)
    for i in range(0, n, blk):
        c = 500 + 900 * r.random(); out[i:i + blk] = bp(x[i:i + blk + 400], c * 0.8, c * 1.25)[:len(out[i:i + blk])]
    e = np.clip(t / 0.08, 0, 1) * np.clip((dur - t) / 0.15, 0, 1)
    return stereo((out * e * 1.6 + impulses(n, 80, seed, 0.004, 400, 1500) * e).astype(np.float32))
@snd
def sprinkle(dur=0.9, seed=16, **_):
    n = secs(dur); e = np.sin(np.pi * np.linspace(0, 1, n)); return stereo((impulses(n, 220, seed, 0.0012, 5000, 12000) * e * 1.4).astype(np.float32), 0, 0.9, seed)
@snd
def ding(dur=1.6, seed=17, pitch=1.0, **_):
    n = secs(dur); t = t_axis(n); f = 1318 * pitch
    x = sum(sine(f * r, n) * a * np.exp(-t / d) for r, a, d in [(1, 1, 0.7), (2.0, 0.3, 0.35), (3.0, 0.12, 0.2)])
    return normalize(reverb(stereo(x.astype(np.float32)), 1.6, 0.3, seed), -6)
@snd
def chime(dur=1.6, seed=18, **_):
    n = secs(dur); out = np.zeros(n, np.float32)
    for i, m in enumerate([84, 88, 91, 96]):
        s = secs(i * 0.07); k = n - s; out[s:] += sine(midi_hz(m), k) * np.exp(-t_axis(k) / 0.5) * 0.4
    return normalize(reverb(stereo(out), 1.8, 0.35, seed), -8)
@snd
def munch(dur=1.6, seed=19, rate=4.0, **_):
    n = secs(dur); out = np.zeros(n, np.float32); r = rng(seed)
    for k in range(int(dur * rate)):
        s = secs(k / rate + r.uniform(0, 0.03)); m = min(secs(0.12), n - s)
        if m <= 0: break
        out[s:s + m] += (lp(noise(m, seed + k), 1800) * 0.7 + impulses(m, 400, seed + k, 0.002, 1500, 5000)) * env(m, 0.004, 0.035)
    return stereo(out)
@snd
def slurp(dur=0.7, seed=20, **_):
    n = secs(dur); t = t_axis(n); x = noise(n, seed); out = np.zeros(n, np.float32); blk = secs(0.015)
    for i in range(0, n, blk):
        c = 500 + 1800 * (i / n) ** 0.8; out[i:i + blk] = bp(x[i:i + blk + 300], c * 0.85, c * 1.2)[:len(out[i:i + blk])]
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * 26 * t); e = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6
    return stereo((out * trem * e * 2.2).astype(np.float32))
@snd
def gulp(dur=0.25, seed=21, **_):
    n = secs(dur); return stereo((sweep(260, 120, n, 0.6) * env(n, 0.01, 0.06)).astype(np.float32))
@snd
def sigh(dur=1.3, seed=22, **_):
    """a soft breath (filtered noise, no voice)"""
    n = secs(dur); e = np.sin(np.pi * np.linspace(0, 1, n) ** 0.6) ** 1.5
    return stereo((bp(noise(n, seed, "pink"), 350, 1600) * e * 0.9).astype(np.float32))
@snd
def snore(dur=2.4, seed=23, **_):
    n = secs(dur); t = t_axis(n); e = np.clip(np.sin(2 * np.pi * t / dur), 0, 1) ** 1.2
    x = lp(noise(n, seed, "pink"), 700) * (0.7 + 0.3 * np.sin(2 * np.pi * 32 * t)) * e
    return stereo(x.astype(np.float32))
@snd
def uhoh(dur=1.2, seed=24, **_):
    """two soft pizzicato notes: 'uh-oh'"""
    n = secs(dur); out = np.zeros(n, np.float32)
    for tt, m in [(0.0, 62), (0.28, 57)]:
        s = secs(tt); k = n - s; f = midi_hz(m); tk = t_axis(k)
        out[s:] += (sine(f, k) + 0.4 * sine(2 * f, k) + 0.15 * sine(3 * f, k)) * np.exp(-tk / 0.22) * np.clip(tk / 0.004, 0, 1)
    return normalize(reverb(stereo(out * 0.5), 1.2, 0.2, seed), -6)
@snd
def stretch(dur=1.2, seed=25, **_):
    n = secs(dur); t = t_axis(n); f = 300 + 220 * (t / dur) + 15 * np.sin(2 * np.pi * 7 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + bp(noise(n, seed), 800, 2500) * 0.5
    e = np.sin(np.pi * np.linspace(0, 1, n)); return stereo((lp(x * e, 3000)).astype(np.float32))
@snd
def clink(dur=0.6, seed=26, **_):
    n = secs(dur); t = t_axis(n); x = sum(sine(f, n) * a * np.exp(-t / d) for f, a, d in [(2650, 1, 0.12), (4120, 0.5, 0.08), (6900, 0.3, 0.05)])
    return stereo(x.astype(np.float32) * 0.6)
@snd
def scoop(dur=0.6, seed=27, **_):
    n = secs(dur); x = as_stereo(stir(0.35, seed, 1)); out = np.zeros((n, 2), np.float32); out[:len(x)] += x * 0.8; place(out, as_stereo(plop(0.25, seed, 0.8)), secs(0.3), 0.9); return out
@snd
def whoosh(dur=0.5, seed=28, **_):
    n = secs(dur); t = t_axis(n); x = noise(n, seed); out = np.zeros(n, np.float32); blk = secs(0.01)
    for i in range(0, n, blk):
        c = 400 + 2500 * np.sin(np.pi * i / n); out[i:i + blk] = bp(x[i:i + blk + 300], c * 0.7, c * 1.4)[:len(out[i:i + blk])]
    return stereo((out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * 0.8).astype(np.float32), 0, 0.6)
@snd
def tap(dur=0.15, seed=29, **_):
    n = secs(dur); return stereo((sine(220, n) * env(n, 0.001, 0.03) + bp(noise(n, seed), 1500, 5000) * env(n, 0.0005, 0.005) * 0.6).astype(np.float32))

def make(name, dur=None, seed=None, **kw):
    fn = LIB[name]; a = {}
    if dur is not None: a["dur"] = dur
    if seed is not None: a["seed"] = seed
    a.update({k: v for k, v in kw.items() if v is not None})
    return as_stereo(fn(**a)).astype(np.float32)

# ------------------------------------------------------------------ lo-fi bed
CHORDS = [[58, 62, 65, 69], [57, 60, 64, 67], [55, 58, 62, 65], [60, 64, 67, 70]]   # Bbmaj7, Am7, Gm7, C7 (key of F)
BASS = [46, 45, 43, 48]
def epiano(m, n, vel=0.5):
    f = midi_hz(m); t = t_axis(n)
    x = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.4) + 0.08 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / 0.15))
    x *= np.exp(-t / 1.6) * np.clip(t / 0.008, 0, 1) * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * t))
    return (x * vel).astype(np.float32)
def lofi(total, plan):
    bpm = plan.get("bpm", 76); seed = plan.get("seed", 4); beat = 60 / bpm; bar = beat * 4; r = rng(seed)
    n = secs(total + 2); keys = np.zeros(n, np.float32); bass = np.zeros(n, np.float32); drums = np.zeros(n, np.float32); mel = np.zeros(n, np.float32)
    secs_ = plan.get("sections", [{"start": 0, "end": total, "level": 1, "drums": True}])
    def sec_at(t):
        for s in secs_:
            if s["start"] <= t < s["end"]: return s
        return secs_[-1]
    swing = beat * 0.5 * 0.16
    nb = int(np.ceil(total / bar)) + 1
    PENTA = [65, 67, 69, 72, 74, 77, 79]
    for b in range(nb):
        t0 = b * bar; ch = CHORDS[b % 4]
        for i, m in enumerate(ch): place(keys, epiano(m, secs(bar * 1.1), 0.22), secs(t0 + i * 0.012))
        place(keys, epiano(ch[2] + 12, secs(beat * 1.5), 0.08), secs(t0 + beat * 2.5 + swing))
        place(bass, (sine(midi_hz(BASS[b % 4]), secs(beat * 1.8)) * np.exp(-t_axis(secs(beat * 1.8)) / 0.6)).astype(np.float32) * 0.5, secs(t0))
        place(bass, (sine(midi_hz(BASS[b % 4] + 7), secs(beat * 0.9)) * np.exp(-t_axis(secs(beat * 0.9)) / 0.3)).astype(np.float32) * 0.35, secs(t0 + beat * 2.5 + swing))
        s = sec_at(t0)
        if s.get("melody", True) and b % 2 == 1:
            for k in range(3):
                m = PENTA[int(r.integers(0, len(PENTA)))]; tt = t0 + beat * (0.5 + k * 1.0) + (swing if k % 2 else 0)
                place(mel, epiano(m + 12, secs(beat * 1.2), 0.07), secs(tt))
        for k in range(8):   # drums
            tt = t0 + k * beat / 2 + (swing if k % 2 else 0); ss = sec_at(tt)
            if not ss.get("drums", True): continue
            if k in (0, 5): m = secs(0.3); place(drums, (sine(55, m) * np.exp(-t_axis(m) / 0.09) + sweep(120, 50, m) * np.exp(-t_axis(m) / 0.03) * 0.5).astype(np.float32) * 0.8, secs(tt))
            if k in (2, 6): m = secs(0.25); place(drums, (lp(bp(noise(m, b * 8 + k), 900, 5000), 3500) * np.exp(-t_axis(m) / 0.05) * 0.55).astype(np.float32), secs(tt))
            m = secs(0.05); place(drums, (hp(noise(m, b * 31 + k), 6000) * np.exp(-t_axis(m) / 0.012) * (0.16 if k % 2 else 0.22)).astype(np.float32), secs(tt))
    lvl = np.zeros(n, np.float32)
    for s in secs_:
        a, b2 = secs(s["start"]), min(n, secs(s["end"])); lvl[a:b2] = s.get("level", 1)
    k = secs(0.6); lvl = np.convolve(lvl, np.ones(k) / k, mode="same").astype(np.float32)
    music = lp(keys + mel, 3800) * 1.0 + lp(bass, 400) * 1.1 + lp(drums, 7000) * 0.9
    music = music * (1 + 0.004 * np.sin(2 * np.pi * 0.5 * t_axis(n)))
    crackle = impulses(n, 14, seed + 50, 0.0015, 1500, 7000) * 0.35 + bp(noise(n, seed + 51), 2000, 8000) * 0.012
    out = reverb(stereo(music * lvl, 0, 0.4, seed), 1.8, 0.18, seed) + stereo(crackle * np.maximum(lvl, 0.3), 0, 0.9, seed)
    f = secs(plan.get("fadeOut", 2.0)); e = secs(total); out[e - f:e] *= np.linspace(1, 0, f)[:, None]; out[e:] = 0
    return out[:secs(total)].astype(np.float32)

# ------------------------------------------------------------------ mix
def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--project"); ap.add_argument("--sfx"); ap.add_argument("--out"); ap.add_argument("--list", action="store_true"); ap.add_argument("--video")
    a = ap.parse_args()
    if a.list: print("\n".join(sorted(LIB))); return
    if a.sfx: write_wav(a.out or f"{a.sfx}.wav", normalize(make(a.sfx), -3)); return
    P = a.project; cfg = json.load(open(os.path.join(P, "config.json"))); story = json.load(open(os.path.join(P, "story", "shots.json")))
    total = story.get("duration") or story["shots"][-1]["end"]; n = secs(total); os.makedirs(os.path.join(P, "build"), exist_ok=True)
    plan = story.get("lofi", {}); music = lofi(total, plan); music = normalize(music, -1) * db(plan.get("gainDb", -9))
    fx = np.zeros((n, 2), np.float32); cues = 0
    for s in story["shots"]:
        for c in s.get("sfx", []) or []:
            x = make(c["name"], c.get("dur"), c.get("seed"), **{k: c[k] for k in ("pitch",) if k in c}); x = normalize(x, -1)
            place(fx, x, secs(s["start"] + c.get("at", 0)), db(c.get("gain", -6))); cues += 1
    for b in story.get("beds", []) or []:
        ln = b["end"] - b["start"]; x = normalize(make(b["name"], ln, b.get("seed", 1)), -1); f = secs(b.get("fade", 0.3))
        x[:f] *= np.linspace(0, 1, f)[:, None]; x[-f:] *= np.linspace(1, 0, f)[:, None]; place(fx, x, secs(b["start"]), db(b.get("gain", -10))); cues += 1
    mix = music + fx; mix = hp(mix, 30)
    pk = np.abs(mix).max()
    if pk > 0.95: mix = (np.tanh(mix / pk * 1.3) / np.tanh(1.3) * 0.95).astype(np.float32)
    raw = os.path.join(P, "build", "mix_raw.wav"); write_wav(raw, mix)
    lufs = cfg.get("loudness", -14); out_wav = os.path.join(P, "build", "mix.wav")
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
    af = f"loudnorm=I={lufs}:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", af, "-ar", str(SR), out_wav], check=True)
    print(f"sfx cues/beds: {cues}; wrote {out_wav} ({total:.1f}s, target {lufs} LUFS)")
    video = a.video or os.path.join(P, "build", "video_silent.mp4")
    if os.path.exists(video):
        safe = re.sub(r"[^\w\- ]+", "", cfg.get("title") or "video").strip().replace(" ", "_")
        out = a.out or os.path.join(P, "out", f"{safe}.mp4"); os.makedirs(os.path.dirname(out), exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", video, "-i", out_wav, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], check=True)
        print(f"FINAL VIDEO: {out}")

if __name__ == "__main__":
    main()
