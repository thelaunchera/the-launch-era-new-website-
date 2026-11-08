/* The Launch Era — public, read-only portfolio selection.
   Studio owns the data; anonymous visitors cannot change it (Supabase RLS).
   If visibility cannot be checked, do not expose the unverified gallery. */
(function(){
 'use strict';
 const api='https://fhrvuhikrybobidxpvnh.supabase.co/rest/v1/tle_website_demo_visibility?select=demo_id,visible&limit=500';
 const key='sb_publishable_Uj2dcLjktTPVb-IcAD5RSA_6J0AAfM-';
 const subscribers=new Set();
 let current=null;
 let lastCheck=0;
 let settled=false;
 const validId=/^[a-z0-9][a-z0-9-]{0,79}$/;
 async function fetchSelection(){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),9000);
  try{
   const response=await fetch(api,{
    method:'GET',mode:'cors',cache:'no-store',credentials:'omit',
    headers:{apikey:key,Accept:'application/json'},signal:controller.signal
   });
   if(!response.ok)throw Error('Unable to load public portfolio selection');
   const rows=await response.json();
   if(!Array.isArray(rows))throw Error('Invalid public portfolio response');
   return new Set(rows.filter(row=>row&&row.visible===false&&typeof row.demo_id==='string'&&validId.test(row.demo_id)).map(row=>row.demo_id));
  }finally{clearTimeout(timeout);}
 }
 async function refresh(){
  lastCheck=Date.now();
  let selection=null;
  try{selection=await fetchSelection();}
  catch(_error){selection=null;} // Deliberately fail closed: null is not an empty selection.
  settled=true;
  for(const listener of subscribers){try{listener(selection);}catch(_error){/* independent views */}}
  return selection;
 }
 function subscribe(fn){
  subscribers.add(fn);
  if(settled)current.then(fn);
  return ()=>subscribers.delete(fn);
 }
 function recheckOnReturn(){
  if(document.visibilityState!=='hidden'&&Date.now()-lastCheck>3000)void reload();
 }
 function reload(){
  current=refresh();
  return current;
 }
 current=refresh();
 window.TLEWebsiteDemoVisibility={get ready(){return current;},reload,subscribe};
 window.addEventListener('pageshow',recheckOnReturn);
 document.addEventListener('visibilitychange',recheckOnReturn);

 // The EN/ES sales pages use precisely the same selection as /demos/.
 const rail=document.querySelector('.hero-gallery-rail');
 if(rail){
  const figures=[...rail.querySelectorAll('.hero-gallery-card[data-demo]')];
  const stage=document.querySelector('.hero-gallery-stage');
  const note=document.querySelector('.hero-gallery-note');
  const ownerDemo=document.querySelector('.owner-experience-cta');
  const originalOwnerHref=ownerDemo?.getAttribute('href')||'';
  const ownerShowcase=document.querySelector('.owner-experience');
  const normalNote=note?.textContent||'';
  subscribe(hidden=>{
   const valid=hidden instanceof Set;
   const selected=valid?figures.filter(card=>!hidden.has(card.dataset.demo)):[];
   const omitted=figures.filter(card=>!selected.includes(card));
   [...selected,...omitted].forEach((card,i)=>{
    rail.appendChild(card);
    card.style.setProperty('--gallery-i',String(i));
    card.hidden=!selected.includes(card);
    card.style.display=selected.includes(card)?'':'none';
   });
   if(stage)stage.style.display=selected.length?'':'none';
   if(note)note.textContent=!valid
    ?(document.documentElement.lang==='es'?'Nuestros proyectos no están disponibles en este momento.':'Our projects are temporarily unavailable.')
    :selected.length?normalNote
     :(document.documentElement.lang==='es'?'Explora una web creada para tu negocio.':'Discover a website created for your business.');
   if(ownerDemo&&originalOwnerHref){
    const url=new URL(originalOwnerHref,location.origin);
    const slug=url.searchParams.get('demo');
    if(!valid||!selected.length){
     ownerDemo.hidden=true;
     ownerDemo.style.display='none';
    }else{
     ownerDemo.hidden=false;
     ownerDemo.style.display='';
     if(slug&&hidden.has(slug))url.searchParams.set('demo',selected[0].dataset.demo);
     ownerDemo.href=url.pathname+url.search;
    }
   }
   // This example is specific to Golden Grid and must not outlive its selection.
   if(ownerShowcase){
    const show=valid&&!hidden.has('golden-grid');
    ownerShowcase.hidden=!show;
    ownerShowcase.style.display=show?'':'none';
   }
   document.documentElement.dataset.tleDemoStatus=valid?'ready':'unavailable';
  });
 }
})();