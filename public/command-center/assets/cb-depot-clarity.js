/* CB Depot navigation and dashboard readability, presentation only.
   Scoped to the authenticated CB Depot workspace; never calls an API or changes booking data. */
(function(){
 "use strict";
 let mounted=false;
 const $=id=>document.getElementById(id);
 const isCB=()=>document.body?.classList.contains("cb-depot-buyer");
 const spanish=()=>{try{return localStorage.getItem("tle_crm_language")==="es"}catch(_){return false}};
 const t=(en,es)=>spanish()?es:en;
 function group(id,en,es,buttons){
  const details=document.createElement("details");details.id=id;details.className="workspace-nav-group cb-nav-group";
  const summary=document.createElement("summary");summary.dataset.cbEn=en;summary.dataset.cbEs=es;summary.textContent=t(en,es);
  const inner=document.createElement("div");inner.className="workspace-nav-items";
  for(const button of buttons)if(button)inner.append(button);
  details.append(summary,inner);return details;
 }
 function buildNav(){
  const side=$("buyerBusinessSection");if(!side)return;
  const home=$("navOverview"),inbox=$("buyerRequestsNav"),calendar=$("buyerAppointmentsNav"),page=$("buyerBookingPreviewNav");
  if(!home||!inbox||!calendar||!page)return;
  const contacts=$("buyerContactsGroup"),automation=$("buyerAutomationGroup"),configuration=$("buyerConfigurationGroup");
  const faq=configuration?.querySelector('.nav-link[data-target="help"]');
  const customers=group("cbNavCustomers","Customers & care","Clientes y seguimiento",[$("buyerClientsNav"),$("buyerServiceCareNav")]);
  const tools=group("cbNavTools","Business tools","Herramientas",[$("buyerPricingNav"),$("buyerAvailabilityNav"),$("buyerFollowupsNav"),$("buyerEmailsNav")]);
  const help=group("cbNavHelp","Settings & help","Configuración y ayuda",[$("buyerSettingsNav"),faq,$("buyerSupportNav"),$("buyerFeedbackNav")]);
  side.append(home,inbox,calendar,page,customers,tools,help);
  for(const old of [contacts,automation,configuration])if(old)old.hidden=true;
 }
 function relocateDashboard(){
  const root=$("cbDetailingTop"),stats=$("buyerDashboardStats"),share=$("buyerBookingShareCard");
  if(!root||!stats||!share)return;
  const focus=root.querySelector(".cb-dash-focus");
  if(focus&&!$("cbSummaryRow")){
   const legacy=stats.closest(".panel");if(legacy)legacy.classList.add("cb-dash-legacy-summary");
   const row=document.createElement("section");row.id="cbSummaryRow";row.className="cb-summary-row";
   const caption=document.createElement("p");caption.className="cb-summary-heading";caption.dataset.cbEn="AT A GLANCE";caption.dataset.cbEs="RESUMEN DE HOY";caption.textContent=t("AT A GLANCE","RESUMEN DE HOY");
   row.append(caption,stats);
   focus.insertAdjacentElement("afterend",row);
  }
  if(!$("cbDashShareDetails")){
   const details=document.createElement("details");details.id="cbDashShareDetails";details.className="cb-dash-share-details";
   const summary=document.createElement("summary");summary.dataset.cbEn="Share your Booking Page";summary.dataset.cbEs="Comparte tu página de reservas";summary.textContent=t("Share your Booking Page","Comparte tu página de reservas");
   details.append(summary);
   share.parentNode.insertBefore(details,share);details.append(share);
  }
 }
 function labelStats(){
  if(!isCB())return;
  const stats=$("buyerDashboardStats");if(!stats)return;
  const labels=spanish()?["Por revisar","Confirmadas","Cotizaciones"]:["Needs review","Confirmed","Quotes"];
  Array.from(stats.children).slice(0,3).forEach((tile,i)=>{
   const label=tile.querySelector("small");if(!label)return;
   if(!label.dataset.cbFullLabel)label.dataset.cbFullLabel=label.textContent.trim();
   tile.setAttribute("aria-label",label.dataset.cbFullLabel+": "+(tile.querySelector("b")?.textContent||""));
   if(label.textContent!==labels[i])label.textContent=labels[i];
  });
 }
 function syncLabels(){
  if(!mounted||!isCB())return;
  document.querySelectorAll("#buyerBusinessSection [data-cb-en], #buyerDashboardHub [data-cb-en]").forEach(node=>{
   const text=node.getAttribute(spanish()?"data-cb-es":"data-cb-en");if(node.textContent!==text)node.textContent=text;
  });
  labelStats();
 }
 function setup(){
  if(mounted||!isCB())return;
  if(!$("buyerBusinessSection")||!$("cbDetailingTop"))return;
  mounted=true;buildNav();relocateDashboard();syncLabels();
  const stats=$("buyerDashboardStats");
  if(stats){
   const watch=new MutationObserver(labelStats);
   watch.observe(stats,{childList:true});
  }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{setup();const observer=new MutationObserver(setup);observer.observe(document.body,{attributes:true,attributeFilter:["class"]})},{once:true});
 else {setup();const observer=new MutationObserver(setup);observer.observe(document.body,{attributes:true,attributeFilter:["class"]})}
 document.addEventListener("tle-crm-language",()=>{if(isCB())queueMicrotask(syncLabels)});
 window.addEventListener("pageshow",()=>{setup();syncLabels()});
})();
