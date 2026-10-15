import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,mkdirSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('public');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 let path=resolve(root,'.'+pathname);
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
 if(existsSync(path)&&statSync(path).isDirectory())path=resolve(path,'index.html');
 if(!existsSync(path)){res.writeHead(404).end('Not found');return;}
 res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(readFileSync(path));
});
await new Promise(resolveReady=>server.listen(0,'127.0.0.1',resolveReady));
const base='http://127.0.0.1:'+server.address().port;
const prices={percent_off:40,booking_setup_cents:1199,plans:{
 'ai-booking':{original_setup_cents:4900,setup_due_cents:2940,monthly_cents:1900},
 'ai-followup':{original_setup_cents:2900,setup_due_cents:1740,monthly_cents:1200},
 'ai-business':{original_setup_cents:6900,setup_due_cents:4140,monthly_cents:2500}
}};
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
try {
 for(const width of [360,390,820,1440]){
   const ctx=await browser.newContext({viewport:{width,height:width<500?820:960}});
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   await page.route('**/functions/v1/tle-booking-bundle-checkout',route=>{
     assert.equal(route.request().method(),'GET','QA must never charge or create checkout');
     return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(prices)});
   });
   await page.goto(base+'/booking-bundle/?lang=en&bundle=ai-booking&source=smart-welcome',{waitUntil:'domcontentloaded'});
   await page.locator('#heroTitle').waitFor({state:'visible'});
   assert.match(await page.locator('#heroTitle').innerText(),/You handle the cleaning/);
   assert.equal(await page.locator('.tle-feature').count(),3);
   for(const img of await page.locator('.tle-feature-image img,.tle-hero-photo img').all())
      assert(await img.evaluate(el=>el.complete&&el.naturalWidth>500),'Generated photograph failed to load at '+width);
   await page.locator('#previewRequest').click();
   assert.match(await page.locator('#bookingSampleResult').innerText(),/No real request was sent/);
   await page.locator('button[data-view="quote"]').click();
   assert.match(await page.locator('#dashboardPreview').innerText(),/Quote sent/);
   await page.locator('button[data-question="booking"]').click();
   assert.match(await page.locator('#sampleAssistantReply').innerText(),/review your preferred time/);
   const badge=page.locator('#bundleOffer');
   await badge.waitFor({state:'visible',timeout:6000});
   const radios=page.locator('input[name="tle-ai-bundle"]');
   assert.equal(await radios.count(),4,'Original optional AI choices must remain');
   assert.equal(await page.locator('input[name="tle-ai-bundle"]:checked').inputValue(),'ai-booking');
   await page.waitForFunction(()=>document.querySelector('#tleTotal')?.textContent==='$41.39');
   assert.match(await page.locator('#tleMonthly').innerText(),/\$19\/month/);
   await page.locator('input[name="tle-ai-bundle"][value="ai-followup"]').check();
   assert.equal(await page.locator('#tleTotal').innerText(),'$29.39');
   assert.match(await page.locator('#tleMonthly').innerText(),/\$12\/month/);
   await page.locator('input[name="tle-ai-bundle"][value="ai-business"]').check();
   assert.equal(await page.locator('#tleTotal').innerText(),'$53.39');
   assert.match(await page.locator('#tleMonthly').innerText(),/\$25\/month/);
   assert(await page.locator('#tleCheckoutBtn').isVisible());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,'Horizontal overflow '+width);
   await page.screenshot({path:'qa-screenshots/bundle-landing-'+width+'.png',fullPage:true});
   assert.deepEqual(errors,[],'Browser errors at '+width);
   await ctx.close();
   console.log('PASS bundle at '+width);
 }
 const esCtx=await browser.newContext({viewport:{width:390,height:844}});
 const esPage=await esCtx.newPage();
 await esPage.route('**/functions/v1/tle-booking-bundle-checkout',r=>r.fulfill({json:prices}));
 await esPage.goto(base+'/booking-bundle/?lang=es&bundle=ai-booking',{waitUntil:'domcontentloaded'});
 assert.match(await esPage.locator('#heroTitle').innerText(),/Tú te encargas/);
 await esPage.locator('#previewRequest').click();
 assert.match(await esPage.locator('#bookingSampleResult').innerText(),/No se envió/);
 await esPage.locator('button[data-question="booking"]').click();
 assert.match(await esPage.locator('#sampleAssistantReply').innerText(),/horario/);
 await esPage.screenshot({path:'qa-screenshots/bundle-landing-es-390.png',fullPage:true});
 assert(await esPage.getByText('Ver paquete').count()>0);
 await esCtx.close();
 const offCtx=await browser.newContext({viewport:{width:390,height:844}});
 const off=await offCtx.newPage();
 await off.route('**/functions/v1/tle-booking-bundle-checkout',r=>r.fulfill({json:{percent_off:0,booking_setup_cents:1999,plans:Object.fromEntries(Object.entries(prices.plans).map(([key,plan])=>[key,{...plan,setup_due_cents:plan.original_setup_cents}]))}}));
 await off.goto(base+'/booking-bundle/?lang=en',{waitUntil:'domcontentloaded'});
 await off.waitForTimeout(300);
 assert.equal(await off.locator('#bundleOffer').isVisible(),false,'Inactive sale should not appear');
 assert.equal(await off.locator('input[name="tle-ai-bundle"]').count(),4,'Regular plans disappeared');
 await offCtx.close();
 console.log('PASS Spanish, no-discount and original checkout fallbacks');
} finally {await browser.close();await new Promise(done=>server.close(done));}
