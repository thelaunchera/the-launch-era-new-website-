(()=>{
"use strict";
const root=document.querySelector("[data-tle-bundle]");
if(!root)return;
const qs=new URLSearchParams(location.search),es=qs.get("lang")==="es"||(!qs.has("lang")&&(document.documentElement.lang||"").startsWith("es"));
const url=new URLSearchParams({offer:"booking-flow",lang:es?"es":"en"});
const prices={"":{setup:0,monthly:0}, "ai-booking":{setup:79,monthly:29},"ai-followup":{setup:59,monthly:19},"ai-business":{setup:119,monthly:39}};
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
<div class="tle-included"><div><b>Booking Automation + Command Center</b><br><span>${es?"Página personalizada + panel privado":"Personalized Booking Page + private workspace"}</span></div><b>$19.99</b></div>
<div class="tle-ey">${es?"TAMBIÉN TE PUEDE INTERESAR · OPCIONAL":"YOU MAY ALSO LIKE · OPTIONAL"}</div>
<div class="tle-options" role="radiogroup" aria-label="${es?"Añadir AI Assistant":"Add an AI Assistant"}">
${plans.map(([key,name,desc])=>`<label class="tle-opt"><input type="radio" name="tle-ai-bundle" value="${safe(key)}" ${key?"":"checked"}><span class="tle-opt-main"><strong>${safe(name)}</strong><small>${safe(desc)}</small></span><span class="tle-opt-price">${key?"+$"+prices[key].setup:"$0"}<small>${key?(es?"luego $":"then $")+prices[key].monthly+(es?"/mes":"/mo"):(es?"Sin cargo":"No charge")}</small></span></label>`).join("")}
</div>
<div class="tle-summary" aria-live="polite"><div class="tle-sumrow"><span>Booking Automation + Command Center</span><b>$19.99</b></div><div class="tle-sumrow" id="tleAddonRow" hidden><span id="tleAddonName"></span><b id="tleAddonPrice"></b></div><div class="tle-sumrow total"><span>${es?"Total a pagar hoy":"Total due today"}</span><strong id="tleTotal">$19.99</strong></div><div class="tle-monthly" id="tleMonthly">${es?"Sin mensualidad de AI Assistant.":"No AI Assistant monthly fee."}</div></div>
<button type="button" class="tle-buy" id="tleCheckoutBtn">${es?"Continuar al checkout seguro →":"Continue to secure checkout →"}</button>
<p class="tle-hint">${es?"El AI Assistant se compra por separado del Booking Automation. En esta opción puedes pagar las dos instalaciones juntas. Los primeros 30 días del asistente comienzan con la entrega; después aplica su mensualidad.":"AI Assistant is sold separately from Booking Automation. You can pay both setup fees together here. The assistant's first 30 days begin at delivery; the selected monthly plan follows."}</p>
<div id="tleBundleError" class="tle-error" role="alert" hidden></div>`;
const money=n=>"$"+n.toFixed(2);
const selected=()=>root.querySelector('input[name="tle-ai-bundle"]:checked')?.value||"";
function render(){const key=selected(),plan=prices[key];root.querySelector("#tleAddonRow").hidden=!key;root.querySelector("#tleAddonName").textContent=plans.find(p=>p[0]===key)?.[1]||"";root.querySelector("#tleAddonPrice").textContent=money(plan.setup);root.querySelector("#tleTotal").textContent=money(19.99+plan.setup);root.querySelector("#tleMonthly").textContent=key?(es?"Hoy pagas la instalación. Después de los 30 días desde la entrega: $"+plan.monthly+"/mes por AI Assistant.":"Setup is paid today. After 30 days from delivery: $"+plan.monthly+"/month for AI Assistant."):(es?"Sin mensualidad de AI Assistant.":"No AI Assistant monthly fee.");}
root.addEventListener("change",e=>{if(e.target?.name==="tle-ai-bundle")render()});render();
const btn=root.querySelector("#tleCheckoutBtn"),error=root.querySelector("#tleBundleError");
btn.addEventListener("click",async()=>{
 const addon=selected(),language=es?"es":"en";
 if(!addon){location.href="/service-checkout/?"+url.toString();return;}
 btn.disabled=true;error.hidden=true;btn.textContent=es?"Preparando tu checkout…":"Preparing your checkout…";
 try{
  const res=await fetch("https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-bundle-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({language,ai_addon:addon})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||!data?.url||!/^https:\/\/checkout\.stripe\.com\//.test(data.url)||Number(data.amount_total)!==(1999+prices[addon].setup*100))throw Error("checkout");
  try{sessionStorage.setItem("tleCheckoutLanguage",language);sessionStorage.setItem("tleSelectedAiAddon",addon);}catch{}
  location.assign(data.url);
 }catch{error.textContent=es?"No se pudo abrir la compra conjunta. No se hizo ningún cargo. Intenta de nuevo.":"We couldn't open the combined checkout. No charge was made. Please try again.";error.hidden=false;btn.disabled=false;btn.textContent=es?"Continuar al checkout seguro →":"Continue to secure checkout →";}
});
})();