import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium, webkit } from "playwright";

const base = process.env.QA_URL || "http://127.0.0.1:4191";
const out = path.join("qa-screenshots", "aftr-banner");
fs.mkdirSync(out, {recursive:true});
for(const browserType of [chromium,webkit]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const width of [360,390,768,1024,1440,1920]){
   const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
   await page.emulateMedia({reducedMotion:"no-preference"});
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto(base+"/demos/aftr/",{waitUntil:"load"});
   const data=await page.evaluate(async()=>{
    const banner=document.querySelector(".ticker.ticker-poster-banner");
    const v=document.querySelector("#aftrHeroVideo");
    if(!banner||!v)return {missing:true};
    const box=banner.getBoundingClientRect();
    const style=getComputedStyle(banner);
    const sourceImage=new Image();
    sourceImage.src=new URL("assets/aftr-approved-las-vegas-banner-20261031.webp",location.href).href;
    await sourceImage.decode();
    const tileProbe=document.createElement("span");
    tileProbe.style.cssText="position:absolute;visibility:hidden;display:block;width:var(--aftr-poster-tile);height:1px";
    banner.append(tileProbe);
    const tile=tileProbe.getBoundingClientRect().width;
    tileProbe.remove();
    return {bannerWidth:box.width,bannerHeight:box.height,
      tile,naturalWidth:sourceImage.naturalWidth,naturalHeight:sourceImage.naturalHeight,
      background:style.backgroundImage,repeat:style.backgroundRepeat,
      animation:style.animationName,overflow:style.overflowX,
      videoSrc:v.querySelector("source")?.src,videoMuted:v.muted,
      videoAutoplay:v.autoplay,videoPoster:v.poster,
      videoCount:document.querySelectorAll(".hero-image video").length};
   });
   assert.equal(data.missing,undefined,"AFTR banner or video is missing");
   assert.ok(data.naturalWidth>0 && data.naturalHeight>0,"Approved banner failed to load");
   const actualTile=data.naturalWidth*data.bannerHeight/data.naturalHeight;
   assert.ok(Math.abs(data.tile-actualTile)<1, "Banner loop distance must match artwork width");
   assert.equal(data.repeat,"repeat-x","Full-width banner must always repeat");
   assert.ok(data.background.includes("aftr-approved-las-vegas-banner-20261031.webp"),"Approved banner source missing");
   assert.equal(data.animation,"aftr-poster-background-pan","Banner needs full-background animation");
   assert.equal(data.overflow,"hidden");
   assert.equal(data.videoCount,1,"Only one AFTR hero video may be mounted");
   assert.ok(data.videoSrc.endsWith("/demos/aftr/media/hero-motion-20261108.mp4"),"Video path incorrect");
   assert.ok(data.videoPoster.endsWith("/demos/aftr/media/hero-motion-poster-hq.webp"),"Video fallback path incorrect");
   assert.equal(data.videoMuted,true,"Inline autoplay must be muted");
   assert.equal(data.videoAutoplay,true);
   // Scrub to midpoint, where the old finite transformed layer exposed violet.
   await page.addStyleTag({content:".ticker.ticker-poster-banner{animation-delay:-18s!important}"});
   await page.locator(".ticker.ticker-poster-banner").screenshot({path:path.join(out,browserType.name()+"-"+width+".png")});
   await page.emulateMedia({reducedMotion:"reduce"});
   assert.equal(await page.locator(".ticker.ticker-poster-banner").evaluate(e=>getComputedStyle(e).animationName),"none");
   assert.equal(await page.locator("#aftrHeroVideo").evaluate(e=>getComputedStyle(e).display),"none","Reduced motion must show poster image");
   assert.deepEqual(errors,[],"Uncaught JavaScript errors");
   await page.close();
   console.log(browserType.name(),width,"AFTR approved poster repeats across width; one native muted hero video present");
  }
 }finally{await browser.close()}
}
