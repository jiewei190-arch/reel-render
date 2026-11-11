import json,sys,csv
S='/tmp/claude-0/-home-claude/f9aff4e9-a8f2-5b8c-8969-0529894ecbcb/scratchpad/'
y=json.load(open(S+'yt.json')); r=sys.argv[1]; T=717867438
rows={}
for f in ['handoff/schedule_tt_yt.csv','handoff/schedule_batchN.csv']:
  for x in csv.DictReader(open('/home/claude/reel-render/'+f)):
    if x['platform']=='youtube': rows[x['reel']]=x
x=rows[r]; d=x['date_ET']; hh,mm=map(int,x['time_ET'].split(':'))
import datetime; dt=datetime.date.fromisoformat(d)
dlabel=dt.strftime('%b ')+str(dt.day)+dt.strftime(', %Y')
mlabel=dt.strftime('%b %Y').upper()
tlabel=f"{(hh-1)%12+1}:{mm:02d} {'PM' if hh>=12 else 'AM'}"
meta=y[r]
fill=f"""const sl=ms=>new Promise(r=>setTimeout(r,ms));
const tb=document.querySelectorAll('#textbox');
async function put(el,txt){{el.focus(); const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('insertText',false,txt); await sl(500);}}
await put(tb[0],{json.dumps(meta['title'],ensure_ascii=False)}); await put(tb[1],{json.dumps(meta['desc'].rstrip(),ensure_ascii=False)});
const lim=/Daily upload limit/.test(document.body.innerText);
JSON.stringify({{lim,title:tb[0].innerText,dlen:tb[1].innerText.length}})"""
sched=f"""const sl=ms=>new Promise(r=>setTimeout(r,ms)); const nz=s=>s.replace(/[\\s\\u202f\\u00a0]+/g,' ').trim(); const log=[];
const k=document.querySelector('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]'); k.scrollIntoView({{block:'center'}}); k.click(); await sl(800); log.push('kids:'+k.hasAttribute('checked'));
for(let i=0;i<3;i++){{document.querySelector('#next-button').click(); await sl(1500);}}
document.querySelector('#second-container-expand-button').click(); await sl(1200);
const want={json.dumps(dlabel)};
let dp=()=>nz(document.querySelector('ytcp-datetime-picker').innerText);
if(!dp().startsWith(want)){{ document.querySelector('ytcp-datetime-picker #datepicker-trigger').click(); await sl(1200);
 const cal=[...document.querySelectorAll('ytcp-scrollable-calendar')].find(e=>e.offsetParent); let cur=null,tg=null;
 for(const e of cal.querySelectorAll('*')){{ if(e.children.length) continue; const t=e.innerText?.trim()||''; if(/^[A-Z]{{3}} \\d{{4}}$/i.test(t)) cur=t.toUpperCase(); else if(cur==={json.dumps(mlabel)} && t==={json.dumps(str(dt.day))} && /calendar-day/.test(e.className)){{tg=e;break;}} }}
 if(tg){{tg.scrollIntoView({{block:'center'}}); tg.click(); await sl(1200);}} else log.push('no day cell');}}
log.push('date:'+dp());
const ti=document.querySelector('ytcp-datetime-picker input'); ti.click(); await sl(900);
const it=[...document.querySelectorAll('tp-yt-paper-item')].filter(i=>i.offsetParent).find(i=>nz(i.innerText)==={json.dumps(tlabel)}); if(it){{it.scrollIntoView({{block:'center'}}); it.click();}} await sl(800);
const tm=nz(document.querySelector('ytcp-datetime-picker input').value); log.push('time:'+tm);
const thumbOk=!!document.querySelector('ytcp-thumbnails-compact-editor-uploader img[src^="data:"], #still-picker img[src^="data:"]')||true;
if(dp().startsWith(want)&&tm==={json.dumps(tlabel)}&&k.hasAttribute('checked')){{document.querySelector('#done-button').click(); await sl(9000); for(let w=0;w<4&&!/Video (scheduled|published|processing)/.test(document.body.innerText);w++) await sl(4000); const t=nz(document.body.innerText); log.push((t.match(/Video (scheduled|published|processing)[^.]{{0,70}}/)||['NO-CONFIRM'])[0]);}} else log.push('NOT SUBMITTED');
log.push('limit:'+/Daily upload limit/.test(document.body.innerText));
log.join(' | ')"""
A=[{"name":"navigate","input":{"url":"https://studio.youtube.com/channel/UCiJOc9tuplY-Vo1uT636TJw/videos/upload?d=ud","tabId":T}},
{"name":"computer","input":{"action":"wait","duration":5,"tabId":T}},
{"name":"find","input":{"query":"file input for video upload","tabId":T}},
{"name":"file_upload","input":{"ref":"ref_199","paths":[f"/mnt/user-data/uploads/ep/{r}_ep.mp4"],"tabId":T}},
{"name":"computer","input":{"action":"wait","duration":8,"tabId":T}},
{"name":"javascript_tool","input":{"action":"javascript_exec","tabId":T,"text":fill}},
{"name":"find","input":{"query":"thumbnail upload file input","tabId":T}},
{"name":"file_upload","input":{"ref":"ref_313","paths":[f"/mnt/user-data/uploads/ep/thumb_{r}.jpg"],"tabId":T}},
{"name":"computer","input":{"action":"wait","duration":4,"tabId":T}},
{"name":"javascript_tool","input":{"action":"javascript_exec","tabId":T,"text":sched}}]
print(json.dumps(A,ensure_ascii=False).replace("ref_199","ref_198").replace("ref_313","ref_312"))
