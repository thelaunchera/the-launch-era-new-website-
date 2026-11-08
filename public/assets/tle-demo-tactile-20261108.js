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
  // Existing add-to-cart / selection handlers remain responsible for all real state.
  const actions='button.add-cookie,button.add-to-cart,button.add-to-bag,button.add-to-box,button.bag-trigger,button.cart-trigger,button[data-product],button[data-dish],button[class*="add-"],button[class*="cart-"],button[class*="bag-"],button[id*="cart" i],button[id*="bag" i]';
  const touch=el=>{
   if(el.dataset.tleUxAction)return;
   el.dataset.tleUxAction='yes';el.classList.add('tle-ux-purchase-action');
   const press=()=>{el.dataset.tlePressed='true'};
   const release=()=>{el.dataset.tlePressed='false'};
   el.addEventListener('pointerdown',press,{passive:true});
   el.addEventListener('pointerup',release,{passive:true});
   el.addEventListener('pointercancel',release,{passive:true});
   el.addEventListener('pointerleave',release,{passive:true});
   el.addEventListener('blur',release);
  };
  if(scope.matches?.(actions))touch(scope);
  scope.querySelectorAll?.(actions).forEach(touch);
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
