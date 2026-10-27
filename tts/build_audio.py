import json, re, sys, pathlib
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "candy"
SR = 24000
VOICE = sys.argv[1] if len(sys.argv) > 1 else "am_michael"
SPEED = 1.0

# (planned start, planned end, spoken text, [(caption word, weight_text, highlight)])
CHUNKS = [
 (0.30, 4.00, "Americans will spend four point one billion on Halloween candy.",
  [("Americans","Americans",0),("will","will",0),("spend","spend",0),("$4.1","four point one",1),("billion","billion",1),("on","on",0),("Halloween","Halloween",0),("candy.","candy",0)]),
 (4.30, 5.90, "That's not an accident.",
  [("That's","That's",0),("not","not",0),("an","an",0),("accident.","accident",1)]),
 (6.20, 9.60, "Food scientists chase something called the bliss point.",
  [("Food","Food",0),("scientists","scientists",0),("chase","chase",0),("something","something",0),("called","called",0),("the","the",0),("bliss","bliss",1),("point.","point",1)]),
 (10.00, 13.00, "The exact amount of sugar that tastes best.",
  [("The","The",0),("exact","exact",0),("amount","amount",0),("of","of",0),("sugar","sugar",1),("that","that",0),("tastes","tastes",0),("best.","best",1)]),
 (13.50, 15.10, "Too little? Boring.",
  [("Too","Too",0),("little?","little",0),("Boring.","Boring",1)]),
 (15.25, 16.80, "Too much? Sickly.",
  [("Too","Too",0),("much?","much",0),("Sickly.","Sickly",1)]),
 (16.95, 19.70, "Right in the middle? You keep reaching.",
  [("Right","Right",0),("in","in",0),("the","the",0),("middle?","middle",1),("You","You",0),("keep","keep",0),("reaching.","reaching",1)]),
 (20.20, 24.90, "Blend sugar with fat and salt, and it's tuned to be hard to put down.",
  [("Blend","Blend",0),("sugar","sugar",1),("with","with",0),("fat","fat",1),("and","and",0),("salt,","salt",1),("and","and",0),("it's","it's",0),("tuned","tuned",0),("to","to",0),("be","be",0),("hard","hard",1),("to","to",0),("put","put",0),("down.","down",1)]),
 (25.60, 27.90, "So tonight, count your wrappers.",
  [("So","So",0),("tonight,","tonight",0),("count","count",0),("your","your",0),("wrappers.","wrappers",1)]),
 (28.40, 29.80, "Follow for more.",
  [("Follow","Follow",0),("for","for",0),("more.","more",1)]),
]
TOTAL = 30.6

def syl(w):
    w = re.sub(r"[^a-z]", "", w.lower())
    return max(1, len(re.findall(r"[aeiouy]+", w)))

k = Kokoro(str(HERE / "kokoro-v1.0.onnx"), str(HERE / "voices-v1.0.bin"))
timeline = np.zeros(int(TOTAL * SR), dtype=np.float32)
words = []
report = []
for (ps, pe, text, caps) in CHUNKS:
    s, _ = k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    s = s.astype(np.float32)
    # trim leading/trailing silence
    thr = 0.01
    idx = np.where(np.abs(s) > thr)[0]
    s = s[idx[0]:idx[-1] + 1]
    dur = len(s) / SR
    win = pe - ps
    if dur > win:  # speed up to fit
        f = min(1.35, dur / win)
        import subprocess, tempfile, os
        tmp = HERE / "tmp_in.wav"; tmp2 = HERE / "tmp_out.wav"
        sf.write(tmp, s, SR)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-filter:a", f"atempo={f}", str(tmp2)], check=True)
        s, _ = sf.read(tmp2, dtype="float32")
        dur = len(s) / SR
    # fade edges
    n = int(0.008 * SR); s[:n] *= np.linspace(0, 1, n); s[-n:] *= np.linspace(1, 0, n)
    a = int(ps * SR)
    timeline[a:a + len(s)] += s[: len(timeline) - a]
    # caption timing within the chunk proportional to syllables
    wts = [sum(syl(x) for x in c[1].split()) for c in caps]
    tot = sum(wts); acc = 0
    for c, w in zip(caps, wts):
        words.append([c[0], round(ps + dur * acc / tot - 0.04, 3), c[2]]) if False else words.append([c[0], round(max(0, ps + dur * acc / tot - 0.03), 3), c[2]])
        acc += w
    report.append((text, round(ps, 2), round(dur, 2), round(win, 2)))

# normalise voice
peak = np.max(np.abs(timeline)); timeline *= 0.9 / peak
sf.write(OUT / "voice.wav", timeline, SR)

# --- music bed + whooshes ---
t = np.arange(len(timeline)) / SR
def tone(f, a): return a * np.sin(2 * np.pi * f * t)
pad = tone(110, .5) + tone(164.8, .35) + tone(220, .3) + tone(277.2, .18)  # Am-ish drone
pad *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * t)  # slow swell
pad *= np.clip(t / 1.5, 0, 1) * np.clip((TOTAL - t) / 1.5, 0, 1)
pad = pad / np.max(np.abs(pad)) * 0.05
rng = np.random.default_rng(3)
def whoosh(at, d=0.45):
    n = int(d * SR); x = rng.standard_normal(n).astype(np.float32)
    # one-pole lowpass whose cutoff sweeps up
    y = np.zeros(n, np.float32); prev = 0
    for i in range(n):
        a = 0.02 + 0.5 * (i / n); prev += a * (x[i] - prev); y[i] = prev
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return at, (y * env / (np.max(np.abs(y * env)) + 1e-9) * 0.12).astype(np.float32)
bed = pad.astype(np.float32)
for at in [4.15, 6.15, 9.85, 19.75, 25.25, 28.3]:
    a, w = whoosh(at); i = int(a * SR); bed[i:i + len(w)] += w[: len(bed) - i]
# little pop on the counter finish and bliss-point reveal
def pop(at, f=880):
    n = int(0.12 * SR); tt = np.arange(n) / SR
    w = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 28) * 0.12
    i = int(at * SR); bed[i:i + n] += w.astype(np.float32)
pop(1.6, 988); pop(17.9, 1318); pop(22.0, 659)
mix = timeline + bed
mix *= 0.95 / np.max(np.abs(mix))
sf.write(OUT / "narration_mix.wav", mix, SR)

js = "window.WORDS=" + json.dumps(words) + ";"
(OUT / "words.js").write_text(js)
for r in report: print(r)
print("words:", len(words))
