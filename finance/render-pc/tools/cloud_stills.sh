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
python3 tools/stills_sheet.py "$PLAN" "$SHEET" "out/stills/$TAG"
