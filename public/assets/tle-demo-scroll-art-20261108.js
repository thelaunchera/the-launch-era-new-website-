/* TLE brand-specific editorial scroll motion | 2026-11-08.
   Inspired by BrewedOps scroll triggered reveal, masked photography and stagger.
   No ScrollTrigger/Lenis dependency, pinned content, scroll hijack or form changes. */
(() => {
 'use strict';
 const root=document.documentElement;
 if(!root.dataset.tleOneMotion)return;
 const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const processed=new WeakSet();
 const pending=new Set();
 const exclusion='.hero,.site-header,header,nav,footer,.ticker,.marquee,.banner,.announcement,.modal,.drawer,.cart,.checkout,.preview,.receipt,.form-card,.form-panel,form,dialog,[role="dialog"],[hidden],[aria-hidden="true"]';
 let observer=null,scheduled=false;
 const done=el=>{
   if(!el)return;
   pending.delete(el);
   el.classList.add('tle-scroll-visible');
   if(observer)observer.unobserve(el);
   // Remove transition layer after one arrival. Never interfere with hover or clicks later.
   window.setTimeout(()=>{el.classList.remove('tle-scroll-pending');el.style.removeProperty('--tle-scroll-delay')},1250);
 };
 const safe=el=>Boolean(el&&el.isConnected&&!el.closest(exclusion)&&el.getBoundingClientRect().height>0);
 function ensureObserver(){
   if(observer||!('IntersectionObserver' in window))return;
   observer=new IntersectionObserver(entries=>{
     for(const entry of entries)if(entry.isIntersecting)done(entry.target);
   },{root:null,rootMargin:'0px 0px -7% 0px',threshold:0.035});
 }
 const add=(el,part,delay)=>{
   if(!safe(el)||processed.has(el))return;
   processed.add(el);
   el.dataset.tleScrollPart=part;
   // Never hide initially visible content, including anchor destinations and hero adjacency.
   const rect=el.getBoundingClientRect();
   if(rect.top<window.innerHeight*.90||rect.bottom<0||media?.matches||!observer){
     el.classList.add('tle-scroll-visible');return;
   }
   el.style.setProperty('--tle-scroll-delay',delay+'ms');
   el.classList.add('tle-scroll-pending');
   pending.add(el);observer.observe(el);
 };
 function scan(){
   if(media?.matches){for(const el of [...pending])done(el);return}
   ensureObserver();
   const base=document.querySelector('main')||document.querySelector('#app')||document.body;
   const sections=[...base.querySelectorAll('section')].filter(section=>{
     if(!safe(section))return false;
     if(section.matches('.intro-band,.feature-links,.editorial-banner,.hero-strip,.mini-strip,.brand-story-banner,.strip,.handoff,.owner'))return false;
     return true;
   }).slice(0,12);
   let accepted=0;
   for(const section of sections){
     if(accepted>=9)break;
     let title=[...section.querySelectorAll('h2, .section-heading h3, .section-title')]
       .find(el=>el.closest('section')===section&&safe(el));
     let photo=[...section.querySelectorAll('figure, picture, .story-photo, .photo-frame, .editorial-photo, .product-image, .visual-image')]
       .find(el=>el.closest('section')===section&&safe(el)
         &&!el.closest('a,button,[role="button"],.carousel,.slider,.swiper,.filters,.tabs')
         &&!el.querySelector('input,select,textarea,[role="dialog"]'));
     if(!title&&!photo)continue;
     accepted++;
     if(title)add(title,'headline',0);
     if(photo&&accepted<=6)add(photo,'photo',title?95:0);
   }
 }
 function boot(){
   if(media?.matches)return;
   ensureObserver();scan();
   // Dynamic React demo and language switches reconstruct sections.
   const base=document.querySelector('#app')||document.querySelector('main')||document.body;
   new MutationObserver(records=>{
     if(scheduled||!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&
        (n.matches?.('section,main,#app')||n.querySelector?.('section')))))return;
     scheduled=true;requestAnimationFrame(()=>{scheduled=false;scan()});
   }).observe(base,{subtree:true,childList:true});
   document.addEventListener('focusin',e=>{
     const el=e.target.closest?.('.tle-scroll-pending');
     if(el)done(el);
   },{passive:true});
   media?.addEventListener?.('change',e=>{if(e.matches)for(const el of [...pending])done(el);else scan()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();
