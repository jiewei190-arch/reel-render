#!/bin/bash
# norm.sh in.wav out.wav [pre-filter]  -> two-pass loudnorm to -16 LUFS, TP -1.5, 48 kHz mono 16-bit
in=$1; out=$2; pre=${3:-anull}
m=$(ffmpeg -hide_banner -i "$in" -af "$pre,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$m" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -hide_banner -loglevel error -i "$in" -af "$pre,loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -ac 1 -c:a pcm_s16le "$out"
