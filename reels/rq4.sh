#!/bin/sh
# rq4.sh: like rq.sh but four render workers (ports $2..$2+3)
cd "$(dirname "$0")"
n=$1; P=$2
N=$(python3 -c "import json;s=open('tl_$n.js').read();print(int(json.loads(s[s.index('=')+1:].rstrip().rstrip(';'))['total']*30))")
Q=$((N/4)); rm -rf frames/$n
for k in 0 1 2 3; do a=$((k*Q)); b=$(( k==3 ? N : (k+1)*Q )); PORT=$((P+k)) python3 -I render.py $n frames $a $b > r_${n}$k.log 2>&1 & done
wait
python3 -I tools.py assemble $n > asm_$n.log 2>&1
touch $n.done
