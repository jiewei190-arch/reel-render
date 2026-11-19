"""Tile stills into a labelled contact sheet: label = frame, time and shot id (from the Short's plan.gen.ts).
    python tools/fin_sheet.py <Comp> <sheet.jpg> <still.png> [...]"""
import json, re, subprocess, sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
comp, sheet, ims = sys.argv[1], sys.argv[2], sys.argv[3:]
import os
slug = os.environ.get("SLUG", "")
plan = (root / "src" / "shorts" / slug / "plan.gen.ts")
shots = json.loads(re.search(r"export const SHOTS = (\[.*?\]) as const;", plan.read_text(encoding="utf8"), re.S).group(1)) if plan.exists() else []
font = root / "public" / "fonts" / "Poppins-ExtraBold.ttf"
tmp = []
for p in ims:
    f = int(re.search(r"f(\d+)", Path(p).stem).group(1))
    t = f / 30
    sid = [s["id"] for s in shots if s["t"] <= t + 1e-6][-1] if shots else ""
    o = Path(p).with_suffix(".lab.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-vf", f"scale=360:-1,drawtext=fontfile={font}:text='{sid}  f{f}  {t:.2f}s':fontsize=22:fontcolor=white:borderw=3:bordercolor=black:x=10:y=10", str(o)], check=True)
    tmp.append(o)
n = len(tmp); cols = min(n, 6); rows = (n + cols - 1) // cols
args = []
for x in tmp: args += ["-i", str(x)]
lay = "|".join(f"{(k % cols) * 362}_{(k // cols) * 642}" for k in range(n))
subprocess.run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", f"xstack=inputs={n}:layout={lay}:fill=white" if n > 1 else "null", "-q:v", "3", sheet], check=True)
print(sheet, n, "stills")
