import json,sys
D=sys.argv[0].rsplit('/',1)[0]
d={r['reel']:r for r in json.load(open(D+'/ttall.json'))}
r=d[sys.argv[1]]; T=717867438; mode=sys.argv[2]
mon={'10':'October','11':'November'}[r['date'][5:7]]; HH,MM=r['time'].split(':'); DAY=str(int(r['date'][8:]))
dlabel=f"{mon[:3]} {DAY}, 2026"
def js(t): return {"name":"javascript_tool","input":{"action":"javascript_exec","tabId":T,"text":t}}
def w(s): return {"name":"computer","input":{"action":"wait","duration":s,"tabId":T}}
if mode=='a':
  ref=sys.argv[3]
  A=[{"name":"navigate","input":{"url":"https://www.tiktok.com/tiktokstudio/upload","tabId":T}},w(3),{"name":"find","input":{"query":"video file input","tabId":T}},{"name":"file_upload","input":{"ref":ref,"paths":[f"/mnt/user-data/uploads/ep/{r['reel']}_ep.mp4"],"tabId":T}},w(8),
  js("const e=document.querySelector('[contenteditable=true]'); e.focus(); const r=document.createRange(); r.selectNodeContents(e); const s=getSelection(); s.removeAllRanges(); s.addRange(r); document.activeElement===e"),
  {"name":"computer","input":{"action":"key","text":"Delete","tabId":T}},
  {"name":"computer","input":{"action":"type","text":r['body'].rstrip('\n')+'\n',"tabId":T}}]
  for t in r['tags']:
    A+=[{"name":"computer","input":{"action":"type","text":t,"tabId":T}},w(2),{"name":"computer","input":{"action":"key","text":"Return","tabId":T}},w(1)]
  A+=[js("const e=document.querySelector('[contenteditable=true]'); JSON.stringify({start:e.innerText.slice(0,25), tags:[...e.querySelectorAll('*')].filter(x=>x.children.length===0&&/^#/.test(x.innerText.trim())).map(x=>x.innerText.trim())})"),
  js("const c=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.innerText?.trim()==='Edit cover'); c.scrollIntoView({block:'center'}); c.click(); !!c"),w(3),
  {"name":"find","input":{"query":"image file input for cover upload","tabId":T}}]
else:
  ref=sys.argv[3]
  sj=open(D+'/sched.js').read().replace('@MON',mon).replace('@DAY',DAY).replace('@HH',HH).replace('@MM',MM)
  tags=json.dumps(r['tags']); start=f"Ep. {int(r['ep']):02d} · "
  ver=f"""const sl=ms=>new Promise(r=>setTimeout(r,ms));
let el=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.innerText?.trim()==='AI-generated content'); let n=el, cb=null; for(let i=0;i<6&&!cb;i++){{n=n.parentElement; cb=n.querySelector('input[type=checkbox]');}}
if(!cb.checked){{cb.click(); await sl(1200);}}
const e=document.querySelector('[contenteditable=true]'); const tg=[...e.querySelectorAll('*')].filter(x=>x.children.length===0&&/^#/.test(x.innerText.trim())).map(x=>x.innerText.trim());
const cbs=[...document.querySelectorAll('[role=combobox]')].map(c=>c.innerText.trim());
const st={{start:e.innerText.startsWith({json.dumps(start)}), tags:JSON.stringify(tg)===JSON.stringify({tags}), date:cbs.includes({json.dumps(dlabel)}), time:cbs.includes({json.dumps(r['time'])}), radio:document.querySelector('input[type=radio][value=schedule]').checked, ai:cb.checked, cover:!!document.querySelector('img[src^=blob], img[src^=data]'), dlg:[...document.querySelectorAll('[role=dialog]')].length}};
const ok=st.start&&st.tags&&st.date&&st.time&&st.radio&&st.ai&&st.cover;
if(ok){{const b=[...document.querySelectorAll('button')].filter(b=>b.innerText.trim()==='Schedule').pop(); b.click(); st.clicked=true;}}
JSON.stringify(st)"""
  A=[{"name":"file_upload","input":{"ref":ref,"paths":[f"/mnt/user-data/uploads/ep/thumb_{r['reel']}.jpg"],"tabId":T}},w(3),
  js("const b=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='Save'); b?b.click():null; !!b"),w(3),
  js(sj),{"name":"computer","input":{"action":"key","text":"Tab","tabId":T}},w(1),js(ver),w(8),js("location.href")]
  if len(sys.argv)>4:
    A+=[{"name":"navigate","input":{"url":"https://www.tiktok.com/tiktokstudio/upload","tabId":T}},w(3),{"name":"find","input":{"query":"video file input","tabId":T}}]
print(json.dumps(A,ensure_ascii=False))
