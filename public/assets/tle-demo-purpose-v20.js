/* The Launch Era · sample demo v20 · purposeful local coverage + topic-based FAQ.
 * No calls, real ZIP verification, analytics writes or tenant modifications.
 */
(()=>{
 "use strict";
 const start=()=>{
  const p=new URLSearchParams(location.search);
  if(!/\/lead-private-preview\.html$/.test(location.pathname)||p.has("key")||p.get("owner_preview")==="1"
   ||!document.documentElement.classList.contains("demo-editorial"))return;
  const es=p.get("lang")==="es";
  const section=document.querySelector("#tleDemoAreas");
  const faq=document.querySelector("#tleDemoFaq");
  if(!section||!faq||section.classList.contains("tle-demo-area-v20"))return;
  document.documentElement.classList.add("tle-demo-purpose-v20");
  section.classList.add("tle-demo-area-v20");
  faq.classList.add("tle-demo-faq-v20");
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");
  const t=es?{
   areaEy:"02 / CERCA DE TI · VISTA DE EJEMPLO",
   areaTitle:"Tu próxima limpieza, más cerca.",
   areaIntro:"Elige una zona para explorar cómo funcionaría una solicitud. La disponibilidad siempre la confirma el negocio.",
   areaUnknown:"Las zonas se añadirán cuando el negocio confirme su cobertura.",
   areaPrompt:"EXPLORAR ZONA",
   areaResult:"Viendo la zona:",
   pending:"La disponibilidad se confirma después de revisar tu solicitud.",
   sample:"Zonas ilustrativas de este demo, no cobertura confirmada.",
   supplied:"Área indicada para este demo. El negocio confirma los ZIP y la disponibilidad.",
   action:"Ver cómo reservar",
   note:"La demostración no envía ninguna solicitud real.",
   faqEy:"03 / RESPUESTAS A TU RITMO",
   faqTitle:"Antes de pedir tu limpieza.",
   faqIntro:"Elige lo que te interesa. Una respuesta clara y el siguiente paso.",
   topics:["Estimados","Frecuencia","Reservas","Con Sonny"],
   next:["Probar un estimado","Explorar servicios","Ver cómo funciona","Preguntarle a Sonny"],
   nextNote:"Estás explorando una demostración interactiva."
  }:{
   areaEy:"02 / IN YOUR NEIGHBORHOOD · SAMPLE",
   areaTitle:"A fresh home, closer to you.",
   areaIntro:"Pick an area to explore how a request would work. The business always confirms availability.",
   areaUnknown:"Locations will appear after the business confirms its service coverage.",
   areaPrompt:"EXPLORE A LOCATION",
   areaResult:"Previewing:",
   pending:"Availability is confirmed after the business reviews your request.",
   sample:"Illustrative demo areas, not confirmed service coverage.",
   supplied:"Area provided for this demo. The business confirms ZIP codes and availability.",
   action:"See how booking works",
   note:"This interactive demo does not send a real request.",
   faqEy:"03 / GOOD TO KNOW",
   faqTitle:"A few things worth knowing.",
   faqIntro:"Choose a topic for one clear answer and a helpful next step.",
   topics:["Estimates","Repeat visits","Booking","Meet Sonny"],
   next:["Try an estimate","Explore services","See how it works","Ask Sonny"],
   nextNote:"You're exploring an interactive preview."
  };
  // The business supplied area is the only grounded prospect location.
  // The generic fictional Luna Bloom demo deliberately uses labeled example zones.
  const suppliedBusiness=(p.get("business")||"").trim();
  const generic=!suppliedBusiness||(!p.has("rid")&&/^Coastal Home Cleaning$/i.test(suppliedBusiness));
  const raw=(p.get("area")||"").slice(0,200);
  const parsed=raw.split(/[,;|]/).map(s=>s.trim().replace(/[<>\u0000-\u001f]/g,"")).filter(Boolean).slice(0,6);
  const areas=parsed.length?parsed:generic?["Miami","Miami Beach","Coral Gables","Doral","Kendall"]:[];
  const ey=section.querySelector(".tle-demo-v12-ey");
  const title=section.querySelector("#tleAreasTitle");
  const intro=title?.nextElementSibling;
  if(ey)ey.textContent=t.areaEy;
  if(title)title.textContent=t.areaTitle;
  if(intro)intro.textContent=t.areaIntro;
  const inside=section.querySelector(":scope > div");
  const tags=section.querySelector("#tleDemoAreaTags");
  const origDisclaimer=section.querySelector(".tle-demo-v12-disclaimer");
  if(!inside||!tags)return;
  if(origDisclaimer)origDisclaimer.textContent=parsed.length?t.supplied:generic?t.sample:t.areaUnknown;
  const prompt=document.createElement("div");prompt.className="tle-area-v20-label";
  prompt.textContent=t.areaPrompt;inside.insertBefore(prompt,tags);
  tags.replaceChildren();
  const feedback=document.createElement("p");
  feedback.className="tle-area-v20-feedback";
  feedback.setAttribute("aria-live","polite");
  const button=document.createElement("a");
  button.href="#bookingStarter";
  button.className="tle-area-v20-cta";
  button.textContent=t.action+" →";
  const note=document.createElement("small");
  note.className="tle-area-v20-note";note.textContent=t.note;
  if(areas.length){
   const buttons=areas.map((area,i)=>{
    const item=document.createElement("button");
    item.className="tle-area-v20-chip";item.type="button";
    item.setAttribute("aria-pressed",i===0?"true":"false");
    const pin=document.createElement("span");
    pin.className="tle-area-v20-pin";pin.setAttribute("aria-hidden","true");pin.textContent="⌖";
    const name=document.createElement("span");name.textContent=area;
    item.append(pin,name);
    item.addEventListener("click",()=>{
     buttons.forEach(b=>b.setAttribute("aria-pressed",b===item?"true":"false"));
     feedback.textContent=t.areaResult+" "+area+" · "+t.pending;
     if(!reduce.matches){
      feedback.classList.remove("tle-area-v20-pulse");
      void feedback.offsetWidth;feedback.classList.add("tle-area-v20-pulse");
     }
    });
    tags.append(item);return item;
   });
   feedback.textContent=t.areaResult+" "+areas[0]+" · "+t.pending;
  }else{
   const message=document.createElement("span");
   message.className="tle-area-v20-empty";
   message.textContent=t.areaUnknown;
   tags.append(message);feedback.textContent=t.pending;
  }
  tags.after(feedback,button,note);
  // A small visual icon follows the photography, not a fictional map pin.
  const badge=document.createElement("span");
  badge.className="tle-area-v20-photo-mark";
  badge.setAttribute("aria-hidden","true");badge.textContent="✧";
  section.append(badge);
  // FAQ: native details preserve semantics; display just one topic at a time.
  const fEy=faq.querySelector(".tle-demo-v12-ey");
  const fTitle=faq.querySelector("#tleFaqTitle");
  const fIntro=fTitle?.nextElementSibling;
  if(fEy)fEy.textContent=t.faqEy;
  if(fTitle)fTitle.textContent=t.faqTitle;
  if(fIntro)fIntro.textContent=t.faqIntro;
  const grid=faq.querySelector(".tle-demo-v12-faqgrid");
  const entries=grid?[...grid.querySelectorAll(":scope > details")]:[];
  if(entries.length!==4)return;
  const topics=document.createElement("div");
  topics.className="tle-faq-v20-topics";
  topics.setAttribute("role","group");
  topics.setAttribute("aria-label",es?"Tema de pregunta":"Question topics");
  const answer=document.createElement("p");
  answer.className="tle-faq-v20-hint";answer.textContent=t.nextNote;
  const action=document.createElement("a");
  action.className="tle-faq-v20-action";
  action.href="#bookingStarter";action.textContent=t.next[0]+" →";
  const controls=entries.map((entry,i)=>{
    entry.hidden=i!==0;entry.open=i===0;
    entry.classList.add("tle-faq-v20-entry");
    entry.id="tleFaqTopic"+(i+1);
    const tab=document.createElement("button");
    tab.type="button";tab.className="tle-faq-v20-tab";tab.textContent=t.topics[i];
    tab.setAttribute("aria-controls",entry.id);
    tab.setAttribute("aria-pressed",i===0?"true":"false");
    tab.addEventListener("click",()=>pick(i));
    topics.append(tab);return tab;
  });
  function pick(i){
    controls.forEach((control,n)=>{
      control.setAttribute("aria-pressed",n===i?"true":"false");
      entries[n].hidden=n!==i;
      entries[n].open=n===i;
    });
    action.textContent=t.next[i]+" →";
    if(i===3){action.href="#tleDemoFaq";action.dataset.sonny="1";}
    else{action.href="#bookingStarter";delete action.dataset.sonny;}
    if(!reduce.matches){
     grid.classList.remove("tle-faq-v20-change");
     void grid.offsetWidth;grid.classList.add("tle-faq-v20-change");
    }
  }
  grid.before(topics);
  const next=document.createElement("div");next.className="tle-faq-v20-next";
  next.append(action,answer);grid.after(next);
  // Explicit click only: asking the assistant never opens it automatically.
  action.addEventListener("click",event=>{
   if(action.dataset.sonny!=="1")return;
   event.preventDefault();
   const opened=window.tleOpenSonnyDemo?.();
   if(!opened){
    const launch=document.querySelector(".tle-ai-launch");
    if(launch)launch.click();
   }
  });
  // Animate sections only on entry, never make content inaccessible without JS.
  if(!reduce.matches&&"IntersectionObserver" in window){
   const obs=new IntersectionObserver((events)=>{
    events.forEach(e=>{if(e.isIntersecting){e.target.classList.add("tle-purpose-visible");obs.unobserve(e.target);}});
   },{threshold:.14});
   obs.observe(section);obs.observe(faq);
  }else{section.classList.add("tle-purpose-visible");faq.classList.add("tle-purpose-visible");}
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
 else start();
})();