#!/usr/bin/env bash
# rebuild.sh: ONE command that re-voices and re-renders a Justin clips Short end to end.
#
#   bash justinclips/tools/revoice/rebuild.sh <slug> [--engine chatterbox_d2 | --engine files --dir /path/to/line_wavs] [--no-voice] [--sheet-only] [--workers 4]
#
# Source of truth (in justinclips/shorts/<slug>/project/): lines.json (the per-line script), story/shots.plan.json
# (every shot anchored to a line/word, never to a time), scenes/*.js (scene code; word-synced FX use the words timeline).
# Steps: copy project into the Toon 3D kit -> voice (voice.py) -> word alignment (kit tools/transcribe.py)
# -> shot timing from the voice (retime.py) -> render -> mix (music + SFX, -14 LUFS) -> mux -> loudness/TP check
# -> video.mp4, video.sha256, contact_sheet.png, and the regenerated voice/timeline/shots copied back into project/.
#
# Env: KIT = whatif/aitrends-2d-studio of an origin/iawaken/toon3d-fx checkout with `npm install` done
#      VPY = python of the Chatterbox venv (whatif/voice/setup_chatterbox.sh on origin/voice-test; default ~/.venvs/chatterbox)
#      CHROMIUM_PATH (Linux cloud: /opt/pw-browsers/chromium). On the owner's PC add --gl gpu via RENDER_ARGS="--gl gpu".
set -euo pipefail
SLUG=${1:?usage: rebuild.sh <slug> [--engine E] [--dir D] [--no-voice]}; shift
ENGINE=chatterbox_d2; DIR=""; VOICE=1; SHEET=0; WORKERS=${WORKERS:-4}
while [ $# -gt 0 ]; do case "$1" in
  --engine) ENGINE=$2; shift 2;; --dir) DIR=$(realpath "$2"); shift 2;; --no-voice) VOICE=0; shift;; --sheet-only) SHEET=1; shift;; --workers) WORKERS=$2; shift 2;;
  *) echo "unknown arg $1"; exit 1;; esac; done
HERE=$(cd "$(dirname "$0")" && pwd); REPO=$(cd "$HERE/../../.." && pwd)
SHORT="$REPO/justinclips/shorts/$SLUG"; SRC="$SHORT/project"
KIT=${KIT:?set KIT to the toon3d-fx kit folder (.../whatif/aitrends-2d-studio)}; KIT=$(realpath "$KIT")
VPY=${VPY:-$HOME/.venvs/chatterbox/bin/python}
PJ="$KIT/projects/$SLUG"
[ -f "$SRC/lines.json" ] || { echo "no $SRC/lines.json"; exit 1; }

echo "== 1/7 copy project -> $PJ"
mkdir -p "$PJ"; cp -r "$SRC/." "$PJ/"
if [ $VOICE = 1 ]; then
  echo "== 2/7 voice ($ENGINE)"
  "$VPY" "$HERE/voice.py" --project "$PJ" --engine "$ENGINE" ${DIR:+--dir "$DIR"}
fi
echo "== 3/7 word timings"
(cd "$KIT" && "$VPY" tools/transcribe.py --project "projects/$SLUG" --script "projects/$SLUG/input/script.txt" --lang en --model small | tail -3)
echo "== 4/7 shot timing from the voice"
"$VPY" "$HERE/retime.py" --project "$PJ"
# generated files (voice, word timings, shots.json, duration) go back into the repo project right away
copy_back() {
mkdir -p "$SRC/input" "$SRC/timeline" "$SRC/story"
  cp "$PJ/input/voiceover.wav" "$PJ/input/voiceover.lines.json" "$PJ/input/script.txt" "$SRC/input/"
  cp "$PJ/timeline/"* "$SRC/timeline/"; cp "$PJ/story/shots.json" "$SRC/story/"; cp "$PJ/config.json" "$SRC/"
}
copy_back
cd "$KIT"
if [ $SHEET = 1 ]; then node render.mjs --project "projects/$SLUG" --sheet --scale 0.4 | tail -1; exit 0; fi
echo "== 5/7 render"
node render.mjs --project "projects/$SLUG" --out "projects/$SLUG/build/video_silent.mp4" --workers "$WORKERS" ${RENDER_ARGS:-}
node render.mjs --project "projects/$SLUG" --sheet --scale 0.4 >/dev/null
echo "== 6/7 mix"
"$VPY" audio/mix.py --project "projects/$SLUG" >/dev/null
ffmpeg -y -v error -i "$PJ/build/video_silent.mp4" -i "$PJ/build/mix.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart "$SHORT/video.mp4"
echo "== 7/7 check + deliverables"
ffmpeg -nostats -i "$SHORT/video.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -A16 "Summary" | grep -E "I:|Peak:" | tee "$PJ/build/loudness.txt"
FR=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$SHORT/video.mp4")
echo "frames: $FR  duration: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SHORT/video.mp4") s"
(cd "$SHORT" && sha256sum video.mp4 > video.sha256)
cp "$PJ/build/sheets/sheet_01.png" "$SHORT/contact_sheet.png" 2>/dev/null || true
copy_back
echo "done: $SHORT/video.mp4 (remember: git add -f project/input/voiceover.wav; *.wav is gitignored)"
