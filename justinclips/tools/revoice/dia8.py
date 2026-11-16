#!/usr/bin/env python3
"""dia8.py: voice a Justin clips Short with voice #8 (Dia-1.6B-0626, Kokoro am_puck prompt, seed 7).

    ~/.venvs/dia/bin/python dia8.py render <short dir> [--seed 7] [--reuse] # Dia take + per-line files in <short>/project/build/dia8/
    ~/.venvs/dia/bin/python dia8.py join   <short dir> <out.wav>         # per-line files -> one narration wav (lines.json pacing)

render
  1. Writes a tts_any.py lines file from project/lines.json (each line's "tts" respelling if present, plus the
     optional lines.json "pronounce" dict, e.g. {"dia": {"1630s": "sixteen-thirties"}}; captions keep "text").
  2. Runs tts_any.py (origin/justinclips/voice-lineup, justinclips/voice_lineup/) with the exact #8 settings:
     --engine dia --seed 7 --prompt-audio prompts/dia_prompt_kokoro_am_puck.wav --prompt-text "..." --dia-tail " (laughs)"
     (cfg 3.0, temp 1.8, top-p 0.9, top-k 45 are fixed inside tts_any.py). Dia reads the whole script in ONE pass,
     so the voice and delivery stay one take. tts_any.py cuts the "(laughs)" tail after the last scripted word.
  3. Whisper small.en word timings (audio passed as a numpy array) -> splits the take at every line break and every
     "..." into 01.wav, 02.wav, 04a.wav, 04b.wav ... (cut at the quietest 10 ms between the two words).
  4. QA report (dia8.json): Whisper transcript vs script (wrong words), median pitch (pyin; reference #8 = ~205 Hz,
     accept 180-230), take length, any "(laughs)" left (heard after the last word = fail).
join
  The same joiner as voice.py's "files" engine: trims each part, lead + parts + beat at "..." + gap between lines.
  Pacing from lines.json "pacing" {"gap", "lead", "beat", "breaks"} (defaults 0.2 / 0.05 / 0.4 / none). Writes 48 kHz mono.
  "breaks" adds a pause after a word inside a line (no change to the words); re-run render after changing breaks.

Env: VOICE_LINEUP = folder with tts_any.py + prompts/ (default: /home/user/vl/justinclips/voice_lineup, an export of that branch folder).
"""
import difflib, json, os, re, subprocess, sys
import numpy as np, soundfile as sf

PROMPT_TEXT = ("Okay, so you're not gonna believe this one, but it's totally true. I looked it up like three times, "
               "because I honestly thought it was a joke.")
VL = os.environ.get("VOICE_LINEUP", "/home/user/vl/justinclips/voice_lineup")
if not os.path.exists(os.path.join(VL, "tts_any.py")):
    VL = os.path.expanduser("~/vl/justinclips/voice_lineup")


def project_of(short):
    p = os.path.abspath(short)
    return p if os.path.exists(os.path.join(p, "lines.json")) else os.path.join(p, "project")


def parts_of(lines, breaks=()):
    """[(line_no, suffix, text, pause_after)] : a line with '...' becomes parts a, b, ... (pause_after None = the
    lines.json beat); pacing "breaks" [{"line": 6, "after": "Vultures.", "s": 0.4}] add a pause after a word
    (same split, pause_after = s). A line with one part has no suffix."""
    out = []
    for i, ln in enumerate(lines, 1):
        ps = [[p.strip(), None] for p in ln.split("...") if p.strip()]
        for b in breaks:
            if int(b["line"]) != i: continue
            for k, (p, _) in enumerate(ps):
                j = p.find(b["after"] + " ")
                if j >= 0:
                    ps[k:k + 1] = [[p[:j + len(b["after"])], float(b["s"])], [p[j + len(b["after"]):].strip(), ps[k][1]]]
                    break
            else:
                sys.exit(f"pacing break: '{b['after']}' not found in line {i}")
        for k, (p, pa) in enumerate(ps):
            out.append((i, "abcdef"[k] if len(ps) > 1 else "", p, pa))
    return out


# ---- the same number spelling / normalising tts_any.py uses ----
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
    s = re.sub(r"\b(\d+)s\b", r"\1", s)
    ws = re.findall(r"[a-z']+", s)
    out = []
    for w in ws:
        w = {"one": "won", "thirties": "thirty", "thirtys": "thirty"}.get(w, w)
        out.append(w.replace("'", ""))
    return out


_asr = None
def asr():
    global _asr
    if _asr is None:
        from faster_whisper import WhisperModel
        _asr = WhisperModel("small.en", device="cpu", compute_type="int8")
    return _asr


def to16k(a, sr):
    from math import gcd
    from scipy.signal import resample_poly
    g = gcd(int(sr), 16000)
    return resample_poly(a.astype(np.float32), 16000 // g, int(sr) // g).astype(np.float32)


def words_of(a, sr):
    segs, _ = asr().transcribe(to16k(a, sr), beam_size=5, language="en", word_timestamps=True)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]


def median_pitch(a, sr):
    import librosa
    y = librosa.resample(a.astype(np.float32), orig_sr=sr, target_sr=16000)
    f0, vf, _ = librosa.pyin(y, fmin=70, fmax=400, sr=16000, frame_length=1024)
    f = f0[vf & ~np.isnan(f0)]
    return float(np.median(f)) if len(f) else 0.0


def render(short, seed, reuse=False):
    proj = project_of(short); L = json.load(open(os.path.join(proj, "lines.json"), encoding="utf-8"))
    lines = [ln["text"] for ln in L["lines"]]
    tts = [ln.get("tts", ln["text"]) for ln in L["lines"]]
    pron = L.get("pronounce", {})
    pron = pron.get("dia", pron) if isinstance(pron, dict) else {}
    out = os.path.join(proj, "build", "dia8"); os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if re.fullmatch(r"\d\d[a-f]?\.wav", f): os.remove(os.path.join(out, f))
    lj = os.path.join(out, "tts_lines.json")
    json.dump({"lines": [{"text": t, "pause": 0.3} for t in tts], "pronounce": {"dia": pron}}, open(lj, "w"), indent=1)
    take = os.path.join(out, f"take_seed{seed}.wav")
    cmd = [sys.executable, "tts_any.py", lj, take, "--engine", "dia", "--seed", str(seed),
           "--prompt-audio", "prompts/dia_prompt_kokoro_am_puck.wav", "--prompt-text", PROMPT_TEXT, "--dia-tail", " (laughs)"]
    if reuse and os.path.exists(take):
        print("reusing", take, flush=True)   # --reuse: re-split an existing take (e.g. after editing pacing breaks)
    else:
        print("$", " ".join(cmd), flush=True)
        subprocess.run(cmd, cwd=VL, check=True)
    a, sr = sf.read(take, dtype="float32")
    if a.ndim > 1: a = a.mean(axis=1)
    W = words_of(a, sr)
    heard = " ".join(w for w, _, _ in W)
    # align script norm-words (per part) to Whisper norm-words
    P = parts_of(lines, L.get("pacing", {}).get("breaks", []))
    sw, spart = [], []
    for k, (_, _, t, _) in enumerate(P):
        for w in norm_words(t): sw.append(w); spart.append(k)
    hw, hidx = [], []
    for j, (w, _, _) in enumerate(W):
        for x in norm_words(w): hw.append(x); hidx.append(j)
    m = {}
    sm = difflib.SequenceMatcher(a=sw, b=hw, autojunk=False)
    wrong = 0
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for d in range(i2 - i1): m[i1 + d] = hidx[j1 + d]
        else:
            wrong += max(i2 - i1, j2 - j1)
            if op == "replace" and i2 - i1 == j2 - j1:
                for d in range(i2 - i1): m[i1 + d] = hidx[j1 + d]
    # boundaries between parts
    env = np.abs(a); hop = int(sr * 0.01)
    rms = np.sqrt(np.convolve(a ** 2, np.ones(hop) / hop, mode="same"))
    cuts = [0]
    for k in range(1, len(P)):
        last = max(i for i, p in enumerate(spart) if p == k - 1); first = min(i for i, p in enumerate(spart) if p == k)
        lw = next((m[i] for i in range(last, -1, -1) if i in m), None); fw = next((m[i] for i in range(first, len(sw)) if i in m), None)
        if lw is None or fw is None or fw <= lw:
            sys.exit(f"cannot place the cut before part {P[k]}: alignment failed (heard: {heard})")
        e, s = W[lw][2], W[fw][1]
        lo = int(max(W[lw][1] + 0.6 * (e - W[lw][1]), e - 0.06) * sr); hi = int(min(s + 0.06, s + 0.4 * (W[fw][2] - s)) * sr)
        if hi <= lo: lo, hi = int(min(e, s) * sr) - hop, int(max(e, s) * sr) + hop
        # cut in the LAST quiet run before the next word: an earlier quiet run can be a stop closure inside the
        # previous word (e.g. the /dZ/ of "cartilage"), whose release would then leak into the next clip
        thr = 0.12 * np.percentile(rms, 90); fr = rms[lo:hi:hop] < thr
        runs, k0 = [], None
        for q, quiet in enumerate(list(fr) + [False]):
            if quiet and k0 is None: k0 = q
            if not quiet and k0 is not None: runs.append((k0, q)); k0 = None
        c = lo + ((runs[-1][0] + runs[-1][1]) // 2) * hop if runs else lo + int(np.argmin(rms[lo:hi]))
        cuts.append(c)
    cuts.append(len(a))
    files = []
    for k, (n, suf, t, _) in enumerate(P):
        f = os.path.join(out, f"{n:02d}{suf}.wav"); sf.write(f, a[cuts[k]:cuts[k + 1]], sr); files.append(os.path.basename(f))
    # QA
    rep = json.load(open(take[:-4] + ".json"))
    pitch = median_pitch(a, sr)
    tail_words = [w for w, s, e in W if s > (W[m[max(m)]][2] if m else 1e9)]
    qa = {"engine": "dia (voice #8)", "model": "nari-labs/Dia-1.6B-0626", "seed": seed, "settings": rep["settings"],
          "take": os.path.basename(take), "take_s": round(len(a) / sr, 2), "lufs": rep["lufs"], "true_peak_dbtp": rep["true_peak_dbtp"],
          "median_pitch_hz": round(pitch, 1), "pitch_ok": 180 <= pitch <= 230,
          "whisper": heard, "wrong_words": wrong, "words_after_script_end": tail_words,
          "laughs_left": bool(re.search(r"laugh|\bha\b|haha", " ".join(tail_words).lower())),
          "files": files, "synth_s": rep.get("synth_s")}
    json.dump(qa, open(os.path.join(out, "dia8.json"), "w"), indent=1)
    print(json.dumps(qa, indent=1))
    return qa


def join(short, wav):
    proj = project_of(short); L = json.load(open(os.path.join(proj, "lines.json"), encoding="utf-8"))
    pace = {"gap": 0.2, "lead": 0.05, "beat": 0.4, **L.get("pacing", {})}
    d = os.path.join(proj, "build", "dia8"); SR = 48000
    def load(f):
        p = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True)
        x = np.frombuffer(p.stdout, np.float32).copy()
        idx = np.where(np.abs(x) > 0.02 * max(np.abs(x).max(), 1e-6))[0]
        return x[max(idx[0] - int(SR * .04), 0): idx[-1] + int(SR * .12)] if len(idx) else x
    pieces = [np.zeros(int(SR * pace["lead"]), np.float32)]
    lines = [ln["text"] for ln in L["lines"]]
    P = parts_of(lines, pace.get("breaks", []))
    for k, (n, suf, _, pa) in enumerate(P):
        x = load(os.path.join(d, f"{n:02d}{suf}.wav")); f = int(SR * 0.008)
        x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        pieces.append(x)
        if k + 1 < len(P):
            gap = pa if pa is not None else (pace["beat"] if P[k + 1][0] == n else pace["gap"])
            pieces.append(np.zeros(int(SR * gap), np.float32))
    y = np.concatenate(pieces); y = y / np.abs(y).max() * 0.89
    sf.write(wav, y, SR)
    print(f"joined {len(P)} parts -> {wav} ({len(y) / SR:.2f} s; pacing {pace})")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == "render":
        seed = int(a[a.index("--seed") + 1]) if "--seed" in a else 7
        render(a[1], seed, reuse="--reuse" in a)
    elif len(a) == 3 and a[0] == "join":
        join(a[1], a[2])
    else:
        sys.exit(__doc__)
