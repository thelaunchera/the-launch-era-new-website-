/** v47 QA: user screenshots — hero words, safe gallery and no ghost cards. */
import assert from "node:assert/strict";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const root=(process.env.QA_URL||"http://127.0.0.1:4173").replace(/\/$/,"");
const browser=await chromium.launch({headless:true});
const errors=[];
try {
 for(const [lang,width] of [["en",360],["es",390],["en",820],["es",1440]]){
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:"reduce"});
  const pageErrors=[],writes=[];
  page.on("pageerror",e=>pageErrors.push(e.message));
  page.on("request",r=>{if(["POST","PATCH","PUT","DELETE"].includes(r.method()))writes.push(r.url());});
  try{
   await page.goto(root+"/lead-private-preview.html?lang="+lang,{waitUntil:"load"});
   await page.waitForSelector("html.tle-demo-v47",{timeout:14000});
   const before=await page.evaluate(()=>{
    const hero=document.getElementById("leadHero"),stage=hero.querySelector(".tle46-hero-slot");
    const r=s=>hero.querySelector(s)?.getBoundingClientRect();
    const inside=(a,b)=>a&&b&&a.top>=b.top-2&&a.bottom<=b.bottom+2&&a.left>=b.left-2&&a.right<=b.right+2;
    const b=stage.getBoundingClientRect();
    const words=stage.querySelector(".tle47-hero-phrase");
    const top=r(".tle46-caption"),headline=r(".demo-hero-tagline"),sub=r(".demo-hero-description"),cta=r(".demo-hero-cta");
    return {clip:getComputedStyle(hero).overflow,stripClip:getComputedStyle(hero.querySelector(".tle46-thumb-strip")).overflow,
      heroSrc:stage.querySelector("img")?.getAttribute("src"),
      thumbs:hero.querySelectorAll("button.tle46-thumb-slot").length,
      captions:words?.innerText,wordCount:words?.querySelectorAll(".tle47-word").length,
      heroRect:b.toJSON(),sloganRect:top?.toJSON(),headlineRect:headline?.toJSON(),subRect:sub?.toJSON(),ctaRect:cta?.toJSON(),
      taglineText:hero.querySelector(".demo-hero-tagline")?.innerText,
      oldServiceSlogans:document.querySelectorAll(".tle-v46-photo-words").length,
      within:inside(headline,b)&&inside(sub,b)&&inside(cta,b),
      overlapping:top&&headline&&top.bottom>headline.top,
      scroll:document.documentElement.scrollWidth-innerWidth,
      onlyFirstVisible:[...words?.querySelectorAll(".tle47-word")||[]].map(n=>({animation:getComputedStyle(n).animationName,opacity:getComputedStyle(n).opacity}))
    };
   });
   assert(before.heroSrc?.includes("/assets/drive-house-gallery/"),"Use user gallery assets");
   assert(before.thumbs===4&&before.wordCount===3&&!before.oldServiceSlogans,"Four miniatures, one human rotating caption only in hero: "+JSON.stringify(before));
   assert(before.clip==="visible"&&before.stripClip==="visible","Unclip GSAP flying images: "+JSON.stringify(before));
   assert(before.within&&!before.overlapping,"Hero heading, subheading, CTA or slogan clipped: "+JSON.stringify(before));
   assert(before.scroll<=7,"No horizontal scrolling in hero: "+JSON.stringify(before));
   assert(before.onlyFirstVisible[0].opacity==="1"&&before.onlyFirstVisible.slice(1).every(x=>x.opacity==="0"),"Reduced motion first word static");
   await page.locator(".tle46-thumb-slot").first().click();
   const changed=await page.evaluate(()=>({idx:document.querySelector(".tle46-hero-slot > img")?.dataset.photoIndex,
     text:document.querySelector(".tle47-hero-phrase")?.innerText}));
   assert(changed.idx==="1","Click must exchange real hero photo");
   assert(changed.text.includes(lang==="es"?"Más espacio":"More room"),"Photo-specific words should update: "+JSON.stringify(changed));
   await page.locator(".demo-hero-cta").click();
   await page.waitForSelector("html.tle-demo-booking-active",{timeout:6000});
   const services=await page.evaluate(()=>{
    const c=document.getElementById("commercialServiceList");
    const rows=[...c.querySelectorAll(":scope > button.service")].map(el=>({
      label:el.textContent.trim().slice(0,55),
      hidden:el.hidden,ariaHidden:el.getAttribute("aria-hidden"),display:getComputedStyle(el).display,
      rect:el.getBoundingClientRect().toJSON()}));
    const active=rows.filter(x=>x.rect.height>5&&x.display!=="none");
    const next=document.querySelector("#main .tle-return-home-wrap");
    const last=active.at(-1)?.rect;
    const blank=last&&next?Math.round(next.getBoundingClientRect().top-last.bottom):null;
    const quote=document.querySelector("#residentialServiceList .tle-v34-single-quote");
    const q=quote?.getBoundingClientRect();
    return {rows,blank,quoteWidth:q?.width,quoteRight:q?.right,overflow:document.documentElement.scrollWidth-innerWidth,
      count:document.querySelectorAll("#main .tle-v44-intro").length};
   });
   console.log("V47_SERVICE_GEOMETRY",lang,width,JSON.stringify(services));
   assert(services.rows.filter(x=>x.hidden||x.ariaHidden==="true").every(x=>x.display==="none"),"Hidden service must not reserve a ghost photo slot");
   assert(services.blank==null||services.blank<350,"Large empty block after services: "+JSON.stringify(services));
   assert(services.overflow<=7,"No service horizontal overflow");
   assert(services.quoteRight<=width+7,"Quote action should fit phone");
   assert.deepEqual(writes,[],"No network write from browsing");
   assert.deepEqual(pageErrors,[],"No JS errors");
   await page.goto(root+"/lead-private-preview.html?key=qa-private&lang="+lang,{waitUntil:"load"});
   assert.equal(await page.locator("html.tle-demo-v47").count(),0,"Private client preview must stay untouched");
   assert.equal(await page.locator(".tle47-hero-phrase").count(),0,"No public caption on customer pages");
   console.log("PASS v47",lang,width);
  }catch(e){errors.push(lang+" "+width+" "+e.message);console.error("FAIL v47",lang,width,e.message);}
  finally{await page.close();}
 }
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"no-preference"});
 try{
  await page.goto(root+"/lead-private-preview.html?lang=es",{waitUntil:"load"});
  await page.waitForSelector("html.tle-demo-v47",{timeout:14000});
  const vals=await page.locator(".tle47-word").evaluateAll(nodes=>nodes.map(n=>({animation:getComputedStyle(n).animationName,
    duration:getComputedStyle(n).animationDuration,delay:getComputedStyle(n).animationDelay})));
  assert(vals.every(x=>x.animation==="tle47rotate"&&x.duration==="6s")&&vals.map(x=>x.delay).join(",")==="0s,2s,4s",
   "Human headline should animate 3 words on 6-second cycle: "+JSON.stringify(vals));
  assert(typeof(await page.evaluate(()=>window.Flip))==="object" || !!(await page.evaluate(()=>window.Flip)),"Flip library must be available");
  console.log("PASS v47 normal motion");
 }catch(e){errors.push("motion "+e.message)}
 finally{await page.close();}
} finally {await browser.close()}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
