/* The Launch Era — demo interaction polish 2026-11-08.
   No action interception, fake order status, network requests or pricing edits. */
(() => {
 'use strict';
 const formFields = 'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]),select,textarea';
 function enhanceForm(form){
  if(form.dataset.tleUxEnhanced)return;
  form.dataset.tleUxEnhanced='yes';
  form.classList.add('tle-ux-form');
  const inputs=[...form.querySelectorAll(formFields)].filter(el=>!el.disabled);
  const update=el=>{
   const value=String(el.value||'').trim();
   el.dataset.tleFilled=String(Boolean(value));
   const label=el.closest('label');
   if(label)label.classList.add('tle-ux-field');
  };
  inputs.forEach(el=>{
   update(el);
   const label=el.closest('label');
   el.addEventListener('focus',()=>label?.classList.add('tle-ux-active'));
   el.addEventListener('blur',()=>label?.classList.remove('tle-ux-active'));
   el.addEventListener('input',()=>update(el));
   el.addEventListener('change',()=>update(el));
  });
  form.addEventListener('reset',()=>requestAnimationFrame(()=>inputs.forEach(update)));
 }
 function scan(scope=document){
  if(scope.matches?.('form'))enhanceForm(scope);
  scope.querySelectorAll?.('form').forEach(enhanceForm);
  const selector='dialog,[role="dialog"],.bag-dialog,.cart-drawer,.cart-panel,.preview-dialog,.modal-panel,.modal-root';
  if(scope.matches?.(selector))scope.classList.add('tle-ux-dialog');
  scope.querySelectorAll?.(selector).forEach(el=>el.classList.add('tle-ux-dialog'));
 }
 const boot=()=>{
  scan();
  let queued=false;
  new MutationObserver(records=>{
   if(queued||!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1)))return;
   queued=true;queueMicrotask(()=>{queued=false;scan()});
  }).observe(document.body,{childList:true,subtree:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})();
