#!/usr/bin/env bash
# Copy each Short's plan + script into the PC render project (finance/render-pc): src/shorts/<slug_>.plan.gen.ts and
# src/fin/scripts/<name>.ts (the script text, for captions in script casing). Run after plan/plan_src.py.
#   usage: bash finance/tools/sync_render_pc.sh <slug> [...]
set -euo pipefail
F="$(cd "$(dirname "$0")/.." && pwd)"
for s in "$@"; do
  u=${s//-/_}
  cp "$F/shorts/$s/src/plan.gen.ts" "$F/render-pc/src/shorts/$u.plan.gen.ts"
  python3 - "$F/shorts/$s/script.txt" "$F/render-pc/src/fin/scripts/$u.ts" "$s" <<'PY'
import json, sys
txt = open(sys.argv[1], encoding="utf8").read().strip()
open(sys.argv[2], "w", encoding="utf8").write(f"// generated from shorts/{sys.argv[3]}/script.txt\nexport default {json.dumps(txt)};\n")
PY
  echo "synced $s"
done
