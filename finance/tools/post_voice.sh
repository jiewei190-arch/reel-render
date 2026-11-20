#!/usr/bin/env bash
# After a Short's voice.wav + script.txt exist: Whisper word check, word timings, plan step, script.md.
# Usage (repo root): bash finance/tools/post_voice.sh <slug> [...]
set -euo pipefail
PY=${PY:-$HOME/.venvs/chatterbox/bin/python}   # any Python with faster-whisper
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
for s in "$@"; do
  d=$ROOT/finance/shorts/$s
  "$PY" "$ROOT/finance/tools/verify_words.py" "$d" 2>&1 | grep -v -i warn || true
  (cd "$d" && "$PY" "$ROOT/skills/blocky-shorts/template/vo/transcribe.py" voice.wav script.txt vo/timings.json 2>&1 | grep -v -i warn | tail -12)
  (cd "$d" && python3 plan/plan_src.py vo/timings.json)
  python3 "$ROOT/finance/tools/make_script_md.py" "$d"
done
