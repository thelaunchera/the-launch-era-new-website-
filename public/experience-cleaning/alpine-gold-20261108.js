/* Experience Cleaning: presentation-only enhancements.
   Existing app.js owns booking state, translations and pricing. */
(() => {
  'use strict';
  const root=document.body;
  if(root?.dataset.tleExperience!=='cleaning')return;
  const summary=document.getElementById('booking-visual-image');
  const title=document.getElementById('booking-visual-title');
  const progress=document.querySelector('.booking-progress-line');
  if(!summary||!title||!progress)return;
  let frame=0;
  const update=()=>{
    frame=0;
    const current=document.querySelector('.booking-category-tab.is-active');
    const commercial=current?.dataset.category==='commercial';
    const grid=document.getElementById(commercial?'commercial-service-grid':'service-grid');
    const picked=grid?.querySelector('.service-card.is-selected')||grid?.querySelector('.service-card');
    const photo=picked?.querySelector('img');
    const label=picked?.querySelector('strong');
    const src=photo?.getAttribute('src');
    if(src?.startsWith('/') && summary.getAttribute('src')!==src)summary.setAttribute('src',src);
    if(label)title.textContent=label.textContent.trim();
    summary.alt=label?.textContent.trim()||'';
    const currentStep=document.querySelector('.steps .step.is-current')?.dataset.stepLabel||'1';
    progress.dataset.step=currentStep;
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const observer=new MutationObserver(schedule);
  for(const selector of ['.steps','#service-grid','#commercial-service-grid','.booking-category']){
    const el=document.querySelector(selector);
    if(el)observer.observe(el,{subtree:true,attributes:true,attributeFilter:['class','aria-checked'],characterData:true,childList:true});
  }
  root.addEventListener('click',event=>{
    if(event.target.closest('.booking-category-tab,.service-card,#next,#back,#restart,#language'))schedule();
  });
  update();
})();
