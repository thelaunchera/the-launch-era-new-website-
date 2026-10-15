/* TLE public sample v21 — service photography from user's shared Drive gallery.
 * Images are publicly viewable Drive photos. This script never reads business
 * records, edits prices, alters booking handlers or touches buyer/owner keys.
 */
(()=>{
"use strict";
const params=new URLSearchParams(location.search);
if(location.pathname!=="/lead-private-preview.html"||params.has("key")||params.get("owner_preview")==="1")return;
const init=()=>{
if(!document.documentElement.classList.contains("demo-editorial"))return;
const sample=document.querySelector("#bookingStarter #main");
const residential=document.querySelector("#residentialServiceList");
const commercial=document.querySelector("#commercialServiceList");
if(!sample||!residential||!commercial||residential.classList.contains("tle-photo-services-v21"))return;
document.documentElement.classList.add("tle-photo-services-v21");
residential.classList.add("tle-photo-services-grid-v21");
commercial.classList.add("tle-photo-services-grid-v21");
const es=params.get("lang")==="es";
const files={
  regular:["1iVGFc3xiJ_9h6XBDLKw9ED90FqXOTV-_","/assets/lead-demo/cleaner-in-home.png",
    es?"Profesional limpiando una cocina moderna":"Professional cleaner wiping a bright modern kitchen"],
  deep:["1T8IwsLz7trh4MXDg4LZhygijvGvpwfms","/assets/lead-demo/pristine-kitchen.png",
    es?"Profesional limpiando la mampara de una ducha":"Professional cleaner polishing a shower"],
  move:["1gWI0VX9T4deCt1mO2CQm9V0OUCwfyepi","/assets/lead-demo/hero-luxury-home.png",
    es?"Entrada limpia de una vivienda lista para mudarse":"Freshly cleaned empty entryway, ready for move-in"],
  office:["1Y4f_6WNZzddPTJ_6tmsZzryNhuu_xD1V","/assets/lead-demo/spotless-office.png",
    es?"Espacio de oficina profesional":"Bright professional shared office workspace"],
  retail:["1D-i5Iwx8wsS64eT9pKoYYEk4nGrAU3VT","/assets/lead-demo/spotless-office.png",
    es?"Limpieza de cristales en un espacio comercial":"Professional cleaner detailing glass in a commercial space"],
  medical:["1VPTEfj4eP3Ehx6Uhj2RTaBrmRGpEVGFB","/assets/lead-demo/cleaner-in-home.png",
    es?"Profesional limpiando minuciosamente una entrada":"Professional cleaner detailing a business entrance"],
  floor:["1AI4lKiquJe8Y52mtzBOlGsFtt61KCtF7","/assets/lead-demo/spotless-office.png",
    es?"Operario de limpieza puliendo un suelo comercial":"Professional operating a commercial floor-cleaning machine"]
};
const attach=(list,items)=>{
  const buttons=[...list.querySelectorAll(":scope > button.service")];
  items.forEach((name,i)=>{
    const button=buttons[i],file=files[name];
    if(!button||!file||button.querySelector(".tle-service-photo-v21"))return;
    button.classList.add("tle-service-has-photo-v21");
    const wrap=document.createElement("span");
    wrap.className="tle-service-photo-v21";wrap.setAttribute("aria-hidden","true");
    const picture=document.createElement("img");
    picture.loading="lazy";picture.decoding="async";
    picture.width=840;picture.height=560;
    picture.alt="";
    picture.src="https://drive.google.com/thumbnail?id="+encodeURIComponent(file[0])+"&sz=w960";
    picture.dataset.drivePhoto=file[0];
    picture.addEventListener("error",()=>{
       if(picture.dataset.fallback==="1")return;
       picture.dataset.fallback="1";picture.src=file[1];
    },{once:true});
    wrap.appendChild(picture);
    button.prepend(wrap);
    const body=button.querySelector(".demo-service-body");
    if(body){body.setAttribute("data-photo-label",file[2]);}
  });
  buttons.slice(items.length).forEach(b=>b.classList.add("tle-service-secondary-v21"));
};
attach(residential,["regular","deep","move"]);
attach(commercial,["office","retail","medical","floor"]);
// Keep all call-to-action handlers exactly as authored. Repeated notices were
// visually overpowering on mobile; the single retained note stays readable.
const disclaimers=sample.querySelectorAll(".demo-services-note");
disclaimers.forEach(n=>{
 n.classList.add("tle-services-disclaimer-v21");
 n.textContent=es
  ?"Servicios y precios de ejemplo. El negocio confirma el alcance y la tarifa final."
  :"Sample services and prices. The business confirms scope and final pricing.";
});
const intro=sample.querySelector(".label");
if(intro)intro.classList.add("tle-services-label-v21");
// Make category buttons clearly segmented without changing their onclick.
document.querySelector("#categoryTabs")?.classList.add("tle-service-tabs-v21");
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();