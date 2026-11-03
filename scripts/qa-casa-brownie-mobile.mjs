/* Browser-only regression for the public Casa Brownie educational demo.
 * Read-only: no orders, payments, email or client requests.
 */
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
mkdirSync('qa-screenshots/casa-brownie',{recursive:true});
try{
 for(const width of [320,375,390,430,820]){
  const page=await browser.newPage({
   viewport:{width,height:844},deviceScaleFactor:1,
   isMobile:width<768,hasTouch:width<768,reducedMotion:'reduce'
  });
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await page.goto(base+'/demos/casa-brownie/',{waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(response?.status(),200,'Page must load');
   await page.locator('.flavor-picture img').first().waitFor({state:'visible',timeout:12000});
   const metrics=await page.evaluate(()=>{
    const grid=document.querySelector('.flavor-grid');
    const cards=[...grid.querySelectorAll(':scope>.flavor')].map(el=>el.getBoundingClientRect());
    const imgs=[...grid.querySelectorAll('.flavor-picture')].map(el=>el.getBoundingClientRect());
    const overlap=cards.some((a,i)=>cards.some((b,j)=>j>i &&
       a.left < b.right-2 && a.right > b.left+2 && a.top < b.bottom-2 && a.bottom > b.top+2));
    return {
      viewport:innerWidth,docWidth:document.documentElement.scrollWidth,
      columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      cardCount:cards.length,firstPairSameRow:Math.abs(cards[0].top-cards[1].top)<10,
      maxPictureHeight:Math.max(...imgs.map(x=>x.height)),overlap,
      heroHeight:document.querySelector('.hero-photo')?.getBoundingClientRect().height
    };
   });
   assert.equal(metrics.cardCount,6,'Keep all six flavors');
   assert(metrics.docWidth<=width+3,'No horizontal overflow: '+JSON.stringify(metrics));
   if(width<768){
    assert.equal(metrics.columns,2,'Two compact flavors per row on phone');
    assert(metrics.firstPairSameRow,'First two flavors should sit side by side');
    assert(metrics.maxPictureHeight<metrics.heroHeight,'Flavor image must be smaller than the hero');
   } else assert.equal(metrics.columns,3,'Tablet retains desktop flavor gallery');
   assert(!metrics.overlap,'Cards must not overlap');
   await page.locator('.flavor-grid').scrollIntoViewIfNeeded();
   await page.screenshot({path:'qa-screenshots/casa-brownie/grid-'+width+'.png',timeout:12000});
   const goTop=page.locator('#cb-back-to-top');
   await goTop.waitFor({state:'visible',timeout:9000});
   assert.equal(await goTop.getAttribute('href'),'#inicio');
   await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';});
   await goTop.click();
   await page.waitForFunction(()=>window.scrollY<42,null,{timeout:9000});
   await page.locator('[data-flavor="clasico"]').click();
   await page.locator('.modal-root:not([hidden])').waitFor({state:'visible',timeout:9000});
   await page.locator('#modal-close').click();
   assert.equal(errors.length,0,'No browser exceptions: '+errors.join(' | '));
   console.log('PASS Casa Brownie '+width+'px '+JSON.stringify(metrics));
  }finally{await page.close();}
 }
 // Verify both languages, the interactive demo, and the preserved six flavor names.
 const bilingual=await browser.newPage({viewport:{width:375,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 try{
  const response=await bilingual.goto(base+'/demos/casa-brownie/?lang=en',{waitUntil:'domcontentloaded'});
  assert.equal(response?.status(),200);
  await bilingual.waitForFunction(()=>document.documentElement.lang==='en' && document.querySelector('.hero h1')?.textContent.includes('What should I bring'));
  assert.equal(await bilingual.locator('.main-nav a').first().textContent(),'Home');
  assert.equal(await bilingual.locator('.flavor-title').count(),6);
  const expectedFlavors=['Classic','Chocolate & Walnut','Caramel Swirl','Raspberry','Oreo','Special Edition'];
  assert.deepEqual((await bilingual.locator('.flavor-title').allTextContents()).map(s=>s.trim()),expectedFlavors);
  const condensed=s=>s.replace(/\s+/g,' ').trim();
  assert.equal(condensed(await bilingual.locator('.cb-store-story h2').textContent()),'Sometimes, a brownie says everything.');
  assert.equal(condensed(await bilingual.locator('.delivery-steps h2').textContent()),'From our idea to your doorstep.');
  assert.equal(condensed(await bilingual.locator('.delivery-miami h2').textContent()),'A thoughtful gift that arrives beautifully.');
  await bilingual.locator('[data-flavor="dulce"]').click();
  assert.equal(await bilingual.locator('#modal-title').textContent(),'Caramel Swirl');
  await bilingual.locator('#modal-close').click();
  await bilingual.locator('#experience-btn').click();
  await bilingual.waitForFunction(()=>document.querySelector('#modal-title')?.textContent==='Build your brownie box');
  await bilingual.locator('#modal-close').click();
  await bilingual.locator('[data-lang-option="es"]').click();
  await bilingual.waitForFunction(()=>document.documentElement.lang==='es' && document.querySelector('.main-nav a')?.textContent==='Inicio');
  assert.equal(await bilingual.locator('[data-flavor="dulce"] .flavor-title').textContent(),'Dulce de leche');
  await bilingual.locator('[data-lang-option="en"]').click();
  await bilingual.waitForFunction(()=>document.documentElement.lang==='en' && document.querySelector('.main-nav a')?.textContent==='Home');
  console.log('PASS Casa Brownie EN/ES switch and translated order modal');
 }finally{await bilingual.close();}
}finally{await browser.close();}
