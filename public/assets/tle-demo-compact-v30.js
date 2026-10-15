/* v30: public SAMPLE cleaning-site demo only.
   Preserve the real buyer/owner booking engine and tenant data untouched. */
(()=>{
 "use strict";
 const qs=new URLSearchParams(location.search);
 if(!/\/lead-private-preview\.html$/.test(location.pathname)||qs.has("key")||qs.get("owner_preview")==="1")return;
 const es=qs.get("lang")==="es";
 const copy=es?{
  main:"¿No encuentras tu servicio? Otra limpieza / cotización",
  tasks:"¿Qué áreas necesitan atención?",
  help:"Marca todas las opciones que apliquen. Si no aparece algo, elige Otra.",
  other:"Otra necesidad",
  describe:"Cuéntanos qué necesitas para preparar tu cotización",
  placeholder:"Ej.: persianas, paredes, terraza o una limpieza especial",
  error:"Describe brevemente el servicio adicional que necesitas.",
  parts:["Cocina","Baños","Habitaciones","Sala y áreas comunes","Pisos","Polvo y superficies","Ventanas interiores","Otra"],
  quotes:["Cocina","Baños","Dentro de gabinetes","Ventanas","Electrodomésticos","Paredes y zócalos","Otra"],
  commercial:["Oficinas y escritorios","Baños","Pisos","Vidrios interiores","Cocina / descanso","Áreas de alto contacto","Otra"],
  title:"Áreas seleccionadas",
  note:"Detalles adicionales (opcional)"
 }:{
  main:"Not listed? Other service / request a quote",
  tasks:"What would you like cleaned?",
  help:"Check as many as you need. Choose Other if your request isn't listed.",
  other:"Other",
  describe:"Tell us about the custom service you need",
  placeholder:"e.g. blinds, walls, patio, specialty cleaning",
  error:"Please describe the additional service so we can prepare your custom quote.",
  parts:["Kitchen","Bathrooms","Bedrooms","Living areas","Floors","Dusting & surfaces","Interior windows","Other"],
  quotes:["Kitchen","Bathrooms","Inside cabinets","Windows","Appliances","Walls & baseboards","Other"],
  commercial:["Offices & desks","Restrooms","Floors","Interior glass","Breakroom / kitchenette","High-touch surfaces","Other"],
  title:"Selected areas",
  note:"Additional details (optional)"
 };
 const byId=id=>document.getElementById(id);
 const blocks={};
 function taskBlock(id,items,anchor){
  if(!anchor||byId("tleV30Tasks"+id))return;
  const fs=document.createElement("fieldset");
  fs.className="tle-v30-tasklist";fs.id="tleV30Tasks"+id;
  const legend=document.createElement("legend");legend.textContent=copy.tasks;fs.append(legend);
  const hint=document.createElement("p");hint.textContent=copy.help;fs.append(hint);
  const grid=document.createElement("div");grid.className="tle-v30-task-grid";
  let otherBox,otherText,otherError;
  items.forEach((t,i)=>{
   const label=document.createElement("label");label.className="tle-v30-task";
   const input=document.createElement("input");input.type="checkbox";
   input.name="tleV30Area"+id;input.value=t;input.dataset.v30Task=t;
   const span=document.createElement("span");span.textContent=t;
   label.append(input,span);grid.append(label);
   if(i===items.length-1){
    input.dataset.other="1";
    otherBox=document.createElement("div");otherBox.className="tle-v30-other";
    otherBox.hidden=true;
    const txtlabel=document.createElement("label");
    txtlabel.htmlFor="tleV30Other"+id;txtlabel.textContent=copy.describe;
    otherText=document.createElement("textarea");otherText.id="tleV30Other"+id;
    otherText.maxLength=400;otherText.placeholder=copy.placeholder;
    otherError=document.createElement("div");
    otherError.className="tle-v30-error";otherError.setAttribute("role","alert");otherError.hidden=true;
    otherBox.append(txtlabel,otherText,otherError);
    input.addEventListener("change",()=>{
      otherBox.hidden=!input.checked;
      if(!input.checked){otherText.value="";otherError.hidden=true;}
      else otherText.focus({preventScroll:true});
    });
   }
  });
  fs.append(grid,otherBox);
  anchor.insertAdjacentElement("afterend",fs);
  blocks[id]={fieldset:fs,otherText,otherError,
    otherInput:fs.querySelector('[data-other="1"]')};
 }
 function addOtherCTA(listId,target){
  const list=byId(listId);
  if(!list||list.querySelector(".tle-v30-main-custom"))return;
  const btn=document.createElement("button");
  btn.type="button";btn.className="tle-v30-main-custom";
  const t=document.createElement("span");t.textContent=copy.main;
  const a=document.createElement("span");a.setAttribute("aria-hidden","true");a.textContent="↗";
  btn.append(t,a);
  btn.addEventListener("click",()=>{
   if(target==="quote"&&typeof window.startQuote==="function"){
     window.startQuote("quote");
   }else if(target==="commercial"&&typeof window.startCommercial==="function"){
     window.startCommercial("quote","Custom Commercial Cleaning");
   }else{return}
   const b=blocks[target];if(b){
     b.otherInput.checked=true;
     b.otherInput.dispatchEvent(new Event("change",{bubbles:true}));
     b.otherText.scrollIntoView({block:"center",behavior:"smooth"});
   }
  });
  list.append(btn);
 }
 function checkedState(id){
   const b=blocks[id];
   if(!b)return{areas:[],custom:"",valid:true};
   const areas=[...b.fieldset.querySelectorAll('input[type="checkbox"]:checked')]
      .filter(el=>el.dataset.other!=="1").map(el=>el.dataset.v30Task);
   const selected=b.otherInput?.checked;
   const custom=selected?b.otherText.value.trim():"";
   const valid=!selected||custom.length>0;
   b.otherError.textContent=valid?"":copy.error;b.otherError.hidden=valid;
   if(!valid){b.otherText.focus();b.otherText.scrollIntoView({block:"center",behavior:"smooth"});}
   return{areas,custom,valid};
 }
 function addSelectionsToReview(){
   const box=byId("resSummary");if(!box)return;
   box.querySelector(".tle-v30-summary-row")?.remove();
   const b=checkedState("res");if(!b.valid||(!b.areas.length&&!b.custom))return;
   const row=document.createElement("div");row.className="row tle-v30-summary-row";
   const label=document.createElement("span");label.textContent=copy.title;
   const detail=document.createElement("b");detail.textContent=[...b.areas,b.custom].filter(Boolean).join(", ");
   row.append(label,detail);box.append(row);
 }
 function addDemoTransformations(){
   const services=byId("demoServices");
   if(!services||byId("tleV31Transformations"))return;
   const gallery=document.createElement("section");
   gallery.id="tleV31Transformations";
   gallery.className="tle-v31-transformations";
   gallery.setAttribute("aria-labelledby","tleV31Title");
   const labels=es?{
      eyebrow:"ANTES Y DESPUÉS",title:"La diferencia está en los detalles.",
      intro:"Pequeños cambios que se notan. Desliza para ver las comparaciones.",
      note:"Imágenes ilustrativas de nuestra biblioteca del demo. No son resultados verificados de clientes.",
      previous:"Ver ejemplo anterior",next:"Ver siguiente ejemplo",
      before:"Antes",after:"Después",slide:["Dormitorio renovado","Rieles de ventanas","Juntas de ducha"]
    }:{
      eyebrow:"BEFORE & AFTER",title:"See what a fresh reset looks like.",
      intro:"The little details make a difference. Swipe to explore.",
      note:"Illustrative demo-library images, not verified client transformations.",
      previous:"Previous example",next:"Next example",
      before:"Before",after:"After",slide:["Bedroom refresh","Window track detail","Shower tile & grout"]
    };
   const examples=[["bed","bed-before","bed-after"],["track","track-before","track-after"],["grout","grout-before","grout-after"]];
   const top=document.createElement("div");top.className="tle-v31-gallery-top";
   const words=document.createElement("div");
   const overline=document.createElement("span");overline.className="tle-v31-kicker";overline.textContent=labels.eyebrow;
   const heading=document.createElement("h2");heading.id="tleV31Title";heading.textContent=labels.title;
   const intro=document.createElement("p");intro.textContent=labels.intro;
   words.append(overline,heading,intro);
   const buttons=document.createElement("div");buttons.className="tle-v31-controls";
   const prev=document.createElement("button");prev.type="button";prev.textContent="←";prev.setAttribute("aria-label",labels.previous);
   const next=document.createElement("button");next.type="button";next.textContent="→";next.setAttribute("aria-label",labels.next);
   buttons.append(prev,next);top.append(words,buttons);
   const rail=document.createElement("div");rail.className="tle-v31-gallery-rail";
   rail.id="tleV31GalleryRail";rail.setAttribute("tabindex","0");rail.setAttribute("aria-label",labels.eyebrow);
   examples.forEach(([id,before,after],i)=>{
     const card=document.createElement("article");card.className="tle-v31-gallery-card";
     const title=document.createElement("h3");title.textContent=labels.slide[i];
     const photos=document.createElement("div");photos.className="tle-v31-compare-pair";
     [[before,labels.before],[after,labels.after]].forEach(([source,label])=>{
       const tile=document.createElement("figure");tile.className="tle-v31-compare-photo";
       const img=document.createElement("img");
       img.loading="lazy";img.decoding="async";img.width=520;img.height=600;
       img.src="/assets/demo-transformations/"+source+".webp";
       img.alt=labels.slide[i]+" — "+label;
       const caption=document.createElement("figcaption");caption.textContent=label;
       img.addEventListener("error",()=>{
         // No invented before/after or mismatched fallback if a Drive photo cannot build.
         card.remove();
         if(!rail.querySelector(".tle-v31-gallery-card"))gallery.hidden=true;
       },{once:true});
       tile.append(img,caption);photos.append(tile);
     });
     card.append(title,photos);rail.append(card);
   });
   const notice=document.createElement("p");notice.className="tle-v31-gallery-note";notice.textContent=labels.note;
   gallery.append(top,rail,notice);
   const jump=direction=>{
     const card=rail.querySelector(".tle-v31-gallery-card");
     if(!card)return;
     const distance=card.getBoundingClientRect().width+14;
     rail.scrollBy({left:direction*distance,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
   };
   prev.addEventListener("click",()=>jump(-1));next.addEventListener("click",()=>jump(1));
   // Editorial large images first, comparisons next, sample reviews after.
   const reviews=byId("tleDemoReviews");
   if(reviews)reviews.insertAdjacentElement("beforebegin",gallery);
   else services.insertAdjacentElement("afterend",gallery);
 }


 function addEditorialNavigation(){
   const rail=byId("tleDemoEditorialGallery");
   if(!rail||byId("tleV32EditorialControls"))return;
   const cards=[...rail.querySelectorAll(".tle-editorial-photo-card")];
   if(cards.length<2)return;
   rail.setAttribute("role","region");
   rail.setAttribute("aria-roledescription",es?"Carrusel deslizable":"Swipe carousel");
   rail.setAttribute("aria-label",es?"Galería de hogares limpios":"Clean-home photo gallery");
   rail.setAttribute("tabindex","0");
   const controls=document.createElement("nav");
   controls.id="tleV32EditorialControls";
   controls.className="tle-v32-editorial-controls";
   controls.setAttribute("aria-label",es?"Navegación de fotos":"Photo gallery navigation");
   const label=document.createElement("span");
   label.className="tle-v32-editorial-hint";
   label.textContent=es?"DESLIZA PARA EXPLORAR":"SWIPE TO EXPLORE";
   const group=document.createElement("div");group.className="tle-v32-editorial-dots";
   const actions=document.createElement("div");actions.className="tle-v32-editorial-actions";
   const previous=document.createElement("button"),next=document.createElement("button");
   previous.type=next.type="button";
   previous.textContent="←";next.textContent="→";
   previous.setAttribute("aria-label",es?"Foto anterior":"Previous photo");
   next.setAttribute("aria-label",es?"Foto siguiente":"Next photo");
   let current=0;
   const dots=cards.map((_,i)=>{
     const dot=document.createElement("button");dot.type="button";
     dot.setAttribute("aria-label",(es?"Ver foto ":"Show photo ")+(i+1));
     dot.addEventListener("click",()=>go(i));group.append(dot);return dot;
   });
   const update=i=>{
     current=i;
     dots.forEach((dot,n)=>dot.setAttribute("aria-current",String(n===i)));
     cards.forEach((card,n)=>card.classList.toggle("tle-v32-active-photo",i===n));
   };
   const go=i=>{
     const n=(i+cards.length)%cards.length;
     update(n);
     rail.scrollTo({left:cards[n].offsetLeft-cards[0].offsetLeft,
       behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
   };
   previous.addEventListener("click",()=>go(current-1));
   next.addEventListener("click",()=>go(current+1));
   rail.addEventListener("keydown",event=>{
     if(event.key==="ArrowRight"){event.preventDefault();go(current+1)}
     if(event.key==="ArrowLeft"){event.preventDefault();go(current-1)}
   });
   let scheduled=false;
   rail.addEventListener("scroll",()=>{
     if(scheduled)return;scheduled=true;
     requestAnimationFrame(()=>{
       let nearest=0,dist=Infinity;
       cards.forEach((card,i)=>{
         const value=Math.abs(card.offsetLeft-cards[0].offsetLeft-rail.scrollLeft);
         if(value<dist){nearest=i;dist=value}
       });
       update(nearest);scheduled=false;
     });
   },{passive:true});
   actions.append(previous,next);
   controls.append(label,group,actions);
   rail.insertAdjacentElement("afterend",controls);
   update(0);
 }
 function init(){
   if(!document.documentElement.classList.contains("demo-editorial")||!byId("bookingStarter"))return;
   document.documentElement.classList.add("tle-demo-compact-v30");
   addEditorialNavigation();
   addDemoTransformations();
   document.documentElement.classList.add("tle-demo-editorial-order-v32");
   taskBlock("res",copy.parts,byId("freq"));
   taskBlock("quote",copy.quotes,byId("qsize"));
   taskBlock("commercial",copy.commercial,byId("csize"));
   addOtherCTA("residentialServiceList","quote");
   addOtherCTA("commercialServiceList","commercial");
   const qdetails=byId("qdetails"),cdetails=byId("cdetails");
   if(qdetails){qdetails.placeholder=copy.note+" — "+copy.placeholder;}
   if(cdetails){cdetails.placeholder=copy.note+" — "+copy.placeholder;}
   const saveOriginal=window.save;
   if(typeof saveOriginal==="function"){
    window.save=function(request){
      const route=typeof state!=="undefined"?state.route:"";
      const id=route==="residential"?"res":route==="quote"?"quote":route==="commercial"?"commercial":"";
      const selected=checkedState(id);
      if(!selected.valid)return;
      const chosen=[...selected.areas,selected.custom].filter(Boolean);
      const d={...request,areasToClean:selected.areas,otherCleaningRequest:selected.custom};
      if(chosen.length)d.notes=[request.notes,copy.title+": "+chosen.join(", ")].filter(Boolean).join(" · ");
      return saveOriginal(d);
    };
   }
   const originalReview=window.reviewResidential;
   if(typeof originalReview==="function"){
     window.reviewResidential=function(){
       if(!checkedState("res").valid)return;
       const result=originalReview();
       addSelectionsToReview();
       return result;
     };
   }
   // The review and coverage snippets remain visible; redundant long-form
   // narratives are collapsed via sample-only CSS.
   const section=document.querySelector(".tle-demo-v12-sections");
   if(section){
     section.setAttribute("aria-label",es?"Reseñas y área de servicio del demo":"Sample reviews and service coverage");
   }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();