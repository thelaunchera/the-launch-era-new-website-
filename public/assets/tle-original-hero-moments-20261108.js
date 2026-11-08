/* TLE · Original campaign photography belongs in the story, not only behind hero motion.
   Brand-scoped progressive enhancement; never touches orders, checkout or UI controls. */
(()=>{"use strict";
  const brand=document.documentElement.dataset.tleOneMotion;
  const configs={
    "casa-brownie":{source:"assets/hero-brownies.webp",after:[".cb-store-story","#momentos"],en:["HANDMADE WITH LOVE","The little details, up close.","From the first warm brownie to the ribbon on the box, every detail is worth savoring."],es:["HECHO CON CARIÑO","Los pequeños detalles, de cerca.","Desde el primer brownie hasta el lazo de la caja, cada detalle se disfruta."]},
    "golden-grid":{source:"resources/golden-1.png",after:["#collection",".collection"],en:["THE GOLDEN MOMENT","Made for slow mornings.","A little butter, golden waffles and all the reasons to make the morning yours."],es:["EL MOMENTO DORADO","Para mañanas sin prisa.","Waffles dorados, un poco de mantequilla y razones para disfrutar la mañana."]},
    "aftr":{source:"assets/hero-real-20261031.webp",after:["#experience",".experience-section"],en:["AFTER DARK","A night worth remembering.","Lights, music and moments that stay with you long after the night ends."],es:["DESPUÉS DEL ANOCHECER","Una noche para recordar.","Luces, música y momentos que se quedan contigo después de la noche."]},
    "ivory-and-bloom":{source:"images/hero-cake-artist.webp",after:["#story",".story"],en:["BEHIND THE BEAUTY","Every flower, thoughtfully placed.","A personal touch for a celebration that feels like yours."],es:["DETRÁS DE CADA DETALLE","Cada flor, puesta con intención.","Un detalle personal para una celebración que se sienta tuya."]},
    "marea-wigs-miami":{source:"resources/01-hero.png",after:["#ritual","#moodboard","#collection",".ritual",".collection"],en:["THE MAREA EDIT","Your next look, your way.","Movement, texture and confidence made for Miami days."],es:["EL ESTILO MAREA","Tu próximo look, a tu manera.","Movimiento, textura y confianza para los días de Miami."]},
    "sova":{source:"resources/01-hero.png",after:["#feeling",".feeling"],en:["IN YOUR OWN WORLD","A little room for your own rhythm.","Signature cobalt. Soft ivory. A sound that feels like yours."],es:["EN TU PROPIO MUNDO","Tu espacio, tu propio ritmo.","Azul cobalto, marfil suave y un sonido tan tuyo como tu estilo."]}
  };
  const cfg=configs[brand];if(!cfg)return;
  const id="tle-original-campaign-"+brand;
  const base=document.baseURI;
  const style=document.createElement("style");
  style.textContent=String.raw`
    .tle-original-hm{--original-bg:#f5f0e9;--original-ink:#241c19;background:var(--original-bg);color:var(--original-ink);margin:clamp(34px,5vw,78px) auto;padding:clamp(22px,5vw,68px);max-width:1460px;width:min(94%,1460px);border-radius:clamp(15px,2.4vw,32px);display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:clamp(22px,5vw,80px);align-items:center;box-sizing:border-box;overflow:hidden}
    .tle-original-hm__copy{min-width:0;max-width:460px}
    .tle-original-hm__kicker{display:block;font:700 10px/1.5 "DM Sans",Arial,sans-serif;letter-spacing:.18em;margin-bottom:18px}
    .tle-original-hm h2{font:500 clamp(34px,4.6vw,72px)/1.04 Georgia,serif;letter-spacing:-.04em;overflow-wrap:break-word;margin:0 0 20px}
    .tle-original-hm p{font:400 clamp(15px,1.25vw,18px)/1.65 "DM Sans",Arial,sans-serif;margin:0;max-width:39ch}
    .tle-original-hm figure{margin:0;overflow:hidden;border-radius:clamp(10px,1.4vw,22px);min-width:0;aspect-ratio:1.28}
    .tle-original-hm figure img{display:block;width:100%;height:100%;object-fit:contain;background:transparent;transform:none!important;filter:none!important}
    html[data-tle-one-motion="casa-brownie"] .tle-original-hm{--original-bg:#f7ebe1;--original-ink:#513429}
    html[data-tle-one-motion="golden-grid"] .tle-original-hm{--original-bg:#dbeaf8;--original-ink:#173b72}
    html[data-tle-one-motion="aftr"] .tle-original-hm{--original-bg:#1a1323;--original-ink:#f0e7fa}
    html[data-tle-one-motion="ivory-and-bloom"] .tle-original-hm{--original-bg:#fcf3ee;--original-ink:#5a383a}
    html[data-tle-one-motion="marea-wigs-miami"] .tle-original-hm{--original-bg:#f5e9e4;--original-ink:#422b31}
    html[data-tle-one-motion="sova"] .tle-original-hm{--original-bg:#dce9fb;--original-ink:#123e83}
    html:not([lang="es"]) .tle-original-hm [lang="es"],html[lang="es"] .tle-original-hm [lang="en"]{display:none}
    @media(max-width:720px){.tle-original-hm{grid-template-columns:1fr;width:calc(100% - 28px);padding:23px;margin:35px auto;gap:25px}.tle-original-hm figure{aspect-ratio:1.28}.tle-original-hm h2{font-size:clamp(36px,10vw,50px)}}
    @media(prefers-reduced-motion:reduce){.tle-original-hm,.tle-original-hm *{animation:none!important;transition:none!important}}
  `;
  document.head.appendChild(style);
  function wording(lang){
    const a=cfg[lang];
    const holder=document.createElement("div");holder.lang=lang;
    const k=document.createElement("span");k.className="tle-original-hm__kicker";k.textContent=a[0];
    const h=document.createElement("h2");h.textContent=a[1];
    const p=document.createElement("p");p.textContent=a[2];
    holder.append(k,h,p);return holder;
  }
  function inject(){
    if(document.getElementById(id))return;
    const after=cfg.after.map(sel=>document.querySelector(sel)).find(Boolean);
    if(!after)return;
    const section=document.createElement("section");section.id=id;section.className="tle-original-hm";
    const copy=document.createElement("div");copy.className="tle-original-hm__copy";
    copy.append(wording("en"),wording("es"));
    const figure=document.createElement("figure");
    const img=document.createElement("img");img.loading="lazy";img.decoding="async";
    img.alt=brand.replace(/-/g," ").toUpperCase()+" original campaign photography";
    img.src=new URL(cfg.source,base).href;
    figure.append(img);section.append(copy,figure);
    after.insertAdjacentElement("afterend",section);
  }
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;inject()});}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
  const root=document.querySelector("#app")||document.querySelector("main")||document.body;
  new MutationObserver(changes=>{
    if(document.getElementById(id))return;
    if(changes.some(c=>[...c.addedNodes].some(n=>n.nodeType===1)))schedule();
  }).observe(root,{subtree:true,childList:true});
})();