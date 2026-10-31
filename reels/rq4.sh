#!/bin/sh
# 4-chunk render (use only on a 4+ CPU machine). usage: rq4.sh <name> <basePort> [VW VH]
cd "$(dirname "$0")"
n=$1; P=$2; export VW=${3:-540} VH=${4:-960}
N=$(python3 -c "import json;s=open('tl_$n.js').read();print(int(json.loads(s[s.index('=')+1:].rstrip().rstrip(';'))['total']*30))")
Q=$((N/4)); rm -rf frames/$n
for i in 0 1 2 3; do a=$((i*Q)); z=$(( i==3 ? N : (i+1)*Q )); PORT=$((P+i)) python3 -I render.py $n frames $a $z > r_${n}$i.log 2>&1 & done
wait
python3 -I tools.py assemble $n > asm_$n.log 2>&1
touch $n.done
