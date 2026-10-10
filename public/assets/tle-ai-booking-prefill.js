(() => {
  "use strict";
  // AI assistant can prepare a visitor's form, never submit it.
  const qs = new URLSearchParams(location.search);
  if (qs.has("key") || qs.get("owner_preview") === "1") return;
  const es=qs.get("lang")==="es";
  const $=id=>document.getElementById(id);
  const text=(s,max=150)=>String(s??"").replace(/[<>\u0000-\u001f]/g," ").trim().slice(0,max);
  const validDate=d=>typeof d==="string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)) && new Date(d).toISOString().slice(0,10)===d;
  const options=(select,value)=>{
    if(!select||!value)return false;
    const found=Array.from(select.options).find(o=>o.value===value||o.textContent.trim()===value);
    if(!found)return false;select.value=found.value;select.dispatchEvent(new Event("change",{bubbles:true}));return true;
  };
  function insertInstructions(){
    const screen=$("res");
    if(!screen||$("tleAiPrefillNotice"))return;
    const box=document.createElement("div");
    box.id="tleAiPrefillNotice";
    box.setAttribute("role","status");
    box.style.cssText="padding:12px 14px;border:1px solid #bedbed;border-radius:14px;background:#eaf4fc;font-size:13px;color:#284e69;margin:0 0 18px;line-height:1.45";
    box.textContent=es?"✨ Ya completamos los datos que nos diste. Revísalos y añade tus datos de contacto antes de enviar.":"✨ We filled in the details you shared. Review them and add your contact details before sending.";
    screen.insertBefore(box,screen.firstChild);
  }
  function ensureOptionalHomeFields(){
    const beds=$("beds"),baths=$("baths");
    for(const [select,label] of [[beds,es?"Elige habitaciones":"Choose bedrooms"],[baths,es?"Elige baños":"Choose bathrooms"]]){
      if(select&&!select.querySelector('option[value=""]')){const opt=document.createElement("option");opt.value="";opt.textContent=label;select.insertBefore(opt,select.firstChild);select.value="";}
    }
    const time=$("time");
    if(time&&!time.querySelector('option[value=""]')){
      const empty=document.createElement("option");empty.value="";empty.textContent=es?"Elige una hora":"Choose a time";time.insertBefore(empty,time.firstChild);time.value="";
    }
    const parent=$("beds")?.parentElement;
    if(parent&&!$("tleAiSquareFeet")){
      const field=document.createElement("input");field.id="tleAiSquareFeet";field.type="number";field.min="100";field.max="20000";field.step="100";field.inputMode="numeric";field.className="field";field.placeholder=es?"Tamaño aproximado (pies², opcional)":"Approx. square feet (optional)";field.setAttribute("aria-label",field.placeholder);
      parent.insertAdjacentElement("afterend",field);
    }
    const preferredDate=$("date");
    if(preferredDate&&!preferredDate.min){preferredDate.min=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);}
  }
  ensureOptionalHomeFields();
  function fillResidential(d){
    const names={standard:["Standard Cleaning",120],deep:["Deep Cleaning",190],move:["Move In / Move Out",240]};
    const chosen=names[d.service]||names.standard;
    if(d.service in names){window.startResidential?.(...chosen);}
    else {window.startQuote?.(d.service==="estimate"?"estimate":"quote");fillQuote(d);return;}
    if(d.property_type){
      const button=Array.from(document.querySelectorAll("#homes .choice")).find(b=>b.textContent.toLowerCase().includes(d.property_type.toLowerCase()));
      if(button)window.choose?.(button,"home",d.property_type);
    }
    if(d.bedrooms!=null){const val=d.bedrooms>=5?"5+ bedrooms":d.bedrooms+" bedrooms";options($("beds"),val);}
    if(d.bathrooms!=null){const val=d.bathrooms>=4?"4+ bathrooms":d.bathrooms+" bathroom"+(d.bathrooms>1?"s":"");options($("baths"),val);}
    if(d.square_feet!=null&&$("tleAiSquareFeet"))$("tleAiSquareFeet").value=String(d.square_feet);
    if(d.frequency){
      const key={weekly:"Weekly",biweekly:"Biweekly",monthly:"Monthly","one time":"One time"}[d.frequency];
      const s=$("freq");const found=Array.from(s?.options||[]).find(o=>o.textContent.startsWith(key||"never"));
      if(found)s.value=found.value;
    }
    if(/^\d{5}$/.test(d.zip||""))$("zip").value=d.zip;
    if(validDate(d.date))$("date").value=d.date;
    if(d.time){
      const [hh,mm]=d.time.split(":").map(Number);
      if(Number.isInteger(hh)&&Number.isInteger(mm)&&hh>=0&&hh<24&&mm>=0&&mm<60){
        const label=((hh%12)||12)+":"+String(mm).padStart(2,"0")+(hh>=12?" PM":" AM");
        if(!options($("time"),label)){
          const option=document.createElement("option");option.value=label;option.textContent=label+(es?" · solicitado":" · requested");option.dataset.aiSuggested="true";$("time").append(option);$("time").value=label;
        }
      }
    }
    const n=text(d.notes,140);
    if(n){
      let node=$("tleAiJobNotes");
      if(!node){
        node=document.createElement("textarea");node.id="tleAiJobNotes";node.className="field";node.maxLength=300;node.placeholder=es?"Notas sobre la limpieza (opcional)":"Cleaning notes (optional)";
        const zip=$("zip");zip?.insertAdjacentElement("beforebegin",node);
      }
      node.value=n;
    }
    insertInstructions();
  }
  function fillQuote(d){
    if(validDate(d.date))$("qdate").value=d.date;
    if(d.time)$("qtime").value=d.time;
    if(d.bedrooms!=null)options($("qsize"),d.bedrooms>=6?"6+ bedrooms":d.bedrooms>=5?"5 bedrooms":"4 bedrooms");
    const notes=[d.square_feet?"Approx. "+d.square_feet+" sq ft":"",text(d.notes,140)].filter(Boolean).join(" · ");
    if(notes)$("qdetails").value=notes;
  }
  function fillCommercial(d){
    const names={office:["estimate","Office Cleaning"],retail:["estimate","Retail & Showroom Cleaning"],medical:["quote","Medical / Professional Cleaning"],postconstruction:["quote","Post-Construction Cleaning"],commercial:["estimate","Commercial Cleaning"],quote:["quote","Custom Commercial Cleaning"],estimate:["estimate","Commercial Cleaning"]};
    window.startCommercial?.(...(names[d.service]||names.commercial));
    const kind={office:"Office",retail:"Retail store",medical:"Medical / Professional office"};
    if(kind[d.service])options($("ctype"),kind[d.service]);
    if(d.square_feet){
      let size=d.square_feet<1500?"Under 1,500 sq ft":d.square_feet<3000?"1,500–3,000 sq ft":d.square_feet<=5000?"3,000–5,000 sq ft":"5,000+ sq ft";
      options($("csize"),size);
    }
    if(d.frequency){const labels={"one time":"One time",weekly:"Weekly",biweekly:"Custom schedule",monthly:"Custom schedule"};options($("cfreq"),labels[d.frequency]);}
    if(validDate(d.date))$("cdate").value=d.date;
    if(d.time)$("ctime").value=d.time;
    const notes=[d.square_feet?"Approx. "+d.square_feet+" sq ft":"",/^\d{5}$/.test(d.zip||"")?"ZIP "+d.zip:"",text(d.notes,140)].filter(Boolean).join(" · ");
    if(notes)$("cdetails").value=notes;
  }
  // Make every demo request reviewable; no AI-originated message ever submits a request.
  const originalResidentialReview=window.reviewResidential;
  if(typeof originalResidentialReview==="function"){
    window.reviewResidential=function(){
      originalResidentialReview();
      if(!$("resReview")?.classList.contains("on"))return;
      const container=$("resSummary");
      for(const [label,value] of [
        [es?"Tamaño aprox.":"Approx. size",$("tleAiSquareFeet")?.value?$("tleAiSquareFeet").value+" sq ft":""],
        [es?"Notas":"Notes",$("tleAiJobNotes")?.value||""],
        [es?"ZIP":"ZIP",$("zip")?.value||""]
      ]){
        if(!value)continue;
        const row=document.createElement("div");row.className="row";
        const a=document.createElement("span");a.textContent=label;
        const b=document.createElement("b");b.textContent=value;
        row.append(a,b);container.append(row);
      }
    };
  }
  const get=(id)=>$(id)?.value?.trim()||"";
  function showExtraReview(kind){
    let page=$("tleAiExtraReview");
    if(!page){page=document.createElement("div");page.id="tleAiExtraReview";page.className="screen";$("done")?.insertAdjacentElement("beforebegin",page);}
    page.replaceChildren();
    const sum=document.createElement("div");sum.className="summary";page.append(sum);
    const keys=kind==="quote"?
      [[es?"Servicio":"Service","Residential quote / estimate"],[es?"Tamaño":"Size",get("qsize")],[es?"Fecha":"Date",get("qdate")],[es?"Hora":"Time",get("qtime")],[es?"Detalles":"Details",get("qdetails")],[es?"Nombre":"Name",get("qname")],[es?"Correo":"Email",get("qemail")]]:
      [[es?"Servicio":"Service",window.state?.service||get("ctype")],[es?"Tamaño":"Size",get("csize")],[es?"Fecha":"Date",get("cdate")],[es?"Hora":"Time",get("ctime")],[es?"Detalles":"Details",get("cdetails")],[es?"Nombre":"Name",get("cname")],[es?"Correo":"Email",get("cemail")]];
    for(const [key,value] of keys){
      if(!value)continue;
      const row=document.createElement("div");row.className="row";
      const label=document.createElement("span");label.textContent=key;
      const strong=document.createElement("b");strong.textContent=value;
      row.append(label,strong);sum.append(row);
    }
    const info=document.createElement("p");info.className="note";info.textContent=es?"Comprueba los datos. La solicitud solo se envía cuando pulses confirmar.":"Check your details. Nothing is submitted until you confirm.";page.append(info);
    const btn=document.createElement("button");btn.type="button";btn.className="next";btn.textContent=es?"Confirmar solicitud demo":"Confirm demo request";
    btn.onclick=()=>kind==="quote"?window.submitQuote?.():window.submitCommercial?.();page.append(btn);
    const back=document.createElement("button");back.type="button";back.className="back";back.textContent=es?"← Editar detalles":"← Edit details";
    back.onclick=()=>window.show?.(kind,kind==="quote"?"Residential Quote / Estimate":"Commercial Quote / Estimate",kind==="quote"?"RESIDENTIAL":"COMMERCIAL");page.append(back);
    window.show?.("tleAiExtraReview",es?"Revisa tu solicitud":"Review your request","REVIEW");
  }
  if($("quoteSubmit"))$("quoteSubmit").onclick=()=>showExtraReview("quote");
  if($("commercialSubmit"))$("commercialSubmit").onclick=()=>showExtraReview("commercial");
  window.tleAIBookingPrefill=function(draft){
    if(!draft||typeof draft!=="object"||!draft.service)return false;
    const d={...draft};
    if(d.category==="commercial"||["office","retail","medical","postconstruction","commercial"].includes(d.service)){
      fillCommercial(d);
    } else if(["estimate","quote"].includes(d.service)){
      window.startQuote?.(d.service);fillQuote(d);
    } else{
      fillResidential(d);
    }
    document.querySelector(".panel")?.scrollIntoView({block:"start",behavior:"smooth"});
    return true;
  };
})();