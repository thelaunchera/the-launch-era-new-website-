/* Public and emailed Booking Demo only. Preference controls, never a real booking. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),form=$('detailsPanel');
if(!form||!$('preferredDate')||new URLSearchParams(location.search).has('key'))return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const fmt=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const parse=s=>{const a=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return a?new Date(+a[1],+a[2]-1,+a[3]):null};
const locale=()=>$('language').value==='es'?'es-ES':'en-US';
const lex=()=>locale()==='es-ES'?{
title:'Elige día y hora',provider:'Tu equipo de limpieza',badge:'DEMO · No es disponibilidad real',
date:'Fecha preferida',time:'Hora preferida',or:'O introduce la fecha',use:'Usar esta hora',
hint:'Desliza las ruedas o usa las flechas del teclado. Horarios de ejemplo sujetos a confirmación.',
choose:'Elige día y hora',continue:'Continuar',review:'Revisa tu preferencia',
note:'Simulación únicamente: no se confirma ni envía ninguna reserva.',
confirm:'Confirmar hora de ejemplo',cancel:'Cancelar',preparing:'Preparando…',done:'Seleccionada · Demo',
area:'Área de servicio',areaTbd:'A confirmar',when:'Fecha',at:'Hora',back:'Mes anterior',next:'Mes siguiente',
days:['D','L','M','M','J','V','S'],quote:'Cotización personalizada'
}:{
title:'Choose a date and time',provider:'Your cleaning team',badge:'DEMO · No live availability',
date:'Preferred date',time:'Preferred time',or:'Or enter a date',use:'Use this time',
hint:'Scroll the wheels or use arrow keys. Sample preferences, subject to confirmation.',
choose:'Choose a day and time',continue:'Continue',review:'Review your preference',
note:'Sample only. This does not confirm or send a real booking.',
confirm:'Confirm sample time',cancel:'Cancel',preparing:'Preparing…',done:'Selected · Demo',
area:'Service area',areaTbd:'To be confirmed',when:'Date',at:'Time',back:'Previous month',next:'Next month',
days:['S','M','T','W','T','F','S'],quote:'Custom quote'
};
const section=document.createElement('section');section.id='tleBookingAppointment';section.setAttribute('aria-label','Demo date and time picker');
section.innerHTML=[
'<p class="appt-mini">BOOKING DEMO</p><h3 id="apptTitle"></h3>',
'<div class="appt-provider"><span class="appt-provider-avatar" id="apptAvatar" aria-hidden="true">CL</span>',
'<div class="appt-provider-info"><strong id="apptProvider"></strong><small id="apptService"></small><span class="appt-sample-badge" id="apptBadge"></span></div></div>',
'<div class="appt-date-pane"><div class="appt-month-bar"><strong id="apptMonth" aria-live="polite"></strong><div class="appt-month-actions">',
'<button type="button" id="apptPrev" aria-label="Previous month">‹</button><button type="button" id="apptNext" aria-label="Next month">›</button></div></div>',
'<div id="apptWeekdays" class="appt-weekdays" aria-hidden="true"></div><div id="apptDays" class="appt-days" role="radiogroup" aria-label="Preferred day"></div></div>',
'<div class="appt-time-pane"><hr class="appt-divider"><div class="appt-time-heading"><h3 id="apptTimeHeading"></h3><output id="apptReadout" class="appt-readout" aria-live="polite">9:00 AM</output></div>',
'<div class="appt-wheel-frame"><div class="appt-wheel-band" aria-hidden="true"></div>',
'<div id="apptHours" class="appt-wheel" role="listbox" aria-label="Hours" tabindex="0"></div>',
'<div id="apptMinutes" class="appt-wheel" role="listbox" aria-label="Minutes" tabindex="0"></div>',
'<div id="apptPeriod" class="appt-wheel" role="listbox" aria-label="AM or PM" tabindex="0"></div></div>',
'<button type="button" id="apptUseTime" class="appt-use-time"></button>',
'<p class="appt-time-help" id="apptHelp"></p><input type="hidden" id="tlePreferredTime" name="tlePreferredTime"></div>',
'<div class="appt-sticky"><button type="button" id="apptContinue" disabled></button></div><p class="appt-note" id="apptNote"></p>'
].join('');
const appointmentMount=$('appointmentMount');
if(appointmentMount)appointmentMount.append(section);
else form.querySelector('.actions').before(section);
const native=$('preferredDate'), nativeLabel=native.closest('label');nativeLabel.classList.add('appt-native-date');
// The interactive calendar below is the only visible date control.
// Keep the original input as the form/review source so the chosen date stays synced.
nativeLabel.hidden=true;
nativeLabel.style.display='none';
native.required=false;
native.tabIndex=-1;
const scrim=document.createElement('div');scrim.id='apptScrim';scrim.className='appt-booking-scrim';scrim.hidden=true;
const sheet=document.createElement('section');sheet.id='apptSheet';sheet.className='appt-confirm-sheet';sheet.hidden=true;
sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','apptSheetTitle');
sheet.innerHTML=[
'<span class="appt-sheet-handle" aria-hidden="true"></span><h3 id="apptSheetTitle"></h3><p id="apptSheetNote"></p>',
'<div class="appt-sheet-list"><div class="appt-sheet-row"><span aria-hidden="true">✦</span><strong id="apptSheetProvider"></strong></div>',
'<div class="appt-sheet-row"><span aria-hidden="true">▦</span><strong id="apptSheetDate"></strong></div>',
'<div class="appt-sheet-row"><span aria-hidden="true">◷</span><strong id="apptSheetTime"></strong></div>',
'<div class="appt-sheet-row"><span aria-hidden="true">⌖</span><strong id="apptSheetArea"></strong></div>',
'<div class="appt-sheet-row" id="apptSheetPropertyRow" hidden><span aria-hidden="true">⌂</span><strong id="apptSheetProperty"></strong></div></div>',
'<button type="button" id="apptSheetConfirm" class="appt-sheet-confirm"></button><button type="button" id="apptSheetCancel" class="appt-sheet-cancel"></button>'
].join('');
document.body.append(scrim,sheet);
const wheelIds=['apptHours','apptMinutes','apptPeriod'];
const values=[Array.from({length:12},(_,i)=>String(i+1)),Array.from({length:12},(_,i)=>String(i*5).padStart(2,'0')),['AM','PM']];
const now=new Date(),state={year:now.getFullYear(),month:now.getMonth(),day:native.value||'',
indices:[8,0,0],picked:false,program:false,wheelArmed:false,open:false,restore:null,done:false};
const time=()=>values[0][state.indices[0]]+':'+values[1][state.indices[1]]+' '+values[2][state.indices[2]];
const pretty=()=>{const d=parse(state.day);return d?new Intl.DateTimeFormat(locale(),{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(d):''};
function service(){return document.querySelector('.service[aria-pressed="true"] .service-title')?.textContent?.trim()||lex().quote}
function provider(){return (new URLSearchParams(location.search).get('business')||$('leadBusiness')?.textContent||'').trim().slice(0,100)||lex().provider}
function showProvider(){const n=provider();$('apptProvider').textContent=n;$('apptService').textContent=service();$('apptBadge').textContent=lex().badge;$('apptAvatar').textContent=n.split(/\s+/).slice(0,2).map(x=>x.charAt(0)).join('').toUpperCase()||'CL'}
function updateBar(){
const c=lex(),ready=!!state.day&&state.picked;$('apptContinue').disabled=!ready;
$('apptContinue').textContent=ready?c.continue+' — '+pretty()+', '+time():c.choose;
$('apptReadout').textContent=time();$('apptUseTime').textContent=c.use+' · '+time();
$('apptNote').textContent=c.badge;
}
function renderCalendar(){
const c=lex(),first=new Date(state.year,state.month,1),limit=new Date();limit.setMonth(limit.getMonth()+12,1);
const current=new Date();current.setDate(1);current.setHours(0,0,0,0);
$('apptMonth').textContent=new Intl.DateTimeFormat(locale(),{month:'long',year:'numeric'}).format(first);
$('apptPrev').disabled=first<=current;$('apptNext').disabled=first>=limit;
$('apptPrev').setAttribute('aria-label',c.back);$('apptNext').setAttribute('aria-label',c.next);
$('apptDays').setAttribute('aria-label',c.date);
$('apptWeekdays').replaceChildren(...c.days.map(x=>{const s=document.createElement('span');s.textContent=x;return s}));
const nodes=[];
for(let i=0;i<first.getDay();i++){const s=document.createElement('span');s.className='appt-empty';s.setAttribute('aria-hidden','true');nodes.push(s)}
for(let n=1,last=new Date(state.year,state.month+1,0).getDate();n<=last;n++){
const d=new Date(state.year,state.month,n),key=fmt(d),button=document.createElement('button');button.type='button';button.textContent=String(n);
button.dataset.day=key;button.setAttribute('role','radio');button.setAttribute('aria-checked',String(state.day===key));
button.setAttribute('aria-label',new Intl.DateTimeFormat(locale(),{dateStyle:'full'}).format(d));
button.disabled=key<today()||d>limit;
button.addEventListener('click',()=>selectDay(key));
button.addEventListener('keydown',e=>{
const offsets={ArrowRight:1,ArrowLeft:-1,ArrowUp:-7,ArrowDown:7};
if(!(e.key in offsets))return;e.preventDefault();
const next=new Date(d);next.setDate(next.getDate()+offsets[e.key]);if(fmt(next)<today())return;
state.year=next.getFullYear();state.month=next.getMonth();renderCalendar();
$('apptDays').querySelector('[data-day="'+fmt(next)+'"]')?.focus();
});nodes.push(button)
}
$('apptDays').replaceChildren(...nodes)
}
function selectDay(day){
if(!day||day<today())return;const changed=state.day!==day;state.day=day;
native.value=day;native.dispatchEvent(new Event('input',{bubbles:true}));
if(changed){state.picked=false;state.done=false;state.wheelArmed=false;$('tlePreferredTime').value=''}
renderCalendar();updateBar()
}
function paintWheel(col,index){
[...col.children].forEach((node,i)=>{
const distance=Math.abs(i-index);node.style.transform=reduced.matches?'none':'rotateX('+(-26*(i-index))+'deg) scale('+(1-Math.min(distance,1)*.1)+')';
node.style.opacity=reduced.matches?'1':String(distance>3?.12:Math.max(.12,1-distance*.34));
node.setAttribute('aria-selected',String(i===index))
});
col.setAttribute('aria-activedescendant',col.id+'-'+index)
}
function commitTime(){state.picked=true;state.done=false;$('tlePreferredTime').value=time();updateBar()}
function setWheel(which,n,interaction=false,smooth=false){
const col=$(wheelIds[which]);state.indices[which]=Math.max(0,Math.min(values[which].length-1,n));
state.program=true;col.scrollTo({top:state.indices[which]*22,behavior:smooth&&!reduced.matches?'smooth':'instant'});
paintWheel(col,state.indices[which]);if(interaction)commitTime();
requestAnimationFrame(()=>{state.program=false})
}
function setupWheels(){
wheelIds.forEach((id,which)=>{
const col=$(id);col.replaceChildren(...values[which].map((value,i)=>{
const el=document.createElement('div');el.className='appt-wheel-option';el.id=id+'-'+i;el.setAttribute('role','option');el.textContent=value;return el
}));
let touched=false,drag=null,raf=0;
col.addEventListener('wheel',()=>{touched=true;state.wheelArmed=true},{passive:true});
col.addEventListener('touchstart',()=>{touched=true;state.wheelArmed=true},{passive:true});
col.addEventListener('scroll',()=>{
if(raf)cancelAnimationFrame(raf);
raf=requestAnimationFrame(()=>{
const index=Math.max(0,Math.min(values[which].length-1,Math.round(col.scrollTop/22)));
state.indices[which]=index;paintWheel(col,index);
if(touched&&state.wheelArmed&&!state.program)commitTime()
})
},{passive:true});
col.addEventListener('keydown',e=>{
if(!['ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();touched=true;state.wheelArmed=true;
const index=e.key==='Home'?0:e.key==='End'?values[which].length-1:state.indices[which]+(e.key==='ArrowUp'?-1:1);
setWheel(which,index,true,true)
});
col.addEventListener('pointerdown',e=>{
if(e.pointerType==='touch')return;touched=true;state.wheelArmed=true;drag={y:e.clientY,top:col.scrollTop,prev:e.clientY,at:performance.now(),velocity:0};
col.style.scrollSnapType='none';col.setPointerCapture(e.pointerId)
});
col.addEventListener('pointermove',e=>{
if(!drag)return;const t=performance.now();drag.velocity=(e.clientY-drag.prev)/Math.max(1,t-drag.at);
drag.prev=e.clientY;drag.at=t;col.scrollTop=drag.top+drag.y-e.clientY
});
const end=()=>{if(!drag)return;const index=Math.round((col.scrollTop-drag.velocity*140)/22);drag=null;
col.style.scrollSnapType='y mandatory';setWheel(which,index,true,true)};
col.addEventListener('pointerup',end);col.addEventListener('pointercancel',end);
paintWheel(col,state.indices[which])
})
}
function translate(){
const c=lex();$('apptTitle').textContent=c.title;$('apptTimeHeading').textContent=c.time;
$('apptHelp').textContent=c.hint;nativeLabel.querySelector('span').textContent=c.or;
showProvider();renderCalendar();updateBar()
}
function openSheet(){
if(!state.day||!state.picked)return;const c=lex();state.open=true;state.restore=document.activeElement;
$('apptSheetTitle').textContent=c.review;$('apptSheetNote').textContent=c.note;
$('apptSheetProvider').textContent=provider()+' · '+service();
$('apptSheetDate').textContent=c.when+': '+pretty();
$('apptSheetTime').textContent=c.at+': '+time();
$('apptSheetArea').textContent=c.area+': '+($('customerZip').value.trim()||new URLSearchParams(location.search).get('area')||c.areaTbd);
const res=!$('resDetails')?.hidden, size=$('squareFeet')?.value.trim()||'';
const rooms=res?[$('beds')?.value+' '+(locale()==='es-ES'?'hab.':'beds'),$('baths')?.value+' '+(locale()==='es-ES'?'baños':'baths')].join(' · '):'';
const type=res?$('propertyType')?.selectedOptions[0]?.textContent.trim():$('spaceType')?.selectedOptions[0]?.textContent.trim();
const description=[type&&$('propertyType')?.value!==''?type:'',rooms,size?size+' sq ft':''].filter(Boolean).join(' · ');
$('apptSheetPropertyRow').hidden=!description;
$('apptSheetProperty').textContent=description;
$('apptSheetConfirm').textContent=c.confirm;$('apptSheetConfirm').classList.remove('is-booking','is-booked');
$('apptSheetConfirm').disabled=false;$('apptSheetCancel').textContent=c.cancel;
scrim.hidden=false;sheet.hidden=false;document.body.classList.add('appt-dialog-open');
requestAnimationFrame(()=>{sheet.classList.add('is-open');$('apptSheetConfirm').focus()})
}
function closeSheet(){
if(!state.open)return;state.open=false;sheet.classList.remove('is-open');scrim.hidden=true;sheet.hidden=true;
document.body.classList.remove('appt-dialog-open');state.restore?.focus?.()
}
$('apptPrev').addEventListener('click',()=>{if(--state.month<0){state.month=11;state.year--}renderCalendar()});
$('apptNext').addEventListener('click',()=>{if(++state.month>11){state.month=0;state.year++}renderCalendar()});
native.addEventListener('change',()=>{const d=parse(native.value);if(!d||native.value<today())return;
state.year=d.getFullYear();state.month=d.getMonth();selectDay(native.value)});
$('apptUseTime').addEventListener('click',commitTime);$('apptContinue').addEventListener('click',openSheet);
$('apptSheetCancel').addEventListener('click',closeSheet);scrim.addEventListener('click',closeSheet);
document.addEventListener('keydown',e=>{if(state.open&&e.key==='Escape'){e.preventDefault();closeSheet()}});
sheet.addEventListener('keydown',e=>{
if(e.key==='Escape'){e.preventDefault();closeSheet()}
if(e.key!=='Tab')return;const buttons=[...sheet.querySelectorAll('button:not(:disabled)')];
if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus()}
else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus()}
});
$('apptSheetConfirm').addEventListener('click',()=>{
const btn=$('apptSheetConfirm');btn.disabled=true;btn.classList.add('is-booking');btn.textContent=lex().preparing;
// Existing native form handler verifies all required fields, and opens the sample review.
$('reviewNext').click();
if($('reviewPanel').hidden){btn.disabled=false;btn.classList.remove('is-booking');closeSheet();return}
state.done=true;btn.textContent=lex().done;btn.classList.add('is-booked');
setTimeout(closeSheet,reduced.matches?40:440)
});
$('language').addEventListener('change',()=>setTimeout(translate,0));
const align=()=>wheelIds.forEach((_,i)=>setWheel(i,state.indices[i]));
$('chooseNext').addEventListener('click',()=>requestAnimationFrame(()=>{showProvider();align()}));
$('customQuote').addEventListener('click',()=>requestAnimationFrame(()=>{showProvider();align()}));
$('backReview').addEventListener('click',()=>requestAnimationFrame(align));
function reset(){
state.day='';state.picked=false;state.done=false;state.wheelArmed=false;state.indices=[8,0,0];state.year=new Date().getFullYear();state.month=new Date().getMonth();
$('tlePreferredTime').value='';native.value='';align();renderCalendar();updateBar()
}
$('restart').addEventListener('click',()=>setTimeout(reset,0));
setupWheels();translate();
window.tleBookingPreference={time:()=>$('tlePreferredTime').value,reset,selectSampleTime:commitTime};
})();