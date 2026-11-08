import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';

const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const hiddenBrands=['havana-19','lavender-edit','casa-brownie','la-vie-in-pink'];
const fullCards=16;
const api=/\/rest\/v1\/tle_website_demo_visibility(?:\?|$)/;
const headers={'access-control-allow-origin':'*','access-control-allow-headers':'apikey,accept',
 'access-control-allow-methods':'GET,OPTIONS','cache-control':'no-store'};
const rows=hiddenBrands.map(demo_id=>({demo_id,visible:false}));
const browser=await chromium.launch({headless:true});

async function respond(route,body){
 if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
 return route.fulfill({status:200,contentType:'application/json',headers,body:JSON.stringify(body)});
}
async function ready(page,status='ready'){
 await page.locator('html[data-tle-demo-status="'+status+'"]').waitFor({state:'attached',timeout:15000});
}
try{
 for(const viewport of ['iPhone','iPad']){
  const context=await browser.newContext(viewport==='iPhone'?{...devices['iPhone 13'],locale:'en-US'}:{viewport:{width:820,height:1180},locale:'en-US'});
  let data=rows;
  await context.route(api,route=>respond(route,data));
  const page=await context.newPage();
  await page.goto(base+'/demos/',{waitUntil:'domcontentloaded'});
  await ready(page);
  assert.equal(await page.locator('.demo-card').count(),fullCards,'Preserve all source demos; only the showcase changes');
  assert.equal(await page.locator('.demo-card:visible').count(),12,'Four owner-hidden demos must vanish from the public portfolio');
  for(const slug of hiddenBrands){
   assert.equal(await page.locator('.demo-card[data-brand="'+slug+'"]').isVisible(),false,'Hidden in Studio must also be hidden on Website of Websites: '+slug);
  }
  assert.equal(await page.locator('.photo-inspiration-images img[data-demo="casa-brownie"]').isVisible(),false,'Hidden brownie cannot remain as featured photo teaser');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=2,'Curation must not overflow '+viewport+': '+overflow);
  await page.locator('.filter[data-filter="Food & Drink"]').click();
  const foodCount=await page.locator('.demo-card:visible').count();
  assert.ok(foodCount>0&&foodCount<9,'Food filter must exclude the hidden food demos, not show all 9');
  await page.locator('.filter[data-filter="All"]').click();
  assert.equal(await page.locator('.demo-card:visible').count(),12);

  // Test a cross-device Studio change without publishing another GitHub commit.
  data=[];
  await page.evaluate(()=>window.TLEWebsiteDemoVisibility.reload());
  await page.waitForFunction(()=>document.querySelectorAll('.demo-card:not([hidden])').length===16);
  assert.equal(await page.locator('.demo-card:visible').count(),16,'Unhiding from Studio must show a demo again');
  data=rows;
  await page.evaluate(()=>window.TLEWebsiteDemoVisibility.reload());
  await page.waitForFunction(()=>document.querySelectorAll('.demo-card:not([hidden])').length===12);
  assert.equal(await page.locator('.demo-card:visible').count(),12,'Re-hiding must immediately update without a deploy');

  await page.goto(base+'/demos/?demo=havana-19',{waitUntil:'domcontentloaded'});
  await ready(page);
  assert.equal(await page.locator('#demo-viewer').evaluate(el=>el.open),false,'Hidden demo cannot be opened through a deep link in the portfolio');

  for(const route of ['/website-for-your-business/','/es/website-for-your-business/']){
   await page.goto(base+route,{waitUntil:'domcontentloaded'});
   await ready(page);
   for(const slug of hiddenBrands){
    const card=page.locator('.hero-gallery-card[data-demo="'+slug+'"]');
    if(await card.count())assert.equal(await card.isVisible(),false,'Featured '+slug+' must be hidden from '+route);
   }
   assert.ok(await page.locator('.hero-gallery-card:visible').count()>=3,'Keep approved visible showcase options on '+route);
   assert.ok(await page.locator('.pricing').isVisible(),'Owner curation must not hide sales packages');
  }
  console.log('[CURATION]',viewport,'studio hidden/unhidden, filters, privacy and bilingual offers OK');
  await context.close();
 }

 // Under a network error the site must not render all unverified demo cards.
 const offline=await browser.newContext({viewport:{width:390,height:844}});
 await offline.route(api,route=>route.abort('failed'));
 const page=await offline.newPage();
 await page.goto(base+'/demos/',{waitUntil:'domcontentloaded'});
 await ready(page,'unavailable');
 assert.equal(await page.locator('.demo-card:visible').count(),0,'Network failure must not reveal hidden projects');
 assert.match(await page.locator('#empty-message').innerText(),/temporarily unavailable/i);
 console.log('[CURATION] offline safeguard OK');
 await offline.close();
 console.log('[PASS] Website of Websites honors owner-selected demo visibility on iPhone and tablet.');
}finally{await browser.close();}
