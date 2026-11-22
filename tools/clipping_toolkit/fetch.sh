#!/usr/bin/env bash
# Re-download the clipping toolkit at the pinned commits. Usage: fetch.sh [target-dir] [--latest]
set -u
here="$(cd "$(dirname "$0")" && pwd)"; dest="${1:-$HOME/clipping-toolkit}"; latest=0
for a in "$@"; do [ "$a" = "--latest" ] && latest=1; done
[ "$dest" = "--latest" ] && dest="$HOME/clipping-toolkit"
mkdir -p "$dest"; ok=0; bad=0
while read -r repo sha; do
  case "$repo" in ''|\#*) continue;; esac
  dir="$dest/${repo//\//_}"
  if [ ! -d "$dir/.git" ]; then git init -q "$dir" && git -C "$dir" remote add origin "https://github.com/$repo.git"; fi
  if [ $latest = 1 ]; then ref=HEAD; else ref=$sha; fi
  if git -C "$dir" fetch -q --depth 1 origin "$ref" && git -C "$dir" checkout -q --force FETCH_HEAD; then
    echo "ok   $repo"; ok=$((ok+1)); else echo "FAIL $repo"; bad=$((bad+1)); fi
done < "$here/repos.txt"
echo "$ok ok, $bad failed -> $dest"
