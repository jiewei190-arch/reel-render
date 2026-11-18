#!/usr/bin/env bash
# usage: tools/pushshort.sh <slug> <voiced.mp4> <shots.jpg> <notes.md>
set -euo pipefail
SLUG="$1"; W=/c/Users/jiewe/rr-f1-helper; D="$W/finance/shorts/$SLUG"
git -C $W fetch -q origin finance/f1 && git -C $W pull -q --rebase origin finance/f1
cp "$2" "$D/video.mp4"; (cd "$D" && sha256sum video.mp4 > video.sha256)
ffmpeg -v error -y -i "$3" "$D/contact_sheet.png"
cp "$4" "$D/RENDER_NOTES.md"
git -C $W add "finance/shorts/$SLUG/video.mp4" "finance/shorts/$SLUG/video.sha256" "finance/shorts/$SLUG/contact_sheet.png" "finance/shorts/$SLUG/RENDER_NOTES.md"
git -C $W commit -q -m "finance F1: $SLUG rendered (voiced video, contact sheet, render notes)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -C $W push -q origin HEAD:finance/f1
git -C $W rev-parse HEAD
