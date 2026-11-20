#!/usr/bin/env bash
# Rebuild public/assets/cc0 from the original CC0 packs (owner's PC or any machine with internet access).
#   bash tools/fetch_cc0.sh            downloads the pack zips, checks sha256, unzips, runs tools/cc0_build.py
# Sources: Kenney's and Quaternius's own uploads on OpenGameArt.org (each page states CC0; every Kenney zip also has
# License.txt = CC0). kenney.nl and Quaternius's Google Drive serve the same packs but refuse scripted/cloud downloads,
# so the OGA mirrors are used. Licence record: public/assets/cc0/LICENSES.md.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${CC0_WORK:-$ROOT/out/cc0_src}"
OGA=https://opengameart.org/sites/default/files
mkdir -p "$WORK/zips" "$WORK/x"
while read -r sha file; do
  [ -z "$sha" ] && continue
  z="$WORK/zips/${file//%20/_}"
  [ -f "$z" ] || curl -fL --retry 3 -o "$z" "$OGA/$file"
  echo "$sha  $z" | sha256sum -c --quiet - || { echo "checksum mismatch: $file (the upload changed; check its licence page again)" >&2; exit 1; }
  d="$WORK/x/$(basename "${z%.zip}")"; rm -rf "$d"; mkdir -p "$d"; unzip -q -o "$z" -d "$d"
done <<'LIST'
51f1fafb0f5efdc7aec3af57138665a12aee5610d47bf4108cd8d4bd044a57a2 kenney_mini-shop_2.1.zip
2acfe5cb44d392e834f77cf5488528c7cd45427cdf5fb941ce99856276158c19 kenney_mini-arcade_1.zip
f25eca0c70ce0b5ea4075547ad84e386cb3999c30eb9f4c95133bea5d7e1bd39 kenney_platformerKit_0.zip
c3586341b5932c87eb43d75d915434f47daed168b17ed36a03e8ca9977c7443e kenney_survival-kit.zip
fac7dacac5c7874348cf19729af3ef205f3d366493edaf0a827d93f4fdf3d0c4 kenney_car-kit_3.1.zip
f8b09b081c2bb88bcc126e2dec1cb40fd0dad7e7e591b6c26aaefe96fb35276b kenney_city-kit-commercial_2.1.zip
5869c35cf30b1c87bdb2d197b6d325eebadd2ef08ea27f04797e8e08d77a9a39 kenney_city-kit-suburban_2.0.zip
374a4552115cbd11b4ec5c930ee31a533562dc78a09af249a655d03f7ea3b959 kenney_city-kit-roads_2.2.zip
cdad90853682499b94c9fda2f87678b24bfd8f3264e0ed323f6b6a27fd7c6f6f kenney_food-kit.zip
213b522fb12bcc9b9ac66c4f7581f7c74623293272212e40a70c39936ad3da95 kenney_prototype-kit.zip
68afa4e6dc8a53942379fb47f1e84ec735d46b77bb1c1ceb968e245693dde067 kenney_furniturePack.zip
03c03163541b86691f5c35a2a87a161ea9e6d603e98e393104ca02d2176f47e6 Furniture%20pack%20Vol.2%20by%20Quaternius.zip
40b1f046227d1d7d3bc208e6dffb36803af71fa62476e371019d76860f08ce07 Car%20Pack.zip
LIST
. "$ROOT/tools/pick_python.sh"; pick_python || exit 2
rm -rf "$ROOT/public/assets/cc0.new"
"${PY[@]}" -I "$ROOT/tools/cc0_build.py" "$WORK/x" "$ROOT/public/assets/cc0.new" "$ROOT/src/fin/lib/assets.catalog.gen.ts"
cp "$ROOT/public/assets/cc0/LICENSES.md" "$ROOT/public/assets/cc0.new/" 2>/dev/null || true
rm -rf "$ROOT/public/assets/cc0"; mv "$ROOT/public/assets/cc0.new" "$ROOT/public/assets/cc0"
echo "done: public/assets/cc0 (re-run bash tools/asset_sheet.sh to check facing/scale)"
