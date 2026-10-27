#!/bin/sh
cd "$(dirname "$0")"
n=$1
N=$(python3 -c "import json;s=open('tl_$n.js').read();print(int(json.loads(s[s.index('=')+1:].rstrip().rstrip(';'))['total']*30))")
H=$((N/2)); rm -rf frames/$n
PORT=$2 python3 -I render.py $n frames 0 $H > r_${n}1.log 2>&1 &
PORT=$3 python3 -I render.py $n frames $H $N > r_${n}2.log 2>&1 &
wait
python3 -I tools.py assemble $n > asm_$n.log 2>&1
touch $n.done
