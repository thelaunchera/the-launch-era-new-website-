/* Casa Brownie | lightweight editorial reveal + progress, adapted from TLE's cinematic demo.
   Isolated to this educational page. No tracking, network requests or user data. */
(() => {
  'use strict';
  const root=document.documentElement;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const mediaLimit=navigator.connection?.saveData;
  if(reduce || mediaLimit || !('IntersectionObserver' in window)) return;
  const selectors=[
    '.section-heading',
    '.flavor-grid .flavor',
    '.delivery-steps > .eyebrow',
    '.delivery-steps > h2',
    '.delivery-steps > p',
    '.delivery-steps .step',
    '.delivery-miami > .pin-circle',
    '.delivery-miami > h2',
    '.delivery-miami > p',
    '.delivery-miami > button',
    '.delivery-gift',
    '.moments-strip .moment-image',
    '.moments-strip .moments-copy > *',
    '.closing > *'
  ];
  const nodes=[...document.querySelectorAll(selectors.join(','))];
  nodes.forEach(node=>{
    node.setAttribute('data-cb-reveal','');
    if(node.classList.contains('flavor')){
      const siblings=[...node.parentElement.children];
      node.style.setProperty('--cb-delay',Math.min(siblings.indexOf(node)*65,325)+'ms');
    }else if(node.classList.contains('step')){
      const siblings=[...node.parentElement.children];
      node.style.setProperty('--cb-delay',Math.min(siblings.indexOf(node)*85,170)+'ms');
    }
  });
  root.classList.add('cb-motion-ready');
  const io=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting){
        entry.target.classList.add('cb-in-view');
        io.unobserve(entry.target);
      }
    }
  },{rootMargin:'0px 0px -6% 0px',threshold:.07});
  nodes.forEach(node=>io.observe(node));
  const progress=document.createElement('div');
  progress.className='cb-progress';
  progress.setAttribute('aria-hidden','true');
  const fill=document.createElement('span');
  progress.append(fill);
  document.body.append(progress);
  let scheduled=false;
  const update=()=>{
    scheduled=false;
    const doc=document.documentElement;
    const total=Math.max(1,doc.scrollHeight-doc.clientHeight);
    const value=Math.min(1,Math.max(0,doc.scrollTop/total));
    fill.style.transform='scaleX('+value.toFixed(4)+')';
  };
  const request=()=>{
    if(scheduled)return;
    scheduled=true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',request,{passive:true});
  request();
})();
