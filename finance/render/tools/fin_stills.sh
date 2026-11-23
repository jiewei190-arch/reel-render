#!/usr/bin/env bash
# Stills + a labelled contact sheet for one finance Short. Bundles once (reuse with NOBUNDLE=1), renders the given output
# frames of the sharp composition, then tiles them with ffmpeg (label: shot id + time). Never overwrites a tag.
#   usage: SLUG=<slug> bash tools/fin_stills.sh <Comp> <tag> <frame> [frame...]   env: SCALE (0.5), GL (swangle in the cloud, angle on a GPU)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
COMP="${1:?comp}"; TAG="${2:?tag}"; shift 2
SCALE="${SCALE:-0.5}"; GL="${GL:-swangle}"
[[ $TAG =~ ^[A-Za-z0-9_-]+$ ]] || { echo "bad tag" >&2; exit 2; }
OUT="out/stills/$TAG"; SHEET="out/sheets/${TAG}.jpg"
[ -e "$SHEET" ] && { echo "$SHEET exists: pick a new tag" >&2; exit 1; }
mkdir -p "$OUT" out/sheets
[ "${NOBUNDLE:-0}" = 1 ] && [ -d build ] || npx --no-install remotion bundle src/index.ts --out-dir=build --log=error >/dev/null
ins=()
for f in "$@"; do
  o="$OUT/f$(printf %04d "$f").png"
  npx --no-install remotion still build "$COMP" "$o" --frame="$f" --scale="$SCALE" --gl="$GL" --timeout=400000 --log=error >/dev/null 2>&1 \
    || npx --no-install remotion still build "$COMP" "$o" --frame="$f" --scale="$SCALE" --gl="$GL" --timeout=400000 --log=error
  ins+=("$o")
done
python3 tools/fin_sheet.py "$COMP" "$SHEET" "${ins[@]}"
echo "$SHEET"
