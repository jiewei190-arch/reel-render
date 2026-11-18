#!/usr/bin/env bash
# Preset thumbnails for RECIPE_GUIDE.md: renders the PresetGallery composition (src/fin/recipe/gallery.ts: one shot per
# pose, camera, prop motion, fx and set) at each preset's key frame, into <outdir>/<group>-<name>.jpg + one sheet.
#   bash tools/preset_sheet.sh [outdir]     (default docs/presets; env SCALE GL BROWSER)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
OUT="${1:-docs/presets}"; SCALE="${SCALE:-0.2}"; GL="${GL:-swangle}"
BX=(); [ -n "${BROWSER:-}" ] && BX=(--browser-executable="$BROWSER")
mkdir -p "$OUT"; rm -rf out/tmp/preset_build
npx --no-install remotion bundle src/index.toolkit.ts --out-dir=out/tmp/preset_build --log=error >/dev/null
node -e "
const {build}=require('esbuild');
build({entryPoints:['src/fin/recipe/gallery.ts'],bundle:true,write:false,format:'cjs',platform:'node',logLevel:'error'}).then(r=>{const m={exports:{}};new Function('module','exports','require',r.outputFiles[0].text)(m,m.exports,require);for(const g of m.exports.GALLERY_ITEMS)console.log(g.group+'-'+g.name+' '+g.frame)})" > out/tmp/preset_items.txt
ins=()
while read -r name f; do
  npx --no-install remotion still out/tmp/preset_build PresetGallery "$OUT/$name.jpg" --frame="$f" --scale="$SCALE" --gl="$GL" "${BX[@]}" --timeout=240000 --log=error
  ins+=(-i "$OUT/$name.jpg")
done < out/tmp/preset_items.txt
n=$(wc -l < out/tmp/preset_items.txt)
echo "$n thumbnails in $OUT"
