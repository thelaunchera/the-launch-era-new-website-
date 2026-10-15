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
      .map(el=>el.dataset.v30Task).filter(v=>v!==copy.other);
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
 function init(){
   if(!document.documentElement.classList.contains("demo-editorial")||!byId("bookingStarter"))return;
   document.documentElement.classList.add("tle-demo-compact-v30");
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