#!/usr/bin/env bash
# Numeric framing / lens / facing / overlap checks for every finance Short (no rendering). Exit 1 on any FAIL.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
mkdir -p out
npx --no-install esbuild tools/fin_checks.ts --bundle --platform=node --format=esm --outfile=out/fin_checks.mjs --log-level=error --loader:.png=empty --define:process.env.NODE_ENV='"production"'
node out/fin_checks.mjs | tee out/fin_checks.txt
