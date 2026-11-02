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
}finally{await browser.close();}
