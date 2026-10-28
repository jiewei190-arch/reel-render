#!/bin/sh
# 2-pass encode to fit under ~9.6 MB for upload
cd "$(dirname "$0")"
n=$1
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/$n.mp4)
VB=$(python3 -c "print(int((9.6*8*1e6/$D - 72000)/1000))")
ffmpeg -v error -y -i out/$n.mp4 -c:v libx264 -preset slow -tune animation -b:v ${VB}k -pass 1 -passlogfile /tmp/p_$n -an -f mp4 /dev/null
ffmpeg -v error -y -i out/$n.mp4 -c:v libx264 -preset slow -tune animation -b:v ${VB}k -pass 2 -passlogfile /tmp/p_$n -af alimiter=limit=0.79:level=false:latency=true -c:a aac -b:a 72k -movflags +faststart up/${n}_tmp.mp4
mv up/${n}_tmp.mp4 up/$n.mp4
echo $n $VB $(stat -c %s up/$n.mp4) >> enc_hq.log
