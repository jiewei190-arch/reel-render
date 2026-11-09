"""Voicemail (Sticks After Dark #5) narrator: a project-local copy of kits/sticks/tools/voice.py.
ONLY change: [WHISPER] = the narrator's own voice (am_fenrir) whisperised (spectral envelope x noise) and played
through a small phone speaker (band-pass 350-3400 Hz, compression, light hiss). Everything else is identical.
Run from whatif/aitrends-2d-studio:
  python3 ../../sticksafterdark/voicemail/tools/voice_vm.py --script ../../sticksafterdark/voicemail/script.md --project ../../sticksafterdark/voicemail/project

Original kit docstring:

  python kits/sticks/tools/voice.py --script STORY/script.md --project PROJECT [--speed 0.88]

Narrator = Kokoro am_fenrir, slow, low, close, deadpan. Reads the block under '## NARRATION' in script.md
(or the whole file if there is no such block):
  - every non-empty line that is not a header is spoken; sentences inside a line get a 0.55 s gap,
    lines get a 0.75 s gap;
  - a line that is just '##' or starts with '## ' = a LONG beat (1.3 s of silence; 1.8 s before the last line);
    '## 2.2' = a beat of exactly 2.2 s (use it before the twist line);
  - '[MOM] text', '[WHISPER] text', '[VOICE] text', '[CHILD] text', '[PHONE] text', '[MAN] text' = character lines.
Writes PROJECT/input/voiceover.wav, PROJECT/input/script.txt (spoken words only) and
PROJECT/timeline/words.json + sentences.json (word times estimated from syllables inside each exactly-known
sentence chunk; refine with tools/transcribe.py if you like).
"""
import argparse, json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.abspath(os.path.join(HERE, "..", "..", "..", "whatif", "aitrends-2d-studio"))
TTS = os.environ.get("KOKORO_DIR", os.path.abspath(os.path.join(HERE, "..", "..", "..", "tts")))
SR = 24000

ap = argparse.ArgumentParser()
ap.add_argument("--script", required=True); ap.add_argument("--project", required=True)
ap.add_argument("--speed", type=float, default=0.88); ap.add_argument("--voice", default="am_fenrir")
ap.add_argument("--beat", type=float, default=1.3); ap.add_argument("--last-beat", type=float, default=1.8)
ap.add_argument("--tail", type=float, default=1.6, help="silence after the last line")
ap.add_argument("--whisper-db", type=float, default=-3.5, help="[WHISPER] speech level relative to the narrator (active-frame RMS, dB)")
a = ap.parse_args()

k = Kokoro(os.path.join(TTS, "kokoro-v1.0.onnx"), os.path.join(TTS, "voices-v1.0.bin"))
rng = np.random.default_rng(7)

def fx(y, af):
    with tempfile.TemporaryDirectory() as d:
        i, o = os.path.join(d, "i.wav"), os.path.join(d, "o.wav")
        sf.write(i, y, SR); subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", i, "-af", af, o], check=True)
        return sf.read(o, dtype="float32")[0]

CHAR = {  # voice, speed, ffmpeg filter
    "MOM": ("af_heart", 0.8, "lowpass=f=1800,aecho=0.8:0.6:35:0.3,volume=1.5"),
    "WHISPER": ("af_nicole", 0.85, f"asetrate={SR}*0.9,aresample={SR},atempo=1/0.9,highpass=f=200,volume=1.8"),
    "VOICE": ("af_nicole", 0.85, f"asetrate={SR}*0.9,aresample={SR},atempo=1/0.9,highpass=f=200,volume=1.8"),
    "CHILD": ("af_nicole", 0.9, f"asetrate={SR}*1.26,aresample={SR},atempo=1/1.26,highpass=f=300,volume=1.5"),
    "MAN": ("am_onyx", 0.78, f"asetrate={SR}*0.84,aresample={SR},atempo=1/0.84,aecho=0.8:0.5:60:0.25,volume=1.3"),
    "PHONE": ("am_michael", 1.0, "highpass=f=300,lowpass=f=3400,acompressor=threshold=-18dB:ratio=5,volume=1.4"),
}

def trim(y, thr=0.006):
    idx = np.where(np.abs(y) > thr)[0]
    if not len(idx): return y
    return y[max(0, idx[0] - int(SR * 0.02)): idx[-1] + int(SR * 0.06)]

def whisperise(y, n_fft=1024, hop=256, smooth=11, voiced=0.12):
    """keep the spectral envelope of the voice, replace the excitation with noise -> a breathy whisper"""
    win = np.hanning(n_fft).astype(np.float32); pad = np.concatenate([np.zeros(n_fft), y, np.zeros(n_fft)]).astype(np.float32)
    nfr = 1 + (len(pad) - n_fft) // hop; out = np.zeros(len(pad), np.float32); wsum = np.zeros(len(pad), np.float32)
    ker = np.ones(smooth) / smooth; nz = rng.normal(0, 1, len(pad)).astype(np.float32)
    for i in range(nfr):
        a0 = i * hop; fr = pad[a0:a0 + n_fft] * win; X = np.fft.rfft(fr); mag = np.abs(X)
        env = np.sqrt(np.convolve(mag ** 2, ker, mode="same"))
        N = np.fft.rfft(nz[a0:a0 + n_fft] * win); N = N / (np.abs(N) + 1e-9)
        Y = env * N * (1 + 0.6 * np.linspace(0, 1, len(env)))   # whispers are brighter
        out[a0:a0 + n_fft] += np.fft.irfft(Y, n_fft).astype(np.float32) * win; wsum[a0:a0 + n_fft] += win ** 2
    out = (out / np.maximum(wsum, 1e-3))[n_fft:n_fft + len(y)]
    out = out / (np.abs(out).max() + 1e-9); y2 = y / (np.abs(y).max() + 1e-9)
    return (out * (1 - voiced) + y2 * voiced).astype(np.float32)

def speak(text, who=None):
    if who == "WHISPER":   # the narrator's own voice, whispered, through a phone speaker
        y, _ = k.create(text, voice=a.voice, speed=0.8, lang="en-us"); y = trim(y.astype(np.float32))
        y = fx(y, f"asetrate={SR}*0.95,aresample={SR},atempo=1/0.95")
        y = whisperise(y)
        y = fx(y, "highpass=f=350,lowpass=f=3400,acompressor=threshold=-20dB:ratio=4:attack=3:release=80,aecho=0.6:0.3:12:0.2,volume=1.6")
        return (y + rng.normal(0, 1, len(y)).astype(np.float32) * 0.006).astype(np.float32)
    if who:
        v, sp, af = CHAR[who]
        y, _ = k.create(text, voice=v, speed=sp, lang="en-us"); y = fx(trim(y.astype(np.float32)), af)
        if who == "PHONE": y = y + rng.normal(0, 1, len(y)).astype(np.float32) * 0.012
        return y
    y, _ = k.create(text, voice=a.voice, speed=a.speed, lang="en-us")
    y = trim(y.astype(np.float32))
    # lower + closer: drop ~1 semitone, warm low-pass, tiny compression (deadpan, close to the mic)
    return fx(y, f"asetrate={SR}*0.95,aresample={SR},atempo=1/0.95,lowpass=f=7000,acompressor=threshold=-22dB:ratio=3:attack=5:release=120")

# ---- parse
src = open(a.script, encoding="utf-8").read()
m = re.search(r"^##\s*NARRATION\s*$(.*?)(?=^#\s|\Z)", src, flags=re.M | re.S)
body = m.group(1) if m else src
items = []  # ("beat",) or ("line", text, who)
for raw in body.splitlines():
    line = raw.strip().strip("`")
    if not line: continue
    if line == "##" or line.startswith("## "):
        num = re.match(r"^##\s*([\d.]+)\s*s?$", line); items.append(("beat", float(num.group(1)) if num else None)); continue
    if line.startswith("#") or line.startswith(">") or line.startswith("("): continue
    tag = re.match(r"^\[([A-Z]+)\]\s*(.*)", line)
    items.append(("line", tag.group(2), tag.group(1)) if tag and tag.group(1) in CHAR else ("line", line, None))
while items and items[0][0] == "beat": items.pop(0)
last_line = max(i for i, it in enumerate(items) if it[0] == "line")

# ---- synth
pieces, words, spoken, t = [], [], [], 0.45
wspans, nspans = [], []
pieces.append(np.zeros(int(SR * t), np.float32))
def add(y):
    global t
    pieces.append(y.astype(np.float32)); t += len(y) / SR
def sil(s): add(np.zeros(int(SR * s), np.float32))
def syl(w):
    w = re.sub(r"[^a-z]", "", w.lower()); return max(1, len(re.findall(r"[aeiouy]+", w))) + (0.5 if re.search(r"[,.?!]$", w) else 0)

for i, it in enumerate(items):
    if it[0] == "beat":
        b = it[1] if it[1] else (a.last_beat if i + 1 == last_line else a.beat)
        sil(max(0, b - 0.75))  # the 0.75 s line gap is already in
        continue
    _, text, who = it; spoken.append(text)
    sents = [text] if who else [s for s in re.split(r"(?<=[.!?])\s+", text) if s]
    for j, s in enumerate(sents):
        y = speak(s, who); st = t; add(y); en = t
        (wspans if who == "WHISPER" else nspans).append((int(st * SR), int(en * SR)))
        toks = s.split(); wts = np.array([syl(w) for w in toks], float); edges = st + np.concatenate([[0], np.cumsum(wts)]) / wts.sum() * (en - st)
        for w, s0, s1 in zip(toks, edges[:-1], edges[1:]): words.append({"word": w, "start": round(float(s0), 3), "end": round(float(s1), 3)})
        if j < len(sents) - 1: sil(0.55)
    sil(0.75)
sil(max(0, a.tail - 0.75))

y = np.concatenate(pieces)
def active_db(spans, thr=-40):
    fr = []
    for a0, a1 in spans:
        seg = y[a0:a1]; seg = seg[: len(seg) // 480 * 480].reshape(-1, 480); fr.append(np.sqrt((seg ** 2).mean(1)))
    r = np.concatenate(fr) if fr else np.zeros(1); top = r.max() + 1e-9; r = r[r > top * 10 ** (thr / 20)]
    return 20 * np.log10(np.sqrt((r ** 2).mean()) + 1e-12)
if wspans and nspans:   # set the whisper to a fixed level under the narrator (clear on phone speakers)
    gain = 10 ** ((active_db(nspans) + a.whisper_db - active_db(wspans)) / 20)
    for a0, a1 in wspans: y[a0:a1] *= gain
    print(f"whisper level: {active_db(wspans) - active_db(nspans):+.1f} dB vs narrator (gain x{gain:.2f})")
y = y / (np.abs(y).max() + 1e-9) * 0.89
P = a.project
os.makedirs(os.path.join(P, "input"), exist_ok=True); os.makedirs(os.path.join(P, "timeline"), exist_ok=True)
sf.write(os.path.join(P, "input", "voiceover.wav"), y, SR)
open(os.path.join(P, "input", "script.txt"), "w", encoding="utf-8").write("\n".join(spoken) + "\n")
sys.path.insert(0, os.path.join(STUDIO, "tools"))
from common import sentences_from_words, write_timeline
write_timeline(os.path.join(P, "timeline"), words, sentences_from_words(words), "kokoro-chunks+syllables")
print(f"voiceover: {len(y)/SR:.2f} s, {len(words)} words")
for s in sentences_from_words(words): print(f"  {s['start']:6.2f}-{s['end']:6.2f}  {s['text']}")
