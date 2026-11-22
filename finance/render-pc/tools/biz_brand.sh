#!/usr/bin/env bash
# Channel branding for "Billion Dollar Blunders" from the biz3d kit (src/biz/brand.tsx), full size, no motion blur:
#   pfp.png 800x800, banner.png 2560x1440, preview_phone.png (banner safe area at 1080 wide),
#   preview_circle.png (pfp circle-masked at 98 px and 240 px).
#   bash tools/biz_brand.sh            (from finance/render-pc)
set -euo pipefail
OUT=../../branding/billion-dollar-blunders
mkdir -p "$OUT"
npx remotion still src/index.biz.ts BizBrandPfp "$OUT/pfp.png" --frame=30 --gl=swangle
npx remotion still src/index.biz.ts BizBrandBanner "$OUT/banner.png" --frame=30 --gl=swangle
python3 tools/biz_brand_previews.py "$OUT"
