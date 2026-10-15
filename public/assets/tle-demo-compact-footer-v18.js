/* The Launch Era — v18 compact sample footer.
 * Move existing policy links (keeping their live dialog handlers) instead of
 * cloning them. Only applies to the public no-key/no-owner-preview sample.
 */
(()=>{
 "use strict";
 const args=new URLSearchParams(location.search);
 if(location.pathname!=="/lead-private-preview.html"
 ||args.has("key")||args.get("owner_preview")==="1"
 ||!document.documentElement.classList.contains("tle-demo-brand-v17"))return;
 const original=document.querySelector("#demoContact.tle-sample-contact");
 const footer=document.querySelector("footer.demo-footer.tle-demo-full-footer");
 const dialog=document.getElementById("tleDemoLegalDialog");
 if(!original||!footer||!dialog||footer.classList.contains("tle-demo-compact-footer"))return;
 const es=args.get("lang")==="es";
 const strings=es?{
  place:"Miami, Florida · Limpieza residencial",
  contact:"Contacto",privacy:"Privacidad",terms:"Términos",more:"Más",
  sample:"Datos ficticios del demo. No se reciben llamadas, correos ni visitas.",
  label:"Vista de demostración · datos ficticios",
  powered:"Powered by The Launch Era"
 }:{
  place:"Miami, Florida · Home cleaning",
  contact:"Contact",privacy:"Privacy",terms:"Terms",more:"More",
  sample:"Fictional demo details. No calls, emails, or visits are received.",
  label:"Demo preview · fictional details",
  powered:"Powered by The Launch Era"
 };
 const $=s=>original.querySelector(s);
 const brandName=footer.querySelector(".tle-footer-name")?.textContent?.trim()||"Luna Bloom Home Cleaning";
 const phone=$(".tle-sample-phone")?.textContent?.trim()||"(305) 555-0148";
 const email=$(".tle-sample-email")?.textContent?.trim()||"hello@lunabloom.example";
 const address=$(".tle-sample-address")?.textContent?.trim()||"125 Sample Lane, Miami, FL 33131";
 const hours=$(".tle-sample-hours")?.textContent?.trim()||"Mon–Fri 9 AM–5 PM · Sat 8 AM–12 PM";
 const originalLinks=[...footer.querySelectorAll("[data-demo-policy]")];
 const byPolicy=Object.fromEntries(originalLinks.map(x=>[x.dataset.demoPolicy,x]));
 const powered=footer.querySelector(".tle-footer-powered");
 // DOM construction keeps the policy listeners attached and avoids introducing
 // any real links to fabricated phone numbers and non-deliverable demo email.
 const head=document.createElement("div");head.className="tle-mini-footer-head";
 const business=document.createElement("div");business.className="tle-mini-footer-brand";
 const title=document.createElement("strong");title.className="tle-mini-footer-name";title.textContent=brandName;
 const city=document.createElement("span");city.className="tle-mini-footer-place";city.textContent=strings.place;
 business.append(title,city);
 const contact=document.createElement("details");contact.id="demoContact";contact.className="tle-mini-contact";
 const summary=document.createElement("summary");summary.textContent=strings.contact;
 const contactBody=document.createElement("div");contactBody.className="tle-mini-contact-body";
 const row=(value,className)=>{
  const p=document.createElement("p");p.textContent=value;if(className)p.className=className;return p;
 };
 contactBody.append(row(address),row(phone,"tle-sample-phone"),row(email,"tle-sample-email"),row(hours),row(strings.sample,"tle-mini-demo-note"));
 contact.append(summary,contactBody);
 head.append(business,contact);
 const nav=document.createElement("nav");nav.className="tle-mini-footer-links";
 nav.setAttribute("aria-label",es?"Información y políticas":"Information and policies");
 const privacy=byPolicy.privacy,terms=byPolicy.terms,cookies=byPolicy.cookies,access=byPolicy.access;
 if(privacy){privacy.textContent=strings.privacy;nav.append(privacy);}
 if(terms){terms.textContent=strings.terms;nav.append(terms);}
 const more=document.createElement("details");more.className="tle-mini-more";
 const moreSummary=document.createElement("summary");moreSummary.textContent=strings.more;
 const morePanel=document.createElement("div");morePanel.className="tle-mini-more-panel";
 if(cookies)morePanel.append(cookies);
 if(access)morePanel.append(access);
 more.append(moreSummary,morePanel);nav.append(more);
 const bottom=document.createElement("div");bottom.className="tle-mini-footer-bottom";
 const demoNote=document.createElement("small");demoNote.textContent="© 2026 · "+strings.label;
 if(powered){powered.textContent=strings.powered;bottom.append(demoNote,powered);}
 else bottom.append(demoNote);
 original.remove();
 footer.replaceChildren(head,nav,bottom);
 footer.classList.add("tle-demo-compact-footer");
 document.documentElement.classList.add("tle-demo-compact-v18");
 // The top-nav Contact anchor opens the short inline detail instead of an
 // unexpectedly empty/collapsed target.
 document.querySelectorAll('a[href="#demoContact"]').forEach(a=>a.addEventListener("click",event=>{
  event.preventDefault();
  contact.open=true;
  contact.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
 }));
 // Leave modal and provider demo flow untouched.
})();