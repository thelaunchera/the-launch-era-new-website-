/* TLE Cinematic — progressive, owner-safe presentation layer.
 * Runs exclusively for non-key, non-owner-preview prospect demos. Never touches bookings, pricing or tracking. */
(function(){
 'use strict';
 const html=document.documentElement;
 const params=new URLSearchParams(location.search);
 if(!html.classList.contains('demo-editorial')||params.has('key')||params.get('owner_preview')==='1')return;
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const isEs=params.get('lang')==='es';
 const story=document.getElementById('demoCinematicStory');
 if(!story)return;
 if(isEs){
   const t=(q,v)=>{const el=document.querySelector(q);if(el)el.textContent=v};
   const h=(q,v)=>{const el=document.querySelector(q);if(el)el.innerHTML=v};
   t('.demo-cinematic-overline','LA EXPERIENCIA LIMPIA · 01 / 03');
   h('.demo-cinematic-copy h2','Espacios hermosos.<br><em>Experiencias aún mejores.</em>');
   t('.demo-cinematic-copy p','Ofrece a cada cliente una experiencia fácil y agradable, desde descubrir tus servicios hasta enviar una solicitud de prueba.');
   const a=document.querySelector('.demo-cinematic-link');
   if(a&&a.firstChild)a.firstChild.nodeValue='Descubre la experiencia ';
   t('.demo-cinematic-index','MEJOR DISEÑO, MENOS COMPLICACIONES — ✳');
   h('.demo-cinematic-overlay','UN NUEVO<br><em>AMBIENTE</em>');
 }
 const revealNodes=[
  document.querySelector('.demo-service-showcase .demo-showcase-intro'),
  ...document.querySelectorAll('.demo-service-showcase .demo-showcase-card'),
  story,
  story.querySelector('.demo-cinematic-copy'),
  document.querySelector('.demo-why-copy'),
  document.querySelector('.demo-bottom-text'),
  document.querySelector('.demo-results'),
  document.querySelector('.demo-booking-eyebrow')
 ].filter(Boolean);
 const stagger=[0,70,140,210,20,100,0,0,0,0];
 for(let i=0;i<revealNodes.length;i++)revealNodes[i].style.setProperty('--demo-delay',(stagger[i]||0)+'ms');
 if(!reduced&&typeof IntersectionObserver!=='undefined'){
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting){
       entry.target.classList.add('demo-inview');
       observer.unobserve(entry.target);
      }
    }
   },{threshold:0.09,rootMargin:'0px 0px -4% 0px'});
  // Defer adding the hidden state until the observer has attached.
  for(const node of revealNodes)node.classList.add('demo-reveal');
  for(const node of revealNodes)observer.observe(node);
  html.classList.add('demo-motion-ready');
 }
 const progress=document.querySelector('#demoScrollProgress>span');
 const photo=story.querySelector('.demo-cinematic-photo');
 let queued=false;
 function frame(){
  queued=false;
  const y=Math.max(0,window.scrollY||window.pageYOffset||0);
  const range=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
  if(progress)progress.style.transform='scaleX('+Math.min(1,Math.max(0,y/range)).toFixed(5)+')';
  if(!reduced&&photo){
    const rect=photo.getBoundingClientRect();
    if(rect.bottom>-80&&rect.top<innerHeight+80){
      const ratio=(rect.top+rect.height*.5-innerHeight*.5)/(innerHeight+rect.height);
      const shift=Math.max(-19,Math.min(19,ratio*38));
      photo.style.setProperty('--cinematic-shift',shift.toFixed(1)+'px');
    }
  }
 }
 function requestFrame(){
  if(queued)return;
  queued=true;
  window.requestAnimationFrame(frame);
 }
 window.addEventListener('scroll',requestFrame,{passive:true});
 window.addEventListener('resize',requestFrame,{passive:true});
 window.addEventListener('load',requestFrame,{once:true});
 if(document.fonts?.ready)document.fonts.ready.then(requestFrame).catch(()=>{});
 requestFrame();
})();