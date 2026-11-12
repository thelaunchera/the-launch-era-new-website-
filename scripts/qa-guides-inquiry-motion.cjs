const assert=require("node:assert/strict");
const {chromium}=require("playwright");
(async()=>{
 const browser=await chromium.launch({headless:true});
 const api="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-contact";
 for(const [route,lang]of [["/guias/library.html","en"],["/es/guias/biblioteca.html","es"]]){
   const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"no-preference"});
   const page=await ctx.newPage();const errors=[];let payload=null,postCount=0;
   page.on("pageerror",error=>errors.push(error.message));
   await page.route(api,async req=>{
     if(req.request().method()==="OPTIONS"){await req.fulfill({status:204,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type"}});return;}
     assert.equal(req.request().method(),"POST","inquiry uses POST");
     payload=req.request().postDataJSON();postCount++;
     await req.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify({ok:true,email_sent:true,owner_notified:true})});
   });
   const response=await page.goto("http://127.0.0.1:8172"+route,{waitUntil:"networkidle"});
   assert.equal(response.status(),200);
   assert.equal(await page.locator(".sample").count(),0,"repeated sample prompt removed");
   assert.equal(await page.locator(".hero-card").count(),1,"portrait breakout card");
   assert.equal(await page.locator("#vault-inquiry-form").count(),1,"real inquiry form");
   assert.equal(await page.locator(".vault-photo-help").count(),3,"all photo prompts have instructions");
   assert.ok(await page.locator(".guide").first().evaluate(el=>el.getBoundingClientRect().top<document.getElementById("recursos").getBoundingClientRect().top),"guide list now precedes resources");
   assert.equal(await page.locator(".hero-video").evaluate(el=>getComputedStyle(el).objectFit),"contain","full head visible in Motion");
   const backdrop=await page.locator(".hero-card").evaluate(el=>({background:getComputedStyle(el).backgroundImage,color:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderTopWidth}));
   assert.ok(backdrop.background==="none"&&backdrop.color==="rgb(250, 246, 237)"&&backdrop.border!=="0px","rounded breakout card uses neutral paper rather than a blue or gradient backdrop");

   await page.locator(".hero-media").evaluate(el=>el.classList.add("is-loop-bridging"));
   await page.waitForFunction(()=>parseFloat(getComputedStyle(document.querySelector(".hero-video")).opacity)<.02,{timeout:2500});
   assert.ok(await page.locator(".hero-video").evaluate(el=>parseFloat(getComputedStyle(el).opacity)<.02),"loop seam transitions out to poster");
   await page.locator(".hero-media").evaluate(el=>el.classList.remove("is-loop-bridging"));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),"no overflow on iPhone");
   assert.equal(await page.locator("#count").count(),0,"no visible fixed guide count");
   assert.equal(await page.locator("#tle-resource-count").count(),0,"no visible fixed resource count");
   assert.equal(await page.locator(".guide .number").count(),0,"no numbered guide cards");
   assert.equal(await page.locator(".tle-resource-cover span").count(),0,"no numbered resource covers");
   assert.equal(await page.getByText("Queue App Concept",{exact:true}).count(),0,"non-resource demo is retired");
   assert.equal(await page.locator(".tle-resource-info a span").count(),0,"no blue decorative arrow");
   const sticky=await page.evaluate(async()=>{
     const section=document.getElementById("guias");
     const intro=section.querySelector(".library-intro");
     const y=scrollY+section.getBoundingClientRect().top+330;
     window.scrollTo({top:y,behavior:"instant"});
     await new Promise(resolve=>setTimeout(resolve,140));
     const before=intro.getBoundingClientRect().top;
     window.scrollBy({top:140,behavior:"instant"});
     await new Promise(resolve=>setTimeout(resolve,140));
     const after=intro.getBoundingClientRect().top;
     return {position:getComputedStyle(intro).position,before,after};
   });
   assert.equal(sticky.position,"sticky","guide introduction stays sticky while guide list scrolls");
   assert.ok(Math.abs(sticky.after-sticky.before)<8,"sticky guide title stays in place as visitors scroll");

   const form=page.locator("#vault-inquiry-form");
   await form.locator('input[name="name"]').fill("Sample Client");
   await form.locator('input[name="email"]').fill("sample@example.com");
   await form.locator('input[name="business"]').fill("Example Business");
   await form.locator('select[name="service"]').selectOption("Website");
   await form.locator('textarea[name="message"]').fill("I need a website to explain my services and collect inquiries.");
   await form.locator('input[name="consent"]').check();
   await form.locator('button[type="submit"]').click();
   await page.locator(".vault-inquiry-success").waitFor({state:"visible"});
   assert.equal(postCount,1,"only one inquiry delivered");
   assert.equal(payload.name,"Sample Client");
   assert.equal(payload.language,lang);
   assert.equal(payload.source,lang==="es"?"vault_inquiry_es":"vault_inquiry");
   assert.deepEqual(payload.help_needed,["Website"]);
   assert.ok(payload.message.includes("website"));
   assert.equal(payload.website,"","honeypot empty");
   assert.equal(await page.locator('.vault-inquiry-form button[type="submit"]').count(),0,"success form cannot submit twice");
   assert.ok(await page.locator(".vault-inquiry-success").textContent().then(t=>t.includes(lang==="es"?"solicitud":"inquiry")),"accurate localized receipt");
   assert.deepEqual(errors,[],"no page errors "+errors.join(", "));
   await ctx.close();
   console.log("[VAULT INQUIRY+MOTION] "+lang+": simulated contact submission, resource sequence, loop bridge, pop-out, no overflow: OK");
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});