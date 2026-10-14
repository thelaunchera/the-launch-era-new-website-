/* The Launch Era Smart Welcome: optional, tenant-scoped enhancement.
   No booking, pricing, quote, identity or customer fields are modified. */
(function () {
  'use strict';
  const endpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-smart-welcome';
  const enEs=(lang,en,es)=>lang==='es'?es:en;
  const safeColor=(value,fallback)=>/^#[0-9a-f]{6}$/i.test(String(value||''))?value:fallback;
  const safeImage=value=>{try{const url=new URL(String(value||''));return url.protocol==='https:'&&!url.username&&!url.password&&url.href.length<900?url.href:''}catch{return ''}};
  const fromStorage=(storage,key)=>{try{return storage.getItem(key)||''}catch{return ''}};
  const toStorage=(storage,key,value)=>{try{storage.setItem(key,value)}catch{}};
  const element=(tag,cls,copy)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(copy)n.textContent=copy;return n};
  const message=(data,base,lang)=>String(data[base+'_'+lang]||data[base+'_en']||'').trim();
  function titleText(data,lang,business){return message(data,'headline',lang)||enEs(lang,'Welcome to '+business,'Bienvenido a '+business)}
  function anchorBooking(){
    const target=document.getElementById('booking');
    if(target){target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
    else window.location.hash='booking';
  }
  function content(data,model,lang){
    const name=String(model.business_name||'').slice(0,100)||enEs(lang,'Your cleaning provider','Tu empresa de limpieza');
    const picture=safeImage(data.image_url)||safeImage(model.branding?.hero_image);
    const offer=message(data,'offer',lang);
    const wrap=element('div','tle-sw-body');
    const photo=element('div','tle-sw-visual');
    if(picture){const img=element('img','tle-sw-image');img.src=picture;img.alt='';img.loading='eager';photo.append(img);}
    else photo.classList.add('tle-sw-no-image');
    const small=element('span','tle-sw-eyebrow',enEs(lang,'A WARM WELCOME','UNA BIENVENIDA ESPECIAL'));
    const nameEl=element('span','tle-sw-business',name);
    photo.append(nameEl);
    const text=element('div','tle-sw-copy');
    text.append(small,element('h2','tle-sw-title',titleText(data,lang,name)));
    const desc=message(data,'description',lang);
    if(desc)text.append(element('p','tle-sw-description',desc));
    if(offer){const promo=element('div','tle-sw-promo');promo.append(element('span','tle-sw-promo-label',enEs(lang,'CURRENT OFFER','OFERTA ACTUAL')));promo.append(element('strong','tle-sw-offer',offer));text.append(promo);}
    const terms=message(data,'terms',lang);
    if(terms)text.append(element('p','tle-sw-terms',terms));
    const actions=element('div','tle-sw-actions');
    const cta=element('button','tle-sw-book',message(data,'cta',lang)||enEs(lang,'Continue to booking','Continuar a la reserva'));
    cta.type='button';cta.dataset.swAction='book';
    const skip=element('button','tle-sw-skip',enEs(lang,'No thanks, continue','No gracias, continuar'));
    skip.type='button';skip.dataset.swAction='skip';
    actions.append(cta,skip);
    text.append(actions);wrap.append(photo,text);
    return wrap;
  }
  function showCard(data,model,lang){
    const trust=document.querySelector('.trust')||document.getElementById('leadHero');
    if(!trust)return;
    const card=element('aside','tle-sw-return-card');
    card.style.setProperty('--sw-accent',safeColor(model.branding?.accent_color,'#3a7399'));
    card.append(element('span','tle-sw-return-icon','✦'));
    const words=element('div','tle-sw-return-words');
    words.append(element('strong','',message(data,'offer',lang)||titleText(data,lang,model.business_name||'')));
    words.append(element('span','',enEs(lang,'Explore our current welcome message','Descubre nuestra bienvenida')));
    card.append(words);
    const action=element('button','tle-sw-return-open',enEs(lang,'View offer','Ver oferta'));
    action.type='button';card.append(action);
    const reopen=()=>showModal(data,model,lang);
    action.addEventListener('click',reopen);
    trust.insertAdjacentElement('afterend',card);
  }
  function showModal(data,model,lang){
    if(document.querySelector('.tle-sw-backdrop'))return;
    const backdrop=element('div','tle-sw-backdrop');
    const dialog=element('section','tle-sw-dialog');
    dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-label',enEs(lang,'Welcome to your booking page','Bienvenida a tu página de reservas'));
    dialog.style.setProperty('--sw-accent',safeColor(model.branding?.accent_color,'#3a7399'));
    const close=element('button','tle-sw-close','×');
    close.type='button';close.setAttribute('aria-label',enEs(lang,'Close welcome','Cerrar bienvenida'));
    dialog.append(close,content(data,model,lang));backdrop.append(dialog);
    const previous=document.activeElement;
    const dismiss=(book)=>{backdrop.remove();document.removeEventListener('keydown',keyDown);if(previous?.isConnected&&typeof previous.focus==='function')previous.focus({preventScroll:true});if(book)anchorBooking();};
    function keyDown(e){
      if(e.key==='Escape'){e.preventDefault();dismiss(false);return}
      if(e.key!=='Tab')return;
      const controls=Array.from(dialog.querySelectorAll('button'));
      const idx=controls.indexOf(document.activeElement);
      if(e.shiftKey&&idx<=0){e.preventDefault();controls.at(-1).focus();}
      else if(!e.shiftKey&&idx===controls.length-1){e.preventDefault();controls[0].focus();}
    }
    close.onclick=()=>dismiss(false);
    dialog.querySelector('[data-sw-action="skip"]').onclick=()=>dismiss(false);
    dialog.querySelector('[data-sw-action="book"]').onclick=()=>dismiss(true);
    backdrop.addEventListener('click',e=>{if(e.target===backdrop)dismiss(false)});
    document.body.append(backdrop);document.addEventListener('keydown',keyDown);close.focus({preventScroll:true});
  }
  async function init({bookingKey,model,ownerPreview=false,language='en'}={}){
    if(ownerPreview||!model||!bookingKey||!document.getElementById('booking'))return;
    if(new URLSearchParams(location.search).get('skip_welcome')==='1')return;
    const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),2800);
    let data;
    try{
      const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'public',booking_key:bookingKey}),signal:ctrl.signal,cache:'no-store'});
      if(!res.ok)return;
      const result=await res.json();data=result?.welcome;
      if(!data?.enabled)return;
    }catch{return}finally{clearTimeout(timeout)}
    const lang=language==='es'?'es':'en';
    const identity='tle-sw-seen-'+bookingKey;
    const campaign='tle-sw-session-'+bookingKey+'-'+String(data.updated_at||'');
    const repeat=!!fromStorage(localStorage,identity)||!!fromStorage(sessionStorage,campaign);
    toStorage(localStorage,identity,'1');
    toStorage(sessionStorage,campaign,'1');
    // An explicit booking deep link should never be interrupted by a marketing modal.
    if(repeat||location.hash==='#booking'){showCard(data,model,lang);return}
    setTimeout(()=>{if(document.visibilityState==='visible'&&!document.querySelector('.tle-sw-backdrop'))showModal(data,model,lang)},700);
  }
  window.TLESmartWelcome=Object.freeze({init});
})();