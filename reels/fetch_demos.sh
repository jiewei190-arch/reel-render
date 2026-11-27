#!/bin/bash
# Download the owner's template demo videos (#13-#19 and #21-#29 have no source code, only an X post; keys t21..t29 = templates #21..#29) into
# /home/claude/styles-src/demo-videos/demo<id>.mp4 and make a 12-frame sheet<id>.jpg of each.
# Uses the public fxtwitter API to resolve the video URL. Usage: reels/fetch_demos.sh [id ...]
set -e
D=/home/claude/styles-src/demo-videos; mkdir -p $D; cd $D
declare -A POST=([78]=2103697580421181894 [80]=2103500011581440008 [83]=2103517930424332386 [99]=2103054730054517244 [101]=2103678647777230877 [102]=2103985505302163640 [115]=2103103836541899031 [t21]=2102743212922384673 [t22]=2102867033100616097 [t23]=2103418429248069973 [t24]=2103206689755316718 [t25]=2103793821012345137 [t26]=2103516101518987439 [t27]=2103832142245708192 [t28]=2102592355165782312 [t29]=2103541149709615243)
for id in ${@:-${!POST[@]}}; do
  [ -f demo$id.mp4 ] || { u=$(curl -sS -m 30 https://api.fxtwitter.com/status/${POST[$id]} | python3 -c "
import json,sys;v=json.load(sys.stdin)['tweet']['media']['videos'];print(max(v,key=lambda x:x['width']*x['height'])['url'])"); curl -sSL -m 300 -o demo$id.mp4 "$u"; }
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 demo$id.mp4)
  ffmpeg -v error -y -i demo$id.mp4 -vf "fps=12/$d,scale=320:-2,tile=4x3" -frames:v 1 sheet$id.jpg; echo "demo$id ${d}s"
done
