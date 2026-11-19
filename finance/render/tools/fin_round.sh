#!/usr/bin/env bash
# One review round: 6 stills per Short (the first frame's shot, 4 spread through the film, the loop shot), one sheet each.
#   usage: bash tools/fin_round.sh <round-tag> [slug ...]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
R="${1:?round tag}"; shift
SL=("$@"); [ ${#SL[@]} -eq 0 ] && SL=(penny-doubles rule-of-72 minimum-payment-trap dollar-1970 ten-beats-thirty)
npx --no-install remotion bundle src/index.ts --out-dir=build --log=error >/dev/null
for s in "${SL[@]}"; do
  comp=$(grep -o 'comp: "[A-Za-z0-9]*"' "src/shorts/$s/stage.tsx" | cut -d'"' -f2)
  frames=$(python3 - "$s" <<'PY'
import json, re, sys
sh = json.loads(re.search(r"SHOTS = (\[.*?\]) as const", open(f"src/shorts/{sys.argv[1]}/plan.gen.ts").read()).group(1))
n = len(sh); pick = sorted({0, round(n * 0.2), round(n * 0.4), round(n * 0.6), round(n * 0.75), n - 1})
print(" ".join(str(round((sh[k]["t"] * 0.35 + sh[k]["end"] * 0.65) * 30)) for k in pick))
PY
)
  SLUG=$s NOBUNDLE=1 bash tools/fin_stills.sh "$comp" "${R}_${s}" $frames
done
