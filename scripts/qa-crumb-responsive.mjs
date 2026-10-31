import {chromium, webkit} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync, existsSync, statSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve, extname, sep} from 'node:path';
const root=resolve('public');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 let path=resolve(root,'.'+pathname);
 if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}
 if(existsSync(path)&&statSync(path).isDirectory())path=resolve(path,'index.html');
 if(!existsSync(path)){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(readFileSync(path));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
mkdirSync('qa-screenshots/crumb',{recursive:true});
const reports=[];
async function assertFlow(page,label){
 const result=await page.evaluate(()=>{
  const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,left:r.left,right:r.right};};
  return {section:rect('#build-box'),surface:rect('#builder-content'),body:rect('#builder-content .modal-body'),gift:rect('#gifting'),gallery:rect('.brand-glimpse'),
   trayPosition:getComputedStyle(document.querySelector('.live-box-panel')).position,
   viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
 });
 assert.ok(result.body.bottom<=result.surface.bottom+2,label+': builder content escapes its surface '+JSON.stringify(result));
 assert.ok(result.surface.bottom<=result.section.bottom+2,label+': surface escapes builder section');
 assert.ok(result.gift.top>=result.section.bottom-2,label+': builder overlaps Gifts');
 assert.ok(result.gallery.top>=result.gift.bottom-2,label+': Gifts overlap gallery');
 assert.ok(result.scrollWidth<=result.viewport+2,label+': horizontal overflow');
 if(result.viewport<=700)assert.ok(['static','relative'].includes(result.trayPosition),label+': phone tray must scroll normally');
 return result;
}
try{
 for(const [name,type] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch({headless:true});
  try{
   for(const width of [360,390,820,1024,1440]){
    const ctx=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
    const page=await ctx.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    try{
     await page.goto(base+'/demos/crumb/#build-box',{waitUntil:'networkidle'});
     await page.locator('#builder-content .flavor-list img').first().waitFor();
     await assertFlow(page,name+' '+width+' empty');
     for(const capacity of [3,6,12]){
      await page.locator('[data-pack="'+capacity+'"]').click();
      const previous=Number(await page.locator('#bag-count').textContent());
      for(let i=previous;i<capacity;i++)await page.locator('.flavor-row [data-add="classic"]').click();
      await page.locator('#gift-note').fill('A little gift, just for you. '.repeat(5));
      assert.equal(await page.locator('#gift-card-message').textContent(),await page.locator('#gift-note').inputValue());
      await page.locator('#preview-button').click();
      await assertFlow(page,name+' '+width+' '+capacity+' cookies and preview');
      assert.equal(Number(await page.locator('#bag-count').textContent()),capacity);
     }
     await page.locator('#build-box').screenshot({path:`qa-screenshots/crumb/${name}-${width}-builder.png`});
     // Scroll exactly where the owner's screenshots showed the tray and note over Gifts/gallery.
     for(const selector of ['#gifting','.brand-glimpse']){
      await page.locator(selector).evaluate(el=>el.scrollIntoView({block:'start'}));
      await assertFlow(page,name+' '+width+' scroll '+selector);
      const hit=await page.locator(selector).evaluate(el=>{
       const r=el.getBoundingClientRect(),h=document.querySelector('.site-header').getBoundingClientRect().bottom;
       const y=Math.min(innerHeight-25,Math.max(h+25,r.top+Math.min(r.height*.4,250)));
       return el.contains(document.elementFromPoint(innerWidth/2,y));
      });
      assert.ok(hit,name+' '+width+': '+selector+' is covered by another section');
      if(width===390)await page.locator(selector).screenshot({path:`qa-screenshots/crumb/${name}-${width}-${selector==='#gifting'?'gifts':'gallery'}.png`});
     }
     await page.locator('#open-builder').click();
     await page.locator('#preview-button').click();
     const close=await page.locator('#close-builder').boundingBox();
     const modal=await page.locator('#box-dialog').boundingBox();
     assert.ok(close.y>=modal.y&&close.y+close.height<=modal.y+modal.height,'Modal exit must stay visible');
     await page.locator('#close-builder').click();
     assert.equal(await page.locator('#builder-home #builder-content').count(),1);
     assert.equal(Number(await page.locator('#bag-count').textContent()),12);
     await assertFlow(page,name+' '+width+' after Bag round trip');
     assert.deepEqual(errors,[]);
     reports.push({engine:name,width,passed:true});
     console.log('PASS CRUMB normal section flow, 3/6/12 preview, Gifts, gallery and Bag at '+name+' '+width);
    }catch(e){await page.screenshot({path:`qa-screenshots/crumb/${name}-${width}-failure.png`,fullPage:true});throw e;}
    finally{await ctx.close();}
   }
  }finally{await browser.close();}
 }
 writeFileSync('qa-screenshots/crumb/report.json',JSON.stringify(reports,null,2));
}finally{server.close();}
