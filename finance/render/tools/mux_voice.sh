#!/usr/bin/env bash
# mux_voice.sh <muted.mp4> <voice.wav> <out.mp4>: gain + true-peak limiter (ceiling -1.5 dBFS), iterated until the
# integrated loudness is -14 +-0.3 LUFS; AAC 256k 48 kHz, video stream copied. Prints the result's I and true peak.
set -euo pipefail
V="$1"; A="$2"; O="$3"
[ -e "$O" ] && { echo "$O exists" >&2; exit 1; }
meas(){ ffmpeg -hide_banner -i "$1" -map 0:a -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2 | awk '{print $2}' | tr '\n' ' '; }
I0=$(ffmpeg -hide_banner -i "$A" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python -c "print(round(-14.0 - ($I0), 2))")
TMP="${O%.mp4}_tmp.mp4"
for k in 1 2 3 4; do
  F="aresample=192000,volume=${G}dB,alimiter=limit=0.83:attack=4:release=60:level=disabled,aresample=48000"
  ffmpeg -v error -y -i "$V" -i "$A" -map 0:v -map 1:a -c:v copy -af "$F" -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$TMP"
  read I TP <<< "$(meas "$TMP")"
  echo "pass $k: gain ${G} dB -> I=$I LUFS, true peak=$TP dBFS"
  ok=$(python -c "print(1 if abs($I + 14.0) <= 0.3 and $TP <= -1.0 else 0)")
  [ "$ok" = 1 ] && break
  G=$(python -c "print(round($G + (-14.0 - ($I)), 2))")
done
mv "$TMP" "$O"
echo "final: I=$I LUFS, TP=$TP dBFS -> $O"
