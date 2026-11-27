#!/bin/sh
# Full build for one long-form video. Needs GEMINI_API_KEY for the images.
#   sh make.sh teeth            (voice -> Gemini images -> render -> mix -> out/final.mp4)
set -e; cd "$(dirname "$0")"; n=$1
[ -f $n/vo.wav ] || python3 -I voice.py $n
python3 -I gen_images.py $n
node render.js $n video 4 30 --img
python3 -I mix.py $n
ls -la $n/out/final.mp4
