(() => {
  "use strict";
  const qs = new URLSearchParams(window.location.search);
  if (qs.has("key") || qs.get("owner_preview") === "1") return;
  const lang = qs.get("lang") === "es" ? "es" : "en";
  const es = lang === "es";
  const endpoint = "https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-ai-booking-demo";
  const business = (qs.get("business") || document.getElementById("leadName")?.textContent?.replace(/^PERSONALIZED FOR\s*/i,"") || "Demo Cleaning Business").slice(0,100);
  const area = (qs.get("area") || "").slice(0,120);
  const services = (qs.get("services") || "Residential standard cleaning, deep cleaning, move-in/out cleaning").slice(0,180);
  const threadId = (window.crypto?.randomUUID ? window.crypto.randomUUID() : "9cf5037c-8b38-42a9-9565-2b8f532ac017");
  const copy = es ? {
    title:"Asistente de reservas con IA",subtitle:"Demostración · No realiza reservas reales",
    intro:"¡Hola! 👋 ¿En qué tipo de limpieza estás pensando? Puedo orientarte sobre el proceso de reserva.",
    placeholder:"Escribe tu pregunta…",button:"Preguntar a la IA",send:"Enviar",close:"Cerrar chat",
    note:"Solo demostración. No compartas nombres, teléfonos, correos, direcciones ni información de pago.",
    error:"Ahora mismo no puedo responder. Por favor, inténtalo más tarde.",
    limit:"Llegaste al límite de la demo. Puedes explorar la Booking Page.",
    opening:"Abrir asistente de IA"
  } : {
    title:"AI Booking Assistant",subtitle:"Live AI demo · No real bookings",
    intro:"Hi! 👋 Looking for a cleaning service? I can help you understand the booking process.",
    placeholder:"Ask a question…",button:"Ask AI",send:"Send",close:"Close chat",
    note:"Demo only. Please don't share names, emails, phone numbers, addresses, or payment details.",
    error:"I can't respond right now. Please try again later.",
    limit:"You've reached the demo limit. You can still explore the Booking Page.",
    opening:"Open AI Booking Assistant"
  };
  const css = document.createElement("style");
  css.textContent = `
    .tle-ai-launch{position:fixed!important;right:max(16px,env(safe-area-inset-right));bottom:max(17px,env(safe-area-inset-bottom));z-index:2147483000!important;border:1px solid rgba(25,25,25,.12);background:#F2D85B;color:#191919;font:700 13px Futura,"Avenir Next",Arial,sans-serif;padding:13px 18px;border-radius:999px;box-shadow:0 7px 27px #19191929;min-height:46px;display:flex;align-items:center;gap:8px;cursor:pointer}
    .tle-ai-launch:focus-visible,.tle-ai-panel button:focus-visible,.tle-ai-panel textarea:focus-visible{outline:3px solid #528FC3;outline-offset:2px}
    .tle-ai-panel{position:fixed!important;z-index:2147483001!important;right:max(12px,env(safe-area-inset-right));bottom:calc(max(17px,env(safe-area-inset-bottom)) + 60px);width:min(395px,calc(100vw - 24px));height:min(540px,calc(100dvh - 105px));min-height:300px;background:#FAF8F3;border:1px solid #D1E2EF;border-radius:22px;box-shadow:0 20px 65px #19191939;overflow:hidden;display:flex;flex-direction:column;font:14px/1.45 Futura,"Avenir Next",Arial,sans-serif;color:#191919}
    .tle-ai-panel[hidden]{display:none!important}
    .tle-ai-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:17px 18px;background:#EAF4FC;border-bottom:1px solid #D1E2EF}
    .tle-ai-head b{font:700 16px/1.1 Prompt,Arial,sans-serif;display:block;margin-bottom:5px}
    .tle-ai-head small{font-size:11px;color:#4D6370}
    .tle-ai-head button{background:#fff;border:1px solid #D1E2EF;border-radius:50%;height:34px;width:34px;font-size:24px;line-height:1;color:#191919;cursor:pointer}
    .tle-ai-log{flex:1;overflow-y:auto;overflow-wrap:anywhere;display:flex;flex-direction:column;gap:10px;padding:18px 14px;overscroll-behavior:contain}
    .tle-ai-msg{padding:12px 13px;max-width:92%;border-radius:16px;font-size:13px;white-space:pre-wrap}
    .tle-ai-msg.bot{align-self:flex-start;background:#fff;border:1px solid #E2E4E2;border-bottom-left-radius:5px}
    .tle-ai-msg.user{align-self:flex-end;background:#EAF4FC;border:1px solid #D1E2EF;border-bottom-right-radius:5px}
    .tle-ai-foot{padding:11px 13px 13px;border-top:1px solid #E4E8EA;background:#fff}
    .tle-ai-foot p{font-size:10px;color:#647581;margin:0 0 10px;line-height:1.4}
    .tle-ai-form{display:flex;gap:8px}
    .tle-ai-form textarea{flex:1;resize:none;min-height:43px;max-height:87px;border:1px solid #D1E2EF;background:#FAF8F3;border-radius:15px;padding:11px;font:13px Futura,"Avenir Next",Arial,sans-serif;min-width:0}
    .tle-ai-form button{background:#191919;color:#fff;border:0;border-radius:14px;padding:0 14px;min-height:43px;font-weight:700;cursor:pointer}
    .tle-ai-form button:disabled{opacity:.55;cursor:not-allowed}
    @media(max-width:480px){.tle-ai-panel{left:10px;right:10px;width:auto;bottom:calc(max(10px,env(safe-area-inset-bottom)) + 58px);height:min(520px,calc(100dvh - 96px))}.tle-ai-launch{bottom:max(10px,env(safe-area-inset-bottom));right:12px}}
    @media(prefers-reduced-motion:no-preference){.tle-ai-panel{animation:tleAiEnter .2s ease-out}@keyframes tleAiEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}}
  `;
  document.head.appendChild(css);
  const launch=document.createElement("button");launch.type="button";launch.className="tle-ai-launch";launch.setAttribute("aria-expanded","false");launch.setAttribute("aria-label",copy.opening);launch.textContent="✦  "+copy.button;
  const panel=document.createElement("section");panel.className="tle-ai-panel";panel.hidden=true;panel.setAttribute("aria-label",copy.title);
  const head=document.createElement("div");head.className="tle-ai-head";
  const identity=document.createElement("div");const label=document.createElement("b");label.textContent=copy.title;const subtitle=document.createElement("small");subtitle.textContent=copy.subtitle;identity.append(label,subtitle);
  const close=document.createElement("button");close.type="button";close.setAttribute("aria-label",copy.close);close.textContent="×";head.append(identity,close);
  const log=document.createElement("div");log.className="tle-ai-log";log.setAttribute("role","log");log.setAttribute("aria-live","polite");
  const foot=document.createElement("div");foot.className="tle-ai-foot";const note=document.createElement("p");note.textContent=copy.note;
  const form=document.createElement("form");form.className="tle-ai-form";const field=document.createElement("textarea");field.placeholder=copy.placeholder;field.rows=1;field.maxLength=350;field.required=true;field.setAttribute("aria-label",copy.placeholder);
  const send=document.createElement("button");send.type="submit";send.textContent=copy.send;form.append(field,send);foot.append(note,form);panel.append(head,log,foot);
  document.body.append(panel,launch);
  let sent=0; let busy=false;
  function append(text,who){const div=document.createElement("div");div.className="tle-ai-msg "+who;div.textContent=text;log.appendChild(div);log.scrollTop=log.scrollHeight;return div;}
  append(copy.intro,"bot");
  function toggle(open){panel.hidden=!open;launch.setAttribute("aria-expanded",open?"true":"false");if(open)field.focus();else launch.focus();}
  launch.addEventListener("click",()=>toggle(panel.hidden));
  close.addEventListener("click",()=>toggle(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)toggle(false)});
  field.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(busy)return;
    const message=field.value.trim();
    if(!message)return;
    if(sent>=6){append(copy.limit,"bot");return;}
    const privatePattern=/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}|(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    if(privatePattern.test(message)){append(copy.note,"bot");return;}
    append(message,"user");field.value="";sent++;busy=true;send.disabled=true;
    const wait=append(es?"Escribiendo…":"Typing…","bot");
    const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),27000);
    try{
      const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer_message:message,business_name:business,service_area:area,services_offered:services,thread_id:threadId,language:lang}),signal:controller.signal});
      const data=await res.json();
      wait.textContent=res.ok&&typeof data.reply==="string"?data.reply:res.status===429?copy.limit:copy.error;
    }catch{wait.textContent=copy.error;}finally{window.clearTimeout(timer);busy=false;send.disabled=false;log.scrollTop=log.scrollHeight;field.focus();}
  });
})();