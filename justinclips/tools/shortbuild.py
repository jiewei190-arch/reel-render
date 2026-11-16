#!/usr/bin/env python3
"""shortbuild.py: one-command (re)build of a Justin clips Toon 3D Short, with a swappable narrator voice.

The Short's per-line script lives in `<short>/lines.json`. Shot timing is NOT hard-coded: every shot in
`<short>/project/story/shots.tpl.json` is anchored to a voice line (or a word inside it), so a new voice with
different pacing re-times every cut automatically.

  python3 justinclips/tools/shortbuild.py justinclips/shorts/<slug> --kit <toon3d-fx checkout>/whatif/aitrends-2d-studio
        [--voice chatterbox_d2 | --voice "cmd:<shell template using {text} and {out}>" | --voice wavdir:<dir>]
        [--stages voice,timing,render,mix] [--workers 4]

Voices (--voice):
  chatterbox_d2   (default) the current D2 narrator: Chatterbox built-in voice, exaggeration 0.3, cfg 0.3, Whisper QA,
                  seeds 7/11/23. Needs ~/.venvs/chatterbox (origin/voice-test whatif/voice/setup_chatterbox.sh) and
                  chatterbox_d2.py (pass --d2 PATH, default: <kit>/../voice/chatterbox_d2.py, then ~/chatterbox_d2.py).
  cmd:TEMPLATE    any other TTS. TEMPLATE runs once per spoken part with {text} (shell-quoted) and {out} (a .wav path),
                  e.g. --voice 'cmd:piper --model en_US-ryan-high.onnx --output_file {out} <<< {text}'.
                  Parts are split at "..." (a held beat), trimmed and joined with the same gaps as D2.
  wavdir:DIR      pre-made per-line recordings DIR/line_01.wav, line_02.wav, ... (one per lines.json entry).

Stages: voice (writes project/input/voiceover.wav + voiceover.lines.json + script.txt), timing (Whisper word times,
then shots.tpl.json -> story/shots.json, config duration), render (silent 1080x1920 video + contact sheet), mix
(music + SFX + voice, -14 LUFS, true peak <= -1 dBTP, mux, video.mp4 + video.sha256 in the Short's folder).
Never uploads or posts anything.
"""
import argparse, glob, hashlib, json, os, re, shlex, shutil, subprocess, sys, tempfile

GAP, LEAD, BEAT = 0.2, 0.05, 0.4          # same pacing as the D2 Shorts (exploding-whale): --gap 0.2 --lead 0.05 --beat 0.4
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("short"); ap.add_argument("--kit", required=True)
ap.add_argument("--voice", default="chatterbox_d2"); ap.add_argument("--d2", default=None)
ap.add_argument("--venv", default=os.path.expanduser("~/.venvs/chatterbox"))
ap.add_argument("--seeds", default="7,11,23", help="D2 seeds tried per part (Whisper QA keeps the first exact take)")
ap.add_argument("--stages", default="voice,timing,render,mix"); ap.add_argument("--workers", default="4")
A = ap.parse_args()
SHORT = os.path.abspath(A.short); SLUG = os.path.basename(SHORT.rstrip("/")); KIT = os.path.abspath(A.kit)
SRC = os.path.join(SHORT, "project"); PROJ = os.path.join(KIT, "projects", SLUG)
STAGES = A.stages.split(",")
PY = os.path.join(A.venv, "bin", "python") if os.path.exists(os.path.join(A.venv, "bin", "python")) else sys.executable
env = dict(os.environ); env.setdefault("CHROMIUM_PATH", "/opt/pw-browsers/chromium")

def run(cmd, **kw):
    print("+", cmd if isinstance(cmd, str) else " ".join(shlex.quote(c) for c in cmd), flush=True)
    subprocess.run(cmd, check=True, env=env, **kw)
def jload(p): return json.load(open(p, encoding="utf-8"))
def jsave(p, o): open(p, "w", encoding="utf-8").write(json.dumps(o, indent=1, ensure_ascii=False) + "\n")

# the kit runs the project from <kit>/projects/<slug>; the Short's folder keeps the source of truth
def sync_in():
    os.makedirs(PROJ, exist_ok=True)
    for sub in ("scenes", "story", "input", "timeline"):
        s = os.path.join(SRC, sub)
        if os.path.isdir(s): shutil.copytree(s, os.path.join(PROJ, sub), dirs_exist_ok=True)
    shutil.copy(os.path.join(SRC, "config.json"), os.path.join(PROJ, "config.json"))
def sync_out(*subs):
    for sub in subs:
        s = os.path.join(PROJ, sub)
        if os.path.isdir(s): shutil.copytree(s, os.path.join(SRC, sub), dirs_exist_ok=True)
        elif os.path.isfile(s): shutil.copy(s, os.path.join(SRC, sub))

LINES = jload(os.path.join(SHORT, "lines.json"))["lines"]
_pace = jload(os.path.join(SHORT, "lines.json")).get("pacing", {})   # optional per-Short override: {"gap": .., "lead": .., "beat": ..}
GAP, LEAD, BEAT = _pace.get("gap", GAP), _pace.get("lead", LEAD), _pace.get("beat", BEAT)
sync_in()
inp = os.path.join(PROJ, "input"); os.makedirs(inp, exist_ok=True)
WAV, META, PLAIN = os.path.join(inp, "voiceover.wav"), os.path.join(inp, "voiceover.lines.json"), os.path.join(inp, "script.txt")

# ------------------------------------------------------------------ voice
def voice_d2():
    d2 = A.d2 or next((p for p in [os.path.join(KIT, "..", "voice", "chatterbox_d2.py"), os.path.expanduser("~/chatterbox_d2.py")] if os.path.exists(p)), None)
    if not d2: sys.exit("chatterbox_d2.py not found: pass --d2 (origin/voice-test whatif/voice/chatterbox_d2.py)")
    md = os.path.join(inp, "tts_script.md")
    open(md, "w").write("".join(f"{i + 1}. {l['text']}\n" for i, l in enumerate(LINES)))
    run([PY, d2, md, WAV, PLAIN, "--gap", str(GAP), "--lead", str(LEAD), "--beat", str(BEAT), "--seeds", A.seeds])
    m = jload(META); m["engine"] = "chatterbox_d2"; jsave(META, m)
    if m.get("qa_fail_lines"): print(f"WARNING: Whisper QA failed on lines {m['qa_fail_lines']}: listen, or reword them in lines.json")

def voice_parts(make, split=True):   # generic assembly: make(text, idx, part_k) -> path to a wav for that part
    import numpy as np, soundfile as sf
    SR = 24000
    def load(p):
        a, sr = sf.read(p, dtype="float32", always_2d=True); a = a.mean(1)
        if sr != SR: a = np.interp(np.arange(int(len(a) * SR / sr)) / SR, np.arange(len(a)) / sr, a).astype(np.float32)
        idx = np.where(np.abs(a) > 0.02 * max(np.abs(a).max(), 1e-6))[0]
        return a[max(idx[0] - int(SR * 0.04), 0): idx[-1] + int(SR * 0.12)] if len(idx) else a
    pieces = [np.zeros(int(SR * LEAD), np.float32)]; recs = []
    now = lambda: sum(len(p) for p in pieces) / SR
    for i, l in enumerate(LINES):
        parts = [p.strip() for p in re.split(r"(?<=\.\.\.)\s+", l["text"]) if p.strip()] if split else [l["text"]]
        rec = {"n": i + 1, "text": l["text"], "start": round(now(), 3), "parts": []}
        for k, part in enumerate(parts):
            pieces.append(load(make(part, i, k))); rec["parts"].append({"tts": part})
            if k < len(parts) - 1: pieces.append(np.zeros(int(SR * BEAT), np.float32))
        rec["end"] = round(now(), 3); recs.append(rec); pieces.append(np.zeros(int(SR * GAP), np.float32))
    y = np.concatenate(pieces); y = y / max(np.abs(y).max(), 1e-6) * 0.89; sf.write(WAV, y, SR)
    open(PLAIN, "w").write("\n".join(l["text"] for l in LINES) + "\n")
    jsave(META, {"engine": A.voice, "gap": GAP, "lead": LEAD, "beat": BEAT, "sr": SR, "duration": round(len(y) / SR, 3), "lines": recs})

def voice_cmd(tpl):
    tmp = tempfile.mkdtemp()
    def make(text, i, k):
        out = os.path.join(tmp, f"l{i + 1:02d}_{k}.wav")
        run(tpl.replace("{text}", shlex.quote(text)).replace("{out}", shlex.quote(out)), shell=True); return out
    voice_parts(make)

def voice_wavdir(d):          # whole-line recordings: no "..." split
    voice_parts(lambda text, i, k: os.path.join(d, f"line_{i + 1:02d}.wav"), split=False)

if "voice" in STAGES:
    v = A.voice
    if v == "chatterbox_d2": voice_d2()
    elif v.startswith("cmd:"): voice_cmd(v[4:])
    elif v.startswith("wavdir:"): voice_wavdir(os.path.abspath(v[7:]))
    else: sys.exit(f"unknown --voice {v}")
    shutil.copy(META, os.path.join(SHORT, "lines.timing.json"))
    sync_out("input")

# ------------------------------------------------------------------ timing
def resolve_timing():
    meta = jload(META); L = {r["n"]: r for r in meta["lines"]}
    words = jload(os.path.join(PROJ, "timeline", "words.json")); words = words.get("words", words)
    norm = lambda w: re.sub(r"[^\w']", "", w.lower())
    def word_t(n, w, nth=1, edge="start"):
        a, b = L[n]["start"] - 0.15, L[n]["end"] + 0.15; hits = [x for x in words if a <= x["start"] <= b and norm(x["word"]) == norm(w)]
        if len(hits) < nth: sys.exit(f"anchor word '{w}' (#{nth}) not found in line {n}: {L[n]['text']}")
        return hits[nth - 1][edge]
    def anchor(f):
        if isinstance(f, (int, float)): return float(f)
        n = f["line"]; off = f.get("offset", 0.0)
        if "word" in f: return word_t(n, f["word"], f.get("nth", 1), "end" if f.get("edge") == "end" else "start") + off
        if f.get("end"): return L[n]["end"] + off
        return L[n]["start"] + f.get("offset", -0.08)
    tpl = jload(os.path.join(PROJ, "story", "shots.tpl.json"))
    last = max(r["end"] for r in meta["lines"]); dur = round(last + tpl.get("tail", 0.45), 3)
    starts = [round(anchor(s["from"]), 3) for s in tpl["shots"]]; starts[0] = 0.0
    shots = []
    for i, s in enumerate(tpl["shots"]):
        o = {k: v for k, v in s.items() if k != "from"}; o["start"] = starts[i]; o["end"] = starts[i + 1] if i + 1 < len(starts) else dur
        if o["end"] - o["start"] < 0.5: sys.exit(f"shot {s['id']} is {o['end'] - o['start']:.2f} s: check its anchor")
        shots.append(o)
    story = {"duration": dur, "shots": shots}
    for k in ("music", "sfx"):
        if k in tpl: story[k] = tpl[k]
    jsave(os.path.join(PROJ, "story", "shots.json"), story)
    cfg = jload(os.path.join(PROJ, "config.json")); cfg["duration"] = dur
    l1 = L[1]["end"]; cfg["topCaptionUntil"] = round(max(tpl.get("topCaptionMin", 3.2), l1 + 0.6), 2)   # top caption >= 3 s, through the hook
    jsave(os.path.join(PROJ, "config.json"), cfg)
    # trim/pad the narration to the cut length so the mix ends on the payoff
    run(["ffmpeg", "-y", "-v", "error", "-i", WAV, "-af", f"apad,atrim=0:{dur}", os.path.join(inp, "vo_tmp.wav")]); os.replace(os.path.join(inp, "vo_tmp.wav"), WAV)
    lens = [round(s["end"] - s["start"], 2) for s in shots]
    print(f"duration {dur:.2f} s, {len(shots)} shots, cut lengths {min(lens)}-{max(lens)} s: {lens}")
    for s, d in zip(shots, lens):
        if d > 2.6 or d < 1.0: print(f"  note: {s['id']} is {d} s (target 1.5-2.5)")

if "timing" in STAGES:
    run([PY, os.path.join(KIT, "tools", "transcribe.py"), "--project", PROJ, "--script", PLAIN, "--lang", "en", "--model", "small"])
    resolve_timing()
    sync_out("timeline", "story", "config.json", "input")
    shutil.copy(os.path.join(PROJ, "config.json"), os.path.join(SRC, "config.json"))

# ------------------------------------------------------------------ render
if "render" in STAGES:
    run(["node", os.path.join(KIT, "render.mjs"), "--project", PROJ, "--out", os.path.join(PROJ, "build", "video_silent.mp4"), "--workers", A.workers], cwd=KIT)
    for p in glob.glob(os.path.join(PROJ, "build", "sheets", "*")): os.remove(p)
    run(["node", os.path.join(KIT, "render.mjs"), "--project", PROJ, "--sheet", "--scale", "0.3"], cwd=KIT)
    shutil.copy(os.path.join(PROJ, "build", "sheets", "sheet_01.png"), os.path.join(SHORT, "contact_sheet.png"))

# ------------------------------------------------------------------ mix + master + deliver
def loudness(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "loudnorm=I=-14:TP=-2:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    j = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1]); return float(j["input_i"]), float(j["input_tp"]), j

if "mix" in STAGES:
    silent = os.path.join(PROJ, "build", "video_silent.mp4")
    run([sys.executable, os.path.join(KIT, "audio", "mix.py"), "--project", PROJ, "--video", silent, "--out", os.path.join(PROJ, "out", "mixpy.mp4")], cwd=KIT)
    mix = os.path.join(PROJ, "build", "mix.wav"); I, TP, j = loudness(mix)
    print(f"mix.py master: {I:.1f} LUFS, TP {TP:.1f} dBTP")
    if abs(I + 14) > 0.3 or TP > -2.0:     # second pass, linear loudnorm to -14 LUFS / TP -2 (AAC adds ~0.5 dB of peak)
        f = (f"loudnorm=I=-14:TP=-2:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
             f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
        run(["ffmpeg", "-y", "-v", "error", "-i", mix, "-af", f, "-ar", "48000", mix + ".n.wav"]); os.replace(mix + ".n.wav", mix)
    out = os.path.join(SHORT, "video.mp4")
    run(["ffmpeg", "-y", "-v", "error", "-i", silent, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", "apad", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out])
    I, TP, _ = loudness(out); print(f"video.mp4: {I:.1f} LUFS, TP {TP:.1f} dBTP")
    if TP > -1.0 or abs(I + 14) > 0.5: print("WARNING: master outside -14 LUFS / TP <= -1: check the mix")
    h = hashlib.sha256(open(out, "rb").read()).hexdigest(); open(os.path.join(SHORT, "video.sha256"), "w").write(f"{h}  video.mp4\n")
    jsave(os.path.join(SHORT, "build_report.json"), {"lufs": round(I, 2), "true_peak_dbtp": round(TP, 2), "voice": jload(META).get("engine"), "sha256": h})
print("done (nothing uploaded or posted).")
