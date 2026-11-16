#!/usr/bin/env python3
"""dia8.py: voice a Justin clips Short with the owner's chosen voice #8 (Dia-1.6B-0626, Kokoro-am_puck prompt, seed 7).

Runs voice_lineup/tts_any.py (origin/justinclips/voice-lineup) with the exact #8 settings over the Short's
project/lines.json, then writes what either re-render tool needs:

  python dia8.py --project <short>/project --wav <out.wav> [--seed 7]                 # build_short.py --voice-cmd
  python dia8.py --project <short>/project --split-dir <dir> [--seed 7]               # rebuild.sh --engine files --dir <dir>

--wav        the narration, mastered by tts_any (-14 LUFS, TP <= -1), 48 kHz mono wav.
--split-dir  one file per line (01.wav, 02.wav, ...), cut between lines at the midpoint of the silence, found from
             Whisper (small.en) word timings. rebuild.sh / voice.py then join them with the pacing in lines.json.
Respellings: lines.json "pronounce": {"dia": {"Wojtek": "Voytek"}} (only the TTS hears them; captions keep the script).
Settings (NOTES.md "How to use the winner", reports/08_dia_puckprompt-seed7.json): --engine dia --seed 7,
  --prompt-audio prompts/dia_prompt_kokoro_am_puck.wav, the prompt text below, --dia-tail " (laughs)",
  cfg 3.0, temp 1.8, top-p 0.9, top-k 45 (hard-coded in tts_any.py's Dia engine).
Env: DIA_PY (default ~/.venvs/dia/bin/python), VOICE_LINEUP (default <repo>/justinclips/voice_lineup).
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
VL = os.environ.get("VOICE_LINEUP", os.path.join(REPO, "justinclips", "voice_lineup"))
DIA_PY = os.environ.get("DIA_PY", os.path.expanduser("~/.venvs/dia/bin/python"))
PROMPT_TEXT = ("Okay, so you're not gonna believe this one, but it's totally true. "
               "I looked it up like three times, because I honestly thought it was a joke.")

ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True)
ap.add_argument("--wav")
ap.add_argument("--split-dir")
ap.add_argument("--seed", type=int, default=int(os.environ.get("DIA_SEED", 7)))
ap.add_argument("--gap", type=float, help="min silence between lines (default lines.json pacing.gap, else 0 = Dia's own)")
ap.add_argument("--beat", type=float, help="min silence at \"...\" (default lines.json pacing.beat, else 0)")
ap.add_argument("--keep", help="folder: also keep the tts_any master (dia8_master.wav) + report (dia8_report.json) here")
ap.add_argument("--reuse", help="folder written by an earlier --keep: skip Dia and re-pace / re-split that take")
a = ap.parse_args()
L = json.load(open(os.path.join(a.project, "lines.json"), encoding="utf-8"))
lines = [l["text"] for l in L["lines"]]
tmp = tempfile.mkdtemp(prefix="dia8_")
spec = {"title": L.get("title", ""), "lines": [{"text": t, "pause": 0.3} for t in lines],
        "pronounce": {"dia": L.get("pronounce", {}).get("dia", {})}}
json.dump(spec, open(os.path.join(tmp, "lines.json"), "w"), indent=1)
master = os.path.join(tmp, "dia8.wav")
cmd = [DIA_PY, os.path.join(VL, "tts_any.py"), os.path.join(tmp, "lines.json"), master, "--engine", "dia", "--seed", str(a.seed),
       "--prompt-audio", os.path.join(VL, "prompts", "dia_prompt_kokoro_am_puck.wav"), "--prompt-text", PROMPT_TEXT,
       "--dia-tail", " (laughs)"]
if a.reuse:
    shutil.copy(os.path.join(a.reuse, "dia8_master.wav"), master)
    rep = json.load(open(os.path.join(a.reuse, "dia8_report.json")))
else:
    print("$ " + " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True)
    rep = json.load(open(os.path.join(tmp, "dia8.json")))
    rep["seed_used"] = a.seed
    try:
        import librosa
        y22, _ = librosa.load(master, sr=22050)
        f0, v, _ = librosa.pyin(y22, fmin=65, fmax=450, sr=22050, frame_length=2048)
        rep["median_pitch_hz"] = round(float(np.median(f0[v & ~np.isnan(f0)])), 1)
        print("median pitch", rep["median_pitch_hz"], "Hz (reference #8: ~200-205 Hz)")
    except Exception as e:
        print("pitch check skipped:", e)
if a.keep:
    os.makedirs(a.keep, exist_ok=True)
    shutil.copy(master, os.path.join(a.keep, "dia8_master.wav"))
    json.dump(rep, open(os.path.join(a.keep, "dia8_report.json"), "w"), indent=1)
# ---- word alignment (Whisper small.en on the numpy array), then line / "..." boundaries ----
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
import difflib
x, sr = sf.read(master, dtype="float32")
x16 = resample_poly(x, 1, 3).astype(np.float32) if sr == 48000 else resample_poly(x, 16000, sr).astype(np.float32)
ASR = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, _ = ASR.transcribe(x16, beam_size=5, language="en", word_timestamps=True)
words = [w for s in segs for w in s.words]
heard_text = " ".join(w.word.strip() for w in words)
rep["whisper_wav"] = heard_text
# script tokens: (line, part) for every word; a part ends at "..."
tok, where = [], []
for i, t in enumerate(lines):
    for p, part in enumerate(t.split("...")):
        for w in part.split():
            tok.append(re.sub(r"[^a-z0-9']", "", w.lower())); where.append((i, p))
heard = [re.sub(r"[^a-z0-9']", "", w.word.lower().replace("-", "")) for w in words]
tok2w = {}
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=tok, b=heard, autojunk=False).get_opcodes():
    if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1): tok2w[i1 + k] = j1 + k
HOP = 0.01
fr = np.lib.stride_tricks.sliding_window_view(np.pad(x, (0, int(0.02 * sr))), int(0.02 * sr))[::int(HOP * sr)]
rms = np.sqrt((fr ** 2).mean(axis=1) + 1e-12)
SIL = 10 ** (float(L.get("pacing", {}).get("sil_db", -40)) / 20) * rms.max()   # pause = 40 dB (lines.json pacing.sil_db) under the loudest frame
bounds = []   # (time of cut, natural silence there, kind, (line, part) before, (line, part) after)
for k in range(len(tok) - 1):
    if where[k] == where[k + 1]: continue
    kind = "gap" if where[k][0] != where[k + 1][0] else "beat"
    lw = next((tok2w[j] for j in range(k, -1, -1) if j in tok2w), None)
    fw = next((tok2w[j] for j in range(k + 1, len(tok)) if j in tok2w), None)
    if lw is None or fw is None or fw <= lw:
        sys.exit(f"could not place the {kind} after script word {k + 1} ('{tok[k]}') in the Whisper words: {heard_text}")
    e, s_ = words[lw].end, words[fw].start
    # Whisper word edges are approximate (often end == next start): cut at the quietest 20 ms inside a window
    # around the boundary, bounded by the middle of the two words, and measure the real pause there
    lo = max((words[lw].start + e) / 2, e - 0.03); hi = min(words[fw].end, max(e, s_) + 0.25)
    i0, i1 = int(lo / HOP), max(int(lo / HOP) + 1, int(hi / HOP))
    q = rms[i0:i1] < SIL
    if q.any():   # a quiet run in the window, extended to its full length
        runs, r0 = [], None
        for j, v in enumerate(list(q) + [False]):
            if v and r0 is None: r0 = j
            if not v and r0 is not None: runs.append((j - r0, r0)); r0 = None
        bm = (e + s_) / 2 / HOP - i0   # Whisper's boundary (pacing.cut "nearest": the quiet run nearest to it)
        if L.get("pacing", {}).get("cut") == "nearest":
            n, r0 = min(runs, key=lambda r: max(0, r[1] - bm, bm - (r[1] + r[0])) - 0.3 * r[0])
        else:                           # default: the longest quiet run
            n, r0 = max(runs)
        j0, j1 = i0 + r0, i0 + r0 + n - 1
        while j0 > 0 and rms[j0 - 1] < SIL: j0 -= 1
        while j1 < len(rms) - 1 and rms[j1 + 1] < SIL: j1 += 1
        nat = (j1 - j0 + 1) * HOP; cut = (j0 + j1 + 1) / 2 * HOP
    else:          # no pause at all: cut at the quietest 20 ms
        i1 = max(i0 + 1, int((max(e, s_) + 0.06) / HOP))   # (a narrower window: don't cut into the next word)
        nat = 0.0; cut = (i0 + int(np.argmin(rms[i0:i1])) + 0.5) * HOP
    bounds.append((cut, nat, kind, where[k], where[k + 1]))
    print(f"   {kind:4} after line {where[k][0] + 1}: '{words[lw].word.strip()}' {e:.2f} | '{words[fw].word.strip()}' {s_:.2f}  cut {cut:.2f}, pause {nat:.2f} s")
pace = {"gap": 0.0, "beat": 0.0, **{k: v for k, v in L.get("pacing", {}).items() if k in ("gap", "beat")}}  # (pacing may also hold sil_db / cut, see the cut search above)
if a.gap is not None: pace["gap"] = a.gap
if a.beat is not None: pace["beat"] = a.beat
cuts = [0.0] + [b[0] for b in bounds] + [len(x) / sr]
pieces = []
for i in range(len(cuts) - 1):
    seg = x[int(cuts[i] * sr): int(cuts[i + 1] * sr)].copy()
    f = int(0.01 * sr); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    pieces.append(seg)
# check every cut: each piece (line, or part of a line around "...") must transcribe to its own words
rep["pieces_heard"] = []
for seg in pieces:
    sg, _ = ASR.transcribe((resample_poly(seg, 1, 3) if sr == 48000 else resample_poly(seg, 16000, sr)).astype(np.float32), beam_size=5, language="en")
    rep["pieces_heard"].append(" ".join(t.text.strip() for t in sg)); print("   piece:", rep["pieces_heard"][-1])
if a.wav:
    # Dia's own phrasing, plus extra silence where its pause at a line end / "..." is shorter than lines.json "pacing"
    out = [pieces[0]]
    for b, seg in zip(bounds, pieces[1:]):
        add = max(0.0, pace[b[2]] - b[1]); out += [np.zeros(int(add * sr), np.float32), seg]
    y = np.concatenate(out); sf.write(a.wav, y, sr)
    rep["paced_duration_s"] = round(len(y) / sr, 2); rep["pacing"] = pace
    print(f"wrote {a.wav} ({len(y) / sr:.2f} s, pacing {pace})")
if a.split_dir:
    # one file per line (01.wav ...); a line with "..." is split into parts (03a.wav, 03b.wav) so voice.py inserts the beat
    os.makedirs(a.split_dir, exist_ok=True)
    ids = [(0, 0)] + [b[4] for b in bounds]
    nparts = {}
    for li, p in ids: nparts[li] = max(nparts.get(li, 0), p + 1)
    for (li, p), seg in zip(ids, pieces):
        name = f"{li + 1:02d}" + ("abcdef"[p] if nparts[li] > 1 else "")
        sf.write(os.path.join(a.split_dir, name + ".wav"), seg, sr)
    print("wrote", len(pieces), "files to", a.split_dir)
if a.keep:
    json.dump(rep, open(os.path.join(a.keep, "dia8_report.json"), "w"), indent=1)
print(json.dumps({k: rep.get(k) for k in ("seed_used", "median_pitch_hz", "duration_s", "paced_duration_s", "whisper_wav", "lufs", "true_peak_dbtp", "final_transcript", "final_wrong_words")}, indent=1))
shutil.rmtree(tmp)
