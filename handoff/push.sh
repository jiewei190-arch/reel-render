#!/bin/sh
# Main session: push the handoff branch; if the PC session pushed first, merge and auto-resolve schedule_batchN.csv.
# Usage: sh handoff/push.sh
cd "$(dirname "$0")/.." || exit 1
B=claude/reel-studio-handoff-f70dcj
git push -q origin $B 2>/dev/null && { echo pushed; exit 0; }
git pull -q --no-rebase origin $B
if git diff --name-only --diff-filter=U | grep -q handoff/schedule_batchN.csv; then
  python3 -I handoff/merge_schedule.py && git add handoff/schedule_batchN.csv
fi
if [ -n "$(git diff --name-only --diff-filter=U)" ]; then echo "unresolved conflicts:"; git diff --name-only --diff-filter=U; exit 1; fi
git diff --cached --quiet || git commit -qm "Merge PC-session schedule statuses"
git push -q origin $B && echo pushed
