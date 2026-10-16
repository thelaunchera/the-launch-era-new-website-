/** Public sample ONLY: assert the retired Post-Construction card is removed,
 * not just hidden behind a large blank photo-grid slot.
 * Read-only QA: never submit a form, email or quote request. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const origin=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const html=readFileSync('public/lead-private-preview.html','utf8');
const code=readFileSync('public/assets/tle-demo-editorial-stack-v34.js','utf8');
assert.match(html, /onclick="startCommercial\('quote','Post-Construction Cleaning'\)"/,
  'Keep original buyer-owned service option in source HTML');
assert.match(code, /if\(construction\) construction\.remove\(\)/,
  'Public sample must remove the actual service node');
assert.match(code, /q\.has\("key"\)\|\|q\.get\("owner_preview"\)==="1"/,
  'Do not alter keyed/owner buyer previews');

const browser=await chromium.launch({headless:true});
try {
 for(const [lang,width] of [['en',360],['es',390],['en',820],['es',1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const writes=[],errors=[];
  page.on('request',r=>{if(['POST','PATCH','PUT','DELETE'].includes(r.method()))writes.push(r.url());});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/lead-private-preview.html?lang='+lang,{waitUntil:'load',timeout:60000});
  await page.waitForSelector('html.tle-demo-v47',{timeout:18000});
  const sample=await page.evaluate(()=>{
    const list=document.getElementById('commercialServiceList');
    const cards=[...list.querySelectorAll(':scope > button.service')];
    return {
      nodeCount:cards.length,
      construction:cards.filter(b=>/Post-Construction|posconstrucción/i.test(b.textContent)).length,
      imageCards:cards.filter(b=>b.classList.contains('tle-service-has-photo-v21')).length,
      otherNames:cards.map(b=>b.querySelector('.demo-service-body b')?.textContent?.trim()).filter(Boolean),
      gridScrollWidth:document.documentElement.scrollWidth-innerWidth
    };
  });
  assert.equal(sample.construction,0,lang+' '+width+' retired Post-Construction DOM node remains');
  assert.equal(sample.imageCards,3,lang+' '+width+' approved commercial photos affected: '+JSON.stringify(sample));
  assert(sample.gridScrollWidth<=7,'No horizontal overflow '+JSON.stringify(sample));

  await page.locator('#leadHero .demo-hero-cta').click();
  await page.waitForSelector('html.tle-demo-booking-active',{timeout:8000});
  const commercialTab=page.locator('#categoryTabs [data-category="commercial"], #categoryTabs button[onclick*="commercial"]').first();
  await commercialTab.click();
  await page.waitForFunction(()=>{
    const list=document.getElementById('commercialServiceList');
    return list&&!list.hidden&&getComputedStyle(list).display!=='none';
  },null,{timeout:7000});
  const layout=await page.evaluate(()=>{
    const list=document.getElementById('commercialServiceList');
    const cards=[...list.querySelectorAll(':scope > button.tle-service-has-photo-v21')];
    const rects=cards.map(b=>b.getBoundingClientRect());
    const first=rects[0],last=rects.at(-1),grid=list.getBoundingClientRect();
    return {
      count:cards.length,
      sizes:rects.map(r=>({w:r.width,h:r.height})),
      grid:{width:grid.width,height:grid.height},
      lastBottom:last?.bottom,
      ghostSlots:[...list.children].filter(el=>/Post-Construction|posconstrucción/i.test(el.textContent)).length,
      customQuotes:list.querySelectorAll('.tle-v34-single-quote').length
    };
  });
  assert(layout.count===3&&layout.sizes.every(s=>s.w>85&&s.h>85),lang+' '+width+' ghost/empty commercial slot '+JSON.stringify(layout));
  assert(layout.ghostSlots===0,'No construction slot in commercial layout');
  assert(layout.customQuotes===1,'Custom commercial quote path should remain');
  assert.deepEqual(writes,[],lang+' '+width+' browsing must not write or send');
  assert.deepEqual(errors,[],lang+' '+width+' runtime JS errors');
  console.log('PASS public sample construction removal '+lang+' '+width+' '+JSON.stringify({sample,layout}));
  await page.close();
 }
 const buyer=await browser.newPage({javaScriptEnabled:false});
 for(const qs of ['?key=qa-private&lang=en','?owner_preview=1&lang=es']){
   await buyer.goto(origin+'/lead-private-preview.html'+qs,{waitUntil:'domcontentloaded'});
   assert.equal(await buyer.locator('#commercialServiceList button[onclick*="Post-Construction"]').count(),1,
     'Original customer/owner HTML must retain the commercial option');
 }
 await buyer.close();
 console.log('[POST-CONSTRUCTION REMOVAL QA PASSED] EN/ES responsive, no blank slot, buyer original preserved.');
} finally {await browser.close();}
