/* TLE: illustrative customer prices corresponding to Owner Center default catalog.
   Static previews only. Do not use for live billing, inventory, or real bookings.
   Existing browser-only Owner Center edits do not propagate to published websites. */
(()=>{
"use strict";
const script=document.currentScript;
const slug=script?.dataset.tleDemoPriceSlug||"";
const catalogs={
 "golden-grid":{tone:"#b88625",kind:"menu",items:[["The Golden Classic",13,0,"/demos/golden-grid/resources/golden-2.png"],["The At-Home Ritual",18,10,"/demos/golden-grid/resources/golden-3.png"],["Morning To Go",9,0,"/demos/golden-grid/resources/golden-6.png"]]},
 "la-vie-in-pink":{tone:"#813942",kind:"menu",items:[["Butter Croissant",6,0,"/demos/la-vie-in-pink/resources/8572492e-4032-4e82-a5d3-7e087ec38613.png"],["Café Crème",5,10,"/demos/la-vie-in-pink/resources/3674f67a-abe7-4116-b01c-19afb41ae3d5.png"],["Weekend Brunch",22,0,"/demos/la-vie-in-pink/resources/28efa0a2-eefe-40b3-9398-b25bb8e0532a.png"]]},
 "havana-19":{tone:"#813a32",kind:"menu",items:[["Ropa Vieja",24,0,"/demos/umbral/photos/UMBRAL_03_Ropa_Vieja.jpeg"],["Camarones Enchilados",27,10,"/demos/umbral/photos/UMBRAL_02_Camarones_Enchilados.jpeg"],["Flan de la Casa",9,0,"/demos/umbral/photos/UMBRAL_04_Flan.jpeg"]]},
 "ivory-and-bloom":{tone:"#b48799",kind:"menu",items:[["Blush Garden",240,0,"/demos/ivory-and-bloom/images/rose-heirloom-pink.webp"],["Midnight Ribbon",280,0,"/demos/ivory-and-bloom/images/midnight-romance-black.webp"],["Sweet Table",85,10,"/demos/ivory-and-bloom/images/raspberry-tartlets.webp"]]},
 "casa-brownie":{tone:"#83513e",kind:"menu",items:[["Brownie Clásico",6,0,"/demos/casa-brownie/assets/sabor-clasico.webp"],["Brownie con Nuez",7,10,"/demos/casa-brownie/assets/sabor-nuez.webp"],["Dulce de Leche",7.5,0,"/demos/casa-brownie/assets/sabor-dulce-de-leche.webp"]]},
 "marea-wigs-miami":{tone:"#397c72",kind:"service",items:[["Private Consultation",65,0,""],["Personal Styling Session",110,15,""],["Wig Care Session",85,0,""]]},
 "lavender-edit":{tone:"#8d75b2",kind:"service",items:[["Lavender Ritual",85,0,"/demos/lavender-edit/photos/03_Lavender_Ritual.png"],["Daily Ritual",115,10,"/demos/lavender-edit/photos/07_Daily_Ritual.png"],["Lavender Gifting Edit",45,0,"/demos/lavender-edit/photos/05_Lavender_Gifting.png"]]},
 "experience-cleaning":{tone:"#497c99",kind:"service",items:[["Standard Home Cleaning",120,0,"/experience-cleaning/photos/portfolio_living_finished.webp"],["Deep Cleaning",220,15,"/experience-cleaning/photos/portfolio_kitchen_finished.webp"],["Move-In / Move-Out",290,0,"/experience-cleaning/photos/portfolio_cleaning_action.webp"]]},
 "wok-social":{tone:"#bd312d",kind:"menu",items:[["Signature Chili Beef Noodles",18,0,"https://thelaunchera.github.io/demo-booking-landing-/wok-social/assets/01-noodle-signature.webp"],["Slow-Braised Beef Bowl",21,10,"https://thelaunchera.github.io/demo-booking-landing-/wok-social/assets/02-noodle-braised-beef.webp"],["Hibachi Shrimp",23,0,"https://thelaunchera.github.io/demo-booking-landing-/wok-social/assets/11-hibachi-shrimp.webp"]]},
 "seasonal-brew":{tone:"#95663b",kind:"menu",items:[["Sugar Cookie Latte",7,0,"https://thelaunchera.github.io/demo-booking-landing-/seasonal-brew/assets/sugar-cookie.webp"],["Gingerbread Latte",7.5,15,"https://thelaunchera.github.io/demo-booking-landing-/seasonal-brew/assets/gingerbread.webp"],["Peppermint Mocha",7.25,0,"https://thelaunchera.github.io/demo-booking-landing-/seasonal-brew/assets/peppermint-mocha.webp"]]},
 "soluna-yoga":{tone:"#a77750",kind:"service",items:[["Morning Flow",24,0,""],["Private Yoga Session",80,10,""],["Gentle Stretch",20,0,""]]}
};
const cfg=catalogs[slug];
if(!cfg||!document.body)return;
const fmt=v=>"$"+Number(v).toFixed(2);
const after=(p,d)=>Math.round(p*100*(1-d/100))/100;
const moneyMarkup=(p,d)=>{
 const sale=fmt(after(p,d));
 return d>0?'<strong>'+sale+'</strong> <del>'+fmt(p)+'</del> <small>'+d+'% off</small>':'<strong>'+sale+'</strong>';
};
const normalize=x=>String(x||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const style=document.createElement("style");
style.id="tle-owner-price-parity-css";
style.textContent=`
.tle-demo-customer-price{display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0 5px;padding:6px 9px;background:#faf8f3;color:#191919;border:1px solid #e1d9cf;border-radius:9px;font:600 12px/1.4 Arial,sans-serif;letter-spacing:0;text-transform:none;text-shadow:none;max-width:100%;vertical-align:middle}
.tle-demo-customer-price strong,.tle-demo-price-collection strong{font-weight:800}
.tle-demo-customer-price del,.tle-demo-price-collection del{color:#827e77;font-size:11px}
.tle-demo-customer-price small,.tle-demo-price-collection .tle-price-off{color:#8e4a30;font-size:10px;font-weight:700}
.tle-demo-price-collection{--tle-price-accent:#191919;padding:clamp(40px,6vw,80px) max(20px,calc((100vw - 1160px)/2));background:#faf8f3;color:#191919;font-family:Arial,sans-serif;isolation:isolate}
.tle-demo-price-collection *{box-sizing:border-box}
.tle-demo-price-collection .tle-price-kicker{font-size:11px;letter-spacing:.16em;font-weight:800;color:var(--tle-price-accent);text-transform:uppercase}
.tle-demo-price-collection h2{font-family:Georgia,serif;color:#191919;font-weight:400;font-size:clamp(31px,4vw,50px);line-height:1.07;margin:13px 0 28px;letter-spacing:-.035em}
.tle-demo-price-collection .tle-price-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.tle-demo-price-collection .tle-price-card{border-radius:15px;border:1px solid #e4dfd6;background:#fff;overflow:hidden;min-width:0;box-shadow:0 8px 25px #1919190b}
.tle-demo-price-collection img{display:block;width:100%;height:175px;object-fit:cover}
.tle-demo-price-collection .tle-price-card-body{padding:16px}
.tle-demo-price-collection h3{font-family:Georgia,serif;font-size:22px;line-height:1.15;margin:0 0 12px;color:#191919;font-weight:500}
.tle-demo-price-collection .tle-price-card-body>div{display:flex;align-items:center;flex-wrap:wrap;gap:9px}
.tle-demo-price-collection .tle-price-note{color:#655f59;font-size:11px;line-height:1.6;margin:18px 0 0}
@media(max-width:650px){.tle-demo-price-collection .tle-price-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.tle-demo-price-collection img{height:125px}.tle-demo-price-collection .tle-price-card-body{padding:12px}.tle-demo-price-collection h3{font-size:18px}.tle-demo-customer-price{font-size:11px}}
@media(max-width:375px){.tle-demo-price-collection .tle-price-grid{grid-template-columns:1fr}.tle-demo-price-collection img{height:150px}}

/* Brand-aware service discovery immediately beneath the hero. */
.tle-demo-price-collection[data-tle-price-kind="service"]{border-top:4px solid var(--tle-price-accent);background:color-mix(in srgb,var(--tle-price-accent) 5%,#faf8f3)}
.tle-demo-price-collection[data-tle-price-kind="service"] .tle-price-card{border-color:color-mix(in srgb,var(--tle-price-accent) 23%,#e4dfd6);box-shadow:0 8px 23px #19191909}
.tle-demo-price-collection[data-tle-price-kind="service"] .tle-price-card-body>div strong{color:var(--tle-price-accent)}
.tle-demo-price-collection[data-tle-price-brand="marea-wigs-miami"]{background:#f4f9f6}
.tle-demo-price-collection[data-tle-price-brand="lavender-edit"]{background:#f8f4f9}
.tle-demo-price-collection[data-tle-price-brand="soluna-yoga"]{background:#f8f4ef}
.tle-demo-price-collection[data-tle-price-brand="experience-cleaning"]{background:#f4f8fa}
@media(max-width:650px){
 .tle-demo-price-collection[data-tle-price-kind="service"]{padding-block:32px 38px}
 .tle-demo-price-collection[data-tle-price-kind="service"] .tle-price-grid{grid-template-columns:minmax(0,1fr);gap:10px}
 .tle-demo-price-collection[data-tle-price-kind="service"] .tle-price-card{display:flex;align-items:stretch;min-width:0;border-radius:13px}
 .tle-demo-price-collection[data-tle-price-kind="service"] .tle-price-card img{flex:0 0 35%;width:35%;height:auto;min-height:108px;object-fit:cover}
 .tle-demo-price-collection[data-tle-price-kind="service"] .tle-price-card-body{display:flex;min-width:0;flex:1;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:7px;padding:15px}
 .tle-demo-price-collection[data-tle-price-kind="service"] h3{margin:0;font-size:clamp(19px,5vw,24px);line-height:1.12}
 .tle-demo-price-collection[data-tle-price-kind="service"] .tle-price-card-body>div{margin-left:auto;gap:5px;align-items:baseline;max-width:100%}
 .tle-demo-price-collection[data-tle-price-kind="service"] .tle-price-card-body>div strong{font-size:18px}
}

`;
document.head.append(style);
let published=false;
function apply(){
 if(!document.body||published)return;
 const missing=[];
 const headings=[...document.querySelectorAll("main h3,main h4,main .product-title,main .product-name,main .service-card strong,main .flavor strong")];
 for(const [name,price,discount,img] of cfg.items){
  const desired=normalize(name);
  const target=headings.find(el=>!el.closest(".tle-demo-price-collection") && (
   normalize(el.textContent)===desired ||
   (slug==="golden-grid" && normalize(el.textContent).replace(/^the /,"")===desired.replace(/^the /,"")) ||
   (slug==="experience-cleaning" && (
      desired==="standard home cleaning" && ["standard cleaning","regular cleaning","standard"].includes(normalize(el.textContent)) ||
      desired==="deep cleaning" && normalize(el.textContent)==="deep cleaning" ||
      desired==="move in move out" && normalize(el.textContent).startsWith("move in move out")
   ))
  ));
  if(target && !target.parentElement?.querySelector('[data-tle-price-for="'+desired+'"]')){
    const badge=document.createElement("span");
    badge.className="tle-demo-customer-price";
    badge.dataset.tlePriceFor=desired;
    badge.setAttribute("aria-label","Demo price "+fmt(after(price,discount))+(discount?" discounted from "+fmt(price):""));
    badge.innerHTML=moneyMarkup(price,discount);
    target.insertAdjacentElement("afterend",badge);
  }else if(!target)missing.push([name,price,discount,img]);
 }
 if(missing.length){
   const section=document.createElement("section");
   section.className="tle-demo-price-collection";
   section.dataset.tlePriceKind=cfg.kind;
   section.dataset.tlePriceBrand=slug;
   section.id="tle-demo-sample-prices";
   section.style.setProperty("--tle-price-accent",cfg.tone);
   section.setAttribute("aria-label",cfg.kind==="service"?"Example service prices":"Example menu prices");
   const title=cfg.kind==="service"?"Explore our services":"Explore the menu";
   const cards=missing.map(([name,price,discount,img])=>{
     const picture=img?'<img src="'+(img.startsWith("/")?"https://thelaunchera.com"+img:img)+'" alt="" loading="lazy">':"";
     const text=document.createElement("span");text.textContent=name;const safe=text.innerHTML||text.textContent.replace(/&/g,"&amp;").replace(/</g,"&lt;");
     return '<article class="tle-price-card">'+picture+'<div class="tle-price-card-body"><h3>'+safe+'</h3><div>'+moneyMarkup(price,discount)+'</div></div></article>';
   }).join("");
   section.innerHTML='<span class="tle-price-kicker">'+(cfg.kind==="service"?"Services · Demo prices":"Selected favorites · Demo prices")+'</span><h2>'+title+'</h2><div class="tle-price-grid">'+cards+'</div><p class="tle-price-note">Illustrative prices for this interactive concept. No payment or booking is processed here.</p>';
   // Position the ORIGINAL price section where visitors make decisions,
   // not by the legal footer. Never duplicate cards or rewrite amounts.
   const catalogAnchors={
     "golden-grid":"#collection",
     "la-vie-in-pink":"#collection",
     "havana-19":"#kitchen",
     "ivory-and-bloom":"#cake-gallery",
     "casa-brownie":"#brownies",
     "wok-social":"#menu",
     "seasonal-brew":"#flavors"
   };
   const place=()=>{
     const hero=document.querySelector("main section.hero, #app section.hero, #root section.hero, section.hero");
     const catalog=document.querySelector(catalogAnchors[slug]||"#collection");
     const anchor=cfg.kind==="service"?hero:(catalog||hero);
     if(!anchor?.parentElement)return false;
     const method=cfg.kind==="service"?"afterend":(catalog?"beforebegin":"afterend");
     const correct=method==="afterend"?anchor.nextElementSibling===section:anchor.previousElementSibling===section;
     if(!correct)anchor.insertAdjacentElement(method,section);
     section.dataset.tlePricePlacement=cfg.kind==="service"?"below-hero":"beside-menu";
     return true;
   };
   if(!place()){
     // Keep prices accessible while a client-rendered hero loads, then move
     // the same node to its correct position as soon as the hero exists.
     const end=document.querySelector("footer");
     if(end?.parentElement)end.insertAdjacentElement("beforebegin",section);
     else document.body.append(section);
     const watch=new MutationObserver(()=>{
       if(place())watch.disconnect();
     });
     watch.observe(document.body,{childList:true,subtree:true});
     setTimeout(()=>watch.disconnect(),12000);
   }
 }
 published=true;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(apply,250),{once:true});
else setTimeout(apply,250);
})();
