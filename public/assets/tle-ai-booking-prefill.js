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
  function insertInstructions(screenId="res"){
    const screen=$(screenId);
    if(!screen||screen.querySelector(".tleAiPrefillNotice"))return;
    const box=document.createElement("div");
    box.className="tleAiPrefillNotice";
    box.setAttribute("role","status");
    box.style.cssText="padding:12px 14px;border:1px solid #bedbed;border-radius:14px;background:#eaf4fc;font-size:13px;color:#284e69;margin:0 0 18px;line-height:1.45";
    box.textContent=es?"✓ Perfecto. Revisa los datos que ya preparé, completa los que falten y pulsa el botón para revisar tu solicitud. Es una demostración, no una reserva real.":"✓ Okay! Check the details I prepared, complete anything missing, and tap the button to review your request. This is a demo, not a real booking.";
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
    const full=[text(d.first_name,60),text(d.last_name,60)].filter(Boolean).join(" ");
    if(full&&$("name"))$("name").value=full;
    insertInstructions("res");
  }
  function fillQuote(d){
    if(validDate(d.date))$("qdate").value=d.date;
    if(d.time)$("qtime").value=d.time;
    if(d.bedrooms!=null)options($("qsize"),d.bedrooms>=6?"6+ bedrooms":d.bedrooms>=5?"5 bedrooms":"4 bedrooms");
    const notes=[d.square_feet?"Approx. "+d.square_feet+" sq ft":"",text(d.notes,140)].filter(Boolean).join(" · ");
    if(notes)$("qdetails").value=notes;
    const full=[text(d.first_name,60),text(d.last_name,60)].filter(Boolean).join(" ");
    if(full&&$("qname"))$("qname").value=full;
    insertInstructions("quote");
  }
  function fillCommercial(d){
    const names={office:["estimate","Office Cleaning"],retail:["estimate","Retail & Showroom Cleaning"],medical:["quote","Medical / Professional Cleaning"],postconstruction:["quote","Post-Construction Cleaning"],commercial:["estimate","Commercial Cleaning"],quote:["quote","Custom Commercial Cleaning"],estimate:["estimate","Commercial Cleaning"]};
    window.startCommercial?.(...(names[d.service]||names.commercial));
    // Never let the browser's first option (Office) masquerade as an AI classification.
    // Unrecognized spaces, including restaurants, remain Other and keep their original description.
    const described=text(d.commercial_space_description||d.other_business_type||"",100);
    const note=text(d.notes,140);
    const raw=String(d.commercial_space_type||"").trim().toLowerCase();
    const kind={office:"Office",retail:"Retail store","retail store":"Retail store",medical:"Medical / Professional office","medical / professional office":"Medical / Professional office",salon:"Salon / Studio","salon / studio":"Salon / Studio"};
    const known=kind[raw]||(!raw?kind[d.service]:"");
    const restaurant=/\b(?:restaurant|restaurante|café|cafe|bistro|diner|bakery|panader[ií]a)\b/i.test([described,note,raw].join(" "));
    const category=restaurant?"Other":known||"Other";
    options($("ctype"),category);
    window.toggleCommercialOther?.();
    if(category==="Other"&&$("cOtherType")){
      const stated=restaurant?"Restaurant":described||(!kind[raw]&&raw!=="other"?text(d.commercial_space_type,100):"");
      if(stated)$("cOtherType").value=stated;
    }
    if(d.square_feet){
      let size=d.square_feet<1500?"Under 1,500 sq ft":d.square_feet<3000?"1,500–3,000 sq ft":d.square_feet<=5000?"3,000–5,000 sq ft":"5,000+ sq ft";
      options($("csize"),size);
    }
    if(Number.isInteger(d.commercial_floors)&&d.commercial_floors>=1&&$("cFloors"))$("cFloors").value=String(d.commercial_floors);
    if(Number.isInteger(d.commercial_restrooms)&&d.commercial_restrooms>=0&&$("cRestrooms"))$("cRestrooms").value=String(d.commercial_restrooms);
    if(d.commercial_cleaning_window)options($("cCleaningWindow"),d.commercial_cleaning_window);
    if(d.commercial_special_areas&&$("cSpecialAreas"))$("cSpecialAreas").value=text(d.commercial_special_areas,180);
    if(d.frequency){const labels={"one time":"One time",weekly:"Weekly",biweekly:"Custom schedule",monthly:"Custom schedule"};options($("cfreq"),labels[d.frequency]);}
    if(validDate(d.date))$("cdate").value=d.date;
    if(d.time)$("ctime").value=d.time;
    const notes=[d.square_feet?"Approx. "+d.square_feet+" sq ft":"",/^\d{5}$/.test(d.zip||"")?"ZIP "+d.zip:"",text(d.notes,140)].filter(Boolean).join(" · ");
    if(notes)$("cdetails").value=notes;
    if(d.company_name&&$("cbusiness"))$("cbusiness").value=text(d.company_name,100);
    const full=[text(d.first_name,60),text(d.last_name,60)].filter(Boolean).join(" ");
    if(full&&$("cname"))$("cname").value=full;
    insertInstructions("commercial");
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
    if(kind==="commercial"){
      if(!get("ctype")){alert(es?"Elige el tipo de local antes de revisar.":"Choose the business space type before reviewing.");$("ctype")?.focus();return;}
      if(get("ctype")==="Other"&&!get("cOtherType")){alert(es?"Describe el tipo de local, por ejemplo restaurante.":"Please describe the business space, for example restaurant.");$("cOtherType")?.focus();return;}
    }
    let page=$("tleAiExtraReview");
    if(!page){page=document.createElement("div");page.id="tleAiExtraReview";page.className="screen";$("done")?.insertAdjacentElement("beforebegin",page);}
    page.replaceChildren();
    const sum=document.createElement("div");sum.className="summary";page.append(sum);
    const keys=kind==="quote"?
      [[es?"Servicio":"Service","Residential quote / estimate"],[es?"Tamaño":"Size",get("qsize")],[es?"Fecha":"Date",get("qdate")],[es?"Hora":"Time",get("qtime")],[es?"Detalles":"Details",get("qdetails")],[es?"Nombre":"Name",get("qname")],[es?"Correo":"Email",get("qemail")]]:
      [[es?"Servicio":"Service",window.state?.service||get("ctype")],[es?"Tipo de local":"Property",get("ctype")==="Other"?("Other: "+get("cOtherType")):get("ctype")],[es?"Tamaño":"Size",get("csize")],[es?"Pisos":"Floors",get("cFloors")],[es?"Baños":"Restrooms",get("cRestrooms")],[es?"Horario de limpieza":"Cleaning window",get("cCleaningWindow")],[es?"Áreas especiales":"Special areas",get("cSpecialAreas")],[es?"Frecuencia":"Frequency",get("cfreq")],[es?"Fecha":"Date",get("cdate")],[es?"Hora":"Time",get("ctime")],[es?"Detalles":"Details",get("cdetails")],[es?"Negocio":"Business",get("cbusiness")],[es?"Nombre":"Name",get("cname")],[es?"Correo":"Email",get("cemail")]];
    for(const [key,value] of keys){
      if(!value)continue;
      const row=document.createElement("div");row.className="row";
      const label=document.createElement("span");label.textContent=key;
      const strong=document.createElement("b");strong.textContent=value;
      row.append(label,strong);sum.append(row);
    }
    const required=kind==="commercial"
      ?[[get("csize"),es?"tamaño del local":"commercial size"],[get("cfreq"),es?"frecuencia":"frequency"],[get("cbusiness"),es?"nombre del negocio":"business name"],[get("cname"),es?"nombre de contacto":"contact name"]]
      :[[get("qsize"),es?"tamaño de la vivienda":"home size"]];
    const missing=required.filter(([value])=>!value).map(([,name])=>name);
    if(missing.length){
      const notice=document.createElement("div");notice.className="note tle-review-missing";notice.setAttribute("role","status");
      notice.textContent=(es?"Faltan algunos datos. Vuelve y completa: ":"A few details are missing. Go back and complete: ")+missing.join(", ")+".";
      notice.style.cssText="background:#FFF8E8;border:1px solid #EBCB86;color:#684E23;margin:15px 0;padding:15px;border-radius:13px";
      page.append(notice);
    }
    const info=document.createElement("p");info.className="note";info.textContent=es?"Siguiente paso: revisa todos los datos. Cuando estés conforme, pulsa «Confirmar solicitud demo» para terminar. Esta es una prueba: no se envía ninguna reserva real.":"Next step: review all details. When everything looks right, select “Confirm demo request” to finish. This is a preview: no real booking or email is sent.";page.append(info);
    const btn=document.createElement("button");btn.type="button";btn.className="next";btn.textContent=es?"Confirmar solicitud demo":"Confirm demo request";
    if(missing.length){btn.disabled=true;btn.setAttribute("aria-disabled","true");btn.style.opacity=".45";btn.title=es?"Completa los datos pendientes primero":"Complete missing details first";}
    btn.onclick=()=>{if(missing.length)return;kind==="quote"?window.submitQuote?.():window.submitCommercial?.();};page.append(btn);
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