"""voice_dialogue_pc.py <short_dir> <chatterbox_d2_script.py> [--gap 0.3] [--lead 0.15]

S5 CHARACTER-TALKS voice: each numbered line of vo/narration.md is spoken by the speaker named in vo/speakers.json
({"speakers": {"1": "spender", ...}, "voices": {"spender": {"exag": .., "cfg": .., "seeds": "11,7,23"}, ...}}).
Same D2 voice family (Chatterbox built-in voice, no cloning); each speaker gets its own exaggeration and seed order.
Each speaker's lines are rendered in one chatterbox_d2 call (with its Whisper QA), then the line takes are spliced back
in script order with --gap silence between lines and --lead at the start. Writes voice.wav, script.txt (one line per
narration line, digits kept) and voice.lines.json (per line: n, speaker, text, start, end, QA) in <short_dir>.
Run with the Chatterbox venv python.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

args = sys.argv[1:]
def opt(name, default):
    if name in args:
        i = args.index(name); v = float(args[i + 1]); del args[i:i + 2]; return v
    return default
GAP, LEAD = opt("--gap", 0.3), opt("--lead", 0.15)
d, tts = Path(args[0]), args[1]
cfg = json.loads((d / "vo" / "speakers.json").read_text(encoding="utf-8"))
lines = []
for raw in (d / "vo" / "narration.md").read_text(encoding="utf-8").splitlines():
    m = re.match(r"\s*(\d+)\.\s+(.*\S)", raw)
    if m:
        lines.append((int(m.group(1)), m.group(2)))
tmp = d / "vo" / "_dialogue"
tmp.mkdir(exist_ok=True)
takes = {}
for spk, v in cfg["voices"].items():
    mine = [(n, t) for n, t in lines if cfg["speakers"][str(n)] == spk]
    if not mine:
        continue
    md = tmp / f"{spk}.md"
    md.write_text("".join(f"{k + 1}. {t}\n" for k, (_, t) in enumerate(mine)), encoding="utf-8")
    wav = tmp / f"{spk}.wav"
    subprocess.check_call([sys.executable, "-W", "ignore", tts, str(md), str(wav), str(tmp / f"{spk}.txt"), "--gap", "0.3", "--lead", "0.0",
                           "--exag", str(v["exag"]), "--cfg", str(v["cfg"]), "--seeds", v["seeds"]])
    info = json.loads((tmp / f"{spk}.lines.json").read_text(encoding="utf-8"))
    audio, sr = sf.read(str(wav))
    for (n, _), L in zip(mine, info["lines"]):
        a, b = int(round(L["start"] * sr)), int(round(L["end"] * sr))
        takes[n] = (audio[a:b], sr, L)
sr = next(iter(takes.values()))[1]
out, meta, t = [np.zeros(int(LEAD * sr))], [], LEAD
for k, (n, text) in enumerate(lines):
    seg, _, L = takes[n]
    meta.append({"n": n, "speaker": cfg["speakers"][str(n)], "text": text, "start": round(t, 3), "end": round(t + len(seg) / sr, 3),
                 "qa": [p.get("qa") for p in L.get("parts", [])], "heard": [p.get("heard", p.get("asr")) for p in L.get("parts", [])]})
    out.append(seg)
    t += len(seg) / sr
    if k + 1 < len(lines):
        out.append(np.zeros(int(GAP * sr)))
        t += GAP
full = np.concatenate(out)
sf.write(str(d / "voice.wav"), full, sr)
(d / "script.txt").write_text("".join(text + "\n" for _, text in lines), encoding="utf-8")
(d / "voice.lines.json").write_text(json.dumps({"voice": "D2 dialogue", "voices": cfg["voices"], "speakers": cfg["speakers"], "gap": GAP, "lead": LEAD,
                                                 "sr": sr, "duration": round(len(full) / sr, 3), "lines": meta}, indent=1), encoding="utf-8")
print(f"{d.name}: {len(full) / sr:.2f} s, {len(lines)} lines, speakers {sorted(set(cfg['speakers'].values()))}")
