# usage: mark2.py platform reel "YYYY-MM-DD HH:MM" ...  (updates schedule_tt_yt.csv + tracking.csv + yt_schedule.csv for youtube)
import csv,sys,json
plat=sys.argv[1]; pairs=list(zip(sys.argv[2::2],sys.argv[3::2]))
def rw(p,fn):
    rows=list(csv.DictReader(open(p,newline=''))); f=list(rows[0].keys()); fn(rows,f)
    w=csv.DictWriter(open(p,'w',newline=''),fieldnames=f,lineterminator='\n'); w.writeheader(); w.writerows(rows)
def a(rows,f):
    for r,w in pairs:
        h=[x for x in rows if x['reel']==r and x['platform']==plat]
        if not h: continue
        h[0]['status']=f'scheduled {w} ET'
[rw(P,a) for P in ['handoff/schedule_tt_yt.csv','handoff/schedule_batchN.csv'] if any(x for x in csv.DictReader(open(P)) if (x['reel'],x['platform']) in {(r,plat) for r,_ in pairs})]
def b(rows,f):
    for r,w in pairs:
        h=[x for x in rows if x['topic']==r]
        if not h: rows.append({k:'' for k in f}|{'topic':r}); h=[rows[-1]]
        x=h[0]; cur=x['scheduled'] if x['scheduled'].startswith('scheduled') else ''
        parts=[s for s in cur.replace('scheduled ','',1).split('; ') if s and not s.startswith(plat)]
        parts.append(f'{plat} {w} ET'); x['scheduled']='scheduled '+'; '.join(parts)
rw('handoff/tracking.csv',b)
if plat=='youtube':
    m={}
    for fn in ['handoff/yt/meta_halloween.json','handoff/yt/meta4.json']:
        for e in json.load(open(fn)): m[e['id']]=e
    for k,v in json.load(open('/tmp/claude-0/-home-claude/f9aff4e9-a8f2-5b8c-8969-0529894ecbcb/scratchpad/yt.json')).items(): m.setdefault(k,v)
    with open('handoff/yt/yt_schedule.csv','a') as fh:
        wr=csv.writer(fh,lineterminator='\r\n')
        for r,w in pairs: wr.writerow([r,m[r]['title'],w[:10],w[11:],'yes','yes'])
print('marked',plat,pairs)
