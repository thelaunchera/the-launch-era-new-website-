/* Website of Websites: public, read-only selection managed by the private Studio.
   The publishable key grants no write rights; database RLS enforces owner-only edits. */
(function(){
 'use strict';
 const api='https://fhrvuhikrybobidxpvnh.supabase.co/rest/v1/tle_website_demo_visibility?select=demo_id,visible';
 const key='sb_publishable_Uj2dcLjktTPVb-IcAD5RSA_6J0AAfM-';
 const ready=(async function(){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
   const response=await fetch(api,{headers:{apikey:key},cache:'no-store',signal:controller.signal});
   if(!response.ok)throw Error('portfolio configuration unavailable');
   const rows=await response.json();
   if(!Array.isArray(rows))throw Error('unexpected portfolio configuration');
   return new Set(rows.filter(row=>row&&row.visible===false&&typeof row.demo_id==='string').map(row=>row.demo_id));
  }catch(_error){
   // Network failure does not change public site navigation or any saved selection.
   return new Set();
  }finally{clearTimeout(timer);}
 })();
 window.TLEWebsiteDemoVisibility={ready};

 // The sales page uses the same selection as /demos/; no private admin UI here.
 if(document.querySelector('.hero-gallery-rail')){
  ready.then(hidden=>{
   const rail=document.querySelector('.hero-gallery-rail');
   if(!rail)return;
   const figures=[...rail.querySelectorAll('.hero-gallery-card[data-demo]')];
   const shown=figures.filter(card=>!hidden.has(card.dataset.demo));
   const hiddenCards=figures.filter(card=>hidden.has(card.dataset.demo));
   [...shown,...hiddenCards].forEach((card,i)=>{rail.appendChild(card);card.style.setProperty('--gallery-i',String(i));});
   hiddenCards.forEach(card=>{card.hidden=true;card.style.display='none';});
   shown.forEach(card=>{card.hidden=false;card.style.display='';});
   const stage=document.querySelector('.hero-gallery-stage');
   if(stage)stage.style.display=shown.length?'':'none';
   if(!shown.length){
    const note=document.querySelector('.hero-gallery-note');
    if(note)note.textContent=document.documentElement.lang==='es'
     ?'Explora una web creada para la identidad de tu negocio.'
     :'Discover a website designed around your business.';
   }
   const ownerDemo=document.querySelector('.owner-experience-cta');
   if(ownerDemo){
    const url=new URL(ownerDemo.getAttribute('href'),location.origin);
    const slug=url.searchParams.get('demo');
    if(slug&&hidden.has(slug)){
     const alternative=shown[0]?.dataset.demo;
     if(alternative){
      url.searchParams.set('demo',alternative);
      ownerDemo.href=url.pathname+url.search;
     }else{
      url.searchParams.delete('demo');
      ownerDemo.href=url.pathname+url.search;
     }
    }
   }
   // The Golden Grid example belongs only to Golden Grid. Never relabel it.
   if(hidden.has('golden-grid')){
    const showcase=document.querySelector('.owner-experience');
    if(showcase){showcase.hidden=true;showcase.style.display='none';}
   }
  });
 }
})();
