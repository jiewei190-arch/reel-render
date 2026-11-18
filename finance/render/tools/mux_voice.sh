#!/usr/bin/env bash
# Mux a Short's voice onto its silent render at -14 LUFS integrated, true peak <= -1 dBTP: a soft peak limiter + loudnorm
# (two-pass, measured), then one measured gain trim so the final AAC lands on -14.0 +/- 0.2 (references/render.md).
# Video stream copied, AAC 256k 48 kHz, +faststart. Never overwrites.
#   usage: bash tools/mux_voice.sh <video.mp4> <voice.wav> <out.mp4>
set -euo pipefail
V="${1:?video}"; A="${2:?voice wav}"; O="${3:?out}"
[ -e "$O" ] && { echo "$O exists: pick a new name" >&2; exit 1; }
TMP="${O%.mp4}.tmp.wav"
PRE="alimiter=limit=0.5:attack=2:release=60:level=false"
J=$(ffmpeg -hide_banner -nostats -i "$A" -af "$PRE,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed -E 's/.*: "?([^",]*)"?,?/\1/' | tr -d '\r'; }
ffmpeg -v error -y -i "$A" -af "$PRE,loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=false,aresample=48000" "$TMP"
I1=$(ffmpeg -hide_banner -nostats -i "$TMP" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
TRIM=$(python3 -c "print(round(-14.0 - float('$I1'), 2))")
for k in 1 2 3; do   # the limiter eats a little of the trim: measure and correct
  I2=$(ffmpeg -hide_banner -nostats -i "$TMP" -af "volume=${TRIM}dB,alimiter=limit=0.79:level=false,ebur128" -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
  TRIM=$(python3 -c "print(round($TRIM + (-14.0 - float('$I2')), 2))")
done
ffmpeg -v error -n -i "$V" -i "$TMP" -map 0:v:0 -map 1:a:0 -c:v copy -af "volume=${TRIM}dB,alimiter=limit=0.79:level=false" \
  -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$O"
rm -f "$TMP"
echo "trim ${TRIM} dB"
ffmpeg -hide_banner -nostats -i "$O" -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
echo "$O"
