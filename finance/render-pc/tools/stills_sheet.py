"""stills_sheet.py <plan.gen.ts> <sheet.png> <stills_dir>: tile the labelled stills (shot id, frame, time) into a sheet."""
import json, re, subprocess, sys
from pathlib import Path
sh = json.loads(re.search(r"SHOTS = (\[.*?\]) as const", open(sys.argv[1]).read()).group(1))
ims = sorted(p for p in Path(sys.argv[3]).glob("f*.png") if ".lab" not in p.name)
font = "public/fonts/Poppins-ExtraBold.ttf"
labs = []
for p in ims:
    f = int(p.stem[1:]); t = f / 30
    sid = [s["id"] for s in sh if s["t"] <= t + 1e-6][-1]
    o = p.with_suffix(".lab.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(p), "-vf", f"scale=360:-1,drawtext=fontfile={font}:text='{sid}  f{f}  {t:.2f}s':fontsize=22:fontcolor=white:borderw=3:bordercolor=black:x=10:y=10", str(o)], check=True)
    labs.append(o)
n = len(labs); cols = min(n, 6)
args = [a for x in labs for a in ("-i", str(x))]
lay = "|".join(f"{(k % cols) * 362}_{(k // cols) * 642}" for k in range(n))
subprocess.run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", f"xstack=inputs={n}:layout={lay}:fill=white", sys.argv[2]], check=True)
print(sys.argv[2], n, "stills")
