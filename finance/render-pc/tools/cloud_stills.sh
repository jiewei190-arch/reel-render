#!/usr/bin/env bash
# Cloud (CPU) stills + a labelled contact sheet for one Short: renders the sharp composition at --gl=swangle, one still
# per frame given (default: 6 frames spread over the shots: the hook, 4 in between, the loop), then tiles them with the
# shot id and time. Writes out/stills/<tag>/ and the sheet (default finance/shorts/<slug>/stills_sheet.png).
#   usage: bash tools/cloud_stills.sh <Comp> <slug> <tag> [frame ...]     env: SCALE (0.5), NOBUNDLE=1, SHEET=path
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
COMP="${1:?comp}"; SLUG="${2:?slug}"; TAG="${3:?tag}"; shift 3
PLAN="src/shorts/${SLUG//-/_}.plan.gen.ts"
SCALE="${SCALE:-0.5}"
SHEET="${SHEET:-$ROOT/../shorts/$SLUG/stills_sheet.png}"
FR=("$@")
if [ ${#FR[@]} -eq 0 ]; then
  read -r -a FR <<< "$(python3 - "$PLAN" <<'PY'
import json, re, sys
sh = json.loads(re.search(r"SHOTS = (\[.*?\]) as const", open(sys.argv[1]).read()).group(1))
n = len(sh); pick = sorted({0, round(n * 0.2), round(n * 0.4), round(n * 0.6), round(n * 0.78), n - 1})
print(" ".join(str(round((sh[k]["t"] * 0.4 + sh[k]["end"] * 0.6) * 30)) for k in pick))
PY
)"
fi
mkdir -p "out/stills/$TAG"
[ "${NOBUNDLE:-0}" = 1 ] && [ -d build ] || npx --no-install remotion bundle src/index.ts --out-dir=build --log=error >/dev/null
for f in "${FR[@]}"; do
  npx --no-install remotion still build "$COMP" "out/stills/$TAG/f$(printf %04d "$f").png" --frame="$f" --scale="$SCALE" --gl=swangle --timeout=400000 --log=error >/dev/null 2>&1 \
    || npx --no-install remotion still build "$COMP" "out/stills/$TAG/f$(printf %04d "$f").png" --frame="$f" --scale="$SCALE" --gl=swangle --timeout=400000 --log=error
done
python3 - "$PLAN" "$SHEET" "out/stills/$TAG" <<'PY'
import json, re, subprocess, sys
from pathlib import Path
sh = json.loads(re.search(r"SHOTS = (\[.*?\]) as const", open(sys.argv[1]).read()).group(1))
ims = sorted(Path(sys.argv[3]).glob("f*.png"))
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
PY
