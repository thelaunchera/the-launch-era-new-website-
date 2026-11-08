/* Havana 19 — compact inline calendar, no native iOS date control.
   Retains input#date[name=date] and original FormData/preview. No booking sent. */
(() => {
 'use strict';
 function init(){
 const form=document.getElementById('booking');
 const input=document.getElementById('date');
 if(!form||!input||input.dataset.tlcReady)return;
 const oldLabel=input.closest('label');
 if(!oldLabel)return;
 const today=new Date();
 const start=new Date(today.getFullYear(),today.getMonth(),today.getDate());
 const endMonth=(start.getFullYear()*12+start.getMonth())+18;
 let year=start.getFullYear(),month=start.getMonth();
 const es=()=>document.documentElement.lang.toLowerCase().startsWith('es');
 const iso=(y,m,d)=>[y,String(m+1).padStart(2,'0'),String(d).padStart(2,'0')].join('-');
 const dateValue=(y,m,d)=>new Date(y,m,d);
 const format=(d,long=false)=>new Intl.DateTimeFormat(es()?'es-US':'en-US',long?{weekday:'long',year:'numeric',month:'long',day:'numeric'}:{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(d);
 const field=document.createElement('div');field.className='tlc-date-field';
 const label=document.createElement('label');label.htmlFor='tlc-date-trigger';
 const sourceLabel=oldLabel.querySelector('[data-en][data-es]');
 if(sourceLabel)label.appendChild(sourceLabel);else label.textContent=es()?'Fecha':'Date';
 const trigger=document.createElement('button');
 trigger.type='button';trigger.id='tlc-date-trigger';trigger.className='tlc-date-trigger';
 trigger.setAttribute('aria-controls','tlc-date-calendar');
 trigger.setAttribute('aria-expanded','false');
 trigger.setAttribute('aria-required','true');
 trigger.innerHTML='<span class="tlc-date-text"></span><span class="tlc-date-mark" aria-hidden="true"></span>';
 const error=document.createElement('p');error.className='tlc-date-error';error.hidden=true;error.id='tlc-date-error';error.setAttribute('role','alert');
 trigger.setAttribute('aria-describedby','tlc-date-error');
 const panel=document.createElement('div');panel.className='tlc-date-calendar';panel.id='tlc-date-calendar';panel.hidden=true;
 const head=document.createElement('div');head.className='tlc-calendar-head';
 const prev=document.createElement('button');prev.type='button';prev.className='tlc-calendar-nav';prev.textContent='‹';
 const title=document.createElement('strong');title.className='tlc-calendar-title';title.setAttribute('aria-live','polite');
 const next=document.createElement('button');next.type='button';next.className='tlc-calendar-nav';next.textContent='›';
 head.append(prev,title,next);
 const weekdays=document.createElement('div');weekdays.className='tlc-calendar-weekdays';
 const days=document.createElement('div');days.className='tlc-calendar-days';days.id='tlc-calendar-days';
 const caption=document.createElement('p');caption.className='tlc-calendar-caption';
 panel.append(head,weekdays,days,caption);
 oldLabel.replaceWith(field);
 input.type='hidden';input.dataset.customDate='true';input.dataset.tlcReady='true';
 field.append(label,input,trigger,error,panel);
 function paintSelected(){
  const parts=input.value.split('-').map(Number);
  trigger.querySelector('.tlc-date-text').textContent=parts.length===3&&parts.every(Boolean)?format(dateValue(parts[0],parts[1]-1,parts[2])):(es()?'Selecciona una fecha':'Choose a date');
  trigger.dataset.selected=String(Boolean(input.value));
  prev.setAttribute('aria-label',es()?'Mes anterior':'Previous month');
  next.setAttribute('aria-label',es()?'Mes siguiente':'Next month');
  caption.textContent=es()?'Elige una fecha para ver tu solicitud. Aún no es una reserva confirmada.':'Choose a date to preview your request. This is not a confirmed reservation.';
 }
 function draw(){
  title.textContent=new Intl.DateTimeFormat(es()?'es-US':'en-US',{month:'long',year:'numeric'}).format(dateValue(year,month,1));
  const currentMonth=year*12+month;
  prev.disabled=currentMonth<=start.getFullYear()*12+start.getMonth();
  next.disabled=currentMonth>=endMonth;
  weekdays.replaceChildren();
  const base=new Date(2026,0,4);
  for(let d=0;d<7;d++){
   const node=document.createElement('span');
   node.textContent=new Intl.DateTimeFormat(es()?'es-US':'en-US',{weekday:'short'}).format(dateValue(base.getFullYear(),base.getMonth(),base.getDate()+d));
   weekdays.appendChild(node);
  }
  days.replaceChildren();
  const first=dateValue(year,month,1).getDay();
  const count=dateValue(year,month+1,0).getDate();
  for(let n=0;n<first;n++){const blank=document.createElement('span');blank.setAttribute('aria-hidden','true');days.appendChild(blank)}
  for(let d=1;d<=count;d++){
   const day=dateValue(year,month,d),key=iso(year,month,d);
   const button=document.createElement('button');button.type='button';button.textContent=String(d);
   button.dataset.day=key;button.setAttribute('aria-label',format(day,true));
   button.setAttribute('aria-pressed',String(input.value===key));
   button.disabled=day<start;
   if(day.getTime()===start.getTime())button.dataset.today='true';
   days.appendChild(button);
  }
  paintSelected();
 }
 function showError(){
  error.textContent=es()?'Selecciona una fecha para continuar.':'Please choose a date to continue.';
  error.hidden=false;trigger.setAttribute('aria-invalid','true');
 }
 function close(){panel.hidden=true;trigger.setAttribute('aria-expanded','false')}
 function open(){
  panel.hidden=false;trigger.setAttribute('aria-expanded','true');draw();
  requestAnimationFrame(()=>{
   if(panel.getBoundingClientRect().bottom>window.innerHeight-70)panel.scrollIntoView({block:'nearest',behavior:'auto'});
  });
 }
 trigger.addEventListener('click',()=>panel.hidden?open():close());
 prev.addEventListener('click',()=>{const n=dateValue(year,month-1,1);year=n.getFullYear();month=n.getMonth();draw()});
 next.addEventListener('click',()=>{const n=dateValue(year,month+1,1);year=n.getFullYear();month=n.getMonth();draw()});
 days.addEventListener('click',e=>{
  const b=e.target.closest('button[data-day]');if(!b||b.disabled)return;
  input.value=b.dataset.day;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
  error.hidden=true;trigger.removeAttribute('aria-invalid');paintSelected();close();trigger.focus({preventScroll:true});
 });
 document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!field.contains(e.target))close()});
 field.addEventListener('keydown',e=>{if(e.key==='Escape'){close();trigger.focus();e.preventDefault()}});
 const guard=e=>{
  if(input.value)return;
  e.preventDefault();e.stopImmediatePropagation();showError();open();trigger.focus({preventScroll:true});
 };
 form.addEventListener('submit',guard,true);
 form.querySelector('button[type="submit"]')?.addEventListener('click',guard,true);
 new MutationObserver(()=>{paintSelected();if(!panel.hidden)draw()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 paintSelected();draw();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
