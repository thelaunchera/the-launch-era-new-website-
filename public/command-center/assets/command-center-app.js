
// Prefer the pinned local browser library so slow external CDNs cannot block iPad sign-in.
let createClient=window.supabase?.createClient;
if(typeof createClient!=='function'){
 try{
  const providers=[
   'https://esm.sh/@supabase/supabase-js@2.57.0',
   'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm'
  ];
  const candidates=providers.map(async url=>{
   const loaded=await import(url);
   if(typeof loaded.createClient!=='function')throw new Error('Authentication provider unavailable');
   return loaded.createClient;
  });
  createClient=await Promise.race([
   Promise.any(candidates),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error('Authentication loading timed out')),9500))
  ]);
 }catch(startupError){
  console.error('Command Center authentication library unavailable',startupError);
  const cover=document.getElementById('tleLoading');
  const message=cover?.querySelector('span');
  if(message)message.textContent='Connection interrupted. Use Try again or open in Safari.';
  window.dispatchEvent(new Event('tle-crm-startup-failed'));
  throw startupError;
 }
}
const db=createClient('https://bowacxhmjvrqixtwaikv.supabase.co','sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'tle-crm-auth'}});
const $=id=>document.getElementById(id);
const crmLocaleText=(en,es)=>localStorage.getItem('tle_crm_language')==='es'?es:en;
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register(new URL('sw.js',location.href).pathname).catch(err=>console.warn('Push service worker unavailable',err.message)))}function hideTleLoading(){window.__tleBootReady=true;window.dispatchEvent(new Event('tle-crm-ready'));const el=$('tleLoading');if(!el)return;el.classList.add('tle-loading-hide');setTimeout(()=>el.remove(),280)}let activeAuthUserId=null,bootGeneration=0;let workspace=null,leads=[],editing=null,emailSentByLead=new Map(),emailBouncedByLead=new Map(),accountEmail='';
const say=s=>{$('message').textContent=s;if($('editor')?.open){const status=$('followupStatus');if(status)status.textContent=s}};
async function check(result){if(result.error)throw result.error;return result.data}

const pricingEndpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-flow-pricing';
let pricingDraft=null,pricingLoadGeneration=0,ownerReviewAccount=null;
function priceElement(tag,attrs={},label){const el=document.createElement(tag);for(const [key,value] of Object.entries(attrs)){if(key==='class')el.className=value;else if(key==='value')el.value=value;else el.setAttribute(key,String(value))}if(label!==undefined)el.textContent=String(label);return el}
async function pricingCall(action,data={}){
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token)throw Error("Sign in to continue");
 const result=await fetch(pricingEndpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token,apikey:'sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB'},body:JSON.stringify({action,workspace_id:workspace?.id,...(workspace?.is_internal&&ownerReviewAccount?{owner_account_id:ownerReviewAccount.id}:{}),...data})});
 const body=await result.json().catch(()=>({}));if(!result.ok)throw Error(body.error||'Request failed');return body;
}
function pricingFormRow(group,item){
 const el=priceElement('div',{class:'panel'});el.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,155px),1fr));gap:9px;align-items:end;padding:13px;margin:9px 0';
 const input=priceElement('input',{type:'text',maxlength:90});input.value=item.name||'';input.placeholder="Name";input.oninput=()=>item.name=input.value;
 const label=priceElement('label',{},"Name");label.append(input);el.append(label);
 let amount=priceElement('input',{type:'number',min:group==='service'?0.01:0,max:50000,step:0.01});amount.value=item.price??'';amount.oninput=()=>item.price=amount.value;
 if(group==='service'){
  const mode=priceElement('select');for(const [val,name] of [['flat',"Flat"],['estimate',"Estimate"],['quote',"Quote"]])mode.append(priceElement('option',{value:val},name));
  mode.value=item.mode||'quote';amount.disabled=mode.value!=='flat';
  mode.onchange=()=>{item.mode=mode.value;amount.disabled=mode.value!=='flat';if(amount.disabled){amount.value='';item.price=null}};
  const wrap=priceElement('label',{},"Type");wrap.append(mode);el.append(wrap);
 }
 const category=priceElement('select');
 for(const [val,name] of [['residential',"Home"],['commercial',"Business"],['both',"Both"]])category.append(priceElement('option',{value:val},name));
 const estimated=/office|commercial|retail|restaurant|salon|medical|warehouse|construction|janitorial|business|restroom|floor scrub|breakroom|after.hour/i.test(item.name||'')?'commercial':/oven|fridge|refrigerator|baseboard|laundry|cabinet|bedroom/i.test(item.name||'')?'residential':'both';
 category.value=item.category||estimated;
 item.category=category.value;
 category.onchange=()=>item.category=category.value;
 const categoryLabel=priceElement('label',{},"Available for");categoryLabel.append(category);el.append(categoryLabel);
 const amountLabel=priceElement('label',{},"Price");amountLabel.append(amount);el.append(amountLabel);
 const tools=priceElement('div');tools.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap';
 const active=priceElement('input',{type:'checkbox'});active.checked=item.active!==false;active.style.width='auto';active.onchange=()=>item.active=active.checked;
 const activeLabel=priceElement('label',{},"Active");activeLabel.style.margin='0';activeLabel.prepend(active);tools.append(activeLabel);
 const remove=priceElement('button',{type:'button',class:'secondary'},"Remove");remove.onclick=()=>{const key=group==='service'?'services':'addons';pricingDraft[key]=pricingDraft[key].filter(x=>x!==item);renderPricing()};tools.append(remove);el.append(tools);return el;
}
function renderPricing(){
 if(!pricingDraft)return;
 $('pricingServiceRows').replaceChildren(...pricingDraft.services.map(x=>pricingFormRow('service',x)));
 $('pricingAddonRows').replaceChildren(...pricingDraft.addons.map(x=>pricingFormRow('addon',x)));
 $('pricingCurrency').value=pricingDraft.currency||'USD';$('pricingQuotePolicy').value=pricingDraft.quote_policy||'review_unpriced_jobs';
}
async function loadPricing(){
 if(workspace?.is_internal&&!ownerReviewAccount){premiumNavigate('owner-pages');return}
 $('ownerPriceContext').classList.toggle('hidden',!workspace?.is_internal||!ownerReviewAccount);
 if(ownerReviewAccount)$('ownerPriceClient').textContent=ownerReviewAccount.business_name+' — '+(ownerReviewAccount.intake_done?'Intake received':'Waiting for intake');
 const version=++pricingLoadGeneration;$('pricingEditor').classList.add('hidden');$('pricingStatus').textContent="Checking access…";
 if(!workspace){$('pricingStatus').textContent="Create a workspace first";return;}
 try{
  const d=await pricingCall('get');if(version!==pricingLoadGeneration)return;
  pricingDraft={services:d.settings.services||[],addons:d.settings.addons||[],currency:d.settings.currency||'USD',quote_policy:d.settings.quote_policy||'review_unpriced_jobs'};
  $('pricingStatus').textContent=d.saved?"Prices loaded":"Review your initial prices";
  const live=$('pricingPublicUrl');live.href=d.booking_url||'#';live.textContent=d.booking_url?"Open live Booking Page":"Private preview only — not yet delivered";live.style.pointerEvents=d.booking_url?'auto':'none';
  $('pricingEditor').classList.remove('hidden');renderPricing();
 }catch(e){if(version!==pricingLoadGeneration)return;pricingDraft=null;$('pricingStatus').textContent=e.message;}
}
$('pricingAddService').onclick=()=>{if(!pricingDraft||pricingDraft.services.length>=40)return;pricingDraft.services.push({id:crypto.randomUUID(),name:'',mode:'flat',price:'',active:true});renderPricing()};
$('pricingAddAddon').onclick=()=>{if(!pricingDraft||pricingDraft.addons.length>=40)return;pricingDraft.addons.push({id:crypto.randomUUID(),name:'',price:0,active:true});renderPricing()};
$('pricingReload').onclick=loadPricing;
$('pricingSave').onclick=async()=>{
 if(!pricingDraft)return;const button=$('pricingSave');button.disabled=true;$('pricingStatus').textContent="Saving…";
 try{const v=await pricingCall('save',{services:pricingDraft.services,addons:pricingDraft.addons,currency:$('pricingCurrency').value,quote_policy:$('pricingQuotePolicy').value});$('pricingStatus').textContent="Published · "+new Date(v.updated_at).toLocaleString();await loadPricing();}
 catch(e){$('pricingStatus').textContent="Not saved: "+e.message}finally{button.disabled=false}
};


const availabilityEndpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-flow-availability';
let availabilityDraft=null,avLoadVersion=0;
async function availabilityCall(action,data={}){
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token)throw Error("Sign in first");
 const response=await fetch(availabilityEndpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token,apikey:'sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB'},body:JSON.stringify({action,workspace_id:workspace?.id,...(workspace?.is_internal&&ownerReviewAccount?{owner_account_id:ownerReviewAccount.id}:{}),...data})});
 const payload=await response.json().catch(()=>({}));if(!response.ok)throw Error(payload.error||'Availability failed');return payload;
}
function renderAvailability(){
 if(!availabilityDraft)return;
 const root=$('avWeekly');root.replaceChildren();
 const days=[['Sunday','Domingo'],['Monday','Lunes'],['Tuesday','Martes'],['Wednesday','Miércoles'],['Thursday','Jueves'],['Friday','Viernes'],['Saturday','Sábado']];
 for(let d=0;d<7;d++){
  const item=availabilityDraft.weekly[String(d)]||(availabilityDraft.weekly[String(d)]={enabled:false,start:'09:00',end:'17:00'});
  const row=document.createElement('div');row.className='panel';row.style.cssText='display:grid;grid-template-columns:minmax(130px,1.2fr) repeat(2,minmax(110px,1fr));gap:11px;align-items:center;margin:8px 0;padding:12px 16px;border-radius:18px';
  const box=document.createElement('label');box.style.cssText='display:flex;gap:9px;align-items:center;margin:0';
  const check=document.createElement('input');check.type='checkbox';check.checked=item.enabled===true;check.style.width='auto';box.append(check,document.createTextNode(days[d][0]));row.append(box);
  const inputs=[];
  for(const [title,key] of [["Opens",'start'],["Closes",'end']]){
   const label=document.createElement('label');label.textContent=title;label.style.margin='0';
   const input=document.createElement('input');input.type='time';input.step=1800;input.value=item[key]|| (key==='start'?'09:00':'17:00');input.disabled=!item.enabled;input.onchange=()=>{item[key]=input.value};
   label.append(input);row.append(label);inputs.push(input);
  }
  check.onchange=()=>{item.enabled=check.checked;inputs.forEach(input=>input.disabled=!check.checked)};
  root.append(row);
 }
 $('avTimezone').value=availabilityDraft.timezone||'America/New_York';
 $('avSlotMinutes').value=String(availabilityDraft.slot_minutes||60);
 $('avJobMinutes').value=String(availabilityDraft.job_minutes||120);
 $('avNoticeHours').value=String(availabilityDraft.min_notice_hours??24);
 $('avWindowDays').value=String(availabilityDraft.booking_window_days||60);
 const blocked=$('avBlocked');blocked.replaceChildren();
 for(const date of availabilityDraft.blocked_dates||[]){
  const tag=document.createElement('button');tag.type='button';tag.className='secondary';tag.textContent=date+' ×';tag.setAttribute('aria-label','Unblock '+date);
  tag.onclick=()=>{availabilityDraft.blocked_dates=availabilityDraft.blocked_dates.filter(x=>x!==date);renderBlockedAvailability()};
  blocked.append(tag);
 }
}
function renderBlockedAvailability(){
 const root=$('avBlocked');root.replaceChildren();
 for(const date of availabilityDraft.blocked_dates||[]){
  const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=date+' ×';b.setAttribute('aria-label','Remove '+date);
  b.onclick=()=>{availabilityDraft.blocked_dates=availabilityDraft.blocked_dates.filter(x=>x!==date);renderBlockedAvailability()};
  root.append(b);
 }
 if(!root.children.length){const info=document.createElement('span');info.className='muted';info.textContent="No blocked dates";root.append(info)}
}
async function loadAvailability(){
 if(workspace?.is_internal&&!ownerReviewAccount){premiumNavigate('owner-pages');return}
 $('ownerAvContext').classList.toggle('hidden',!workspace?.is_internal||!ownerReviewAccount);
 if(ownerReviewAccount)$('ownerAvClient').textContent=ownerReviewAccount.business_name+' — '+(ownerReviewAccount.intake_done?'Intake received':'Waiting for intake');
 const current=++avLoadVersion;
 $('avEditor').classList.add('hidden');$('avStatus').textContent="Loading your schedule…";
 if(!workspace){$('avStatus').textContent="Create your workspace first";return}
 try{
  const d=await availabilityCall('get');if(current!==avLoadVersion)return;
  availabilityDraft=d.settings;
  $('avEditor').classList.remove('hidden');renderAvailability();renderBlockedAvailability();
  $('avStatus').textContent=d.configured?"Your availability is saved":"Choose your open days and save";
 }catch(e){if(current!==avLoadVersion)return;availabilityDraft=null;$('avStatus').textContent=e.message;}
}
$('avPreviewBtn').onclick=async()=>{
 const status=$('avPreviewResults'),date=$('avPreviewDate').value;
 if(!date){status.textContent="Choose a date";return}
 status.textContent="Checking…";
 try{
  const result=await availabilityCall('preview',{date});
  const times=(result.slots||[]).map(t=>{const [hh,mm]=t.split(':').map(Number);return (hh%12||12)+':'+String(mm).padStart(2,'0')+(hh<12?' AM':' PM')});
  status.textContent=times.length?times.join('   ·   ')+'  ('+result.timezone+')':"No available slots for this date";
 }catch(e){status.textContent=e.message}
};
$('avReload').onclick=loadAvailability;
$('avAddClosed').onclick=()=>{
 if(!availabilityDraft)return;const day=$('avBlockDate').value;if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return;
 availabilityDraft.blocked_dates=[...new Set([...(availabilityDraft.blocked_dates||[]),day])].sort();$('avBlockDate').value='';renderBlockedAvailability();
};
$('avSave').onclick=async()=>{
 if(!availabilityDraft)return;const button=$('avSave');button.disabled=true;$('avStatus').textContent="Saving availability…";
 try{
  const data={...availabilityDraft,timezone:$('avTimezone').value.trim(),slot_minutes:Number($('avSlotMinutes').value),job_minutes:Number($('avJobMinutes').value),min_notice_hours:Number($('avNoticeHours').value),booking_window_days:Number($('avWindowDays').value)};
  if(!Object.values(data.weekly).some(x=>x.enabled===true))throw Error("Open at least one day");
  const result=await availabilityCall('save',data);
  $('avStatus').textContent="Published! Available booking slots updated · "+new Date(result.updated_at).toLocaleString();
  availabilityDraft=data;renderAvailability();renderBlockedAvailability();
 }catch(e){$('avStatus').textContent="Not saved: "+e.message}
 finally{button.disabled=false}
};

function clearAdminClientState(){
 ownerReviewAccount=null;ownerPurchases=[];ownerCalendarRecords=[];
 ownerCalendarBuyerPref='';ownerCalendarSelectedDay='';
 builderState=null;builderPreviewData=null;buyerMailState=null;
 pricingDraft=null;availabilityDraft=null;
 ownerCalendarLoadGeneration++;pricingLoadGeneration++;loadGeneration++;
 const frame=$('buildLiveFrame');if(frame){frame.onload=null;frame.removeAttribute('src');}
 const buyerMailForm=$('buyerEmailForm');if(buyerMailForm)buyerMailForm.reset();
 for(const id of ['settingsAccountEmail','settingsBusinessName','settingsFollowupStatus','ownerCalNotes','notificationList']){
  const node=$(id);if(node){if('value' in node)node.value='';else node.textContent='';}
 }
 for(const id of [
  'ownerPagesList','ownerDeliveryList','ownerCalDayPanel','ownerCalGrid','buildIntake',
  'buildIntakePhotos','ownerCalSummary','ownerPagePreviewBody','ownerPurchaseStats',
  'buildSteps','ownerCalBuyer','ownerCalFormStatus','ownerDeliveryStatus','ownerPagesStatus',
  'buildStatus','buildInviteStatus','ownerPagePreviewStatus','buyerEmailStatus'
 ]){
  const node=$(id);if(!node)continue;
  if(node.tagName==='SELECT')node.replaceChildren(new Option('Choose a client / Elige compradora',''));
  else if(node.tagName==='DIV' || node.tagName==='P')node.replaceChildren();
 }
}

function isDetailingWorkspace(){return !!workspace&&!workspace.is_internal&&workspace.business_category==='detailing'}
function isOtherServiceWorkspace(){return !!workspace&&!workspace.is_internal&&workspace.business_category==='other'}
function applyBuyerIndustryLabels(){
 if(!workspace||workspace.is_internal)return;
 const detailing=isDetailingWorkspace(),other=isOtherServiceWorkspace();
 $('cbDetailingTop')?.classList.toggle('hidden',!detailing);
 $('cbSettingsBanner')?.classList.toggle('hidden',!detailing);
 if(!detailing&&!other)return;
 const es=localStorage.getItem('tle_crm_language')==='es';
 const set=(selector,en,spanish)=>{const el=document.querySelector(selector);if(el)el.textContent=es?spanish:en};
 set('#mainNavCaption',detailing?'CAR DETAILING BUSINESS':'SERVICE BUSINESS',detailing?'NEGOCIO DE DETAILING':'NEGOCIO DE SERVICIOS');
 set('#buyerDashboardHub > .section-title',detailing?'Car Detailing Command Center':'Service Command Center',detailing?'CENTRO DE DETAILING':'CENTRO DE SERVICIOS');
 set('#buyerDashboardHub > p.muted',detailing?'Vehicle inquiries, detailing quotes and appointments — all in one place.':'Service inquiries, quotes and appointments — all in one place.',detailing?'Consultas de vehículos, cotizaciones de detailing y citas, en un solo lugar.':'Consultas, cotizaciones y citas, en un solo lugar.');
 set('#buyerDashboardHub .panel:last-child > p:first-of-type',detailing?'CB Depot receives vehicle detailing requests. Prepare quotes after reviewing each vehicle; send appointment confirmations only for confirmed available slots.':'Customer requests, quotes and confirmed appointments follow the configured business workflow.',detailing?'CB Depot recibe solicitudes de detailing. Prepara cotizaciones después de revisar cada vehículo y confirma citas solo cuando el horario esté disponible.':'Solicitudes, cotizaciones y citas confirmadas siguen el flujo configurado.');
 set('#buyerDashboardHub .panel:last-child > p.muted',detailing?'Review vehicle details and prepare personalized detailing quotes in Inbox. A quote request is not a confirmed appointment.':'Review service details and personalized quotes in Inbox. A quote request is not a confirmed appointment.',detailing?'Revisa los detalles del vehículo y prepara cotizaciones. Una solicitud no es una cita confirmada.':'Revisa los detalles y prepara cotizaciones. Una solicitud no es una cita confirmada.');
 set('#buyerRequestsHub > p.muted',detailing?'Car detailing inquiries, vehicle quotes and confirmed appointments.':'Service inquiries, quotes and confirmed appointments.',detailing?'Consultas de detailing, cotizaciones de vehículos y citas confirmadas.':'Consultas, cotizaciones y citas confirmadas.');
 set('#buyerFollowupsIntro > p.muted',detailing?'Two optional follow-up emails for detailing customers, only with verified sender, reply inbox and customer consent.':'Two optional service follow-ups, only with verified sender and consent.',detailing?'Dos seguimientos opcionales de detailing. Requieren remitente, buzón y permiso verificados.':'Dos seguimientos opcionales con remitente y permiso verificados.');
 const shortcut=(id,en,sp,subEn,subEs)=>{const button=document.getElementById(id);if(!button)return;button.replaceChildren(document.createTextNode(es?sp:en+' '));const small=document.createElement('small');small.style.display='block';small.textContent=es?subEs:subEn;button.append(small)};
 shortcut('buyerShortcutPricing',detailing?'Detailing Services & Quotes':'Services & Quotes',detailing?'Servicios y cotizaciones de detailing':'Servicios y cotizaciones',detailing?'Vehicle services, custom prices and add-ons':'Services, quotes and extras',detailing?'Vehículos, cotizaciones y extras':'Servicios, cotizaciones y extras');
 shortcut('buyerShortcutAvailability',detailing?'Detailing Availability':'Availability',detailing?'Disponibilidad de detailing':'Disponibilidad','Appointments, opening hours and service duration','Citas, horarios y duración de servicios');
 shortcut('buyerShortcutAutomation','Customer Email Automation','Correos automáticos','Verification, follow-ups and customer confirmations','Verificación, seguimientos y confirmaciones');
 const form=document.getElementById('buyerEmailForm');
 if(form){
  const from=form.elements.namedItem('sender_email'),sender=form.elements.namedItem('sender_name'),reply=form.elements.namedItem('reply_to');
  if(from)from.placeholder=detailing?'hello@yourdetailingbusiness.com':'hello@yourbusiness.com';
  if(sender)sender.placeholder=workspace.name||'Your Business';
  if(reply)reply.placeholder=detailing?'replies@yourdetailingbusiness.com':'replies@yourbusiness.com';
 }
 const faq=document.querySelector('#helpHub .panel');
 if(faq){
  for(const heading of faq.querySelectorAll('h3')){
   if(/cleaning app|aplicación de limpieza/i.test(heading.textContent||'')){
    heading.hidden=true;if(heading.nextElementSibling?.tagName==='P')heading.nextElementSibling.hidden=true;
   }
   if(/where can i edit services|dónde edito los servicios/i.test(heading.textContent||'')){
    const p=heading.nextElementSibling;
    if(p?.tagName==='P')p.textContent=detailing?(es?'En Configuración puedes administrar los servicios de detailing, precios, extras y horarios.':'Use Business Settings to manage detailing services, custom quotes, extras and appointment availability.'):(es?'Administra servicios, precios y horarios en Configuración.':'Manage services, prices and availability in Business Settings.');
   }
  }
 }
}

document.addEventListener('tle-crm-language',()=>queueMicrotask(applyBuyerIndustryLabels));
let buyerDeliveryReady=false;
function applyCRMRoleInterface(){
 const owner=!!workspace?.is_internal,buyer=!!workspace&&!owner;
 if(workspace){document.body.dataset.languageWorkspace=workspace.id;const saved=localStorage.getItem('tle_crm_language_'+workspace.id);const selected=saved==='es'?'es':saved==='en'?'en':owner?(localStorage.getItem('tle_crm_owner_language')||'en'):'en';document.dispatchEvent(new CustomEvent('tle-crm-language',{detail:{language:selected}}))}else delete document.body.dataset.languageWorkspace;
 document.body.classList.toggle('crm-owner-view',owner);
 document.body.classList.toggle('crm-buyer-view',buyer);document.body.classList.toggle('cb-depot-buyer',buyer&&workspace?.business_category==='detailing'&&String(workspace?.name||'').trim().toLowerCase()==='cb depot');document.body.classList.remove('crm-followups-focus');
 document.body.classList.toggle('crm-detailing-buyer',buyer&&workspace?.business_category==='detailing');
 applyBuyerIndustryLabels();
 $('ownerPagesNav').classList.toggle('hidden',!owner);
 $('ownerCalendarNav').classList.toggle('hidden',!owner);$('ownerHelpNav').classList.toggle('hidden',!owner);if(!owner)$('ownerHelpHub').classList.add('hidden');
 $('ownerOrdersCaption').classList.toggle('hidden',!owner);
 $('ownerProspectsCaption').classList.add('hidden');$('ownerPrivateSection').classList.toggle('hidden',!owner);$('buyerBusinessSection').classList.toggle('hidden',!buyer);$('sidebarWorkspaceLabel').textContent=owner?'OWNER COMMAND':buyer?(workspace.name||'BUSINESS WORKSPACE'):'WORKSPACE';$('ownerInsightsNav').classList.toggle('hidden',!owner);$('ownerContactDecision').classList.toggle('hidden',!owner);$('buyerFollowupsNav').classList.toggle('hidden',!(buyer&&buyerDeliveryReady));
 $('buyerPricingNav').classList.toggle('hidden',!(buyer&&buyerDeliveryReady));
 $('buyerAvailabilityNav').classList.toggle('hidden',!(buyer&&buyerDeliveryReady));
 $('buyerEmailsNav').classList.toggle('hidden',!(buyer&&buyerDeliveryReady));
 $('buyerRequestsNav').classList.toggle('hidden',!buyer);$('buyerBookingPreviewNav').classList.toggle('hidden',!buyer);$('ownerWebsiteInboxNav').classList.toggle('hidden',!owner);$('ownerSettingsNav').classList.toggle('hidden',!owner);$('buyerSettingsNav').classList.toggle('hidden',!buyer);
 $('navOverview').classList.toggle('hidden',owner);
 $('mainNavCaption').classList.remove('hidden');
 /* Legacy calendar link is intentionally hidden; the buyer uses Inbox and the owner uses Prospect Follow-ups. */
 $('headerNew').textContent=owner?'+ New prospect':'+ Add inquiry';
 $('globalSearch').textContent=owner?'⌕ Search leads':'⌕ Search customers';
 $('mobileNew').setAttribute('aria-label',owner?'Add prospect':'Add inquiry');
 const es=localStorage.getItem('tle_crm_language')==='es';
 $('settingsRoleTitle').textContent=owner?(es?'Configuración privada de The Launch Era':'The Launch Era · Owner settings'):(es?'Configuración de tu negocio':'Your business settings');
 $('settingsRoleDesc').textContent=owner?(es?'Solo la propietaria gestiona entregas, clientes y opciones del negocio.':'Only the owner manages customer delivery, purchases and business operations.'):(es?'Administra el idioma, la seguridad, el correo y las notificaciones de tu propio negocio.':'Manage the language, security, sender email and notifications for your own business.');
 $('settingsPushNotice').textContent=owner?(es?'Los avisos dependen del navegador y la configuración de notificaciones.':'Alerts depend on browser permissions and notification setup.'):(es?'Los avisos requieren permisos del navegador y un correo del negocio verificado.':'Notifications require browser permission and a verified business email.');
 $('buyerEmailSetup').classList.add('hidden');
 $('ownerDeliveryPanel').classList.add('hidden');
 if(!owner)clearAdminClientState();
}
function lockCommandCenterSession(){
 bootGeneration++;
 workspace=null;activeAuthUserId=null;buyerDeliveryReady=false;leads=[];editing=null;accountEmail='';
 emailSentByLead=new Map();emailBouncedByLead=new Map();
 buyerRequests=[];buyerSelectedRequest=null;buyerRequestBusy=false;buyerDraftEditingValues=null;
 delete document.body.dataset.leadsLoaded;
 $('app').classList.add('hidden');$('logout').classList.add('hidden');$('auth').classList.remove('hidden');
 document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
 clearAdminClientState();
 for(const id of ['board','quickList','calendar','clients','emailHubList','buyerRequestCards','buyerRequestDetails','followupHistory','leadProfileSummary']){
  const node=$(id);if(node)node.replaceChildren();
 }
}
function handleCommandCenterAuthChange(event,session){
 if(event==='SIGNED_OUT'||(event==='SIGNED_IN'&&activeAuthUserId&&session?.user?.id!==activeAuthUserId)){
  lockCommandCenterSession();
  location.reload();
  return;
 }
 if(event==='PASSWORD_RECOVERY'){
  setTimeout(()=>{if(!$('passwordResetDialog').open)$('passwordResetDialog').showModal()},0);
 }
}
async function boot(){let roleVerified=false;const generation=++bootGeneration;$('app').classList.add('hidden');$('buyerPasswordSetup').classList.add('hidden');try{
 const authResult=await Promise.race([
  db.auth.getUser(),
  new Promise((_,reject)=>setTimeout(()=>reject(new Error('The connection timed out. Please try again.')),17000))
 ]);
 let {data:{user},error:authError}=authResult;
 if(generation!==bootGeneration)return;if(authError&&authError.name!=='AuthSessionMissingError')throw authError;if(activeAuthUserId&&activeAuthUserId!==user?.id){lockCommandCenterSession();location.reload();return}activeAuthUserId=user?.id||null;$('auth').classList.toggle('hidden',!!user);$('logout').classList.toggle('hidden',!user);if(!user){
 if(sessionStorage.getItem('tle_crm_new_password_ready')==='yes'){
  sessionStorage.removeItem('tle_crm_new_password_ready');
  $('authMessage').textContent='✓ Password saved. Sign in with your email and new password to finish securing your Command Center.';
 }
 hideTleLoading();loadGeneration++;delete document.body.dataset.leadsLoaded;
 workspace=null;clearAdminClientState();
 document.body.classList.remove('tle-owner-purchases','crm-owner-view','crm-buyer-view','crm-followups-focus');
 $('ownerPagesNav').classList.add('hidden');$('ownerCalendarNav').classList.add('hidden');$('ownerInsightsNav').classList.add('hidden');$('ownerWebsiteInboxNav').classList.add('hidden');$('ownerSettingsNav').classList.add('hidden');$('buyerSettingsNav').classList.add('hidden');$('buyerFollowupsNav').classList.add('hidden');$('buyerRequestsNav').classList.add('hidden');
 $('buyerEmailSetup').classList.add('hidden');$('ownerDeliveryPanel').classList.add('hidden');
 leads=[];accountEmail='';emailSentByLead=new Map();return
}
 // Owner access is untouched. Paid buyer security is checked on the server
 // before fetching workspace data, and RLS blocks buyer data until password login.
 const {data:security,error:securityError}=await db.rpc('tle_crm_buyer_auth_state');
 if(securityError)throw securityError;
 buyerDeliveryReady=!!security?.system_delivered;
 if(generation!==bootGeneration)return;
 if(security?.password_required){
   if(security.password_setup_complete&&!security.signed_in_with_password){
     await db.auth.signOut({scope:'local'});
     if(generation!==bootGeneration)return;
     $('auth').classList.remove('hidden');
     $('authMessage').textContent='For your security, sign in with your email and password to open your private Command Center.';
     hideTleLoading();
     return;
   }
   if(!security.password_setup_complete&&security.signed_in_with_password){
     const {data:completed,error:completeError}=await db.rpc('tle_crm_buyer_finalize_password_setup');
     if(completeError||completed!==true)throw completeError||new Error('Account verification was not completed.');
   }else if(!security.password_setup_complete){
     $('app').classList.add('hidden');
     $('auth').classList.add('hidden');
     $('buyerPasswordSetup').classList.remove('hidden');
     $('buyerPasswordIntro').textContent='Your email '+(user.email||'')+' is verified. Create a password to secure your private Command Center before your customer records become visible.';
     hideTleLoading();
     return;
   }
 }
 accountEmail=(user.email||'').trim().toLowerCase();let ws=await check(await db.from('tle_crm_workspaces').select('id,name,is_internal,business_category,automated_followups_enabled,reply_monitor_verified').eq('created_by',user.id).order('created_at',{ascending:true}).limit(1));if(generation!==bootGeneration)return;workspace=ws[0]||null;applyCRMRoleInterface();if(workspace&&!workspace.is_internal)await initializeBuyerLanguage(workspace.id);if(generation!==bootGeneration)return;roleVerified=true;$('app').classList.remove('hidden');loadBuyerMail();loadOwnerDeliveries();const setupStatus=$('settingsFollowupStatus');if(setupStatus){const active=!!workspace?.automated_followups_enabled&&!!workspace?.reply_monitor_verified;const es=localStorage.getItem('tle_crm_language')==='es';setupStatus.textContent=workspace?.is_internal?(active?(es?'Tu primer correo es manual. El segundo y el tercero son automáticos para contactos habilitados; respuestas y bajas detienen la secuencia.':'Your first email is manual. Emails two and three are automatic for eligible contacts; replies and opt-outs stop the sequence.'):(es?'Envías el primero; los otros dos quedan pendientes de un canal de correo compatible y permiso válido.':'You send the first; the other two require an eligible recipient and compatible email provider.')):(active?(es?'Seguimientos automáticos 1 y 2 activos; respuesta detectada y cancelación habilitada. El tercero es manual.':'Automatic follow-ups 1 and 2 are active, with reply detection and cancellation. The third is manual.'):(es?'Los seguimientos automáticos están pendientes de configuración y verificación del correo. El tercero es manual.':'Automatic follow-ups require sender setup and reply-monitor verification. The third is manual.'));}if(!workspace){delete document.body.dataset.leadsLoaded;leads=[];emailSentByLead=new Map()}$('setup').classList.toggle('hidden',!!workspace);$('pipeline').classList.toggle('hidden',!workspace);if(!workspace)hideTleLoading();if(workspace){
 $('workspaceName').textContent=workspace.name;
 $('ownerOrdersCaption').classList.toggle('hidden',!workspace.is_internal);
 $('ownerProspectsCaption').classList.add('hidden');
 $('navOverview').classList.toggle('hidden',!!workspace.is_internal);
 /* Do not update a child <span> of the hidden legacy calendar link: it no longer has one. */
 $('mainNavCaption').classList.remove('hidden');
 if(workspace.is_internal){
  setView('owner-pages');
  document.querySelectorAll('.nav-link[data-target]').forEach(b=>b.classList.toggle('active',b.dataset.target==='owner-pages'));
  hideTleLoading(); // verified owner can use navigation while purchases fetch in the background
  await loadOwnerPages();
 }else{
  document.body.classList.remove('tle-owner-purchases');
  setView('buyer-dashboard');
  document.querySelectorAll('.nav-link[data-target]').forEach(b=>b.classList.toggle('active',b.dataset.target==='home'));
  hideTleLoading(); // verified buyer sees their private dashboard without waiting for all request lists
  await load();
  await loadBuyerRequests();
 }
 await loadStoredNotifications();
}hideTleLoading()}catch(e){if(generation!==bootGeneration)return;if(roleVerified){say(e.message)}else{lockCommandCenterSession();$('authMessage').textContent=e.message}hideTleLoading()}}
$('buyerPasswordSetupForm').onsubmit=async e=>{
 e.preventDefault();
 const form=e.currentTarget;
 const password=String(form.elements.namedItem('password').value||'');
 const confirm=String(form.elements.namedItem('confirm').value||'');
 const status=$('buyerPasswordSetupStatus');
 if(password.length<8||!/\d/.test(password)||password!==confirm){
  status.textContent='Use 8 or more characters with at least one number, and enter the same password twice.';
  return;
 }
 const button=$('buyerPasswordSetupSubmit');button.disabled=true;status.textContent='Securing your private account…';
 try{
  const {error}=await db.auth.updateUser({password});
  if(error)throw error;
  form.reset();
  sessionStorage.setItem('tle_crm_new_password_ready','yes');
  status.textContent='Password saved. Sign in to finish verification.';
  const signedOut=await db.auth.signOut({scope:'global'});
  if(signedOut.error)throw signedOut.error;
  lockCommandCenterSession();
  await boot();
 }catch(error){status.textContent=error?.message||'Could not save your password. Try again.'}
 finally{button.disabled=false}
};
if(new URLSearchParams(location.search).get('app')==='cb-depot')$('signup').classList.add('hidden');
$('authForm').onsubmit=async e=>{e.preventDefault();try{let x=Object.fromEntries(new FormData(e.target));await check(await db.auth.signInWithPassword(x));$('authMessage').textContent='';await boot()}catch(e){$('authMessage').textContent=e.message}};
$('forgotPassword').onclick=async()=>{const email=$('authForm').elements.namedItem('email').value.trim();if(!email){$('authMessage').textContent='Enter your email address first.';return}try{await check(await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname}));$('authMessage').textContent='If an account exists, a password reset email will arrive shortly.'}catch(e){$('authMessage').textContent=e.message}};db.auth.onAuthStateChange(handleCommandCenterAuthChange);$('cancelPasswordReset').onclick=()=>$('passwordResetDialog').close();$('passwordResetForm').onsubmit=async e=>{e.preventDefault();const data=new FormData(e.target),password=String(data.get('newPassword')||''),confirm=String(data.get('confirmPassword')||'');if(password.length<8||!/\d/.test(password)||password!==confirm){$('passwordResetError').textContent='Use at least 8 characters with one number; both passwords must match.';return}const submit=e.target.querySelector('[type=submit]');submit.disabled=true;const {error}=await db.auth.updateUser({password});submit.disabled=false;if(error){$('passwordResetError').textContent=error.message;return}$('passwordResetDialog').close();e.target.reset();say('Password updated successfully.');await boot()};$('signup').onclick=async()=>{try{let x=Object.fromEntries(new FormData($('authForm')));await check(await db.auth.signUp({email:x.email,password:x.password,options:{emailRedirectTo:location.origin+location.pathname}}));$('authMessage').textContent='Account request received. Check your inbox for the confirmation email. If you already registered, use Sign in instead.'}catch(e){const msg=String(e.message||'');$('authMessage').textContent=/rate limit|too many requests/i.test(msg)?'Email confirmation limit reached. If you already have an account, tap Sign in instead. Otherwise, wait before trying again. Check your email spelling (gmail.com).':msg}};
$('logout').onclick=async()=>{lockCommandCenterSession();const {error}=await db.auth.signOut();if(error){$('authMessage').textContent=error.message;return}await boot()};$('sidebarLogout').onclick=()=>{$('logout').click();closePremiumSidebar()};
$('workspaceForm').onsubmit=async e=>{e.preventDefault();const button=$('createWorkspaceButton'),status=$('workspaceStatus');button.disabled=true;status.textContent='Creating your private workspace…';try{let {data:{user}}=await db.auth.getUser();if(!user)throw Error('Please sign in first.');const name=e.target.elements.namedItem('name').value.trim();if(name.length<2)throw Error('Enter your business name.');const {data:existing,error:lookupError}=await db.from('tle_crm_workspaces').select('id').eq('created_by',user.id).limit(1);if(lookupError)throw lookupError;if(!existing.length)await check(await db.from('tle_crm_workspaces').insert({name,created_by:user.id}));status.textContent='Workspace ready!';await boot()}catch(err){status.textContent='Could not create workspace: '+err.message}finally{button.disabled=false}};
let ownerProspectQueueRows=[];
async function loadOwnerProspectQueue(){
 if(!workspace?.is_internal){ownerProspectQueueRows=[];return}
 const result=await db.from('tle_crm_prospect_followup_queue').select('lead_id,step_number,status,due_at')
   .eq('workspace_id',workspace.id).limit(1000);
 if(result.error){ownerProspectQueueRows=null;return}
 ownerProspectQueueRows=result.data||[];
}
let loadGeneration=0;async function load(){if(!workspace)return;const generation=++loadGeneration;const wsId=workspace.id;const firstLoad=!document.body.dataset.leadsLoaded;if(firstLoad){for(const id of ['quickDueCount','quickWaitingCount','quickNewCount','metricTotal','metricNew','metricFollow','metricWon'])$(id).textContent='…';$('quickList').textContent='Loading your leads…'}let error=null;for(let attempt=0;attempt<3;attempt++){try{const result=await db.from('tle_crm_leads').select('id,business,contact,email,source,language,stage,followup,notes,email_consent_status,email_consent_source,email_followup_enabled,contact_decision,replied_at,research_only,primary_friction,service_fit,personalized_email_subject,personalized_email_body,archived_at,archive_reason').eq('workspace_id',wsId).eq('research_only',false).is('archived_at',null).order('created_at',{ascending:false});if(result.error)throw result.error;if(generation!==loadGeneration||workspace?.id!==wsId)return;leads=result.data||[];document.body.dataset.leadsLoaded='yes';await loadEmailSummary();await loadOwnerProspectQueue();render();say('');return}catch(e){error=e;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,(attempt+1)*800))}}if(generation!==loadGeneration)return;say('Could not refresh leads. Your saved records have not been deleted. '+(error?.message||'Please retry.'));if(firstLoad){$('quickList').textContent='Unable to load leads. Please refresh to try again.'}}
async function loadEmailSummary(){emailSentByLead=new Map();emailBouncedByLead=new Map();if(!workspace)return;const {data,error}=await db.from('tle_crm_email_events').select('lead_id,created_at,event_type').eq('workspace_id',workspace.id).in('event_type',['email_sent','email_failed']).order('created_at',{ascending:false}).limit(1000);if(error){say('Email status unavailable: '+error.message);return}for(const e of data||[]){if(e.event_type==='email_sent'&&!emailSentByLead.has(e.lead_id))emailSentByLead.set(e.lead_id,e.created_at);if(e.event_type==='email_failed'&&!emailBouncedByLead.has(e.lead_id))emailBouncedByLead.set(e.lead_id,e.created_at)}}
const confirmedOptOut=x=>x.email_consent_status==='withdrawn'||/unsubscrib|opted out|stop (emailing|contacting)|do not email me/i.test(x.notes||'');
const previousImportDnc=x=>/do not contact:\s*(yes|true)/i.test(x.notes||'');
const blockedLead=x=>confirmedOptOut(x)||emailBouncedByLead.has(x.id)||/email bounced|resend outreach 2026-10-07:\s*bounced/i.test(x.notes||'')||x.contact_decision==='no'||(x.contact_decision!=='yes'&&previousImportDnc(x));const localDateKey=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');let calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);function renderMonthCalendar(items){const root=$('calendar');root.replaceChildren();const toolbar=document.createElement('div');toolbar.className='month-toolbar';const title=document.createElement('h2');title.textContent=calendarMonth.toLocaleDateString('en-US',{month:'long',year:'numeric'});const controls=document.createElement('div');controls.className='month-controls';for(const [label,offset] of [['‹',-1],['Today',0],['›',1]]){const btn=document.createElement('button');btn.type='button';btn.className='secondary';btn.textContent=label;btn.onclick=()=>{calendarMonth=offset===0?new Date(new Date().getFullYear(),new Date().getMonth(),1):new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+offset,1);render()};controls.append(btn)}toolbar.append(title,controls);root.append(toolbar);const grid=document.createElement('div');grid.className='month-grid';['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>{const label=document.createElement('div');label.className='month-weekday';label.textContent=d;grid.append(label)});const first=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1),offset=first.getDay(),todayKey=localDateKey(new Date());const byDay=new Map();items.forEach(x=>{if(!byDay.has(x.followup))byDay.set(x.followup,[]);byDay.get(x.followup).push(x)});for(let i=0;i<42;i++){const date=new Date(first.getFullYear(),first.getMonth(),1-offset+i),key=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0'),cell=document.createElement('div');cell.className='month-cell'+(date.getMonth()!==first.getMonth()?' outside':'')+(key===todayKey?' today':'');const day=document.createElement('span');day.className='month-number';day.textContent=date.getDate();cell.append(day);const matches=(byDay.get(key)||[]).filter(x=>!blockedLead(x));matches.slice(0,3).forEach(x=>{const btn=document.createElement('button');btn.type='button';btn.className='month-event'+(key<todayKey?' overdue':'');btn.textContent=x.business;btn.title=x.business+' · '+x.stage;btn.onclick=()=>edit(x);cell.append(btn)});if(matches.length>3){const more=document.createElement('span');more.className='month-more';more.textContent='+'+(matches.length-3)+' more';cell.append(more)}grid.append(cell)}root.append(grid);const summary=document.createElement('p');summary.className='month-summary';summary.textContent='Select a follow-up to open the lead. Use arrows to browse months.';root.append(summary)}function renderOwnerCampaignReadiness(){
 const panel=$('ownerCampaignReadiness');if(!panel)return;
 const internal=!!workspace?.is_internal;panel.classList.toggle('hidden',!internal);if(!internal)return;
 const es=localStorage.getItem('tle_crm_language')==='es';
 const approved=leads.filter(x=>x.contact_decision==='yes'&&!confirmedOptOut(x));
 const due=approved.filter(x=>x.followup&&x.followup<=localDateKey(new Date())&&x.stage==='Follow-up'&&!blockedLead(x));
 const optedIn=approved.filter(x=>x.email_consent_status==='authorized'&&String(x.email_consent_source||'').trim());
 const eligible=optedIn.filter(x=>x.email_followup_enabled===true&&x.email&&x.stage!=='Won'&&!blockedLead(x));
 const legacy=approved.filter(x=>previousImportDnc(x)).length;
 const failures=approved.filter(x=>emailBouncedByLead.has(x.id)).length;
 $('ownerCampaignReadinessIntro').textContent=es?'Tu selección Sí contactar se guarda correctamente. Esto no significa que la persona haya autorizado emails.':'Your Yes / Contact decision is saved correctly. It does not mean the recipient gave permission to receive marketing emails.';
 const items=es?[['Sí contactar',approved.length],['Pendientes de seguimiento',due.length],['Permiso documentado',optedIn.length],['Email habilitado',eligible.length]]:[['Yes / Contact',approved.length],['Follow-ups due',due.length],['Documented permission',optedIn.length],['Email eligible',eligible.length]];
 const grid=$('ownerCampaignReadinessStats');grid.replaceChildren(...items.map(([label,n])=>{const item=document.createElement('div');item.style.cssText='background:white;border:1px solid #e2e7e7;border-radius:14px;padding:11px 13px';const big=document.createElement('strong');big.textContent=String(n);big.style.cssText='display:block;font-size:24px;color:#191919';const small=document.createElement('small');small.textContent=label;small.style.cssText='color:#506272;font-size:12px';item.append(big,small);return item}));
 $('ownerCampaignReadinessExplanation').textContent=(es?'Las notas antiguas de importación con “Do not contact” no anulan tu elección actual Sí contactar ('+legacy+' coincidencias). ':'Historical imported “Do not contact” notes do not override the current Yes decision ('+legacy+' matches). ')+(es?'Los rebotes registrados ('+failures+') y las bajas reales sí impiden envíos. ':'Recorded delivery failures ('+failures+') and actual opt-outs still block sending. ')+(es?'La campaña comercial sigue en borrador; Resend solo permite campañas a personas que aceptaron recibirlas. No se enviarán correos desde este resumen.':'The commercial campaign remains a draft; Resend permits marketing to opted-in recipients only. This summary does not send mail.');
}
function render(){renderOwnerCampaignReadiness();renderOwnerDueFollowups();renderOwnerDailyOutreach();const nowHour=new Date().getHours();$('quickGreeting').textContent=(nowHour<12?'Good morning':nowHour<18?'Good afternoon':'Good evening')+'!';const todayKey=localDateKey(new Date());const dueNow=leads.filter(x=>x.followup&&x.followup<=todayKey&&x.stage!=='Won'&&!blockedLead(x));$('quickDueCount').textContent=dueNow.length;$('quickWaitingCount').textContent=leads.filter(x=>x.stage==='Contacted').length;$('quickNewCount').textContent=leads.filter(x=>x.stage==='New'&&!blockedLead(x)).length;const attention=[...dueNow,...leads.filter(x=>x.stage==='New'&&!blockedLead(x)&&!dueNow.some(y=>y.id===x.id))].slice(0,5);$('quickList').replaceChildren(...attention.map(x=>{const b=document.createElement('button');b.type='button';b.className='quickitem';const left=document.createElement('span');const title=document.createElement('b');title.textContent=x.business;const sub=document.createElement('small');sub.textContent=x.followup&&x.followup<=todayKey?'Follow-up due · '+x.followup:'New lead · '+(x.contact||'Review details');left.append(title,sub);const arrow=document.createElement('span');arrow.textContent='Open →';b.append(left,arrow);b.onclick=()=>edit(x);return b})); $('metricTotal').textContent=leads.length;updateAnalytics();$('metricNew').textContent=leads.filter(x=>x.stage==='New'&&!blockedLead(x)).length;$('metricFollow').textContent=leads.filter(x=>x.stage==='Follow-up').length;$('metricWon').textContent=leads.filter(x=>x.stage==='Won').length;const q=$('search').value.toLowerCase(),sf=$('stageFilter').value,df=$('dueFilter').value;const now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');const future=new Date(now.getFullYear(),now.getMonth(),now.getDate()+7),week=[future.getFullYear(),String(future.getMonth()+1).padStart(2,'0'),String(future.getDate()).padStart(2,'0')].join('-');const visible=leads.filter(x=>{if(!(x.business+' '+(x.contact||'')).toLowerCase().includes(q))return false;if(sf&&x.stage!==sf)return false;const outreach=$('outreachFilter').value;if(outreach==='sent'&&!emailSentByLead.has(x.id))return false;if(outreach==='pending'&&(emailSentByLead.has(x.id)||emailBouncedByLead.has(x.id)||blockedLead(x)))return false;if(outreach==='bounced'&&!emailBouncedByLead.has(x.id))return false;if(x.stage==='New'&&blockedLead(x)&&outreach!=='bounced')return false;if(df==='overdue'&&!(x.followup&&x.followup<today&&x.stage!=='Won'))return false;if(df==='today'&&x.followup!==today)return false;if(df==='week'&&!(x.followup&&x.followup>=today&&x.followup<=week))return false;if(df==='none'&&x.followup)return false;return true})
 .sort((a,b)=>workspace?.is_internal
  ?((a.contact_decision==='yes'?2:a.contact_decision==='no'?1:0)-
    (b.contact_decision==='yes'?2:b.contact_decision==='no'?1:0))
  :0);$('emptyGuide').classList.toggle('hidden',leads.length!==0);$('board').replaceChildren(...['New','Contacted','Follow-up','Won'].map((stage,index)=>{const lane=document.createElement('section');lane.className='lane premium-lane';lane.dataset.stage=stage;const items=visible.filter(x=>x.stage===stage&&(stage!=='New'||!blockedLead(x)));const head=document.createElement('div');head.className='premium-lane-head';const label=document.createElement('div');label.className='premium-lane-label';const dot=document.createElement('span');dot.className='premium-stage-dot';const name=document.createElement('strong');name.textContent=stage;const count=document.createElement('span');count.className='premium-lane-count';count.textContent=items.length;label.append(dot,name,count);const subtitle=document.createElement('small');subtitle.textContent=['New opportunities','Outreach started','Keep conversations moving','Converted relationships'][index];head.append(label,subtitle);lane.append(head);const stack=document.createElement('div');stack.className='premium-lane-stack';if(!items.length){const empty=document.createElement('div');empty.className='premium-lane-empty';empty.textContent='No leads in this stage';stack.append(empty)}items.forEach(x=>{const card=document.createElement('article');card.className='lead premium-lead';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','Open '+x.business);const upper=document.createElement('div');upper.className='premium-lead-upper';const avatar=document.createElement('span');avatar.className='premium-lead-avatar';avatar.textContent=(x.business||'?').trim().slice(0,2).toUpperCase();const status=document.createElement('span');status.className='premium-lead-status';status.textContent=x.contact_decision==='yes'?(emailBouncedByLead.has(x.id)?'Contactar: Yes · Email issue':'Contactar: Yes'):x.contact_decision==='no'?'Contactar: No':blockedLead(x)?'Review contact restrictions':emailSentByLead.has(x.id)?'Email sent':stage;upper.append(avatar,status);const title=document.createElement('strong');title.className='premium-lead-name';title.textContent=x.business;const contact=document.createElement('p');contact.className='premium-lead-contact';contact.textContent=x.contact||'No contact name';const bottom=document.createElement('div');bottom.className='premium-lead-bottom';const date=document.createElement('span');date.textContent=x.followup?'◷ '+x.followup:'No follow-up date';if(x.followup&&x.followup<=today&&stage!=='Won'&&!blockedLead(x))date.className='late';const open=document.createElement('span');open.textContent='Open ↗';bottom.append(date,open);card.append(upper,title,contact);
if(workspace?.is_internal){
 const insight=document.createElement('p');insight.className='premium-lead-contact';insight.style.margin='7px 0';insight.style.fontSize='12px';insight.textContent='Problem: '+(x.primary_friction||'Research needed');card.append(insight);
 const fit=document.createElement('p');fit.className='premium-lead-contact';fit.style.margin='7px 0';fit.style.fontSize='12px';fit.textContent='Asset: '+(x.service_fit||'Review offer');card.append(fit);
}card.append(bottom);const stageControl=document.createElement('div');stageControl.className='premium-stage-control';const stageLabel=document.createElement('label');stageLabel.textContent='MOVE TO';const stageSelect=document.createElement('select');stageSelect.setAttribute('aria-label','Move '+x.business+' to pipeline stage');for(const s of ['New','Contacted','Follow-up','Won']){const opt=document.createElement('option');opt.value=s;opt.textContent=s;stageSelect.append(opt)}stageSelect.value=x.stage;stageSelect.onclick=e=>e.stopPropagation();stageSelect.onkeydown=e=>e.stopPropagation();stageSelect.onchange=async e=>{e.stopPropagation();const previous=x.stage,next=stageSelect.value;if(next===previous)return;if(blockedLead(x)&&next==='New'){stageSelect.value=previous;say('Blocked contacts cannot be moved to New.');return}stageSelect.disabled=true;try{await check(await db.from('tle_crm_leads').update({stage:next}).eq('id',x.id).eq('workspace_id',workspace.id).select('id').single());x.stage=next;render();say('✓ '+x.business+' moved to '+next)}catch(err){stageSelect.value=previous;stageSelect.disabled=false;say('Could not update stage: '+err.message)}};stageControl.append(stageLabel,stageSelect);card.append(stageControl);card.onclick=()=>edit(x);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();edit(x)}};if(x.email&&x.email_consent_status==='authorized'&&x.email_followup_enabled&&!blockedLead(x)){const mail=document.createElement('button');mail.type='button';mail.className='premium-lead-email';mail.textContent='✉ Write email';mail.onclick=e=>{e.stopPropagation();edit(x);document.querySelector('[data-leadtab="emails"]').click();$('followupSubject').focus()};card.append(mail)}stack.append(card)});lane.append(stack);return lane}));const due=leads.filter(x=>x.followup&&x.followup<=today&&x.stage!=='Won'&&!blockedLead(x));$('reminderBanner').classList.toggle('hidden',!due.length);$('reminderBanner').textContent=due.length+' follow-up'+(due.length===1?' needs':'s need')+' attention today or earlier. Open the calendar to review.';const won=visible.filter(x=>x.stage==='Won');const clientRoot=$('clients');clientRoot.replaceChildren();const clientHead=document.createElement('div');clientHead.className='client-list-head';const clientTitle=document.createElement('div');clientTitle.innerHTML='<span class="eyebrow">RELATIONSHIPS</span><h2>Won clients</h2>';const clientCount=document.createElement('span');clientCount.className='client-count';clientCount.textContent=won.length+' client'+(won.length===1?'':'s');clientHead.append(clientTitle,clientCount);clientRoot.append(clientHead);const clientGrid=document.createElement('div');clientGrid.className='client-directory';won.forEach(x=>{const el=document.createElement('button');el.type='button';el.className='premium-client-card';const top=document.createElement('div');top.className='premium-client-top';const avatar=document.createElement('span');avatar.className='premium-client-avatar';avatar.textContent=(x.business||'?').trim().slice(0,2).toUpperCase();const state=document.createElement('span');state.className='premium-client-state';state.textContent='● Client';top.append(avatar,state);const name=document.createElement('strong');name.textContent=x.business;const contact=document.createElement('p');contact.textContent=x.contact||'Business contact';const email=document.createElement('small');email.textContent=x.email||'No email on file';const bottom=document.createElement('div');bottom.className='premium-client-bottom';const label=document.createElement('span');label.textContent=x.followup?'Next touchpoint · '+x.followup:'No follow-up scheduled';const arrow=document.createElement('span');arrow.textContent='View profile ↗';bottom.append(label,arrow);el.append(top,name,contact,email,bottom);el.onclick=()=>edit(x);clientGrid.append(el)});clientRoot.append(clientGrid);if(!won.length){const p=document.createElement('p');p.className='empty-state';p.textContent='No won clients match your filters.';clientRoot.append(p)}const dated=visible.filter(x=>x.followup&&x.stage!=='Won'&&!blockedLead(x)).sort((a,b)=>a.followup.localeCompare(b.followup));renderMonthCalendar(dated);}
$('search').oninput=render;$('stageFilter').onchange=render;$('dueFilter').onchange=render;$('outreachFilter').onchange=render;function closePremiumSidebar(){$('premiumSidebar').classList.remove('is-open');document.body.classList.remove('sidebar-open');$('navToggle').setAttribute('aria-expanded','false')}function togglePremiumSidebar(){const opening=!$('premiumSidebar').classList.contains('is-open');$('premiumSidebar').classList.toggle('is-open',opening);document.body.classList.toggle('sidebar-open',opening);$('navToggle').setAttribute('aria-expanded',String(opening))}function premiumNavigate(target){
 if(!workspace?.is_internal&&['owner-pages','owner-calendar','owner-preview','owner-build','owner-help'].includes(target))target='home';if(workspace?.is_internal&&['buyer-followups','request-center'].includes(target))target='owner-pages';
 if(workspace?.is_internal&&target==='home')target='owner-pages';
 const leadSection=['leads','calendar','clients','inbox','emails'].includes(target);
 if(workspace?.is_internal&&leadSection&&!document.body.dataset.leadsLoaded)void load();
 document.querySelectorAll('.nav-link[data-target]').forEach(b=>b.classList.toggle('active',b.dataset.target===target));closePremiumSidebar();if(target==='home'){
 if(workspace&&!workspace.is_internal){setView('buyer-dashboard');void loadBuyerRequests();$('buyerDashboardHub').scrollIntoView({behavior:'smooth'});return}
 setView('pipeline');$('search').value='';$('stageFilter').value='';$('dueFilter').value='';render();$('quickhome').scrollIntoView({behavior:'smooth'});return}if(target==='owner-help'){if(!workspace?.is_internal)return;setView('owner-help');$('ownerHelpHub').scrollIntoView({behavior:'smooth'});return}if(target==='help'){setView('help');$('helpHub').scrollIntoView({behavior:'smooth'});return}if(target==='availability'&&workspace?.is_internal&&!ownerReviewAccount){premiumNavigate('owner-pages');return}if(target==='availability'){setView('availability');loadAvailability();$('availabilityHub').scrollIntoView({behavior:'smooth'});return}if(target==='pricing'&&workspace?.is_internal&&!ownerReviewAccount){premiumNavigate('owner-pages');return}if(target==='pricing'){setView('pricing');loadPricing();$('pricingHub').scrollIntoView({behavior:'smooth'});return}if(target==='owner-pages'){setView('owner-pages');loadOwnerPages();$('ownerPagesHub').scrollIntoView({behavior:'smooth'});return}
if(target==='owner-calendar'){if(!workspace?.is_internal)return;setView('owner-calendar');loadOwnerCalendar();$('ownerCalendarHub').scrollIntoView({behavior:'smooth'});return}if(target==='clients'&&workspace&&!workspace.is_internal){setView('buyer-customers');void loadBuyerRequests();$('buyerCustomersHub').scrollIntoView({behavior:'smooth'});return}if(target==='buyer-booking-preview'){if(!workspace||workspace.is_internal)return;setView('buyer-booking-preview');$('buyerBookingPreviewHub').scrollIntoView({behavior:'smooth'});void loadBuyerBookingPreview();return}if(target==='request-center'){if(!workspace||workspace.is_internal)return;setView('request-center');void loadBuyerRequests();$('buyerRequestsHub').scrollIntoView({behavior:'smooth'});return}if(target==='buyer-followups'){if(!workspace||workspace.is_internal)return;setView('buyer-followups');$('settingsHub').scrollIntoView({behavior:'smooth'});return}if(target==='settings'){setView('settings');$('settingsAccountEmail').textContent=accountEmail||'—';$('settingsBusinessName').textContent=workspace?.name||'—';$('settingsLanguage').value=localStorage.getItem('tle_crm_language')==='es'?'es':'en';$('settingsHub').scrollIntoView({behavior:'smooth'});return}if(target==='inbox'){setView('inbox');$('inboundHub').scrollIntoView({behavior:'smooth'});return}if(target==='emails'){setView('emails');$('emailHub').scrollIntoView({behavior:'smooth'});return}if(target==='calendar'){$('dueFilter').value='';$('stageFilter').value='';render();setView('calendar')}else if(target==='clients'){$('stageFilter').value='';$('dueFilter').value='';render();setView('clients')}else{$('stageFilter').value='';$('dueFilter').value='';render();setView('pipeline')}document.getElementById('premiumViews').scrollIntoView({behavior:'smooth'})}document.querySelectorAll('.nav-link[data-target]').forEach(b=>b.onclick=()=>premiumNavigate(b.dataset.target));$('navToggle').setAttribute('aria-expanded','false');$('navToggle').setAttribute('aria-controls','premiumSidebar');$('navToggle').onclick=togglePremiumSidebar;$('sidebarScrim').onclick=closePremiumSidebar;document.addEventListener('keydown',e=>{if(e.key==='Escape')closePremiumSidebar()});$('settingsLanguage').onchange=()=>{const select=$('crmLanguageSelect');if(select){select.value=$('settingsLanguage').value;select.dispatchEvent(new Event('change'))}};
document.querySelectorAll('[data-owner-help-target]').forEach(button=>button.onclick=()=>{if(workspace?.is_internal)premiumNavigate(button.dataset.ownerHelpTarget)});
const buyerMailUrl="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-buyer-mail-setup";
let buyerMailState=null;
const buyerEs=()=>localStorage.getItem("tle_crm_language")==="es";
async function buyerMailCall(action,extra={}){
 if(!workspace||workspace.is_internal)throw Error(crmLocaleText('Buyer account required.','Se requiere una cuenta de cliente.'));
 const {data:{session}}=await db.auth.getSession();
 if(!session)throw Error(buyerEs()?"Inicia sesión nuevamente.":"Please sign in again.");
 const method=action==="status"?"GET":"POST";
 const response=await fetch(buyerMailUrl,{method,headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token},...(method==="POST"?{body:JSON.stringify({action,...extra})}:{})});
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(result.error||(buyerEs()?"No se pudo conectar.":"Connection failed."));
 return result;
}
async function initializeBuyerLanguage(workspaceId){
 const key="tle_crm_language_"+workspaceId;
 if(localStorage.getItem(key)==="en"||localStorage.getItem(key)==="es")return;
 try{
  const data=await buyerMailCall("status");
  if(!workspace||workspace.is_internal||workspace.id!==workspaceId)return;
  const language=data.preferred_language==="es"?"es":"en";
  localStorage.setItem(key,language);
  document.dispatchEvent(new CustomEvent("tle-crm-language",{detail:{language}}));
 }catch{ /* Keep the isolated English default; do not borrow another account's language. */ }
}
async function loadBuyerMail(){
 const panel=$("buyerEmailSetup");
 if(!panel)return;
 panel.classList.toggle("hidden",!workspace||!!workspace.is_internal||view!=="buyer-followups");
 if(panel.classList.contains("hidden"))return;
 const status=$("buyerEmailStatus");
 status.textContent=buyerEs()?"Comprobando conexión…":"Checking connection…";
 try{
  const buyerWorkspaceId=workspace.id;
  const data=await buyerMailCall("status");
  if(!workspace||workspace.is_internal||workspace.id!==buyerWorkspaceId)return;
  buyerMailState=data;
  const c=buyerMailState;
  if(c.managed===true){
   const delivered=c.delivery_complete===true,active=c.activated===true;
   $('buyerConnectDetails').style.display='none';
   $('buyerEmailHealthConnection').textContent=buyerEs()?'Administrado por The Launch Era':'Managed by The Launch Era';
   $('buyerEmailHealthActive').textContent=active?(buyerEs()?'Sí':'On'):(buyerEs()?'Todavía no':'Not yet');
   $('buyerEmailHealthIssue').textContent=delivered?(buyerEs()?'Sin configuración adicional':'No setup needed'):(buyerEs()?'Esperando entrega final':'Awaiting final delivery');
   $('buyerMailIntro').textContent=buyerEs()?
    'The Launch Era administra los correos de confirmación, recordatorios y respuestas automáticamente. No necesitas Resend ni otra suscripción.':
    'The Launch Era manages your booking confirmations, reminders and customer replies automatically. No Resend account, separate sender setup or extra subscription required.';
   status.textContent=delivered?
    (buyerEs()?'Tu sistema de correos está administrado por The Launch Era.':'Your email workflow is managed by The Launch Era.'):
    (buyerEs()?'Automatización preparada. Comenzará después de la entrega final del sistema.':'Automation is prepared. It begins after final system delivery.');
   const indicator=$('buyerAutomationState');
   indicator.textContent=active?
    (buyerEs()?'● Administrados por The Launch Era · Hasta 2 seguimientos automáticos.':'● Managed by The Launch Era · Up to 2 automatic follow-ups.'):
    (buyerEs()?'○ Preparados · No se envían recordatorios antes de la entrega.':'○ Prepared · No reminders are sent before delivery.');
   indicator.style.backgroundColor=active?'#e9f4ee':'#f0f5f9';
   $('buyerMailFootnote').textContent=buyerEs()?
    'Solo se envían a solicitudes de cotización abiertas. Si el cliente responde o se da de baja, se detienen automáticamente.':
    'Only eligible open quote requests receive reminders. Replies and unsubscribes stop the sequence automatically.';
   $('buyerActivateMail').disabled=!delivered||active;
   $('buyerPauseMail').disabled=!active;
   return;
  }
  $('buyerConnectDetails').style.display='';
  const connected=!!c.sender_email&&c.status!=="not_connected";
  const issue=!connected?(buyerEs()?"Conectar remitente":"Connect sender"):
      !c.reply_tested?(buyerEs()?"Comprobar respuestas":"Verify reply inbox"):
      !c.purchase_ready?(buyerEs()?"Esperando activación":"Setup pending"):
      (buyerEs()?"Sin problemas de configuración":"No setup issues");
  $("buyerEmailHealthConnection").textContent=connected?(buyerEs()?"Conectado":"Connected"):(buyerEs()?"Desconectado":"Not connected");
  $("buyerEmailHealthActive").textContent=c.activated?(buyerEs()?"Sí":"On"):(buyerEs()?"No":"Off");
  $("buyerEmailHealthIssue").textContent=issue;
  const stage=c.status;
  let msg=stage==="not_connected"?(buyerEs()?"Sin conectar: verifica tu dominio y configura el correo.":"Not connected. Verify your domain and set up your reply inbox."):
   stage==="waiting_for_reply_test"?(buyerEs()?"Conectado. Falta la prueba de recepción de respuestas.":"Connected. Reply inbox test is still required."):
   c.activated?(buyerEs()?"Seguimientos activos.":"Automatic follow-ups active."):
   (buyerEs()?"Correo verificado. Revisa la entrega del producto antes de activar.":"Mail verified. Confirm your product delivery before activation.");
  if(c.sender_email)msg+=" "+(buyerEs()?"Remitente: ":"Sender: ")+c.sender_email+".";
  if(c.reply_to)msg+=" "+(buyerEs()?"Respuestas: ":"Reply inbox: ")+c.reply_to+".";
  if(c.reply_tested&&!c.purchase_ready)msg+=" "+(buyerEs()?"Esperando confirmación de compra, intake y entrega del Booking Page.":"Awaiting confirmed purchase, intake and Booking Page delivery.");
  status.textContent=msg;
  const indicator=$("buyerAutomationState");
  indicator.textContent=c.activated?(buyerEs()?"● Activos — solo 2 seguimientos automáticos para contactos elegibles.":"● On — only two automatic follow-ups for eligible contacts."):(buyerEs()?"○ Desactivados — no se enviarán seguimientos automáticos.":"○ Off — no automatic follow-ups will be sent.");
  indicator.style.backgroundColor=c.activated?"#e9f4ee":"#f0f5f9";
  if(!c.sender_email)$("buyerConnectDetails").open=true;
  $("buyerActivateMail").disabled=!c.reply_tested||!c.purchase_ready||!!c.activated;
  $("buyerPauseMail").disabled=!c.activated;
 }catch(e){buyerMailState=null;status.textContent=e.message;$("buyerEmailHealthConnection").textContent="—";$("buyerEmailHealthActive").textContent="—";$("buyerEmailHealthIssue").textContent=buyerEs()?"Revisar conexión":"Check connection";$("buyerAutomationState").textContent=buyerEs()?"No se pudo verificar el estado; actualiza antes de cambiarlo.":"Could not verify the current status. Refresh before making changes.";$("buyerActivateMail").disabled=true;$("buyerPauseMail").disabled=true}
}
$("buyerEmailForm").onsubmit=async(e)=>{
 e.preventDefault();
 const btn=$("buyerConnectMail"),status=$("buyerEmailStatus");
 const fields=Object.fromEntries(new FormData(e.target));
 if(!confirm(buyerEs()?"Se verificará tu cuenta Resend y se creará un webhook. ¿Continuar?":"This verifies your Resend account and registers a webhook. Continue?"))return;
 btn.disabled=true;status.textContent=buyerEs()?"Verificando el dominio…":"Verifying domain…";
 try{
  const result=await buyerMailCall("connect",fields);
  e.target.elements.api_key.value="";
  status.textContent=result.next_step||"Connected. Verify incoming replies.";
  await loadBuyerMail();
 }catch(ex){status.textContent=ex.message}
 finally{e.target.elements.api_key.value="";btn.disabled=false}
};
$("buyerRefreshMail").onclick=loadBuyerMail;
$("buyerActivateMail").onclick=async()=>{
 if(!confirm(buyerEs()?"¿Activar los dos primeros seguimientos automáticos de tu negocio?":"Enable your first two automatic follow-ups?"))return;
 try{await buyerMailCall("activate");await loadBuyerMail()}catch(e){$("buyerEmailStatus").textContent=e.message}
};
$("buyerPauseMail").onclick=async()=>{
 if(!workspace||workspace.is_internal)return;
 if(!confirm(buyerEs()?"¿Desactivar los dos seguimientos automáticos de tu negocio? Los correos ya enviados no se pueden retirar.":"Turn off both automatic follow-ups for your business? Already sent emails cannot be recalled."))return;
 const button=$("buyerPauseMail");button.disabled=true;
 try{await buyerMailCall("pause");await loadBuyerMail()}catch(e){$("buyerEmailStatus").textContent=e.message}
 finally{button.disabled=buyerMailState?.activated!==true}
};

const reviewNames=[
 ['booking_page','Booking Page: real services, prices, available slots / Página de reservas y horarios comprobados'],
 ['command_center','Buyer login and private workspace / Acceso privado de la compradora'],
 ['lead_routing','Test lead arrives in the correct Command Center / Lead de prueba llega a la cuenta correcta'],
 ['follow_ups','Follow-up logic and stop conditions checked / Seguimientos y cancelaciones revisados'],
 ['notifications','Booking and owner notifications checked / Notificaciones revisadas'],
 ['tenant_isolation','Buyer cannot see other businesses / Privacidad entre negocios comprobada']
];
function deliveryNode(tag,txt){const el=document.createElement(tag);if(txt!==undefined)el.textContent=txt;return el}
const aiDeliveryEndpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-ai-activation-on-delivery';
const aiPublishableKey='sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB';
let aiDeliveryLoadVersion=0;
async function ownerAiRequest(action,data={}){
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token)throw Error("Sign in to your owner account.");
 const response=await fetch(aiDeliveryEndpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':aiPublishableKey,'Authorization':'Bearer '+session.access_token},body:JSON.stringify({action,...data})});
 const body=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(body.error||'Unable to load AI delivery orders');
 return body;
}
function aiDeliveryText(message,style=''){const node=document.createElement('div');node.textContent=message;if(style)node.style.cssText=style;return node}
async function loadOwnerAiDeliveries(){
 const panel=$('ownerAiDeliveryPanel');
 if(!panel)return;
 const owner=workspace?.is_internal===true;
 panel.classList.toggle('hidden',!owner);
 if(!owner){$('ownerAiDeliveryList')?.replaceChildren();return;}
 const version=++aiDeliveryLoadVersion;
 const es=localStorage.getItem('tle_crm_language')==='es';
 const status=$('ownerAiDeliveryStatus'),root=$('ownerAiDeliveryList');
 $('ownerAiDeliveryTitle').textContent=es?'Agentes de IA · Entregas':'AI Assistants · Delivery';
 $('ownerAiDeliveryIntro').textContent=es?'Activa el primer mes solo cuando el asistente esté entregado.':'Activate the first month only once the assistant is delivered.';
 $('ownerAiDeliveryRefresh').textContent=es?'↻ Actualizar':'↻ Refresh';
 status.textContent=es?'Consultando compras de agentes…':'Checking paid AI agent orders…';
 root.replaceChildren();
 try{
  const result=await ownerAiRequest('list');
  if(version!==aiDeliveryLoadVersion||!workspace?.is_internal)return;
  const orders=Array.isArray(result.orders)?result.orders:[];
  status.textContent=orders.length?(es?orders.length+' compras de IA':orders.length+' AI purchases'):(es?'Todavía no hay pedidos de agentes de IA.':'No AI agent orders yet.');
  const names={'ai-booking':'AI Booking Assistant','ai-followup':'AI Follow-Up Assistant','ai-business':'AI Business Assistant'};
  for(const order of orders){
   const item=document.createElement('article');item.className='panel';item.style.cssText='padding:16px;border:1px solid #d6e6ef;border-radius:17px;background:#fff;min-width:0';
   const title=document.createElement('h3');title.textContent=order.business_name||order.customer_email||'AI order';title.style.cssText='font-size:16px;margin:0 0 8px;overflow-wrap:anywhere';item.append(title);
   item.append(aiDeliveryText((names[order.offer]||order.offer||'AI')+' · '+(order.customer_email||''),'font-size:12px;color:#657987;overflow-wrap:anywhere;margin:0 0 10px'));
   const marker=aiDeliveryText(order.status||'pending','font-size:11px;font-weight:800;color:#356b89;background:#eaf4fc;border-radius:999px;display:inline-block;padding:5px 9px');item.append(marker);
   if(order.status==='active'){
    item.append(aiDeliveryText((es?'Entregado: ':'Delivered: ')+(order.delivered_at?new Date(order.delivered_at).toLocaleDateString(es?'es-US':'en-US'):'—'),'font-size:12px;margin-top:10px'));
    item.append(aiDeliveryText((es?'Primera mensualidad: ':'First monthly bill: ')+(order.first_month_ends_at?new Date(order.first_month_ends_at).toLocaleDateString(es?'es-US':'en-US'):'—'),'font-size:12px;font-weight:700;margin-top:6px'));
    root.append(item);continue;
   }
   if(!['intake_submitted','in_setup'].includes(order.status)){item.append(aiDeliveryText(es?'Pendiente del intake de la compradora.':'Waiting for the buyer intake.','font-size:12px;margin-top:12px'));root.append(item);continue;}
   const label=document.createElement('label');label.textContent=es?'Enlace del asistente funcionando':'Working assistant URL';label.style.cssText='display:block;font-size:12px;font-weight:700;margin:15px 0 6px';item.append(label);
   const url=document.createElement('input');url.type='url';url.placeholder='https://...';url.autocomplete='off';url.required=true;url.maxLength=320;url.value=order.delivered_url||order.booking_page_url||order.website_url||'';url.style.cssText='display:block;width:100%;min-width:0';item.append(url);
   void addOwnerClientReview('ai',order.id,item,url);
   const checkLabel=document.createElement('label');checkLabel.style.cssText='display:flex;align-items:flex-start;gap:9px;margin:12px 0;font-size:12px;font-weight:500;line-height:1.4';const check=document.createElement('input');check.type='checkbox';check.style.cssText='width:18px;height:18px;min-width:18px;margin:0';const checkCopy=document.createElement('span');checkCopy.textContent=es?'Ya probé el asistente y lo entregué a esta clienta.':'I tested this assistant and delivered it to the buyer.';checkLabel.append(check,checkCopy);item.append(checkLabel);
   const act=document.createElement('button');act.type='button';act.className='secondary';act.textContent=es?'Confirmar entrega e iniciar mes':'Confirm delivery & start month';act.style.cssText='display:block;width:100%;white-space:normal';item.append(act);
   const feedback=aiDeliveryText('','font-size:12px;line-height:1.4;margin-top:9px;overflow-wrap:anywhere');feedback.setAttribute('role','status');item.append(feedback);
   act.onclick=async()=>{
    if(item.dataset.clientReviewApproved!=='true'){feedback.textContent=es?'Primero el cliente debe aprobar el agente en el Test Center.':'The buyer must approve the AI Assistant in the Test Center first.';return;}
    if(!check.checked){feedback.textContent=es?'Confirma primero que está probado y entregado.':'Confirm delivery and testing first.';return;}
    if(!url.value||!url.checkValidity()){feedback.textContent=es?'Añade un enlace https válido.':'Enter a valid https URL.';return;}
    if(!window.confirm(es?'¿Confirmas que este asistente ya está entregado? Se inicia el mes incluido.':'Confirm delivery? The included first month starts now.'))return;
    act.disabled=true;feedback.textContent=es?'Activando…':'Activating…';
    try{const result=await ownerAiRequest('confirm_delivery',{order_id:order.id,delivered_url:url.value.trim(),confirmed_delivered:true});feedback.textContent=result.activated?(es?'Entrega activada correctamente.':'Delivery activated.'):(es?'Ya estaba activado.':'Already activated.');await loadOwnerAiDeliveries();}
    catch(e){feedback.textContent=(es?'No se pudo activar: ':'Activation failed: ')+(e.message||String(e));act.disabled=false;}
   };
   root.append(item);
  }
 }catch(e){if(version===aiDeliveryLoadVersion)status.textContent=(es?'No se pudieron consultar los pedidos. ':'Unable to load AI orders. ')+(e.message||String(e));}
}
$('ownerAiDeliveryRefresh').onclick=()=>loadOwnerAiDeliveries();
async function sendOwnerActivationFor(accountId,kind,other=''){
 if(!workspace?.is_internal)throw Error('Owner account required');
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token)throw Error('Please sign in again');
 const response=await fetch(ownerStudioEndpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({account_id:accountId,action:'send_activation',business_category:kind,business_category_other:other})});
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(result.error||'Activation failed');
 return result;
}
async function loadOwnerDeliveries(){
 const panel=$('ownerDeliveryPanel');if(!panel)return;
 panel.classList.toggle('hidden',!workspace?.is_internal);
 if(!workspace?.is_internal)return;
 const list=$('ownerDeliveryList'),status=$('ownerDeliveryStatus');
 status.textContent=crmLocaleText("Checking customer delivery status…","Revisando entregas…");list.replaceChildren();
 try{
  const startedWith=workspace.id;
  const {data,error}=await db.rpc('tle_booking_flow_owner_pending');if(error)throw error;
  if(!workspace?.is_internal||workspace.id!==startedWith)return;
  const entries=Array.isArray(data)?data:[];
  if(!entries.length){status.textContent=crmLocaleText("No paid accounts waiting for delivery","No hay compras pendientes");return}
  const deliveredCount=entries.filter(a=>a.activation_email_delivery_status==='delivered'&&a.activation_email_link_version==='handoff-v2').length;
  status.textContent=crmLocaleText(entries.length+' paid account(s) · '+deliveredCount+' activation email(s) verified as delivered. Final delivery requires your approval.',entries.length+' compra(s) · '+deliveredCount+' correo(s) de activación verificados como entregados. La entrega final requiere tu aprobación.');
  for(const a of entries){
   const item=deliveryNode('div');item.className='delivery-order-card';item.style.cssText='border:1px solid #e6e7e7;border-radius:18px;padding:19px;background:#fff;display:grid;grid-template-columns:minmax(0,1fr);min-width:0;width:100%;box-sizing:border-box;gap:9px';
   const h=deliveryNode('h3',a.business_name||'Cleaning Business');h.style.margin='0';item.appendChild(h);
   item.appendChild(deliveryNode('p',(a.owner_email||'')+' · '+(a.language==='es'?'Español':'English')));
   const ready=a.payment_status==='paid'&&!!a.intake_done&&!!a.crm_ready&&!!a.booking_page_url&&a.status==='active';
   const detail=deliveryNode('p','Paid: '+(a.payment_status==='paid'?'✓':'—')+' · Intake: '+(a.intake_done?'✓':'—')+' · Booking: '+(a.booking_page_url?'✓':'—')+' · CRM: '+(a.crm_ready?'✓':'—')+' · Active: '+(a.status==='active'?'✓':'—'));
   detail.className='muted';item.appendChild(detail);
   // Lifecycle is read from the secure owner-only release state; nothing auto-sends.
   const esOwner=localStorage.getItem('tle_crm_language')==='es';
   const timeline=deliveryNode('div');timeline.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;padding:10px;border:1px solid #dce8f1;border-radius:15px;background:#f6fafe';
   const buyerApproved=a.buyer_review_status==='approved';
   const qaDone=Number(a.qa_pass_count||0);
   const milestones=[
    [esOwner?'Pago y formulario':'Payment + intake',a.payment_status==='paid'&&!!a.intake_done],
    [esOwner?'Personalización':'Personalization',!!a.design_reviewed&&!!a.booking_page_url&&!!a.crm_ready],
    [esOwner?'Acceso privado':'Private activation',a.activation_email_delivery_status==='delivered'&&!!a.buyer_signed_in_after_email],
    [esOwner?'Aprobación cliente':'Buyer approval',buyerApproved],
    [(esOwner?'Pruebas finales ':'Final QA ')+qaDone+'/6',qaDone===6],
    [esOwner?'Entrega final':'Final delivery',!!a.already_queued]
   ];
   for(const [label,done] of milestones){
    const progress=deliveryNode('div',(done?'✓ ':'○ ')+label);
    progress.style.cssText='font-size:12px;line-height:1.4;font-weight:600;color:'+(done?'#245f43':'#506779')+';padding:6px 7px;border-radius:8px;background:'+(done?'#eaf5ed':'#ffffff');
    timeline.append(progress);
   }
   timeline.setAttribute('aria-label',esOwner?'Estado de preparación y entrega':'Preparation and delivery progress');
   item.append(timeline);
   // Owner-only QA console. Read-only inspection and explicit private tests,
   // never signs into or modifies the customer's Command Center.
   const ownerQa=deliveryNode('details');ownerQa.style.cssText='border:1px solid #bfd7e8;border-radius:15px;background:#f5faff;padding:14px;min-width:0;max-width:100%';
   const qaHead=deliveryNode('summary',esOwner?'🔐 Mi centro de pruebas · '+String(a.business_name||'Negocio'):'🔐 Owner QA Center · '+String(a.business_name||'Business'));
   qaHead.style.cssText='font-size:14px;line-height:1.5;font-weight:800;cursor:pointer;overflow-wrap:anywhere';
   ownerQa.append(qaHead);
   const qaIntro=deliveryNode('p',esOwner?
    'Prueba la configuración y los correos sin usar la contraseña del cliente ni publicar su página. Los resultados indican claramente qué queda por comprobar.':
    'Inspect setup and request email tests without the buyer password or a public booking page. Pending checks remain pending.');
   qaIntro.style.cssText='font-size:12px;line-height:1.6;margin:10px 0';
   ownerQa.append(qaIntro);
   const qaActions=deliveryNode('div');qaActions.style.cssText='display:flex;flex-wrap:wrap;gap:8px';
   const inspect=deliveryNode('button',esOwner?'Revisar estado y automatizaciones':'Inspect setup & automation');
   const mailTest=deliveryNode('button',esOwner?'Enviar correo TEST a mi bandeja':'Send TEST email to my inbox');
   const lifecycleTest=deliveryNode('button',esOwner?'Simular solicitud → aviso → respuesta':'Simulate request → alert → reply');
   const pagePreview=deliveryNode('button',esOwner?'Ver mi vista previa privada':'Open private Booking preview');
   for(const control of [inspect,lifecycleTest,mailTest,pagePreview]){control.type='button';control.className='secondary';control.style.cssText='max-width:100%;white-space:normal;min-height:40px;overflow-wrap:anywhere';}
   const qaResults=deliveryNode('div');qaResults.style.cssText='display:grid;gap:7px;margin-top:11px;max-width:100%;overflow-wrap:anywhere';
   qaResults.setAttribute('role','status');qaResults.setAttribute('aria-live','polite');
   const ownerQARequest=async(action)=>{
    const {data:{session},error:sessionError}=await db.auth.getSession();
    if(sessionError||!session?.access_token||!workspace?.is_internal)throw Error(esOwner?'Inicia sesión como propietaria.':'Owner sign-in required.');
    const response=await fetch(ownerStudioEndpoint,{method:'POST',headers:{
      'Content-Type':'application/json',Authorization:'Bearer '+session.access_token
    },body:JSON.stringify({account_id:a.id,action})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result?.ok)throw Error(result?.error||'QA request did not pass');
    return result;
   };
   inspect.onclick=async()=>{
    inspect.disabled=true;qaResults.replaceChildren();
    qaResults.append(deliveryNode('p',esOwner?'Consultando estado real…':'Checking actual status…'));
    try{
      const result=await ownerQARequest('qa_dashboard');
      qaResults.replaceChildren();
      const heading=deliveryNode('strong',(result.business_name||a.business_name)+' · '+(esOwner?'Resumen privado':'Private QA overview'));
      qaResults.append(heading);
      const services=Array.isArray(result.catalog?.active_services)?result.catalog.active_services:[];
      const servicesRow=deliveryNode('p',(esOwner?'Servicios activos: ':'Active services: ')+
        (services.length?services.map(s=>s.name+(s.mode==='flat'&&s.price!=null?' · '+s.price+' '+(result.catalog.currency||'USD'):'')).join(' · '):(esOwner?'Ninguno configurado':'None configured')));
      servicesRow.style.cssText='font-size:12px;line-height:1.6;margin:0';
      qaResults.append(servicesRow);
      const details=deliveryNode('p',
        (esOwner?'Días disponibles: ':'Available days: ')+(result.catalog?.availability_days??0)+
        ' · '+(esOwner?'Extras: ':'Add-ons: ')+(result.catalog?.addons_count??0)+
        ' · '+(esOwner?'Cuenta privada: ':'Private workspace: ')+(result.qa?.workspace_linked?'✓':'—'));
      details.style.cssText='font-size:12px;line-height:1.6;margin:0';
      qaResults.append(details);
      const statusLabels=[
        ['booking_page_tested',esOwner?'Página de reservas':'Booking page'],
        ['buyer_login_tested',esOwner?'Acceso del comprador':'Buyer login'],
        ['lead_routing_tested',esOwner?'Ruta del lead':'Lead routing'],
        ['followups_tested',esOwner?'Seguimientos reales':'Real follow-ups'],
        ['owner_notifications_tested',esOwner?'Avisos al propietario':'Owner notifications'],
        ['account_isolation_tested',esOwner?'Separación de cuentas':'Account isolation'],
        ['design_approved_by_buyer',esOwner?'Aprobación del diseño':'Buyer design approval']
      ];
      const statusGrid=deliveryNode('div');statusGrid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px';
      for(const [key,label] of statusLabels){
       const passed=result.qa?.[key]===true;
       const cell=deliveryNode('div',(passed?'✓ ':'○ ')+label);
       cell.style.cssText='border-radius:8px;background:'+(passed?'#e8f4ea':'#ffffff')+
         ';padding:8px;font-size:12px;color:'+(passed?'#285e3a':'#556879');
       statusGrid.append(cell);
      }
      qaResults.append(statusGrid);
      const disclaimer=deliveryNode('p',esOwner?
       'Un correo enviado o una prueba de datos no certifican por sí solos las notificaciones reales ni los seguimientos. Los estados pendientes no se aprueban automáticamente.':
       'A queued email or sample lead is not proof of complete live notification and follow-up operation. Pending checks are never auto-approved.');
      disclaimer.style.cssText='font-size:11px;line-height:1.55;margin:3px 0 0;color:#556879';
      qaResults.append(disclaimer);
    }catch(error){qaResults.replaceChildren(deliveryNode('p',(esOwner?'No se pudo revisar: ':'Could not inspect: ')+(error.message||String(error))))}
    finally{inspect.disabled=false}
   };
   lifecycleTest.onclick=async()=>{
    if(!confirm(esOwner?
      '¿Simular una solicitud de este negocio, crear un aviso interno y comprobar que se cancelan dos recordatorios después de una respuesta? Todo será ficticio y se eliminará; no se enviarán correos reales.':
      'Simulate this business’s request, private alert, and two follow-up cancellations on reply? All test records are removed; no real email will be sent.'))return;
    lifecycleTest.disabled=true;
    qaResults.replaceChildren(deliveryNode('p',esOwner?'Ejecutando simulación privada…':'Running private simulation…'));
    try{
     const test=await ownerQARequest('qa_simulate_lifecycle');
     const lines=[
      esOwner?'✓ Solicitud vinculada al negocio correcto':'✓ Request routed to correct business',
      esOwner?'✓ Aviso interno creado y eliminado':'✓ In-app alert created and cleaned',
      (esOwner?'✓ Recordatorios simulados cancelados: ':'✓ Simulated reminders stopped: ')+(test.followup_steps_cancelled_after_reply??0)+' / 2',
      esOwner?'✓ Sin reservas, correos reales ni cambios en el estado de entrega':'✓ No real booking, emails or delivery changes'
     ];
     qaResults.replaceChildren(...lines.map(v=>{
       const e=deliveryNode('p',v);e.style.cssText='font-size:12px;line-height:1.55;margin:2px 0';return e
     }));
     qaResults.append(deliveryNode('p',esOwner?
      'Simulación correcta. Aún deben verificarse las notificaciones y los seguimientos reales antes de entregar.':
      'Simulation passed. Live business notifications and actual follow-ups still require separate verification before delivery.'));
    }catch(error){
     qaResults.replaceChildren(deliveryNode('p',
      (esOwner?'No se completó la simulación: ':'Simulation failed: ')+(error.message||String(error))));
    }finally{lifecycleTest.disabled=false}
   };
   mailTest.onclick=async()=>{
    if(!confirm(esOwner?'¿Enviar un correo identificado como TEST solamente a TU correo de propietaria? CB Depot no recibirá nada.':'Send a TEST-labelled email only to YOUR verified owner inbox? The buyer will not be contacted.'))return;
    mailTest.disabled=true;qaResults.replaceChildren(deliveryNode('p',esOwner?'Solicitando correo de prueba…':'Requesting test email…'));
    try{
      const data=await ownerQARequest('qa_email_test');
      qaResults.replaceChildren(deliveryNode('p',
       (esOwner?'✓ Correo TEST solicitado para ':'✓ TEST message queued for ')+data.recipient+
       (esOwner?'. Revisa tu bandeja, Promociones y Spam para confirmar la entrega. No se hizo ninguna reserva ni se contactó al comprador.':
       '. Check your Inbox, Promotions and Spam for delivery. No booking was created and no buyer was contacted.')));
    }catch(error){qaResults.replaceChildren(deliveryNode('p',(esOwner?'No confirmado: ':'Not confirmed: ')+(error.message||String(error))))}
    finally{mailTest.disabled=false}
   };
   pagePreview.onclick=()=>{
     chooseOwnerBuyer(a,'preview');
     const destination=$('ownerBuilderHub');if(destination)destination.scrollIntoView({behavior:'smooth',block:'start'});
   };
   qaActions.append(inspect,lifecycleTest,mailTest,pagePreview);
   ownerQa.append(qaActions,qaResults);
   item.append(ownerQa);
   void addOwnerClientReview('booking',a.id,item);
   if(a.booking_page_url&&/^https:\/\//.test(a.booking_page_url)){
    if(a.already_queued){
     const link=deliveryNode('a','Open delivered Booking Page ↗');link.href=a.booking_page_url;link.target='_blank';link.rel='noopener noreferrer';link.style.cssText='overflow-wrap:anywhere';item.appendChild(link);
    }else{
     const preview=deliveryNode('button','Review Booking Page safely / Revisar vista privada');
     preview.type='button';preview.className='secondary';
     preview.style.cssText='width:100%;max-width:100%;white-space:normal;text-align:center';
     preview.onclick=()=>{chooseOwnerBuyer(a,'preview');$('ownerBuilderHub').scrollIntoView({behavior:'smooth',block:'start'});};
     item.appendChild(preview);
     const previewNote=deliveryNode('p','Private preview only — no bookings or emails. The public Booking Page becomes available after final delivery approval. / Vista previa privada: sin reservas ni correos. La página pública se activa después de aprobar la entrega.');
     previewNote.className='muted';previewNote.style.cssText='font-size:12px;line-height:1.5;margin:0';
     item.appendChild(previewNote);
    }
   }
   
    const activationReady=a.payment_status==='paid'&&!!a.intake_done&&!!a.booking_page_url&&a.status==='active';
    const activation=deliveryNode('div');activation.style.cssText='padding:15px;border:1px solid #d4e7f4;background:#f6fafe;border-radius:16px;display:grid;gap:10px';
    activation.append(deliveryNode('strong','✉ Command Center activation / Activación'));
    const kindLabel=deliveryNode('label',crmLocaleText('Business type','Tipo de negocio'));
    const kind=document.createElement('select');kind.style.cssText='width:100%;margin:6px 0 0';
    [['cleaning','Cleaning business'],['detailing','Car Detailing'],['other','Other service / Otro servicio']].forEach(([v,l])=>{const o=new Option(l,v);kind.add(o)});
    kind.value=a.business_category||(/detail|auto|cb depot/i.test(a.business_name||'')?'detailing':'cleaning');kindLabel.append(kind);activation.append(kindLabel);
    const otherLabel=deliveryNode('label',crmLocaleText('Type of service','Tipo de servicio'));otherLabel.style.display='none';
    const other=document.createElement('input');other.type='text';other.maxLength=65;other.placeholder='e.g. Landscaping';other.value=a.business_category_other||'';otherLabel.append(other);
    kind.onchange=()=>{otherLabel.style.display=kind.value==='other'?'block':'none'};kind.onchange();activation.append(otherLabel);
    const accessDelivered=a.activation_email_link_version==='handoff-v2'&&a.activation_email_delivery_status==='delivered';
    const buyerLoggedInAfterEmail=!!a.buyer_signed_in_after_email;
    const send=deliveryNode('button',accessDelivered?'✓ Activation email delivered / Activación entregada':'Send Activation Email / Enviar activación');send.type='button';send.className='secondary';send.disabled=!activationReady||accessDelivered;
    const msg=deliveryNode('p',accessDelivered?
       '✓ Resend verified delivery on '+new Date(a.activation_email_sent_at).toLocaleString()+'. / Correo entregado. '+(buyerLoggedInAfterEmail?'✓ Buyer signed in after this email / El cliente entró después del envío.':'Awaiting buyer sign-in / Esperando que el cliente abra su Command Center.')+(a.already_queued?' Final delivery recorded.':' Final Booking Page delivery still pending / Entrega final pendiente.'):
       a.activation_email_sent_at?'Activation email requested on '+new Date(a.activation_email_sent_at).toLocaleString()+'. Provider delivery is not verified yet. / Envío registrado; entrega por verificar.':
       activationReady?'Uses the paid buyer email. Final delivery is separate. / Utiliza el correo de compra; entrega final aparte.':
       'Complete intake, design approval and booking setup first. / Termina antes la configuración.');
    msg.style.cssText='margin:0;font-size:12px;line-height:1.55';msg.setAttribute('role','status');
    send.onclick=async()=>{
      if(kind.value==='other'&&!other.value.trim()){msg.textContent=crmLocaleText("Name the service","Escribe el servicio");other.focus();return}
      const to=String(a.owner_email||'').trim();
      if(!to.includes('@')){msg.textContent=crmLocaleText("Invalid buyer email","Correo inválido");return}
      if(!confirm('Send activation to '+to+' for '+(a.business_name||'this business')+' ('+kind.options[kind.selectedIndex].text+')? Final delivery will NOT be sent. / ¿Confirmas el envío?'))return;
      send.disabled=true;msg.textContent=crmLocaleText("Requesting activation…","Enviando activación…");
      try{
        const result=await sendOwnerActivationFor(a.id,kind.value,kind.value==='other'?other.value.trim():'');
        msg.textContent=result.already_sent?crmLocaleText('✓ Activation already accepted recently; no duplicate sent.','✓ Activación aceptada anteriormente; no se envió duplicado.'):crmLocaleText('✓ Resend accepted the email for '+to+'. Inbox delivery pending.','✓ Resend aceptó el correo para '+to+'. Entrega en bandeja pendiente.');
        send.textContent=crmLocaleText("✓ Activation requested","✓ Activación solicitada");
      }catch(e){send.disabled=false;msg.textContent=crmLocaleText('Not sent: ','No enviado: ')+e.message}
    };
    activation.append(send,msg);item.append(activation);
if(a.already_queued){const state=deliveryNode('p','✓ Final delivery queued previously / Entrega ya registrada. No duplicate will be sent.');state.style.fontWeight='700';item.appendChild(state);list.appendChild(item);continue}
   if(!ready){item.appendChild(deliveryNode('p','Complete the intake, private CRM workspace, personalized booking URL and activation before the final review. / Primero termina los accesos y la configuración.'));list.appendChild(item);continue}

   const qaBox=deliveryNode('div');qaBox.style.cssText='padding:17px;border:1px solid #dbc8a9;border-radius:16px;background:#fbf7ed;display:grid;gap:9px;min-width:0';
   qaBox.append(deliveryNode('strong','Private Lead Routing Test / Prueba de entrada de leads'));
   const qaDescription=deliveryNode('p','Tests whether a sample request is saved under this buyer and routed to their private Command Center. The sample is removed after verification. No real booking, customer email or follow-up is created. / Comprueba que una solicitud entra al negocio y a su Command Center; se elimina después sin mandar correos ni crear reservas.');
   qaDescription.style.cssText='font-size:12px;line-height:1.5;margin:0';
   qaBox.append(qaDescription);
   const qaButton=deliveryNode('button','Run private lead test / Probar entrada de lead');qaButton.type='button';qaButton.className='secondary';qaButton.style.cssText='max-width:100%;white-space:normal';
   const qaStatus=deliveryNode('p',crmLocaleText('Not yet tested','Pendiente de prueba'));qaStatus.style.cssText='font-size:12px;margin:0';qaStatus.setAttribute('role','status');qaStatus.setAttribute('aria-live','polite');
   qaButton.onclick=async()=>{
     qaButton.disabled=true;qaStatus.textContent=crmLocaleText("Testing private lead routing…","Comprobando conexión privada de contactos…");
     try{
       const {data:{session},error:sessionError}=await db.auth.getSession();
       if(sessionError||!session?.access_token)throw Error('Sign in to the owner Command Center first');
       const response=await fetch(ownerStudioEndpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},
        body:JSON.stringify({account_id:a.id,action:'qa_test_lead'})});
       const result=await response.json().catch(()=>({}));
       if(!response.ok||!result.ok)throw Error(result.error||'Routing test failed');
       qaStatus.textContent=crmLocaleText("✓ PASS — Request saved → correct private Command Center → QA record removed. No email or booking sent.","✓ PRUEBA APROBADA — La solicitud llegó al Command Center correcto y se eliminó. Sin correos ni reservas reales.");
       qaButton.textContent=crmLocaleText("✓ Retest lead routing","✓ Repetir prueba de conexión");
     }catch(e){qaStatus.textContent=crmLocaleText('Not verified: ','No verificado: ')+(e.message||String(e))}
     finally{qaButton.disabled=false}
   };
   qaBox.append(qaButton,qaStatus);item.append(qaBox);
   const checks=deliveryNode('div');checks.className='delivery-qa-list';checks.setAttribute('role','group');checks.setAttribute('aria-label',crmLocaleText('Final delivery quality checks','Comprobaciones finales'));
   const inputs={};
   for(const [key,caption] of reviewNames){
    const label=deliveryNode('label');label.className='delivery-qa-row';
    const input=document.createElement('input');input.type='checkbox';input.setAttribute('aria-label',caption);
    const copy=deliveryNode('span',caption);copy.className='delivery-qa-caption';
    inputs[key]=input;label.append(input,copy);checks.appendChild(label);
   }
   item.appendChild(checks);
   const action=deliveryNode('button','Approve & send 2 access links + guide / Aprobar y entregar');action.type='button';action.className='secondary delivery-qa-action';
   action.onclick=async()=>{
    if(item.dataset.clientReviewApproved!=='true'){status.textContent=crmLocaleText("Buyer approval is required before final delivery","Falta la aprobación del cliente antes de entregar");return}
    if(!Object.values(inputs).every(input=>input.checked)){status.textContent=crmLocaleText("Complete all six checks before sending","Completa las seis comprobaciones antes de enviar");return}
    const description=(a.business_name||'business')+' ('+(a.owner_email||'buyer')+')';
    if(!confirm('Final delivery to '+description+'? The email will include the real Booking Page, private Command Center and bilingual guide. / ¿Confirmas la entrega?'))return;
    action.disabled=true;status.textContent='Checking and queuing delivery…';
    try{
     const review=Object.fromEntries(Object.entries(inputs).map(([key,input])=>[key,input.checked]));
     const {data,error}=await db.rpc('tle_booking_flow_owner_finalize',{p_account_id:a.id,p_checks:review});
     if(error)throw error;
     status.textContent=data?.queued?crmLocaleText('Delivery queued. Check email status before marking as delivered.','Entrega en cola. Revisa el estado del correo antes de marcarla como entregada.'):crmLocaleText('Already queued; no duplicate sent.','Ya estaba en cola; no se envió ningún duplicado.');
     await loadOwnerDeliveries();
    }catch(error){action.disabled=false;status.textContent='No delivery sent: '+error.message}
   };
   item.appendChild(action);list.appendChild(item);
  }
 }catch(e){status.textContent='Delivery status unavailable: '+e.message}
}


const ownerStudioEndpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-owner-studio';
let builderState=null,builderPreviewData=null;
let previewLeadTestInProgress=false;
window.addEventListener('message',async event=>{
 if(event.origin!=='https://thelaunchera.com'||event.source!==$('buildLiveFrame')?.contentWindow
  ||event.data?.type!=='TLE_OWNER_PREVIEW_QA_REQUEST')return;
 const nonce=event.data?.nonce;
 if(!nonce||nonce!==builderPreviewData?.qa_nonce||!workspace?.is_internal||!ownerReviewAccount?.id)return;
 const frame=$('buildLiveFrame'),accountId=ownerReviewAccount.id;
 const respond=(payload)=>frame?.contentWindow?.postMessage({type:'TLE_OWNER_PREVIEW_QA_RESULT',nonce,...payload},'https://thelaunchera.com');
 if(previewLeadTestInProgress){respond({ok:false,error:'A QA request is already being checked.'});return}
 previewLeadTestInProgress=true;
 try{
  const request=event.data.request||{};
  const result=await ownerStudioCall('qa_test_lead',{qa_payload:{
    service_name:String(request.service_name||'').slice(0,120),
    vehicle_type:String(request.property_type||'').slice(0,80),
    requested_date:String(request.requested_date||'').slice(0,10)
  }});
  if(ownerReviewAccount?.id!==accountId)return;
  $('buildStatus').textContent='✓ Private form test PASSED: Preview submission → correct Command Center lead. Sample deleted; no emails or bookings.';
  respond({ok:!!result.ok,verified:!!result.linked_to_crm,error:result.error||''});
 }catch(error){respond({ok:false,error:error.message||'Lead QA failed'})}
 finally{previewLeadTestInProgress=false}
});
async function ownerStudioCall(action,extra={}){
 if(!workspace?.is_internal||!ownerReviewAccount?.id)throw Error('Select a paid buyer order first');
 const {data:{session},error:e}=await db.auth.getSession();
 if(e||!session?.access_token)throw Error('Please sign in again');
 const response=await fetch(ownerStudioEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token},
  body:JSON.stringify({account_id:ownerReviewAccount.id,action,...extra})});
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(result.error||'Could not complete this step');
 return result;
}
function buildLabel(en,es){return buyerPageLabel()?es:en}
function buildField(form,name,value){if(form.elements[name])form.elements[name].value=String(value||'')}
function buildIntakeRows(intake){
 const box=$('buildIntake');box.replaceChildren();
 const wanted=[['business_name','Business name / Nombre'],['owner_name','Owner / Dueña'],['email','Email / Correo'],['phone','Phone / Teléfono'],
 ['service_areas','Service area / Zona'],['services','Services / Servicios'],['pricing_style','Price approach / Precio'],['add_ons','Add-ons / Extras'],
 ['availability','Hours / Horarios'],['brand_colors','Brand colors / Colores'],['logo_assets_link','Logo reference / Referencia del logo'],['hero_photo_url','Hero photo / Foto'],
 ['photos_link','More photos / Fotos'],['about_business','About / Acerca de'],['customer_reviews','3 customer reviews / 3 reviews de clientes'],['reviews','Customer reviews / Reseñas'],
 ['quote_estimate_rules','Estimate rules / Cotizaciones']];
 for(const [key,label] of wanted){const value=intake[key];if(value===undefined||value===null||String(value).trim()==='')continue;
  const cell=ownerPageElem('div',undefined,'background:#fff;border:1px solid #e5ebef;border-radius:16px;padding:14px;min-width:0');
  const head=ownerPageElem('strong',label,'display:block;color:#536a79;font-size:12px;margin-bottom:6px');
  const content=ownerPageElem('p',typeof value==='string'?value:JSON.stringify(value),'font-size:13px;white-space:pre-wrap;word-break:break-word;line-height:1.55;margin:0');
  cell.append(head,content);box.append(cell);
 }
 if(!box.children.length)box.append(ownerPageElem('p',buildLabel('Waiting for intake details.','Esperando el formulario de la compradora.')));
}
let privateEmailDraft=null,privateEmailConfirm='';
function permittedForBuyerEmail(){return !!builderState?.reviewed&&!!builderState?.order?.has_booking_link&&builderState?.order?.status==='active'}
function privateEmailChoice(){
 return {business_category:$('buildClientEmailCategory').value,business_category_other:$('buildClientEmailOther').value.trim()};
}
async function prepareBuyerClientEmail(){
 if(!workspace?.is_internal||!ownerReviewAccount?.id||!builderState)return;
 const id=ownerReviewAccount.id,selection=privateEmailChoice();
 const send=$('buildClientEmailSend'),status=$('buildClientEmailStatus'),replaceBtn=$('buildClientEmailReplace');
 privateEmailDraft=null;privateEmailConfirm='';
 replaceBtn.classList.add('hidden');replaceBtn.disabled=true;
 send.disabled=true;send.textContent=buildLabel('Review & send access','Revisar y enviar acceso');
 $('buildClientEmailTo').value=builderState.order.owner_email||'';
 $('buildClientEmailFrom').value='The Launch Era <hello@thelaunchera.com>';
 $('buildClientEmailSubject').value='';
 $('buildClientEmailPreviewFrame').srcdoc='';
 if(selection.business_category==='other'&&!selection.business_category_other){status.textContent=buildLabel('Enter a business type first.','Escribe primero el tipo de servicio.');return}
 status.textContent=buildLabel('Preparing personalized email preview…','Preparando el correo personalizado…');
 try{
  const data=await ownerStudioCall('activation_preview',selection);
  if(!workspace?.is_internal||ownerReviewAccount?.id!==id)return;
  privateEmailDraft=data;
  replaceBtn.classList.toggle('hidden',!(data.repair_available&&data.status==='delivered'));
  replaceBtn.disabled=!(data.repair_available&&permittedForBuyerEmail());
  $('buildClientEmailTo').value=data.to||'';
  $('buildClientEmailSubject').value=data.subject||'';
  $('buildClientEmailFrom').value=data.from||'';
  $('buildClientEmailPreviewFrame').srcdoc=data.html||'';
  const permitted=!!builderState.reviewed&&!!builderState.order.has_booking_link&&builderState.order.status==='active';
  send.disabled=!permitted||!['ready_to_send','legacy_link_needs_replacement'].includes(data.status);
  if(data.status==='delivered'){
   send.textContent=buildLabel('✓ Activation email delivered','✓ Correo de activación entregado');
   status.textContent=(data.buyer_signed_in_after_email?
     buildLabel('✓ Resend confirms delivery, and the buyer signed in after this invitation. Final Booking Page handoff is separate.','✓ Resend confirma la entrega y el cliente ya entró después de la invitación. La entrega final es aparte.'):
     buildLabel('✓ Resend confirms delivery to the buyer. Waiting for the buyer to sign in; no duplicate email is needed. Final Booking Page handoff is pending.','✓ Resend confirmó la entrega al cliente. Esperamos su acceso; no necesitas reenviar. La entrega final está pendiente.'));
  }else if(data.status==='previously_sent'){
   send.textContent=buildLabel('✓ Activation sent · delivery pending','✓ Activación enviada · pendiente');

   status.textContent=buildLabel('The corrected private access was sent. Request another link later only if necessary.','El acceso privado corregido ya fue enviado. Pide otro más tarde solo si es necesario.');
  }else if(data.status==='legacy_link_needs_replacement'&&permitted){
   send.textContent=buildLabel('Send corrected activation','Enviar activación corregida');
   status.textContent=buildLabel('The previous email opened the wrong website. This new email will link directly to the private Command Center. Nothing has been sent yet.','El correo anterior abría otra página. Este correo abrirá directamente el Command Center privado. Todavía no se ha enviado.');
  }else if(permitted){
   status.textContent=buildLabel('✓ Email prepared, not sent. The preview URL is not an activation link.','✓ Correo preparado, sin enviar. El enlace de vista no activa ninguna cuenta.');
  }else{
   status.textContent=buildLabel('Approve the design and prepare the booking page before sending.','Aprueba el diseño y prepara la página antes de enviar.');
  }
 }catch(error){privateEmailDraft=null;status.textContent=buildLabel('Email preview unavailable: ','Vista previa no disponible: ')+(error.message||String(error))}
}
$('buildClientEmailCategory').onchange=()=>{
 $('buildClientEmailOtherLabel').style.display=$('buildClientEmailCategory').value==='other'?'block':'none';
 prepareBuyerClientEmail();
};
$('buildClientEmailOther').onchange=prepareBuyerClientEmail;
$('buildClientEmailRefresh').onclick=prepareBuyerClientEmail;
$('buildClientEmailReplace').onclick=async()=>{
 const btn=$('buildClientEmailReplace'),status=$('buildClientEmailStatus');
 if(!workspace?.is_internal||!ownerReviewAccount?.id||!permittedForBuyerEmail()||!privateEmailDraft?.repair_available||privateEmailDraft.status!=='delivered')return;
 const accountId=ownerReviewAccount.id,recipient=privateEmailDraft.to;
 if(!confirm('The previous activation opened a text page. Send ONE new secure activation link directly to '+recipient+'? This does NOT send final delivery. / ¿Enviar UN enlace de activación nuevo a este cliente?'))return;
 btn.disabled=true;status.textContent=buildLabel('Creating a fresh private access link…','Creando un nuevo enlace privado…');
 try{
  const result=await ownerStudioCall('send_activation',{...privateEmailChoice(),replace_broken_link:true});
  if(ownerReviewAccount?.id!==accountId)return;
  status.textContent=result.already_sent?
   buildLabel('No duplicate was sent. Refresh the status.','No se envió duplicado. Actualiza el estado.'):
   buildLabel('✓ Replacement access email accepted by Resend. Await delivery confirmation.','✓ Resend aceptó la nueva activación. Espera confirmación de entrega.');
  await loadOwnerBuilder();
 }catch(error){btn.disabled=false;status.textContent=buildLabel('New activation not sent: ','No se envió la nueva activación: ')+(error.message||String(error))}
};
$('buildClientEmailSend').onclick=async()=>{
 const btn=$('buildClientEmailSend'),status=$('buildClientEmailStatus');
 if(!workspace?.is_internal||!ownerReviewAccount?.id||!privateEmailDraft||!['ready_to_send','legacy_link_needs_replacement'].includes(privateEmailDraft.status)){
  status.textContent=buildLabel('Refresh the email preview first.','Actualiza primero la vista del correo.');return;
 }
 const id=ownerReviewAccount.id,to=privateEmailDraft.to,selection=privateEmailChoice();
 if(!to||!to.includes('@')){status.textContent=buildLabel('Buyer email is missing.','Falta el correo del cliente.');return}
 if(privateEmailConfirm!==id){
  privateEmailConfirm=id;
  btn.textContent=buildLabel('Confirm: send to '+to,'Confirmar: enviar a '+to);
  status.textContent=buildLabel('A second click sends ONE real private account email; it does not deliver the Booking Page.','El segundo toque envía UN correo real de acceso; no entrega la Booking Page.');
  return;
 }
 privateEmailConfirm='';btn.disabled=true;btn.textContent=buildLabel('Sending secure access…','Enviando acceso seguro…');
 status.textContent=buildLabel('Generating one-time access link…','Generando enlace privado de un solo uso…');
 try{
  const result=await ownerStudioCall('send_activation',selection);
  if(ownerReviewAccount?.id!==id)return;
  status.textContent=result.already_sent?buildLabel('No duplicate was sent; the previous email was accepted.','No se envió duplicado. El anterior ya fue aceptado.'):
   buildLabel('✓ Resend accepted the access email. Verify inbox delivery before final handoff.','✓ Resend aceptó el correo. Confirma su entrega antes de finalizar.');
  await loadOwnerBuilder();
 }catch(error){
  status.textContent=buildLabel('Access email not sent: ','No se envió el acceso: ')+(error.message||String(error));
  btn.disabled=false;btn.textContent=buildLabel('Review & send access','Revisar y enviar acceso');
 }
};
function setBuyerClientEmailChoice(){
 if(!builderState)return;
 const order=builderState.order||{},name=String(order.business_name||'');
 const kind=['cleaning','detailing','other'].includes(order.business_category)?order.business_category:
  /CB Depot|detail|auto/i.test(name)?'detailing':'cleaning';
 $('buildClientEmailCategory').value=kind;
 $('buildClientEmailOther').value=order.business_category_other||'';
 $('buildClientEmailOtherLabel').style.display=kind==='other'?'block':'none';
 prepareBuyerClientEmail();
}
function buildRenderStatus(){
 if(!builderState)return;
 const order=builderState.order,reviewed=builderState.reviewed;
 const panel=$('buildSteps');panel.replaceChildren();
 const statuses=[
  ['1. Intake',order.intake_received],
  ['2. Customize',builderState.saved],
  ['3. Preview',reviewed],
  ['4. Workspace',order.workspace_ready],
  ['5. Test',false],
  ['6. Deliver',order.delivered]];
 for(const [label,done] of statuses){
  const cell=ownerPageElem('div',undefined,'background:'+(done?'#e9f7f2':'#fff')+';border:1px solid #e2e9ed;padding:12px 15px;border-radius:15px;min-width:0');
  cell.append(ownerPageElem('strong',(done?'✓ ':'○ ')+label,'font-size:12px'));panel.append(cell);
 }
 const prepared=order.status==='active'&&!!order.has_booking_link;
 $('buildPrepare').disabled=!reviewed||!order.intake_received||prepared;
 $('buildPrepare').textContent=prepared?buildLabel('✓ System prepared','✓ Sistema preparado'):buildLabel('Prepare system','Preparar sistema');
 $('buildInvite').disabled=!reviewed||!prepared||!order.intake_received;
 $('buildInvite').textContent=buildLabel('Open Activation Email','Abrir correo de activación');
 delete $('buildInvite').dataset.confirmFor;
 const reviewButton=$('buildMarkReviewed');
 reviewButton.disabled=!builderState.saved||reviewed;
 reviewButton.textContent=reviewed?buildLabel('✓ Design approved','✓ Diseño aprobado'):buildLabel('Approve the design','Aprobar diseño');
 const reviewMessage=$('buildReviewStatus');
 reviewMessage.textContent=reviewed?buildLabel('✓ Approval saved. Continue with private access below.','✓ Aprobación guardada. Continúa con el acceso privado abajo.'):builderState.saved?buildLabel('Check the preview, then approve here.','Revisa la vista previa y aprueba aquí.'):buildLabel('Save the design first.','Primero guarda el diseño.');
 const accessMessage=$('buildInviteStatus');
 accessMessage.textContent=order.activation_email_delivery_status==='delivered'&&order.activation_email_link_version==='handoff-v2'?
   (order.buyer_signed_in_after_email?buildLabel('✓ Activation email delivered and buyer signed in. Final Booking Page delivery requires approval.','✓ Correo entregado y cliente ingresó. La entrega final requiere aprobación.'):
    buildLabel('✓ Activation email delivered. Waiting for client sign-in; final delivery remains pending.','✓ Correo de activación entregado. Esperando que el cliente ingrese; la entrega final sigue pendiente.')):
   order.workspace_ready?buildLabel('✓ Private workspace linked. Manage its activation email in Owner Settings.','✓ Espacio privado conectado. Gestiona la activación desde Owner Settings.'):prepared&&reviewed?buildLabel('✓ Design and booking page are prepared. Send the private access invitation when ready.','✓ Diseño y página preparados. Puedes enviar la invitación de acceso privado.'):reviewed?buildLabel('Design approved. Prepare the system to enable the invitation.','Diseño aprobado. Prepara el sistema para habilitar la invitación.'):buildLabel('Approve the design before preparing private access.','Aprueba el diseño antes de preparar el acceso privado.');
 $('buildBuyerTitle').textContent=order.business_name||ownerReviewAccount.business_name;
 $('buildStatus').textContent=order.delivered?buildLabel('System delivered. Updates to pricing and design remain available.','Sistema entregado. Puedes seguir editando el diseño y los precios.'):
  !order.intake_received?buildLabel('Waiting for the buyer to complete the intake. No delivery or invitation will be sent.','Esperando el intake. No se enviará ningún acceso.'):
  !builderState.saved?buildLabel('Start by customizing the buyer’s design and services.','Personaliza primero el diseño y los servicios.'):
  !reviewed?buildLabel('Save the design, review the true preview, then approve the design.','Guarda, revisa la vista real y aprueba el diseño.'):
  order.workspace_ready?buildLabel('Workspace linked. Perform final QA in Settings before delivering.','Espacio privado conectado. Haz las pruebas finales antes de entregar.'):
  buildLabel('Design approved. Prepare access, then invite the buyer to activate the private account.','Diseño aprobado. Prepara el acceso e invita a la compradora.');
}
function renderBuildPhotos(photos,brand){
 const root=$('buildIntakePhotos'),hero=$('buildHeroPhotoSelect'),logo=$('buildLogoPhotoSelect');
 const serviceSelects={exterior:$('buildServicePhotoExterior'),paint:$('buildServicePhotoPaint'),interior:$('buildServicePhotoInterior'),full:$('buildServicePhotoFull')};
 root.replaceChildren();
 for(const select of [hero,logo])select.replaceChildren(new Option(select===hero?'No main photo / Sin foto':'No logo / Sin logo',''));
 for(const el of Object.values(serviceSelects))el.replaceChildren(new Option('Use sample / Usar ejemplo',''));
 const all=Array.isArray(photos)?photos:[];
 if(!all.length){
  root.appendChild(ownerPageElem('p',buildLabel('No photos have been uploaded yet. The buyer can submit up to 10 photos from their phone.','Todavía no hay fotos. La compradora puede subir hasta 10 desde su teléfono.'),'grid-column:1/-1;font-size:13px;color:#5b7080'));
  return;
 }
 for(const file of all){
  const path=String(file.path||''),label=String(file.name||'Photo');
  if(!file.preview_url)continue;
  const isWeb=/\.(jpe?g|png|webp)$/i.test(path);
  if(isWeb){hero.add(new Option(label,path));logo.add(new Option(label,path));for(const el of Object.values(serviceSelects))el.add(new Option(label,path))}
  const tile=ownerPageElem('div',undefined,'min-width:0;background:#fff;border:1px solid #dfebf2;border-radius:14px;padding:8px;overflow:hidden');
  const img=document.createElement('img');img.alt=label;img.loading='lazy';img.referrerPolicy='no-referrer';
  img.style.cssText='width:100%;height:112px;object-fit:cover;display:block;border-radius:9px;background:#f0f7fb';
  img.src=file.preview_url;
  const title=ownerPageElem('div',label,'font-size:11px;line-height:1.4;overflow-wrap:anywhere;margin:7px 0;color:#495c6b');
  tile.append(img,title);
  if(isWeb)for(const [select,text] of [[hero,buildLabel('Use as hero','Usar como foto')],[logo,buildLabel('Use as logo','Usar como logo')]]){
   const btn=ownerPageElem('button',text);btn.type='button';btn.className='secondary';
   btn.style.cssText='font-size:11px;width:100%;padding:7px 6px;margin:3px 0';
   btn.onclick=()=>{select.value=path;select.dispatchEvent(new Event('change'))};tile.appendChild(btn)
  }else{tile.appendChild(ownerPageElem('p',buildLabel('HEIC: convert to JPG for the website','HEIC: convertir a JPG para la web'),'font-size:11px;color:#9b5c29'))}
  root.appendChild(tile);
 }
 hero.value=brand?.hero_photo_path||'';
 logo.value=brand?.logo_photo_path||'';
 for(const [name,el] of Object.entries(serviceSelects))el.value=brand?.service_photos?.[name]?.path||'';
}
async function loadOwnerBuilder(){
 if(!workspace?.is_internal||!ownerReviewAccount)return premiumNavigate('owner-pages');
 const status=$('buildStatus');status.textContent=buildLabel('Loading personalized buyer setup…','Cargando configuración…');
 try{
  const ownerId=workspace.id,orderId=ownerReviewAccount.id;
  const data=await ownerStudioCall('get');
  if(!workspace?.is_internal||workspace.id!==ownerId||ownerReviewAccount?.id!==orderId)return;
  builderState=data;
  const order=data.order;ownerReviewAccount={...ownerReviewAccount,business_name:order.business_name,intake_done:order.intake_received};
  buildIntakeRows(order.intake||{});
  const brand=data.branding||{},form=$('buildBrandForm');
  for(const key of ['business_name','headline','description','service_area','primary_color','accent_color'])
   buildField(form,key,brand[key]||'');
  renderBuildPhotos(data.uploaded_photos||[],brand);
  for(let n=1;n<=3;n++){const r=brand.reviews?.[n-1]||{};for(const key of ['name','text','rating'])buildField(form,'review_'+n+'_'+key,r[key]??'')}
  buildRenderStatus();
  setBuyerClientEmailChoice();
 }catch(e){builderState=null;status.textContent=crmLocaleText("Could not load buyer setup: ","No se pudo cargar la configuración: ")+e.message}
}
$('buildBack').onclick=()=>premiumNavigate('owner-pages');
$('buildOpenCal').onclick=()=>{if(ownerReviewAccount?.id)openBuyerWorkCalendar(ownerReviewAccount.id)};
$('buildEditPricing').onclick=()=>premiumNavigate('pricing');
$('buildEditAvailability').onclick=()=>premiumNavigate('availability');
async function buildPhotoPayload(file){
 if(!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)&&!/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name))throw Error(crmLocaleText('Choose a supported image.','Selecciona una imagen compatible.'));
 const source=await new Promise((resolve,reject)=>{
  const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Could not read photo'));reader.readAsDataURL(file);
 });
 const bitmap=await new Promise((resolve,reject)=>{
  const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Could not open photo'));image.src=String(source);
 });
 const scale=Math.min(1,1800/Math.max(bitmap.naturalWidth,bitmap.naturalHeight));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.naturalWidth*scale));canvas.height=Math.max(1,Math.round(bitmap.naturalHeight*scale));
 canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
 const mime=file.type==='image/png'?'image/png':'image/jpeg';
 let blob=await new Promise(res=>canvas.toBlob(res,mime,mime==='image/jpeg'?0.83:undefined));
 if(!blob||blob.size>3900000){blob=await new Promise(res=>canvas.toBlob(res,'image/jpeg',0.76))}
 if(!blob||blob.size>3900000)throw Error(crmLocaleText('Photo is too large after resizing.','La foto sigue siendo demasiado grande después de ajustar su tamaño.'));
 const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';
 for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return {filename:file.name.replace(/\.(heic|heif)$/i,'.jpg'),mime:blob.type,base64:btoa(binary)};
}
$('buildOwnerUpload').onchange=async e=>{
 const input=e.currentTarget,files=[...input.files||[]].slice(0,10),message=$('buildUploadStatus');
 if(!files.length)return;
 input.disabled=true;let added=0;
 try{
  for(const file of files){
   message.textContent=buildLabel('Uploading '+(added+1)+' of '+files.length+'…','Subiendo '+(added+1)+' de '+files.length+'…');
   const payload=await buildPhotoPayload(file);
   await ownerStudioCall('upload',payload);added++;
  }
  await loadOwnerBuilder();
  message.textContent=buildLabel(added+' photo(s) added. Select a main photo or logo, then Save design.',added+' foto(s) añadidas. Escoge foto principal o logo y guarda el diseño.');
 }catch(err){
  if(added)await loadOwnerBuilder();
  message.textContent=buildLabel('Added '+added+' photo(s). ','Añadidas '+added+' fotos. ')+err.message;
 }finally{input.value='';input.disabled=false}
};

$('buildBrandForm').onsubmit=async e=>{
 e.preventDefault();const button=$('buildSave');button.disabled=true;$('buildStatus').textContent=buildLabel('Saving personalized design…','Guardando diseño…');
 try{
  const formData=Object.fromEntries(new FormData(e.target));
  const service_photo_paths={};
  for(const k of ['exterior','paint','interior','full']){
   service_photo_paths[k]=String(formData['service_photo_'+k]||'');
   delete formData['service_photo_'+k];
  }
  const reviews=[1,2,3].map(n=>({name:String(formData['review_'+n+'_name']||'').trim(),text:String(formData['review_'+n+'_text']||'').trim(),rating:formData['review_'+n+'_rating']===''?null:Number(formData['review_'+n+'_rating'])})).filter(r=>r.name||r.text);
  if(reviews.some(r=>!r.name||!r.text))throw Error(crmLocaleText('Complete the name and text of each review.','Completa el nombre y el texto de cada reseña.'));
  for(let n=1;n<=3;n++)for(const key of ['name','text','rating'])delete formData['review_'+n+'_'+key];
  await ownerStudioCall('save',{branding:{...formData,reviews,service_photo_paths}});
  await loadOwnerBuilder();
  $('buildStatus').textContent=buildLabel('Design saved. Open the real preview and approve it.','Diseño guardado. Revisa la vista real y apruébala.');
 }catch(error){$('buildStatus').textContent=crmLocaleText("Not saved: ","No se guardó: ")+error.message}
 finally{button.disabled=false}
};
async function loadBuilderRealPreview(){
 const status=$('buildStatus');status.textContent=buildLabel('Loading the actual Booking Page…','Cargando la página real…');
 try{
  const ownerId=workspace.id,orderId=ownerReviewAccount?.id;
  const [studio,price,availability]=await Promise.all([ownerStudioCall('get'),pricingCall('get'),availabilityCall('get')]);
  if(!workspace?.is_internal||workspace.id!==ownerId||ownerReviewAccount?.id!==orderId)return;
  builderState=studio;buildRenderStatus();
  const svc=Array.isArray(price.settings?.services)?price.settings.services.filter(v=>v.active!==false):[];
  if(!svc.length){status.textContent=buildLabel('Add and save at least one service in Pricing & Services first.','Añade y guarda al menos un servicio en Pricing & Services.');return}
  const b=studio.branding||{},ov=studio.order;
  builderPreviewData={business_name:b.business_name||ov.business_name,language:ov.language||'en',
   timezone:availability.settings?.timezone||ov.intake?.timezone||'America/New_York',
   branding:{description:b.description,headline:b.headline,service_area:b.service_area,
    hero_image:(studio.uploaded_photos||[]).find(x=>x.path===b.hero_photo_path)?.preview_url||b.hero_image,
    logo_image:(studio.uploaded_photos||[]).find(x=>x.path===b.logo_photo_path)?.preview_url||b.logo_image,
    primary_color:b.primary_color,accent_color:b.accent_color,reviews:b.reviews||[],
    service_photos:Object.fromEntries(['exterior','paint','interior','full'].map(k=>[k,
     (studio.uploaded_photos||[]).find(x=>x.path===b.service_photos?.[k]?.path)?.preview_url||b.service_photos?.[k]?.url||null]))},
   currency:price.settings?.currency||'USD',services:svc,addons:price.settings?.addons||[],
   quote_policy:price.settings?.quote_policy||'review_unpriced_jobs',auto_confirm_flat:price.settings?.auto_confirm_flat===true,
   availability:availability.settings||{},qa_nonce:crypto.randomUUID()};
  const frame=$('buildLiveFrame');
  const send=()=>{if(frame.contentWindow&&builderPreviewData)frame.contentWindow.postMessage({type:'TLE_OWNER_BOOKING_PREVIEW',config:builderPreviewData},'*')};
  frame.onload=send;
  frame.src='https://thelaunchera.com/booking/?owner_preview=1&lang='+encodeURIComponent(builderPreviewData.language==='es'?'es':'en');
  if(window.matchMedia('(max-width:760px)').matches)setOwnerBookingPreviewFullscreen(true);
  status.textContent=buildLabel('Private buyer preview. Submit a sample request to verify lead routing: no actual email, booking or follow-up is created.','Vista privada. Envía una solicitud de prueba para verificar la llegada del lead; no se crean correos ni reservas.');
 }catch(e){status.textContent=crmLocaleText("Preview unavailable: ","Vista previa no disponible: ")+e.message}
}
let ownerPreviewMode='desktop';
function setOwnerBookingPreviewMode(mode){
 ownerPreviewMode=mode==='phone'?'phone':'desktop';
 const shell=$('buildFrameShell'),frame=$('buildLiveFrame');
 shell.classList.toggle('tle-phone-preview',ownerPreviewMode==='phone');
 if(document.body.classList.contains('owner-preview-fullscreen-open')){
  shell.style.width='100%';
  frame.style.height='100%';
 }else{
  shell.style.width=ownerPreviewMode==='phone'?'min(100%,390px)':'100%';
  frame.style.height=ownerPreviewMode==='phone'?'980px':'1020px';
 }
 $('buildPreviewMobile').setAttribute('aria-pressed',String(ownerPreviewMode==='phone'));
 $('buildPreviewDesktop').setAttribute('aria-pressed',String(ownerPreviewMode==='desktop'));
}
function setOwnerBookingPreviewFullscreen(open){
 const shell=$('buildFrameShell'),frame=$('buildLiveFrame');
 if(!shell||!frame)return;
 document.body.classList.toggle('owner-preview-fullscreen-open',!!open);
 shell.classList.toggle('tle-preview-fullscreen',!!open);
 $('buildPreviewExpand').setAttribute('aria-expanded',String(!!open));
 $('buildPreviewExitFullScreen').setAttribute('aria-hidden',String(!open));
 if(open&&window.matchMedia('(max-width:760px)').matches)ownerPreviewMode='phone';
 setOwnerBookingPreviewMode(ownerPreviewMode);
 if(open)$('buildPreviewExitFullScreen').focus({preventScroll:true});
 else $('buildPreviewExpand').focus({preventScroll:true});
}
$('buildPreviewReload').onclick=loadBuilderRealPreview;
$('buildPreviewMobile').onclick=()=>{
 setOwnerBookingPreviewMode('phone');
 if(window.matchMedia('(max-width:760px)').matches)setOwnerBookingPreviewFullscreen(true);
};
$('buildPreviewDesktop').onclick=()=>{
 setOwnerBookingPreviewMode('desktop');
 if(window.matchMedia('(max-width:760px)').matches)setOwnerBookingPreviewFullscreen(true);
};
$('buildPreviewExpand').onclick=()=>setOwnerBookingPreviewFullscreen(true);
$('buildPreviewExitFullScreen').onclick=()=>setOwnerBookingPreviewFullscreen(false);
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&document.body.classList.contains('owner-preview-fullscreen-open'))setOwnerBookingPreviewFullscreen(false);
});
$('buildMarkReviewed').onclick=async()=>{
 const btn=$('buildMarkReviewed'),note=$('buildReviewStatus'),status=$('buildStatus');
 if(builderState?.reviewed){
  note.textContent=buildLabel('✓ Already approved. You can continue below.','✓ Ya está aprobado. Puedes continuar abajo.');
  $('buildAccessPanel').scrollIntoView({behavior:'smooth',block:'start'});return;
 }
 if(!builderState?.saved){note.textContent=buildLabel('Save the design first.','Guarda el diseño primero.');return}
 if(!builderPreviewData){
  note.textContent=buildLabel('Open Refresh preview before approval.','Abre Actualizar vista previa antes de aprobar.');
  return;
 }
 // Explicit click is the owner's approval; avoid a blocking browser-native confirm on iPad.
 btn.disabled=true;btn.textContent=buildLabel('Approving…','Aprobando…');
 note.textContent=buildLabel('Checking services, hours and images…','Verificando servicios, horario e imágenes…');
 try{
  const result=await ownerStudioCall('review');
  if(result.reviewed!==true)throw Error('The approval was not confirmed');
  await loadOwnerBuilder();
  note.textContent=buildLabel('✓ Design approved and saved. Continue below.','✓ Diseño aprobado y guardado. Continúa abajo.');
  status.textContent=buildLabel('Approval confirmed. Private access is the next step.','Aprobación confirmada. El acceso privado es el próximo paso.');
  $('buildAccessPanel').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(error){
  note.textContent=buildLabel('Could not approve: ','No se pudo aprobar: ')+error.message;
  status.textContent=note.textContent;
  btn.disabled=false;btn.textContent=buildLabel('Approve the design','Aprobar diseño');
 }
};
$('buildRunPreflight').onclick=async()=>{
 const button=$('buildRunPreflight'),output=$('buildPrivateCheckResult');
 if(!workspace?.is_internal||!ownerReviewAccount?.id)return;
 const id=ownerReviewAccount.id;
 button.disabled=true;button.textContent=buildLabel('Checking privately…','Verificando en privado…');
 output.replaceChildren();
 const note=ownerPageElem('p',buildLabel('Reviewing only; no emails, reservations or access invitations.','Solo revisión; no se envían correos, reservas ni invitaciones.'),'color:#386786;font-size:13px;font-weight:700;line-height:1.55');
 output.append(note);
 try{
  const data=await ownerStudioCall('preflight');
  if(ownerReviewAccount?.id!==id)return;
  output.replaceChildren();
  const header=ownerPageElem('div',undefined,'background:#eff6fd;border:1px solid #d6e7f5;border-radius:16px;padding:16px');
  header.append(ownerPageElem('strong',data.setup_ready?buildLabel('✓ CB Depot configuration verified privately','✓ Configuración de CB Depot verificada en privado'):buildLabel('CB Depot: configuration needs attention','CB Depot: hay configuraciones pendientes'),'font-size:15px;color:#214a69;display:block'));
  header.append(ownerPageElem('p',buildLabel('No emails, reservations, invitations or workspaces were created.','No se crearon correos, reservas, invitaciones ni espacios de trabajo.'),'margin:6px 0 0;font-size:12px;color:#486778;line-height:1.5'));
  output.append(header);
  const checks=[
   ['Payment and intake / Pago y formulario',data.checks?.paid&&data.checks?.intake],
   ['Design approved / Diseño aprobado',data.checks?.design],
   ['Active services / Servicios activos',data.checks?.services],
   ['Business hours / Horarios',data.checks?.hours],
   ['Booking Page prepared / Booking Page preparada',data.checks?.booking_page],
   ['Buyer identity exists / Identidad registrada',data.checks?.identity_exists],
   ['Buyer email verified / Correo del cliente verificado',data.checks?.identity_verified],
   ['Private Command Center linked / Command Center vinculado',data.checks?.workspace_linked],
   ['Final delivery sent / Entrega final enviada',data.checks?.public_delivery]
  ];
  const grid=ownerPageElem('div',undefined,'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:8px;margin:12px 0');
  for(const [label,passed] of checks){
   const cell=ownerPageElem('div',undefined,'background:'+(passed?'#f0f8f5':'#fff6e9')+';border:1px solid '+(passed?'#c9e6d9':'#f0ddc4')+';border-radius:11px;padding:11px;color:#304e62;font-size:12px;font-weight:700;line-height:1.4');
   cell.append(ownerPageElem('span',(passed?'✓ ':'○ ')+label));
   grid.append(cell);
  }
  output.append(grid);
  const days={0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat'};
  const schedule=(data.open_days||[]).map(x=>days[x.day]+' '+x.start+'–'+x.end).join(' · ');
  const svc=Array.isArray(data.service_names)?data.service_names.join(' · '):'';
  output.append(ownerPageElem('p',buildLabel('Services: ','Servicios: ')+svc,'font-size:12px;line-height:1.6;color:#496276'));
  output.append(ownerPageElem('p',buildLabel('Hours: ','Horario: ')+schedule,'font-size:12px;line-height:1.6;color:#496276'));
  output.append(ownerPageElem('p',buildLabel('Existing requests: ','Solicitudes existentes: ')+Number(data.request_count||0),'font-size:12px;line-height:1.5;color:#496276'));
  const next=data.checks?.workspace_linked?
   buildLabel('Workspace linked; real login and tenant isolation still need testing before delivery.','Espacio vinculado; todavía falta probar el inicio de sesión y el aislamiento antes de entregar.'):
   data.checks?.identity_verified?
   buildLabel('Customer identity verified. Private linkage is pending; use the invitation step only when you authorize it.','Identidad verificada. Falta vincular su espacio; usa la invitación solo cuando la autorices.'):
   buildLabel('Customer email is not verified yet. Real login is blocked until verification; do not send the product yet.','El correo del cliente no está verificado. El acceso real requiere verificarlo; no entregues el producto todavía.');
  output.append(ownerPageElem('p',next,'background:#fff8e8;border:1px solid #f1dfbc;padding:13px;border-radius:12px;font-size:12px;font-weight:700;line-height:1.55'));
 }catch(e){output.replaceChildren(ownerPageElem('p',buildLabel('Private verification failed: ','Error en verificación privada: ')+e.message,'color:#a13931;font-size:13px'))}
 finally{button.disabled=false;button.textContent=buildLabel('Verify privately — no email','Verificar sin enviar correo')}
};
$('buildPrepare').onclick=async()=>{
 const btn=$('buildPrepare'),note=$('buildInviteStatus');
 if(builderState?.order?.status==='active'&&builderState?.order?.has_booking_link){
  note.textContent=buildLabel('✓ System already prepared. Next: send the invitation.','✓ Sistema ya preparado. Ahora envía la invitación.');
  return;
 }
 btn.disabled=true;btn.textContent=buildLabel('Preparing…','Preparando…');
 note.textContent=buildLabel('Preparing private booking settings. No invitation is being sent.','Preparando la configuración privada. No se está enviando ninguna invitación.');
 try{
  const result=await ownerStudioCall('prepare');
  await loadOwnerBuilder();
  note.textContent=result.prepared?buildLabel('✓ Private booking prepared. You may now send the access invitation.','✓ Booking privado preparado. Ya puedes enviar la invitación de acceso.'):buildLabel('Preparation was not confirmed.','No se confirmó la preparación.');
 }catch(error){
  note.textContent=buildLabel('Could not prepare access: ','No se pudo preparar el acceso: ')+error.message;
  btn.disabled=false;btn.textContent=buildLabel('Prepare system','Preparar sistema');
 }
};
$('buildInvite').onclick=()=>{
 if(!workspace?.is_internal||!ownerReviewAccount?.id)return;
 $('buildClientEmailPanel').scrollIntoView({behavior:'smooth',block:'start'});
};
$('buildFinalChecks').onclick=()=>{premiumNavigate('settings');$('ownerDeliveryPanel').scrollIntoView({behavior:'smooth'})};

const buyerPageLabel=()=>localStorage.getItem('tle_crm_language')==='es';
function ownerPageElem(tag,textValue,style){const e=document.createElement(tag);if(textValue!==undefined)e.textContent=String(textValue);if(style)e.style.cssText=style;return e}
function chooseOwnerBuyer(a,tab){ownerReviewAccount={id:a.id,business_name:a.business_name||'Cleaning Business',intake_done:!!a.intake_done,booking_page_url:a.booking_page_url};if(tab==='builder'){setView('owner-build');loadOwnerBuilder()}else if(tab==='preview'){setView('owner-build');loadOwnerBuilder().then(()=>loadBuilderRealPreview())}else premiumNavigate(tab)}


let ownerCalendarRecords=[];
let ownerCalendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let ownerCalendarSelectedDay='';
let ownerCalendarBuyerPref='';
let ownerCalendarLoadGeneration=0;
const ownerCalendarKinds={
 payment:{en:'Paid order recorded',es:'Pedido pagado registrado',color:'#34749B'},
 intake_sent:{en:'Intake email sent',es:'Correo de intake enviado',color:'#84A8BC'},
 intake:{en:'Intake completed',es:'Intake completado',color:'#7599B3'},
 build:{en:'Production started',es:'Personalización iniciada',color:'#3A7399'},
 access:{en:'Booking setup prepared',es:'Sistema preparado',color:'#557E9B'},
 qa:{en:'Final tests approved',es:'Pruebas finales aprobadas',color:'#467885'},
 delivered:{en:'Final delivery queued',es:'Entrega en cola',color:'#498976'},
 checkin:{en:'48-hour check-in scheduled',es:'Seguimiento a las 48 h previsto',color:'#A68A47'},
 plan_design:{en:'Design & prices target',es:'Objetivo: diseño y precios',color:'#AD7B37'},
 plan_qa:{en:'Final QA target',es:'Objetivo: pruebas finales',color:'#AD7B37'},
 plan_delivery:{en:'Target delivery date',es:'Fecha prevista de entrega',color:'#AD7B37'}
};
function ownerCalendarToday(){
 const parts=Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const map=Object.fromEntries(parts.map(x=>[x.type,x.value]));
 return map.year+'-'+map.month+'-'+map.day;
}
function ownerCalendarDisplayDate(iso){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso||'')))return '';
 return new Date(iso+'T12:00:00').toLocaleDateString(buyerPageLabel()?'es-US':'en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
}
function ownerCalendarEvents(){
 const keys=[
  ['payment_date','payment'],['intake_sent_date','intake_sent'],['intake_date','intake'],
  ['build_started_date','build'],['access_ready_date','access'],['qa_approved_date','qa'],
  ['delivery_date','delivered'],['checkin_date','checkin'],
  ['design_due_date','plan_design'],['qa_due_date','plan_qa'],['delivery_target_date','plan_delivery']
 ];
 const events=[];
 for(const a of ownerCalendarRecords){
  for(const [column,kind] of keys){
   const day=a[column];if(!day||!/^\d{4}-\d{2}-\d{2}$/.test(day))continue;
   const complete=(kind==='plan_design'&&a.design_reviewed)||
    (kind==='plan_qa'&&a.qa_approved)||(kind==='plan_delivery'&&a.delivered);
   events.push({day,kind,account:a,planned:kind.startsWith('plan_')||kind==='checkin',complete});
  }
 }
 return events.sort((a,b)=>a.day.localeCompare(b.day)||a.account.business_name.localeCompare(b.account.business_name));
}
function renderOwnerCalendarSelection(){
 const select=$('ownerCalBuyer');
 const current=ownerCalendarBuyerPref||select.value||'';
 select.replaceChildren(new Option(buyerPageLabel()?'Selecciona una compradora':'Choose a purchased client',''));
 for(const a of ownerCalendarRecords){
  const option=new Option(a.business_name||'Cleaning Business',a.id);
  select.add(option);
 }
 if(current&&ownerCalendarRecords.some(a=>a.id===current))select.value=current;
 if(select.value!==current&&ownerCalendarBuyerPref)ownerCalendarBuyerPref='';
 const a=ownerCalendarRecords.find(x=>x.id===select.value);
 const active=document.activeElement;
 const editing=!!(active&&active.closest&&active.closest('#ownerCalForm'));
 if(!editing){
  $('ownerCalDesign').value=a?.design_due_date||'';
  $('ownerCalQA').value=a?.qa_due_date||'';
  $('ownerCalDelivery').value=a?.delivery_target_date||'';
  $('ownerCalNotes').value=a?.owner_notes||'';
 }
 $('ownerCalSave').disabled=!a;
}
function ownerCalendarEventCard(e){
 const cfg=ownerCalendarKinds[e.kind]||{en:e.kind,es:e.kind,color:'#7f8f99'};
 const es=buyerPageLabel();
 const card=ownerPageElem('div',undefined,'display:flex;align-items:flex-start;gap:12px;border:1px solid #e8edf0;background:#fff;padding:13px 15px;border-radius:14px;min-width:0');
 card.appendChild(ownerPageElem('span','●','font-size:18px;color:'+cfg.color+';line-height:1.1'));
 const body=ownerPageElem('div',undefined,'min-width:0;flex:1');
 body.appendChild(ownerPageElem('strong',es?cfg.es:cfg.en,'display:block;font-size:13px;line-height:1.35'));
 body.appendChild(ownerPageElem('div',e.account.business_name,'font-size:12px;color:#5d7382;overflow-wrap:anywhere;margin:4px 0'));
 body.appendChild(ownerPageElem('div',ownerCalendarDisplayDate(e.day)+(e.complete?(es?' · ✓ Hecho':' · ✓ Completed'):''),'font-size:11px;color:#758895'));
 const button=ownerPageElem('button',es?'Abrir':'Open');button.type='button';button.className='secondary';
 button.style.cssText='flex:0 0 auto;padding:9px 12px;font-size:11px;border-radius:25px';
 button.onclick=()=>{
  ownerReviewAccount={id:e.account.id,business_name:e.account.business_name,intake_done:e.account.intake_done,booking_page_url:null};
  setView('owner-build');loadOwnerBuilder();$('ownerBuilderHub').scrollIntoView({behavior:'smooth'});
 };
 card.append(body,button);
 return card;
}
function renderOwnerCalendar(){
 if(!workspace?.is_internal)return;
 const es=buyerPageLabel();
 const summary=$('ownerCalSummary');summary.replaceChildren();
 const events=ownerCalendarEvents(),today=ownerCalendarToday();
 const tasks=events.filter(e=>e.kind.startsWith('plan_')&&!e.complete&&e.day>=today);
 const overdue=events.filter(e=>e.kind.startsWith('plan_')&&e.day<today&&!e.complete);
 for(const [label,value] of [
  [es?'Compradoras':'Purchased clients',ownerCalendarRecords.length],
  [es?'Sin intake':'Waiting for intake',ownerCalendarRecords.filter(a=>!a.intake_done).length],
  [es?'Fechas previstas':'Upcoming work dates',tasks.length],
  [es?'Pendientes vencidos':'Overdue targets',overdue.length]
 ]){
  const cell=ownerPageElem('div',undefined,'background:#fff;border:1px solid #e4edf3;border-radius:19px;padding:18px');
  cell.append(ownerPageElem('strong',String(value),'display:block;font-size:30px;line-height:1.1'),ownerPageElem('span',label,'display:block;font-size:12px;color:#5d7182;margin-top:8px'));summary.append(cell);
 }
 const month=ownerCalendarMonth,y=month.getFullYear(),m=month.getMonth();
 $('ownerCalMonth').textContent=new Date(y,m,1).toLocaleDateString(es?'es-US':'en-US',{month:'long',year:'numeric'});
 const grid=$('ownerCalGrid');grid.replaceChildren();
 const weekday=es?['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 for(const day of weekday){const head=ownerPageElem('div',day,'font-size:11px;color:#668091;text-align:center;padding:7px 0;font-weight:800');grid.append(head)}
 const offset=new Date(y,m,1).getDay();
 const start=new Date(y,m,1-offset);
 const counts=new Map();
 for(const event of events)counts.set(event.day,[...(counts.get(event.day)||[]),event]);
 for(let i=0;i<42;i++){
  const date=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);
  const key=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
  const list=counts.get(key)||[],inside=date.getMonth()===m,chosen=ownerCalendarSelectedDay===key,isToday=key===today;
  const bg=chosen?'#daedf9':inside?'#fff':'#f8fafb';
  const b=ownerPageElem('button');b.type='button';b.setAttribute('aria-label',ownerCalendarDisplayDate(key)+': '+list.length+' events');b.setAttribute('aria-pressed',String(chosen));
  b.style.cssText='display:flex;flex-direction:column;align-items:stretch;min-height:76px;border:1px solid '+(chosen?'#588eb0':isToday?'#96bcda':'#e7edf2')+';border-radius:12px;text-align:left;background:'+bg+';color:'+(inside?'#233c4b':'#a1b1ba')+';padding:8px 6px;gap:4px;font-size:12px;box-shadow:none;';
  const number=ownerPageElem('strong',String(date.getDate()),'font-size:12px;color:'+(isToday?'#326e97':'inherit'));b.append(number);
  for(const event of list.slice(0,2)){
   const cfg=ownerCalendarKinds[event.kind]||{en:event.kind,es:event.kind,color:'#7999aa'};
   const pill=ownerPageElem('div',(es?cfg.es:cfg.en).slice(0,11),'font-size:9px;font-weight:700;color:#263f4e;border-radius:5px;padding:3px 4px;background:'+(event.planned?'#fff1d6':'#e3eff7')+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%');
   b.append(pill);
  }
  if(list.length>2)b.append(ownerPageElem('span','+'+(list.length-2),'font-size:9px;color:#688095'));
  b.onclick=()=>{ownerCalendarSelectedDay=key;renderOwnerCalendar();};
  grid.append(b);
 }
 const panel=$('ownerCalDayPanel');panel.replaceChildren();
 const focus=ownerCalendarSelectedDay,dayItems=focus?events.filter(e=>e.day===focus):[];
 const title=ownerPageElem('h3',focus?ownerCalendarDisplayDate(focus):(es?'Próximas fechas y actividad reciente':'Upcoming work & recent activity'),'font-size:18px;margin:0 0 13px;letter-spacing:-.02em');
 panel.append(title);
 const selectedItems=focus?dayItems:[
  ...events.filter(e=>e.day>=today).slice(0,12),
  ...events.filter(e=>e.day<today).slice(-5).reverse()
 ];
 if(!selectedItems.length){
  panel.append(ownerPageElem('p',focus?(es?'No hay actividades registradas para este día.':'No recorded activity on this date.'):(es?'Sin fechas todavía. Las compras aparecerán aquí automáticamente.':'No dates yet. Purchases will appear automatically.'),'font-size:13px;color:#66818e'));
 }else{
  const list=ownerPageElem('div',undefined,'display:grid;gap:8px');
  for(const event of selectedItems)list.append(ownerCalendarEventCard(event));
  panel.append(list);
 }
 renderOwnerCalendarSelection();
}
async function loadOwnerCalendar(silent=false){
 if(!workspace?.is_internal)return;
 const loadId=++ownerCalendarLoadGeneration;
 if(!silent)$('ownerCalStatus').textContent=buyerPageLabel()?'Sincronizando pedidos…':'Syncing purchases…';
 try{
  const {data,error}=await db.rpc('tle_booking_owner_calendar_read');
  if(error)throw error;
  if(loadId!==ownerCalendarLoadGeneration||!workspace?.is_internal)return;
  ownerCalendarRecords=Array.isArray(data)?data:[];
  renderOwnerCalendar();
  $('ownerCalStatus').textContent=(buyerPageLabel()?'Actualizado con los pedidos guardados · ':'Synced with recorded purchases · ')+new Date().toLocaleTimeString(buyerPageLabel()?'es-US':'en-US',{hour:'numeric',minute:'2-digit'});
 }catch(err){
  if(!silent)$('ownerCalStatus').textContent=(buyerPageLabel()?'No se pudo actualizar el calendario: ':'Calendar could not refresh: ')+err.message;
 }
}
function openBuyerWorkCalendar(accountId){
 ownerCalendarBuyerPref=accountId;
 premiumNavigate('owner-calendar');
}
$('ownerCalBuyer').onchange=()=>{
 ownerCalendarBuyerPref=$('ownerCalBuyer').value;
 const a=ownerCalendarRecords.find(x=>x.id===ownerCalendarBuyerPref);
 $('ownerCalDesign').value=a?.design_due_date||'';
 $('ownerCalQA').value=a?.qa_due_date||'';
 $('ownerCalDelivery').value=a?.delivery_target_date||'';
 $('ownerCalNotes').value=a?.owner_notes||'';
 $('ownerCalFormStatus').textContent='';
 $('ownerCalSave').disabled=!a;
};
$('ownerCalForm').onsubmit=async e=>{
 e.preventDefault();
 const id=$('ownerCalBuyer').value,save=$('ownerCalSave'),msg=$('ownerCalFormStatus');
 if(!id||!workspace?.is_internal)return;
 save.disabled=true;msg.textContent=buyerPageLabel()?'Guardando fechas…':'Saving work dates…';
 try{
  const {data,error}=await db.rpc('tle_booking_owner_calendar_save',{
   p_account_id:id,
   p_design_due_date:$('ownerCalDesign').value||null,
   p_qa_due_date:$('ownerCalQA').value||null,
   p_delivery_target_date:$('ownerCalDelivery').value||null,
   p_notes:$('ownerCalNotes').value
  });
  if(error||!data?.ok)throw error||new Error('Save not confirmed');
  ownerCalendarBuyerPref=id;
  await loadOwnerCalendar(true);
  msg.textContent=buyerPageLabel()?'✓ Fechas guardadas. Calendario actualizado.':'✓ Work dates saved. Calendar updated.';
 }catch(error){
  msg.textContent=(buyerPageLabel()?'No se guardaron las fechas: ':'Dates could not be saved: ')+error.message;
 }finally{save.disabled=false}
};
$('ownerCalPrev').onclick=()=>{ownerCalendarMonth=new Date(ownerCalendarMonth.getFullYear(),ownerCalendarMonth.getMonth()-1,1);ownerCalendarSelectedDay='';renderOwnerCalendar()};
$('ownerCalNext').onclick=()=>{ownerCalendarMonth=new Date(ownerCalendarMonth.getFullYear(),ownerCalendarMonth.getMonth()+1,1);ownerCalendarSelectedDay='';renderOwnerCalendar()};
$('ownerCalToday').onclick=()=>{const today=ownerCalendarToday();ownerCalendarMonth=new Date(Number(today.slice(0,4)),Number(today.slice(5,7))-1,1);ownerCalendarSelectedDay=today;renderOwnerCalendar()};
$('ownerCalRefresh').onclick=()=>loadOwnerCalendar();
setInterval(()=>{
 if(!workspace?.is_internal||document.hidden)return;
 if(view==='owner-pages')void loadOwnerPages();
 else if(view==='owner-calendar')void loadOwnerCalendar(true);
},60000);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden||!workspace?.is_internal)return;
 if(view==='owner-calendar')void loadOwnerCalendar(true);
 if(view==='owner-pages')void loadOwnerPages();
});

let ownerPurchases=[];
function ownerPurchaseStage(a){
 if(a.already_queued)return 'delivered';
 if(!a.intake_done)return 'intake';
 if(a.booking_page_url&&a.crm_ready&&a.status==='active')return 'review';
 return 'production';
}
function renderOwnerPurchases(){
 if(!workspace?.is_internal)return;
 const root=$('ownerPagesList'),status=$('ownerPagesStatus'),stats=$('ownerPurchaseStats');
 const es=buyerPageLabel(),all=ownerPurchases;
 const labels={
  all:es?'Compras pagadas':'Paid purchases',
  intake:es?'Nueva orden':'New Order',
  production:es?'Personalizar':'Customize',
  review:es?'Probar':'Test',
  delivered:es?'En cola de entrega':'Delivery queued'
 };
 stats.replaceChildren();
 for(const key of ['intake','production','review','delivered']){
  const count=key==='all'?all.length:all.filter(a=>ownerPurchaseStage(a)===key).length;
  const tile=ownerPageElem('div',undefined);tile.className='order-summary-metric';
  const number=ownerPageElem('strong',count),caption=ownerPageElem('span',labels[key]);
  tile.append(number,caption);stats.append(tile);
 }
 const filter=$('ownerPurchaseFilter').value||'all';
 const visible=filter==='all'?all:all.filter(a=>ownerPurchaseStage(a)===filter);
 root.replaceChildren();
 status.textContent=es?(visible.length+' de '+all.length+' compra(s) pagadas'):(visible.length+' of '+all.length+' paid purchases');
 if(!all.length){
  root.appendChild(ownerPageElem('div',es?'Todavía no hay compras pagadas. Cuando llegue una nueva compra aparecerá aquí, separada de los prospectos.':'No paid purchases yet. New buyers will appear here, separate from sales leads.','background:#fff;border:1px solid #e4edf3;border-radius:21px;padding:30px;color:#506b7c;line-height:1.7;grid-column:1/-1'));
  return;
 }
 if(!visible.length){
  root.appendChild(ownerPageElem('p',es?'No hay pedidos con este estado.':'No purchases in this status.','grid-column:1/-1;color:#597280'));
  return;
 }
 for(const a of visible){
  const stage=ownerPurchaseStage(a);
  const box=ownerPageElem('article',undefined,'border:1px solid #e2eaf0;background:#fff;border-radius:23px;padding:23px;box-shadow:0 11px 28px #162e3c0d;min-width:0;display:flex;flex-direction:column;gap:7px');
  const stageLabel=labels[stage];
  box.appendChild(ownerPageElem('span',stageLabel,'align-self:flex-start;font-size:11px;font-weight:700;border-radius:25px;padding:8px 12px;background:'+(stage==='delivered'?'#eaf5ee':stage==='intake'?'#fff4da':'#e5f2fb')+';color:#253e4c'));
  box.appendChild(ownerPageElem('h3',a.business_name||'Cleaning Business','font-size:22px;margin:10px 0 0;letter-spacing:-.03em;overflow-wrap:anywhere'));
  if(a.owner_name)box.appendChild(ownerPageElem('div',a.owner_name,'font-size:13px;font-weight:600;color:#405969'));
  if(a.owner_email)box.appendChild(ownerPageElem('div',a.owner_email,'font-size:12px;color:#667d8c;overflow-wrap:anywhere'));
  const progress=(a.intake_done?1:0)+(a.booking_page_url?1:0)+(a.crm_ready?1:0)+(a.already_queued?1:0);
  const nextByStage={intake:es?'Esperar los datos':'Waiting for intake',production:es?'Personalizar':'Customize Booking Page',review:es?'Completar pruebas':'Complete QA',delivered:es?'Verificar correo de entrega':'Check delivery email'};
  box.append(ownerPageElem('div',(es?'Siguiente: ':'Next: ')+nextByStage[stage],'font-size:13px;color:#2b6585;font-weight:700;margin-top:8px'));
  const step=ownerPageElem('div',undefined,'border-top:1px solid #e9eff3;padding-top:13px;margin-top:8px;display:grid;gap:5px');
  step.appendChild(ownerPageElem('div',(es?'Preparación: ':'Setup: ')+progress+'/4','font-size:12px;color:#537080;font-weight:700'));
  for(const [ok,title] of [
   [a.intake_done,es?'Datos del intake recibidos':'Intake received'],
   [!!a.booking_page_url,es?'Booking Page preparado':'Booking Page prepared'],
   [a.crm_ready,es?'Command Center privado conectado':'Private Command Center linked'],
   [a.already_queued,es?'Correo de entrega en cola':'Final delivery queued']
  ])step.appendChild(ownerPageElem('div',(ok?'✓ ':'○ ')+title,'font-size:12px;line-height:1.5;color:'+(ok?'#3b695e':'#6b7d88')));
  box.appendChild(step);
  const buttons=ownerPageElem('div',undefined,'display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:15px');
  for(const [mode,label] of [
   ['builder',es?'Continuar pedido →':'Continue order →'],
   ['preview',es?'Vista previa →':'Preview →']
  ]){
   const button=ownerPageElem('button',label);button.type='button';button.className=mode==='builder'?'':'secondary';
   button.style.cssText='font-size:12px;padding:11px 13px;border-radius:35px;flex:1 1 120px';
   button.onclick=()=>mode==='owner-calendar'?openBuyerWorkCalendar(a.id):chooseOwnerBuyer(a,mode);buttons.appendChild(button)
  }
  box.appendChild(buttons);
  if(a.booking_page_url&&a.already_queued&&/^https:\/\//.test(a.booking_page_url)){
   const link=ownerPageElem('a',es?'Abrir página entregada ↗':'Open delivered Booking Page ↗');
   link.href=a.booking_page_url;link.target='_blank';link.rel='noopener noreferrer';
   link.style.cssText='font-size:12px;font-weight:650;margin-top:8px';box.appendChild(link);
  }
  root.appendChild(box);
 }
}
async function loadOwnerPages(){
 if(!workspace?.is_internal)return;
 $('ownerPagesStatus').textContent=buyerPageLabel()?'Cargando compradoras y pedidos…':'Loading clients and purchases…';
 try{
  const startedWith=workspace.id;
  const {data,error}=await db.rpc('tle_booking_flow_owner_pending');
  if(error)throw error;
  if(!workspace?.is_internal||workspace.id!==startedWith)return;
  ownerPurchases=Array.isArray(data)?data:[];
  renderOwnerPurchases();
 }catch(e){
  $('ownerPagesStatus').textContent=crmLocaleText("Could not load purchases: ","No se pudieron cargar las compras: ")+e.message;
  $('ownerPagesList').replaceChildren();
  $('ownerPurchaseStats').replaceChildren();
 }
}
$('ownerPurchaseFilter').onchange=renderOwnerPurchases;

function ownerPageStat(label,value){
 const card=ownerPageElem('div',undefined,'padding:17px;border:1px solid #e5ebee;border-radius:18px;background:#fff');
 card.appendChild(ownerPageElem('strong',label,'display:block;font-size:12px;color:#63737b;margin-bottom:8px'));
 card.appendChild(ownerPageElem('div',value,'font-size:16px;font-weight:700;word-break:break-word'));
 return card;
}
async function renderOwnerPagePreview(){
 if(!ownerReviewAccount||!workspace?.is_internal)return premiumNavigate('owner-pages');
 const status=$('ownerPagePreviewStatus'),root=$('ownerPagePreviewBody');root.replaceChildren();status.textContent=crmLocaleText("Preparing private preview…","Preparando vista previa privada…");
 try{
  const [pr,av]=await Promise.all([pricingCall('get'),availabilityCall('get')]);
  const es=buyerPageLabel();const name=ownerReviewAccount.business_name||'Cleaning Business';
  status.textContent=es?'Vista privada. Todavía no es un enlace público ni confirma reservas.':'Private preview. This does not create a public booking link or accept reservations.';
  const hero=ownerPageElem('section',undefined,'padding:clamp(22px,5vw,50px);border-radius:27px;background:linear-gradient(120deg,#DCEFFA,#FAF8F3 65%,#fff9dc);box-shadow:0 16px 44px #172a3916;margin:14px 0 20px');
  hero.appendChild(ownerPageElem('span',es?'VISTA PREVIA · NO PUBLICADA':'PRIVATE PREVIEW · NOT PUBLISHED','font-size:11px;letter-spacing:.13em;font-weight:800;color:#476c85'));
  hero.appendChild(ownerPageElem('h2',name,'font-size:clamp(30px,5vw,49px);line-height:1.07;letter-spacing:-.05em;margin:20px 0 10px;max-width:680px'));
  hero.appendChild(ownerPageElem('p',es?'Reservar un servicio de limpieza, de forma sencilla.':'A simpler way to request your cleaning service.','font-size:17px;color:#475e6d;line-height:1.6'));
  const indicator=ownerPageElem('button',es?'Reservar (disponible después de entregar)':'Book now (available after delivery)');indicator.type='button';indicator.disabled=true;indicator.style.cssText='border-radius:28px;opacity:.7;cursor:not-allowed';hero.appendChild(indicator);root.appendChild(hero);
  const stats=ownerPageElem('div',undefined,'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px');
  const services=Array.isArray(pr.settings?.services)?pr.settings.services.filter(x=>x.active!==false):[];
  const currency=pr.settings?.currency||'USD';
  if(!services.length)stats.appendChild(ownerPageStat(es?'Servicios pendientes':'Services not configured',es?'Añade al menos un servicio y su precio':'Add at least one service and price'));
  for(const service of services){
   const label=service.mode==='flat'&&service.price!==null&&Number(service.price)>0?
     new Intl.NumberFormat('en-US',{style:'currency',currency}).format(Number(service.price)):
     service.mode==='estimate'?(es?'Precio estimado':'Estimate provided'):(es?'Cotización personalizada':'Request a quote');
   stats.appendChild(ownerPageStat(service.name||'Cleaning service',label));
  }
  root.appendChild(ownerPageElem('h3',es?'Servicios y precios':'Services & pricing','margin:23px 0 13px;font-size:22px'));
  root.appendChild(stats);
  const extras=Array.isArray(pr.settings?.addons)?pr.settings.addons.filter(x=>x.active!==false):[];
  if(extras.length){
   root.appendChild(ownerPageElem('h3',es?'Servicios adicionales':'Available add-ons','margin:25px 0 13px;font-size:20px'));
   const extraContainer=ownerPageElem('div',undefined,'display:flex;flex-wrap:wrap;gap:10px');
   for(const extra of extras){
    const amount=new Intl.NumberFormat('en-US',{style:'currency',currency}).format(Number(extra.price||0));
    extraContainer.appendChild(ownerPageElem('span',(extra.name||'Extra')+' · '+amount,'border-radius:35px;padding:11px 16px;background:#e9f4fb;font-size:13px;font-weight:700'));
   }
   root.appendChild(extraContainer);
  }
  const dayLabels=es?['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const available=av.settings?.weekly||{};
  const days=dayLabels.map((day,i)=>available[String(i)]?.enabled?day+' · '+available[String(i)].start+'–'+available[String(i)].end:null).filter(Boolean);
  root.appendChild(ownerPageElem('h3',es?'Disponibilidad configurada':'Business availability','margin:27px 0 12px;font-size:20px'));
  root.appendChild(ownerPageStat(es?'Horario que verá la clienta al reservar':'Booking hours',days.length?days.join('  |  '):(es?'Sin horarios activos. Edita Availability.':'No open days yet. Set availability first.')));
  const note=ownerPageElem('p',es?'Vista privada de servicios y horarios guardados. Las reservas públicas solo se habilitan cuando todo está preparado, probado y entregado.':'Private preview of saved services and hours. Public booking opens only after the system has been fully configured, tested and delivered.','font-size:13px;color:#5c707d;line-height:1.6;margin-top:18px');
  root.appendChild(note);
  if(pr.booking_url&&pr.delivery_ready){const link=ownerPageElem('a',es?'Abrir la Booking Page publicada ↗':'Open published Booking Page ↗');link.href=pr.booking_url;link.target='_blank';link.rel='noopener noreferrer';link.style.cssText='display:inline-block;margin-top:14px';root.appendChild(link)}
 }catch(e){status.textContent=crmLocaleText("Preview unavailable: ","Vista previa no disponible: ")+e.message}
}
$('ownerPagesRefresh').onclick=loadOwnerPages;
$('ownerBackPages').onclick=()=>premiumNavigate('owner-pages');
$('ownerPriceBack').onclick=()=>premiumNavigate('owner-pages');
$('ownerAvBack').onclick=()=>premiumNavigate('owner-pages');
$('ownerPreviewEditPrices').onclick=()=>premiumNavigate('pricing');
$('ownerPreviewEditHours').onclick=()=>premiumNavigate('availability');
$('ownerDeliveryRefresh').onclick=loadOwnerDeliveries;
$('settingsSignOut').onclick=()=>$('logout').click();$('settingsPasswordReset').onclick=async()=>{const out=$('settingsSecurityStatus');try{const {data:{user},error}=await db.auth.getUser();if(error)throw error;if(!user?.email)throw Error('Please sign in first.');await check(await db.auth.resetPasswordForEmail(user.email,{redirectTo:location.origin+location.pathname}));out.textContent='If the email is registered, reset instructions have been sent.'}catch(e){out.textContent='Unable to request reset: '+e.message}};$('navAdd').onclick=()=>edit(null);const addContactFromHeader=()=>{if(workspace&&!workspace.is_internal)premiumNavigate('request-center');edit(null)};
$('mobileNew').onclick=addContactFromHeader;$('headerNew').onclick=addContactFromHeader;
$('globalSearch').onclick=()=>{if(workspace&&!workspace.is_internal){premiumNavigate('request-center');$('buyerRequestSearch').focus();return}premiumNavigate('leads');$('search').focus();$('search').scrollIntoView({behavior:'smooth',block:'center'})};function showLeadTab(tab){document.querySelectorAll('[data-leadtab]').forEach(t=>{const active=t.dataset.leadtab===tab;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active))});$('leadOverviewSection').classList.toggle('hidden',tab!=='overview');$('leadEmailSection').classList.toggle('hidden',tab!=='emails');$('leadNotesSection').classList.toggle('hidden',tab!=='notes');$('leadEmailSection').open=tab==='emails';$('leadNotesSection').open=tab==='notes';$('editor').scrollTop=0}document.querySelectorAll('[data-leadtab]').forEach(b=>b.onclick=()=>showLeadTab(b.dataset.leadtab));const ownerDailySelected=new Set();
let ownerDailyOpen=false,ownerDailyBusy=false;
const ownerDailyEs=()=>localStorage.getItem('tle_crm_language')==='es';
const ownerDailyLabel=(en,es)=>ownerDailyEs()?es:en;
function ownerDailyDate(){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const o={};for(const p of parts)o[p.type]=p.value;return o.year+'-'+o.month+'-'+o.day;
}
function ownerDailyDraft(lead){
 const spanish=lead.language==='es';
 const sent=emailSentByLead.has(lead.id);
 const name=String(lead.contact||'').split(/[\/&,]/)[0].trim().split(/\s+/)[0].replace(/[<>]/g,'');
 const greeting=(spanish?'Hola':'Hi')+(name?' '+name:'')+',';
 if(!sent){
  return {type:'initial',subject:String(lead.personalized_email_subject||'').trim(),
   body:String(lead.personalized_email_body||'').trim()};
 }
 const company=String(lead.business||'your cleaning business').trim();
 const friction=String(lead.primary_friction||'').toLowerCase();
 const fit=String(lead.service_fit||'').toLowerCase();
 const appOnly=fit.includes('cleaning app')&&!fit.includes('booking automation');
 let topic=spanish?'las solicitudes y cotizaciones de limpieza':'cleaning inquiries and estimates';
 if(/whatsapp|calls|texts|social|messages|canales|mensaje/.test(friction))
  topic=spanish?'los mensajes y solicitudes que llegan por distintos canales':'inquiries that come in through calls, texts or messages';
 else if(/form|intake|submission|details|formulario/.test(friction))
  topic=spanish?'los detalles que llegan con una solicitud de cotización':'the details customers share when they request an estimate';
 else if(/schedule|availability|calendar|booking|dates|citas/.test(friction))
  topic=spanish?'el seguimiento entre la cotización y la fecha de limpieza':'the steps between an estimate request and a confirmed cleaning date';
 else if(/client|job|team|equipo/.test(friction))
  topic=spanish?'la organización de clientes, trabajos y fechas':'keeping customers, jobs and appointments organized';
 const subject=spanish?'Quería retomar mi mensaje sobre '+company:'Following up on my note about '+company;
 const product=appOnly
  ? (spanish?'Nuestra Cleaning App ayuda a tener juntos los datos de clientes, los trabajos y las próximas fechas.':'Our Cleaning App helps keep customer details, jobs and upcoming appointments in one place.')
  : (spanish?'Con Booking Automation + Lead Tracker Automation ayudamos a reunir las solicitudes, los próximos pasos y los seguimientos en un mismo lugar.':'With Booking Automation + Lead Tracker Automation, we help keep inquiries, next steps and follow-ups together in one place.');
 const text=spanish?[
  greeting,
  'Quería retomar el correo que te envié sobre '+topic+' en '+company+'. También quería explicarte un poco mejor por qué te escribí.',
  'En The Launch Era trabajamos en sistemas para negocios de limpieza. Una cosa en la que siempre me fijo es lo que pasa después de que alguien pide información: quedan detalles por confirmar, preguntas sobre el precio, fechas que coordinar y personas a las que hay que responder. Cuando estás atendiendo trabajos, mantener todo eso al día puede tomar más tiempo del que parece.',
  'No sé si en '+company+' ya tienen esa parte completamente resuelta, y no quiero dar por hecho que necesitan cambiar nada. Justamente por eso te había preguntado cómo lo manejan.',
  product+' Si algo de eso les está quitando tiempo, quizá valga la pena ver otra forma de organizarlo.',
  '¿Te gustaría que te enviara un ejemplo sencillo de cómo podría funcionar para '+company+'? Y si ya tienen un sistema que les funciona bien, también me encantaría saberlo.',
  'Saludos,\nDailin\nThe Launch Era'
 ].join('\n\n'):[
  greeting,
  'I wanted to follow up on the note I sent about '+topic+' at '+company+'. I also wanted to explain a little more about why I reached out.',
  'At The Launch Era, I work on systems for cleaning business owners. One thing I keep coming back to is what happens after someone asks about a cleaning: there may be details to confirm, pricing questions to answer, a date to work out, and people who still need a reply. When you are busy with actual jobs, keeping those conversations moving can take more time than it seems.',
  'I do not know whether '+company+' already has that part running smoothly, and I do not want to assume you need to change anything. That is why I was curious about your process in the first place.',
  product+' If any of that is taking extra time, I thought a simpler way to handle it might be worth showing you.',
  'Would you be open to seeing a quick example of what that could look like for '+company+'? And if your current system is working well, I would be glad to hear that too.',
  'Best,\nDailin\nThe Launch Era'
 ].join('\n\n');
 return {type:'followup',subject,body:text};
}
function ownerDailyBlockReason(x,draft){
 if(x.contact_decision!=='yes')return ownerDailyLabel('Not approved','Sin aprobación');
 if(x.stage==='Won'||x.replied_at)return ownerDailyLabel('Replied or converted','Ya respondió o es cliente');
 if(!x.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email))return ownerDailyLabel('Email missing or invalid','Correo inválido');
 if(confirmedOptOut(x))return ownerDailyLabel('Opted out','Solicitó baja');
 if(emailBouncedByLead.has(x.id)||/email bounced|resend outreach 2026-10-07:\s*bounced/i.test(x.notes||''))return ownerDailyLabel('Bounced or failed','Rebote o fallo');
 if(!['es','en'].includes(x.language))return ownerDailyLabel('Verify language','Verificar idioma');
 if(x.email_consent_status!=='authorized'||!String(x.email_consent_source||'').trim())return ownerDailyLabel('Recipient email permission not verified','Sin permiso de email verificado');
 if(x.email_followup_enabled!==true)return ownerDailyLabel('Email follow-up disabled','Seguimiento por correo desactivado');
 if(emailSentByLead.has(x.id)&&ownerDailyDate()===ownerDailyDateFromIso(emailSentByLead.get(x.id)))return ownerDailyLabel('Already emailed today','Ya recibió un correo hoy');
 if(draft.subject.length<3||draft.subject.length>150||draft.body.length<15||draft.body.length>4000)return ownerDailyLabel('Draft needs review','Revisar borrador');
 return '';
}
function ownerDailyDateFromIso(value){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));const o={};for(const p of parts)o[p.type]=p.value;return o.year+'-'+o.month+'-'+o.day}
function ownerDailyQueue(){
 if(!workspace?.is_internal)return [];
 const date=ownerDailyDate();
 return leads.filter(x=>x.contact_decision==='yes'&&x.stage!=='Won'&&x.followup&&x.followup<=date&&x.email&&!emailSentByLead.has(x.id))
 .sort((a,b)=>String(a.followup).localeCompare(String(b.followup))||a.business.localeCompare(b.business))
 .map(x=>({lead:x,draft:ownerDailyDraft(x)}));
}
function ownerDueFollowups(){
 if(!workspace?.is_internal)return [];
 const today=ownerDailyDate();
 return leads.filter(x=>x.contact_decision==='yes'&&x.stage!=='Won'&&x.followup&&x.followup<=today)
  .sort((a,b)=>String(a.followup).localeCompare(String(b.followup))||String(a.business).localeCompare(String(b.business)));
}
function ownerSendvantaExportRows(){
 if(!workspace?.is_internal||!Array.isArray(ownerProspectQueueRows))return [];
 const waitingSecond=new Map(ownerProspectQueueRows.filter(q=>q.step_number===1&&q.status==='awaiting_sender').map(q=>[q.lead_id,q]));
 const waitingThird=new Map(ownerProspectQueueRows.filter(q=>q.step_number===2&&q.status==='awaiting_sender').map(q=>[q.lead_id,q]));
 return leads.filter(x=>
  waitingSecond.has(x.id)&&waitingThird.has(x.id)&&x.contact_decision==='yes'
  &&x.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email)
  &&emailSentByLead.has(x.id)&&!emailBouncedByLead.has(x.id)
  &&!blockedLead(x)&&x.stage!=='Won'&&!x.replied_at&&!x.archived_at
 ).sort((a,b)=>String(a.business||'').localeCompare(String(b.business||'')))
 .map(x=>{
  const person=String(x.contact||'').trim().split(/[\/&,]/)[0].trim().split(/\s+/)[0]||'';
  const first=/^(yes|no|unknown|unverified|na|n\/a)$/i.test(person)?'':person;
  return [x.email,first,x.business||'',x.language||'',x.id,
   waitingSecond.get(x.id).due_at?.slice(0,10)||'',
   waitingThird.get(x.id).due_at?.slice(0,10)||'',
   emailSentByLead.get(x.id)||''];
 });
}
$('exportSendvantaCsv').onclick=()=>{
 if(!workspace?.is_internal)return;
 const records=ownerSendvantaExportRows();
 if(!records.length){say(ownerDailyLabel('No approved previously emailed prospects are ready to export.','No hay prospectos previamente contactados listos para exportar.'));return}
 const headings=['email','first_name','company','language','crm_lead_id','second_email_due','third_email_due','first_email_sent_at'];
 const csvEsc=value=>{
  let str=String(value??'');
  // Prevent spreadsheet-formula execution in imported cells.
  if(/^[=+\-@\t\r]/.test(str))str="'"+str;
  return '"'+str.replaceAll('"','""')+'"';
 };
 const csv=[headings.map(csvEsc).join(','),...records.map(row=>row.map(csvEsc).join(','))].join('\r\n');
 const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='tle-sendvanta-followups-'+ownerDailyDate()+'.csv';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
 say(ownerDailyLabel(records.length+' previously emailed leads exported for review. Import does not start a campaign.','Se exportaron '+records.length+' prospectos ya contactados para revisar. La importación no inicia ninguna campaña.'));
};
function renderOwnerDueFollowups(){
 const panel=$('ownerDueFollowupsPanel');if(!panel)return;
 panel.classList.toggle('hidden',!workspace?.is_internal);
 if(!workspace?.is_internal)return;
 const all=ownerDueFollowups(),label=ownerDailyLabel;
 const exportRows=ownerSendvantaExportRows();
 $('exportSendvantaCsv').disabled=exportRows.length===0;
 $('exportSendvantaCsv').textContent=label('Download '+exportRows.length+' leads (CSV)','Descargar '+exportRows.length+' leads (CSV)');
 $('exportSendvantaInfo').textContent=label('Already contacted; import for review only. Do not restart the initial-email sequence.','Ya recibieron el primer correo. Importar solo para revisión; no repetirlo.');
 const sent=all.filter(x=>emailSentByLead.has(x.id)).length;
 const unverified=all.filter(x=>x.email_consent_status!=='authorized'||!String(x.email_consent_source||'').trim()).length;
 const disabled=all.filter(x=>x.email_followup_enabled!==true).length;
 $('ownerDueFollowupsHeading').textContent=label('Follow-ups due · Previous contacts','Seguimientos pendientes · Contactos anteriores');
 $('ownerDueFollowupsIntro').textContent=label('All contacts due today or earlier, not just new initial emails.','Todos los contactos con fecha pendiente, no solamente los primeros correos nuevos.');
 $('ownerDueFollowupsCount').textContent=String(all.length);
 $('ownerDueFollowupsWarning').textContent=label(
  'A due date is not permission to email. Contacts without documented consent or with email follow-ups turned off are visible here for review, but they will not be emailed automatically. An initial email does not prove a second email was sent.',
  'La fecha pendiente no autoriza enviar emails. Los contactos sin permiso documentado o con seguimientos por correo desactivados aparecen para revisión; no recibirán envíos automáticos. Un correo inicial registrado no demuestra que se enviara el segundo.');
 $('ownerDueFollowupsSearchText').textContent=label('Search all due follow-ups','Buscar seguimientos pendientes');
 $('ownerDueFollowupsSearch').placeholder=label('Business or contact name','Negocio o contacto');
 const stats=ownerDailyEs()?[['Pendientes por fecha',all.length],['Correo inicial registrado',sent],['Permiso sin verificar',unverified],['Email desactivado',disabled]]:
  [['Follow-ups due',all.length],['Initial emails recorded',sent],['Permission unverified',unverified],['Email follow-ups off',disabled]];
 const queuedText=$('ownerProspectQueueStatus');
 if(queuedText){
  if(!Array.isArray(ownerProspectQueueRows))queuedText.textContent=label('Queue unavailable. Refresh to check.','Cola no disponible. Actualiza para comprobarla.');
  else{
   const staged=ownerProspectQueueRows.filter(x=>x.status==='awaiting_sender');
   const businesses=new Set(staged.map(x=>x.lead_id)).size;
   const pastDue=staged.filter(x=>new Date(x.due_at).getTime()<Date.now()).length;
   queuedText.textContent=label(
    'Queued: '+staged.length+' follow-ups for '+businesses+' businesses. Awaiting a compatible prospecting sender. '+pastDue+' are overdue and require review before activation. No automatic send is active.',
    'En cola: '+staged.length+' seguimientos de '+businesses+' negocios. Esperando conectar un remitente de prospección compatible. '+pastDue+' están vencidos y requieren revisión antes de activarse. No hay envíos automáticos activos.'
   );
  }
 }
 const root=$('ownerDueFollowupsStats');root.replaceChildren();
 for(const [name,count] of stats){
  const card=document.createElement('div');card.style.cssText='background:#f5f9fc;border:1px solid #dcecf5;border-radius:13px;padding:11px';
  const bold=document.createElement('strong');bold.textContent=String(count);bold.style.cssText='display:block;font-size:21px;color:#244d67';
  const tiny=document.createElement('small');tiny.textContent=name;tiny.style.cssText='font-size:11px;color:#60798a';
  card.append(bold,tiny);root.append(card);
 }
 const query=$('ownerDueFollowupsSearch').value.trim().toLowerCase();
 const shown=all.filter(x=>(String(x.business||'')+' '+String(x.contact||'')).toLowerCase().includes(query));
 const list=$('ownerDueFollowupsList');list.replaceChildren();
 for(const x of shown){
  const card=document.createElement('div');card.style.cssText='padding:12px;border:1px solid #e0eaf2;border-radius:13px;background:white;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap';
  const desc=document.createElement('div');desc.style.cssText='min-width:0;flex:1';
  const name=document.createElement('strong');name.textContent=x.business;name.style.cssText='display:block;font-size:13px;color:#233f52;overflow-wrap:anywhere';
  const date=document.createElement('small');date.style.cssText='display:block;margin-top:5px;color:#728a9b';
  date.textContent=label('Due ','Vence ')+x.followup+(emailSentByLead.has(x.id)?label(' · Initial email recorded',' · Primer correo registrado'):'');
  const state=document.createElement('small');state.style.cssText='display:block;margin-top:5px;color:#94642e;font-weight:650';
  state.textContent=confirmedOptOut(x)?label('Unsubscribed — do not email','Baja solicitada — no enviar'):
   emailBouncedByLead.has(x.id)?label('Email failed — check','Fallo de correo — revisar'):
   x.email_consent_status!=='authorized'||!String(x.email_consent_source||'').trim()?label('Email permission not documented','Permiso de email sin documentar'):
   x.email_followup_enabled!==true?label('Automatic email follow-ups off','Seguimientos automáticos desactivados'):
   label('Review follow-up status','Revisar estado del seguimiento');
  desc.append(name,date,state);
  const button=document.createElement('button');button.type='button';button.className='secondary';button.style.cssText='font-size:12px;white-space:nowrap';
  button.textContent=label('Open contact','Abrir contacto');button.onclick=()=>edit(x);
  card.append(desc,button);list.append(card);
 }
 if(!shown.length){const empty=document.createElement('p');empty.className='muted';empty.textContent=query?label('No matching contacts','Sin contactos coincidentes'):label('No due follow-ups','Sin seguimientos pendientes');list.append(empty)}
}
$('ownerDueFollowupsSearch').oninput=renderOwnerDueFollowups;
function renderOwnerDailyOutreach(){
 const panel=$('ownerDailyOutreach');if(!panel)return;
 const internal=!!workspace?.is_internal;panel.classList.toggle('hidden',!internal);if(!internal)return;
 const queue=ownerDailyQueue(),eligible=queue.filter(x=>!ownerDailyBlockReason(x.lead,x.draft));
 const valid=new Set(eligible.map(x=>x.lead.id));
 for(const id of ownerDailySelected)if(!valid.has(id))ownerDailySelected.delete(id);
 $('ownerDailyTitle').textContent=ownerDailyLabel('New first emails · Send queue','Primeros correos nuevos · Cola de envío');
 $('ownerDailyIntro').textContent=ownerDailyLabel('This queue is for new first emails only. Follow-ups are tracked separately above; automation requires verified permission.','Esta cola es solo para primeros correos nuevos. Los seguimientos anteriores se ven arriba y su automatización requiere permiso verificado.');
 $('ownerDailyCounts').textContent=ownerDailyLabel(queue.length+' due · '+eligible.length+' ready · '+(queue.length-eligible.length)+' needs review',queue.length+' pendientes · '+eligible.length+' habilitados · '+(queue.length-eligible.length)+' por revisar');
 $('ownerDailyReview').textContent=ownerDailyOpen?ownerDailyLabel('Collapse all','Cerrar vistas'):ownerDailyLabel('Review all','Revisar todos');
 $('ownerDailySelect').textContent=ownerDailyLabel('Select all eligible','Seleccionar habilitados');
 $('ownerDailySend').textContent=ownerDailyLabel('Send all eligible ('+ownerDailySelected.size+')','Enviar todos los habilitados ('+ownerDailySelected.size+')');
 $('ownerDailySend').disabled=ownerDailyBusy||ownerDailySelected.size===0;
 $('ownerDailySend').title=ownerDailySelected.size?ownerDailyLabel('Confirm and send individual messages to the selected opted-in contacts.','Confirma y envía mensajes individuales a los contactos autorizados seleccionados.'):ownerDailyLabel('No contacts can receive email through this provider yet.','Todavía no hay contactos habilitados para este proveedor.');
 $('ownerDailyReview').disabled=ownerDailyBusy;$('ownerDailySelect').disabled=ownerDailyBusy;
 $('ownerDailyFooter').textContent=ownerDailyLabel(
 'Resend only sends to recipients with documented email permission. Opt-outs, bounces, replies and duplicates stay excluded. Sending is limited to 20 messages per rolling 24 hours. The second email is scheduled 3 days after an accepted send.',
 'Resend solo permite destinatarios con permiso documentado. Se excluyen bajas, rebotes, respuestas y duplicados. Máximo 20 correos en 24 horas. El siguiente correo se programa 3 días después del envío aceptado.'
 );
 const list=$('ownerDailyItems');list.replaceChildren();
 const pending=document.createElement('details');pending.open=ownerDailyOpen;
 pending.style.cssText='margin-top:12px;border-top:1px solid #e1e8ee;padding-top:12px';
 const pendingTitle=document.createElement('summary');pendingTitle.textContent=ownerDailyLabel('Needs attention ('+(queue.length-eligible.length)+')','Requieren atención ('+(queue.length-eligible.length)+')');
 pendingTitle.style.cssText='cursor:pointer;font-size:13px;font-weight:700;color:#53677c';
 const pendingList=document.createElement('div');pendingList.style.cssText='display:grid;gap:10px;margin-top:10px';
 pending.append(pendingTitle,pendingList);
 for(const item of queue){
  const x=item.lead,d=item.draft,reason=ownerDailyBlockReason(x,d);
  const row=document.createElement('div');row.style.cssText='background:white;border:1px solid #e2e8ef;padding:11px 13px;border-radius:14px;display:grid;gap:7px';
  const top=document.createElement('div');top.style.cssText='display:flex;gap:10px;align-items:center';
  const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=ownerDailySelected.has(x.id);
  checkbox.disabled=Boolean(reason)||ownerDailyBusy;checkbox.style.cssText='width:18px;height:18px;flex-shrink:0';
  checkbox.setAttribute('aria-label',ownerDailyLabel('Select ','Seleccionar ')+x.business);
  checkbox.onchange=()=>{if(checkbox.checked)ownerDailySelected.add(x.id);else ownerDailySelected.delete(x.id);renderOwnerDailyOutreach()};
  const desc=document.createElement('div');desc.style.flex='1';
  const name=document.createElement('strong');name.textContent=x.business;name.style.cssText='display:block;font-size:13px';
  const meta=document.createElement('small');meta.textContent=(x.email||'')+' · '+(d.type==='initial'?ownerDailyLabel('First email','Primer correo'):ownerDailyLabel('Follow-up','Seguimiento'));
  const status=document.createElement('span');status.textContent=reason||ownerDailyLabel('Ready','Habilitado');status.style.cssText='font-size:11px;font-weight:750;color:'+(reason?'#9a5729':'#286e68');
  desc.append(name,meta);top.append(checkbox,desc,status);row.append(top);
  const details=document.createElement('details');details.open=ownerDailyOpen;const summary=document.createElement('summary');summary.textContent=ownerDailyLabel('Preview email','Ver correo');
  const subject=document.createElement('strong');subject.textContent=d.subject||ownerDailyLabel('No subject saved','Sin asunto');
  subject.style.cssText='display:block;margin:10px 0 6px;font-size:12px';
  const body=document.createElement('pre');body.textContent=d.body||ownerDailyLabel('No draft saved','Sin borrador');
  body.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;font:12px/1.65 system-ui;color:#334155';
  details.append(summary,subject,body);row.append(details);
  if(reason){
   const editButton=document.createElement('button');editButton.type='button';editButton.className='secondary';editButton.style.cssText='width:max-content;font-size:12px';
   editButton.textContent=ownerDailyLabel('Review contact','Revisar contacto');editButton.onclick=()=>{edit(x);document.querySelector('[data-leadtab="emails"]')?.click()};
   row.append(editButton);
  }(reason?pendingList:list).append(row);
 }
 if(pendingList.children.length)list.append(pending);
 if(!queue.length){const empty=document.createElement('p');empty.className='muted';empty.textContent=ownerDailyLabel('No new first emails are due. Review previous contacts in Follow-ups Due above; automated email requires permission and an active sequence.','No hay primeros correos nuevos. Revisa arriba los seguimientos pendientes; el envío automático requiere permiso y una secuencia activa.');list.append(empty)}
}
$('ownerDailyReview').onclick=()=>{ownerDailyOpen=!ownerDailyOpen;renderOwnerDailyOutreach()};
$('ownerDailySelect').onclick=()=>{for(const x of ownerDailyQueue())if(!ownerDailyBlockReason(x.lead,x.draft))ownerDailySelected.add(x.lead.id);renderOwnerDailyOutreach()};

$('ownerDailySend').onclick=async()=>{
 if(!workspace?.is_internal||ownerDailyBusy||ownerDailySelected.size===0)return;
 const selected=[...ownerDailySelected];
 const approved=confirm(ownerDailyLabel(
  'Send '+selected.length+' individual emails to verified, opted-in contacts? One confirmation for the entire selection. This cannot be undone.',
  '¿Enviar '+selected.length+' correos individuales a los contactos con permiso verificado? Una sola confirmación para todos. No se puede deshacer.'));
 if(!approved)return;
 ownerDailyBusy=true;renderOwnerDailyOutreach();
 let accepted=0,skipped=0,problem='';
 const note=$('ownerDailyStatus');
 try{
  const {data:{session}}=await db.auth.getSession();
  if(!session)throw Error(ownerDailyLabel('Please sign in again.','Vuelve a iniciar sesión.'));
  await load();
  for(const id of selected){
   const x=leads.find(l=>l.id===id);
   if(!x||!x.followup||x.followup>ownerDailyDate()){skipped++;continue}
   const draft=ownerDailyDraft(x);
   if(ownerDailyBlockReason(x,draft)){skipped++;continue}
   note.textContent=ownerDailyLabel('Processing '+(accepted+skipped+1)+' of '+selected.length+'…','Procesando '+(accepted+skipped+1)+' de '+selected.length+'…');
   const {data,error}=await db.functions.invoke('tle-crm-send-followup',{body:{lead_id:id,subject:draft.subject,body:draft.body}});
   if(error||!data?.ok){
    problem=ownerDailyLabel('Sending stopped after a provider or verification error. Review the delivery history before retrying.','Se detuvo el envío por un error del proveedor o de verificación. Revisa el historial antes de reintentar.');
    break;
   }
   accepted++;ownerDailySelected.delete(id);
   emailSentByLead.set(id,new Date().toISOString());
   const due=new Date(ownerDailyDate()+'T12:00:00Z');due.setUTCDate(due.getUTCDate()+3);
   const {error:dateError}=await db.from('tle_crm_leads')
    .update({followup:due.toISOString().slice(0,10)}).eq('id',id).eq('workspace_id',workspace.id);
   if(dateError){problem=ownerDailyLabel('Some emails were accepted, but a follow-up date could not be saved.','Se aceptaron correos, pero no se pudo guardar una fecha de seguimiento.');break}
  }
 }catch(e){problem=ownerDailyLabel('Sending stopped. Check the provider before retrying.','Envío detenido. Revisa el proveedor antes de reintentar.');}
 finally{
  ownerDailyBusy=false;
  try{await load()}catch(e){}
  renderOwnerDailyOutreach();
  note.textContent=ownerDailyLabel('Accepted by provider: '+accepted+'. Skipped: '+skipped+'. ','Aceptados por el proveedor: '+accepted+'. Omitidos: '+skipped+'. ')+problem;
 }
};

function renderEmailHub(){renderOwnerDueFollowups();if($('emailHubTitle'))$('emailHubTitle').textContent=workspace?.is_internal?ownerDailyLabel('Emails & due follow-ups','Correos y seguimientos pendientes'):'Email activity';if($('emailHubIntro'))$('emailHubIntro').textContent=workspace?.is_internal?ownerDailyLabel('All due follow-ups are listed above. Initial emails eligible to send appear separately below.','Arriba se muestran todos los seguimientos pendientes; los primeros correos que se pueden enviar se muestran aparte debajo.'):'Sent emails recorded in this workspace. Open a contact to view details or write a permitted follow-up.';renderOwnerDailyOutreach();const list=$('emailHubList');list.replaceChildren();const sent=leads.filter(x=>emailSentByLead.has(x.id)).sort((a,b)=>String(emailSentByLead.get(b.id)).localeCompare(String(emailSentByLead.get(a.id))));for(const x of sent){const b=document.createElement('button');b.type='button';b.className='emailhub-item';const left=document.createElement('span');const name=document.createElement('strong');name.textContent=x.business;const details=document.createElement('small');details.textContent=x.email||'No email';left.append(name,details);const when=document.createElement('small');when.textContent='Sent · '+new Date(emailSentByLead.get(x.id)).toLocaleDateString();b.append(left,when);b.onclick=()=>{edit(x);document.querySelector('[data-leadtab="emails"]').click()};list.append(b)}if(!sent.length){const p=document.createElement('p');p.className='muted';p.textContent='No sent emails recorded yet.';list.append(p)}}let inboundRequests=[],inboundType='all';async function loadInbound(){const list=$('inboundList');list.textContent='Loading incoming requests…';const {data,error}=await db.rpc('tle_crm_inbound_requests',{p_workspace_id:workspace.id});if(error){list.textContent='Could not load requests: '+error.message;return}inboundRequests=data||[];renderInbound();updateAnalytics();loadStoredNotifications()}function renderInbound(){const list=$('inboundList');list.replaceChildren();$('inboundCount').textContent=String(inboundRequests.length);const items=inboundRequests.filter(x=>inboundType==='all'||x.source_type===inboundType);for(const x of items){const card=document.createElement('article');card.className='inbound-item';const top=document.createElement('div');top.className='inbound-top';const label=document.createElement('strong');label.textContent=({freebie:'Freebie',website:'Website contact',demo:'Demo request'})[x.source_type]||'Request';const when=document.createElement('time');when.textContent=new Date(x.received_at).toLocaleString();top.append(label,when);const name=document.createElement('b');name.textContent=x.business_name||x.request_name||x.email||'New request';card.append(top,name);if(x.email){const email=document.createElement('a');email.href='mailto:'+encodeURIComponent(x.email);email.textContent=x.email;card.append(email)}if(x.details){const details=document.createElement('p');details.textContent=x.details;card.append(details)}const archive=document.createElement('button');archive.type='button';archive.className='secondary';archive.textContent='Remove from inbox';archive.onclick=async()=>{if(!confirm('Remove this request from your inbox? The original submission will be kept for records.'))return;archive.disabled=true;const {data:{user}}=await db.auth.getUser();const {error}=await db.from('tle_crm_archived_incoming').insert({workspace_id:workspace.id,request_id:x.request_id,source_type:x.source_type,archived_by:user.id});if(error){archive.disabled=false;say('Could not remove request: '+error.message);return}await loadInbound();say('Request removed from inbox.')};card.append(archive);list.append(card)}if(!items.length)list.textContent='No requests in this category yet.'}document.querySelectorAll('[data-inbound]').forEach(b=>b.onclick=()=>{inboundType=b.dataset.inbound;document.querySelectorAll('[data-inbound]').forEach(x=>x.classList.toggle('active',x===b));renderInbound()});
/* Buyer-only request inbox: confirmed flat-price bookings, quote requests, and CRM inquiries. */
const buyerRequestEndpoint="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-buyer-request-center";
let buyerRequests=[],buyerSelectedRequest=null,buyerRequestBusy=false;
const buyerText=(en,es)=>buyerEs()?es:en;
function buyerCreate(tag,textValue,cls){const e=document.createElement(tag);if(cls)e.className=cls;if(textValue!==undefined&&textValue!==null)e.textContent=String(textValue);return e}
function buyerDetails(label,value){
 const col=buyerCreate("div");const content=buyerCreate("div",value===null||value===undefined||value===""?"—":value,"request-value");content.setAttribute("data-i18n-ignore","");col.append(buyerCreate("div",label,"request-label"),content);return col
}
async function buyerRequestCall(action,extra){
 if(!workspace||workspace.is_internal)throw Error("Only business buyer accounts can manage booking requests.");
 const {data:{session}}=await db.auth.getSession();
 if(!session)throw Error("Please sign in again.");
 const response=await fetch(buyerRequestEndpoint,{
  method:action==="list"?"GET":"POST",
  headers:{"Authorization":"Bearer "+session.access_token,"Content-Type":"application/json"},
  ...(action==="list"?{}:{body:JSON.stringify(extra)})
 });
 const payload=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(payload.error||buyerText("Could not load this business.","No se pudo cargar el negocio."));
 return payload;
}
function buyerRequestKind(v){return v.status==="booked"?"booking":v.raw_payload?.request_intent==="inquiry"?"inquiry":v.request_type==="quote"?"quote":"booking"}
function buyerRequestIsEstimate(v){return buyerRequestKind(v)==="quote"&&v.raw_payload?.request_intent==="estimate"}
function buyerRequestNeedsAttention(v){
 const p=v.raw_payload||{};
 if(p.customer_change_request?.state==="pending_owner_review"||p.quote_response?.status==="lets_talk")return true;
 if(p.email_handoff&&(p.email_handoff.customer_handoff_accepted===false||p.email_handoff.owner_handoff_accepted===false))return true;
 if(p.change_email_handoff?.results?.some(x=>x.accepted===false))return true;
 if(v.status==="booked"||["closed","declined"].includes(v.status)||v.workflow_stage==="quoted")return false;
 return v.request_type==="quote"||v.raw_payload?.request_intent==="inquiry"||v.workflow_stage!=="booked"
}
function buyerRequestNext(v){
 const p=v.raw_payload||{};
 if(p.email_handoff&&(p.email_handoff.customer_handoff_accepted===false||p.email_handoff.owner_handoff_accepted===false))
  return buyerText("Email needs attention: verify delivery before retrying.","Correo pendiente: comprueba el envío antes de reenviar.");
 if(p.customer_change_request?.state==="pending_owner_review")
  return buyerText("Review the requested cancellation or new date. The booking stays active until you change it.","Revisa la cancelación o nueva fecha. La reserva sigue activa hasta que la cambies.");
 if(v.status==="booked")return buyerText("Booking confirmed automatically. No approval needed.","Reserva confirmada automáticamente. No requiere aprobación.");
 if(p.quote_response?.status==="lets_talk")return buyerText("The customer wants to talk. Reply to their message.","El cliente quiere conversar. Responde a su mensaje.");
 if(p.quote_response?.status==="declined")return buyerText("Quote declined. Review the reason; no booking was created.","Cotización rechazada. Revisa el motivo; no se creó una reserva.");
 if(v.workflow_stage==="quoted")return buyerText("Quote sent. The customer can accept, decline or request a conversation.","Cotización enviada. El cliente puede aceptar, rechazar o conversar.");
 if(buyerRequestKind(v)==="quote")return buyerText("Next: review details, set a price and send the quote.","Siguiente: revisa los datos, indica el precio y envía la cotización.");
 if(buyerRequestKind(v)==="inquiry")return buyerText("Next: answer the question or prepare a quote.","Siguiente: responde o prepara una cotización.");
 return buyerText("Next: review the request and confirm an available slot.","Siguiente: revisa la solicitud y confirma un horario libre.");
}
function buyerRequestState(v){
 if(v.status==="booked")return buyerText("Confirmed booking","Reserva confirmada");
 const answer=v.raw_payload?.quote_response?.status;
 if(answer==="accepted")return buyerText("Quote accepted — confirm booking","Cotización aceptada — confirmar reserva");
 if(answer==="declined")return buyerText("Quote declined","Cotización rechazada");
 if(answer==="lets_talk")return buyerText("Customer wants to talk","Cliente quiere conversar");
 if(v.status==="declined"||v.workflow_stage==="declined")return buyerText("Declined","Rechazada");
 if(v.status==="closed")return buyerText("Closed / Declined","Cerrada / Rechazada");
 if(v.workflow_stage==="quoted")return buyerText("Quote prepared","Cotización preparada");
 if(v.workflow_stage==="reviewing")return buyerText("Under review","En revisión");
 return buyerRequestKind(v)==="inquiry"?buyerText("New inquiry","Nueva consulta"):buyerRequestIsEstimate(v)?buyerText("Estimate requested","Solicitó estimado"):v.request_type==="quote"?buyerText("Quote requested","Solicita cotización"):buyerText("Booking request","Solicitud de reserva");
}
function buyerRequestSummaries(){
 const area=$("buyerRequestStats");area.replaceChildren();
 const counts=[
  [buyerText("Confirmed bookings","Reservas confirmadas"),buyerRequests.filter(x=>x.status==="booked").length],
  [buyerText("Quotes & estimates","Cotizaciones y estimados"),buyerRequests.filter(x=>buyerRequestKind(x)==="quote").length],
  [buyerText("Inquiries","Consultas"),buyerRequests.filter(x=>buyerRequestKind(x)==="inquiry").length],
  [buyerText("Needs attention","Necesitan atención"),buyerRequests.filter(buyerRequestNeedsAttention).length+buyerManualLeads().filter(x=>["New","Follow-up"].includes(x.stage)).length]
 ];
 for(const [label,count] of counts){
  const card=buyerCreate("div",undefined,"request-stat");
  card.append(buyerCreate("small",label),buyerCreate("b",count));area.append(card)
 }
}
function buyerRequestCard(x){
 const btn=buyerCreate("button",undefined,"request-card"+(buyerSelectedRequest?.id===x.id?" selected":""));btn.type="button";
 const bar=buyerCreate("div");bar.style.cssText="display:flex;justify-content:space-between;gap:7px;flex-wrap:wrap";
 bar.append(buyerCreate("span",buyerRequestKind(x)==="inquiry"?buyerText("Inquiry","Consulta"):buyerRequestKind(x)==="quote"?(buyerRequestIsEstimate(x)?buyerText("Estimate","Estimado"):buyerText("Quote","Cotización")):buyerText("Booking","Reserva"),"request-pill"),
  buyerCreate("span",buyerRequestState(x),"request-pill"));
 const title=buyerCreate("strong",x.customer_name||x.customer_email||"Customer");title.style.cssText="display:block;font-size:16px;margin:10px 0 6px";
 const time=x.raw_payload?.requested_date?[x.raw_payload.requested_date,x.raw_payload.requested_time].filter(Boolean).join(" · "):x.requested_start_at?new Date(x.requested_start_at).toLocaleString():"";
 const details=buyerCreate("div",[x.service_name,isDetailingWorkspace()?(x.raw_payload?.vehicle_type||x.raw_payload?.property_type):"",time,x.raw_payload?.estimate_display].filter(Boolean).join(" · "),"request-summary");
 const footer=buyerCreate("div",x.created_at?new Date(x.created_at).toLocaleString():"","request-summary");footer.style.marginTop="8px";
 btn.append(bar,title,details,footer);btn.onclick=()=>buyerOpenRequest(x);return btn
}
function buyerOpenRequest(x){
 buyerSelectedRequest=x;$("buyerRequestDetailTitle").textContent=x.customer_name||x.customer_email||buyerText("Customer request","Solicitud de cliente");
 const body=$("buyerRequestDetails");body.replaceChildren();
 const payload=x.raw_payload||{};
 const requested=[payload.requested_date,payload.requested_time].filter(Boolean).join(" · ");
 const detailing=isDetailingWorkspace();
 const fields=[
  [buyerText("Request type","Tipo"),buyerRequestKind(x)==="inquiry"?buyerText("Inquiry","Consulta"):buyerRequestKind(x)==="quote"?(buyerRequestIsEstimate(x)?buyerText("Estimate","Estimado"):buyerText("Quote","Cotización")):buyerText("Booking","Reserva")],
  [buyerText("Status","Estado"),buyerRequestState(x)],
  [detailing?buyerText("Detailing service","Servicio de detailing"):buyerText("Service","Servicio"),x.service_name],
  [buyerText("Published price / estimate","Precio o estimado"),payload.estimate_display],
  [buyerText("Requested date and time","Fecha y hora solicitadas"),requested|| (x.requested_start_at?new Date(x.requested_start_at).toLocaleString():"")],
  ...(detailing?[
    [buyerText("Vehicle type","Tipo de vehículo"),payload.vehicle_type||payload.property_type],
    [buyerText("Vehicle condition","Estado del vehículo"),payload.vehicle_condition||payload.condition]
  ]:[
    [buyerText("Frequency","Frecuencia"),payload.frequency],
    [buyerText("Property","Propiedad"),[payload.property_type,payload.bedrooms?payload.bedrooms+" bed":"",payload.bathrooms?payload.bathrooms+" bath":"",payload.square_footage].filter(Boolean).join(" · ")]
  ]),
  [buyerText("Add-ons","Extras"),payload.extras],
  [buyerText("Customer email","Correo del cliente"),x.customer_email],
  [buyerText("Phone","Teléfono"),x.customer_phone],
  [buyerText("Service address","Dirección del servicio"),x.service_address],
  [buyerText("Customer notes","Notas del cliente"),x.notes],
  [buyerText("Quote sent","Cotización enviada"),payload.quote_offer?.amount?new Intl.NumberFormat(x.preferred_language==="es"?"es-US":"en-US",{style:"currency",currency:payload.quote_offer.currency==="CAD"?"CAD":"USD"}).format(Number(payload.quote_offer.amount)):""],
  [buyerText("Customer quote response","Respuesta a cotización"),payload.quote_response?.status==="accepted"?buyerText("Accepted","Aceptada"):payload.quote_response?.status==="declined"?buyerText("Declined","Rechazada"):payload.quote_response?.status==="lets_talk"?buyerText("Let's talk","Quiere conversar"):""],
  [buyerText("Decline reason","Motivo del rechazo"),payload.quote_response?.reason],
  [buyerText("Customer response note","Comentario del cliente"),payload.quote_response?.note],
  [buyerText("Booking change request","Solicitud de cambio"),payload.customer_change_request?.action==="cancel"?buyerText("Cancellation requested — pending owner review","Cancelación solicitada — pendiente de revisión"):payload.customer_change_request?.action==="reschedule"?buyerText("Reschedule requested — pending review","Cambio de fecha solicitado — pendiente de revisión"):""],
  [buyerText("Preferred new date","Nueva fecha preferida"),payload.customer_change_request?.preferred_date],
  [buyerText("Preferred new time","Nueva hora preferida"),payload.customer_change_request?.preferred_time]
 ];
 for(const [label,value] of fields)body.append(buyerDetails(label,value));
 $("buyerRequestNextAction").classList.remove("hidden");$("buyerRequestNextAction").textContent=buyerRequestNext(x);
 $("buyerRequestReplyArea").classList.remove("hidden");
 $("buyerRequestAction").value=x.status==="booked"?"reply":"reviewing";
 $("buyerRequestQuoteAmount").value=payload.quote_offer?.amount||"";
 $("buyerRequestBookingDate").value=String(payload.requested_date||"").slice(0,10);
 $("buyerRequestBookingTime").value=String(payload.requested_time||"").slice(0,5);
 buyerSetDefaultMessage();
 $("buyerRequestStatus").textContent="";
 buyerRenderRequestCards();
}
function buyerSetDefaultMessage(){
 const x=buyerSelectedRequest;if(!x)return;
 $("buyerRequestQuoteOffer").classList.toggle("hidden",$("buyerRequestAction").value!=="quoted");
 $("buyerRequestConfirmSlot").classList.toggle("hidden",$("buyerRequestAction").value!=="booked"||x.status==="booked");
 const action=$("buyerRequestAction").value,es=x.preferred_language==="es",name=(x.customer_name||"").trim().split(/\s+/)[0]||(es?"cliente":"there");
 const detailing=isDetailingWorkspace();
 const service=x.service_name||(detailing?"detailing":isOtherServiceWorkspace()?(es?"servicio":"service"):(es?"limpieza":"cleaning"));
 const slot=[ $("buyerRequestBookingDate").value,$("buyerRequestBookingTime").value ].filter(Boolean).join(" · ");
 let copy={
  reviewing:es?"Recibimos tu solicitud para "+service+" y estamos revisando los detalles. Te confirmaremos el próximo paso.":"We received your "+service+" request and are reviewing the details. We'll let you know the next step.",
  quoted:es?"Revisamos tu solicitud de cotización para "+service+". Responde a este correo para confirmar los detalles y continuar.":"We reviewed your quote request for "+service+". Reply here to confirm any details and move forward.",
  booked:es?"Tu reserva de "+service+" está confirmada"+(slot?" para "+slot:"")+". Si necesitas cambiar algún detalle, responde a este correo.":"Your "+service+" booking is confirmed"+(slot?" for "+slot:"")+". If anything needs changing, please reply here.",
  change_requested:es?"Necesitamos confirmar un detalle de tu solicitud de "+service+". Responde a este correo para revisar una nueva opción antes de cambiar la reserva.":"We need to confirm a detail about your "+service+" request. Please reply so we can review an alternative before any booking change.",
  declined:es?"Gracias por tu interés en "+service+". En este momento no podemos confirmar tu solicitud. Escríbenos si deseas explorar otra opción.":"Thank you for your interest in "+service+". We can't confirm this request at the moment. Reply if you'd like to discuss another option.",
  closed:detailing?(es?"Hemos cerrado esta solicitud de detailing. Si necesitas otra cita para tu vehículo, responde aquí.":"We've closed this detailing request. If your vehicle needs another appointment, feel free to reach out."):isOtherServiceWorkspace()?(es?"Hemos cerrado esta solicitud. Escríbenos si necesitas otro servicio.":"We've closed this request. Reach out if you need another service."):es?"Queríamos avisarte que hemos cerrado esta solicitud. Si necesitas una nueva limpieza, puedes escribirnos nuevamente.":"We're letting you know this request has been closed. If you need another cleaning, you're welcome to reach out.",
  reply:es?"Gracias por contactar a nuestro negocio. Revisamos tu solicitud; responde a este correo si tienes preguntas.":"Thanks for contacting our business. We've reviewed your request. Reply here if you have any questions."
 };
 if(detailing){
  copy.reviewing=es?"Recibimos tu solicitud para "+service+". Estamos revisando los detalles de tu vehículo antes de preparar la cotización o el próximo paso. Tu cita aún no está confirmada.":"We received your "+service+" request. We're reviewing your vehicle details before preparing a quote or the next step. Your appointment is not confirmed yet.";
  copy.quoted=es?"Preparamos tu cotización de detailing para "+service+". Revisa el precio y las opciones del correo antes de decidir. Aceptar una cotización no confirma el horario.":"Your car detailing quote for "+service+" is ready. Review the price and options in this email. Accepting the quote does not automatically guarantee an appointment.";
  copy.booked=es?"Tu cita de detailing para "+service+" está confirmada"+(slot?" para "+slot:"")+". Si necesitas cambiar algo, responde a este correo.":"Your car detailing appointment for "+service+" is confirmed"+(slot?" for "+slot:"")+". Reply here if you need to adjust anything.";
  copy.reply=es?"Gracias por contactar a CB Depot. Revisamos los detalles de tu vehículo y tu solicitud de detailing. Responde si tienes alguna pregunta.":"Thanks for contacting CB Depot. We've reviewed your vehicle and detailing request. Reply here with any questions.";
  copy.declined=es?"Gracias por considerar CB Depot para "+service+". Por ahora no podemos confirmar el servicio. Responde si deseas otra opción.":"Thanks for considering CB Depot for "+service+". We can't confirm this service at the moment. Reply if you'd like to discuss an alternative.";
 }
 $("buyerRequestMessage").value=(es?"Hola ":"Hi ")+name+",\n\n"+copy[action]+"\n\n"+(workspace?.name||"Your business")
}
function buyerManualLeads(){
 if(!workspace||workspace.is_internal)return [];
 return leads.filter(x=>x.stage!=="Won"&&!x.research_only&&!/booking page|booking flow|booking form|quote request/i.test(String(x.source||"")))
}
function buyerManualCard(x){
 const btn=buyerCreate("button",undefined,"request-card");btn.type="button";
 const label=buyerCreate("span",buyerText("Inquiry · Other source","Consulta · Otra fuente"),"request-pill");
 const name=buyerCreate("strong",x.contact||x.business||buyerText("Customer","Cliente"));
 name.style.cssText="display:block;margin:10px 0 5px";
 const desc=buyerCreate("div",[x.source,x.email,x.stage].filter(Boolean).join(" · "),"request-summary");
 const next=buyerCreate("div",buyerText("Next: review or reply","Siguiente: revisar o responder"),"buyer-inbox-next");
 next.style.cssText="margin-top:9px;font-size:12px;color:#45677f";
 btn.append(label,name,desc,next);btn.onclick=()=>edit(x);return btn;
}
function buyerRenderRequestCards(){
 const root=$("buyerRequestCards");root.replaceChildren();
 const q=$("buyerRequestSearch").value.toLowerCase().trim(),type=$("buyerRequestType").value;
 const rows=buyerRequests.filter(x=>(type==="all"||type==="attention"&&buyerRequestNeedsAttention(x)||buyerRequestKind(x)===type)
 &&[x.customer_name,x.customer_email,x.service_name,x.status,x.raw_payload?.estimate_display].some(v=>String(v||"").toLowerCase().includes(q)));
 rows.sort((a,b)=>Number(buyerRequestNeedsAttention(b))-Number(buyerRequestNeedsAttention(a))||Date.parse(b.created_at)-Date.parse(a.created_at));
 for(const x of rows)root.append(buyerRequestCard(x));
 if(["all","inquiry","attention"].includes(type))for(const item of buyerManualLeads().filter(x=>
  (type!=="attention"||["New","Follow-up"].includes(x.stage))&&
  [x.contact,x.business,x.email,x.source,x.notes].some(v=>String(v||"").toLowerCase().includes(q))
 ))root.append(buyerManualCard(item));
 if(!root.childElementCount)root.textContent=buyerText("No customer requests in this view.","No hay solicitudes en esta vista.");
}
function buyerRenderOtherLeads(){$("buyerOtherInquiries").replaceChildren();}
function renderBuyerCustomers(){
 if(!workspace||workspace.is_internal)return;
 const root=$('buyerCustomersList');root.replaceChildren();
 const map=new Map();
 for(const request of [...buyerRequests].sort((a,b)=>Date.parse(b.created_at||0)-Date.parse(a.created_at||0))){
  const email=String(request.customer_email||'').toLowerCase().trim();
  const key=email||('request:'+request.id);
  if(!map.has(key))map.set(key,{request});
 }
 for(const manual of leads.filter(x=>!x.research_only&&!/booking page|booking flow|booking form|quote request/i.test(String(x.source||'')))){
  const email=String(manual.email||'').toLowerCase().trim();
  const key=email||('manual:'+manual.id);
  if(!map.has(key))map.set(key,{manual});
 }
 const people=[...map.values()];
 $('buyerCustomersCount').textContent=buyerText(people.length+' customer contacts',people.length+' contactos de clientes');
 if(!people.length){root.append(buyerCreate('p',buyerText('No customers yet. New contacts from your Booking Page and manual inquiries will appear here.','Todavía no hay clientes. Aquí aparecerán los contactos de tu Booking Page y las consultas manuales.'),'muted'));return}
 for(const person of people){
  const x=person.request||person.manual;const isRequest=!!person.request;
  const name=isRequest?(x.customer_name||x.customer_email):(x.contact||x.business||x.email);
  const card=buyerCreate('button',undefined,'request-card');card.type='button';card.style.cssText='width:100%;text-align:left';
  card.append(
   buyerCreate('span',isRequest?buyerRequestState(x):buyerText('Manual contact','Contacto manual'),'request-pill'),
   buyerCreate('strong',name||buyerText('Customer','Cliente')),
   buyerCreate('div',isRequest?([x.customer_email,x.service_name].filter(Boolean).join(' · ')):[x.email,x.source].filter(Boolean).join(' · '),'request-summary'),
   buyerCreate('small',buyerText('Open customer →','Abrir cliente →'),'request-summary')
  );
  card.onclick=()=>{
   if(isRequest){
    $('buyerRequestSearch').value=x.customer_email||x.customer_name||'';
    $('buyerRequestType').value='all';
    premiumNavigate('request-center');
   }else edit(x)
  };
  root.append(card)
 }
}
$('buyerCustomersRefresh').onclick=()=>{if(workspace&&!workspace.is_internal)void loadBuyerRequests()};

const clientReviewEndpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-client-review';
let buyerClientReviewState=null;
async function clientReviewRequest(action,data={}){
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token)throw Error('Please sign in with your own account.');
 const res=await fetch(clientReviewEndpoint,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+session.access_token},body:JSON.stringify({action,...data})});
 const result=await res.json().catch(()=>({}));
 if(!res.ok)throw Error(result.error||'Review could not be saved.');
 return result;
}
function renderBuyerClientReview(){
 const data=buyerClientReviewState;
 const panel=$('buyerClientReview'),message=$('buyerClientReviewStatus'),buttons=$('buyerClientReviewButtons'),form=$('buyerReviewFeedbackForm'),mobileButton=$('buyerReviewMobileOpen');
 if(!data||data.status==='approved'||data.delivered){
  panel.classList.add('hidden');panel.classList.remove('review-sheet-open');
  mobileButton.classList.add('hidden');mobileButton.setAttribute('aria-expanded','false');return;
 }
 panel.classList.remove('hidden');
 mobileButton.classList.remove('hidden');
 const es=localStorage.getItem('tle_crm_language')==='es';
 const remaining=Number(data.revisions_remaining||0);
 $('buyerClientReviewCount').textContent=es?remaining+' de '+data.revisions_limit+' revisiones disponibles':remaining+' of '+data.revisions_limit+' included revisions remaining';
 const lines={
  pending_review:es?'Revisa la página y el resultado del test antes de aprobar o pedir un cambio.':'Check your page and sample test, then approve or request a change.',
  changes_requested:es?'Tu solicitud fue enviada a The Launch Era. Estamos preparando la corrección.':'Your correction request was sent to The Launch Era. The updated version is being prepared.',
  ready_for_retest:es?'Los cambios están listos. Revisa la página actualizada, prueba y decide.':'Your corrections are ready. Review the updated page, test it and decide.',
  approved:es?'✓ Aprobado. No necesitas otra cuenta. La entrega final se confirma por separado.':'✓ Approved. No new account is needed. Final delivery is confirmed separately.'
 };
 message.textContent=lines[data.status]||'Review status unavailable';
 if(data.status==='changes_requested'&&data.feedback)message.textContent+=' '+(es?'Tu solicitud: ':'Your request: ')+data.feedback;
 const actionable=!data.delivered&&['pending_review','ready_for_retest'].includes(data.status);
 buttons.classList.toggle('hidden',!actionable);
 $('buyerReviewChange').disabled=remaining<=0;
 form.classList.add('hidden');
}
async function loadBuyerClientReview(){
 if(!workspace||workspace.is_internal)return;
 try{buyerClientReviewState=await clientReviewRequest('buyer_status');renderBuyerClientReview();}
 catch(error){
  // Never block the permanent operational Test Center on a review-portal outage.
  buyerClientReviewState=null;renderBuyerClientReview();
  console.warn('Client review status temporarily unavailable:',error.message||String(error));
 }
}
$('buyerReviewMobileOpen').onclick=()=>{
  const panel=$('buyerClientReview'),trigger=$('buyerReviewMobileOpen');
  if(panel.classList.contains('hidden'))return;
  const open=panel.classList.toggle('review-sheet-open');
  trigger.setAttribute('aria-expanded',open?'true':'false');
  trigger.textContent=open?crmLocaleText('Close','Cerrar'):crmLocaleText('Review','Revisar');
 };
 $('buyerReviewChange').onclick=()=>{$('buyerReviewFeedbackForm').classList.remove('hidden');$('buyerReviewFeedback').focus()};
$('buyerReviewCancel').onclick=()=>$('buyerReviewFeedbackForm').classList.add('hidden');
$('buyerReviewApprove').onclick=async()=>{
 const button=$('buyerReviewApprove'),status=$('buyerClientReviewStatus');
 if(!confirm('Approve this personalized Booking Page and Command Center as shown? / ¿Apruebas esta versión?'))return;
 button.disabled=true;status.textContent='Saving your approval…';
 try{buyerClientReviewState=await clientReviewRequest('buyer_decision',{decision:'approve'});renderBuyerClientReview();}
 catch(error){status.textContent=error.message||'Could not approve';button.disabled=false}
};
$('buyerReviewSend').onclick=async()=>{
 const button=$('buyerReviewSend'),status=$('buyerClientReviewStatus'),feedback=$('buyerReviewFeedback').value.trim();
 if(feedback.length<12){status.textContent=crmLocaleText("Describe the changes you need in at least 12 characters.","Describe los cambios que necesitas con al menos 12 caracteres.");return}
 if(!confirm('Send your correction request? This uses one included revision. / ¿Enviar y descontar una revisión?'))return;
 button.disabled=true;status.textContent='Sending your request to The Launch Era…';
 try{buyerClientReviewState=await clientReviewRequest('buyer_decision',{decision:'request_changes',feedback});renderBuyerClientReview();}
 catch(error){status.textContent=error.message||'Could not send request';button.disabled=false}
};
async function ownerClientReviewRequest(action,subject_type,subject_id,extra={}){
 const {data:{session},error}=await db.auth.getSession();
 if(error||!session?.access_token)throw Error('Owner sign-in required');
 const response=await fetch(clientReviewEndpoint,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+session.access_token},body:JSON.stringify({action,subject_type,subject_id,...extra})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(data.error||'Could not load client approval');
 return data;
}
async function addOwnerClientReview(kind,id,item,previewInput){
 const es=localStorage.getItem('tle_crm_language')==='es';
 const card=document.createElement('div');card.style.cssText='background:#f2f7fb;border:1px solid #cbddea;padding:14px;border-radius:14px;display:grid;gap:9px;min-width:0;margin:13px 0';
 const heading=document.createElement('strong');heading.textContent=es?'Aprobación del cliente y revisiones':'Client approval & revisions';card.append(heading);
 const status=document.createElement('p');status.style.cssText='font-size:12px;line-height:1.5;margin:0;overflow-wrap:anywhere';card.append(status);
 const notes=document.createElement('p');notes.style.cssText='font-size:13px;line-height:1.5;margin:0;white-space:pre-wrap;overflow-wrap:anywhere';card.append(notes);
 item.append(card);
 try{
  const data=await ownerClientReviewRequest('owner_get',kind,id);
  if(!card.isConnected)return;
  item.dataset.clientReviewApproved=data.status==='approved'?'true':'false';
  const labels={
   pending_review:es?'Esperando aprobación del cliente':'Waiting for client approval',
   changes_requested:es?'Necesita correcciones':'Changes requested — action needed',
   ready_for_retest:es?'Corregido · esperando nueva aprobación':'Corrected · awaiting buyer re-approval',
   approved:es?'✓ Aprobado por el cliente':'✓ Client approved'
  };
  status.textContent=(labels[data.status]||data.status)+' · '+data.revisions_remaining+'/'+data.revisions_limit+' '+(es?'revisiones disponibles':'revisions remaining');
  if(data.feedback)notes.textContent=(es?'Solicitud del cliente: ':'Buyer feedback: ')+data.feedback;
  // Booking design reviews only. The owner alone decides when to send a reminder.
  // Show it after 12 hours of waiting; never auto-send, reset revisions or send final access.
  if(kind==='booking'&&!['approved','changes_requested'].includes(data.status)&&data.manual_reminder_due_at){
   const reminder=document.createElement('div');
   reminder.style.cssText='display:grid;gap:8px;padding:12px;border-radius:12px;border:1px solid #cadce9;background:#fff';
   const hint=document.createElement('p');hint.style.cssText='margin:0;font-size:12px;line-height:1.5;overflow-wrap:anywhere';
   const btn=document.createElement('button');btn.type='button';btn.className='secondary';
   btn.style.cssText='width:100%;white-space:normal;min-height:42px';
   if(data.manual_reminder_sent_at){
    hint.textContent=es?'✓ Recordatorio solicitado y aceptado por el proveedor de correo. La entrega en bandeja no está confirmada.':'✓ Reminder accepted by the email provider. Inbox delivery is not yet confirmed.';
    btn.remove();
   }else if(data.manual_reminder_attempted){
    hint.textContent=es?'Recordatorio ya solicitado. Revisa el estado del envío antes de reintentarlo para evitar duplicados.':'Reminder already attempted. Check delivery status before retrying to avoid duplicates.';
   }else if(!data.manual_reminder_available){
    const due=new Date(data.manual_reminder_due_at);
    const time=due.toLocaleString(es?'es-US':'en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
    hint.textContent=es?'Si el cliente no responde, podrás enviarle un recordatorio manual a partir del '+time+'.':'If the client has not responded, you can send a manual reminder after '+time+'.';
   }else{
    hint.textContent=es?'Han pasado 12 horas sin aprobación. Puedes enviar un recordatorio desde aquí.':'12 hours have passed without approval. You can send a reminder from here.';
    btn.disabled=false;
    btn.textContent=es?'✉ Enviar recordatorio al cliente':'✉ Send client reminder';
    btn.onclick=async()=>{
     if(!confirm(es?'¿Enviar ahora un recordatorio de aprobación a este cliente? No se enviará la entrega final.':'Send a design-approval reminder to this client now? This will not send final delivery.'))return;
     btn.disabled=true;
     hint.textContent=es?'Enviando recordatorio…':'Sending reminder…';
     try{
      const sent=await ownerClientReviewRequest('owner_send_review_reminder',kind,id);
      if(!sent.notification_accepted)throw Error(es?'El proveedor no confirmó el envío.':'Email provider did not accept the message.');
      hint.textContent=es?'✓ Recordatorio aceptado por el proveedor. Comprueba el estado de entrega del correo.':'✓ Reminder accepted by the email provider. Verify its delivery status.';
      btn.remove();
     }catch(error){
      hint.textContent=(es?'No se pudo confirmar el recordatorio: ':'Could not confirm the reminder: ')+(error.message||String(error));
      // Prevent accidental duplicates until the owner refreshes the actual server status.
      btn.disabled=true;
     }
    };
   }
   reminder.append(hint);
   if(data.manual_reminder_available&&!data.manual_reminder_attempted)reminder.append(btn);
   card.append(reminder);
  }
  if(data.status==='changes_requested'){
    const btn=document.createElement('button');btn.type='button';btn.className='secondary';btn.style.cssText='width:100%;white-space:normal';
    btn.textContent=es?'✓ Correcciones terminadas · devolver para aprobación':'✓ Corrections done · Return for client approval';
    btn.onclick=async()=>{
     if(!confirm(es?'¿Ya corregiste y comprobaste lo solicitado?':'Have you fixed and tested the requested changes?'))return;
     btn.disabled=true;status.textContent=es?'Enviando versión corregida…':'Sending corrected version…';
     try{const next=await ownerClientReviewRequest('owner_mark_ready',kind,id);status.textContent=(es?'Versión corregida lista para revisión. ':'Corrected version ready for buyer review. ')+(next.notification_accepted?'Email queued.':'Email not verified; use the secure review link or notify the client.');btn.remove();if(next.review_url){const input=document.createElement('input');input.readOnly=true;input.value=next.review_url;input.style.width='100%';card.append(input)}}
     catch(error){status.textContent=error.message;btn.disabled=false;}
    };
    card.append(btn);
  }
  if(kind==='ai'&&data.status!=='approved'){
   const issue=document.createElement('button');issue.type='button';issue.className='secondary';issue.style.cssText='width:100%;white-space:normal';
   issue.textContent=es?'Crear enlace privado para revisar el agente':'Create private AI review link';
   const holder=document.createElement('input');holder.readOnly=true;holder.placeholder='Private review link appears here';holder.style.width='100%';
   issue.onclick=async()=>{
    issue.disabled=true;status.textContent=es?'Creando enlace seguro…':'Creating secure link…';
    try{const url=previewInput?.value?.trim();const result=await ownerClientReviewRequest('owner_issue_ai_link','ai',id,{preview_url:url});holder.value=result.url;holder.focus();holder.select();status.textContent=es?'Enlace creado. Cópialo y compártelo con tu cliente para la prueba.':'Private link created. Copy it and share with your buyer for testing. Date-limited access.';}
    catch(error){status.textContent=error.message}finally{issue.disabled=false}
   };
   card.append(issue,holder);
  }
 }catch(e){status.textContent='Review status unavailable: '+(e.message||String(e))}
}

let buyerPreviewLoading=false;
let buyerPreviewQaNonce=null;
let buyerPreviewQaWorkspace=null;
let buyerPreviewQaRunning=false;
// Use the same transactional sample-lead QA path as the owner Test Center.
// The server verifies the signed-in buyer and matching private workspace,
// then deletes the sample lead before confirming success.
window.addEventListener('message',async event=>{
 const frame=$('buyerBookingPreviewFrame');
 if(event.origin!=='https://thelaunchera.com'||event.source!==frame?.contentWindow||
    event.data?.type!=='TLE_OWNER_PREVIEW_QA_REQUEST')return;
 const nonce=event.data?.nonce;
 if(!nonce||nonce!==buyerPreviewQaNonce||!workspace||workspace.is_internal||
    workspace.id!==buyerPreviewQaWorkspace||$('buyerBookingPreviewHub').classList.contains('hidden'))return;
 const answer=(payload)=>frame.contentWindow?.postMessage(
  {type:'TLE_OWNER_PREVIEW_QA_RESULT',nonce,...payload},'https://thelaunchera.com');
 if(buyerPreviewQaRunning){
  answer({ok:false,verified:false,error:buyerText('Another private test is already running.','Ya se está realizando otra prueba privada.')});
  return;
 }
 buyerPreviewQaRunning=true;
 const status=$('buyerBookingPreviewStatus');
 status.textContent=buyerText('Running your private test: checking that the sample request reaches this Command Center…','Realizando prueba privada: comprobando que la solicitud llegue a este Command Center…');
 try{
  const {data:{session},error:sessionError}=await db.auth.getSession();
  if(sessionError||!session?.access_token)throw Error('Sign in again to run the test.');
  if(workspace?.id!==buyerPreviewQaWorkspace)throw Error('Workspace changed. Reload the preview.');
  const request=event.data.request||{};
  const response=await fetch('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-buyer-booking-preview',{
   method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+session.access_token},
   body:JSON.stringify({action:'qa_test_lead',request:{
    service_name:String(request.service_name||'Sample request').slice(0,120),
    property_type:String(request.property_type||'Vehicle').slice(0,80),
    requested_date:String(request.requested_date||'').slice(0,10)
   }})
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result.ok!==true||result.verified!==true||
     result.correct_private_workspace!==true||result.test_data_deleted!==true)
   throw Error(result.error||'The sample request was not verified.');
  status.textContent=buyerText('✓ TEST PASSED — Request reached the correct private Command Center. Sample removed. No real booking, customer email, or charge.','✓ PRUEBA APROBADA — La solicitud llegó al Command Center correcto. Se eliminó el ejemplo y no se creó ninguna reserva, correo ni cargo real.');
  answer({ok:true,verified:true,test_data_deleted:true,no_customer_email_sent:true,no_booking_created:true});
 }catch(error){
  status.textContent=buyerText('TEST FAILED — '+(error.message||String(error)),'PRUEBA FALLIDA — No se pudo verificar la solicitud. Actualiza la vista previa e inténtalo de nuevo.');
  answer({ok:false,verified:false,error:buyerText(error.message||'Please try again.','No se pudo completar la prueba. Inténtalo de nuevo.')});
 }finally{buyerPreviewQaRunning=false}
});
async function loadBuyerBookingPreview(){
 if(!workspace||workspace.is_internal||buyerPreviewLoading)return;
 buyerPreviewLoading=true;
 // A previous approval should never stay over the permanent Booking Page preview.
 buyerClientReviewState=null;renderBuyerClientReview();
 buyerPreviewQaNonce=null;buyerPreviewQaWorkspace=null;
 const status=$('buyerBookingPreviewStatus'),frame=$('buyerBookingPreviewFrame'),id=workspace.id;
 status.textContent=buyerText('Preparing your real Booking Page design safely…','Preparando de forma segura el diseño real de tu página de reservas…');
 try{
  const {data:{session},error:sessionError}=await db.auth.getSession();
  if(sessionError||!session?.access_token)throw Error('Please sign in with your password first.');
  const response=await fetch('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-buyer-booking-preview',{
   method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+session.access_token}
  });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok||!payload.ok||!payload.preview_only||!payload.config)throw Error(payload.error||'Private preview unavailable');
  if(workspace?.id!==id||workspace.is_internal)return;
  const config=payload.config;
  if(typeof config.qa_nonce!=='string'||!config.qa_nonce)throw Error('Private QA is not ready. Refresh the preview.');
  $('buyerBookingPreviewBusiness').textContent=(String(config.business_name||workspace?.name||buyerText('Your business','Tu negocio')).slice(0,110))+buyerText(' · Test mode',' · Modo de prueba');
  buyerPreviewQaNonce=config.qa_nonce;buyerPreviewQaWorkspace=id;
  frame.onload=()=>{if(frame.contentWindow&&workspace?.id===id)frame.contentWindow.postMessage(
   {type:'TLE_OWNER_BOOKING_PREVIEW',config},'https://thelaunchera.com')};
  frame.src='https://thelaunchera.com/booking/?owner_preview=1&lang='+encodeURIComponent(config.language==='es'?'es':'en')+'&preview_refresh='+Date.now();
  status.textContent=buyerText('✓ Private Test Center ready with your latest saved services and prices. Sample requests verify your own Command Center routing and are deleted automatically; no real booking or email is sent.','✓ Centro de Pruebas privado listo con los servicios y precios guardados. Las solicitudes de prueba comprueban que llegan a tu Command Center y se eliminan automáticamente; no se crean reservas ni se envían correos reales.');
  if(payload.delivered===true){buyerClientReviewState={status:'approved',delivered:true};renderBuyerClientReview();}
  else void loadBuyerClientReview();
 }catch(error){
  buyerPreviewQaNonce=null;buyerPreviewQaWorkspace=null;
  frame.onload=null;frame.removeAttribute('src');
  status.textContent=buyerText('Preview unavailable: '+(error.message||String(error)),'Vista previa no disponible. Actualiza la pantalla o contacta con soporte.');
 }finally{buyerPreviewLoading=false}
}
function renderBuyerDashboard(){
 if(!workspace||workspace.is_internal)return;
 const attention=buyerRequests.filter(buyerRequestNeedsAttention).length+buyerManualLeads().filter(x=>["New","Follow-up"].includes(x.stage)).length;
 const confirmed=buyerRequests.filter(x=>x.status==="booked").length;
 const quotes=buyerRequests.filter(x=>buyerRequestKind(x)==="quote").length;
 const area=$("buyerDashboardStats");area.replaceChildren();
 for(const [name,value] of [
  [isDetailingWorkspace()?buyerText("Vehicle requests needing attention","Solicitudes de vehículos pendientes"):buyerText("Needs attention","Necesitan atención"),attention],
  [isDetailingWorkspace()?buyerText("Confirmed detailing appointments","Citas de detailing confirmadas"):buyerText("Confirmed bookings","Reservas confirmadas"),confirmed],
  [isDetailingWorkspace()?buyerText("Detailing quote requests","Cotizaciones de detailing"):buyerText("Quotes & estimates","Cotizaciones y estimados"),quotes]
 ]){
   const tile=buyerCreate("div",undefined,"request-stat");
   tile.append(buyerCreate("small",name),buyerCreate("b",value));
   area.append(tile);
 }
 $("buyerDashboardStatus").textContent=buyerText("Updated from your private business workspace.","Actualizado desde el espacio privado de tu negocio.");
}
$('cbDashInbox').onclick=()=>premiumNavigate('request-center');
$('cbDashAdd').onclick=()=>{if(isDetailingWorkspace())edit(null)};
$('cbDashPricing').onclick=()=>premiumNavigate('pricing');
$('cbDashRefresh').onclick=()=>{if(isDetailingWorkspace())void loadBuyerRequests()};
$('buyerDashboardOpenBookingPreview').onclick=()=>premiumNavigate('buyer-booking-preview');
$('buyerShortcutBookingPreview').onclick=()=>premiumNavigate('buyer-booking-preview');
$('buyerBookingPreviewRefresh').onclick=()=>loadBuyerBookingPreview();
$('buyerBookingPreviewMobileRefresh').onclick=()=>loadBuyerBookingPreview();
$('buyerClientReview').classList.add('hidden');
$('buyerBookingPreviewClose').onclick=()=>premiumNavigate('home');
$('buyerBookingPreviewPhone').onclick=()=>{$('buyerBookingPreviewShell').style.width='min(100%,390px)';$('buyerBookingPreviewFrame').style.height='980px'};
$('buyerBookingPreviewWide').onclick=()=>{$('buyerBookingPreviewShell').style.width='100%';$('buyerBookingPreviewFrame').style.height='1120px'};
$("buyerDashboardOpenInbox").onclick=()=>premiumNavigate("request-center");
$("buyerDashboardOpenSettings").onclick=()=>premiumNavigate("settings");
async function loadBuyerRequests(){
 if(!workspace||workspace.is_internal||buyerRequestBusy)return;buyerRequestBusy=true;
 $("buyerRequestCards").textContent=buyerText("Loading your bookings…","Cargando tus reservas…");
 try{
  const wsId=workspace.id;
  if(!document.body.dataset.leadsLoaded)await load();
  const data=await buyerRequestCall("list");
  if(!workspace||workspace.is_internal||workspace.id!==wsId)return;
  buyerRequests=Array.isArray(data.requests)?data.requests:[];
  renderBuyerDashboard();
  renderBuyerCustomers();
  buyerRequestSummaries();
  const previous=buyerSelectedRequest?.id;
  buyerSelectedRequest=null;
  buyerRenderRequestCards();
  const findEmail=$('buyerRequestSearch').value.toLowerCase().trim();
  const selection=buyerRequests.find(x=>x.id===previous)||buyerRequests.find(x=>findEmail&&String(x.customer_email||'').toLowerCase()===findEmail)||buyerRequests[0];
  if(selection)buyerOpenRequest(selection);
  else{$("buyerRequestDetailTitle").textContent=buyerText("Select a request or manual inquiry","Elige una solicitud o consulta manual");$("buyerRequestDetails").replaceChildren();$("buyerRequestNextAction").classList.add("hidden");$("buyerRequestReplyArea").classList.add("hidden")}
 }catch(e){
 const pending=String(e.message||'').includes('Booking system must be completed and delivered');
 if(isDetailingWorkspace()&&pending){
  $('buyerRequestCards').textContent=buyerText('Customer activity will appear after your Booking Page passes final delivery checks.','La actividad de los clientes aparecerá después de aprobar la entrega final.');
  $('buyerDashboardStatus').textContent=buyerText('Preparing your booking workflow · New requests will appear here once your system is delivered.','Preparando las reservas · Las solicitudes aparecerán cuando se entregue el sistema.');
 }else{
  $('buyerRequestCards').textContent=buyerText('Could not load requests: ','No se pudieron cargar las solicitudes: ')+e.message;
  $('buyerDashboardStatus').textContent=buyerText('Customer activity unavailable: ','Actividad no disponible: ')+e.message;
 }
}
 finally{buyerRequestBusy=false}
}
$("buyerRequestSearch").oninput=buyerRenderRequestCards;
$("buyerRequestType").onchange=buyerRenderRequestCards;
$("buyerRequestRefresh").onclick=loadBuyerRequests;
$("buyerRequestAction").onchange=buyerSetDefaultMessage;
$("buyerRequestBookingDate").onchange=()=>{if(buyerSelectedRequest&&$("buyerRequestAction").value==="booked")buyerSetDefaultMessage()};
$("buyerRequestBookingTime").onchange=()=>{if(buyerSelectedRequest&&$("buyerRequestAction").value==="booked")buyerSetDefaultMessage()};
$("buyerAddOtherInquiry").onclick=()=>{if(workspace&&!workspace.is_internal)edit(null)};
$("buyerInboxNewManual").onclick=()=>{if(workspace&&!workspace.is_internal)edit(null)};
async function buyerUpdateRequest(sendEmail){
 if(!buyerSelectedRequest||!workspace||workspace.is_internal)return;
 const id=buyerSelectedRequest.id,action=$("buyerRequestAction").value,message=$("buyerRequestMessage").value.trim();
 if(sendEmail&&!message){$("buyerRequestStatus").textContent=buyerText("Write the message first.","Primero escribe el mensaje.");return}
 if(sendEmail&&!confirm(buyerText("Send this real email to the customer?","¿Enviar este correo real al cliente?")))return;
 const b1=$("buyerRequestSave"),b2=$("buyerRequestSend");b1.disabled=true;b2.disabled=true;
 $("buyerRequestStatus").textContent=buyerText("Saving update…","Guardando actualización…");
 try{
  const result=await buyerRequestCall("update",{request_id:id,action,message,send_email:sendEmail,quote_amount:$("buyerRequestQuoteAmount").value,request_date:$("buyerRequestBookingDate").value,request_time:$("buyerRequestBookingTime").value});
  const status=result.email_sent?buyerText("Update saved. The email service accepted your message.","Actualización guardada. El servicio aceptó el correo."):
   sendEmail?buyerText("Status saved, but the message was not accepted for sending. Check the email before retrying.","Estado guardado, pero el correo no fue aceptado. Revisa antes de repetir."):
   buyerText("Status saved; no email was sent.","Estado guardado; no se envió correo.");
  $("buyerRequestStatus").textContent=status;
  if(result.warning)$("buyerRequestStatus").textContent+=" "+result.warning;
  await loadBuyerRequests();
  $("buyerRequestStatus").textContent=status+(result.warning?" "+result.warning:"");
 }catch(e){$("buyerRequestStatus").textContent=e.message}
 finally{b1.disabled=false;b2.disabled=false}
}
$("buyerRequestSave").onclick=()=>buyerUpdateRequest(false);
$("buyerRequestSend").onclick=()=>buyerUpdateRequest(true);

$("buyerShortcutPricing").onclick=()=>{if(workspace&&!workspace.is_internal)premiumNavigate("pricing")};
$("buyerShortcutAvailability").onclick=()=>{if(workspace&&!workspace.is_internal)premiumNavigate("availability")};
$("buyerShortcutAutomation").onclick=()=>{if(workspace&&!workspace.is_internal)premiumNavigate("buyer-followups")};
$("buyerHistoryFromAutomation").onclick=()=>{if(workspace&&!workspace.is_internal)premiumNavigate("emails")};
let view='pipeline';function setView(v){
 if(!workspace?.is_internal&&['owner-pages','owner-calendar','owner-build','owner-preview','owner-help'].includes(v))v='pipeline';if(workspace?.is_internal&&['buyer-followups','request-center'].includes(v))v='owner-pages';
 view=v;
 $('buyerBusinessShortcuts').classList.toggle('hidden',v!=='settings'||!!workspace?.is_internal);
 $('buyerEmailHealth').classList.toggle('hidden',v!=='buyer-followups'||!!workspace?.is_internal);
 document.body.classList.toggle('crm-isolated-view',!['pipeline','calendar','clients'].includes(v));document.body.classList.toggle('crm-followups-focus',v==='buyer-followups'&&!workspace?.is_internal);$('buyerFollowupsIntro').classList.toggle('hidden',v!=='buyer-followups'||!!workspace?.is_internal);$('ownerCalendarHub').classList.toggle('hidden',v!=='owner-calendar');
 const internal=!!workspace?.is_internal;
 const leadMode=['pipeline','calendar','clients','inbox','emails','request-center'].includes(v);
 document.body.classList.toggle('tle-owner-purchases',internal&&!leadMode);
 const ownerTitles={
  'owner-help':['TU GUÍA PERSONAL','Ayuda para ti'],
  'owner-pages':['MY PRIVATE ADMIN / CLIENT WORK','Clients & Purchases'],
  'pipeline':['MY PRIVATE ADMIN / OUTREACH','My Prospect Leads'],
  'calendar':['MY PRIVATE ADMIN / FOLLOW-UPS','Prospect Follow-up Calendar'],
  'clients':['MY PRIVATE ADMIN / SALES','Converted Prospects'],
  'inbox':['MY PRIVATE ADMIN / INQUIRIES','Website Inquiries'],
  'emails':['MY PRIVATE ADMIN / OUTREACH','My Outreach Emails'],
  'owner-calendar':['MY PRIVATE ADMIN / SCHEDULE','Client Calendar'],
  'owner-build':['MY PRIVATE ADMIN / DELIVERY','Client Booking Page Setup'],
  'owner-preview':['MY PRIVATE ADMIN / PREVIEW','Booking Page Preview'],
  'settings':['MY PRIVATE ADMIN / SETTINGS','Owner Settings'],
  'help':['HELP / FAQ','Help & FAQ'],
  'pricing':['BUYER WORKSPACE / REVIEW','Selected Buyer Pricing'],
  'availability':['BUYER WORKSPACE / REVIEW','Selected Buyer Availability']
 };
 const buyerTitles={
  'buyer-dashboard':['YOUR BUSINESS / OVERVIEW','Dashboard'],
  'pipeline':['YOUR BUSINESS / CUSTOMERS','Customer Inquiries'],
  'calendar':['YOUR BUSINESS / FOLLOW-UPS','Customer Follow-up Calendar'],
  'clients':['YOUR BUSINESS / CUSTOMERS','Customers'],
  'buyer-customers':['YOUR BUSINESS / CUSTOMERS','Customers'],
  'request-center':['YOUR BUSINESS / INBOX','Inbox'],
  'buyer-booking-preview':['YOUR BUSINESS / BOOKING PAGE','Booking Page Preview'],
  'emails':['YOUR BUSINESS / EMAIL','Customer Email History'],
  'buyer-followups':['YOUR BUSINESS / AUTOMATION','Automatic Follow-ups'],
  'pricing':['YOUR BUSINESS / SERVICES','Pricing & Services'],
  'availability':['YOUR BUSINESS / CALENDAR','Availability'],
  'settings':['YOUR BUSINESS / SETTINGS','Business Settings'],
  'help':['HELP / FAQ','Help & FAQ']
 };
 const [eyebrow,title]=(internal?ownerTitles:buyerTitles)[v]||['YOUR WORKSPACE','Overview'];
 $('mainEyebrow').textContent=eyebrow;$('mainHeading').textContent=title;
 const chosenSpanish=localStorage.getItem('tle_crm_language')==='es';
 $('globalSearch').textContent=internal?(chosenSpanish?'⌕ Buscar prospectos':'⌕ Search leads'):(chosenSpanish?'⌕ Buscar en bandeja':'⌕ Search Inbox');
 $('headerNew').textContent=internal?(chosenSpanish?'+ Nuevo prospecto':'+ New lead'):(chosenSpanish?'+ Añadir consulta':'+ Add inquiry');
 $('mobileNew').setAttribute('aria-label',internal?(chosenSpanish?'Añadir prospecto':'Add lead'):(chosenSpanish?'Añadir consulta':'Add inquiry'));
 $('quickIntro').textContent=internal
  ?'These are The Launch Era sales prospects—not customers of buyer cleaning businesses.'
  :'These are inquiries for your cleaning business—not The Launch Era sales leads.';
$('ownerBuilderHub').classList.toggle('hidden',v!=='owner-build');$('ownerPagesHub').classList.toggle('hidden',v!=='owner-pages');$('ownerPagePreviewHub').classList.toggle('hidden',v!=='owner-preview');$('availabilityHub').classList.toggle('hidden',v!=='availability');$('pricingHub').classList.toggle('hidden',v!=='pricing');$('ownerHelpHub').classList.toggle('hidden',v!=='owner-help'||!internal);$('helpHub').classList.toggle('hidden',v!=='help');$('settingsHub').classList.toggle('hidden',v!=='settings'&&v!=='buyer-followups');$('board').classList.toggle('hidden',v!=='pipeline');$('calendar').classList.toggle('hidden',v!=='calendar');$('clients').classList.toggle('hidden',v!=='clients');$('emailHub').classList.toggle('hidden',v!=='emails');$('inboundHub').classList.toggle('hidden',v!=='inbox');$('buyerBookingPreviewHub').classList.toggle('hidden',v!=='buyer-booking-preview');$('buyerRequestsHub').classList.toggle('hidden',v!=='request-center');$('buyerCustomersHub').classList.toggle('hidden',v!=='buyer-customers');$('buyerDashboardHub').classList.toggle('hidden',v!=='buyer-dashboard');if(v==='inbox')loadInbound();if(v==='emails')renderEmailHub();if(v==='settings'||v==='buyer-followups'){loadBuyerMail();if(v==='settings'){loadOwnerDeliveries();loadOwnerAiDeliveries()};}$('pipelineView').classList.toggle('active',v==='pipeline');$('calendarView').classList.toggle('active',v==='calendar');$('clientView').classList.toggle('active',v==='clients')} $('pipelineView').onclick=()=>setView('pipeline');$('calendarView').onclick=()=>setView('calendar');$('clientView').onclick=()=>setView('clients');$('exportCsv').onclick=()=>{const cols=['business','contact','email','source','language','stage','followup','notes','email_consent_status','email_consent_source','email_followup_enabled'];const esc=v=>'"'+String(v??'').replaceAll('"','""')+'"';const csv=[cols.join(','),...leads.map(x=>cols.map(k=>esc(x[k])).join(','))].join('\r\n');const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='command-center-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('guideAdd').onclick=()=>edit(null);
async function showFollowupHistory(leadId){
 const target=$('followupHistory');const es=localStorage.getItem('tle_crm_language')==='es';
 const label=(en,spanish)=>es?spanish:en;
 target.textContent=label('Checking follow-up activity…','Consultando actividad de seguimientos…');
 const createLine=(value)=>{const div=document.createElement('div');div.style.marginTop='7px';div.textContent=value;target.append(div)};
 try{
  const [history,stepsResult]=await Promise.all([
   db.from('tle_crm_email_events').select('event_type,created_at,details').eq('lead_id',leadId).in('event_type',['email_sent','email_failed','email_delivered','email_opened','email_clicked','email_replied']).order('created_at',{ascending:false}).limit(8),
   db.from('tle_crm_followup_steps').select('step_number,due_at,delivery_mode,status,completed_at').eq('lead_id',leadId).order('step_number',{ascending:true})
  ]);
  if(history.error)throw history.error;
  target.replaceChildren();
  const title=document.createElement('strong');title.textContent=label('Follow-up schedule','Calendario de seguimientos');target.append(title);
  if(stepsResult.error){createLine(label('Schedule could not be loaded.','No se pudo cargar el calendario.'))}
  else if(!stepsResult.data?.length){createLine(label('No follow-ups scheduled yet.','Todavía no hay seguimientos programados.'))}
  else {
   const states={scheduled:['Scheduled','Programado'],sent:['Sent','Enviado'],completed:['Completed','Completado'],skipped:['Skipped','Omitido'],cancelled:['Cancelled','Cancelado'],failed:['Failed','Fallido'],paused:['Paused','Pausado']};
   for(const step of stepsResult.data){
    const active=!!workspace?.automated_followups_enabled&&!!workspace?.reply_monitor_verified;const mode=step.delivery_mode==='manual'?label('Manual decision','Decisión manual'):active?label('Automatic — active','Automático — activo'):label('Automatic — setup required','Automático — requiere configuración');
    const state=states[step.status]||[String(step.status),String(step.status)];
    const when=step.due_at?new Date(step.due_at).toLocaleString(es?'es-US':'en-US'):'—';
    createLine('#'+step.step_number+' · '+mode+' · '+(es?state[1]:state[0])+' · '+when);
   }
  }
  const head=document.createElement('strong');head.textContent=label('Recorded email activity','Actividad de correos registrada');head.style.display='block';head.style.marginTop='12px';target.append(head);
  if(!history.data?.length){createLine(label('No email activity recorded yet.','Todavía no hay actividad de correos registrada.'))}
  else for(const item of history.data){
   const labels={email_sent:['Sent to provider','Enviado al proveedor'],email_failed:['Send failed','Envío fallido'],email_delivered:['Delivered','Entregado'],email_opened:['Opened','Abierto'],email_clicked:['Clicked','Clic registrado'],email_replied:['Replied','Respondió']};
   const pair=labels[item.event_type]||[item.event_type,item.event_type];
   createLine((es?pair[1]:pair[0])+' · '+new Date(item.created_at).toLocaleString(es?'es-US':'en-US'));
  }
 }catch(err){target.textContent=label('Email history unavailable: ','Historial no disponible: ')+err.message}
}
$('drawerClose').onclick=()=>{$('editor').close()};
const buyerStandardMessages={
 en:{
 "1":{subject:"Following up on your cleaning request",body:"Hi {{customer_name}},\n\nJust checking whether you still need help with your cleaning request. Reply to this email if you have questions or would like to move forward.\n\n{{business_name}}"},
 "2":{subject:"Still need help with your cleaning?",body:"Hi {{customer_name}},\n\nOne last check-in from our team. If you still need a cleaning or have questions about your estimate, feel free to reply.\n\n{{business_name}}"}
 },
 es:{
 "1":{subject:"Seguimiento a tu solicitud de limpieza",body:"Hola {{customer_name}},\n\nSolo queríamos saber si todavía necesitas ayuda con tu solicitud de limpieza. Responde a este correo si tienes preguntas o quieres continuar.\n\n{{business_name}}"},
 "2":{subject:"¿Todavía necesitas ayuda con tu limpieza?",body:"Hola {{customer_name}},\n\nTe escribimos una última vez. Si todavía necesitas ayuda o tienes preguntas sobre tu estimado, responde a este mensaje.\n\n{{business_name}}"}
 }
};
function parseBuyerDraft(json){try{const data=JSON.parse(json);return data&&typeof data==='object'&&!Array.isArray(data)?data:{}}catch{return {}}}
let buyerDraftEditingValues=null;
const buyerDetailingMessages={
 en:{
  "1":{subject:"Checking in on your car detailing request",body:"Hi {{customer_name}},\n\nJust checking in about your vehicle detailing request. If you have questions about the service, quote or scheduling, reply here.\n\n{{business_name}}"},
  "2":{subject:"Any questions about your car detailing?",body:"Hi {{customer_name}},\n\nOne last check-in. If you still want to move forward with detailing or have a question about your quote, we're happy to help.\n\n{{business_name}}"}
 },
 es:{
  "1":{subject:"Seguimiento de tu solicitud de detailing",body:"Hola {{customer_name}},\n\nQueríamos saber si deseas continuar con el servicio de detailing para tu vehículo. Responde aquí si tienes preguntas sobre el servicio, el precio o el horario.\n\n{{business_name}}"},
  "2":{subject:"¿Tienes preguntas sobre tu detailing?",body:"Hola {{customer_name}},\n\nTe escribimos por última vez por si deseas continuar con el detailing o tienes preguntas sobre tu cotización.\n\n{{business_name}}"}
 }
};
const buyerOtherServiceMessages={
 en:{"1":{subject:"Following up on your service request",body:"Hi {{customer_name}},\n\nJust checking in about your service request. Reply here if you have questions or would like to proceed.\n\n{{business_name}}"},"2":{subject:"Any questions about your service?",body:"Hi {{customer_name}},\n\nOne last follow-up. If you would like to continue or have questions about your quote, reply here.\n\n{{business_name}}"}},
 es:{"1":{subject:"Seguimiento de tu solicitud",body:"Hola {{customer_name}},\n\n¿Deseas continuar con tu solicitud? Responde a este correo para hablar sobre los detalles.\n\n{{business_name}}"},"2":{subject:"¿Necesitas ayuda con el servicio?",body:"Hola {{customer_name}},\n\nSi deseas continuar o tienes preguntas sobre tu cotización, responde aquí.\n\n{{business_name}}"}}
};
function buyerDraftText(){const lng=$('buyerDraftLanguage').value,step=$('buyerDraftStep').value;const catalog=isDetailingWorkspace()?buyerDetailingMessages:isOtherServiceWorkspace()?buyerOtherServiceMessages:buyerStandardMessages;return catalog[lng][step]}
function replaceBuyerTokens(raw,lead){
 const first=(lead?.contact||'').trim().split(/\s+/)[0]||'there';
 return String(raw||'').replaceAll('{{customer_name}}',first).replaceAll('{{business_name}}',workspace?.name||'Service Business');
}
function renderBuyerDraft(lead){
 if(!lead||workspace?.is_internal)return;
 const lang=$('buyerDraftLanguage').value,step=$('buyerDraftStep').value,defaults=buyerDraftText();
 const subjects=parseBuyerDraft(lead.personalized_email_subject),bodies=parseBuyerDraft(lead.personalized_email_body);
 $('buyerDraftSubject').value=subjects[lang]?.[step]||defaults.subject;
 $('buyerDraftBody').value=bodies[lang]?.[step]||defaults.body;
 updateBuyerPreview(lead);
 $('buyerDraftStatus').textContent='';
}
function updateBuyerPreview(lead){
 $('buyerDraftPreviewSubject').textContent=replaceBuyerTokens($('buyerDraftSubject').value,lead);
 $('buyerDraftPreviewBody').textContent=replaceBuyerTokens($('buyerDraftBody').value,lead);
}
$('buyerDraftStep').onchange=()=>{if(editing&&!workspace?.is_internal)renderBuyerDraft(editing)};
$('buyerDraftLanguage').onchange=()=>{if(editing&&!workspace?.is_internal)renderBuyerDraft(editing)};
$('buyerDraftSubject').oninput=()=>{if(editing)updateBuyerPreview(editing)};
$('buyerDraftBody').oninput=()=>{if(editing)updateBuyerPreview(editing)};
$('buyerDraftSave').onclick=async()=>{
 if(!editing||!workspace||workspace.is_internal)return;
 const button=$('buyerDraftSave');button.disabled=true;
 try{
  const lng=$('buyerDraftLanguage').value,step=$('buyerDraftStep').value;
  const subject=$('buyerDraftSubject').value.trim(),body=$('buyerDraftBody').value.trim();
  if(subject.length<3||subject.length>180||body.length<15||body.length>5000)throw Error('Add a valid subject and message.');
  const subjects=parseBuyerDraft(editing.personalized_email_subject),bodies=parseBuyerDraft(editing.personalized_email_body);
  subjects[lng]={...(subjects[lng]||{}),[step]:subject};
  bodies[lng]={...(bodies[lng]||{}),[step]:body};
  const patch={personalized_email_subject:JSON.stringify(subjects),personalized_email_body:JSON.stringify(bodies)};
  const out=await db.from('tle_crm_leads').update(patch).eq('workspace_id',workspace.id).eq('id',editing.id).select('id').single();
  if(out.error)throw out.error;
  Object.assign(editing,patch);
  $('buyerDraftStatus').textContent='✓ Saved. Automation stays as it was.';
 }catch(err){$('buyerDraftStatus').textContent='Could not save: '+err.message}
 finally{button.disabled=false}
};

function edit(x){editing=x||null;
 const customerView=!!workspace&&!workspace.is_internal;
 const head=$('editor').querySelector('.lead-editor-heading');
 if(head){
  head.querySelector('.eyebrow').textContent=customerView?buyerText('YOUR BUSINESS / CUSTOMER','TU NEGOCIO / CLIENTE'):'THE LAUNCH ERA / CONTACT';
  head.querySelector('h2').textContent=customerView?buyerText('Customer inquiry','Consulta del cliente'):'Lead details';
  head.querySelector('.muted').textContent=customerView?buyerText("Keep this customer's request and next action together.","Reúne aquí la solicitud del cliente y el siguiente paso."):'Everything about this relationship, in one place.';
 }
 showLeadTab('overview');const profile=$('leadProfileSummary');profile.replaceChildren();const badge=document.createElement('span');badge.className='lead-profile-badge';badge.textContent=x?(x.contact_decision==='yes'?(x.email_consent_status==='authorized'&&x.email_followup_enabled&&!blockedLead(x)?'Sí contactar · Email habilitado':'Sí contactar · Email pendiente'):x.contact_decision==='no'?'No contactar':blockedLead(x)?'Contact restrictions · Revisar':x.stage):(customerView?buyerText('New inquiry','Nueva consulta'):'New lead');const next=document.createElement('span');next.textContent=x&&emailBouncedByLead.has(x.id)?'Email bounced · '+new Date(emailBouncedByLead.get(x.id)).toLocaleDateString():x&&emailSentByLead.has(x.id)?'Last emailed · '+new Date(emailSentByLead.get(x.id)).toLocaleDateString():x?.followup?'Next follow-up · '+x.followup :'No recorded email — verify first';profile.append(badge,next);if(workspace?.is_internal&&x?.id){const insightsLink=document.createElement('a');insightsLink.href='./lead-insights.html?lead='+encodeURIComponent(x.id);insightsLink.textContent='◈ Problem, asset & personalized email →';insightsLink.style.cssText='display:block;font-size:12px;margin-top:8px;font-weight:700;color:#285d77';profile.append(insightsLink)}$('leadEmailSection').open=false;$('leadNotesSection').open=false;
 $('buyerDraftPanel').classList.toggle('hidden',!x||!workspace||workspace.is_internal);
 $('buyerDraftPanel').open=false;
 if(x&&!workspace.is_internal){$('buyerDraftStep').value='1';$('buyerDraftLanguage').value=x.language==='es'?'es':'en';renderBuyerDraft(x)}$('leadSaveStatus').textContent='';for(const k of ['business','contact','email','source','language','stage','followup','notes','email_consent_status','email_consent_source'])$('leadForm').elements[k].value=x?.[k]|| (k==='language'?'en':k==='stage'?'New':k==='email_consent_status'?'unknown':'');$('leadForm').elements.contact_decision.value=x?.contact_decision||'review';$('leadForm').elements.email_followup_enabled.checked=!!x?.email_followup_enabled;$('remove').classList.toggle('hidden',!x);$('emailComposer').classList.toggle('hidden',!(x&&x.email_consent_status==='authorized'&&x.email_followup_enabled&&x.email));const replyButton=$('markReplyReceived');replyButton.classList.toggle('hidden',!x||!!x.replied_at);replyButton.disabled=!x||!!x.replied_at;replyButton.textContent=localStorage.getItem('tle_crm_language')==='es'?'Marcar respuesta recibida — detener seguimientos':'Mark reply received — stop follow-ups';$('sendFollowup').disabled=!(x&&x.email?.trim()&&x.email_consent_status==='authorized'&&x.email_followup_enabled);$('followupStatus').textContent='';$('followupHistory').textContent=x?'Checking email history…':'';if(x)showFollowupHistory(x.id);$('followupPreview').classList.add('hidden');$('followupSubject').value='';$('followupBody').value='';$('editor').showModal()}
$('markReplyReceived').onclick=async()=>{if(!editing?.id)return;const es=localStorage.getItem('tle_crm_language')==='es';if(!confirm(es?'¿Confirmar que este contacto respondió? Se cancelarán los correos programados.':'Confirm this contact replied? Scheduled emails will be cancelled.'))return;const button=$('markReplyReceived');button.disabled=true;try{const {data,error}=await db.rpc('tle_crm_mark_lead_replied',{p_lead_id:editing.id});if(error||data!==true)throw Error(error?.message||'Could not record reply');editing.replied_at=new Date().toISOString();editing.email_followup_enabled=false;$('leadForm').elements.email_followup_enabled.checked=false;button.classList.add('hidden');$('sendFollowup').disabled=true;$('emailComposer').classList.add('hidden');await showFollowupHistory(editing.id);say(es?'Respuesta registrada. Seguimientos automáticos cancelados.':'Reply recorded. Automated follow-ups cancelled.');await load()}catch(e){button.disabled=false;say(e.message)}};$('prepareFollowup').onclick=()=>{const subject=$('followupSubject').value.trim(),body=$('followupBody').value.trim();if(subject.length<3||body.length<15){say('Enter a subject and a message of at least 15 characters.');return}const preview=$('followupPreview');preview.replaceChildren();const heading=document.createElement('strong');heading.textContent=subject;const content=document.createElement('p');content.textContent=body;const footer=document.createElement('small');footer.textContent='We respect your privacy. You can unsubscribe at any time. Preview only — no email sent.';preview.append(heading,content,footer);preview.classList.remove('hidden')};$('sendFollowup').onclick=async()=>{if(!editing||!editing.email?.trim()||editing.email_consent_status!=='authorized'||!editing.email_followup_enabled){say('Document the contact’s email permission and enable follow-up before sending.');return}const subject=$('followupSubject').value.trim(),body=$('followupBody').value.trim();if(subject.length<3||body.length<15){say('Write a subject and at least 15 characters of message first.');return}const approved=await new Promise(resolve=>{const modal=$('sendConfirm');$('sendRecipient').textContent=editing.email;modal.showModal();modal.addEventListener('close',()=>resolve(modal.returnValue==='yes'),{once:true})});if(!approved)return;say('Sending email to '+editing.email+'…');const button=$('sendFollowup');button.disabled=true;try{const {data:{session}}=await db.auth.getSession();if(!session)throw Error('Please sign in again.');const response=await fetch('https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-send-followup',{method:'POST',headers:{'content-type':'application/json','apikey':'sb_publishable_0TueitFYiRF3rAEMLMT8-w_FvbvY0rB','authorization':'Bearer '+session.access_token},body:JSON.stringify({lead_id:editing.id,subject,body})});const result=await response.json();if(!response.ok)throw Error(result.error||'Sending failed');say('✓ Email accepted by Resend for '+editing.email+'. Delivery status may update later.');await showFollowupHistory(editing.id);await loadEmailSummary();render()}catch(e){say('Email not sent: '+e.message);if(editing)await showFollowupHistory(editing.id)}finally{button.disabled=false}};$('quickDue').onclick=()=>{$('dueFilter').value='overdue';$('stageFilter').value='';render();$('board').scrollIntoView({behavior:'smooth'})};$('quickWaiting').onclick=()=>{$('stageFilter').value='Contacted';$('dueFilter').value='';render();$('board').scrollIntoView({behavior:'smooth'})};$('quickNew').onclick=()=>{$('stageFilter').value='New';$('dueFilter').value='';render();$('board').scrollIntoView({behavior:'smooth'})};$('quickAll').onclick=()=>{$('stageFilter').value='';$('dueFilter').value='';$('search').value='';render();$('board').scrollIntoView({behavior:'smooth'})};$('quickAdd').onclick=()=>edit(null);$('add').onclick=()=>edit(null);$('cancel').onclick=()=>$('editor').close();
$('leadForm').onsubmit=async e=>{e.preventDefault();const saveButton=e.target.querySelector('button[type=submit],button:not([type])');if(saveButton?.disabled)return;saveButton.disabled=true;$('leadSaveStatus').textContent='Saving lead…';try{let data=Object.fromEntries(new FormData(e.target));data.email_followup_enabled=!!e.target.elements.email_followup_enabled.checked;
if(workspace?.is_internal){
 if(confirmedOptOut(editing||{})&&data.contact_decision==='yes')throw Error('Recipient opted out. Do not override their preference.');
 data.research_only=!data.email||!/^\S+@\S+\.\S+$/.test(data.email.trim());
 if(data.contact_decision!==(editing?.contact_decision||'review'))data.contact_decision_updated_at=new Date().toISOString();
}else{delete data.contact_decision}
if(data.email_consent_status!=='authorized')data.email_followup_enabled=false;if(data.email_consent_status==='authorized'&&!data.email_consent_source?.trim())throw Error('Record the permission source before marking this contact authorized.');if(!data.followup)data.followup=null;data.workspace_id=workspace.id;let saved;if(editing)saved=await check(await db.from('tle_crm_leads').update(data).eq('id',editing.id).eq('workspace_id',workspace.id).select('id').single());else saved=await check(await db.from('tle_crm_leads').insert(data).select('id').single());$('editor').close();await load();say('✓ Lead saved successfully')}catch(err){$('leadSaveStatus').textContent='Could not save lead: '+err.message;console.error('CRM lead save failed',err)}finally{saveButton.disabled=false}};
$('remove').onclick=async()=>{if(!editing||!confirm('Delete this lead?'))return;try{await check(await db.from('tle_crm_leads').delete().eq('id',editing.id).eq('workspace_id',workspace.id));$('editor').close();await load()}catch(e){say(e.message)}};
function updateAnalytics(){const won=leads.filter(x=>x.stage==='Won').length;const sent=leads.filter(x=>emailSentByLead.has(x.id)).length;const today=new Date().toLocaleDateString('en-CA');$('analyticsConversion').textContent=leads.length?Math.round(100*won/leads.length)+'%':'0%';$('analyticsSent').textContent=String(sent);$('analyticsInbound').textContent=String(inboundRequests.length);$('analyticsOverdue').textContent=String(leads.filter(x=>x.followup&&x.followup<today&&x.stage!=='Won').length)}function refreshAlerts(){if(!workspace)return;updateAnalytics();const today=new Date().toLocaleDateString('en-CA');const due=leads.filter(x=>x.followup&&x.followup<=today&&x.stage!=='Won'&&!blockedLead(x));const count=inboundRequests.length+due.length;$('bellCount').textContent=String(count);const list=$('notificationList');list.replaceChildren();for(const x of inboundRequests.slice(0,20)){const p=document.createElement('p');p.textContent='New '+x.source_type+' request · '+(x.business_name||x.request_name||x.email||'Customer');list.append(p)}for(const x of due.slice(0,20)){const p=document.createElement('p');p.textContent='Follow-up due · '+x.business+' · '+x.followup;list.append(p)}if(!count)list.textContent='All caught up.'}async function loadStoredNotifications(){if(!workspace)return;const wsId=workspace.id;const {data,error}=await db.from('tle_crm_notifications').select('id,kind,title,body,created_at,read_at').eq('workspace_id',wsId).order('created_at',{ascending:false}).limit(50);if(!workspace||workspace.id!==wsId)return;if(error){console.warn('Notification loading failed',error.message);return}const unread=(data||[]).filter(n=>!n.read_at);$('bellCount').textContent=String(unread.length);const list=$('notificationList');list.replaceChildren();for(const n of data||[]){const row=document.createElement('div');row.className='inbound-item';const title=document.createElement('strong');title.textContent=(n.read_at?'':'● ')+n.title;const body=document.createElement('p');body.textContent=n.body+' · '+new Date(n.created_at).toLocaleString();row.append(title,body);if(!n.read_at){const btn=document.createElement('button');btn.type='button';btn.className='secondary';btn.textContent='Mark read';btn.onclick=async()=>{const {error}=await db.from('tle_crm_notifications').update({read_at:new Date().toISOString()}).eq('id',n.id).eq('workspace_id',workspace.id);if(error)say(error.message);else await loadStoredNotifications()};row.append(btn)}list.append(row)}if(!data?.length)list.textContent='All caught up.'}$('bellButton').onclick=()=>{$('notificationPanel').classList.toggle('hidden');if(!$('notificationPanel').classList.contains('hidden')){$('notificationPanel').scrollIntoView({behavior:'smooth'});loadStoredNotifications()}};setInterval(()=>{if(workspace)loadStoredNotifications()},45000);async function bootAfterPrivateEmailConfirmation(){
 // Redeem the one-time token inside the private Command Center; it never
 // appears in a URL query, analytics event, web-server request or email preview.
 const confirmation=new URLSearchParams(location.hash.replace(/^#/,''));
 const tokenHash=confirmation.get('token_hash'),type=confirmation.get('type');
 const splash=$('privateActivationSplash');
 const isPrivateActivation=tokenHash!==null;
 if(isPrivateActivation){
  splash.classList.remove('hidden');
  const isCBD=new URLSearchParams(location.search).get('app')==='cb-depot';
  $('paBrand').textContent=isCBD?'CB DEPOT · PRIVATE CLIENT ACCESS':'THE LAUNCH ERA · PRIVATE CLIENT ACCESS';
  $('paTitle').textContent='Opening your Command Center';
  history.replaceState(history.state,'',location.pathname+location.search);
 }
 let activationError='';
 if(isPrivateActivation){
  if(!/^(?:pkce_)?[a-f0-9]{56,64}$/i.test(tokenHash)||!['invite','magiclink'].includes(type)){
   activationError='This private link is incomplete. Request a new activation email from The Launch Era.';
  }else{
   try{
    const {data,error}=await db.auth.verifyOtp({token_hash:tokenHash,type});
    if(error||!data?.session)throw error||new Error('No session');
   }catch(error){
    activationError='This secure link has expired or has already been used. Please request a new activation email from The Launch Era.';
   }
  }
 }
 await boot();
 if(isPrivateActivation){
  if(activationError){
   $('paTitle').textContent='This link is no longer available';
   $('paMessage').textContent=activationError;
   $('paSpin').style.display='none';
   $('paReturn').style.display='inline-block';
   $('paReturn').onclick=()=>{splash.classList.add('hidden');};
   const status=$('authMessage');if(status)status.textContent=activationError;
  }else{
   splash.classList.add('hidden');
  }
 }
}
bootAfterPrivateEmailConfirmation();
