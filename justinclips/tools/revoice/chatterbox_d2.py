"""Narrate a What If script.md with the owner-picked "D2" voice: Chatterbox (Resemble AI, MIT), built-in default
voice (no cloning), exaggeration 0.3, cfg 0.3. Drop-in for fenrir.py: same input format, same CLI, same outputs.

Spoken text = numbered lines only; '## ' headers (sections, rule cards) add a section break.
Usage: python chatterbox_d2.py script.md out.wav [plain.txt] [--gap 0.55] [--comma 0.25] [--section 1.4] [--lead 0.3]
                               [--beat 0.7] [--seeds 7,11,23] [--no-qa]
Shorts use shortened gaps, e.g. --gap 0.3 --comma 0.15 --lead 0.15 (defaults = the locked long-form pacing).
Run with the Chatterbox venv (see setup_chatterbox.sh):  ~/.venvs/chatterbox/bin/python chatterbox_d2.py ...

Differences from fenrir.py (all automatic):
- "..." inside a line = a held beat (--beat s) before the punchline: the line is rendered in parts around it.
- Years / numbers are spelled out for the TTS only ("2007" -> "two thousand seven"); plain.txt keeps the script's digits.
- QA: each part is rendered with up to 3 seeds; the first take whose Whisper (small.en) transcript matches the text word
  for word is kept. If no seed matches, the take with the fewest wrong words is kept and flagged "QA FAIL".
- Writes out.lines.json next to out.wav: per line start/end (s), text, tts text, chosen seed per part, QA result.
  Re-running with the same script reproduces the same takes (seeds are fixed per part).
- --comma has no effect: Chatterbox phrases commas itself (kept so fenrir.py command lines still work).
"""
import json, re, sys, time, difflib
args = [a for a in sys.argv[1:]]
def opt(name, default, cast=float):
    if name in args:
        i = args.index(name); v = cast(args[i + 1]); del args[i:i + 2]; return v
    return default
def flag(name):
    if name in args:
        args.remove(name); return True
    return False
GAP, COMMA, SECTION, LEAD = opt("--gap", 0.55), opt("--comma", 0.25), opt("--section", 1.4), opt("--lead", 0.3)
BEAT = opt("--beat", 0.7)
SEEDS = [int(s) for s in opt("--seeds", "7,11,23", str).split(",")]
QA = not flag("--no-qa")
EXAG, CFG = 0.3, 0.3
if len(args) < 2:
    sys.exit(__doc__)
SCRIPT, OUT = args[0], args[1]
PLAIN = args[2] if len(args) > 2 else None

import numpy as np, soundfile as sf, torch
torch.set_num_threads(max(1, torch.get_num_threads()))

# ---------- numbers -> words (TTS text only) ----------
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
        raw = m.group(0)
        n = int(raw.replace(",", ""))
        if "," not in raw and len(raw) == 4 and 1100 <= n <= 2099:
            return year2w(n)
        return n2w(n)
    text = re.sub(r"(\d+)\.(\d+)", lambda m: m.group(1) + " point " + " ".join(m.group(2)), text)
    return re.sub(r"\d{1,3}(?:,\d{3})+|\d+", rep, text)
def tts_text(text):
    t = text.replace("**", "")
    t = re.sub(r"\b([A-Z]{2,})\b", lambda m: m.group(1).lower(), t)  # OUTSIDE -> outside (no spelling out)
    return spell(t)

# ---------- QA ----------
def norm_words(s):
    s = spell(s.replace("%", " percent"))
    s = s.lower().replace("-", " ")
    s = re.sub(r"\ba (hundred|thousand|million|billion)\b", r"one \1", s)
    return re.findall(r"[a-z']+", s)
def mismatches(want, got):
    a, b = norm_words(want), norm_words(got)
    bad = 0
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if op != "equal":
            bad += max(i2 - i1, j2 - j1)
    return bad

# ---------- models ----------
from chatterbox.tts import ChatterboxTTS
tts = ChatterboxTTS.from_pretrained(device="cpu")
SR = tts.sr
asr = None
if QA:
    from faster_whisper import WhisperModel
    asr = WhisperModel("small.en", device="cpu", compute_type="int8")

def trim(a, thr=0.02, pad_in=0.04, pad_out=0.12):
    idx = np.where(np.abs(a) > thr * max(np.abs(a).max(), 1e-6))[0]
    if not len(idx): return a
    return a[max(idx[0] - int(SR * pad_in), 0): idx[-1] + int(SR * pad_out)]

def render(text):
    """Return (audio, seed, transcript, wrong_words) for the first seed that passes QA (or the best one)."""
    best = None
    for seed in SEEDS:
        torch.manual_seed(seed)
        wav = tts.generate(text, exaggeration=EXAG, cfg_weight=CFG).squeeze(0).numpy().astype(np.float32)
        wav = trim(wav)
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

# ---------- script ----------
pieces, spoken, lines = [], [], []
def sil(s): pieces.append(np.zeros(int(SR * max(s, 0)), np.float32))
def now(): return sum(len(p) for p in pieces) / SR

t0 = time.time()
sil(LEAD)
for raw in open(SCRIPT, encoding="utf-8"):
    line = raw.strip()
    if line.startswith("## ") and len(pieces) > 1:
        sil(SECTION - GAP)  # topped up to the section break on top of the last line gap
        continue
    m = re.match(r"^\d+[a-z]?\.\s+(.*)", line)
    if not m:
        continue
    text = m.group(1).replace("**", "")
    spoken.append(text)
    # split at "..." (held beat before the punchline); keep the dots on the left part for intonation
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
    sil(GAP)

y = np.concatenate(pieces)
y = y / np.abs(y).max() * 0.89
sf.write(OUT, y, SR)
if PLAIN:
    open(PLAIN, "w").write("\n".join(spoken) + "\n")
fails = [r["n"] for r in lines for p in r["parts"] if p["qa"] == "QA FAIL"]
meta = {"voice": "chatterbox default (built-in, no cloning)", "exaggeration": EXAG, "cfg_weight": CFG,
        "seeds_tried": SEEDS, "gap": GAP, "section": SECTION, "lead": LEAD, "beat": BEAT, "sr": SR,
        "duration": round(len(y) / SR, 3), "render_s": round(time.time() - t0, 1), "qa_fail_lines": fails, "lines": lines}
json.dump(meta, open(re.sub(r"\.wav$", "", OUT) + ".lines.json", "w"), indent=1)
import os
if os.path.exists(OUT + ".qa_tmp.wav"):
    os.remove(OUT + ".qa_tmp.wav")
print(f"{len(y)/SR:.2f} s, {sum(len(s.split()) for s in spoken)} words, render {time.time()-t0:.0f} s"
      + (f"  QA FAIL on lines {fails}" if fails else ("  QA ok" if QA else "")))
