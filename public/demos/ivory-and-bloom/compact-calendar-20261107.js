/* Ivory & Bloom — compact calendar: no input[type=date], no iOS picker. */
(() => {
  'use strict';
  const form = document.getElementById('inquiryForm');
  const value = document.getElementById('ib-date-value');
  const trigger = document.getElementById('ib-date-trigger');
  const panel = document.getElementById('ib-date-calendar');
  const error = document.getElementById('ib-date-error');
  const month = document.getElementById('ib-calendar-month');
  const year = document.getElementById('ib-calendar-year');
  const previous = document.getElementById('ib-calendar-prev');
  const next = document.getElementById('ib-calendar-next');
  const days = document.getElementById('ib-calendar-days');
  if (!form || !value || !trigger || !panel || !error || !month || !year || !previous || !next || !days) return;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastYear = todayStart.getFullYear() + 7;
  let shownYear = todayStart.getFullYear();
  let shownMonth = todayStart.getMonth();
  const monthNames = Array.from({length:12},(_,i)=>new Intl.DateTimeFormat('en-US',{month:'long'}).format(new Date(2026,i,1)));
  for(let i=0;i<12;i++){
    const option = document.createElement('option');
    option.value=String(i);option.textContent=monthNames[i];month.appendChild(option);
  }
  for(let y=shownYear;y<=lastYear;y++){
    const option=document.createElement('option');
    option.value=String(y);option.textContent=String(y);year.appendChild(option);
  }
  const iso = (y,m,d) => String(y)+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
  const format = date => new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(date);
  const dayDate = (y,m,d) => new Date(y,m,d);
  const minMonth = todayStart.getFullYear()*12+todayStart.getMonth();
  const maxMonth = lastYear*12+11;
  const currentMonth = () => shownYear*12+shownMonth;
  function hideError(){error.hidden=true;error.textContent='';trigger.removeAttribute('aria-invalid');}
  function showError(){error.textContent='Choose your wedding date to preview the inquiry.';error.hidden=false;trigger.setAttribute('aria-invalid','true');}
  function close(){panel.hidden=true;trigger.setAttribute('aria-expanded','false');}
  function open(){
    panel.hidden=false;trigger.setAttribute('aria-expanded','true');
    draw();
    requestAnimationFrame(()=>{
      const rect=panel.getBoundingClientRect();
      if(rect.bottom>window.innerHeight-16){
        panel.scrollIntoView({behavior:'auto',block:'nearest'});
      }
    });
  }
  function draw(){
    month.value=String(shownMonth);year.value=String(shownYear);
    for(const opt of month.options){
      opt.disabled=shownYear===todayStart.getFullYear() && Number(opt.value)<todayStart.getMonth();
    }
    previous.disabled=currentMonth()<=minMonth;
    next.disabled=currentMonth()>=maxMonth;
    days.replaceChildren();
    const fragment=document.createDocumentFragment();
    const first=dayDate(shownYear,shownMonth,1).getDay();
    const count=dayDate(shownYear,shownMonth+1,0).getDate();
    const total=Math.ceil((first+count)/7)*7;
    for(let n=0;n<total;n++){
      const d=n-first+1;
      if(d<1 || d>count){
        const blank=document.createElement('span');
        blank.className='ib-calendar-empty';blank.setAttribute('aria-hidden','true');
        fragment.appendChild(blank);continue;
      }
      const theDate=dayDate(shownYear,shownMonth,d);
      const button=document.createElement('button');
      button.type='button';button.textContent=String(d);
      button.dataset.day=iso(shownYear,shownMonth,d);
      button.setAttribute('aria-label',format(theDate));
      button.setAttribute('aria-pressed',String(button.dataset.day===value.value));
      button.disabled=theDate<todayStart;
      if(theDate.getTime()===todayStart.getTime())button.dataset.today='true';
      fragment.appendChild(button);
    }
    days.appendChild(fragment);
  }
  function go(delta){
    const date=dayDate(shownYear,shownMonth+delta,1);
    const nextMonth=date.getFullYear()*12+date.getMonth();
    if(nextMonth<minMonth || nextMonth>maxMonth)return;
    shownYear=date.getFullYear();shownMonth=date.getMonth();draw();
  }
  trigger.addEventListener('click',()=>panel.hidden ? open() : close());
  previous.addEventListener('click',()=>go(-1));
  next.addEventListener('click',()=>go(1));
  year.addEventListener('change',()=>{
    shownYear=Number(year.value);
    if(shownYear===todayStart.getFullYear() && shownMonth<todayStart.getMonth())shownMonth=todayStart.getMonth();
    draw();
  });
  month.addEventListener('change',()=>{
    shownMonth=Number(month.value);
    if(currentMonth()<minMonth)shownMonth=todayStart.getMonth();
    draw();
  });
  days.addEventListener('click',event=>{
    const button=event.target.closest('button[data-day]');
    if(!button || button.disabled)return;
    value.value=button.dataset.day;
    value.dispatchEvent(new Event('input',{bubbles:true}));
    value.dispatchEvent(new Event('change',{bubbles:true}));
    const [y,m,d]=button.dataset.day.split('-').map(Number);
    trigger.querySelector('.ib-date-selection').textContent=format(dayDate(y,m-1,d));
    trigger.dataset.selected='true';
    hideError();close();trigger.focus({preventScroll:true});
  });
  form.addEventListener('submit',e=>{
    if(!value.value){
      e.preventDefault();
      e.stopImmediatePropagation();
      showError();
      open();
      trigger.focus({preventScroll:true});
    }
  },true);
  trigger.addEventListener('keydown',event=>{
    if(event.key==='Escape'){close();event.preventDefault();}
  });
  panel.addEventListener('keydown',event=>{
    if(event.key==='Escape'){close();trigger.focus();event.preventDefault();}
  });
  document.addEventListener('pointerdown',event=>{
    if(!panel.hidden && !panel.contains(event.target) && !trigger.contains(event.target))close();
  });
  form.addEventListener('reset',()=>requestAnimationFrame(()=>{
    value.value='';trigger.querySelector('.ib-date-selection').textContent='Choose your wedding date';
    trigger.dataset.selected='false';hideError();close();
  }));
  draw();
})();
