/** Browser QA for six distinct editorial gallery designs.
 * Existing photos, filters, dialogs, nav and desktop/mobile framing must survive.
 */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const BASE=(process.env.QA_URL||'http://127.0.0.1:4195').replace(/\/$/,'');
const cases=[
  {name:'havana-19',selector:'.gallery-grid.gallery-unique',mode:'duet',min:2},
  {name:'ivory-and-bloom',selector:'#cake-gallery .cake-grid',mode:'filmstrip',min:7},
  {name:'lavender-edit',selector:'#gallery .look-grid',mode:'stack',min:3},
  {name:'la-vie-in-pink',selector:'.lv-photo-viewport',mode:'editorial-loop',min:4},
  {name:'marea-wigs-miami',selector:'#editorial-track',mode:'native-rail',min:3},
  {name:'crumb',selector:'#crumb-gallery-track',mode:'original-dots',min:3},
];
mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
let checked=0;
try{
 for(const width of [390,1440]){
  for(const test of cases){
   const context=await browser.newContext({
     viewport:{width,height:width===390?844:900},
     reducedMotion:'reduce'
   });
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(String(e)));
   const response=await page.goto(BASE+'/demos/'+test.name+'/',{waitUntil:'load',timeout:35000});
   assert.equal(response?.status(),200, test.name+' missing route');
   await page.waitForFunction(([selector,mode])=>mode==='editorial-loop'
     ? !!document.querySelector(selector+' .lv-photo-set .lv-photo')
     : !!document.querySelector(selector+'.tle-motion-'+mode),
     [test.selector,test.mode],{timeout:25000});
   const gallery=page.locator(test.selector);
   const visible=await gallery.evaluate(el=>{
     const rect=el.getBoundingClientRect();
     const count=el.querySelectorAll('.lv-photo-set:first-child .lv-photo').length ||
       Array.from(el.children).filter(n=>n.matches('figure,article,button,.gallery-photo')).length;
     return {left:rect.left,width:rect.width,pageWidth:document.documentElement.clientWidth,count,
       mode:el.className, scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};
   });
   assert(visible.count>=test.min,test.name+' missing original cards '+JSON.stringify(visible));
   assert(visible.width<=width+3,test.name+' gallery too wide '+JSON.stringify(visible));
   assert(visible.width>=160,test.name+' collapsed gallery');
   if(test.mode==='filmstrip'){
     assert(visible.scrollWidth>visible.clientWidth+20,test.name+' no internal track');
   }else if(!['original-dots','native-rail','editorial-loop'].includes(test.mode)){
     const ctrl=page.locator('.tle-gallery-controls').first();
     assert.equal(await ctrl.count(),1,test.name+' missing controls');
     const before=await ctrl.locator('.tle-gallery-count').innerText();
     await ctrl.locator('.tle-gallery-next').click();
     const after=await ctrl.locator('.tle-gallery-count').innerText();
     assert.notEqual(before,after,test.name+' next navigation did not advance');
   }
   if(test.mode==='editorial-loop'){
     const sets=page.locator('.lv-photo-track > .lv-photo-set');
     assert.equal(await sets.count(),2,'La Vie editorial loop must retain two continuous photo sets');
     const images=sets.first().locator('img[src]');
     assert.ok(await images.count()>=test.min,'La Vie approved editorial photos must remain');
   }
   if(test.name==='ivory-and-bloom'){
     await page.locator('#cake-gallery .gallery-filters button[data-filter="modern"]').click();
     const matching=await gallery.locator('.cake-item:not([hidden])').count();
     assert(matching>0&&matching<visible.count,'Cake filtering changed');
   }
   if(test.name==='crumb'){
     assert(await page.locator('[data-crumb-slide]').count()>=3,'CRUMB original dots lost');
   }
   if(test.name==='marea-wigs-miami'){
     assert(await page.locator('[data-action="gallery-scroll"]').count()===2,'Marea native arrows lost');
   }
   assert.deepEqual(errors,[],test.name+' errors at '+width);
   await gallery.screenshot({path:'qa-screenshots/unique-gallery-'+test.name+'-'+width+'.png',animations:'disabled',timeout:15000});
   console.log('PASS',test.name,width,test.mode,visible.count);
   checked++;
   await context.close();
  }
 }
 assert.equal(checked,12,'not all gallery targets tested');
}finally{await browser.close();}
