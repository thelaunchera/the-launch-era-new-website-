/* Public Luna Bloom demo v25: lightweight floating bubbles on TWO blue chapters.
 * Never touches real tenant previews, the hero, service images, or booking flow.
 */
(()=>{
  "use strict";
  const p=new URLSearchParams(location.search);
  if(!/\/lead-private-preview\.html$/.test(location.pathname)
     ||p.has("key")||p.get("owner_preview")==="1")return;

  function init(){
    if(!document.documentElement.classList.contains("tle-editorial-v23")
       ||!document.documentElement.classList.contains("tle-demo-motion-v19"))return;

    const chapters=[
      document.querySelector(".tle-client-quicksteps"),
      document.getElementById("tleDemoBlueRibbon")
    ];
    if(chapters.some(el=>!el))return;
    document.documentElement.classList.add("tle-demo-bubbles-v25");

    chapters.forEach(chapter=>{
      chapter.classList.add("tle-bubble-chapter-v25");
      if(chapter.querySelector(":scope > .tle-bubble-layer-v25"))return;
      const layer=document.createElement("div");
      layer.className="tle-bubble-layer-v25";
      layer.setAttribute("aria-hidden","true");
      for(let i=0;i<7;i++){
        const bubble=document.createElement("span");
        bubble.className="tle-bubble-v25";
        layer.appendChild(bubble);
      }
      chapter.prepend(layer);
    });

    // Motion runs only while each chapter is in view. No intervals, listeners
    // on scroll, or interference with focus/touch targets.
    if(!("IntersectionObserver" in window)){
      chapters.forEach(el=>el.classList.add("tle-bubbles-visible-v25"));
      return;
    }
    const watcher=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        entry.target.classList.toggle("tle-bubbles-visible-v25",entry.isIntersecting);
      });
    },{threshold:0.07});
    chapters.forEach(el=>watcher.observe(el));
  }
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else init();
})();
