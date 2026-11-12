const assert=require("node:assert/strict");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 for(const width of [360,390,768,1024,1440]){
  for(const path of ["/guias/","/es/guias/"]){
   const ctx=await browser.newContext({viewport:{width,height:860},reducedMotion:"reduce"});
   const page=await ctx.newPage();
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:8172"+path,{waitUntil:"networkidle"});
   const checks=await page.evaluate(async()=>{
     const select=["body>.grid","#guias","#recursos","#prompts-fotos","#proximamente","#suscripcion",".sample",".how",".products"];
     const urls=select.map(x=>({selector:x,bg:getComputedStyle(document.querySelector(x)).backgroundImage,color:getComputedStyle(document.querySelector(x)).backgroundColor}));
     const resp=await fetch("/guias/assets/tle-approved-blue-grid.webp");
     const bytes=await resp.arrayBuffer();
     const bits=new Uint8Array(bytes);
     return {urls,bodyColor:getComputedStyle(document.body).backgroundColor,assetStatus:resp.status,assetType:resp.headers.get("content-type"),bytes:bytes.byteLength,webp:String.fromCharCode(...bits.slice(8,12)),video:document.querySelector(".hero-video source")?.getAttribute("src"),poster:document.querySelector(".hero-video")?.getAttribute("poster"),scrollWidth:document.documentElement.scrollWidth,innerWidth,langSwitches:document.querySelectorAll(".lang").length};
   });
   assert.equal(checks.bodyColor,"rgb(250, 246, 237)","one continuous warm-ivory document canvas");
   for(const item of checks.urls){assert.equal(item.bg,"none",item.selector+" must have no wallpaper");assert.equal(item.color,"rgba(0, 0, 0, 0)",item.selector+" must be transparent to the shared document background");}
   assert.equal(checks.assetStatus,200,"legacy source image remains accessible in repository");
   assert.equal(checks.webp,"WEBP","optimized image decodes as WebP");
   assert.ok(checks.bytes>3000&&checks.bytes<15000,"optimized image has expected size");
   assert.equal(checks.video,"/guias/assets/dailin-avatar-hero-loop.mp4","hero video unchanged");
   assert.equal(checks.poster,"/guias/assets/dailin-avatar-hero-poster.webp","video poster unchanged");
   assert.ok(checks.scrollWidth<=checks.innerWidth,"no horizontal overflow "+width);
   assert.equal(checks.langSwitches,1,"single language switch preserved");
   assert.deepEqual(errors,[],"no JS errors");
   await ctx.close();
  }
  console.log("[TLE UNIFIED PAPER CANVAS] "+width+"px EN/ES continuous ivory backdrop, original Motion, one locale switch and no horizontal overflow: OK");
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
