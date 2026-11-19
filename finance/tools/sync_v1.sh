#!/usr/bin/env bash
# FORMAT v1: copy a Short's plan into render-pc as src/shorts/<slug_>_v1.plan.gen.ts (the F1/F2 plan files stay for the
# older compositions). minimum-payment-trap predates this and uses minimum_payment_trap.plan.gen.ts.
#   usage: bash finance/tools/sync_v1.sh <slug> [...]
set -euo pipefail
F="$(cd "$(dirname "$0")/.." && pwd)"
for s in "$@"; do cp "$F/shorts/$s/src/plan.gen.ts" "$F/render-pc/src/shorts/${s//-/_}_v1.plan.gen.ts"; echo "synced $s (v1)"; done
