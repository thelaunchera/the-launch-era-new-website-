/* CB Depot-only premium booking experience. Reuses the existing secure quote submission. */
(()=>{
"use strict";
const photos={
 "hero": "/assets/clients/cb-depot/photos/hero-desktop.webp",
 "heroMobile": "/assets/clients/cb-depot/photos/hero-mobile.webp",
 "interior": "/assets/clients/cb-depot/photos/card-interior.webp",
 "exterior": "/assets/clients/cb-depot/photos/card-exterior.webp",
 "paint": "/assets/clients/cb-depot/photos/card-paint.webp",
 "full": "/assets/clients/cb-depot/photos/card-full.webp",
 "deep": "/assets/clients/cb-depot/photos/interior.webp",
 "custom": "/assets/clients/cb-depot/photos/panda-on-bmw.webp"
};
const names=[
 {key:"interior",desc:"Fresh, clean cabin"},
 {key:"exterior",desc:"A shine worth noticing"},
 {key:"deep",desc:"A thorough interior reset"},
 {key:"paint",desc:"Protect the finish"},
 {key:"full",desc:"Inside and out"},
 {key:"custom",desc:"Tailored to your car"}
];
function node(tag,cls,content){const el=document.createElement(tag);if(cls)el.className=cls;if(content!==undefined)el.textContent=content;return el}
function field(label,tag,id,opts){
 const wrapper=node("label","cb-field"),name=node("span","cb-field-label",label);wrapper.append(name);
 const input=document.createElement(tag);input.id=id;input.className="cb-control";
 if(opts?.placeholder)input.placeholder=opts.placeholder;
 if(opts?.type)input.type=opts.type;
 if(opts?.required)input.required=true;
 if(opts?.maxLength)input.maxLength=opts.maxLength;
 if(opts?.items)for(const val of opts.items)input.add(new Option(val,val));
 wrapper.append(input);return wrapper;
}
function activate(session){
 if(!document.body.classList.contains("vehicle-booking")||document.body.dataset.cbPremium==="ready")return;
 document.body.dataset.cbPremium="ready";
 // Use CB Depot's approved custom icon only on CB Depot's own landing.
 for(const rel of ["icon","apple-touch-icon"]){
   let link=document.querySelector('link[rel="'+rel+'"]');
   if(!link){link=document.createElement("link");link.rel=rel;document.head.append(link)}
   link.href=rel==="icon"?"/assets/clients/cb-depot/approved-favicon-192.png?v=20261010":"/assets/clients/cb-depot/approved-favicon-180.png?v=20261010";if(rel==="icon")link.type="image/png";
 }

 const model=session.model;
 const services=(model.services||[]).filter(x=>x.active!==false);
 if(!services.length)return;
 const hero=document.querySelector("#leadHero"),img=document.querySelector("#baseHeroImage"),top=document.querySelector(".heroText");
 // A client-uploaded real image can replace the illustrated default; never use the childlike SVG as the hero.
 const candidate=String(model.branding?.hero_image||"");
 const customImage=candidate && !candidate.endsWith(".svg") && !/images\.pexels\.com/.test(candidate);
 img.hidden=false;
 img.src=(customImage&&!candidate.includes("/assets/clients/cb-depot/photos/hero-desktop.webp"))?candidate:(matchMedia("(max-width: 620px)").matches?photos.heroMobile:photos.hero);
 img.alt="Modern car at a professional auto detailing studio";
 img.loading="eager";img.fetchPriority="high";
 img.onerror=()=>{img.onerror=null;img.src=photos.hero};
 hero.style.backgroundImage="none";
 document.getElementById("basePhotoLabel").hidden=true;
 top.querySelector(":scope > img")?.remove();
 top.querySelector("small").textContent="CB DEPOT · CAR DETAILING";
 top.querySelector("h1").innerHTML="Professional car detailing, <em>made simple.</em>";
 const subtitle=document.getElementById("baseDescription");
 subtitle.textContent="Give your vehicle the attention it deserves. Choose your detail and request a time in just a few steps.";
 const nav=document.querySelector(".base-nav");
 // On-page branding uses the client's original panda illustration without a colored tile.
 // Only the installed-app icon uses the approved square PNG favicon.
 const headerMark=document.querySelector("#baseBusiness img");
 if(headerMark){headerMark.src="/assets/clients/cb-depot/panda-original-mark.svg";headerMark.alt="CB Depot panda mark";headerMark.removeAttribute("srcset")}
  const brandLabel=document.querySelector("#baseBusiness strong");
 if(brandLabel){
  const brandStack=node("span","cb-brand-stack");
  const brandName=node("strong","", "CB DEPOT");
  const strap=node("small","", "PREMIUM CAR DETAILING");
  brandStack.append(brandName,strap);
  brandLabel.replaceWith(brandStack);
 }
 const howLink=document.querySelector(".base-links a[href='#how']");
 if(howLink){howLink.href="#booking";howLink.textContent="Booking"}
 const menuBtn=node("button","cb-menu-toggle","☰");
 menuBtn.type="button";menuBtn.setAttribute("aria-label","Open CB Depot menu");menuBtn.setAttribute("aria-expanded","false");
 const menu=node("div","cb-mobile-menu");
 menu.hidden=true;
 for(const [label,href] of [["Services","#services"],["Get a quote","#booking"],["Reviews","#baseReviews"],["Contact Us","#cbContact"]]){
  const link=node("a","",label);link.href=href;
  link.addEventListener("click",()=>{menu.hidden=true;menuBtn.setAttribute("aria-expanded","false")});
  menu.append(link);
 }
 menuBtn.addEventListener("click",()=>{menu.hidden=!menu.hidden;menuBtn.setAttribute("aria-expanded",String(!menu.hidden))});
 nav.append(menuBtn,menu);
 document.querySelector(".base-nav .base-button").textContent="Get a quote";
 const buttons=top.querySelectorAll(".base-button");
 if(buttons[0])buttons[0].textContent="Start booking →";
 if(buttons[1])buttons[1].textContent="See services";
 const badge=document.createElement("span");badge.className="cb-photo-notice";badge.textContent="Auto detailing · Boynton Beach, FL";top.append(badge);
 const trust=document.querySelector(".trust");
 trust.replaceChildren();
 const points=[["⚡","Fast requests","Only a few steps"],["▤","Custom quotes","For your vehicle"],["◷","Mon–Fri · 7 AM–7 PM","Boynton Beach, FL"]];
 for(const [symbol,title,caption] of points){const item=node("div","cb-trust");item.append(node("span","cb-trust-symbol",symbol));const info=node("div");info.append(node("strong","",title),node("small","",caption));item.append(info);trust.append(item)}
 const sec=document.getElementById("services");
 const secHead=sec.querySelector(":scope > div");
 if(secHead){secHead.prepend(node("span","cb-kicker","OUR SERVICES"));const btn=secHead.querySelector(".base-button");if(btn)btn.remove()}
 document.getElementById("baseServiceTitle").textContent="Choose a service";
 document.getElementById("baseServiceCopy").textContent="Select what your vehicle needs. Every quote is personalized.";
 const grid=document.getElementById("baseServiceGrid");
 const allCards=[...grid.querySelectorAll(".base-service-card")];
 const featuredNames=["Exterior Detailing","Paint Protection","Interior Detailing","Full Detail Package"];
 const cards=featuredNames.map(name=>allCards.find(c=>c.querySelector("h3")?.textContent?.toLowerCase()===name.toLowerCase())).filter(Boolean);
 // Full catalog stays in the wizard, while the landing shows the four core photographic services.
 const featuredServices=cards.map(c=>services.find(s=>s.name===c.querySelector("h3")?.textContent));
 if(cards.length===4)grid.replaceChildren(...cards);
 else cards.splice(0,cards.length,...allCards);

 cards.forEach((card,i)=>{
  const title=(card.querySelector("h3")?.textContent||"").toLowerCase();
  const key=title.includes("exterior")?"exterior":title.includes("paint")?"paint":title.includes("interior")?"interior":title.includes("full")?"full":"custom";
  const desc={exterior:"Deep clean and restore the finish.",paint:"Protection and lasting shine.",interior:"A cleaner, fresher interior.",full:"Complete interior and exterior care.",custom:"Designed for your car."};
  const src=String(model.branding?.service_photos?.[key]||photos[key]);
  const cover=node("div","cb-service-photo");
  cover.style.backgroundImage='url("'+src+'")';
  cover.setAttribute("role","img");cover.setAttribute("aria-label","Car detailing service illustration");
  card.prepend(cover);
  const h=card.querySelector("h3"),p=card.querySelector("p");
  if(p)p.textContent=desc[key];
  const arrow=node("span","cb-service-arrow","›");card.append(arrow);
 });

 const contact=node("section","cb-contact");
 contact.id="cbContact";
 contact.innerHTML=`
 <div class="cb-contact-head"><span class="cb-kicker">QUESTIONS? WE'RE HERE</span>
 <h2>Contact Us</h2>
 <p>Have a question about detailing your car? Send CB Depot a message. No booking form required.</p></div>
 <form id="cbContactForm" class="cb-contact-form" autocomplete="on">
  <label>Full name <input name="customer_name" type="text" maxlength="160" required autocomplete="name" placeholder="Your full name"></label>
  <label>Email <input name="customer_email" type="email" maxlength="200" required autocomplete="email" placeholder="you@example.com"></label>
  <label>Phone (optional) <input name="customer_phone" type="tel" maxlength="80" autocomplete="tel" placeholder="Phone number"></label>
  <label>What can we help with? <textarea name="message" required maxlength="1200" rows="4" placeholder="Tell us what you need..."></textarea></label>
  <label class="cb-trap" aria-hidden="true">Leave this empty <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
  <button type="submit" class="cb-go">Send message →</button>
  <p class="cb-contact-status" role="status" aria-live="polite"></p>
 </form>`;
 const contactForm=contact.querySelector("form");
 contactForm.addEventListener("submit",async ev=>{
  ev.preventDefault();
  if(!contactForm.reportValidity())return;
  const status=contact.querySelector(".cb-contact-status"),button=contactForm.querySelector("button[type=submit]");
  const data=new FormData(contactForm),customer_name=String(data.get("customer_name")||"").trim();
  const customer_email=String(data.get("customer_email")||"").trim().toLowerCase();
  const message=String(data.get("message")||"").trim();
  if(!customer_name||!customer_email||!message){status.textContent="Complete your name, email and message.";return}
  if(session.sendingContact)return;
  if(new URLSearchParams(location.search).get("owner_preview")==="1"){
   status.textContent="Private preview only — no message sent.";
   return;
  }
  const booking_key=new URLSearchParams(location.search).get("key")||"";
  if(!booking_key){status.textContent="Contact form unavailable until the booking page is published.";return}
  session.sendingContact=true;button.disabled=true;button.textContent="Sending…";status.textContent="";
  try{
   const res=await fetch("https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-flow-inquiry",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     booking_key,request_type:"inquiry",request_intent:"inquiry",source:"booking_page_contact",
     preferred_language:session.language||"en",customer_name,customer_email,
     customer_phone:String(data.get("customer_phone")||"").trim(),service_name:"General question",
     notes:message,website:String(data.get("website")||"")
    })
   });
   const reply=await res.json().catch(()=>({}));
   if(!res.ok)throw Error(reply.error||"Could not send this message. Please try again.");
   contactForm.reset();
   status.textContent="Thank you! Your message was sent to CB Depot.";
  }catch(err){status.textContent=err instanceof Error?err.message:"Could not send your message."}
  finally{session.sendingContact=false;button.disabled=false;button.textContent="Send message →"}
 });

 const booking=document.getElementById("booking");
 sec.insertAdjacentElement("afterend",booking);
 document.querySelectorAll(".base-section:not(#baseReviews)").forEach(el=>el.classList.add("cb-extra-section"));
 const reviews=document.getElementById("baseReviews");
 if(reviews)reviews.insertAdjacentElement("afterend",contact);
 else document.getElementById("services").insertAdjacentElement("afterend",contact);
 const closing=document.querySelector(".base-closing");
 if(closing){
  closing.querySelector("h2").textContent="Get a custom quote today.";
  closing.querySelector("p").textContent="Professional detailing, personalized for your vehicle. Better care, a better ride.";
  closing.style.setProperty("--cb-closing-photo",'url("'+(customImage?candidate:photos.hero)+'")');
  const button=closing.querySelector(".base-button");if(button)button.textContent="Get a quote →";
 }
 booking.querySelector(".ey").textContent="EASY BOOKING";
 booking.querySelector(".head h2").textContent="Schedule your service";
 booking.querySelector(".count").textContent="3 QUICK STEPS";
 const panda=document.querySelector("#baseBusiness img");
 if(panda){const badge=node("div","cb-booking-panda");const duplicated=panda.cloneNode(true);duplicated.alt="CB Depot panda";badge.append(duplicated);booking.prepend(badge)}
 const main=document.getElementById("main"),quote=document.getElementById("quote");
 main.classList.remove("on");quote.classList.add("on");
 const addons=document.getElementById("realQuoteAddons");
 const wizard=node("div","cb-wizard");
 wizard.innerHTML=`
 <div class="cb-progress" aria-label="Booking steps"><span data-stage-indicator="1" class="active"><b>1</b> Vehicle</span><i></i><span data-stage-indicator="2"><b>2</b> Date & time</span><i></i><span data-stage-indicator="3"><b>3</b> Details</span></div>
 <div class="cb-stage" data-stage="1">
   <h3>Tell us about your ride</h3><p class="cb-stage-help">Pick a detailing service and your vehicle type.</p>
   <div id="cbServiceField"></div>
   <div class="cb-field-label cb-type-label">What type of vehicle do you have?</div>
   <div class="cb-vehicles" role="group" aria-label="Vehicle type">
    <button type="button" data-cb-vehicle="Car"><span>🚘</span>Car</button>
    <button type="button" data-cb-vehicle="SUV"><span>🚙</span>SUV</button>
    <button type="button" data-cb-vehicle="Truck"><span>🛻</span>Truck</button>
    <button type="button" data-cb-vehicle="Van"><span>🚐</span>Van</button>
   </div>
   <input type="hidden" id="qtype" value="">
   <div id="cbConditionField"></div>
   <p class="cb-error" id="cbStep1Error" role="status"></p>
   <button type="button" class="cb-go" id="cbNext1">Continue to date & time →</button>
 </div>
 <div class="cb-stage" data-stage="2" hidden>
   <h3>When works for you?</h3><p class="cb-stage-help">Monday–Friday · 7:00 AM–7:00 PM. Your time is a request until confirmed.</p>
   <div class="cb-2cols" id="cbDateFields"></div>
   <p class="cb-error" id="cbStep2Error" role="status"></p>
   <div class="cb-stage-actions"><button type="button" class="cb-prev" data-cb-back="1">← Back</button><button type="button" class="cb-go" id="cbNext2">Continue →</button></div>
 </div>
 <div class="cb-stage" data-stage="3" hidden>
   <h3>One last thing…</h3><p class="cb-stage-help">Where can we send your custom quote?</p>
   <div id="cbVehicleDetails"></div><div id="cbExtras"></div><div id="cbContactDetails"></div>
   <p class="cb-policy">Your appointment and final price will be confirmed by CB Depot. No payment is collected here.</p>
   <button type="button" class="cb-go" id="quoteSubmit">Request my detailing quote →</button>
   <button type="button" class="cb-prev" data-cb-back="2">← Back</button>
 </div>`;
 quote.replaceChildren(wizard);
 document.getElementById("cbServiceField").append(field("Detailing service","select","cbService",{items:services.map(x=>x.name)}));
 document.getElementById("cbConditionField").append(field("Vehicle condition","select","qsize",{items:["Light cleaning","Moderate dirt / buildup","Heavy stains or odors","Not sure"]}));
 const dateField=field("Preferred date","input","qdate",{type:"date",required:true});
 dateField.querySelector("input").min=new Date().toISOString().slice(0,10);
 // A native time input can overflow the mobile-sized private preview on iPad/Safari.
 // Keep the same valid 30-minute business slots, using a predictable full-width select.
 const timeField=field("Preferred time","select","qtime",{required:true});
 const timeInput=timeField.querySelector("select");
 const placeholder=new Option("Select a time","");placeholder.disabled=true;placeholder.selected=true;
 timeInput.add(placeholder);
 for(let minutes=7*60;minutes<=18*60+30;minutes+=30){
  const hour24=Math.floor(minutes/60),minute=minutes%60;
  const value=String(hour24).padStart(2,"0")+":"+String(minute).padStart(2,"0");
  const display=(hour24%12||12)+":"+(minute===0?"00":"30")+(hour24<12?" AM":" PM");
  timeInput.add(new Option(display,value));
 }
 document.getElementById("cbDateFields").append(dateField,timeField);
 document.getElementById("cbVehicleDetails").append(field("Year / make / model","input","vehicleMakeModel",{placeholder:"e.g. 2021 Toyota Camry",maxLength:120}),field("Anything we should know?","textarea","qdetails",{placeholder:"Stains, pet hair, special areas or requests"}));
 if(addons){
   const addonWrap=document.getElementById("cbExtras");
   addonWrap.append(node("div","cb-field-label","Optional add-ons"),addons);
 }
 const contacts=document.getElementById("cbContactDetails");contacts.className="cb-contact-grid";
 contacts.append(
  field("Full name","input","qname",{placeholder:"Your full name",required:true}),
  field("Email address","input","qemail",{type:"email",placeholder:"you@example.com",required:true}),
  field("Phone","input","qphone",{type:"tel",placeholder:"Your phone number"}),
  field("Service address","input","qaddress",{placeholder:"Street, city, ZIP"}));
 // No new external backend: reuse the existing secure quote handler and account-specific service IDs.
 const controls=[...document.querySelectorAll(".cb-vehicles button")];
 let vehicle="";
 const selectService=document.getElementById("cbService");
 function syncService(){
  const choice=services.find(s=>s.name===selectService.value)||services[0];
  session.service=choice;state.serviceId=choice.id;state.service=choice.name;
  state.mode="quote";state.intent="quote";state.route="quote";state.category="residential";
  cards.forEach(c=>c.classList.toggle("cb-selected",c.querySelector("h3")?.textContent===choice.name));
 }
 function selectVehicle(value){
  vehicle=value;document.getElementById("qtype").value=value;
  controls.forEach(b=>{const chosen=b.dataset.cbVehicle===value;b.classList.toggle("active",chosen);b.setAttribute("aria-pressed",chosen?"true":"false")});
 }
 controls.forEach(b=>b.addEventListener("click",()=>{selectVehicle(b.dataset.cbVehicle);document.getElementById("cbStep1Error").textContent=""}));
 selectService.addEventListener("change",syncService);
 function goto(step){
  wizard.querySelectorAll(".cb-stage").forEach(e=>e.hidden=Number(e.dataset.stage)!==step);
  wizard.querySelectorAll("[data-stage-indicator]").forEach(x=>x.classList.toggle("active",Number(x.dataset.stageIndicator)===step));
  wizard.dataset.currentStep=String(step);
  booking.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
 }
 function validDate(){const date=document.getElementById("qdate").value,time=document.getElementById("qtime").value;
  if(!date||!time)return false;const day=new Date(date+"T12:00:00").getDay();
  return day>0&&day<6&&time>="07:00"&&time<="18:30";}
 document.getElementById("cbNext1").onclick=()=>{if(!vehicle){document.getElementById("cbStep1Error").textContent="Choose your vehicle type to continue.";return}goto(2)};
 document.getElementById("cbNext2").onclick=()=>{if(!validDate()){document.getElementById("cbStep2Error").textContent="Choose a weekday between 7 AM and 6:30 PM.";return}goto(3)};
 wizard.querySelectorAll("[data-cb-back]").forEach(x=>x.onclick=()=>goto(Number(x.dataset.cbBack)));
 document.getElementById("quoteSubmit").onclick=()=>window.submitQuote();
 cards.forEach((card,i)=>{
  card.onclick=e=>{e.preventDefault();selectService.value=card.querySelector("h3")?.textContent||services[0].name;syncService();goto(1);};
 });
 document.querySelectorAll(".base-button[href='#booking']").forEach(a=>a.addEventListener("click",()=>{syncService();goto(1)}));
 syncService();selectVehicle("Car"); 
 // CB Depot only — cinematic on-scroll reveals with a light-touch hero parallax.
 // Keep the quote wizard, links, and form interactions unchanged.
 function initCBScrollExperience(){
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduced||!("IntersectionObserver" in window))return;
  const selectors=[
   ".trust .cb-trust",
   "#services .cb-kicker","#services #baseServiceTitle",
   "#services #baseServiceCopy","#services .base-service-card",
   ".base-section .base-feature",".base-section .base-step",
   "#baseReviews .base-review",".base-closing","#cbContact"
  ];
  const elements=[...new Set(selectors.flatMap(selector=>[...document.querySelectorAll(selector)]))];
  elements.forEach((element,index)=>{
   element.classList.add("cb-reveal");
   element.style.setProperty("--cb-reveal-delay",(index%3)*85+"ms");
  });
  document.body.classList.add("cb-motion-ready");
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add("cb-in-view");
    observer.unobserve(entry.target);
   });
  },{threshold:0.08,rootMargin:"0px 0px -30px 0px"});
  elements.forEach(el=>observer.observe(el));
  const heroImage=document.querySelector("#leadHero .base-hero-image");
  let frameRequested=false;
  const update=()=>{
   frameRequested=false;
   if(!heroImage)return;
   const rect=hero.getBoundingClientRect();
   if(rect.bottom<0||rect.top>window.innerHeight)return;
   const shift=Math.max(-35,Math.min(35,-rect.top*.085));
   heroImage.style.setProperty("--cb-parallax",shift.toFixed(1)+"px");
  };
  const schedule=()=>{
   if(frameRequested)return;
   frameRequested=true;
   requestAnimationFrame(update);
  };
  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",schedule,{passive:true});
  schedule();
 }
 initCBScrollExperience();

 // Keep the quote data within the standard backend model, avoiding any house fields.
 document.getElementById("baseFooterBusiness").textContent="CB Depot";
}
window.TLECBDepotEnhance=activate;
})();