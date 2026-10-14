/* Buyer-only Smart Welcome editor. The private session and account ownership
   are verified server-side for every read/write; never trust workspace IDs alone. */
(function(){
 'use strict';
 const API='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-smart-welcome';
 let currentWorkspace='',loadCounter=0,lastSaved=null;
 const tr=(en,es)=>localStorage.getItem('tle_crm_language')==='es'?es:en;
 const node=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt)el.textContent=txt;return el};
 const field=(name,label,kind='input',rows=2)=>{
   const outer=node('label','tle-sw-editor-field');
   const title=node('span','',label);outer.append(title);
   const input=node(kind==='textarea'?'textarea':'input','tle-sw-editor-input');
   input.name=name;
   if(kind==='textarea')input.rows=rows;
   else if(kind==='date')input.type='datetime-local';
   else if(kind==='url')input.type='url';
   else input.type='text';
   input.maxLength=name.startsWith('headline')?125:name.startsWith('description')?360:name.startsWith('offer')?140:name.startsWith('terms')?240:name.startsWith('cta')?70:850;
   outer.append(input);
   return outer;
 };
 const localDate=(iso)=>{if(!iso)return '';const d=new Date(iso);return Number.isFinite(d.getTime())?new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16):''};
 function makeUI(root){
   root.replaceChildren();
   const heading=node('div','tle-sw-editor-heading');
   heading.append(node('h3','',tr('Smart Welcome · Promotions','Smart Welcome · Promociones')));
   heading.append(node('p','',tr('Give first-time visitors a warm introduction, and show returning visitors a quiet offer card. Does not change booking prices.','Recibe a nuevos visitantes con una presentación elegante y muestra una oferta discreta a quienes regresan. No cambia los precios de reserva.')));
   const form=node('form','tle-sw-editor-form');
   const toggle=node('label','tle-sw-editor-toggle');
   const enabled=node('input');enabled.type='checkbox';enabled.name='enabled';
   toggle.append(enabled,node('span','',tr('Publish Smart Welcome on my Booking Page','Publicar Smart Welcome en mi Booking Page')));
   form.append(toggle);
   for(const [lang,name] of [['en','English'],['es','Español']]){
     const details=node('details','tle-sw-editor-language');details.open=lang==='en';
     details.append(node('summary','',name));
     const wrap=node('div','tle-sw-editor-grid');
     wrap.append(field('headline_'+lang,tr('Welcome headline','Título de bienvenida')),field('description_'+lang,tr('Short introduction','Presentación breve'),'textarea',3));
     wrap.append(field('offer_'+lang,tr('Current promotion (optional)','Promoción actual (opcional)')));
     wrap.append(field('terms_'+lang,tr('Promotion conditions (required if offering a promotion)','Condiciones (obligatorias si hay promoción)'),'textarea',2));
     wrap.append(field('cta_'+lang,tr('Booking button','Botón para reservar')));
     details.append(wrap);form.append(details);
   }
   const other=node('div','tle-sw-editor-grid');
   other.append(field('image_url',tr('Cover photo URL (HTTPS)','URL de la foto (HTTPS)'),'url'));
   other.append(field('starts_at',tr('Start showing (optional)','Mostrar desde (opcional)'),'date'));
   other.append(field('ends_at',tr('Stop showing (optional)','Dejar de mostrar (opcional)'),'date'));
   form.append(other);
   const small=node('p','tle-sw-editor-note',tr('Only publish genuine promotions. Set eligibility and expiration in the terms. Promotions do not automatically change price calculations or guarantee a discount.','Publica solo promociones reales. Especifica condiciones y vencimiento. Las promociones no modifican automáticamente el cálculo ni garantizan un descuento.'));
   form.append(small);
   const actions=node('div','tle-sw-editor-actions');
   const preview=node('button','secondary',tr('Preview flyer','Vista previa del flyer'));preview.type='button';preview.dataset.action='preview';
   const save=node('button','',tr('Save changes','Guardar cambios'));save.type='submit';save.dataset.action='save';
   actions.append(preview,save);form.append(actions);
   const status=node('p','tle-sw-editor-status',tr('Loading welcome settings…','Cargando opciones…'));status.setAttribute('role','status');status.setAttribute('aria-live','polite');
   const sample=node('div','tle-sw-editor-preview');sample.hidden=true;
   root.append(heading,form,status,sample);
   return {form,status,sample,preview,save};
 }
 function read(form){
   const result={enabled:form.elements.enabled.checked};
   for(const key of ['headline_en','headline_es','description_en','description_es','offer_en','offer_es','terms_en','terms_es','cta_en','cta_es','image_url']){
     result[key]=String(form.elements[key].value||'').trim();
   }
   for(const k of ['starts_at','ends_at']){
     const v=String(form.elements[k].value||'');
     result[k]=v?new Date(v).toISOString():null;
   }
   return result;
 }
 function fill(form,config){
   form.elements.enabled.checked=config.enabled===true;
   for(const key of ['headline_en','headline_es','description_en','description_es','offer_en','offer_es','terms_en','terms_es','cta_en','cta_es','image_url']){
     form.elements[key].value=String(config[key]||'');
   }
   form.elements.starts_at.value=localDate(config.starts_at);
   form.elements.ends_at.value=localDate(config.ends_at);
 }
 function previewData(panel,config){
   panel.replaceChildren();panel.hidden=false;
   const card=node('article','tle-sw-preview-card');
   const imgURL=String(config.image_url||'');
   if(/^https:\/\//.test(imgURL)){
     const img=node('img');img.src=imgURL;img.alt='';img.loading='lazy';card.append(img);
   }
   const copy=node('div','');
   copy.append(node('span','',tr('PREVIEW · NOTHING PUBLISHED','VISTA PREVIA · NADA PUBLICADO')));
   copy.append(node('h4','',config.headline_en||config.headline_es||tr('Welcome','Bienvenido')));
   if(config.description_en||config.description_es)copy.append(node('p','',config.description_en||config.description_es));
   if(config.offer_en||config.offer_es)copy.append(node('strong','',config.offer_en||config.offer_es));
   if(config.terms_en||config.terms_es)copy.append(node('small','',config.terms_en||config.terms_es));
   const cta=node('span','tle-sw-preview-button',config.cta_en||config.cta_es||tr('Continue to booking','Continuar a la reserva'));copy.append(cta);
   card.append(copy);panel.append(card);
 }
 async function call(action,workspaceId,getToken,config){
   const token=await getToken();
   if(!token)throw Error(tr('Sign in again before editing.','Inicia sesión antes de editar.'));
   const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
     body:JSON.stringify({action,workspace_id:workspaceId,...(config?{config}:{})})});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw Error(String(data.error||tr('Could not load settings.','No se pudo cargar.')));
   return data;
 }
 async function mount({workspaceId,bookingUrl,getToken}={}){
   const share=document.getElementById('buyerBookingShareCard');
   if(!share||!workspaceId||typeof getToken!=='function'||!/^https:\/\/thelaunchera\.com\/(booking\/|base-booking\.html)/.test(String(bookingUrl||'')))return;
   let root=document.getElementById('buyerSmartWelcomeEditor');
   if(!root){
     root=node('section','panel tle-sw-editor');root.id='buyerSmartWelcomeEditor';
     root.style.cssText='padding:19px;margin:18px 0;border:1px solid #cddfea;background:#fff;min-width:0';
     share.insertAdjacentElement('afterend',root);
   }
   root.hidden=false;
   if(currentWorkspace===workspaceId&&lastSaved)return;
   currentWorkspace=workspaceId;lastSaved=null;
   const seq=++loadCounter,ui=makeUI(root);
   try{
     const data=await call('get',workspaceId,getToken);
     if(seq!==loadCounter||currentWorkspace!==workspaceId)return;
     fill(ui.form,data.welcome||{});lastSaved=data.welcome||{};
     ui.status.textContent=tr('Ready. Visitors will only see this when you enable it and save.','Listo. Los visitantes solo lo verán cuando lo actives y guardes.');
     ui.preview.onclick=()=>{try{previewData(ui.sample,read(ui.form))}catch{ui.status.textContent=tr('Check the date fields.','Revisa las fechas.')}};
     ui.form.onsubmit=async(event)=>{
       event.preventDefault();ui.save.disabled=true;ui.status.textContent=tr('Saving…','Guardando…');
       try{
         const config=read(ui.form);
         const saved=await call('save',workspaceId,getToken,config);
         lastSaved={...config,updated_at:saved.updated_at};
         ui.status.textContent=config.enabled?tr('✓ Published for your Booking Page.','✓ Publicado en tu Booking Page.'):tr('✓ Saved as draft. Smart Welcome is off.','✓ Borrador guardado. Smart Welcome está desactivado.');
       }catch(error){ui.status.textContent=tr('Could not save: ','No se pudo guardar: ')+error.message}
       finally{ui.save.disabled=false}
     };
   }catch(error){if(seq===loadCounter)ui.status.textContent=tr('Welcome settings unavailable: ','No se pudieron cargar las promociones: ')+error.message;}
 }
 window.TLEBuyerWelcomeEditor=Object.freeze({mount});
})();