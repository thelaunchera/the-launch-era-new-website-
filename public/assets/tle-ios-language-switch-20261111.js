/* Brand-aware iOS visual switch; delegates to each demo's existing EN/ES handler.
   No automatic translation, no duplicate English/Spanish content or fake action. */
(function(){
 'use strict';
 const root=document.documentElement;
 if(root.dataset.tleIosLocaleLoaded)return;
 root.dataset.tleIosLocaleLoaded='1';
 const selectors=['.language-toggle','.lang-switch','.cb-language-selector','.langs',
  '.lang[aria-label*="Language"]','[role="group"][aria-label="Idioma / Language"]'];
 const singles=['#langToggle','#language','#lang','#locale','.lang-btn','#demoLanguage'];
 const linkSelectors=['a.tle-website-language','a[hreflang][class*="language"]','a[data-language-switch]'];
 const opt=(raw)=>String(raw||'').trim().toLowerCase().startsWith('es')?'es':'en';
 const langPath=()=>location.pathname.startsWith('/es/')?'es':opt(root.lang);
 const colorValid=(v)=>{
  if(!v||v==='transparent'||v==='inherit'||v==='initial'||/rgba?\(0, 0, 0, 0\)/.test(v))return false;
  const t=document.createElement('span');t.style.color=v;
  return t.style.color!==''&& !/^#fff(?:fff)?$/i.test(v);
 };
 function brandAccent(source){
  const css=getComputedStyle(root),btn=source?getComputedStyle(source):null;
  const vars=['--brand-accent','--accent','--brand-color','--brand','--primary','--accent-color','--color-accent','--highlight','--gold','--pink'];
  for(const v of vars){
    const val=css.getPropertyValue(v).trim()||btn?.getPropertyValue(v)?.trim()||'';
    if(colorValid(val))return val;
  }
  const bg=btn?.backgroundColor;
  if(colorValid(bg)&&!['rgb(255, 255, 255)','rgb(0, 0, 0)'].includes(bg))return bg;
  const meta=document.querySelector('meta[name="theme-color"]')?.getAttribute('content');
  if(colorValid(meta))return meta;
  const visual=document.querySelector('.btn.primary,.primary-button,.btn-primary,.btn.dark,.cta-primary,.add-to-cart');
  const fallback=visual&&getComputedStyle(visual).backgroundColor;
  return colorValid(fallback)?fallback:'#F2D85B';
 }
 const label=on=>on?'English selected. Switch to Spanish.':'Español seleccionado. Cambiar a inglés.';
 function styleSwitch(btn,on,accent){
  btn.className=(btn.className||'')+' tle-ios-locale-switch';
  btn.dataset.on=String(on);
  btn.style.setProperty('--tle-locale-accent',accent||'#F2D85B');
  btn.innerHTML='<span class="tle-ios-locale-label" aria-hidden="true">ES</span><span class="tle-ios-locale-label" aria-hidden="true">EN</span><span class="tle-ios-locale-knob" aria-hidden="true"></span>';
  if(btn.tagName==='BUTTON'){btn.setAttribute('role','switch');btn.setAttribute('aria-checked',String(on));btn.setAttribute('aria-label',label(on))}
  else btn.setAttribute('aria-label',label(on));
 }
 function set(btn,on){
  btn.dataset.on=String(on);
  if(btn.tagName==='BUTTON'){btn.setAttribute('aria-checked',String(on));btn.setAttribute('aria-label',label(on))}
  else btn.setAttribute('aria-label',label(on));
 }
 function selectedFromButtons(buttons){
  const chosen=buttons.find(b=>b.getAttribute('aria-pressed')==='true')||
   buttons.find(b=>b.classList.contains('active')||b.classList.contains('is-active'));
  const pick=chosen?.dataset.lang||chosen?.dataset.langOption||chosen?.id||chosen?.textContent;
  if(/^(es|espa[ñn]ol)$/i.test(String(pick||'').trim()))return'es';
  if(/^(en|english)$/i.test(String(pick||'').trim()))return'en';
  return langPath();
 }
 function getTarget(buttons,lang){
  return buttons.find(b=>{
   const value=b.dataset.lang||b.dataset.langOption||b.id||b.textContent;
   return lang==='es'?/^(es|espa[ñn]ol)$/i.test(String(value||'').trim()):
      /^(en|english)$/i.test(String(value||'').trim());
  });
 }
 function hookGroup(group){
  const buttons=[...group.querySelectorAll('button')].filter(b=>/^(en|es|english|espa[ñn]ol)$/i.test(
   (b.dataset.lang||b.dataset.langOption||b.id||b.textContent||'').trim()));
  if(buttons.length<2)return false;
  const original=selectedFromButtons(buttons),current={value:original};
  const btn=document.createElement('button');btn.type='button';
  styleSwitch(btn,current.value==='en',brandAccent(buttons.find(b=>b.getAttribute('aria-pressed')==='true')||buttons[0]));
  btn.addEventListener('click',()=>{
   const next=current.value==='en'?'es':'en',target=getTarget(buttons,next);
   if(!target)return;
   target.click();
   current.value=selectedFromButtons(buttons);
   if(current.value!==next&&root.lang!==next)current.value=next;
   set(btn,current.value==='en');
   requestAnimationFrame(()=>{current.value=selectedFromButtons(buttons);set(btn,current.value==='en')});
  });
  buttons.forEach(b=>{b.classList.add('tle-ios-locale-original');b.tabIndex=-1;b.setAttribute('aria-hidden','true')});
  group.classList.add('tle-ios-locale-group');
  group.append(btn);
  const obs=new MutationObserver(()=>{current.value=selectedFromButtons(buttons);set(btn,current.value==='en')});
  buttons.forEach(b=>obs.observe(b,{attributes:true,attributeFilter:['aria-pressed','class']}));
  return true;
 }
 function hookSingle(original){
  if(!original||original.classList.contains('tle-ios-locale-original'))return false;
  const isSelect=original.tagName==='SELECT';
  if(!isSelect&&original.tagName!=='BUTTON')return false;
  const current={value:isSelect?opt(original.value):langPath()};
  if(!isSelect){
   const txt=original.textContent.trim().toLowerCase();
   if(txt==='es'||txt==='español')current.value='en';
   else if(txt==='en'||txt==='english')current.value='es';
  }
  const btn=document.createElement('button');btn.type='button';
  styleSwitch(btn,current.value==='en',brandAccent(original));
  btn.addEventListener('click',()=>{
   const next=current.value==='en'?'es':'en';
   const before=original.textContent.trim();
   if(isSelect){original.value=next;original.dispatchEvent(new Event('change',{bubbles:true}))}
   else original.click();
   const after=original.textContent.trim();
   if(root.lang===next||after!==before||isSelect){
     current.value=next;
     set(btn,current.value==='en');
   }
   requestAnimationFrame(()=>{if(root.lang===next)set(btn,true);});
  });
  original.classList.add('tle-ios-locale-original');
  original.tabIndex=-1;original.setAttribute('aria-hidden','true');
  original.insertAdjacentElement('afterend',btn);
  return true;
 }
 function hookLink(link){
  if(!link||link.classList.contains('tle-ios-locale-switch'))return false;
  const target=link.getAttribute('href');if(!target||target.startsWith('#'))return false;
  const current=langPath();
  styleSwitch(link,current==='en',brandAccent(link));
  // This is a real navigation to the existing translated page, not a locale simulation.
  link.setAttribute('title',current==='en'?'Español':'English');
  return true;
 }
 let installed=false;
 for(const selector of selectors){const group=document.querySelector(selector);if(group&&hookGroup(group)){installed=true;break}}
 if(!installed)for(const selector of singles){const node=document.querySelector(selector);if(node&&hookSingle(node)){installed=true;break}}
 if(!installed)for(const selector of linkSelectors){const link=document.querySelector(selector);if(link&&hookLink(link)){installed=true;break}}
 if(!installed){
  const pair=document.currentScript?.dataset?.tleAlternatePath;
  if(pair&&/^\//.test(pair)){
   const host=document.querySelector('header nav,header .header-actions,header .nav-actions,header')||document.body;
   const a=document.createElement('a');a.href=pair;
   styleSwitch(a,langPath()==='en',brandAccent(host));
   a.title=langPath()==='en'?'Español':'English';
   a.style.marginLeft='8px';host.append(a);
  }
 }
})();
