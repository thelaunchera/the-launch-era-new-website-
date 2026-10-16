/* TLE v50 — fictional public residential booking UX. No backend/checkout actions.
 * Keeps the original #date/#time fields and reviewResidential/submitResidential path.
 */
(()=>{
'use strict';
const params=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||params.has('key')||params.get('owner_preview')==='1')return;
function init(){
 const root=document.documentElement;
 if(!root.classList.contains('demo-editorial')||!root.classList.contains('tle-demo-v49'))return false;
 if(document.getElementById('tle50Appointment'))return true;
 const form=document.getElementById('res'),date=document.getElementById('date'),time=document.getElementById('time');
 if(!form||!date||!time||time.tagName!=='SELECT')return false;
 // The native date field is stable across locales; its visible label is translated.
 const originalLabel=date.previousElementSibling?.classList.contains('label')?date.previousElementSibling:null;
 if(!originalLabel)return false;
 const es=params.get('lang')==='es';
 const locale=es?'es-US':'en-US';
 const msg=es?{
  eyebrow:'ELIGE CUÁNDO',title:'Tu próxima limpieza, más fácil.',
  provider:'Tu visita de limpieza',service:'Servicio residencial',preview:'Horario de ejemplo · no hay disponibilidad en vivo',
  dates:'Fecha preferida',times:'Horarios de ejemplo',helper:'La empresa confirmaría el horario antes de reservar.',
  choose:'Selecciona una hora',continue:'Continuar',selected:'Horario elegido',review:'Revisa tu horario',
  caution:'Esto es una demostración. No se envía ni confirma ninguna reserva.',
  serviceRow:'Servicio',dateRow:'Fecha',timeRow:'Hora preferida',addressRow:'Dirección',
  addressPending:'La completarás a continuación',confirm:'Usar este horario',
  selecting:'Guardando horario',done:'Horario seleccionado',cancel:'Cancelar',close:'Cerrar',
  contact:'Continúa con tus datos de contacto',week:'Próximos días'
 }:{
  eyebrow:'PICK YOUR TIME',title:'A clean home, on your schedule.',
  provider:'Your cleaning visit',service:'Residential service',preview:'Sample times · not live availability',
  dates:'Preferred date',times:'Sample time preferences',helper:'The cleaning business would confirm the time before booking.',
  choose:'Select a time',continue:'Continue',selected:'Time selected',review:'Review your preferred time',
  caution:'This is a demo. No real booking or message is sent.',
  serviceRow:'Service',dateRow:'Date',timeRow:'Preferred time',addressRow:'Address',
  addressPending:'You can add it in the next step',confirm:'Use this time',
  selecting:'Saving time',done:'Time selected',cancel:'Cancel',close:'Close',
  contact:'Continue with your contact details',week:'Next few days'
 };
 const make=(tag,klass,content)=>{const el=document.createElement(tag);if(klass)el.className=klass;if(content!==undefined)el.textContent=content;return el;};
 const glyph={service:'✦',date:'▦',time:'◷',address:'⌂'};
 const readDates=()=>{
  const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  if(now.getHours()>=14)start.setDate(start.getDate()+1);
  return Array.from({length:5},(_,i)=>{
   const d=new Date(start);d.setDate(start.getDate()+i);
   return {day:d,iso:[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  });
 };
 const days=readDates(),dayFmt=new Intl.DateTimeFormat(locale,{weekday:'short'}),monthFmt=new Intl.DateTimeFormat(locale,{month:'long',year:'numeric'}),fullFmt=new Intl.DateTimeFormat(locale,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
 const times=[...time.options].filter(o=>o.value).map(o=>({label:o.textContent.trim(),value:o.value,disabled:o.disabled}));
 if(!times.length)return false;
 let index=0,slot='',approved=false,service=msg.service,sheetOpen=false,busy=false,priorFocus=null,confirmTimer=0,hideTimer=0;
 const widget=make('section','tle50-appointment');widget.id='tle50Appointment';
 const top=make('div','tle50-heading');
 top.append(make('span','tle50-eyebrow',msg.eyebrow),make('h3','',msg.title));
 const provider=make('div','tle50-provider');
 const avatar=make('div','tle50-avatar','✦');avatar.setAttribute('aria-hidden','true');
 const details=make('div','tle50-provider-text');
 const name=make('strong','',msg.provider),serviceName=make('span','tle50-service-name',service);
 details.append(name,serviceName,make('span','tle50-provider-caption',msg.preview));
 provider.append(avatar,details);
 const dateTitle=make('div','tle50-titleline');
 const dateLabel=make('strong','',msg.dates),month=make('span','',monthFmt.format(days[0].day));
 dateTitle.append(dateLabel,month);
 const dayGrid=make('div','tle50-days');dayGrid.setAttribute('role','radiogroup');dayGrid.setAttribute('aria-label',msg.dates);
 const pill=make('div','tle50-moving-pill');pill.setAttribute('aria-hidden','true');dayGrid.append(pill);
 const dayButtons=days.map((item,i)=>{
  const b=make('button','tle50-day');
  b.type='button';b.setAttribute('role','radio');b.setAttribute('aria-label',fullFmt.format(item.day));
  b.append(make('small','',dayFmt.format(item.day)),make('strong','',String(item.day.getDate())));
  b.addEventListener('click',()=>selectDay(i,true));
  b.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?4:(i+(e.key==='ArrowLeft'?-1:1)+5)%5;
   selectDay(next,true);dayButtons[next].focus();
  });
  dayGrid.append(b);return b;
 });
 const timeHead=make('div','tle50-times-head');
 timeHead.append(make('strong','',msg.times),make('span','tle50-time-hint',msg.week));
 const slotGrid=make('div','tle50-slots');slotGrid.setAttribute('role','radiogroup');slotGrid.setAttribute('aria-label',msg.times);
 const note=make('p','tle50-note',msg.helper);
 const status=make('p','tle50-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 widget.append(top,provider,dateTitle,dayGrid,timeHead,slotGrid,note,status);
 originalLabel.before(widget);
 originalLabel.classList.add('tle50-original');date.classList.add('tle50-original');time.classList.add('tle50-original');
 date.tabIndex=-1;time.tabIndex=-1;date.setAttribute('aria-hidden','true');time.setAttribute('aria-hidden','true');
 root.classList.add('tle-demo-v50');
 const bar=make('div','tle50-continue-bar');bar.id='tle50ContinueBar';bar.hidden=true;
 const continueButton=make('button','tle50-primary',msg.choose);continueButton.type='button';continueButton.disabled=true;
 bar.append(continueButton);
 document.body.append(bar);
 const overlay=make('div','tle50-overlay');overlay.id='tle50Overlay';overlay.hidden=true;
 const scrim=make('div','tle50-scrim');scrim.setAttribute('aria-hidden','true');
 const dialog=make('div','tle50-dialog');
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','tle50SheetHeading');
 dialog.tabIndex=-1;
 const handle=make('div','tle50-grab');handle.setAttribute('aria-hidden','true');
 const closeButton=make('button','tle50-close','×');closeButton.type='button';closeButton.setAttribute('aria-label',msg.close);
 const sheetHeading=make('h3','',msg.review);sheetHeading.id='tle50SheetHeading';
 const sheetNote=make('p','tle50-sheet-note',msg.caution);
 const summary=make('dl','tle50-summary');
 function summaryRow(symbol,label){
  const row=make('div','tle50-summary-row');
  const sign=make('span','tle50-summary-icon',symbol);sign.setAttribute('aria-hidden','true');
  const copy=make('div','');const dt=make('dt','',label),dd=make('dd','');
  copy.append(dt,dd);row.append(sign,copy);summary.append(row);return dd;
 }
 const serviceValue=summaryRow(glyph.service,msg.serviceRow);
 const dateValue=summaryRow(glyph.date,msg.dateRow);
 const timeValue=summaryRow(glyph.time,msg.timeRow);
 const addressValue=summaryRow(glyph.address,msg.addressRow);
 const confirm=make('button','tle50-primary tle50-confirm',msg.confirm);confirm.type='button';
 const cancel=make('button','tle50-cancel',msg.cancel);cancel.type='button';
 dialog.append(handle,closeButton,sheetHeading,sheetNote,summary,confirm,cancel);overlay.append(scrim,dialog);document.body.append(overlay);
 function setNative(el,value){el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
 function updateBar(){
  updateVisibility();
  if(!slot){continueButton.textContent=msg.choose;continueButton.disabled=true;status.textContent='';return;}
  const when=fullFmt.format(days[index].day)+' · '+(times.find(t=>t.value===slot)?.label||slot);
  continueButton.textContent=approved?msg.done+' ✓':msg.continue+' — '+when;
  continueButton.disabled=approved;
 }
 function renderTimes(){
  slotGrid.replaceChildren();
  times.forEach((option,i)=>{
   const b=make('button','tle50-time'+(option.value===slot?' is-selected':''),option.label);
   b.type='button';b.disabled=option.disabled;b.setAttribute('role','radio');b.setAttribute('aria-checked',String(option.value===slot));
   b.setAttribute('aria-label',option.label+(option.disabled?' — unavailable':''));
   if(option.disabled)b.classList.add('is-unavailable');
   b.style.setProperty('--tle50-slot-index',String(i));
   b.addEventListener('click',()=>{if(option.disabled)return;slot=option.value;approved=false;setNative(time,slot);renderTimes();updateBar();});
   slotGrid.append(b);
  });
 }
 function selectDay(next,focus){
  const changed=next!==index;
  index=next;
  dayGrid.style.setProperty('--tle50-index',String(index));
  dayButtons.forEach((b,i)=>{
   const selected=i===index;b.classList.toggle('is-selected',selected);b.setAttribute('aria-checked',String(selected));b.tabIndex=selected?0:-1;
  });
  month.textContent=monthFmt.format(days[index].day);
  setNative(date,days[index].iso);
  if(changed){slot='';approved=false;time.selectedIndex=-1;time.dispatchEvent(new Event('change',{bubbles:true}));}
  renderTimes();updateBar();
  if(focus)status.textContent='';
 }
 function updateService(){
  serviceName.textContent=service;
  serviceValue.textContent=service;
 }
 function openSheet(){
  if(!slot||busy||!form.classList.contains('on'))return;
  serviceValue.textContent=service;
  dateValue.textContent=fullFmt.format(days[index].day);
  timeValue.textContent=times.find(t=>t.value===slot)?.label||slot;
  addressValue.textContent=document.getElementById('serviceAddress')?.value.trim()||msg.addressPending;
  priorFocus=document.activeElement;sheetOpen=true;overlay.hidden=false;
  document.body.classList.add('tle50-sheet-open');
  requestAnimationFrame(()=>{overlay.classList.add('is-open');dialog.focus({preventScroll:true});});
 }
 function closeSheet(restore=true){
  if(!sheetOpen)return;
  sheetOpen=false;overlay.classList.remove('is-open');document.body.classList.remove('tle50-sheet-open');
  clearTimeout(hideTimer);
  hideTimer=window.setTimeout(()=>{if(!sheetOpen)overlay.hidden=true;},matchMedia('(prefers-reduced-motion: reduce)').matches?0:430);
  if(restore&&priorFocus?.isConnected)priorFocus.focus({preventScroll:true});
 }
 function confirmSlot(){
  if(busy||!slot)return;
  busy=true;confirm.disabled=true;cancel.disabled=true;
  confirm.classList.add('is-saving');confirm.textContent=msg.selecting;
  clearTimeout(confirmTimer);
  confirmTimer=window.setTimeout(()=>{
   approved=true;busy=false;confirm.classList.remove('is-saving');confirm.classList.add('is-done');confirm.textContent=msg.done+' ✓';
   status.textContent=msg.contact;updateBar();
   window.setTimeout(()=>{
    closeSheet(false);confirm.classList.remove('is-done');confirm.disabled=false;cancel.disabled=false;confirm.textContent=msg.confirm;
    document.getElementById('name')?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    document.getElementById('name')?.focus({preventScroll:true});
   },matchMedia('(prefers-reduced-motion: reduce)').matches?0:520);
  },matchMedia('(prefers-reduced-motion: reduce)').matches?0:560);
 }
 continueButton.addEventListener('click',openSheet);
 confirm.addEventListener('click',confirmSlot);
 cancel.addEventListener('click',()=>{if(!busy)closeSheet();});
 closeButton.addEventListener('click',()=>{if(!busy)closeSheet();});
 scrim.addEventListener('click',()=>{if(!busy)closeSheet();});
 overlay.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();if(!busy)closeSheet();return;}
  if(e.key!=='Tab')return;
  const focusables=[closeButton,confirm,cancel].filter(el=>!el.disabled);
  if(!focusables.length){e.preventDefault();dialog.focus();return;}
  const idx=focusables.indexOf(document.activeElement);
  if(e.shiftKey&&(idx<=0)){e.preventDefault();focusables[focusables.length-1].focus();}
  else if(!e.shiftKey&&(idx===focusables.length-1||idx<0)){e.preventDefault();focusables[0].focus();}
 });
 function updateVisibility(){
  const on=form.classList.contains('on');
  bar.hidden=!on||approved;
  if(!on&&sheetOpen)closeSheet(false);
 }
 // Refresh on entry: preserve original service selection, never carry a chosen
 // time from one residential service to a different one.
 document.getElementById('residentialServiceList')?.addEventListener('click',e=>{
  const button=e.target.closest('button[onclick^="startResidential"]');if(!button)return;
  service=button.querySelector('.demo-service-body b')?.textContent.trim()||msg.service;
  updateService();index=0;slot='';approved=false;selectDay(0,false);time.selectedIndex=-1;updateBar();
 },true);
 // Native input stays authoritative for the existing review/summary.
 const observer=new MutationObserver(updateVisibility);
 observer.observe(form,{attributes:true,attributeFilter:['class']});
 form.addEventListener('focusin',e=>{
  if(e.target.matches('input:not([type="checkbox"]):not([type="date"]),textarea,select'))bar.classList.add('is-keyboarding');
 });
 form.addEventListener('focusout',()=>bar.classList.remove('is-keyboarding'));
 selectDay(0,false);time.selectedIndex=-1;updateService();updateVisibility();
 return true;
}
if(!init()){
 const observer=new MutationObserver(()=>{if(init())observer.disconnect();});
 observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 addEventListener('load',()=>{if(init())observer.disconnect();},{once:true});
}
})();