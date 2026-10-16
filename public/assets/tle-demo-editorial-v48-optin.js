/* v48 — The Launch Era public *sample* booking demo editorial layout.
   No buyer/owner keys, API calls, price calculations, or booking events are changed. */
(()=>{
"use strict";
const query=new URLSearchParams(location.search);
if(location.pathname!=="/lead-private-preview.html"||query.has("key")||query.get("owner_preview")==="1")return;
if(query.get("layout")!=="hotel49")return;
const es=query.get("lang")==="es";
const pictures={
  residential:[
    "/assets/demo-editorial/service-standard.webp",
    "/assets/demo-editorial/service-deep.webp",
    "/assets/demo-editorial/service-move.webp"
  ]
};
const copy=es?{
  eyebrow:"UNA EXPERIENCIA DE LIMPIEZA MÁS SENCILLA",
  title:"Tu hogar, en buenas manos.",
  body:"Elige la limpieza que necesitas. Una experiencia clara, desde el primer clic.",
  storyLabel:"UNA FORMA MÁS CUIDADA DE RESERVAR",
  storyTitle:"Una página tan agradable como llegar a casa.",
  storyText:"Fotos reales de espacios, servicios fáciles de entender y un proceso de reserva sin complicaciones.",
  storyDetail:"Explora servicios, precios de ejemplo y cada paso de una solicitud.",
  photoAlt:"Sala luminosa e impecable",detailAlt:"Cocina moderna y limpia",
  feature1:"Servicios claros",feature2:"Detalles sencillos",feature3:"Una solicitud organizada",
  sample:"DEMOSTRACIÓN INTERACTIVA · NO SE RESERVA NADA"
}:{
  eyebrow:"A MORE THOUGHTFUL CLEANING EXPERIENCE",
  title:"A little more room to breathe.",
  body:"Choose the cleaning you need. A clear experience, from the very first click.",
  storyLabel:"THE BOOKING EXPERIENCE",
  storyTitle:"A booking page that feels as good as coming home.",
  storyText:"Beautiful spaces, easy-to-understand services, and a request process without the back-and-forth.",
  storyDetail:"Explore services, sample prices, and each step of a cleaning request.",
  photoAlt:"Bright spotless modern living room",detailAlt:"Fresh modern kitchen",
  feature1:"Clear services",feature2:"Simple details",feature3:"An organized request",
  sample:"INTERACTIVE SAMPLE · NOTHING IS BOOKED"
};
let ready=false;
function setup(){
 if(ready)return true;
 const root=document.documentElement,hero=document.getElementById("leadHero");
 const stage=hero?.querySelector(".tle46-hero-slot");
 const text=stage?.querySelector(".heroText");
 const list=document.getElementById("residentialServiceList");
 const panel=document.getElementById("bookingStarter");
 if(!root.classList.contains("demo-editorial")||!root.classList.contains("tle-demo-v47")||!root.classList.contains("tle-photo-services-v21")||!stage||!text||!list||!panel||list.querySelectorAll(":scope > button.service.tle-service-has-photo-v21").length<3)return false;
 const tagline=text.querySelector(".demo-hero-tagline");
 const subtitle=text.querySelector(".demo-hero-description");
 const lead=text.querySelector("#leadName");
 if(lead)lead.textContent=copy.eyebrow;
 if(tagline){tagline.textContent=copy.title;tagline.setAttribute("role","heading");tagline.setAttribute("aria-level","1");}
 if(subtitle)subtitle.textContent=copy.body;
 const story=document.createElement("section");
 story.id="tle48Story";
 story.className="tle48-story";
 story.setAttribute("aria-label",copy.storyLabel);
 const photos=document.createElement("div");photos.className="tle48-story-photos";
 const large=document.createElement("img");large.src="/assets/demo-editorial/story-room.webp";
 large.alt=copy.photoAlt;large.width=900;large.height=1000;large.loading="lazy";large.decoding="async";
 const small=document.createElement("img");small.src="/assets/demo-editorial/story-detail.webp";
 small.alt=copy.detailAlt;small.width=500;small.height=420;small.loading="lazy";small.decoding="async";
 large.addEventListener("error",()=>{if(!large.dataset.fallback){large.dataset.fallback="1";large.src="/assets/drive-house-gallery/whole-home.png";}});
 small.addEventListener("error",()=>{if(!small.dataset.fallback){small.dataset.fallback="1";small.src="/assets/drive-house-gallery/pristine-kitchen.png";}});
 photos.append(large,small);
 const body=document.createElement("div");body.className="tle48-story-copy";
 const kicker=document.createElement("span");kicker.className="tle48-story-label";kicker.textContent=copy.storyLabel;
 const heading=document.createElement("h2");heading.textContent=copy.storyTitle;
 const para=document.createElement("p");para.textContent=copy.storyText;
 const detail=document.createElement("p");detail.className="tle48-story-detail";detail.textContent=copy.storyDetail;
 const features=document.createElement("div");features.className="tle48-features";
 [copy.feature1,copy.feature2,copy.feature3].forEach(value=>{
  const item=document.createElement("span");item.textContent=value;features.append(item);
 });
 body.append(kicker,heading,para,features,detail);story.append(photos,body);
 hero.insertAdjacentElement("afterend",story);
 const sample=document.createElement("div");sample.className="tle48-sample-note";
 sample.textContent=copy.sample;stage.append(sample);
 const residential=[...list.querySelectorAll(":scope > button.service.tle-service-has-photo-v21")];
 residential.slice(0,3).forEach((button,index)=>{
  const image=button.querySelector(".tle-service-photo-v21 img");
  if(image){
   image.src=pictures.residential[index];image.alt="";image.removeAttribute("data-drive-photo");
   image.addEventListener("error",()=>{if(!image.dataset.editorialFallback){image.dataset.editorialFallback="1";image.src=["/assets/drive-house-gallery/quiet-luxury.png","/assets/drive-house-gallery/pristine-kitchen.png","/assets/drive-house-gallery/miami-condo.png"][index];}});
  }
 });
 const commercial=document.getElementById("commercialServiceList");
 const commercialCards=[...(commercial?.querySelectorAll(":scope > button.service.tle-service-has-photo-v21")||[])];
 const commercialPhotos=["office","retail","medical","floor"];
 commercialCards.slice(0,4).forEach((card,index)=>{
  const image=card.querySelector(".tle-service-photo-v21 img");
  if(!image)return;
  image.src="/assets/demo-services/"+commercialPhotos[index]+".webp";
  image.alt="";
  image.addEventListener("error",()=>{
   card.classList.add("tle48-nonphoto-commercial");
   image.setAttribute("aria-hidden","true");
  },{once:true});
 });
 // Keep the custom quote path with its checked-area flow, and hide only
 // the older duplicate custom-quote tile when that replacement is present.
 const dynamic=list.querySelector("button.tle-v30-main-custom");
 const old=[...list.querySelectorAll(":scope > button.service")].find(button=>button.getAttribute("onclick")==="startQuote('quote')");
 if(dynamic&&old){old.hidden=true;old.classList.add("tle48-duplicate-quote");}
 root.classList.add("tle-demo-v48");
 // The compact AI launcher is useful, but must sit below the primary hero CTA
 // on narrow phones. Keep the actual Sonny chat and its click handler intact.
 const alignSonny=()=>{
  if(!window.matchMedia("(max-width:759px)").matches)return;
  const launcher=document.querySelector(".tle-ai-launch.tle-demo-condensed");
  if(launcher){
   launcher.style.setProperty("right","calc(12px + env(safe-area-inset-right))","important");
   launcher.style.setProperty("bottom","calc(12px + env(safe-area-inset-bottom))","important");
  }
  const popup=document.getElementById("tleSonnyGreetingPopup");
  if(popup)popup.hidden=true;
 };
 alignSonny();
 window.requestAnimationFrame(alignSonny);
 window.addEventListener("resize",()=>window.requestAnimationFrame(alignSonny),{passive:true});
 ready=true;
 return true;
}
if(!setup()){
 const observer=new MutationObserver(()=>{if(setup())observer.disconnect();});
 observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
 window.addEventListener("load",()=>{if(setup())observer.disconnect();},{once:true});
}
})();
