(() => {
  "use strict";

/* Shared motion pattern. The real conversation never loops, fabricates a reply, or resets. */
function attachTleChatMotion(chatLog){
 if(!chatLog||chatLog.dataset.tleChatMotionReady)return;
 chatLog.dataset.tleChatMotionReady="true";
 if(!document.getElementById("tle-chat-motion-styles")){
  const style=document.createElement("style");
  style.id="tle-chat-motion-styles";
  style.textContent="\n/* Shared Jessy/Jessie/Sonny conversational motion. Scoped to chat widgets only. */\n.tle-jessy-root .tle-jessy-message,.tle-ai-panel .tle-ai-msg,.jo-root .jo-bubble{position:relative;transform-origin:0 100%;animation:tleChatBubbleIn .6s cubic-bezier(.2,1.22,.32,1) both}\n.tle-jessy-root .tle-jessy-message.user,.tle-ai-panel .tle-ai-msg.user,.jo-root .jo-bubble.user{background:linear-gradient(130deg,#347ba8 0%,#286c99 100%)!important;color:#fff!important;-webkit-text-fill-color:#fff!important;transform-origin:100% 100%;border:1px solid #3679a3!important;box-shadow:0 5px 14px #286c9924}\n.tle-jessy-root .tle-jessy-message.bot,.tle-ai-panel .tle-ai-msg.bot,.jo-root .jo-bubble.bot{background:#f5faff!important;border:1px solid #d4e7f3!important;color:#203d50!important;-webkit-text-fill-color:#203d50!important;margin-left:29px!important;max-width:calc(100% - 31px)!important;box-shadow:0 5px 15px #286c9912}\n.tle-jessy-root .tle-jessy-message.bot::before,.tle-ai-panel .tle-ai-msg.bot::before,.jo-root .jo-bubble.bot::before{content:\"✦\";position:absolute;top:5px;left:-29px;width:23px;height:23px;display:grid;place-items:center;border-radius:50%;background:#d8efff;border:1px solid #b3d9ef;font:700 12px/1 Prompt,Arial,sans-serif;color:#357fac;-webkit-text-fill-color:#357fac;box-shadow:0 3px 8px #285b8018}\n.tle-jessy-root .tle-jessy-form,.tle-ai-panel .tle-ai-form,.jo-root .jo-form{border:1px solid #c5dfed;border-radius:999px;background:#f8fcff;padding:3px;align-items:center!important}\n.tle-jessy-root .tle-jessy-message-field,.tle-ai-panel .tle-ai-form textarea,.jo-root .jo-input{background:transparent!important;border:0!important;outline-offset:0!important;border-radius:22px!important;resize:none;min-height:38px!important;padding:10px 13px!important;box-shadow:none!important}\n.tle-jessy-root .tle-jessy-send,.tle-ai-panel .tle-ai-form button,.jo-root .jo-send{min-height:38px!important;border-radius:999px!important}\n.tle-chat-waiting{font-size:0!important;min-height:38px}\n.tle-chat-dots{display:inline-flex;gap:6px;align-items:center;vertical-align:middle;padding:4px 0;min-height:15px}\n.tle-chat-dots i{display:block;width:6px;height:6px;border-radius:50%;background:#458bb5;animation:tleChatDot .9s ease-in-out infinite}\n.tle-chat-dots i:nth-child(2){animation-delay:.15s}.tle-chat-dots i:nth-child(3){animation-delay:.3s}\n.tle-chat-caret{display:inline-block;vertical-align:-2px;width:2px;height:1em;margin-left:2px;background:#4b8fb8;animation:tleChatCaret .75s steps(1,end) infinite}\n@keyframes tleChatBubbleIn{from{opacity:0;transform:translateY(8px) scale(.9)}70%{opacity:1}to{opacity:1;transform:translateY(0) scale(1)}}\n@keyframes tleChatDot{0%,65%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-5px);opacity:1}}\n@keyframes tleChatCaret{50%{opacity:0}}\n@media(prefers-reduced-motion:reduce){.tle-jessy-root .tle-jessy-message,.tle-ai-panel .tle-ai-msg,.jo-root .jo-bubble{animation:none!important}.tle-chat-dots i,.tle-chat-caret{animation:none!important}}\n";
  document.head.appendChild(style);
 }
 const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
 const seen=new WeakMap(), pendingAt=new WeakMap(), active=new Map();
 const bubbles=".tle-jessy-message, .tle-ai-msg, .jo-bubble";
 function visible(node){return !document.hidden&&chatLog.getClientRects().length>0&&node.getClientRects().length>0;}
 function finish(node){
  const state=active.get(node);
  if(!state)return;
  clearTimeout(state.timer);active.delete(node);
  node.classList.remove("tle-chat-waiting");
  node.removeAttribute("aria-label");node.removeAttribute("aria-live");
  node.textContent=state.text;seen.set(node,state.text);
 }
 function finishAll(){for(const node of active.keys())finish(node)}
 function startReply(node,reply){
  node.classList.remove("tle-chat-waiting");node.removeAttribute("aria-label");
  if(reduce.matches||!visible(node)){seen.set(node,reply);return}
  const words=reply.match(/\S+\s*/g)||[reply];
  if(words.length<2){seen.set(node,reply);return}
  const state={text:reply,timer:0};active.set(node,state);
  node.setAttribute("aria-label",reply);node.setAttribute("aria-live","off");
  const span=document.createElement("span"),caret=document.createElement("span");
  span.setAttribute("aria-hidden","true");
  caret.className="tle-chat-caret";caret.setAttribute("aria-hidden","true");
  node.replaceChildren(span,caret);
  let index=0;
  const next=()=>{
   if(!node.isConnected||!visible(node)||reduce.matches){finish(node);return}
   const limit=Math.min(words.length,32);
   if(index>=limit){finish(node);return}
   span.textContent+=words[index++];
   chatLog.scrollTop=chatLog.scrollHeight;
   state.timer=setTimeout(next,150);
  };
  const delay=Math.max(0,900-(Date.now()-(pendingAt.get(node)||0)));
  state.timer=setTimeout(next,delay);
 }
 function check(){
  const all=chatLog.querySelectorAll(bubbles);
  for(const node of all){
   if(active.has(node))continue;
   const message=node.textContent;
   const before=seen.get(node);
   if(message===before)continue;
   if(node.classList.contains("user")){finishAll();seen.set(node,message);continue}
   const waiting=/^(typing|escribiendo|un momento|one moment|checking your workspace|revisando tu espacio)/i.test(message.trim());
   if(waiting){
    seen.set(node,message);
    if(!pendingAt.has(node)){
     pendingAt.set(node,Date.now());node.classList.add("tle-chat-waiting");
     node.setAttribute("aria-label",message);
     const dots=document.createElement("span");dots.className="tle-chat-dots";dots.setAttribute("aria-hidden","true");
     for(let i=0;i<3;i++)dots.appendChild(document.createElement("i"));
     node.appendChild(dots);
    }
    continue;
   }
   seen.set(node,message);
   if(before!==undefined&&pendingAt.has(node))startReply(node,message);
  }
 }
 const observer=new MutationObserver(check);
 observer.observe(chatLog,{subtree:true,childList:true,characterData:true});
 document.addEventListener("visibilitychange",()=>{if(document.hidden)finishAll()});
 reduce.addEventListener?.("change",()=>{if(reduce.matches)finishAll()});
 check();
}

  const qs = new URLSearchParams(window.location.search);
  if (qs.has("key") || qs.get("owner_preview") === "1") return;
  const lang = qs.get("lang") === "es" ? "es" : qs.get("lang") === "en" ? "en" : (document.documentElement.lang || "").toLowerCase().startsWith("es") || window.location.pathname.startsWith("/es/") ? "es" : "en";
  const es = lang === "es";
  const endpoint = "https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-ai-booking-demo";
  const business = (qs.get("business") || document.getElementById("leadName")?.textContent?.replace(/^PERSONALIZED FOR\s*/i,"") || "Demo Cleaning Business").slice(0,100);
  const area = (qs.get("area") || "").slice(0,120);
  const services = (qs.get("services") || "Residential standard cleaning, deep cleaning, move-in/out cleaning").slice(0,180);
  // Each demo session needs its own identifier, including browsers without randomUUID.
  function freshThreadId(){
    if(window.crypto?.randomUUID)return window.crypto.randomUUID();
    const bytes=new Uint8Array(16);
    if(window.crypto?.getRandomValues)window.crypto.getRandomValues(bytes);
    else for(let i=0;i<16;i++)bytes[i]=Math.floor(Math.random()*256);
    bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
    const hex=Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
    return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join("-");
  }
  let threadId=freshThreadId();
  const copy = es ? {
    title:"Sonny · Agente de reservas",subtitle:"Asistente de IA de demostración · Servicio adicional",
    intro:"¡Hola! Soy Sonny 👋 Tu agente de reservas de prueba. Te explicaré los servicios y te ayudaré con el formulario. Primero, ¿la limpieza es para una casa o un negocio?",
    placeholder:"Pregúntale a Sonny…",button:"Hablar con Sonny",send:"Enviar",close:"Cerrar chat",
    note:"Solo demostración. Usa datos ficticios y revisa tu solicitud al terminar.",
    error:"Ahora mismo no puedo responder. Por favor, inténtalo más tarde.",
    limit:"El chat no está disponible por ahora. Inténtalo más tarde.",
    opening:"Abrir a Sonny, agente de reservas", review:"Revisar mi solicitud →",nextStep:"Siguiente: revisa lo que completé, añade los datos que falten y termina la solicitud de prueba."
  } : {
    title:"Sonny · Booking Agent",subtitle:"AI booking demo · Separate optional service",
    intro:"Hi! I’m Sonny 👋 Your demo booking agent. I can explain services and help you fill out the form. First, is the cleaning for a home or a business?",
    placeholder:"Ask Sonny a question…",button:"Chat with Sonny",send:"Send",close:"Close chat",
    note:"Demo only. Use sample details and review your request when finished.",
    error:"I can't respond right now. Please try again later.",
    limit:"Chat isn't available right now. Please try again later.",
    opening:"Open Sonny, the booking agent", review:"Review my request →",nextStep:"Next: review what I filled in, complete any missing fields, then finish the demo request."
  };
  const css = document.createElement("style");
  css.textContent = `
    .tle-ai-launch{position:fixed!important;right:calc(23px + env(safe-area-inset-right));bottom:calc(76px + env(safe-area-inset-bottom));z-index:2147483000!important;border:1px solid rgba(25,25,25,.12);background:#F2D85B;color:#191919;font:700 13px Futura,"Avenir Next",Arial,sans-serif;padding:13px 18px;border-radius:999px;box-shadow:0 7px 27px #19191929;min-height:46px;display:flex;align-items:center;gap:8px;cursor:pointer}
    .tle-ai-launch:focus-visible,.tle-ai-panel button:focus-visible,.tle-ai-panel textarea:focus-visible{outline:3px solid #528FC3;outline-offset:2px}
    .tle-ai-panel{position:fixed!important;z-index:2147483001!important;right:calc(18px + env(safe-area-inset-right));bottom:calc(140px + env(safe-area-inset-bottom));width:min(395px,calc(100vw - 24px));height:min(540px,calc(100dvh - 105px));min-height:300px;background:#FAF8F3;border:1px solid #D1E2EF;border-radius:22px;box-shadow:0 20px 65px #19191939;overflow:hidden;display:flex;flex-direction:column;font:14px/1.45 Futura,"Avenir Next",Arial,sans-serif;color:#191919}
    .tle-ai-panel[hidden]{display:none!important}
    .tle-ai-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:17px 18px;background:#EAF4FC;border-bottom:1px solid #D1E2EF}
    .tle-ai-head b{font:700 16px/1.1 Prompt,Arial,sans-serif;display:block;margin-bottom:5px}
    .tle-ai-head small{font-size:11px;color:#4D6370}
    .tle-ai-head button{background:#fff;border:1px solid #D1E2EF;border-radius:50%;height:34px;width:34px;font-size:24px;line-height:1;color:#191919;cursor:pointer}
    .tle-ai-log{flex:1;overflow-y:auto;overflow-wrap:anywhere;display:flex;flex-direction:column;gap:10px;padding:18px 14px;overscroll-behavior:contain}
    .tle-ai-msg{padding:12px 13px;max-width:92%;border-radius:16px;font-size:14px;line-height:1.5;white-space:pre-wrap;color:#191919!important;-webkit-text-fill-color:#191919!important}
    .tle-ai-msg.bot{align-self:flex-start;background:#fff;border:1px solid #E2E4E2;border-bottom-left-radius:5px}
    .tle-ai-msg.user{align-self:flex-end;background:#EAF4FC;border:1px solid #D1E2EF;border-bottom-right-radius:5px}
    .tle-ai-foot{padding:11px 13px 13px;border-top:1px solid #E4E8EA;background:#fff}
    .tle-ai-foot p{font-size:10px;color:#647581;margin:0 0 10px;line-height:1.4}
    .tle-ai-form{display:flex;gap:8px}
    .tle-ai-form textarea{flex:1;resize:none;min-height:43px;max-height:87px;border:1px solid #B7CBD9;background:#FFFFFF!important;border-radius:15px;padding:11px;font:16px Futura,"Avenir Next",Arial,sans-serif;min-width:0;color:#191919!important;-webkit-text-fill-color:#191919!important;caret-color:#191919!important;opacity:1!important;color-scheme:light!important;appearance:none;-webkit-appearance:none}
    .tle-ai-form textarea::placeholder{color:#536A7A!important;-webkit-text-fill-color:#536A7A!important;opacity:1!important}
    .tle-ai-form textarea:focus{border-color:#417BA1!important;outline:2px solid #8DC9ED;outline-offset:1px}
    /* ONE optional greeting: a tiny dark popup anchored above Sonny's right bubble. */
    .tle-sonny-greeting-popup{position:fixed!important;z-index:2147482999!important;right:calc(25px + env(safe-area-inset-right))!important;bottom:calc(141px + env(safe-area-inset-bottom))!important;max-width:min(125px,calc(100vw - 48px))!important;width:max-content!important;min-height:0!important;padding:7px 10px!important;border:1px solid #afd4e9!important;border-radius:12px 12px 5px 12px!important;box-shadow:0 6px 18px rgba(1,16,29,.17)!important;background:rgba(20,43,61,.94)!important;color:#F6FAFD!important;-webkit-text-fill-color:#F6FAFD!important;opacity:1!important;text-align:left!important;font:600 11px/1.35 Futura,"Avenir Next",Arial,sans-serif!important;white-space:normal!important;cursor:pointer!important;transition:opacity .2s ease,transform .2s ease!important}
    .tle-sonny-greeting-popup[hidden],body.tle-ai-chat-open .tle-sonny-greeting-popup{display:none!important}
    .tle-sonny-greeting-popup:focus-visible{outline:3px solid #A9DFFF;outline-offset:3px}
    .tle-ai-form button{background:#191919;color:#fff;border:0;border-radius:14px;padding:0 14px;min-height:43px;font-weight:700;cursor:pointer}
    .tle-ai-form button:disabled{opacity:.55;cursor:not-allowed}
    .tle-ai-review{width:100%;margin:10px 0 0;padding:12px 14px;background:#F2D85B;border:1px solid #dbc04a;color:#191919;border-radius:15px;font-weight:800;font-size:13px;cursor:pointer;text-align:center}
    .tle-ai-review[hidden],.tle-ai-review-tip[hidden]{display:none!important}
    .tle-ai-review-tip{font-size:11px!important;color:#32556D!important;margin:12px 1px 0!important;line-height:1.4!important}

    .tle-ai-sample-summary[hidden],.tle-ai-sample-continue[hidden]{display:none!important}
    .tle-ai-sample-summary{box-sizing:border-box;width:100%;max-width:100%;min-width:0;padding:15px 14px;background:linear-gradient(145deg,#f9fcff,#e9f4fc);border:1px solid #a9cfe5;border-radius:19px;color:#191919;box-shadow:0 8px 20px rgba(35,88,122,.09)}
    .tle-ai-sample-title{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-bottom:12px}
    .tle-ai-sample-title strong{font:800 15px/1.25 Prompt,Arial,sans-serif}
    .tle-ai-sample-title span{font:700 9px/1.3 Futura,Arial,sans-serif;color:#315b74;border:1px solid #a9cfe5;border-radius:9px;padding:5px 6px;white-space:nowrap}
    .tle-ai-sample-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:0}
    .tle-ai-sample-field{background:#fff;border:1px solid #ddebf4;border-radius:12px;padding:9px 10px;min-width:0}
    .tle-ai-sample-field dt{font:700 10px/1.35 Futura,Arial,sans-serif;color:#527083;margin-bottom:3px}
    .tle-ai-sample-field dd{font:700 13px/1.3 Futura,Arial,sans-serif;color:#191919;margin:0;overflow-wrap:anywhere}
    .tle-ai-sample-missing{font:500 11px/1.5 Futura,Arial,sans-serif!important;color:#365c72!important;margin:12px 2px 0!important}
    .tle-ai-sample-continue{width:100%;min-height:44px;margin-top:12px;padding:11px 12px;border:0;border-radius:12px;background:#191919;color:#fff;font:700 13px/1.4 Prompt,Arial,sans-serif;cursor:pointer}
    .tle-ai-sample-continue:focus-visible{outline:3px solid #4088bc;outline-offset:2px}

    @media(max-width:700px){
      .tle-ai-panel{top:var(--tle-ai-vv-top,0px)!important;left:0!important;right:0!important;bottom:auto!important;width:100vw!important;max-width:100vw!important;height:var(--tle-ai-vv-height,100dvh)!important;min-height:0!important;border-radius:0!important;border:0!important;box-shadow:none!important}
      .tle-ai-head{padding-top:max(15px,env(safe-area-inset-top));flex-shrink:0}
      .tle-ai-log{min-height:0;flex:1;padding:15px 12px}
      .tle-ai-foot{flex-shrink:0;padding:10px 12px max(12px,env(safe-area-inset-bottom))}
      .tle-ai-form{display:flex;min-width:0;gap:8px;align-items:flex-end}
      .tle-ai-form textarea{font-size:16px!important;min-width:0;flex:1;width:1px}
       .tle-sonny-greeting-popup{right:calc(24px + env(safe-area-inset-right))!important;bottom:calc(142px + env(safe-area-inset-bottom))!important;max-width:120px!important;padding:7px 10px!important;font-size:10px!important}
       html.demo-editorial.tle-demo-story-v13 body .tle-ai-panel:not([hidden]){top:var(--tle-ai-vv-top,0px)!important;left:0!important;right:0!important;bottom:auto!important;width:100%!important;max-width:100%!important;height:var(--tle-ai-vv-height,100dvh)!important;max-height:none!important;min-height:0!important;border-radius:0!important}
      .tle-ai-form button{flex:0 0 auto;max-width:88px;white-space:nowrap;padding:0 12px}
      body.tle-ai-chat-open{overflow:hidden!important}
      body.tle-ai-chat-open .tle-ai-launch{visibility:hidden}
      .tle-ai-panel{animation:none!important}
    }
    @media(prefers-reduced-motion:no-preference){.tle-ai-panel{animation:tleAiEnter .2s ease-out}@keyframes tleAiEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}}
  `;
  document.head.appendChild(css);
  const launch=document.createElement("button");launch.type="button";launch.className="tle-ai-launch";launch.setAttribute("aria-expanded","false");launch.setAttribute("aria-label",copy.opening);launch.textContent="✦  "+copy.button;
  const panel=document.createElement("section");panel.className="tle-ai-panel";panel.hidden=true;panel.setAttribute("aria-label",copy.title);
  const head=document.createElement("div");head.className="tle-ai-head";
  const identity=document.createElement("div");const label=document.createElement("b");label.textContent=copy.title;const subtitle=document.createElement("small");subtitle.textContent=copy.subtitle;identity.append(label,subtitle);
  const close=document.createElement("button");close.type="button";close.setAttribute("aria-label",copy.close);close.textContent="×";head.append(identity,close);
  const log=document.createElement("div");log.className="tle-ai-log";log.setAttribute("role","log");log.setAttribute("aria-live","polite");attachTleChatMotion(log);
  const foot=document.createElement("div");foot.className="tle-ai-foot";const note=document.createElement("p");note.textContent=copy.note;
  const form=document.createElement("form");form.className="tle-ai-form";const field=document.createElement("textarea");field.placeholder=copy.placeholder;field.rows=1;field.maxLength=350;field.required=true;field.setAttribute("aria-label",copy.placeholder);
  const send=document.createElement("button");send.type="submit";send.textContent=copy.send;form.append(field,send);
  const review=document.createElement("button");review.type="button";review.textContent=copy.review;review.className="tle-ai-review";review.hidden=true;
  const reviewTip=document.createElement("p");reviewTip.className="tle-ai-review-tip";reviewTip.textContent=copy.nextStep;reviewTip.hidden=true;
  foot.append(note,form,reviewTip,review);panel.append(head,log,foot);
  document.body.append(panel,launch);
  let busy=false;
  const dialogue=[];
  let bookingDraft={};
  let handoffShown=false;
  let summaryActive=false;
  const sampleSummary=document.createElement("section");
  sampleSummary.className="tle-ai-sample-summary";
  sampleSummary.hidden=true;sampleSummary.setAttribute("aria-label",es?"Resumen de solicitud de ejemplo":"Sample request summary");
  const sampleHeader=document.createElement("div");sampleHeader.className="tle-ai-sample-title";
  const sampleLabel=document.createElement("strong");
  sampleLabel.textContent=es?"Tu solicitud de ejemplo":"Your sample request";
  const sampleBadge=document.createElement("span");sampleBadge.textContent=es?"NO ENVIADA":"NOT SUBMITTED";
  sampleHeader.append(sampleLabel,sampleBadge);
  const sampleDetails=document.createElement("dl");sampleDetails.className="tle-ai-sample-grid";
  const sampleMissing=document.createElement("p");sampleMissing.className="tle-ai-sample-missing";
  const sampleAction=document.createElement("button");sampleAction.type="button";sampleAction.className="tle-ai-sample-continue";
  sampleAction.textContent=es?"Revisar en el formulario →":"Review in sample form →";
  sampleSummary.append(sampleHeader,sampleDetails,sampleMissing,sampleAction);
  function filled(key){const value=bookingDraft[key];return value!==undefined&&value!==null&&String(value).trim()!=="";}
  function updateSampleSummary(serverSummary,ready){
    const summary=serverSummary&&typeof serverSummary==="object"?serverSummary:{};
    const detail=[
      [es?"Tipo":"Type",bookingDraft.category==="commercial"?(es?"Negocio":"Business"):bookingDraft.category==="residential"?(es?"Casa":"Home"):""],
      [es?"Servicio":"Service",bookingDraft.service||""],
      [es?"Espacio":"Space",summary.space||bookingDraft.property_type||bookingDraft.commercial_space_type||""],
      [es?"Habitaciones":"Bedrooms",bookingDraft.category==="residential"&&filled("bedrooms")?String(bookingDraft.bedrooms):""],
      [es?"Baños":"Bathrooms",bookingDraft.category==="residential"&&filled("bathrooms")?String(bookingDraft.bathrooms):""],
      [es?"Tamaño":"Size",filled("square_feet")?String(bookingDraft.square_feet)+" sq ft":""],
      [es?"Frecuencia":"Frequency",bookingDraft.frequency||""],
      [es?"Código postal":"ZIP",bookingDraft.zip||""],
      [es?"Fecha":"Date",bookingDraft.date||""],
      [es?"Hora":"Time",bookingDraft.time||""]
    ].filter(row=>row[1]!==""&&row[1]!==null&&row[1]!==undefined);
    if(!detail.length)return;
    sampleDetails.replaceChildren();
    detail.forEach(([label,value])=>{
      const line=document.createElement("div");line.className="tle-ai-sample-field";
      const dt=document.createElement("dt"),dd=document.createElement("dd");
      dt.textContent=label;dd.textContent=String(value);line.append(dt,dd);sampleDetails.append(line);
    });
    const missing=Array.isArray(summary.missing)?summary.missing.filter(x=>typeof x==="string"&&x.length<45).slice(0,5):[];
    sampleMissing.textContent=ready?(es?"Revisa el ejemplo antes de continuar. Puedes cambiar los datos en el formulario.":"Review this example before continuing. You can edit details in the form."):(es?"Falta por definir: ":"Still needed: ")+(missing.length?missing.join(" · "):(es?"algunos detalles":"a few details"));
    sampleAction.hidden=!ready;
    sampleSummary.hidden=false;
    if(!sampleSummary.isConnected)log.append(sampleSummary);
    else log.append(sampleSummary);
    if(ready&&!summaryActive){
      summaryActive=true;sampleSummary.scrollIntoView({block:"nearest",behavior:"smooth"});
    }
  }
  function continueToSampleForm(){
    const success=window.tleAIBookingPrefill?.(bookingDraft);
    if(success)toggle(false);else append(copy.error,"bot");
  }
  sampleAction.addEventListener("click",continueToSampleForm);
  review.textContent=es?"Ver el resumen →":"View my sample summary →";
  review.addEventListener("click",()=>{
    sampleSummary.hidden=false;
    if(!sampleSummary.isConnected)log.append(sampleSummary);
    sampleSummary.scrollIntoView({block:"nearest",behavior:"smooth"});
    sampleAction.focus();
  });
  function append(text,who){const div=document.createElement("div");div.className="tle-ai-msg "+who;div.textContent=text;log.appendChild(div);log.scrollTop=log.scrollHeight;return div;}
  append(copy.intro,"bot");
  function syncViewport(){
    if(panel.hidden || window.innerWidth>700)return;
    const vv=window.visualViewport;
    panel.style.setProperty("--tle-ai-vv-top",(vv?vv.offsetTop:0)+"px");
    panel.style.setProperty("--tle-ai-vv-height",(vv?vv.height:window.innerHeight)+"px");
  }
  window.visualViewport?.addEventListener("resize",syncViewport);
  window.visualViewport?.addEventListener("scroll",syncViewport);
  window.addEventListener("orientationchange",()=>window.requestAnimationFrame(syncViewport));
  function toggle(open){
    panel.hidden=!open;
    launch.setAttribute("aria-expanded",open?"true":"false");
    document.body.classList.toggle("tle-ai-chat-open",open);
    if(open){syncViewport();if(window.innerWidth>700)field.focus();}
    else{panel.style.removeProperty("--tle-ai-vv-height");panel.style.removeProperty("--tle-ai-vv-top");launch.focus();}
  }
  // Expose a safe, sample-only way to restart the same existing AI booking agent
  // from the demo confirmation screen. Never triggers submit, email or payment.
  window.tleOpenSonnyDemo = ({restart=false}={}) => {
    if (busy) return false;
    if (restart) {
      dialogue.length=0;
      bookingDraft={};
      handoffShown=false;summaryActive=false;
      sampleSummary.hidden=true;sampleSummary.remove();sampleDetails.replaceChildren();
      field.value="";
      review.hidden=true;
      reviewTip.hidden=true;
      // Restore quick start choices on a fresh safe sample session.
      log.querySelectorAll(".tle-ai-msg").forEach(node=>node.remove());
      const quick=log.querySelector(".tle-demo-v12-chat-actions");if(quick)quick.hidden=false;
      append(copy.intro,"bot");
      threadId = freshThreadId();
    }
    toggle(true);
    return true;
  };
  launch.addEventListener("click",()=>toggle(panel.hidden));
  close.addEventListener("click",()=>toggle(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)toggle(false)});
  field.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(busy)return;
    const message=field.value.trim();
    if(!message)return;
    const conversation_history=dialogue.slice(-8).map(x=>x.role+": "+x.message).join("\n").slice(-1100);
    append(message,"user");field.value="";busy=true;send.disabled=true;
    const wait=append(es?"Escribiendo…":"Typing…","bot");
    const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),27000);
    try{
      const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer_message:message,business_name:business,service_area:area,services_offered:services,thread_id:threadId,language:lang,conversation_history,booking_draft:bookingDraft}),signal:controller.signal});
      const data=await res.json();
      const reply=res.ok&&typeof data.reply==="string"?data.reply:res.status===429?copy.limit:copy.error;
      // Keep the visitor’s question editable if a non-rate-limit server failure occurs.
      if(!res.ok&&res.status!==429&&!field.value.trim())field.value=message;
      wait.textContent=reply;
      if(res.ok&&typeof data.reply==="string"){
        if(data.ready_for_review===true&&handoffShown){
          wait.textContent=es?"Tu solicitud sigue lista para revisar. Toca «Revisar mi solicitud» para completar lo que falte.":"Your request is ready for review. Tap “Review my request” to complete anything missing.";
        }
        dialogue.push({role:"Visitor",message:message.slice(0,230)},{role:"Assistant",message:data.reply.slice(0,230)});
        if(dialogue.length>16)dialogue.splice(0,dialogue.length-16);
        if(data.booking&&typeof data.booking==="object"&&!Array.isArray(data.booking)){
          for(const [key,val] of Object.entries(data.booking)){
            if((typeof val==="string"&&val.trim())||(typeof val==="number"&&Number.isFinite(val)))
              bookingDraft[key]=val;
          }
          const canReview=data.ready_for_review===true||handoffShown;
          review.hidden=!bookingDraft.service||!canReview;
          reviewTip.hidden=review.hidden;
          if(data.ready_for_review===true)handoffShown=true;
          updateSampleSummary(data.summary,canReview);
        }
      }
      else if(res.status===429){send.disabled=true;field.disabled=true;}

    }catch{wait.textContent=copy.error;if(!field.value.trim())field.value=message;}finally{window.clearTimeout(timer);busy=false;if(!field.disabled)send.disabled=false;log.scrollTop=log.scrollHeight;field.focus();}
  });
})();