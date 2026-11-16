#!/usr/bin/env python3
"""Render a lines.json narration with any of the voice-lineup engines, then master it to -14 LUFS / TP <= -1.

    python tts_any.py lines.json out.mp3 --engine kokoro     --voice am_puck  [--speed 1.1]
    python tts_any.py lines.json out.mp3 --engine chatterbox [--exaggeration 0.7 --cfg 0.3]
    python tts_any.py lines.json out.mp3 --engine dia        [--seed 7]        (whole script in one pass)
    shorthand:  --voice kokoro:am_puck   --voice chatterbox   --voice dia:seed=7

Common options:
    --seeds 7,11,23   seeds tried per line (chatterbox) / per script (dia); the first take whose Whisper transcript
                      matches the text word for word is kept, otherwise the take with the fewest wrong words
    --no-qa           skip the Whisper check (faster; the first seed is used)
    --beat 0.45       silence for "..." inside a line (kokoro/chatterbox render around it)
    --lead 0.15       silence before the first line;  --tail 0.3 after the last line
    --lufs -14 --tp -1.5   mastering targets (TP -1.5 leaves room for the mp3 encoder; result stays <= -1 dBTP)
    --wav             also keep the unmastered wav next to the output

lines.json:  {"lines": [{"text": "Two cities went to war... over a bucket.", "pause": 0.35}, ...],
              "pronounce": {"kokoro": {"Modena": "Mohdenna"}}}     (optional per-engine respellings)
             (a plain list of strings also works; "pause" = silence after the line in seconds, default 0.3)
Digits are spelled out for the TTS only ("1325" -> "thirteen twenty-five", "4.1" -> "four point one").
Writes out.json next to the output: engine, settings, per-line timing, seeds, Whisper transcript, render time.

Environments (all CPU):
  kokoro + chatterbox: ~/.venvs/chatterbox (Python 3.11; see whatif/voice/setup_chatterbox.sh on branch voice-test)
                       plus `pip install kokoro-onnx`. Kokoro weights are downloaded to ~/.cache/tts_any/ on first use.
  dia:                 a Python 3.12 venv with torch (CPU) and transformers>=4.56 (DiaForConditionalGeneration).
All engines: Apache-2.0 / MIT weights, built-in voices only (no cloning). See NOTES.md for licenses.
"""
import json, os, re, subprocess, sys, tempfile, time, difflib, pathlib
import numpy as np, soundfile as sf

# ---------------- CLI ----------------
args = sys.argv[1:]
def opt(name, default, cast=str):
    if name in args:
        i = args.index(name); v = cast(args[i + 1]); del args[i:i + 2]; return v
    return default
def flag(name):
    if name in args:
        args.remove(name); return True
    return False
ENGINE = opt("--engine", None)
VOICE = opt("--voice", None)
SPEED = opt("--speed", 1.0, float)
EXAG = opt("--exaggeration", 0.7, float)
CFG = opt("--cfg", 0.3, float)
TEMP = opt("--temperature", 0.8, float)
SEED = opt("--seed", None, int)
SEEDS = [int(s) for s in opt("--seeds", "7,11,23", str).split(",")]
if SEED is not None:
    SEEDS = [SEED]
BEAT = opt("--beat", 0.45, float)
LEAD = opt("--lead", 0.15, float)
TAIL = opt("--tail", 0.3, float)
LUFS = opt("--lufs", -14.0, float)
TP = opt("--tp", -1.5, float)
PROMPT_AUDIO = opt("--prompt-audio", None)   # dia only: a SYNTHETIC voice clip (never a real person) that fixes the voice
PROMPT_TEXT = opt("--prompt-text", None)     # dia only: exact transcript of --prompt-audio
DIA_TAIL = opt("--dia-tail", "")             # dia only: text appended after the script (Dia can clip its last word)
QA = not flag("--no-qa")
KEEP_WAV = flag("--wav")
if len(args) < 2:
    sys.exit(__doc__)
LINES_PATH, OUT = args[0], args[1]
if VOICE and ":" in VOICE:
    ENGINE, VOICE = VOICE.split(":", 1)
elif VOICE in ("chatterbox", "dia"):
    ENGINE, VOICE = VOICE, None
if VOICE and VOICE.startswith("seed="):
    SEEDS = [int(VOICE[5:])]; VOICE = None
ENGINE = ENGINE or "kokoro"
if ENGINE == "kokoro" and not VOICE:
    VOICE = "am_puck"

# ---------------- text ----------------
ONES = ("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen "
        "seventeen eighteen nineteen").split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def n2w(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")
    if n < 1000: return ONES[n // 100] + " hundred" + (" " + n2w(n % 100) if n % 100 else "")
    for div, name in ((10**9, "billion"), (10**6, "million"), (1000, "thousand")):
        if n >= div:
            return n2w(n // div) + " " + name + (" " + n2w(n % div) if n % div else "")
def year2w(y):
    if 2000 <= y <= 2009: return "two thousand" + (" " + ONES[y % 10] if y % 10 else "")
    hi, lo = divmod(y, 100)
    if lo == 0: return n2w(hi) + " hundred"
    return n2w(hi) + " " + ("oh-" + ONES[lo] if lo < 10 else n2w(lo))
def spell(text):
    def rep(m):
        raw = m.group(0); n = int(raw.replace(",", ""))
        if "," not in raw and len(raw) == 4 and 1100 <= n <= 2099:
            return year2w(n)
        return n2w(n)
    text = re.sub(r"(\d+)\.(\d+)", lambda m: m.group(1) + " point " + " ".join(m.group(2)), text)
    return re.sub(r"\d{1,3}(?:,\d{3})+|\d+", rep, text)
def norm_words(s):
    s = spell(s.replace("%", " percent")).lower().replace("-", " ")
    return ["won" if w == "one" else w for w in re.findall(r"[a-z']+", s)]  # Whisper writes "won" as "1"
def wrong_words(want, got):
    a, b = norm_words(want), norm_words(got)
    bad = 0
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if op != "equal":
            bad += max(i2 - i1, j2 - j1)
    return bad

data = json.load(open(LINES_PATH))
raw_lines = data["lines"] if isinstance(data, dict) else data
LINES = [(l, 0.3) if isinstance(l, str) else (l["text"], float(l.get("pause", 0.3))) for l in raw_lines]
FULL_TEXT = " ".join(t for t, _ in LINES)
PRON = (data.get("pronounce", {}) if isinstance(data, dict) else {}).get(ENGINE, {})
def tts_text(text):
    """Text sent to the engine: per-engine respellings from lines.json "pronounce", then digits spelled out."""
    for word, say in PRON.items():
        text = re.sub(rf"\b{re.escape(word)}\b", say, text)
    return spell(text)

# ---------------- ASR (QA) ----------------
_asr = None
def transcribe(wav, sr):
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel
        _asr = WhisperModel("small.en", device="cpu", compute_type="int8")
    from math import gcd
    from scipy.signal import resample_poly
    if wav.ndim > 1:
        wav = wav.mean(axis=1)
    g = gcd(int(sr), 16000)
    a = resample_poly(wav.astype(np.float32), 16000 // g, int(sr) // g).astype(np.float32)
    segs, _ = _asr.transcribe(a, beam_size=5, language="en")
    return " ".join(s.text.strip() for s in segs)

def trim(a, sr, thr=0.02, pad_in=0.03, pad_out=0.08):
    idx = np.where(np.abs(a) > thr * max(np.abs(a).max(), 1e-6))[0]
    if not len(idx): return a
    return a[max(idx[0] - int(sr * pad_in), 0): idx[-1] + int(sr * pad_out)]

# ---------------- engines ----------------
class Kokoro:
    URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
    def __init__(self):
        from kokoro_onnx import Kokoro as K
        d = pathlib.Path(os.environ.get("KOKORO_DIR", pathlib.Path.home() / ".cache/tts_any/kokoro"))
        d.mkdir(parents=True, exist_ok=True)
        for f in ("kokoro-v1.0.onnx", "voices-v1.0.bin"):
            if not (d / f).exists():
                subprocess.run(["curl", "-sSL", "-o", str(d / f), self.URL + f], check=True)
        self.k = K(str(d / "kokoro-v1.0.onnx"), str(d / "voices-v1.0.bin")); self.sr = 24000
        self.settings = {"voice": VOICE, "speed": SPEED}
    def say(self, text, seed):  # deterministic; seed unused
        s, _ = self.k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
        return s.astype(np.float32)

class Chatterbox:
    def __init__(self):
        import torch
        from chatterbox.tts import ChatterboxTTS
        self.torch = torch
        self.m = ChatterboxTTS.from_pretrained(device="cpu"); self.sr = self.m.sr
        self.settings = {"voice": "built-in default", "exaggeration": EXAG, "cfg_weight": CFG, "temperature": TEMP}
    def say(self, text, seed):
        self.torch.manual_seed(seed)
        w = self.m.generate(text, exaggeration=EXAG, cfg_weight=CFG, temperature=TEMP)
        return w.squeeze(0).numpy().astype(np.float32)

class Dia:
    ID = "nari-labs/Dia-1.6B-0626"
    def __init__(self):
        import torch
        from transformers import AutoProcessor, DiaForConditionalGeneration
        torch.set_num_threads(os.cpu_count())
        self.torch = torch
        self.proc = AutoProcessor.from_pretrained(self.ID)
        self.m = DiaForConditionalGeneration.from_pretrained(self.ID, torch_dtype=torch.float32).eval()
        self.sr = 44100
        self.settings = {"voice": "unprompted [S1] (voice set by seed)", "guidance_scale": 3.0, "temperature": 1.8,
                         "top_p": 0.90, "top_k": 45}
        self.prompt = None
        if PROMPT_AUDIO:
            import librosa
            self.prompt = librosa.load(PROMPT_AUDIO, sr=self.sr, mono=True)[0]
            self.settings["voice"] = f"audio prompt {pathlib.Path(PROMPT_AUDIO).name}: {PROMPT_TEXT!r}"
    def say(self, text, seed):
        import random
        torch = self.torch
        random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
        n_words = len(text.split())
        max_tok = int(min(3072, 86 * (n_words / 2.6 + 3)))  # ~86 audio frames per second, ~2.6 words/s + slack
        if self.prompt is not None:
            inp = self.proc(text=[f"[S1] {PROMPT_TEXT} [S1] {text}"], audio=[self.prompt], padding=True,
                            return_tensors="pt")
            plen = self.proc.get_audio_prompt_len(inp["decoder_attention_mask"])
            max_tok += int(86 * len(self.prompt) / self.sr)  # the prompt's frames count toward the budget
        else:
            inp = self.proc(text=["[S1] " + text], padding=True, return_tensors="pt"); plen = None
        with torch.inference_mode():
            out = self.m.generate(**inp, max_new_tokens=max_tok, guidance_scale=3.0, temperature=1.8,
                                  top_p=0.90, top_k=45)
        audio = (self.proc.batch_decode(out, audio_prompt_len=plen) if plen is not None
                 else self.proc.batch_decode(out))[0]
        return np.asarray(audio.squeeze().cpu().numpy() if hasattr(audio, "cpu") else audio, dtype=np.float32)

ENGINES = {"kokoro": Kokoro, "chatterbox": Chatterbox, "dia": Dia}
if ENGINE not in ENGINES:
    sys.exit(f"unknown engine {ENGINE}; choose from {list(ENGINES)}")
t_load = time.time()
eng = ENGINES[ENGINE]()
SR = eng.sr
t_load = time.time() - t_load

def best_take(text, seeds):
    """Render text with each seed until Whisper hears it word for word; return (audio, seed, heard, wrong)."""
    best = None
    for seed in seeds:
        global SYNTH_S
        ts = time.time(); a = trim(eng.say(tts_text(text), seed), SR); SYNTH_S += time.time() - ts
        if not QA:
            return a, seed, "", None
        heard = transcribe(a, SR); bad = wrong_words(re.sub(r"\([a-z ]+\)", "", text), heard)
        print(f"   seed {seed}: {'OK' if bad == 0 else f'{bad} wrong'} | {heard}", flush=True)
        if best is None or bad < best[3]:
            best = (a, seed, heard, bad)
        if bad == 0 or ENGINE == "kokoro":  # kokoro is deterministic: other seeds give the same take
            break
    return best

# ---------------- render ----------------
t0 = time.time()
SYNTH_S = 0.0  # time inside the TTS engine only (all takes, excluding Whisper QA)
sil = lambda s: np.zeros(int(SR * s), np.float32)
pieces, log, t = [sil(LEAD)], [], LEAD
if ENGINE == "dia":
    # Dia is a dialogue model: one pass over the whole script keeps one voice and natural flow.
    a, seed, heard, bad = best_take(FULL_TEXT + DIA_TAIL, SEEDS)
    if DIA_TAIL:
        # the tail only protects the last word from Dia's abrupt stop: cut right after the last scripted word
        transcribe(a[:SR], SR)  # make sure the ASR model is loaded
        from math import gcd
        from scipy.signal import resample_poly
        g = gcd(SR, 16000)
        segs, _ = _asr.transcribe(resample_poly(a, 16000 // g, SR // g).astype(np.float32), beam_size=5,
                                  language="en", word_timestamps=True)
        words = [w for sg in segs for w in sg.words]
        last = norm_words(FULL_TEXT)[-1]
        ends = [w.end for w in words if last in norm_words(w.word)]
        if ends:
            cut = min(len(a), int((ends[-1] + 0.12) * SR)); f = int(0.06 * SR)
            a = a[:cut].copy(); a[-f:] *= np.linspace(1, 0, f)
            print(f"   cut after '{last}' at {ends[-1]:.2f} s (tail {DIA_TAIL!r} removed)")
    pieces.append(a); log.append({"text": FULL_TEXT, "start": round(t, 2), "end": round(t + len(a) / SR, 2),
                                  "seed": seed, "heard": heard, "wrong_words": bad})
else:
    for i, (text, pause) in enumerate(LINES):
        parts = [p.strip() for p in text.split("...") if p.strip()]
        start = t
        for j, p in enumerate(parts):
            if j < len(parts) - 1:
                p += "..."  # keep the trailing-off intonation, then hold a beat
            print(f"[{i + 1}.{j + 1}] {p}", flush=True)
            a, seed, heard, bad = best_take(p, SEEDS)
            pieces.append(a); t += len(a) / SR
            log.append({"line": i + 1, "text": p, "start": round(t - len(a) / SR, 2), "end": round(t, 2),
                        "seed": seed, "heard": heard, "wrong_words": bad})
            if j < len(parts) - 1:
                pieces.append(sil(BEAT)); t += BEAT
        if i < len(LINES) - 1:
            pieces.append(sil(pause)); t += pause
pieces.append(sil(TAIL))
wav = np.concatenate(pieces)
n = int(0.005 * SR); wav[:n] *= np.linspace(0, 1, n); wav[-n:] *= np.linspace(1, 0, n)
render_s = time.time() - t0
dur = len(wav) / SR

# ---------------- master: HP 70 Hz, light compression, gain to LUFS, true-peak-safe limiter, 48 kHz ----------------
out = pathlib.Path(OUT); out.parent.mkdir(parents=True, exist_ok=True)
raw = out.with_suffix(".raw.wav")
sf.write(raw, wav / max(1e-6, np.abs(wav).max()) * 0.5, SR)
def ffmpeg(*a):
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *a], capture_output=True, text=True)
def measure(path):
    r = ffmpeg("-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-")
    summ = r.stderr[r.stderr.rindex("Summary:"):]
    return (float(re.search(r"I:\s+(-?[\d.]+) LUFS", summ).group(1)),
            float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ).group(1)))
codec = ["-c:a", "libmp3lame", "-b:a", "192k"] if out.suffix == ".mp3" else []
gain = LUFS - measure(raw)[0]
for _ in range(4):
    # limiter runs at 4x sample rate so inter-sample (true) peaks are caught, ceiling = TP target
    chain = (f"highpass=f=70,acompressor=threshold=0.1:ratio=2.5:attack=8:release=120:makeup=1,volume={gain:.2f}dB,"
             f"aresample=192000,alimiter=limit={10 ** (TP / 20):.4f}:attack=2:release=60:level=false,aresample=48000")
    r = ffmpeg("-y", "-i", str(raw), "-af", chain, "-ac", "1", *codec, str(out))
    if r.returncode:
        sys.exit(r.stderr)
    I, P = measure(out)
    if abs(I - LUFS) <= 0.3 and P <= -1.0:
        break
    gain += LUFS - I
if not KEEP_WAV:
    raw.unlink()
final_heard = transcribe(*sf.read(str(out), dtype="float32")) if QA else ""
report = {"engine": ENGINE, "settings": eng.settings, "seeds_tried": SEEDS, "duration_s": round(dur, 2),
          "load_s": round(t_load, 1), "render_s": round(render_s, 1),
          "synth_s": round(SYNTH_S, 1),
          "synth_s_per_10s_audio": round(SYNTH_S / dur * 10, 1), "lufs": I, "true_peak_dbtp": P,
          "final_transcript": final_heard,
          "final_wrong_words": wrong_words(FULL_TEXT, final_heard) if QA else None, "parts": log}
json.dump(report, open(out.with_suffix(".json"), "w"), indent=1)
print(json.dumps({k: v for k, v in report.items() if k != "parts"}, indent=1))
