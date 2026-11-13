#!/bin/bash
# Build all_samples.mp4: black 1080x1920, big label per sample, 1 s silence between.
set -e
V=/home/user/reel-render/voice_test; T=${TMPDIR:-/tmp}/vt_mp4; rm -rf $T; mkdir -p $T
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
declare -a S=("A_current.wav|A|Kokoro fenrir (now)" "B1_kokoro-am_michael.wav|B1|Kokoro michael" "B2_kokoro-bm_george.wav|B2|Kokoro george (UK)"
 "C_kokoro-prosody.wav|C|Kokoro michael + pacing" "D1_chatterbox.wav|D1|Chatterbox" "D2_chatterbox-deadpan.wav|D2|Chatterbox deadpan"
 "E1_chatterbox-turbo-female.wav|E1|Chatterbox Turbo (female)")
i=0; : > $T/list.txt
for s in "${S[@]}"; do IFS='|' read f lab sub <<< "$s"
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $V/$f); D=$(python3 -c "print($d+1.0)")
  ffmpeg -y -loglevel error -f lavfi -i color=black:s=1080x1920:r=30 -i $V/$f -filter_complex \
   "[0]drawtext=fontfile=$FONT:text='$lab':fontsize=520:fontcolor=white:x=(w-tw)/2:y=(h-th)/2-150,drawtext=fontfile=$FONT:text='$sub':fontsize=64:fontcolor=0xBBBBBB:x=(w-tw)/2:y=h/2+300[v];[1]aresample=48000,apad=whole_dur=$D[a]" \
   -map "[v]" -map "[a]" -t $D -c:v libx264 -preset veryfast -crf 28 -pix_fmt yuv420p -c:a aac -b:a 160k -ac 1 $T/$i.mp4
  echo "file '$T/$i.mp4'" >> $T/list.txt; i=$((i+1)); done
ffmpeg -y -loglevel error -f concat -safe 0 -i $T/list.txt -c copy -movflags +faststart $V/all_samples.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 $V/all_samples.mp4
