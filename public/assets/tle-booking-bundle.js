(()=>{
"use strict";
const root=document.querySelector("[data-tle-bundle]");
if(!root)return;
const qs=new URLSearchParams(location.search),es=qs.get("lang")==="es"||(!qs.has("lang")&&(document.documentElement.lang||"").startsWith("es"));
const url=new URLSearchParams({offer:"booking-flow",lang:es?"es":"en"});
// Smart Welcome visitors arrive to a joint activation with AI Booking preselected.
// Other visitors retain the original booking-only default and can change plans freely.
const autoSelectAI=qs.get("bundle")==="ai-booking"?"ai-booking":"";
const bookingBaseCents=()=>1299;
const bookingDisplayPrice="$"+(bookingBaseCents()/100).toFixed(2);
const prices={"":{setup:0,monthly:0}, "ai-booking":{setup:39,monthly:14},"ai-followup":{setup:19,monthly:6.99},"ai-business":{setup:59,monthly:19}};
let livePricing=null;
const pricesEndpoint="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-bundle-checkout";
const plans=[
 ["",es?"No, solo quiero Booking Automation":"No thanks, just Booking Automation",es?"Sin extras ni mensualidad del AI Assistant.":"No AI Assistant add-on or monthly fee."],
 ["ai-booking","AI Booking Assistant",es?"Responde preguntas y prepara solicitudes de reserva.":"Answers questions and helps prepare booking requests."],
 ["ai-followup","AI Follow-Up Assistant",es?"Da seguimiento a leads que autorizaron recibir mensajes.":"Follows up with leads who opted in."],
 ["ai-business","AI Business Assistant",es?"Asistente de reservas + asistente de seguimiento.":"Booking assistant + follow-up assistant."]
];
const style=document.createElement("style");style.textContent=`
.tle-bundle{margin:28px auto 12px;padding:clamp(18px,3vw,30px);background:#FAF8F3;color:#191919;border:1px solid #D8E2E9;border-radius:26px;box-shadow:0 12px 30px #1919190d;font:15px/1.5 Futura,"Avenir Next",Arial,sans-serif;max-width:760px}
.tle-bundle *{box-sizing:border-box}.tle-bundle h2{margin:3px 0 10px;font:700 clamp(24px,3.2vw,33px)/1.15 Prompt,Arial,sans-serif;letter-spacing:-.03em}.tle-bundle p{line-height:1.55}.tle-bundle .tle-ey{color:#416c88;font-size:11px;font-weight:800;letter-spacing:.12em}.tle-bundle .tle-included{background:#fff;border:1px solid #e2e0d8;border-radius:18px;padding:15px 17px;display:flex;justify-content:space-between;gap:12px;align-items:center;margin:18px 0 21px}
.tle-bundle .tle-included b{font-size:15px}.tle-bundle .tle-included span{color:#475967;font-size:13px}.tle-bundle .tle-options{display:grid;gap:10px;margin:14px 0 19px}.tle-bundle .tle-opt{display:flex;gap:12px;align-items:flex-start;padding:14px 15px;background:#fff;border:1.5px solid #deded9;border-radius:16px;cursor:pointer;transition:border-color .15s,background .15s;min-width:0}
.tle-bundle .tle-opt:has(input:checked){background:#FFF9DA;border-color:#191919}.tle-bundle input[type=radio]{accent-color:#191919;width:20px;height:20px;flex:0 0 20px;margin:2px 0 0}.tle-bundle .tle-opt-main{min-width:0;flex:1}.tle-bundle .tle-opt-main strong{display:block;color:#191919;font-size:14px}.tle-bundle .tle-opt-main small{display:block;color:#54616d;margin-top:3px;font-size:12px;line-height:1.45}.tle-bundle .tle-opt-price{white-space:nowrap;text-align:right;flex-shrink:0;font-size:13px;font-weight:800}.tle-bundle .tle-opt-price small{display:block;font-size:11px;color:#586776;font-weight:400}
.tle-bundle .tle-summary{background:#EAF4FC;border:1px solid #D3E5F1;border-radius:18px;padding:17px;margin:10px 0}.tle-bundle .tle-sumrow{display:flex;justify-content:space-between;gap:12px;margin:5px 0;font-size:13px}.tle-bundle .tle-sumrow.total{padding-top:10px;margin-top:11px;border-top:1px solid #bcd4e4;font-size:18px;font-weight:800}.tle-bundle .tle-monthly{font-size:12px;color:#364f61;margin-top:12px}
.tle-bundle .tle-buy{border:0;border-radius:999px;padding:16px 18px;width:100%;background:#191919;color:white;font-weight:800;font-size:15px;cursor:pointer;min-height:52px}.tle-bundle .tle-buy:disabled{opacity:.6;cursor:wait}.tle-bundle .tle-hint{font-size:12px;color:#5a6570;margin:12px 0 0}.tle-bundle .tle-error{color:#9c2f2f;font-size:13px;margin-top:10px}.tle-bundle button:focus-visible,.tle-bundle input:focus-visible{outline:3px solid #528FC3;outline-offset:3px}
@media(max-width:420px){.tle-bundle{padding:17px 13px;border-radius:20px}.tle-bundle .tle-opt{padding:12px 10px;gap:9px}.tle-bundle .tle-opt-price{font-size:12px}.tle-bundle .tle-included{padding:12px 13px}.tle-bundle .tle-opt-main strong{font-size:13px}}
`;document.head.appendChild(style);
root.className="tle-bundle";
root.setAttribute("aria-label",es?"Personalizar mi compra":"Customize my purchase");
const safe=t=>String(t).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
root.innerHTML=`<div class="tle-ey">${es?"TU SISTEMA, A TU MANERA":"BUILD YOUR BOOKING SYSTEM"}</div>
<h2>${es?"¿Lista para automatizar tus reservas?":"Ready to automate your bookings?"}</h2>
<p>${es?"Comienza con tu Booking Page y Command Center. Si quieres, añade un asistente de IA independiente en esta misma compra.":"Start with your Booking Page and Command Center. Add a separate AI Assistant if it fits your business — all in one checkout."}</p>
<div class="tle-included"><div><b>Booking Automation + Command Center</b><br><span>${es?"Página personalizada + panel privado":"Personalized Booking Page + private workspace"}</span></div><b>${bookingDisplayPrice}</b></div>
<div class="tle-ey">${es?"TAMBIÉN TE PUEDE INTERESAR · OPCIONAL":"YOU MAY ALSO LIKE · OPTIONAL"}</div>
<div class="tle-options" role="radiogroup" aria-label="${es?"Añadir AI Assistant":"Add an AI Assistant"}">
${plans.map(([key,name,desc])=>`<label class="tle-opt"><input type="radio" name="tle-ai-bundle" value="${safe(key)}" ${key===autoSelectAI?"checked":""}><span class="tle-opt-main"><strong>${safe(name)}</strong><small>${safe(desc)}</small></span><span class="tle-opt-price">${key?"+$"+prices[key].setup:"$0"}<small>${key?(es?"luego $":"then $")+prices[key].monthly+(es?"/mes":"/mo"):(es?"Sin cargo":"No charge")}</small></span></label>`).join("")}
</div>
<div class="tle-summary" aria-live="polite"><div class="tle-sumrow"><span>Booking Automation + Command Center</span><b id="tleBookingPrice">${bookingDisplayPrice}</b></div><div class="tle-sumrow" id="tleAddonRow" hidden><span id="tleAddonName"></span><b id="tleAddonPrice"></b></div><div class="tle-sumrow" id="tleDiscountRow" hidden><span>${es?"Ahorro de activación (40%)":"Activation discount (40%)"}</span><b id="tleDiscountAmount"></b></div><div class="tle-sumrow total"><span>${es?"Total a pagar hoy":"Total due today"}</span><strong id="tleTotal">${bookingDisplayPrice}</strong></div><div class="tle-monthly" id="tleMonthly">${es?"Sin mensualidad de AI Assistant.":"No AI Assistant monthly fee."}</div></div>
<button type="button" class="tle-buy" id="tleCheckoutBtn">${es?"Continuar al checkout seguro →":"Continue to secure checkout →"}</button>
<p class="tle-hint">${es?"El AI Assistant se compra por separado del Booking Automation. En esta opción puedes pagar las dos instalaciones juntas. Los primeros 30 días del asistente comienzan con la entrega; después aplica su mensualidad.":"AI Assistant is sold separately from Booking Automation. You can pay both setup fees together here. The assistant's first 30 days begin at delivery; the selected monthly plan follows."}</p>
<p class="tle-hint" id="tleProductionPromise" aria-live="polite"></p><p class="tle-hint" id="tleCarePromise"></p><a class="tle-hint" href="/help/?topic=setup-call" style="display:inline-block;text-decoration:underline;color:#1D577C">${es?"Solicitar una llamada 1:1 de orientación ↗":"Request a 1:1 guidance call ↗"}</a>
<div id="tleBundleError" class="tle-error" role="alert" hidden></div>`;
const money=n=>"$"+n.toFixed(2);
const selected=()=>root.querySelector('input[name="tle-ai-bundle"]:checked')?.value||"";
function expected(key){
 const base=bookingBaseCents(),details=livePricing?.plans?.[key],bookCents=key?(livePricing?.booking_setup_cents??base):base;
 return {bookCents,aiCents:key?(details?.setup_due_cents??prices[key].setup*100):0,original:key?(base+prices[key].setup*100):base};
}
function render(){
 const key=selected(),plan=prices[key],v=expected(key),total=v.bookCents+v.aiCents;
 root.querySelector("#tleAddonRow").hidden=!key;
 root.querySelector("#tleAddonName").textContent=plans.find(p=>p[0]===key)?.[1]||"";
 root.querySelector("#tleBookingPrice").textContent=money(bookingBaseCents()/100);
 root.querySelector("#tleAddonPrice").textContent=money(plan.setup);
 root.querySelector("#tleTotal").textContent=money(total/100);
 const discount=v.original-total;
 root.querySelector("#tleDiscountRow").hidden=!key||!discount;
 root.querySelector("#tleDiscountAmount").textContent=discount?"−"+money(discount/100):"";
 root.querySelectorAll('input[name="tle-ai-bundle"]').forEach(input=>{
  if(!input.value)return;
  const details=livePricing?.plans?.[input.value],price=details?.setup_due_cents??prices[input.value].setup*100;
  const parent=input.closest(".tle-opt");const target=parent?.querySelector(".tle-opt-price");
  if(target){target.innerHTML=(price<prices[input.value].setup*100?'<del style="color:#788793;font-weight:400">'+money(prices[input.value].setup)+'</del> ':'')+'+'+money(price/100)+'<small>'+(es?'luego $':'then $')+prices[input.value].monthly+(es?'/mes':'/mo')+'</small>';}
 });
 root.querySelector("#tleProductionPromise").textContent=key?(es?"Bundle con AI: producción conjunta estimada de 4 días hábiles tras revisar y aprobar el formulario completo.":"Bundle with AI: estimated 4 business days of combined production after the completed intake is reviewed and approved."):(es?"Solo Booking: producción estimada de 48 horas después de aprobar el intake.":"Booking-only: estimated 48-hour production after your completed intake is approved.");
 root.querySelector("#tleCarePromise").textContent=key?(es?"El plan mensual de AI activo incluye soporte, pequeños cambios de colores, ayuda para actualizar servicios y ajustes de flyers flotantes. No incluye rediseños completos ni funciones nuevas.":"With an active monthly AI plan, support includes small color changes, service updates and minor promotional pop-up adjustments. Full redesigns and new features are not included."):(es?"Sin mensualidad de AI no se incluye el soporte recurrente del plan AI.":"Without a monthly AI plan, recurring AI support is not included.");
 root.querySelector("#tleMonthly").textContent=key?(es?"Tras los primeros 30 días desde la entrega: $"+plan.monthly+"/mes (precio normal).":"After the first 30 days from delivery: $"+plan.monthly+"/month (regular price)."):(es?"Sin mensualidad de AI Assistant.":"No AI Assistant monthly fee.");
 const btn=root.querySelector("#tleCheckoutBtn");
 btn.disabled=!!key&&!livePricing;
}
root.addEventListener("change",e=>{if(e.target?.name==="tle-ai-bundle")render()});render();
const btn=root.querySelector("#tleCheckoutBtn"),error=root.querySelector("#tleBundleError");
(async()=>{
 try{
  const response=await fetch(pricesEndpoint,{method:"GET",headers:{"Accept":"application/json"},cache:"no-store"});
  if(!response.ok)throw Error("pricing");
  const data=await response.json();
  if(!data?.plans||![0,40].includes(data.percent_off)||!Object.entries(prices).every(([key,plan])=>!key||data.plans[key]?.original_setup_cents===plan.setup*100&&data.plans[key]?.monthly_cents===plan.monthly*100&&data.plans[key]?.setup_due_cents===Math.round(plan.setup*100*(100-data.percent_off)/100)))throw Error("pricing");
  livePricing=data;render();
 }catch{
  error.textContent=es?"No se pudo cargar el descuento. Intenta actualizar la página.":"Could not load current pricing. Please refresh the page.";
  error.hidden=false;
 }
})();

btn.addEventListener("click",async()=>{
 const addon=selected(),language=es?"es":"en";
 if(!addon){location.href="/service-checkout/?"+url.toString();return;}
 btn.disabled=true;error.hidden=true;btn.textContent=es?"Preparando tu checkout…":"Preparing your checkout…";
 try{
  const res=await fetch("https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-bundle-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({language,ai_addon:addon})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data?.url||!/^https:\/\/checkout\.stripe\.com\//.test(data.url)||Number(data.amount_total)!==(expected(addon).bookCents+expected(addon).aiCents))throw Error("checkout");
  try{sessionStorage.setItem("tleCheckoutLanguage",language);sessionStorage.setItem("tleSelectedAiAddon",addon);}catch{}
  location.assign(data.url);
 }catch{error.textContent=es?"No se pudo abrir la compra conjunta. No se hizo ningún cargo. Intenta de nuevo.":"We couldn't open the combined checkout. No charge was made. Please try again.";error.hidden=false;btn.disabled=false;btn.textContent=es?"Continuar al checkout seguro →":"Continue to secure checkout →";}
});
})();