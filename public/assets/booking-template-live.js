/* The emailed private booking demo is the canonical template for purchased Booking Pages.
   No key = verified demo only. Valid released ?key = purchaser's branding, actual service catalog,
   authoritative pricing, available slots and real private Command Center backend. */
(async()=>{
"use strict";
const params=new URLSearchParams(location.search),key=params.get("key")||"";
const ownerPreview=params.get("owner_preview")==="1"&&!key;
if(!key&&!ownerPreview)return;
document.documentElement.classList.add("buyer-live-page");
// A real booking link must never silently behave like the email-verification demo.
document.documentElement.classList.add("buyer-live-loading");
const API="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/";
const $=id=>document.getElementById(id);
const session={model:null,service:null,validSlots:[],sending:false,language:params.get("lang")==="es"?"es":"en",requestCounter:0};
const tr=(en,es)=>session.language==="es"?es:en;
const money=n=>new Intl.NumberFormat(session.language==="es"?"es-US":"en-US",{style:"currency",currency:session.model?.currency==="CAD"?"CAD":"USD"}).format(Number(n)||0);
const categoryOf=item=>["commercial","residential","both"].includes(item?.category)?item.category:
 /office|commercial|retail|restaurant|salon|medical|warehouse|construction|janitorial|business|restroom|floor scrub|breakroom|after.hour/i.test(item?.name||"")?"commercial":
 /oven|fridge|refrigerator|baseboard|laundry|cabinet|bedroom/i.test(item?.name||"")?"residential":"both";
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const clean=x=>String(x??"").trim();
function alertCustomer(message){window.alert(message)}
async function endpoint(route,payload){
 if(ownerPreview)throw Error("Private previews cannot submit requests or access live booking APIs.");
 const resp=await fetch(API+route,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
 const data=await resp.json().catch(()=>({}));
 if(!resp.ok)throw new Error(data.error||tr("The booking service could not complete this request.","No se pudo completar esta solicitud."));
 return data
}
function liveFields(){
 for(const v of document.querySelectorAll(".verify"))v.hidden=true;
 for(const v of document.querySelectorAll(".consent"))v.hidden=true;
 document.querySelector(".top").textContent=tr("Book, request an estimate or ask for a quote.","Reserva, solicita un estimado o pide una cotización.");
 document.querySelector(".top").style.background="#2a6389";
 const done=$("done");done.querySelector(".back").hidden=true;
 done.querySelector("#trackerLink").hidden=true;
}
function brand(){
 const model=session.model,business=model.business_name||"Cleaning Business";
 document.title=business+" | "+tr("Book cleaning","Reserva una limpieza");
 $("leadName").textContent=business.toUpperCase();
 document.querySelector(".heroText h1").textContent=model.branding?.headline||tr("Cleaning made simple.","Tu limpieza, más sencilla.");
 const area=clean(model.branding?.service_area);
 if(area){
  let div=document.querySelector(".heroArea");
  if(!div){div=document.createElement("div");div.className="heroArea";document.querySelector(".heroText").append(div)}
  div.textContent=tr("Serving ","Atendemos ")+area
 }
 const src=clean(model.branding?.hero_image);
 if(/^https:\/\/[^\s"'<>]{10,1100}$/i.test(src))$("leadHero").style.backgroundImage="url("+JSON.stringify(src)+")";
 const logo=clean(model.branding?.logo_image);
 if(/^https:\/\/[^\s"'<>]{10,1100}$/i.test(logo)){
  const img=document.createElement("img");img.src=logo;img.alt=business+" logo";
  img.style.cssText="width:46px;max-height:46px;object-fit:contain;border-radius:9px;background:white;margin-bottom:7px";
  document.querySelector(".heroText").prepend(img);
 }
 const paragraph=document.createElement("p");paragraph.textContent=model.branding?.description||tr(
  "Choose a service or request custom pricing. We will email your confirmation.",
  "Elige un servicio o solicita precio personalizado. Te enviaremos la confirmación.");
 paragraph.className="muted";paragraph.style.cssText="margin:10px 0 16px;font-size:12px";
 document.querySelector("#main").prepend(paragraph);
 document.querySelector("#trackerLink").hidden=true;
}
function serviceButton(service,category){
 const b=document.createElement("button");b.type="button";b.className="service";
 const icon=document.createElement("span");icon.className="ico";icon.textContent=category==="commercial"?"🏢":"✨";
 const group=document.createElement("span"),name=document.createElement("b"),sub=document.createElement("span");sub.className="muted";
 name.textContent=service.name;sub.textContent=service.mode==="flat"?
  tr("Book now or review the flat price.","Reserva o revisa el precio fijo."):
  tr("Request a tailored estimate or quote.","Solicita un estimado o una cotización personalizada.");
 group.append(name,sub);
 const price=document.createElement("span");price.className="price";price.textContent=service.mode==="flat"?money(service.price):tr("Request quote","Cotizar");
 b.append(icon,group,price);
 b.onclick=()=>{
  session.service=service;state.serviceId=service.id;state.service=service.name;state.mode=service.mode;
  state.category=category;
  if(category==="commercial"){
   startCommercial(service.mode==="flat"?"book":service.mode==="estimate"?"estimate":"quote",service.name);
   state.serviceId=service.id;state.mode=service.mode;
   $("commercialEyebrow").textContent=service.mode==="flat"?tr("COMMERCIAL BOOKING","RESERVA COMERCIAL"):$("commercialEyebrow").textContent;
  }else if(service.mode==="flat"){
   startResidential(service.name,Number(service.price));state.serviceId=service.id;state.mode="flat";
  }else{
   startQuote(service.mode==="estimate"?"estimate":"quote");state.serviceId=service.id;state.service=service.name;state.mode=service.mode;
  }
  if(service.mode==="flat")renderAvailability();
 };
 return b;
}
function extraCheckbox(item,category){
 const label=document.createElement("label");label.className="choice";
 const box=document.createElement("input");box.type="checkbox";box.dataset.addonId=item.id;box.dataset.price=String(item.price||0);
 box.dataset.actualAddonName=item.name;const detail=document.createElement("span");detail.textContent=item.name+(item.price>0?" · +"+money(item.price):"");
 label.append(box,detail);return label
}
function addonsInto(root,category){
 root.replaceChildren();
 const addons=(session.model.addons||[]).filter(a=>a.active!==false&&(categoryOf(a)==="both"||categoryOf(a)===category));
 if(!addons.length){const p=document.createElement("p");p.className="muted";p.textContent=tr("No extra services published for this category.","No hay extras publicados en esta categoría.");root.append(p);return}
 for(const a of addons)root.append(extraCheckbox(a,category));
}
function catalog(){
 const homes=$("residentialServiceList"),commercial=$("commercialServiceList");homes.replaceChildren();commercial.replaceChildren();
 const services=(session.model.services||[]).filter(x=>x.active!==false);
 for(const service of services){
  const category=categoryOf(service);
  if(category==="residential"||category==="both")homes.append(serviceButton(service,"residential"));
  if(category==="commercial"||category==="both")commercial.append(serviceButton(service,"commercial"));
 }
 if(session.model.quote_policy!=="no_quotes"){
  const special={id:"special_request",name:tr("Other / Custom Cleaning","Otro / Limpieza personalizada"),mode:"quote",price:null};
  homes.append(serviceButton(special,"residential"));
  commercial.append(serviceButton(special,"commercial"));
 }
 if(!homes.querySelector(".service"))setCategory("commercial");
 else setCategory("residential");
 document.querySelector('[data-category="residential"]').disabled=!homes.querySelector(".service");
 document.querySelector('[data-category="commercial"]').disabled=!commercial.querySelector(".service");
 // Keep demo's base controls for its own pricing examples, but hide them for real buyers.
 const residentialOriginal=$("fridge").closest(".choices");
 residentialOriginal.hidden=true;const originalLabel=residentialOriginal.previousElementSibling;if(originalLabel)originalLabel.hidden=true;
 const area=document.createElement("div");area.className="choices";area.id="realResidentialAddons";
 const label=document.createElement("div");label.className="label";label.textContent=tr("OPTIONAL ADD-ONS","EXTRAS OPCIONALES");
 residentialOriginal.after(label,area);
 addonsInto(area,"residential");
 const quoteRoot=document.createElement("div");quoteRoot.className="choices";quoteRoot.id="realQuoteAddons";
 const originalQuote=document.querySelector('[data-quote-addon]').closest(".choices");originalQuote.hidden=true;
 originalQuote.after(quoteRoot);addonsInto(quoteRoot,"residential");
 const commercialRoot=$("commercialAddons");addonsInto(commercialRoot,"commercial");
 // Recurring discounts are buyer-controlled: don't advertise sample percentages.
 for(const opt of $("freq").options)opt.textContent=opt.textContent.replace(/\s+— save \d+%$/,"");
}
function includedExtras(){
 const screen=document.querySelector(".screen.on")?.id;
 const root=screen==="res"||screen==="resReview"?"#realResidentialAddons":screen==="quote"?"#realQuoteAddons":"#commercialAddons";
 return [...document.querySelectorAll(root+" input[data-addon-id]:checked")];
}
async function getSlotsFor(date,selectId){
 const request=++session.requestCounter;
 const select=$(selectId);select.replaceChildren();
 session.validSlots=[];
 if(!date)return;
 const p=document.createElement("option");p.value="";p.textContent=tr("Checking real availability…","Consultando disponibilidad…");select.append(p);
 try{
  const model=ownerPreview?{slots:["09:00","11:00","14:00"]}:await endpoint("tle-booking-flow-availability",{action:"public",booking_key:key,date});
  if(request!==session.requestCounter)return;
  session.validSlots=(model.slots||[]).filter(s=>/^(?:[01]\d|2[0-3]):(?:00|30)$/.test(s));
  select.replaceChildren();
  if(!session.validSlots.length){const missing=document.createElement("option");missing.value="";missing.textContent=tr("No availability — choose another date","No hay horario libre; elige otra fecha");select.append(missing);return}
  const opt=document.createElement("option");opt.value="";opt.textContent=tr("Select an available time","Selecciona un horario libre");select.append(opt);
  for(const slot of session.validSlots){const item=document.createElement("option");item.value=slot;const h=Number(slot.slice(0,2));item.textContent=(h%12||12)+":"+slot.slice(3)+(h<12?" AM":" PM");select.append(item)}
 }catch{select.replaceChildren();const opt=document.createElement("option");opt.value="";opt.textContent=tr("Could not verify availability — try again","No se pudo verificar; intenta otra vez");select.append(opt)}
}
function dateSetup(){
 const date=$("date");date.min=new Date().toISOString().slice(0,10);
 date.onchange=()=>getSlotsFor(date.value,"time");
 date.type="date";
 $("time").replaceChildren();
 for(const id of ["qdate","cdate"])$(id).min=date.min;
 const detail=document.createElement("div");detail.className="muted";detail.id="realSlotNotice";detail.textContent=tr(
  "Booking appointments are confirmed only at available times. Quote dates are preferences.",
  "Las reservas se confirman solo en horarios disponibles. En cotizaciones, son preferencias.");
 date.before(detail);
 const checkFlatCommercial=async()=>{
  if(state.category==="commercial"&&state.mode==="flat"){
   const day=$("cdate").value;
   const hint=$("commercialAvailabilityHint")||document.createElement("p");hint.id="commercialAvailabilityHint";hint.className="muted";
   hint.textContent=tr("Checking availability…","Consultando disponibilidad…");$("ctime").before(hint);
   if(!day)return;
   const select=document.createElement("select");select.className="field";select.id="commercialAvailableSlots";
   const existing=$("commercialAvailableSlots");if(existing)existing.remove();
   $("ctime").insertAdjacentElement("afterend",select);
   $("ctime").hidden=true;await getSlotsFor(day,select.id);
   select.onchange=()=>{$("ctime").value=select.value};
   hint.textContent=tr("Select an available appointment time.","Selecciona una hora disponible.");
  }else{
   const select=$("commercialAvailableSlots");if(select)select.remove();
   $("ctime").hidden=false;
  }
 };
 $("cdate").onchange=checkFlatCommercial;
 const originalStart=window.startCommercial;
 window.startCommercial=function(...args){originalStart(...args);state.serviceId=session.service?.id||null;state.mode=session.service?.mode||"quote";checkFlatCommercial()};
}
async function submit(which){
 if(session.sending)return;
 const route=which==="res"?"res":which==="quote"?"quote":"commercial";
 const isCommercial=route==="commercial";
 const isHomeFlat=route==="res",isCommercialFlat=isCommercial&&state.mode==="flat";
 const flat=isHomeFlat||isCommercialFlat;
 const prefix=route==="res"?"":route==="quote"?"q":"c";
 const name=$(prefix+"name").value.trim(),email=$(prefix+"email").value.trim().toLowerCase();
 if(!name||!validEmail(email)){alertCustomer(tr("Enter your name and a valid email address.","Escribe tu nombre y un correo válido."));return}
 const date=$(prefix+"date").value,time=$(prefix+"time").value;
 if(flat&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^(?:[01]\d|2[0-3]):(?:00|30)$/.test(time)||!session.validSlots.includes(time))){
  alertCustomer(tr("Choose a date and confirmed available time.","Elige fecha y un horario confirmado como disponible."));return
 }
 const extras=includedExtras();
 const details=isCommercial?$("cdetails").value.trim():route==="quote"?$("qdetails").value.trim():"";
 const estimateLabel=flat?money(Number(session.service.price)+extras.reduce((acc,x)=>acc+Number(x.dataset.price||0),0)):tr("Custom quote","Cotización personalizada");
 const body={
  booking_key:key,request_type:flat?"booking":"quote",request_intent:flat?"booking":state.intent,
  preferred_language:session.language,service_id:state.serviceId||session.service?.id||"special_request",
  service_name:session.service?.name||state.service,
  selected_addon_ids:extras.map(x=>x.dataset.addonId),extras:extras.map(x=>x.dataset.actualAddonName),
  frequency:route==="res"?$("freq").value:isCommercial?$("cfreq").value:"One time",
  property_type:isCommercial?$("ctype").value:route==="quote"?$("qtype").value:state.home,
  square_footage:isCommercial?$("csize").value:route==="quote"?$("qsize").value:"",
  bedrooms:route==="res"?$("beds").value:"",bathrooms:route==="res"?$("baths").value:"",
  customer_name:name,customer_email:email,
  customer_phone:route==="res"?$("phone").value:route==="quote"?$("qphone").value:$("cphone").value,
  service_address:route==="res"?$("serviceAddress").value:route==="quote"?$("qaddress").value:$("caddress").value,
  notes:route==="res"?["ZIP "+$("zip").value,details].filter(Boolean).join(" · "):details,
  requested_date:date,requested_time:time,source:"booking_page",estimate_display:estimateLabel
 };
 if(ownerPreview){show("done",tr("Private preview only","Solo vista previa privada"),"DEMO");$("done").querySelector("h2").textContent=tr("No request sent","No se envió ninguna solicitud");$("done").querySelector("p").textContent=tr("This is the buyer’s design preview. No booking, email or charge was created.","Esta es una vista previa del diseño de la compradora. No se generó reserva, correo ni cobro.");return}
 const b=document.querySelector(".screen.on .next"),prior=b?.textContent;
 session.sending=true;if(b){b.disabled=true;b.textContent=tr("Sending…","Enviando…")}
 try{
  const response=await endpoint("tle-booking-flow-inquiry",body);
  show("done",response.booking_confirmed?tr("Booking confirmed!","¡Reserva confirmada!"):
    state.intent==="estimate"?tr("Estimate request received","Estimado solicitado"):tr("Quote request received","Cotización solicitada"),"✓");
  $("done").querySelector("h2").textContent=response.booking_confirmed?
    tr("Your appointment is booked!","¡Tu cita está confirmada!"):tr("Your request was received.","Recibimos tu solicitud.");
  $("done").querySelector("p").textContent=tr(
   "We've recorded your request. Check your email and Promotions or Spam for the business's confirmation.",
   "Guardamos tu solicitud. Revisa el correo y las carpetas Promociones o Spam para la confirmación.");
 }catch(err){alertCustomer(err.message||tr("Could not send this request.","No se pudo enviar."))}
 finally{session.sending=false;if(b){b.disabled=false;b.textContent=prior}}
}
function activateRealSubmission(){
 window.requireVerified=()=>true;
 window.reviewResidential=function(){
  if(!state.home){alertCustomer(tr("Choose a property type first.","Primero elige un tipo de propiedad."));return}
  const addon=includedExtras(),price=Number(session.service.price)+addon.reduce((a,x)=>a+Number(x.dataset.price||0),0);
  state.estimate=money(price);
  $("resSummary").replaceChildren();
  const rows=[["Service",state.service],["Property",state.home],["Bedrooms", $("beds").value],["Bathrooms", $("baths").value],["Frequency",$("freq").value],["Preferred date",$("date").value],["Selected time",$("time").value],["Published flat price",state.estimate]];
  for(const [label,value] of rows){const row=document.createElement("div");row.className="row";const a=document.createElement("span"),b=document.createElement("b");a.textContent=label;b.textContent=value;row.append(a,b);$("resSummary").append(row)}
  $("resReview").querySelector(".note").textContent=tr(
   "The booking will be confirmed only if this time is still available when you submit. No payment is collected.",
   "Se confirmará únicamente si el horario sigue libre al enviar la solicitud. No se realiza ningún cobro.");
  show("resReview",tr("Review your booking","Revisa tu reserva"),"REVIEW");
 };
 window.submitResidential=()=>submit("res");
 window.submitQuote=()=>submit("quote");
 window.submitCommercial=()=>submit("commercial");
}
try{
 const model=ownerPreview?await new Promise((resolve,reject)=>{
  const guard=setTimeout(()=>reject(Error("Owner preview did not receive account data.")),12000);
  window.addEventListener("message",function listener(event){
   if(event.origin!=="https://the-launch-era-crm.dailinsegura17.workers.dev")return;
   if(event.data?.type!=="TLE_OWNER_BOOKING_PREVIEW"||!event.data?.config)return;
   window.removeEventListener("message",listener);clearTimeout(guard);
   resolve(event.data.config);
  })
 }):await endpoint("tle-booking-flow-pricing",{action:"public",booking_key:key});
 if(!model?.services?.length)throw Error("No published services");
 session.model=model;
 if(!ownerPreview&&params.get("lang")!=="en"&&params.get("lang")!=="es"&&model.language==="es"){
  params.set("lang","es");location.replace(location.pathname+"?"+params.toString());return
 }
 if(ownerPreview)session.language=model.language==="es"?"es":"en";
 liveFields();brand();catalog();dateSetup();activateRealSubmission();
 if(ownerPreview){
  document.querySelector(".top").textContent=tr("OWNER DESIGN PREVIEW · NOTHING IS SENT","VISTA PREVIA DE DISEÑO · NO SE ENVÍA NADA");
  document.querySelector(".top").style.background="#213f58";
  $("done").querySelector("h2").textContent=tr("This is a private preview","Esta es una vista previa privada");
  $("done").querySelector("p").textContent=tr("No real emails, bookings or payments.","No hay correos, reservas ni pagos reales.");
  const note=$("realSlotNotice");if(note)note.textContent=tr(
   "Sample times for design review only. Verify actual working hours in Availability before delivery.",
   "Horarios de ejemplo para revisar el diseño. Confirma las horas reales en Disponibilidad antes de entregar.");
  for(const btn of document.querySelectorAll(".screen .next")){btn.textContent=tr("Preview only — no sending","Solo vista previa — sin envío");}
 }
 document.documentElement.classList.remove("buyer-live-loading");
 $("leadHero").style.opacity="1";
}catch(err){
 document.querySelector(".screen.on").replaceChildren();
 document.documentElement.classList.remove("buyer-live-loading");
 const h=document.createElement("h2");h.textContent=tr("Booking Page unavailable","Página de reservas no disponible");
 const p=document.createElement("p");p.className="muted";p.textContent=tr(
  "The business has not finished setting up this Booking Page. Please contact them directly.",
  "El negocio todavía no ha terminado de configurar esta página. Comunícate directamente.");
 document.querySelector(".screen.on").append(h,p);
 $("leadHero").style.opacity="1";console.error("Buyer Booking Page config could not load",String(err).slice(0,150));
}
})();
