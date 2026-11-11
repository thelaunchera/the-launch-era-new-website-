/* Settings facade: always delegates to the existing CRM controls and keeps
 * the saved state authoritative; it never claims an email automation was enabled. */
(function(){
 'use strict';
 const root=document.getElementById('settingsHub');
 if(!root)return;
 const language=root.querySelector('#tleIosSettingsLanguage');
 const compact=root.querySelector('#tleIosSettingsCompact');
 const followup=root.querySelector('#tleIosSettingsFollowups');
 const followupRow=root.querySelector('#tleIosMailRow');
 const select=root.querySelector('#settingsLanguage');
 const activate=document.getElementById('buyerActivateMail');
 const pause=document.getElementById('buyerPauseMail');
 const state=document.getElementById('settingsFollowupStatus');
 const set=(el,on)=>{if(!el)return;el.dataset.on=String(Boolean(on));el.setAttribute('aria-checked',String(Boolean(on)));};
 const getCompact=()=>{try{return localStorage.getItem('tle_crm_compact_view')==='on'}catch{return false}};
 const getLocale=()=>{try{return localStorage.getItem('tle_crm_language')==='es'?'es':'en'}catch{return'en'}};
 const userIsBuyer=()=>document.body.classList.contains('crm-buyer-view')&&!document.body.classList.contains('crm-owner-view');
 const mailOn=()=>!!pause&&!pause.disabled;
 const mailCanActivate=()=>!!activate&&!activate.disabled;
 function sync(){
  const locale=getLocale();
  set(language,locale==='en');
  set(compact,getCompact());
  if(document.body.classList.contains('tle-crm-compact')!==getCompact())
   document.body.classList.toggle('tle-crm-compact',getCompact());
  if(followupRow)followupRow.hidden=!userIsBuyer();
  if(followup){
   set(followup,mailOn());
   followup.disabled=!userIsBuyer()||(!mailOn()&&!mailCanActivate());
   followup.title=followup.disabled?'Finish email setup or refresh status before changing this setting.':'';
  }
 }
 language?.addEventListener('click',()=>{
   if(!select)return;
   select.value=getLocale()==='en'?'es':'en';
   select.dispatchEvent(new Event('change',{bubbles:true}));
   sync();
 });
 compact?.addEventListener('click',()=>{
   const next=!getCompact();
   try{localStorage.setItem('tle_crm_compact_view',next?'on':'off')}catch{}
   sync();
 });
 followup?.addEventListener('click',()=>{
  if(followup.disabled)return;
  // The original controls run confirmation, backend writes, and refresh.
  // Animation changes only after server-backed controls confirm the state.
  if(mailOn())pause?.click();
  else if(mailCanActivate())activate?.click();
 });
 const observer=new MutationObserver(()=>sync());
 if(activate)observer.observe(activate,{attributes:true,attributeFilter:['disabled']});
 if(pause)observer.observe(pause,{attributes:true,attributeFilter:['disabled']});
 if(state)observer.observe(state,{childList:true,subtree:true});
 const classObserver=new MutationObserver(sync);
 classObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
 select?.addEventListener('change',sync);
 window.addEventListener('pageshow',sync);
 document.getElementById('crmLanguageSelect')?.addEventListener('change',()=>queueMicrotask(sync));
 sync();
})();
