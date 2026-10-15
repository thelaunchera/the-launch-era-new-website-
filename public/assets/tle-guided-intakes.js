/* TLE guided intake: selected prices are owner-supplied; publication requires explicit review. */
(()=>{"use strict";
 const pick=(es,a,b)=>es?b:a;
 const node=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x};
 const money=v=>{if(!String(v).trim())return null;const n=Number(v);return Number.isFinite(n)&&n>0&&n<=100000?Math.round(n*100)/100:null};
 const makePanel=(parent,es,a,b,tipA,tipB)=>{const x=node("section",undefined,"tle-guided-panel");x.append(node("h3",pick(es,a,b)),node("p",pick(es,tipA,tipB)));parent.append(x);return x};
 const check=(parent,es,options,group)=>{const grid=node("div",undefined,"tle-guided-options");parent.append(grid);
  for(const [k,a,b,on] of options){const label=node("label",undefined,"tle-guided-option"),x=node("input");x.type="checkbox";x.checked=!!on;x.value=k;x.name="tle_pick_"+group+"_"+k;label.append(x,node("span",pick(es,a,b)));grid.append(label)}
  return()=>[...grid.querySelectorAll("input:checked")].map(x=>x.value);
 };
 const input=(parent,es,a,b,type="text")=>{const label=node("label",undefined,"tle-guided-field"),field=node("input");label.append(node("span",pick(es,a,b)));field.type=type;if(type==="number"){field.min="0";field.max="100000";field.step=".01";field.inputMode="decimal"}label.append(field);parent.append(label);return field};
 const select=(parent,es,a,b,options)=>{const label=node("label",undefined,"tle-guided-field"),field=node("select");label.append(node("span",pick(es,a,b)));for(const [value,en,sp] of options){const option=node("option",pick(es,en,sp));option.value=value;field.append(option)}label.append(field);parent.append(label);return field};
 const services=[
 ["standard","Standard cleaning","Limpieza estándar"],["deep","Deep cleaning","Limpieza profunda"],
 ["move","Move-in / move-out","Limpieza de mudanza"],["office","Office cleaning","Limpieza de oficinas"],
 ["rental","Vacation rental cleaning","Limpieza de alquileres"],["commercial","Commercial cleaning","Limpieza comercial"]];
 const byType={cleaning:services,detailing:[["interior","Interior detailing","Detallado interior"],["exterior","Exterior detailing","Detallado exterior"],["full","Full detailing","Detallado completo"],["mobile","Mobile detailing","Detallado a domicilio"]],other:[["basic","Standard service","Servicio estándar"],["premium","Premium service","Servicio prémium"],["special","Special job","Trabajo especial"]]};
 const factors=[["size","Property or job size","Tamaño de la propiedad"],["rooms","Bedrooms and bathrooms","Cuartos y baños"],["condition","Property condition","Condición de la propiedad"],["frequency","Service frequency","Frecuencia"],["travel","Distance and ZIP code","Distancia y código postal"],["extras","Add-ons","Extras"]];
 const css="<style>.tle-guided-panel{background:#f2f8fc;border:1px solid #bfd9e8;border-radius:17px;margin:15px 0;padding:15px;color:#191919}.tle-guided-panel h3{font:700 17px/1.25 Prompt,Arial,sans-serif;margin:0 0 7px}.tle-guided-panel>p{color:#456273;font-size:12px;line-height:1.5;margin:0 0 10px}.tle-guided-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0}.tle-guided-option{display:flex!important;align-items:center;gap:8px;border:1px solid #bcd5e5;background:white;border-radius:12px;padding:11px 9px;min-width:0;font:600 12px/1.35 Arial,sans-serif!important;cursor:pointer;margin:0!important}.tle-guided-option:has(input:checked){background:#e6f4ff;border-color:#79acce}.tle-guided-option input{width:18px!important;min-width:18px;height:18px!important;margin:0!important;padding:0!important;accent-color:#347caa}.tle-guided-field{display:block!important;margin:12px 0!important;font:700 12px Arial,sans-serif!important}.tle-guided-field span{display:block;margin-bottom:6px}.tle-guided-field input,.tle-guided-field select{display:block;width:100%;min-height:44px;padding:10px 12px;background:white;color:#191919;border:1px solid #b8d0de;border-radius:10px;font:16px Arial,sans-serif}.tle-guided-row{border-top:1px solid #c1d9e9;padding:12px 0}.tle-guided-row>strong{font-size:13px}.tle-guided-range{display:grid;grid-template-columns:1fr 1fr;gap:10px}.tle-guided-panel [hidden],.tle-guided-row [hidden]{display:none!important}@media(max-width:350px){.tle-guided-options,.tle-guided-range{grid-template-columns:1fr}}@media(min-width:600px){.tle-guided-options{grid-template-columns:repeat(3,minmax(0,1fr))}}</style>";
 document.head.insertAdjacentHTML("beforeend",css);
 function mountAI({one,two,es,servicesField,goalsField}){
  const main=makePanel(one,es,"Which services do you offer?","¿Qué servicios ofreces?","Tap the services you provide. No technical knowledge needed.","Marca los servicios que ofreces. No necesitas conocimientos técnicos.");
  const readServices=check(main,es,services,"ai_services");
  const extra=input(main,es,"Another service (optional)","Otro servicio (opcional)");
  servicesField.querySelector("label").textContent=pick(es,"More service details (optional)","Más detalles de tus servicios (opcional)");servicesField.querySelector("textarea").required=false;
  const booking=makePanel(two,es,"AI Booking · what should it do?","IA de reservas · ¿qué debe hacer?","Choose tasks. Custom bookings still need business approval.","Elige funciones. Las reservas especiales necesitan aprobación.");
  const readTasks=check(booking,es,[["questions","Answer service questions","Responder preguntas",true],["choose","Help choose a service","Ayudar a elegir el servicio"],["booking","Collect booking requests","Recibir solicitudes"],["pricing","Explain approved prices","Explicar precios aprobados"],["human","Send special requests to a person","Pasar casos especiales a una persona"]],"booking_tasks");
  const policy=select(booking,es,"How should it handle pricing?","¿Cómo debe manejar los precios?",[["none","Ask the customer to request a quote","Pedir que soliciten cotización"],["fixed","Share fixed prices I approve","Compartir precios fijos aprobados"],["estimate","Share an approximate range","Compartir un rango aproximado"],["both","Both approved fixed prices and ranges","Precios fijos y rangos aprobados"]]);
  const fixed=node("div");booking.append(fixed);
  const fixedService=input(fixed,es,"Service with a fixed price","Servicio con precio fijo");
  const fixedAmount=input(fixed,es,"What do you charge? · $","¿Cuánto cobras? · $","number");
  const fixedPublic=select(fixed,es,"May AI show this price?","¿Puede la IA mostrar este precio?",[["no","No — let me review first","No — primero lo reviso"],["yes","Yes — I approve this price","Sí — apruebo este precio"]]);
  const estimated=node("div");booking.append(estimated);
  const estimatedService=input(estimated,es,"Service requiring an estimate","Servicio que requiere estimado");
  const low=input(estimated,es,"Typically from · $","Normalmente desde · $","number");
  const high=input(estimated,es,"Typically up to · $","Normalmente hasta · $","number");
  const estimatePublic=select(estimated,es,"Can AI share this approximate range?","¿Puede la IA compartir este rango aproximado?",[["no","No — review with me first","No — quiero revisarlo antes"],["yes","Yes — clearly label it not final","Sí — aclarando que no es final"]]);
  const syncPrice=()=>{fixed.hidden=!["fixed","both"].includes(policy.value);estimated.hidden=!["estimate","both"].includes(policy.value)};policy.addEventListener("change",syncPrice);syncPrice();
  const follow=makePanel(two,es,"AI Follow-Up · when to reach out?","IA de seguimiento · ¿cuándo contactar?","Only contact people who opted in; stop on reply, decline or unsubscribe.","Solo contactar a quienes lo autorizaron; parar si responden, rechazan o cancelan la suscripción.");
  const triggers=check(follow,es,[["quote","After a quote is sent","Después de enviar cotización",true],["inquiry","After an unanswered inquiry","Después de una consulta sin respuesta"],["incomplete","After an unfinished booking","Después de reserva incompleta"],["completed","After a completed service","Después de un servicio completado"]],"follow_triggers");
  const timing=select(follow,es,"First follow-up","Primer seguimiento",[["24","After 24 hours","Después de 24 horas"],["48","After 48 hours","Después de 48 horas"],["72","After 3 days","Después de 3 días"],["manual","Only after my approval","Solo con mi aprobación"]]);
  const sending=select(follow,es,"Who approves messages?","¿Quién aprueba los mensajes?",[["owner","I review each message","Yo reviso cada mensaje"],["rules","After I approve the sending rules","Después de aprobar reglas de envío"]]);
  goalsField.hidden=true;goalsField.querySelector("select").required=false;
  let plan="ai-business";const setPlan=x=>{plan=x;booking.hidden=x==="ai-followup";follow.hidden=x==="ai-booking"};
  const getServices=()=>[...readServices().map(k=>services.find(x=>x[0]===k)).filter(Boolean).map(x=>pick(es,x[1],x[2])),extra.value.trim(),servicesField.querySelector("textarea").value.trim()].filter(Boolean).join(", ").slice(0,700);
  const values=()=>({version:1,source:"paid_ai_intake",production_status:"pending_agency_review",plan,service_codes:readServices(),
   booking:plan==="ai-followup"?null:{tasks:readTasks(),price_policy:policy.value,fixed_service:fixedService.value.trim().slice(0,100),fixed_amount:money(fixedAmount.value),fixed_public_approved:fixedPublic.value==="yes",estimate_service:estimatedService.value.trim().slice(0,100),estimate_min:money(low.value),estimate_max:money(high.value),estimate_public_approved:estimatePublic.value==="yes",custom_quote_requires_owner_approval:true,auto_confirm:false},
   followup:plan==="ai-booking"?null:{triggers:triggers(),delay_hours:timing.value,sending_policy:sending.value,consent_required:true,stop_on_reply:true,stop_on_decline:true,stop_on_unsubscribe:true}});
  function validate(){if(!getServices()){alert(pick(es,"Choose at least one service.","Selecciona al menos un servicio."));return false}
   const b=values().booking;if(b){if(["fixed","both"].includes(b.price_policy)&&b.fixed_public_approved&&(!b.fixed_service||b.fixed_amount===null)){alert(pick(es,"Enter your actual fixed price, or choose owner review.","Escribe tu precio fijo real, o elige revisión antes de mostrarlo."));return false}
   if(["estimate","both"].includes(b.price_policy)&&b.estimate_min!==null&&b.estimate_max!==null&&b.estimate_max<b.estimate_min){alert(pick(es,"The maximum estimate must be greater than the minimum.","El estimado máximo debe ser mayor que el mínimo."));return false}
   if(["estimate","both"].includes(b.price_policy)&&b.estimate_public_approved&&(!b.estimate_service||b.estimate_min===null)){alert(pick(es,"Add an approximate starting price or ask for owner review.","Añade el estimado inicial o selecciona revisión."));return false}}
   return true}
  return{setPlan,getServices,values,validate};
 }
 function mountBooking({form,es}){
  const category=form.querySelector("#businessCategory"),style=form.querySelector("[name=pricing_style]");
  const flat=form.querySelector("#mainFlatServices"),estimate=form.querySelector("#mainEstimateServices"),generic=form.querySelector("[name=services]");
  if(!category||!style||!flat||!estimate||!generic)return;
  const base=makePanel(style.closest(".full"),es,"Choose services and prices","Elige servicios y precios","Pick each service, then choose fixed price, approximate estimate, or custom quote.","Marca tus servicios y elige precio fijo, estimado aproximado o cotización.");
  const choicesBox=node("div");base.append(choicesBox);
  const other=input(base,es,"Another service (optional)","Otro servicio (opcional)");
  const entries=node("div");base.append(entries);
  const fixedVisible=select(base,es,"Show fixed prices on the public Booking Page?","¿Mostrar precios fijos en la Booking Page?",[["no","Not yet — I want to review first","Todavía no — quiero revisarlos antes"],["yes","Yes, only my confirmed amounts","Sí, solo importes confirmados"]]);
  fixedVisible.id="tleFixedPriceVisibility";
  const estimateVisible=select(base,es,"Show approximate estimates to customers?","¿Mostrar estimados aproximados a clientes?",[["no","No — owner review first","No — revisión primero"],["yes","Yes — clearly marked not final","Sí — indicando que no son finales"]]);
  estimateVisible.id="tleEstimatePriceVisibility";
  const factorPane=makePanel(base,es,"What changes your estimate?","¿Qué cambia tus estimados?","Tap all that apply; no final prices will be invented.","Marca los factores; no se inventarán precios finales.");
  const getFactors=check(factorPane,es,factors,"estimate_factors");
  let read=()=>[],rows=new Map(),active=[];
  function render(){
   const list=byType[category.value]||byType.other;
   active=read().map(k=>list.find(x=>x[0]===k)).filter(Boolean).map(x=>({key:x[0],name:pick(es,x[1],x[2])}));
   if(other.value.trim())active.push({key:"other",name:other.value.trim().slice(0,85)});
   const ids=new Set(active.map(x=>x.key));for(const [k,r] of rows)if(!ids.has(k)){r.wrap.remove();rows.delete(k)}
   for(const item of active){if(!rows.has(item.key)){
    const wrap=node("div",undefined,"tle-guided-row");wrap.append(node("strong",item.name));
    const mode=select(wrap,es,"How do you charge?","¿Cómo cobras?",[["quote","I prepare a custom quote","Preparo cotización personalizada"],["fixed","Fixed price","Precio fijo"],["estimate","Approximate estimate","Estimado aproximado"]]);
    const fp=node("div");wrap.append(fp);const amount=input(fp,es,"Your fixed price · $","Precio fijo · $","number");
    const range=node("div",undefined,"tle-guided-range");wrap.append(range);
    const min=input(range,es,"Usually from · $","Normalmente desde · $","number"),max=input(range,es,"Usually up to · $","Normalmente hasta · $","number");
    const sync=()=>{fp.hidden=mode.value!=="fixed";range.hidden=mode.value!=="estimate"};mode.addEventListener("change",sync);sync();
    entries.append(wrap);rows.set(item.key,{wrap,mode,amount,min,max});
   }else rows.get(item.key).wrap.querySelector("strong").textContent=item.name}
  }
  function reset(){choicesBox.replaceChildren();read=check(choicesBox,es,byType[category.value]||byType.other,"booking_services");choicesBox.querySelectorAll("input").forEach(x=>x.addEventListener("change",render));rows.forEach(r=>r.wrap.remove());rows.clear();render()}
  reset();category.addEventListener("change",reset);other.addEventListener("input",render);
  // Keep legacy fields for server-side price-catalog seeding; guided fields are source of truth.
  flat.closest("#cleaningMainServices").style.display="none";generic.closest("#genericServicesBlock").style.display="none";generic.required=false;
  category.addEventListener("change",()=>{generic.required=false;flat.closest("#cleaningMainServices").style.display="none";generic.closest("#genericServicesBlock").style.display="none"});
  const values=()=>({version:1,source:"booking_page_intake",production_status:"pending_agency_review",fixed_price_public_approved:fixedVisible.value==="yes",estimate_public_approved:estimateVisible.value==="yes",custom_quotes_require_review:true,auto_confirm:false,estimate_factors:getFactors(),
   services:active.map(item=>{const r=rows.get(item.key);return {name:item.name,mode:r.mode.value,fixed_price:money(r.amount.value),estimate_min:money(r.min.value),estimate_max:money(r.max.value)}})});
  function validate(){const v=values();if(!v.services.length){alert(pick(es,"Choose at least one service.","Selecciona al menos un servicio."));return false}
   for(const s of v.services){if(s.mode==="fixed"&&s.fixed_price===null){alert(pick(es,"Enter the price you actually charge for "+s.name+" or switch to a quote.","Indica el precio real de "+s.name+" o selecciona cotización."));return false}
    if(s.mode==="estimate"&&s.estimate_min!==null&&s.estimate_max!==null&&s.estimate_max<s.estimate_min){alert(pick(es,"Check the estimate range for "+s.name+".","Revisa el rango estimado de "+s.name+"."));return false}
    if(s.mode==="estimate"&&v.estimate_public_approved&&s.estimate_min===null){alert(pick(es,"To display estimates, add a starting price or choose not to display them.","Para mostrar estimados, indica un precio inicial o selecciona no mostrarlos."));return false}}
   return true}
  function apply(){const v=values(),f=[],e=[],g=[];for(const s of v.services){const label=s.name.replace(/[\r\n]/g," ").slice(0,85);
   if(s.mode==="fixed"){const x=label+" — $"+s.fixed_price;f.push(x);g.push(x)}
   else{const x=label+" — "+(s.mode==="estimate"&&s.estimate_min!==null?"from $"+s.estimate_min+" (estimate only)":"custom quote");e.push(x);g.push(x)}}
   flat.value=f.join("\n");estimate.value=e.join("\n");generic.value=g.join("\n");
   const factorsInput=form.querySelector("[name=quote_pricing_factors]");if(factorsInput)factorsInput.value=("Selected estimate factors: "+v.estimate_factors.join(", ")).slice(0,4000).trim();
   return v}
  return{values,validate,apply};
 }
 function mountBundleAI({form,es,plan}){
  const host=form.querySelector("#tleBundleAiIntake");if(!host)return null;
  const b=makePanel(host,es,"Your booking assistant","Tu asistente de reservas",
    "This AI uses the service prices you entered above. Nothing is activated before review.",
    "Esta IA usa los precios que escribiste arriba. Nada se activa antes de la revisión.");
  const bTasks=check(b,es,[["questions","Answer service questions","Responder preguntas",true],["choose","Help customers choose a service","Ayudar a elegir servicio"],["booking","Collect booking requests","Recibir solicitudes"],["pricing","Explain my approved prices only","Explicar solo precios aprobados"],["handoff","Escalate special requests","Escalar solicitudes especiales"]],"bundle_booking");
  const bPolicy=select(b,es,"What can the assistant say about prices?","¿Qué puede decir sobre los precios?",
    [["none","Only offer a quote request","Solo ofrecer solicitud de cotización"],
    ["approved","Only prices I approve in my Command Center","Solo precios aprobados en mi Command Center"],
    ["approximate","Approved approximate estimates, not final totals","Estimados aproximados aprobados, no montos finales"]]);
  const follow=makePanel(host,es,"Your follow-up assistant","Tu asistente de seguimiento",
    "Only contacts who consented can be messaged. Conversations stop on reply, decline or unsubscribe.",
    "Solo mensajes a personas que lo autorizaron. Se detiene si responden, rechazan o se dan de baja.");
  const triggers=check(follow,es,[["quote","After sending a quote","Después de enviar cotización",true],["inquiry","After an unanswered inquiry","Después de una consulta sin respuesta"],["incomplete","After incomplete booking","Después de reserva incompleta"],["completed","After a completed service","Después de un servicio terminado"]],"bundle_followup");
  const timing=select(follow,es,"First follow-up","Primer seguimiento",[["24","24 hours","24 horas"],["48","48 hours","48 horas"],["72","3 days","3 días"],["manual","Manual approval","Aprobación manual"]]);
  const policy=select(follow,es,"Sending approval","Aprobación para enviar",[["owner","I approve every message","Yo apruebo cada mensaje"],["rules","After I approve the automation rules","Después de aprobar las reglas"]]);
  b.hidden=plan==="ai-followup";follow.hidden=plan==="ai-booking";
  const values=()=>({version:1,source:"paid_booking_ai_bundle",plan,production_status:"pending_agency_review",
    booking:plan==="ai-followup"?null:{tasks:bTasks(),price_policy:bPolicy.value,custom_quotes_require_owner_approval:true,auto_confirm:false},
    followup:plan==="ai-booking"?null:{triggers:triggers(),delay_hours:timing.value,sending_policy:policy.value,consent_required:true,stop_on_reply:true,stop_on_decline:true,stop_on_unsubscribe:true}});
  return{values};
 }
 window.TLEGuidedIntakes={mountAI,mountBooking,mountBundleAI};
})();