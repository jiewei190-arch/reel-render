#!/usr/bin/env bash
# Copy each Short's generated plan into the render project (finance/render/src/shorts/<slug>/plan.gen.ts) and its voice
# into finance/render/public/vo/<slug>.wav. Run after plan/plan_src.py.
set -euo pipefail
F="$(cd "$(dirname "$0")/.." && pwd)"
for d in "$F"/shorts/*/; do
  s=$(basename "$d")
  mkdir -p "$F/render/src/shorts/$s" "$F/render/public/vo"
  cp "$d/src/plan.gen.ts" "$F/render/src/shorts/$s/plan.gen.ts"
  cp "$d/voice.wav" "$F/render/public/vo/$s.wav"
  echo "synced $s"
done
