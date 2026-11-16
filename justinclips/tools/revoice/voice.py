"""voice.py: render a Short's narration from its lines.json, with a swappable voice engine.

  python voice.py --project <kit>/projects/<slug> [--engine chatterbox_d2|files] [--dir DIR] [--seeds 7,11,23]

lines.json (project root) is the only script source:
  { "pacing": { "gap": 0.2, "lead": 0.05, "beat": 0.4 },
    "lines": [ { "n": 1, "text": "In 1970, Oregon blew up a whale." }, ... ] }
  "..." inside a line = a held beat (pacing.beat) before the punchline.

Engines (every engine writes the same three files, so nothing downstream cares which voice was used):
  input/voiceover.wav          the narration
  input/voiceover.lines.json   per line: start/end in seconds (+ engine details). Shot timing is derived from this.
  input/script.txt             the plain lines (captions keep the script's digits and spelling)

  chatterbox_d2  the current D2 deadpan (Chatterbox built-in voice, exaggeration 0.3, cfg 0.3, Whisper QA per part).
                 Needs the venv from setup_chatterbox.sh; run this script with that venv's python.
  files          ANY other voice: put one audio file per line in --dir, named 01.wav, 02.wav ... (mp3/flac/m4a ok).
                 For a line with "...", you may instead give 03a.wav, 03b.wav (parts) and the beat is inserted for you.
                 Files are trimmed of leading/trailing silence and joined with the same pacing.
"""
import argparse, glob, json, os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True)
ap.add_argument("--engine", default="chatterbox_d2")
ap.add_argument("--dir", help="files engine: folder with 01.wav, 02.wav ...")
ap.add_argument("--seeds", default="7,11,23")
a = ap.parse_args()
P = os.path.abspath(a.project)
spec = json.load(open(os.path.join(P, "lines.json"), encoding="utf-8"))
pace = {"gap": 0.2, "lead": 0.05, "beat": 0.4, **spec.get("pacing", {})}
lines = spec["lines"]
inp = os.path.join(P, "input"); os.makedirs(inp, exist_ok=True)
OUT = os.path.join(inp, "voiceover.wav")
open(os.path.join(inp, "script.txt"), "w", encoding="utf-8").write("\n".join(l["text"] for l in lines) + "\n")

if a.engine == "chatterbox_d2":
    md = os.path.join(P, "build", "tts_script.md"); os.makedirs(os.path.dirname(md), exist_ok=True)
    open(md, "w", encoding="utf-8").write("".join(f"{i + 1}. {l['text']}\n" for i, l in enumerate(lines)))
    cmd = [sys.executable, os.path.join(HERE, "chatterbox_d2.py"), md, OUT, "--gap", str(pace["gap"]), "--lead", str(pace["lead"]),
           "--beat", str(pace["beat"]), "--seeds", a.seeds]
    print(" ".join(cmd), flush=True)
    subprocess.run(cmd, check=True)
    meta = json.load(open(re.sub(r"\.wav$", "", OUT) + ".lines.json"))
    meta["engine"] = "chatterbox_d2"
    json.dump(meta, open(re.sub(r"\.wav$", "", OUT) + ".lines.json", "w"), indent=1)
    if meta.get("qa_fail_lines"):
        print(f"WARNING: Whisper QA failed on lines {meta['qa_fail_lines']}: listen before shipping", flush=True)
elif a.engine == "files":
    import soundfile as sf
    SR = 24000
    def load(f):
        p = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True)
        x = np.frombuffer(p.stdout, np.float32).copy()
        idx = np.where(np.abs(x) > 0.02 * max(np.abs(x).max(), 1e-6))[0]
        return x[max(idx[0] - int(SR * .04), 0): idx[-1] + int(SR * .12)] if len(idx) else x
    def find(stem):
        for ext in ("wav", "mp3", "flac", "m4a", "ogg"):
            f = os.path.join(a.dir, f"{stem}.{ext}")
            if os.path.exists(f): return f
    pieces = [np.zeros(int(SR * pace["lead"]), np.float32)]
    now = lambda: sum(len(p) for p in pieces) / SR
    recs = []
    for i, l in enumerate(lines):
        n = i + 1; whole = find(f"{n:02d}")
        parts = [whole] if whole else sorted(f for f in (find(f"{n:02d}{c}") for c in "abcdef") if f)
        if not parts: sys.exit(f"files engine: no audio for line {n} ({n:02d}.wav or {n:02d}a.wav ...) in {a.dir}")
        rec = {"n": n, "text": l["text"], "start": round(now(), 3), "parts": []}
        for k, f in enumerate(parts):
            t0 = now(); pieces.append(load(f))
            rec["parts"].append({"file": os.path.basename(f), "start": round(t0, 3), "end": round(now(), 3)})
            if k < len(parts) - 1: pieces.append(np.zeros(int(SR * pace["beat"]), np.float32))
        rec["end"] = round(now(), 3); recs.append(rec)
        pieces.append(np.zeros(int(SR * pace["gap"]), np.float32))
    y = np.concatenate(pieces); y = y / np.abs(y).max() * 0.89
    sf.write(OUT, y, SR)
    json.dump({"engine": "files", "dir": os.path.abspath(a.dir), **pace, "sr": SR, "duration": round(len(y) / SR, 3), "lines": recs},
              open(os.path.join(inp, "voiceover.lines.json"), "w"), indent=1)
else:
    sys.exit(f"unknown engine {a.engine}")
print("voice ok:", OUT)
