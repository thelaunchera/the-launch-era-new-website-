const $=id=>document.getElementById(id),BASE='https://bowacxhmjvrqixtwaikv.supabase.co',KEY='sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB';
const db=window.supabase?.createClient?.(BASE,KEY,{auth:{storageKey:'tle-crm-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
let state=null,verified=false,busy=false,generation=0;
let language=localStorage.getItem('tle_crm_owner_language')==='es'?'es':'en';
const es={private:'COMMAND CENTER PRIVADO',back:'← Command Center',eyebrow:'TU ESPACIO DE VENTAS',headline:'Un próximo paso claro.\nPara cada prospecto.',intro:'Revisa lo pendiente, consulta las fuentes y prepara una demo útil.',due:'Seguimientos pendientes',today:'Próximas acciones',research:'Investigación y SEO',demos:'Demo de Clara',watch:'Monitoreo de páginas',documents:'Documentos',reports:'Informes',prospect:'Trabajando con',choose:'Elige un prospecto',refresh:'Actualizar',eastern:'Hora del Este',schedule:'Programa la próxima acción',date:'Fecha',note:'¿Qué debe pasar?',save:'Guardar próxima acción',scheduleNote:'Se actualiza la fecha de seguimiento. La autorización y el envío de correos siguen en el flujo existente del CRM.',researchTitle:'Empieza por el website real.',researchNote:'Revisa una página pública: título, descripción, encabezado y enlaces de reserva visibles. No incluye rankings ni volumen de búsquedas.',website:'Website público',scan:'Revisar y guardar fuentes',demoTitle:'El demo de reservas de Clara.',demoNote:'Abre el demo privado completo con sus servicios, fotos, formulario de reservas y Sonny.',area:'Área de servicio',services:'Servicios · uno por línea',prepareDemo:'Abrir demo de Clara',claraClose:'Cerrar demo',claraRetry:'Volver a intentar',claraTitle:'Demo privado de Clara',downloadDemo:'Descargar concepto privado',demoReview:'Confirma servicios, identidad, fotos y disponibilidad con el negocio antes de una publicación real. Las imágenes son ilustrativas.',watchTitle:'Entérate cuando una página cambie.',watchNote:'Hasta 10 páginas públicas, revisadas a diario. Los cambios aparecen aquí y en tu campana. Un cambio de texto no demuestra un cambio de precio.',label:'Nombre',addWatch:'Añadir página',documentTitle:'Menos datos para transcribir.',documentNote:'Las herramientas locales extraen texto de PDFs e imágenes con PaddleOCR. Los documentos se quedan en tu computadora; revisa el texto antes de usarlo.',windows:'Herramientas locales para Windows',windowsNote:'Descarga el kit, extráelo y abre Start-TLE-Tools.cmd. Necesita Python 3.10–3.12. OCR se instala solo al seleccionarlo.',downloadKit:'Descargar herramientas locales',products:'Productos y pagos',productsTitle:'Productos y enlaces de compra',productsIntro:'Un solo lugar para revisar las páginas y checkouts reales; abrir un checkout no registra una venta.',prelaunchProducts:'En preparación · sin checkout',prelaunchNote:'Estos productos todavía no se pueden comprar. Esta página no activa automatizaciones.',locked:'NO ESTÁ A LA VENTA',privateCourse:'Aula privada; solo vista de administración',labPaused:'Link pausado y automatización de acceso aún en QA',noCheckout:'Checkout no habilitado',podcastProducts:'Podcast · productos digitales independientes',podcastNote:'Sus pagos y entregas se gestionan separados de los servicios de The Launch Era.',productPage:'PÁGINA DE PRODUCTO',openProduct:'Abrir página',productDisclaimer:'Un enlace de pago no confirma una venta ni una entrega. Los permisos y registros siguen en sus sistemas existentes. Aquí no creamos checkouts.',reportTitle:'Un informe que puedes verificar.',reportNote:'Exporta las cifras actuales y sus fuentes como JSON o PowerPoint editable. No se inventan conversiones, ingresos ni resultados.',makeReport:'Generar y descargar informe',footer:'Las fuentes y los resultados se mantienen separados de mensajes, reservas y pagos.'};
const original=new Map([...document.querySelectorAll('[data-i18n]')].map(n=>[n,n.innerHTML]));
const tx=(en,sp)=>language==='es'?sp:en;
function translate(){document.documentElement.lang=language;for(const [n,html]of original){if(language==='es'&&es[n.dataset.i18n]){n.textContent=es[n.dataset.i18n];if(n.id==='headline')n.style.whiteSpace='pre-line'}else n.innerHTML=html}$('language').textContent=language==='es'?'EN':'ES';}
function element(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function message(text,error=false){$('notice').textContent=text;$('notice').classList.toggle('error',error)}
function lock(){generation++;verified=false;state=null;closeClaraDemo(false);$('app').hidden=true;$('loading').hidden=true;$('locked').hidden=false;$('demoFrame').srcdoc='';for(const id of ['leadList','researchResult','watchList','watchHistory','reportList'])$(id).replaceChildren();$('leadSelect').replaceChildren();document.querySelectorAll('input,textarea').forEach(n=>n.value='');}
async function api(input){
 const gen=generation;if(!db)throw Error(tx('Authentication unavailable. Open Command Center.','Acceso no disponible. Abre Command Center.'));
 const {data:{session},error}=await db.auth.getSession();if(error||!session?.access_token){lock();throw Error(tx('Sign in to continue.','Inicia sesión para continuar.'))}
 const r=await fetch(BASE+'/functions/v1/tle-owner-growth',{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY,Authorization:'Bearer '+session.access_token},body:JSON.stringify(input),signal:AbortSignal.timeout(32000)});
 const result=await r.json().catch(()=>({}));if(gen!==generation)throw Error('Session changed.');
 if(r.status===401){lock();throw Error(tx('Owner sign-in required.','Se requiere acceso de la dueña.'))}
 if(!r.ok||result.ok!==true)throw Error(result.error||tx('Could not complete this action.','No se pudo completar la acción.'));
 return result;
}
function selected(){const l=state?.leads.find(l=>l.id===$('leadSelect').value);if(!l)throw Error(tx('Choose a prospect first.','Elige un prospecto primero.'));return l}
function date(value){return value?new Date(value).toLocaleString(language==='es'?'es-US':'en-US',{timeZone:'America/New_York',dateStyle:'medium',timeStyle:'short'}):tx('Not checked','Sin revisar')}
function download(content,name,mime){const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function pickLead(id){$('leadSelect').value=id;const l=state?.leads.find(x=>x.id===id);$('researchUrl').value=l?.research_url||'';$('nextDate').value=l?.followup||'';}
const eventLabels={email_sent:['Email accepted for sending','Correo aceptado para envío'],email_delivered:['Delivery recorded','Entrega registrada'],email_failed:['Email failure recorded','Fallo de correo registrado'],demo_sent:['Demo email sent','Correo de demo enviado'],demo_queued:['Demo queued','Demo en cola'],interest_confirmed:['Interest confirmed','Interés confirmado'],consent_authorized:['Email permission recorded','Permiso de correo registrado'],confirmation_sent:['Confirmation email sent','Correo de confirmación enviado']};
function render(){
 if(!state||!verified)return;
 const selection=$('leadSelect').value;$('leadSelect').replaceChildren(element('option',tx('Choose a prospect','Elige un prospecto')));$('leadSelect').firstChild.value='';
 for(const l of state.leads){const o=element('option',l.business);o.value=l.id;$('leadSelect').append(o)}$('leadSelect').value=selection;
 $('dueCount').textContent=state.due;$('snapshotDate').textContent=date(state.checked_at);
 $('coverage').textContent=state.coverage.lead_limit_reached||state.coverage.event_limit_reached?tx('Partial list: export includes the loaded records only.','Lista parcial: la exportación incluye solo los registros cargados.'):tx('Current workspace · recent recorded events','Espacio actual · eventos recientes registrados');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());$('nextDate').min=today;
 const list=$('leadList');list.replaceChildren();
 const candidates=state.leads.filter(l=>!l.followup_blocked).sort((a,b)=>String(a.followup||'9999').localeCompare(String(b.followup||'9999'))).slice(0,12);
 for(const l of candidates){const c=element('article',undefined,'tool-card');c.append(element('span',l.stage,'tag'),element('h3',l.business),element('p',l.followup?tx('Next date · ','Próxima fecha · ')+l.followup:tx('No follow-up date yet','Sin fecha de seguimiento')));
 const latest=l.history[0];if(latest){const labels=eventLabels[latest.event_type];c.append(element('p',(labels?labels[language==='es'?1:0]:latest.event_type)+' · '+date(latest.created_at),'event'))}
 if(l.replied_at)c.append(element('p',tx('Reply recorded','Respuesta registrada')));
 const b=element('button',tx('Work on this lead →','Trabajar este prospecto →'));b.onclick=()=>{pickLead(l.id);$('leadSelect').focus()};c.append(b);list.append(c)}
 if(!candidates.length)list.append(element('p',tx('No eligible follow-ups in this workspace.','No hay seguimientos elegibles en este espacio.'),'muted'));
 const watches=$('watchList');watches.replaceChildren();
 for(const w of state.watches){const c=element('article',undefined,'tool-card');c.append(element('h3',w.label),element('p',w.url),element('span',w.active?w.last_status:tx('Paused','Pausado'),'tag'),element('p',date(w.last_checked_at)));
 const check=element('button',tx('Check now','Revisar ahora'));check.disabled=!w.active;check.onclick=()=>run(async()=>{const r=await api({action:'check_watch',id:w.id});message(r.checked?tx('Page checked. Review the saved comparison.','Página revisada. Consulta la comparación guardada.'):r.reason);await refresh()});
 const toggle=element('button',w.active?tx('Pause','Pausar'):tx('Resume','Reanudar'));toggle.onclick=()=>run(async()=>{await api({action:'toggle_watch',id:w.id,active:!w.active});await refresh()});c.append(check,toggle);watches.append(c)}
 $('watchHistory').replaceChildren(...state.records.filter(r=>r.kind==='watch_check').slice(0,8).map(evidenceCard));
 $('reportList').replaceChildren(...state.records.filter(r=>r.kind==='report').slice(0,5).map(evidenceCard));
 const latest=state.records.find(r=>r.kind==='research'&&r.lead_id===selection);if(latest)renderResearch(latest);
}
function evidenceCard(record){const d=element('details',undefined,'evidence'),s=element('summary',record.title+' · '+date(record.created_at));d.append(s);const data=record.data||{};
 if(data.source_url){const a=element('a',data.source_url,'source');try{const u=new URL(data.source_url);if(u.protocol==='https:'&&!u.username&&!u.password){a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';d.append(a)}}catch{}}
 d.append(element('pre',JSON.stringify(data,null,2)));return d;
}
function renderResearch(record){const root=$('researchResult');root.replaceChildren();const data=record.data;root.append(element('h3',data.title||tx('Public page check','Revisión de página pública')));
 const names={page_title:tx('Page title','Título'),meta_description:tx('Search description','Descripción'),main_heading:tx('Main heading','Encabezado principal'),booking_or_quote_link:tx('Booking / quote link','Enlace de reserva / estimado'),mobile_viewport:tx('Mobile viewport','Vista móvil')};
 for(const o of data.observations||[]){const row=element('div',undefined,'observation');row.append(element('span',names[o.key]||o.key),element('span',o.observed?tx('Observed','Observado'):tx('Not established','Sin confirmar')));root.append(row)}
 root.append(element('p',tx('One HTML page checked; forms, rankings and email delivery were not tested.','Se revisó una página HTML; formularios, rankings y entrega de correos no se probaron.'),'muted'),evidenceCard(record));
}
async function refresh(){const gen=generation;const data=await api({action:'list'});if(gen!==generation)return;state=data;verified=true;$('loading').hidden=true;$('locked').hidden=true;$('app').hidden=false;render();if($('products')&&!$('products').hidden)void renderSaleProducts()}
async function run(fn){if(busy||!verified)return;busy=true;const gen=generation;const buttons=[...document.querySelectorAll('form button,#refresh,#makeReport,#makePptx')];buttons.forEach(b=>b.disabled=true);message(tx('Working…','Trabajando…'));try{await fn()}catch(e){if(gen===generation)message(e.message,true)}finally{busy=false;buttons.forEach(b=>b.disabled=false)}}
async function powerpoint(data){
 if(!window.PptxGenJS&&!window.pptxgen)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='./vendor/pptxgenjs-4.0.1.bundle.js';s.onload=resolve;s.onerror=()=>reject(Error('PowerPoint export could not load.'));document.head.append(s)});
 const Presentation=window.PptxGenJS||window.pptxgen;if(typeof Presentation!=='function')throw Error('PowerPoint exporter unavailable.');
 const p=new Presentation();p.layout='LAYOUT_WIDE';p.author='The Launch Era';p.subject='Verified owner workspace snapshot';p.title='Sales Workspace';p.lang=language==='es'?'es-US':'en-US';p.theme={headFontFace:'Aptos Display',bodyFontFace:'Aptos',lang:p.lang};
 const slide=(heading,kicker)=>{const s=p.addSlide();s.background={color:'FAF8F3'};s.addText('THE LAUNCH ERA / '+kicker,{x:.6,y:.45,w:12,h:.3,fontSize:10,color:'205579',charSpacing:2});s.addText(heading,{x:.6,y:1.05,w:12,h:1.15,fontSize:34,color:'191919',bold:false,breakLine:false});s.addText(date(data.generated_at)+' · Eastern',{x:.6,y:7.05,w:12,h:.2,fontSize:9,color:'54636B'});return s};
 const a=slide(tx('Your sales workspace.','Tu espacio de ventas.'),'WORKSPACE SNAPSHOT');a.addText(tx('A source-backed snapshot, not a forecast.','Una revisión con fuentes, no una predicción.'),{x:.6,y:2.6,w:11,h:.6,fontSize:24,color:'54636B'});a.addText(data.scope,{x:.6,y:4.2,w:10,h:1.4,fontSize:17,color:'54636B'});
 const b=slide(tx('What needs attention.','Lo que necesita atención.'),'NEXT ACTIONS');for(const [i,item]of [[data.active_leads,tx('Active leads loaded','Prospectos activos cargados')],[data.due,tx('Follow-ups due','Seguimientos pendientes')],[data.evidence.length,tx('Recent source records','Registros recientes con fuente')]].entries()){b.addText(String(item[0]),{x:.6+i*4.1,y:2.5,w:3.5,h:1,fontSize:56,color:'205579'});b.addText(item[1],{x:.6+i*4.1,y:3.8,w:3.5,h:.8,fontSize:18,color:'191919'})}
 const c=slide(tx('The evidence behind the work.','Las fuentes detrás del trabajo.'),'RECENT SOURCES');const refs=data.evidence.slice(0,5);c.addText(refs.length?refs.map(r=>r.title+'\n'+(r.source_url||r.id)+' · '+date(r.created_at)).join('\n\n'):tx('No source records in this snapshot.','No hay registros con fuentes en esta revisión.'),{x:.6,y:2.45,w:12,h:4.2,fontSize:13,color:'191919',breakLine:false,margin:0});
 const d=slide(tx('Keep the coverage visible.','La cobertura, siempre visible.'),'LIMITS & NEXT STEPS');d.addText(tx('Loaded leads: ','Prospectos cargados: ')+data.active_leads+' / '+data.coverage.lead_limit+'\n'+tx('Recent-event limit: ','Límite de eventos recientes: ')+data.coverage.event_limit+'\n\n'+tx('Email delivery, booking functionality, conversions and revenue are not inferred from page observations.','La entrega de correos, las reservas, las conversiones y los ingresos no se deducen de observaciones de una página.'),{x:.6,y:2.5,w:11,h:3.5,fontSize:20,color:'54636B'});
 await p.writeFile({fileName:'TLE-sales-report.pptx'});
}
/* Checkout links from the existing TLE website inventory. Never generate Stripe URLs or claim paid access. */
let productCatalogLoaded=false;
function offerTag(){
 return element('span',tx('CHECKOUT ROUTE','RUTA DE CHECKOUT'),'tle-offer-state tle-on-sale');
}
async function renderSaleProducts(){
 const root=$('tleOfferGrid');if(!root||productCatalogLoaded)return;
 try{
  const response=await fetch('/assets/jessy-offers.json',{cache:'no-store'});
  if(!response.ok)throw Error('inventory');
  const inventory=await response.json();if(!Array.isArray(inventory.offers))throw Error('inventory');
  root.replaceChildren();
  for(const offer of inventory.offers){
   const article=element('article',undefined,'tle-offer-item');
   const checkout=typeof offer.checkout==='string'&&/^\/service-checkout\/\?offer=[a-z-]+$/.test(offer.checkout)?offer.checkout:null;
   article.append(checkout?offerTag():element('span',tx('NO CHECKOUT','SIN CHECKOUT'),'tle-offer-state'));
   const visual=element('div',undefined,'tle-offer-art tle-art-'+(offer.id||'default').replace(/[^a-z-]/g,''));
   visual.setAttribute('aria-hidden','true');
   visual.append(element('span','THE LAUNCH ERA'),element('strong',String(offer.name||'Offer').toUpperCase()));
   article.append(visual);
   article.append(element('h4',offer.name||'Offer'),element('p',language==='es'?offer.short_es:offer.short_en));
   const price=element('p',language==='es'?offer.price_es:offer.price_en,'tle-offer-price');article.append(price);
   const actions=element('div',undefined,'tle-offer-actions');
   if(offer.details&&typeof offer.details==='string'&&/^\/[a-z0-9/-]+\/?$/.test(offer.details)){
    const a=element('a',tx('Product details','Ver producto'),'tle-offer-details');a.href=offer.details;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);
   }
   if(checkout){const a=element('a',tx('Open checkout','Abrir checkout'),'tle-offer-open');a.href=checkout;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);}
   else actions.append(element('span',tx('No Stripe checkout','Sin checkout Stripe'),'tle-offer-disabled'));
   article.append(actions);root.append(article);
  }
  productCatalogLoaded=true;
 }catch{root.replaceChildren(element('p',tx('Could not read the verified offer inventory. No checkout links are displayed.','No pudimos leer el inventario verificado. No se muestran enlaces de pago.')));}
}

const tabNames=new Set(['today','research','demos','watch','documents','reports','products']);
function activateTab(name,updateURL=false){const selected=tabNames.has(name)?name:'today';for(const x of document.querySelectorAll('[data-tab]')){const active=x.dataset.tab===selected;x.setAttribute('aria-selected',String(active));$(x.dataset.tab).hidden=!active}if(selected==='products'&&verified)void renderSaleProducts();if(updateURL)history.replaceState(null,'','#'+selected);message('')}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab,true));
function applyRequestedTab(){activateTab(location.hash.slice(1),false)}
window.addEventListener('hashchange',applyRequestedTab);applyRequestedTab();
$('leadSelect').onchange=()=>{pickLead($('leadSelect').value);$('researchResult').replaceChildren();render()};
$('language').onclick=()=>{language=language==='es'?'en':'es';localStorage.setItem('tle_crm_owner_language',language);productCatalogLoaded=false;translate();render();if(verified&&$('products')&&!$('products').hidden)void renderSaleProducts()};
$('refresh').onclick=()=>run(async()=>{await refresh();message(tx('Workspace refreshed.','Espacio actualizado.'))});
$('followupForm').onsubmit=e=>{e.preventDefault();run(async()=>{const l=selected();await api({action:'set_followup',lead_id:l.id,expected_date:l.followup||null,date:$('nextDate').value,note:$('nextNote').value});await refresh();message(tx('Next action saved. No email was sent.','Próxima acción guardada. No se envió ningún correo.'))})};
$('researchForm').onsubmit=e=>{e.preventDefault();run(async()=>{const r=await api({action:'research',lead_id:$('leadSelect').value||null,url:$('researchUrl').value.trim()});await refresh();renderResearch(r.record);message(tx('Source check saved. Public emails remain unverified.','Revisión guardada. Los correos públicos siguen sin verificar.'))})};
$('demoForm').onsubmit=e=>{e.preventDefault();void openClaraDemo(e)};

$('watchForm').onsubmit=e=>{e.preventDefault();run(async()=>{await api({action:'add_watch',url:$('watchUrl').value.trim(),label:$('watchLabel').value});await refresh();e.target.reset();message(tx('Page added for daily checks.','Página añadida para revisión diaria.'))})};
$('makeReport').onclick=()=>run(async()=>{const r=await api({action:'report'});download(JSON.stringify(r.record.data,null,2),'TLE-sales-report.json','application/json');await refresh();message(tx('Report exported with its coverage and sources.','Informe exportado con su cobertura y fuentes.'))});
$('makePptx').onclick=()=>run(async()=>{const r=await api({action:'report'});await powerpoint(r.record.data);await refresh();message(tx('Editable PowerPoint exported.','PowerPoint editable exportado.'))});

/* Reuse Clara's existing server-protected Owner preview. No raw template is bundled. */
let claraAttempt=0,claraController=null,claraTimer=null,claraReturnFocus=null,sonnyOwnerRequests=0;
function closeClaraDemo(restoreFocus=true){
 ++claraAttempt;claraController?.abort();claraController=null;clearTimeout(claraTimer);claraTimer=null;
 $('demoFrame').onload=null;$('demoFrame').srcdoc='';$('demoActions').hidden=true;
 $('claraStatus').textContent='';$('claraRetry').hidden=true;document.body.classList.remove('clara-open');
 if(restoreFocus&&claraReturnFocus?.isConnected)claraReturnFocus.focus({preventScroll:true});
}
async function openClaraDemo(event){
 if(!verified||!db)return;
 if($('demoActions').hidden)claraReturnFocus=event?.submitter||document.activeElement;
 closeClaraDemo(false);
 const attempt=claraAttempt,gen=generation,previewLanguage=language;
 $('demoActions').hidden=false;document.body.classList.add('clara-open');$('claraClose').focus();
 const status=$('claraStatus');status.hidden=false;status.textContent=tx('Loading Clara’s private demo…','Cargando el demo privado de Clara…');
 claraController=new AbortController();
 claraTimer=setTimeout(()=>claraController?.abort(),20000);
 try{
  const {data:{session},error}=await db.auth.getSession();
  if(error||!session?.access_token){lock();throw Error(tx('Sign in to continue.','Inicia sesión para continuar.'))}
  if(!verified||gen!==generation||attempt!==claraAttempt)return;
  const r=await fetch(BASE+'/functions/v1/tle-booking-demo-gate',{
   method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},
   body:JSON.stringify({action:'owner_preview'}),cache:'no-store',signal:claraController.signal
  });
  const result=await r.json().catch(()=>({}));
  if(!verified||gen!==generation||attempt!==claraAttempt||$('demoActions').hidden)return;
  if(r.status===401){lock();return}
  if(!r.ok||result.ok!==true||typeof result.html!=='string'||!/^<!doctype html>/i.test(result.html))
   throw Error(result.error||tx('Could not open Clara’s demo. Try again.','No se pudo abrir el demo de Clara. Inténtalo de nuevo.'));
  clearTimeout(claraTimer);claraTimer=null;
  $('demoFrame').onload=()=>{
   if(!verified||gen!==generation||attempt!==claraAttempt||$('demoActions').hidden)return;
   clearTimeout(claraTimer);claraTimer=null;status.hidden=true;
  };
  const localeScript='<script>if(document.documentElement.lang!=="'+previewLanguage+'")document.getElementById("languageToggle")?.click();<\/script>';
  $('demoFrame').srcdoc=result.html.replace(/<html\b([^>]*)>/i,(_tag,attrs)=>'<html'+attrs.replace(/\sdata-initial-lang=(["']).*?\1/gi,'')+' data-initial-lang="'+previewLanguage+'">').replace(/<\/body>/i,localeScript+'</body>');
  claraTimer=setTimeout(()=>{
   if(attempt!==claraAttempt||$('demoActions').hidden||status.hidden)return;
   status.textContent=tx('The preview is taking longer than expected. Try again.','El demo está tardando más de lo esperado. Inténtalo de nuevo.');$('claraRetry').hidden=false;
  },12000);
 }catch(e){
  if(!verified||gen!==generation||attempt!==claraAttempt||$('demoActions').hidden)return;
  clearTimeout(claraTimer);claraTimer=null;
  status.hidden=false;status.textContent=e.name==='AbortError'?tx('The preview timed out. Try again.','Se agotó el tiempo de espera. Inténtalo de nuevo.'):(e.message||tx('Could not open the demo.','No se pudo abrir el demo.'));
  $('claraRetry').hidden=false;
 }finally{if(attempt===claraAttempt)claraController=null}
}
$('claraClose').onclick=()=>closeClaraDemo();
$('claraRetry').onclick=()=>void openClaraDemo();
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('demoActions').hidden){event.preventDefault();closeClaraDemo()}});
window.addEventListener('pagehide',()=>closeClaraDemo(false));
/* Sonny relay accepts this opaque sandbox only; it forwards no owner token or form data. */
window.addEventListener('message',async event=>{
 const iframe=$('demoFrame');
 if(!verified||$('demoActions').hidden||!iframe.srcdoc||event.origin!=='null'||event.source!==iframe.contentWindow||
  event.data?.type!=='TLE_SONNY_DEMO_REQUEST'||typeof event.data.id!=='string'||!/^[a-f0-9-]{36}$/i.test(event.data.id))return;
 const frame=iframe.contentWindow,attempt=claraAttempt,gen=generation,id=event.data.id,data=event.data.payload;
 const msg=typeof data?.customer_message==='string'?data.customer_message.trim():'';
 const thread=typeof data?.thread_id==='string'?data.thread_id:'';
 const history=typeof data?.conversation_history==='string'?data.conversation_history.slice(0,1200):'';
 const respond=payload=>{
  if(!verified||gen!==generation||attempt!==claraAttempt||$('demoActions').hidden||frame!==iframe.contentWindow)return;
  frame.postMessage({type:'TLE_SONNY_DEMO_RESPONSE',id,...payload},'*');
 };
 if(!msg||msg.length>300||!/^[a-f0-9]{8}-[a-f0-9-]{27,36}$/i.test(thread)||++sonnyOwnerRequests>28){
  respond({ok:false,rateLimited:sonnyOwnerRequests>28});return;
 }
 try{
  const r=await fetch(BASE+'/functions/v1/tle-ai-booking-demo',{
   method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({customer_message:msg,language:data?.language==='es'?'es':'en',thread_id:thread,conversation_history:history,
    business_name:'Sample Cleaning Co.',service_area:'Example service area',
    services_offered:'Standard Cleaning, Deep Cleaning, Move In/Out Cleaning, Commercial Cleaning',booking_draft:{}}),
   signal:AbortSignal.timeout(27000),cache:'no-store'
  });
  const result=await r.json().catch(()=>({}));
  respond(r.ok&&typeof result.reply==='string'?{ok:true,reply:result.reply.slice(0,240)}:{ok:false,rateLimited:r.status===429});
 }catch{respond({ok:false})}
});

db?.auth.onAuthStateChange(event=>{if(['SIGNED_OUT','USER_DELETED'].includes(event))lock()});
translate();refresh().catch(e=>{lock();$('locked').querySelector('p:not(.eyebrow)').textContent=e.message});
