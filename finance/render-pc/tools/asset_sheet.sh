#!/usr/bin/env bash
# CC0 asset contact sheets: renders the AssetGallery composition (one frame per catalogue asset, front view from +z,
# a 1.45 m red reference block = a Blocky actor's height, a green +z arrow) and tiles them 6x4 per sheet.
#   bash tools/asset_sheet.sh [outdir]      (default out/assets; env SCALE=0.25, GL=swangle|angle, BROWSER=<chrome path>)
# Writes <outdir>/thumbs/<id>.jpg and <outdir>/sheet_<k>.jpg.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
OUT="${1:-out/assets}"; SCALE="${SCALE:-0.25}"; GL="${GL:-swangle}"
BX=(); [ -n "${BROWSER:-}" ] && BX=(--browser-executable="$BROWSER")
rm -rf "$OUT" out/tmp/asset_build; mkdir -p "$OUT/thumbs"
npx --no-install remotion bundle src/index.toolkit.ts --out-dir=out/tmp/asset_build --log=error >/dev/null
npx --no-install remotion render out/tmp/asset_build AssetGallery "$OUT/seq" --sequence --image-format=jpeg --scale="$SCALE" --gl="$GL" "${BX[@]}" --concurrency=4 --log=error
ids=$(node -e "console.log(require('./public/assets/cc0/catalog.json').map(a=>a.id).join(' '))")
k=0; for id in $ids; do cp "$OUT/seq/element-$(printf %03d $k).jpeg" "$OUT/thumbs/$id.jpg"; k=$((k+1)); done
n=$k; s=0; while [ $s -lt $n ]; do
  ffmpeg -v error -y -start_number $s -i "$OUT/seq/element-%03d.jpeg" -frames:v 1 -vf "tile=6x4" -update 1 "$OUT/sheet_$((s/24)).jpg"; s=$((s+24)); done
rm -rf "$OUT/seq"; echo "$n thumbs in $OUT/thumbs, sheets $OUT/sheet_*.jpg"
