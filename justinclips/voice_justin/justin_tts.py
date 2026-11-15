"""Justin clips narrator: Chatterbox (Resemble AI, MIT) cloned from the channel owner's own voice note.

USE ONLY FOR JUSTIN CLIPS. The owner consented to this clone for Justin clips narration only (see README.md in this
folder). Never use it for another channel, person or purpose. Every description that uses it must say
"Voice is synthetic."

Same input format and pacing logic as whatif/voice/chatterbox_d2.py (origin/voice-test), plus:
- the voice reference is ref_clean.wav (Chatterbox audio_prompt_path), the cleaned 15 s clip of the owner;
- exaggeration / cfg are flags (default = the pick in samples/NOTES.md);
- the output is mastered to -14 LUFS integrated, true peak <= -1 dBTP (two-pass ffmpeg loudnorm, 48 kHz mono),
  and an .mp3 is written next to it with --mp3.

Spoken text = numbered lines only ("1. ..."); '## ' headers add a section break.
Usage:
  ~/.venvs/chatterbox/bin/python justinclips/voice_justin/justin_tts.py script.md out.wav [plain.txt]
      [--exag 0.5] [--cfg 0.4] [--temp 0.8] [--gap 0.3] [--section 0.9] [--lead 0.15] [--beat 0.5]
      [--seeds 7,11,23] [--ref path/to/ref.wav] [--lufs -14] [--tp -1.0] [--mp3] [--no-qa]
Setup: bash whatif/voice/setup_chatterbox.sh (from origin/voice-test) -> ~/.venvs/chatterbox.

QA: each line (or each part around a "...") is rendered with up to 3 seeds; the first take whose Whisper small.en
transcript matches word for word is kept, otherwise the take with the fewest wrong words is kept and flagged
"QA FAIL". Writes out.lines.json (per-line timing, seed, transcript, QA) next to out.wav.
"""
import json, os, re, subprocess, sys, time, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
def opt(name, default, cast=float):
    if name in args:
        i = args.index(name); v = cast(args[i + 1]); del args[i:i + 2]; return v
    return default
def flag(name):
    if name in args:
        args.remove(name); return True
    return False

# Chosen settings (see samples/NOTES.md). Change only after the owner listens.
EXAG = opt("--exag", 0.5)
CFG = opt("--cfg", 0.4)
TEMP = opt("--temp", 0.8)
GAP, SECTION, LEAD, BEAT = opt("--gap", 0.3), opt("--section", 0.9), opt("--lead", 0.15), opt("--beat", 0.5)
SEEDS = [int(s) for s in opt("--seeds", "7,11,23", str).split(",")]
REF = opt("--ref", os.path.join(HERE, "ref_clean.wav"), str)
LUFS, TP = opt("--lufs", -14.0), opt("--tp", -1.0)
MP3 = flag("--mp3")
QA = not flag("--no-qa")
if len(args) < 2:
    sys.exit(__doc__)
SCRIPT, OUT = args[0], args[1]
PLAIN = args[2] if len(args) > 2 else None
if not os.path.exists(REF):
    sys.exit(f"reference not found: {REF}")

import numpy as np, soundfile as sf, torch

# ---------- text (same rules as chatterbox_d2.py) ----------
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
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
def tts_text(text):
    t = text.replace("**", "")
    t = re.sub(r"\b([A-Z]{2,})\b", lambda m: m.group(1).lower(), t)  # CASES -> cases (not spelled out)
    return spell(t)
def norm_words(s):
    s = spell(s.replace("%", " percent")).lower().replace("-", " ")
    s = re.sub(r"\ba (hundred|thousand|million|billion)\b", r"one \1", s)
    return re.findall(r"[a-z']+", s)
def mismatches(want, got):
    a, b = norm_words(want), norm_words(got); bad = 0
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if op != "equal":
            bad += max(i2 - i1, j2 - j1)
    return bad

# ---------- models ----------
from chatterbox.tts import ChatterboxTTS
tts = ChatterboxTTS.from_pretrained(device="cpu")
SR = tts.sr
tts.prepare_conditionals(REF, exaggeration=EXAG)  # voice = the owner's reference clip
asr = None
if QA:
    from faster_whisper import WhisperModel
    asr = WhisperModel("small.en", device="cpu", compute_type="int8")

def trim(a, thr=0.02, pad_in=0.04, pad_out=0.12):
    idx = np.where(np.abs(a) > thr * max(np.abs(a).max(), 1e-6))[0]
    if not len(idx): return a
    return a[max(idx[0] - int(SR * pad_in), 0): idx[-1] + int(SR * pad_out)]

def render(text):
    best = None
    for seed in SEEDS:
        torch.manual_seed(seed)
        wav = tts.generate(text, exaggeration=EXAG, cfg_weight=CFG, temperature=TEMP)
        wav = trim(wav.squeeze(0).numpy().astype(np.float32))
        if not QA:
            return wav, seed, "", 0
        sf.write(OUT + ".qa_tmp.wav", wav, SR)
        segs, _ = asr.transcribe(OUT + ".qa_tmp.wav", beam_size=5, language="en")
        heard = " ".join(s.text.strip() for s in segs)
        bad = mismatches(text, heard)
        print(f"    seed {seed}: {'OK ' if bad == 0 else f'{bad} wrong'} | {heard}", flush=True)
        if best is None or bad < best[3]:
            best = (wav, seed, heard, bad)
        if bad == 0:
            break
    return best

# ---------- mastering: two-pass loudnorm to LUFS / TP ----------
def master(src, dst):
    af = f"loudnorm=I={LUFS}:TP={TP}:LRA=11"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", src, "-af", af + ":print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
    af2 = (af + f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
           f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-af", af2,
                    "-ar", "48000", "-ac", "1", dst], check=True)

# ---------- script ----------
pieces, spoken, lines = [], [], []
def sil(s): pieces.append(np.zeros(int(SR * max(s, 0)), np.float32))
def now(): return sum(len(p) for p in pieces) / SR

t0 = time.time()
sil(LEAD)
for raw in open(SCRIPT, encoding="utf-8"):
    line = raw.strip()
    if line.startswith("## ") and len(pieces) > 1:
        sil(SECTION - GAP); continue
    m = re.match(r"^\d+[a-z]?\.\s+(.*)", line)
    if not m:
        continue
    text = m.group(1).replace("**", "")
    spoken.append(text)
    parts = [p.strip() for p in re.split(r"(?<=\.\.\.)\s+|(?<=…)\s+", text) if p.strip()]
    rec = {"n": len(spoken), "text": text, "start": None, "parts": []}
    print(f"[{len(spoken)}] {text}", flush=True)
    for k, part in enumerate(parts):
        tt = tts_text(part)
        wav, seed, heard, bad = render(tt)
        if rec["start"] is None:
            rec["start"] = round(now(), 3)
        pieces.append(wav)
        rec["parts"].append({"tts": tt, "seed": seed, "heard": heard, "wrong_words": bad,
                             "qa": "skipped" if not QA else ("ok" if bad == 0 else "QA FAIL")})
        if k < len(parts) - 1:
            sil(BEAT)
    rec["end"] = round(now(), 3)
    lines.append(rec)
    sil(GAP + (0.12 if text.endswith("?") else 0))

y = np.concatenate(pieces)
raw_path = OUT + ".raw.wav"
sf.write(raw_path, y / max(np.abs(y).max(), 1e-6) * 0.89, SR)
master(raw_path, OUT)
os.remove(raw_path)
if MP3:
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", OUT, "-c:a", "libmp3lame",
                    "-b:a", "192k", re.sub(r"\.wav$", "", OUT) + ".mp3"], check=True)
if PLAIN:
    open(PLAIN, "w").write("\n".join(spoken) + "\n")
fails = [r["n"] for r in lines for p in r["parts"] if p["qa"] == "QA FAIL"]
meta = {"voice": "chatterbox, cloned from the Justin clips owner's voice note (Justin clips only)",
        "reference": os.path.relpath(REF, HERE), "exaggeration": EXAG, "cfg_weight": CFG, "temperature": TEMP,
        "seeds_tried": SEEDS, "gap": GAP, "section": SECTION, "lead": LEAD, "beat": BEAT,
        "master": {"lufs": LUFS, "true_peak": TP, "sr": 48000},
        "duration": round(len(y) / SR, 3), "render_s": round(time.time() - t0, 1), "qa_fail_lines": fails,
        "lines": lines}
json.dump(meta, open(re.sub(r"\.wav$", "", OUT) + ".lines.json", "w"), indent=1)
if os.path.exists(OUT + ".qa_tmp.wav"):
    os.remove(OUT + ".qa_tmp.wav")
print(f"{len(y)/SR:.2f} s, render {time.time()-t0:.0f} s" + (f"  QA FAIL on lines {fails}" if fails else ("  QA ok" if QA else "")))
