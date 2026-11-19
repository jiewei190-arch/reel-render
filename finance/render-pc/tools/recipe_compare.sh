#!/usr/bin/env bash
# Side-by-side stills: a hand-written composition (top row) vs its recipe port (bottom row) at the same frames.
#   bash tools/recipe_compare.sh <RefComp> <RecipeComp> <out.jpg> <frame> [frame...]   (env SCALE=0.3 GL=swangle BROWSER=)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
REF="$1"; REC="$2"; OUT="$3"; shift 3
SCALE="${SCALE:-0.3}"; GL="${GL:-swangle}"
BX=(); [ -n "${BROWSER:-}" ] && BX=(--browser-executable="$BROWSER")
D=out/tmp/compare; rm -rf "$D" out/tmp/compare_build; mkdir -p "$D"
npx --no-install remotion bundle src/index.toolkit.ts --out-dir=out/tmp/compare_build --log=error >/dev/null
for c in "$REF" "$REC"; do for f in "$@"; do
  npx --no-install remotion still out/tmp/compare_build "$c" "$D/${c}_$(printf %03d "$f").jpg" --frame="$f" --scale="$SCALE" --gl="$GL" "${BX[@]}" --timeout=240000 --log=error
done; done
row() { local c=$1; local ins=(); for f in "${@:2}"; do ins+=(-i "$D/${c}_$(printf %03d "$f").jpg"); done
  if [ $(( $# - 1 )) -gt 1 ]; then ffmpeg -v error -y "${ins[@]}" -filter_complex "hstack=inputs=$(( $# - 1 ))" "$D/row_$c.jpg"; else cp "$D/${c}_$(printf %03d "$2").jpg" "$D/row_$c.jpg"; fi; }
row "$REF" "$@"; row "$REC" "$@"
ffmpeg -v error -y -i "$D/row_$REF.jpg" -i "$D/row_$REC.jpg" -filter_complex vstack=inputs=2 -q:v 3 "$OUT"
echo "$OUT (top: $REF, bottom: $REC; frames $*)"
