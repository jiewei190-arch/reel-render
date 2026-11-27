import csv,io,subprocess,sys
p=sys.argv[1]; key=sys.argv[2].split(','); col=sys.argv[3]
up=list(csv.DictReader(io.StringIO(subprocess.check_output(['git','show',':2:'+p]).decode())))
mine=list(csv.DictReader(io.StringIO(subprocess.check_output(['git','show',':3:'+p]).decode())))
mm={tuple(r[k] for k in key):r for r in mine}
n=0
for r in up:
    m=mm.get(tuple(r[k] for k in key))
    if m and m[col].startswith('scheduled') and m[col]!=r[col]: r[col]=m[col]; n+=1
f=list(up[0].keys()); w=csv.DictWriter(open(p,'w',newline=''),fieldnames=f,lineterminator='\n'); w.writeheader(); w.writerows(up)
print(p,'applied',n)
