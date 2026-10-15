/* Public Luna Bloom/sample demo v28: animated but truthful preview identity.
 * No booking state, links, buyer/owner mode or customer records are modified.
 */
(()=>{
  "use strict";
  const q=new URLSearchParams(location.search);
  if(!/\/lead-private-preview\.html$/.test(location.pathname)
     ||q.has("key")||q.get("owner_preview")==="1")return;
  function init(){
    const root=document.documentElement;
    if(!root.classList.contains("demo-editorial")||
       !root.classList.contains("tle-demo-brand-v17"))return;
    if(root.classList.contains("tle-identity-v28"))return;
    const notice=document.querySelector(".top .demo-top-label");
    const logo=document.querySelector("#demoBrandName.tle-sample-wordmark");
    if(!notice||!logo||!logo.querySelector(".tle-bloom-name"))return;
    const es=q.get("lang")==="es";
    const first=document.createElement("span");
    first.className="tle-preview-chip-v28";
    const star=document.createElement("span");
    star.className="tle-preview-star-v28";
    star.setAttribute("aria-hidden","true");
    star.textContent="✦";
    const firstText=document.createElement("span");
    firstText.textContent=es?"DEMO INTERACTIVO":"INTERACTIVE DEMO";
    first.append(star,firstText);
    const second=document.createElement("span");
    second.className="tle-preview-disclaimer-v28";
    second.textContent=es?"SITIO DE EJEMPLO · SIN RESERVAS REALES":
      "SAMPLE WEBSITE · NO LIVE BOOKINGS";
    notice.replaceChildren(first,second);
    logo.classList.add("tle-dynamic-brand-v28");
    root.classList.add("tle-identity-v28");
  }
  // The existing brand script (v17) is ordered before v28, both deferred.
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
