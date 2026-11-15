const MON='@MON', DAY='@DAY', HH='@HH', MM='@MM';
const sl=ms=>new Promise(r=>setTimeout(r,ms)); const log=[];
const rs=document.querySelector('input[type=radio][value=schedule]'); if(!rs.checked){rs.closest('label')?rs.closest('label').click():rs.click(); await sl(1200);}
if([...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='Allow')) log.push('CONSENT-DIALOG');
const sm=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&e.innerText&&e.innerText.trim()==='Show more'); if(sm){sm.click(); await sl(800);}
const cbs=()=>[...document.querySelectorAll('[role=combobox]')];
for(let k=0;k<3 && !document.querySelector('.DatePicker__titleMonth');k++){const dcb=cbs().find(c=>/^[A-Z][a-z]{2} \d+, \d{4}$/.test(c.innerText.trim())); dcb.scrollIntoView({block:'center'}); dcb.click(); await sl(900);}
for(let i=0;i<3;i++){const m=document.querySelector('.DatePicker__titleMonth')?.innerText.trim(); if(m===MON) break; const navs=[...document.querySelectorAll('.DatePicker__nav')]; navs[navs.length-1].dispatchEvent(new MouseEvent('click',{bubbles:true})); await sl(700);}
log.push('month:'+document.querySelector('.DatePicker__titleMonth')?.innerText.trim());
if(document.querySelector('.DatePicker__titleMonth')?.innerText.trim()===MON){const day=[...document.querySelectorAll('button.DatePicker__day')].find(b=>b.innerText.trim()===DAY&&!b.disabled); if(day){day.click(); log.push('day ok')} else log.push('DAY MISSING/DISABLED'); await sl(700);
const tcb=cbs().find(c=>/^\d\d:\d\d$/.test(c.innerText.trim())); tcb.click(); await sl(700);
for(const l of ['Hours '+HH,'Minutes '+MM]){const b=document.querySelector(`button[aria-label="${l}"]`); if(b){b.scrollIntoView({block:'center'}); b.click(); await sl(600); log.push(l+' ok')} else log.push(l+' missing')}}
log.push('radio:'+[...document.querySelectorAll('input[type=radio]')].map(r=>r.value+':'+r.checked).join(','));
log.join(' | ')
