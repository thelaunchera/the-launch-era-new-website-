// Preserve Manus portfolio visual behavior: original photography, scroll reveals,
// responsive layout and reduced-motion safety. The previous gravity gallery no longer
// exists because this route intentionally contains the new approved Manus design.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium,webkit} from 'playwright';

const html=readFileSync('public/portfolio/index.html','utf8');
const css=readFileSync('public/portfolio/styles.css','utf8');
const originalCards=['case-launch-era','case-brand-board','case-cb-depot','case-podcast'];
for(const id of originalCards) assert.match(html,new RegExp('id="'+id+'"'),'Missing original case '+id);
assert.match(css, /\.reveal\.is-visible/, 'Scroll reveal must remain');
assert.match(css, /prefers-reduced-motion:reduce/, 'Respect reduced-motion');
assert.match(html, /\/portfolio\/assets\/dailin-portrait\.webp/, 'Keep original hero image');
assert.doesNotMatch(html, /manus-web-edit-runtime|manuscdn\.com/, 'No Manus preview runtime');
const root=(process.env.QA_URL||'http://127.0.0.1:4198').replace(/\/$/,'');
for(const browserType of [chromium,webkit]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const [width,motion] of [[375,'reduce'],[390,'no-preference'],[1280,'no-preference']]){
   const page=await browser.newPage({viewport:{width,height:820},reducedMotion:motion});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(root+'/portfolio/',{waitUntil:'domcontentloaded'});
   assert.equal(response?.status(),200,'Portfolio route HTTP 200');
   assert.equal(await page.locator('html').getAttribute('lang'),'es','Retain original Spanish copy');
   assert.equal(await page.locator('.project-card').count(),originalCards.length,'Four distinct original case studies');
   const ids=await page.locator('.project-card').evaluateAll(elements=>elements.map(e=>e.id));
   assert.deepEqual(ids,originalCards,'Preserve source case study order');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert.ok(overflow<=3,'No horizontal overflow at '+width+'px: '+overflow);
   const photo=page.locator('.hero-portrait-wrap img');
   await photo.evaluate(img=>img.decode());
   assert.ok(await photo.evaluate(img=>img.naturalWidth>0),'Hero image loads');
   for(const card of await page.locator('.project-card').all()){
    await card.scrollIntoViewIfNeeded();
    const cardId=await card.getAttribute('id');
    await page.waitForFunction(id=>document.querySelector('#'+id)?.classList.contains('is-visible'),cardId,{timeout:7000});
   }
   for(const img of await page.locator('main img').all()){
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(node=>node.decode());
    assert.ok(await img.evaluate(node=>node.naturalWidth>0),'Every original photo decodes');
   }
   if(motion==='reduce'){
    const reduced=await page.evaluate(()=>getComputedStyle(document.querySelector('.project-card')).transitionDuration);
    assert.ok(reduced.split(',').every(v=>parseFloat(v)<=0.01),'Reduced-motion disables transition: '+reduced);
   }
   assert.deepEqual(errors,[],'No JS page exceptions');
   console.log('PASS',browserType.name(),width,motion,'four original cases, photos, reveal and responsive');
   await page.close();
  }
 }finally{await browser.close()}
}
