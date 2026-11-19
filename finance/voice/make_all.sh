#!/usr/bin/env bash
# Render every Short's voice with the D2 narrator (Chatterbox, exaggeration 0.3, cfg 0.3) at Shorts pacing.
# Usage: bash finance/voice/make_all.sh [slug ...]   (from the repo root; default: every finance/shorts/*)
set -euo pipefail
PY=${PY:-$HOME/.venvs/chatterbox/bin/python}
cd "$(dirname "$0")/.."
slugs=("$@"); [ ${#slugs[@]} -eq 0 ] && slugs=($(ls shorts))
for s in "${slugs[@]}"; do
  d=shorts/$s
  echo "== $s"
  "$PY" voice/chatterbox_d2.py "$d/vo/narration.md" "$d/voice.wav" "$d/script.txt" --gap 0.3 --comma 0.15 --lead 0.15
done
