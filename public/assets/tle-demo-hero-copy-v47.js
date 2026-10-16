/* v47: Short human rotating words belong to the Flip HERO photo, not each service.
   Fictional public sample only. All existing photo nodes/Flip swap, booking and
   quote controls remain owned by previous scripts. */
(()=>{"use strict";
const query=new URLSearchParams(location.search);
if(!/\/lead-private-preview\.html$/.test(location.pathname)||query.has("key")||query.get("owner_preview")==="1")return;
const es=query.get("lang")==="es";
const captions=es?[
 ["Un hogar para",["respirar","descansar","disfrutar"]],
 ["Más espacio para",["vivir","reunirse","sonreír"]],
 ["Cada rincón se siente",["fresco","cuidado","tuyo"]],
 ["Una cocina",["fresca","lista","impecable"]],
 ["Listo para",["compartir","recibir","disfrutar"]]
]:[
 ["A home made for",["breathing","resting","living"]],
 ["More room to",["live","gather","smile"]],
 ["Every corner feels",["fresh","cared for","yours"]],
 ["A kitchen that's",["fresh","ready","spotless"]],
 ["Ready to",["gather","welcome","enjoy"]]
];
function init(){
 const root=document.documentElement,hero=document.getElementById("leadHero");
 if(!root.classList.contains("demo-editorial")||!root.classList.contains("tle-demo-v45")||!hero?.querySelector(".tle46-gallery"))return false;
 if(root.classList.contains("tle-demo-v47"))return true;
 const gallery=hero.querySelector(".tle46-gallery"),stage=hero.querySelector(".tle46-hero-slot");
 const caption=stage.querySelector(".tle46-caption"),heroText=stage.querySelector(".heroText");
 if(!stage||!caption||!heroText)return false;
 root.classList.add("tle-demo-v47");
 // Needed for the Flip image to travel beyond the former rounded hero.
 hero.style.setProperty("overflow","visible","important");
 // Short lines keep the actual hero headline and CTA completely inside the photo.
 const mainHeadline=heroText.querySelector("h1.demo-headline");
 if(mainHeadline){
  const parts=mainHeadline.querySelectorAll("span");
  if(parts[0])parts[0].textContent=es?"Vuelve a casa.":"Come home.";
  if(parts[1])parts[1].textContent=es?"Disfruta más.":"Feel good.";
 }
 const tagline=heroText.querySelector(".demo-hero-tagline");
 const sub=heroText.querySelector(".demo-hero-description");
 const label=heroText.querySelector("#leadName");
 const cta=heroText.querySelector(".demo-hero-cta");
 if(tagline)tagline.innerHTML=es?"Vuelve a casa.<br><em>Disfruta más.</em>":"Come home.<br><em>Feel good.</em>";
 if(sub)sub.textContent=es?"Elige la limpieza que necesitas. Nosotros te mostramos cómo.":"Find the cleaning you need, in a few simple steps.";
 if(label)label.textContent=es?"LUNA BLOOM · DEMO DE LIMPIEZA":"LUNA BLOOM · CLEANING DEMO";
 if(cta){
  const arrow=cta.querySelector(".demo-inline-arrow");
  cta.replaceChildren(document.createTextNode(es?"Ver limpiezas ":"Browse cleanings "));
  if(arrow)cta.append(arrow);
 }
 const area=heroText.querySelector("#demoHeroArea");
 if(area)area.hidden=true;
 // The old caption badge + picture counter are not the requested animated copy.
 caption.setAttribute("aria-label",es?"Frase de la fotografía":"Photo caption");
 const oldLabel=caption.querySelector(".tle46-caption-text");
 const oldCounter=caption.querySelector(".tle46-caption-counter");
 if(oldLabel)oldLabel.setAttribute("aria-hidden","true");
 if(oldCounter)oldCounter.setAttribute("aria-hidden","true");
 const phrase=document.createElement("span");
 phrase.className="tle47-hero-phrase";
 const staticPart=document.createElement("span");staticPart.className="tle47-prefix";
 const rotator=document.createElement("span");rotator.className="tle47-rotator";
 for(let i=0;i<3;i++){
  const w=document.createElement("span");
  w.className="tle47-word";
  w.style.setProperty("--delay",i*2+"s");
  if(i>0)w.setAttribute("aria-hidden","true");
  rotator.append(w);
 }
 phrase.append(staticPart,rotator);
 caption.append(phrase);
 let activeIndex=-1;
 function sync(){
  const n=Number(stage.querySelector("img.tle46-gallery-img")?.dataset.photoIndex??0);
  if(n===activeIndex)return;
  activeIndex=n;
  const [prefix,words]=captions[n]||captions[0];
  staticPart.textContent=prefix+" ";
  [...rotator.children].forEach((word,i)=>word.textContent=words[i]);
  // Announce only the human first word on photo changes, not a repeated counter.
  caption.setAttribute("aria-label",prefix+" "+words[0]);
 }
 const observer=new MutationObserver(sync);
 observer.observe(stage,{childList:true,subtree:false});
 sync();
 window.addEventListener("pagehide",()=>observer.disconnect(),{once:true});
 return true;
}
if(!init()){
 const mo=new MutationObserver(()=>{if(init())mo.disconnect()});
 mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
 window.addEventListener("load",()=>{if(init())mo.disconnect()},{once:true});
}
})();
