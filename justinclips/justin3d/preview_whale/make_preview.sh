#!/bin/bash
# Rebuild preview_exploding_whale.mp4: renders the 4 reaction clips (RGBA) and composites them.
# usage: preview_whale/make_preview.sh path/to/exploding-whale/video.mp4
set -e
cd "$(dirname "$0")"
BASE=${1:?base video}
for k in A_doubletake B_brows C_cringe D_smirk; do
  python3 ../render_justin.py --seq $k.json --bg transparent --res 720x960 --samples 24 --jobs 3 \
      --out /tmp/justin_$k.mov --keep frames_${k%%_*}
done
python3 ../compose_preview.py "$BASE" ../preview_exploding_whale.mp4 plan.json
