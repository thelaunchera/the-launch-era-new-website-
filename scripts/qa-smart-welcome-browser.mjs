// End-to-end isolated browser smoke: no customer data, email or booking submission.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,statSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('public'),key='11111111-1111-4111-8111-111111111111';
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const server=createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 let file=resolve(root,'.'+pathname);
 if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403).end();return}
 if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
 if(!existsSync(file)){res.writeHead(404).end('Not found');return}
 res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(readFileSync(file));
});
await new Promise(resolveListen=>server.listen(0,'127.0.0.1',resolveListen));
const base='http://127.0.0.1:'+server.address().port;
const model={business_name:'Fixture Residential Cleaning',language:'en',timezone:'America/New_York',
 currency:'USD',business_category:'cleaning',quote_policy:'review_unpriced_jobs',auto_confirm_flat:false,
 branding:{headline:'A fresher home starts here.',description:'A local residential cleaning example.',hero_image:'',logo_image:'',service_area:'Example County',primary_color:'#E6F3FA',accent_color:'#3A7399',reviews:[]},
 services:[{id:'fixture-01',name:'Standard Home Cleaning',category:'residential',mode:'flat',price:140,active:true},
           {id:'fixture-02',name:'Office Cleaning',category:'commercial',mode:'quote',active:true}],
 addons:[]};
const welcome={enabled:true,headline_en:'Welcome home.',headline_es:'Bienvenido a casa.',
 description_en:'Beautiful clean spaces start here.',description_es:'Un hogar limpio comienza aquí.',
 offer_en:'Ask about our new-client offer.',offer_es:'Pregunta por nuestra oferta de bienvenida.',
 terms_en:'Available to eligible first-time customers; confirm before booking.',
 terms_es:'Para nuevos clientes elegibles; confirmar antes de reservar.',
 cta_en:'Book my cleaning',cta_es:'Reservar limpieza',image_url:'',
 starts_at:null,ends_at:null,updated_at:'2026-10-14T10:00:00Z'};
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
let passes=0;
async function setup(page,offer=welcome){
 await page.route('**/functions/v1/tle-booking-flow-pricing',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(model)}));
 await page.route('**/functions/v1/tle-booking-smart-welcome',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({welcome:offer})}));
 await page.goto(base+'/base-booking.html?key='+key,{waitUntil:'domcontentloaded'});
 await page.locator('#booking').waitFor({state:'attached'});
}
try{
 for(const width of [360,390,768,820,1024,1440]){
   const ctx=await browser.newContext({viewport:{width,height:width<500?800:900}});
   const page=await ctx.newPage();
   const errs=[];page.on('pageerror',e=>errs.push(String(e)));
   await setup(page);
   const modal=page.locator('.tle-sw-dialog');
   await modal.waitFor({state:'visible',timeout:10000});
   assert.match(await modal.locator('h2').innerText(),/Welcome home/);
   const area=await modal.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:innerWidth,height:r.height,h:innerHeight}});
   assert(area.left>=-2&&area.right<=area.width+2,'Dialog offscreen at '+width);
   assert(area.height<=area.h+2,'Dialog taller than viewport at '+width);
   await page.screenshot({path:'qa-screenshots/smart-welcome-'+width+'.png',fullPage:false});
   await page.locator('.tle-sw-book').click();
   assert.equal(await modal.count(),0,'CTA did not close modal');
   assert.equal(await page.locator('#booking').count(),1,'Booking form disappeared');
   assert.equal(errs.length,0,'Script error at '+width+': '+errs.join(' | '));
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.tle-sw-return-card').waitFor({state:'visible',timeout:10000});
   assert.equal(await page.locator('.tle-sw-dialog').count(),0,'Returning visit interrupted at '+width);
   await ctx.close();passes++;
 }

 // Detailing fixture: black/electric blue CB Depot welcome must remain inside viewport.
 const detailCtx=await browser.newContext({viewport:{width:390,height:844}});
 const detailPage=await detailCtx.newPage();
 await detailPage.route('**/functions/v1/tle-booking-flow-pricing',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({...model,business_name:'CB Depot',business_category:'detailing',branding:{...model.branding,primary_color:'#07111C',accent_color:'#087DFF'}})}));
 await detailPage.route('**/functions/v1/tle-booking-smart-welcome',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({welcome:{...welcome,offer_en:'',offer_es:'',terms_en:'',terms_es:'',headline_en:'Your vehicle deserves a fresh start.',description_en:'Professional auto detailing, made easy.',cta_en:'Request My Detail'}})}));
 await detailPage.goto(base+'/base-booking.html?key='+key,{waitUntil:'domcontentloaded'});
 await detailPage.locator('.tle-sw-dialog.tle-sw-detailing').waitFor({state:'visible',timeout:10000});
 assert.equal(await detailPage.locator('.tle-sw-title').innerText(),'Your vehicle deserves a fresh start.');
 const backdropColor=await detailPage.locator('.tle-sw-dialog').evaluate(e=>getComputedStyle(e).backgroundColor);
 assert.equal(backdropColor,'rgb(7, 17, 28)','CB Depot modal is not dark');
 await detailPage.screenshot({path:'qa-screenshots/smart-welcome-cb-depot-390.png'});
 await detailPage.locator('.tle-sw-book').click();
 assert.equal(await detailPage.locator('#booking').count(),1,'CB Depot quote flow disappeared');
 await detailCtx.close();passes++;

 const context=await browser.newContext({viewport:{width:390,height:840}});
 const page=await context.newPage();
 await setup(page,null);
 await page.waitForTimeout(1100);
 assert.equal(await page.locator('.tle-sw-dialog,.tle-sw-return-card').count(),0,'Unpublished offer shown');
 assert.equal(await page.locator('#booking').count(),1,'Disabled offer broke Booking Page');
 await context.close();passes++;
 console.log('Smart Welcome fixture browser QA PASS: '+passes+' viewport/disabled checks. No real bookings sent.');
}finally{await browser.close();await new Promise(r=>server.close(r))}
