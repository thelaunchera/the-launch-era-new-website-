/* TLE fictional BOOKING DEMO v49: expandable actual service buttons and hero hook.
   Opt-in only after v48. No booking handlers, prices, tenant logic or APIs modified. */
(()=>{'use strict';
const qs=new URLSearchParams(location.search);
if(location.pathname!=='/lead-private-preview.html'||qs.has('key')||qs.get('owner_preview')==='1')return;
const es=qs.get('lang')==='es';
const hook=es?{prefix:'Tu casa impecable.',words:['Más tiempo.','Menos estrés.','Más calma.'],
 accessible:'Tu casa impecable. Más tiempo, menos estrés y más calma.'}:
 {prefix:'A cleaner home.',words:['More time.','Less stress.','More calm.'],
 accessible:'A cleaner home. More time, less stress and more calm.'};
const labels=es?{mobile:'Toca de nuevo para continuar',selected:'Servicio seleccionado. Toca otra vez para continuar'}:
 {mobile:'Tap again to continue',selected:'Selected. Tap again to book'};
let mounted=false;
function init(){
 if(mounted)return true;
 const root=document.documentElement,hero=document.getElementById('leadHero');
 const stage=hero?.querySelector('.tle46-hero-slot');
 const tag=stage?.querySelector('.heroText .demo-hero-tagline');
 const res=document.getElementById('residentialServiceList');
 const com=document.getElementById('commercialServiceList');
 if(!root.classList.contains('tle-demo-v48')||!tag||!stage||!res||!com)return false;
 mounted=true;
 root.classList.add('tle-demo-v49');
 // The main 48-63px headline is the only rotating hook. Keep a stable
 // accessible name and ignore the visual rotating copies for screen readers.
 const heading=document.createElement('h1');
 heading.className=tag.className+' tle49-hook';
 tag.replaceWith(heading);
 const legacy=stage.querySelector('.heroText h1.demo-headline');
 if(legacy){legacy.setAttribute('aria-hidden','true');legacy.style.setProperty('display','none','important');}
 const prefix=document.createElement('span');prefix.className='tle49-hook-prefix';prefix.textContent=hook.prefix;
 const flip=document.createElement('span');flip.className='tle49-hook-flip';flip.setAttribute('aria-hidden','true');
 hook.words.forEach((word,index)=>{
  const item=document.createElement('span');item.className='tle49-hook-word';
  item.style.setProperty('--tle49-phase',(-index*3)+'s');
  item.textContent=word;flip.append(item);
 });
 heading.append(prefix,flip);

 heading.setAttribute('aria-label',hook.accessible);

 const small=stage.querySelector('.tle46-caption');
 if(small){small.setAttribute('aria-hidden','true');small.setAttribute('aria-live','off');small.classList.add('tle49-old-caption');}
 // Keep each *existing* service button (and its inline onclick) in place.
 // The first tap on a collapsed phone panel expands it; the second performs
 // the real booking action. Desktop pointer hover/focus expands directly.
 function gallery(list){
  const cards=[...list.querySelectorAll(':scope > button.service.tle-service-has-photo-v21')];
  if(!cards.length)return;
  list.classList.add('tle49-expanding-gallery');
  list.setAttribute('aria-label',(list===res?(es?'Servicios residenciales':'Residential services'):(es?'Servicios comerciales':'Commercial services')));
  let active=cards[0];
  const phone=()=>matchMedia('(max-width:759px) and (hover:none)').matches;
  const pick=(card)=>{
   if(active===card)return;
   active=card;
   cards.forEach(btn=>{
    const on=btn===active;btn.classList.toggle('tle49-active',on);
    btn.setAttribute('aria-expanded',String(on));
   });
  };
  cards.forEach((btn,index)=>{
   btn.classList.add('tle49-service-panel','tle49-panel');btn.setAttribute('aria-expanded',String(index===0));
   if(index===0)btn.classList.add('tle49-active');
   const image=btn.querySelector('.tle-service-photo-v21 img');
   if(image){image.alt=btn.querySelector('.demo-service-body b')?.textContent.trim()||'Cleaning service';}
   const num=document.createElement('span');num.className='tle49-panel-number';num.textContent=String(index+1).padStart(2,'0');
   num.setAttribute('aria-hidden','true');btn.append(num);
   const hint=document.createElement('span');hint.className='tle49-panel-hint';hint.setAttribute('aria-hidden','true');hint.textContent=labels.mobile;btn.append(hint);
   btn.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'||matchMedia('(hover:hover) and (pointer:fine)').matches)pick(btn);},{passive:true});
   btn.addEventListener('focus',()=>pick(btn),{passive:true});
   // Save state *before* focus causes an expansion on touchscreen.
   btn.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||phone())btn.dataset.tle49DownActive=String(btn===active);},{capture:true,passive:true});
   btn.addEventListener('click',e=>{
    if(!phone())return; // Desktop click continues native onclick immediately.
    const already=btn.dataset.tle49DownActive==='true';
    delete btn.dataset.tle49DownActive;
    if(!already){
     e.preventDefault();e.stopImmediatePropagation();pick(btn);
     // Clear affordance text is inside the expanded panel.
    }
    // Second tap allows the original onclick. No synthetic submission.
   },true);
  });
  // Recover a selected card after a tab switch or on back navigation.
  list.addEventListener('focusin',e=>{if(cards.includes(e.target))pick(e.target);});
 }
 gallery(res);gallery(com);
 return true;
}
if(!init()){
 const obs=new MutationObserver(()=>{if(init())obs.disconnect();});
 obs.observe(document.documentElement,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
 addEventListener('load',()=>{if(init())obs.disconnect();},{once:true});
}
})();