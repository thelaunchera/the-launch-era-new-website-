/* No-write, isolated QA of the public demo's 10-photo swipe deck. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const html=readFileSync('public/booking-demo-reset.html','utf8');
const css=readFileSync('public/assets/tle-demo-work-gallery.css','utf8');
const deck=readFileSync('public/assets/tle-demo-work-gallery.js','utf8');
const photoPaths=[...html.matchAll(/(?:src|data-src)="(\/assets\/(?:drive-house-gallery|drive-booking-journey|lead-demo)\/[^"]+\.(?:png|jpg|webp))"/g)].map(m=>m[1]);
const galleryHtml=html.slice(html.indexOf('id="tleWorkGallery"'),html.indexOf('<section class="booking-before-after"'));
const galleryPhotos=[...galleryHtml.matchAll(/(?:src|data-src)="(\/assets\/[^"]+\.(?:png|jpg|webp))"/g)].map(m=>m[1]);
assert.equal((galleryHtml.match(/class="tle-work-card"/g)||[]).length,10,'Exactly 10 photo cards');
assert.equal(new Set(galleryPhotos).size,10,'No repeated paths in the deck');
const optimizedPhotos=[...galleryHtml.matchAll(/data-optimized="(\/assets\/demo-work-gallery\/[^"]+\.webp)"/g)].map(m=>m[1]);
assert.equal(optimizedPhotos.length,10,'All 10 photos need lightweight WebP choices');
assert.equal(new Set(optimizedPhotos).size,10,'Do not repeat optimized gallery images');
optimizedPhotos.forEach(path=>{
 assert(existsSync('public'+path),'Missing built WebP '+path);
});

galleryPhotos.forEach(path=>assert(existsSync('public'+path),'Missing local image '+path));
assert(html.indexOf('id="bookingPage"')<html.indexOf('id="tleWorkGallery"'),'Gallery must follow sample booking');
assert(html.indexOf('id="tleWorkGallery"')<html.indexOf('id="bookingBeforeAfter"'),'Gallery must precede before/after');
assert(galleryHtml.includes('not verified customer projects'),'Photos must not be called real client work');
assert(galleryHtml.includes('data-gallery-es'),'Keep bilingual gallery');
assert(html.includes('id="bookingServiceAreas"')&&html.includes('id="serviceAreasTitle"'),'Bilingual sample service areas should be below before/after');
assert(html.indexOf('id="bookingBeforeAfter"')<html.indexOf('id="bookingServiceAreas"'),'Illustrative coverage belongs below the comparisons');
assert(html.includes('Illustrative coverage only.')&&html.includes("serviceAreasTitle:'Que sepan desde el inicio"),'Never claim fictional coverage is confirmed');
assert(html.includes('vanity-before.webp')&&html.includes('vanity-after.webp'),'Show matched sink pair instead of decorative bedroom');
assert(css.includes('prefers-reduced-motion:reduce')&&deck.includes('setPointerCapture')&&deck.includes('ArrowLeft'),'Accessible swipe, reduced motion and keyboard fallbacks required');
assert(!/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)\s*\(/.test(deck),'Gallery may not write to backend or storage');
console.log('[STATIC PASS] Ten unique, locally checked-in sample images; isolated EN/ES deck, no writes.');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width,height,reduced] of [
  ['en',360,780,false],['es',390,844,false],['en',820,1180,false],
  ['es',1440,900,false],['en',390,844,true]
 ]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
  const writes=[],errors=[];
  page.on('request',req=>{if(['POST','PATCH','PUT','DELETE'].includes(req.method()))writes.push(req.url())});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/booking-demo-reset.html?lang='+lang,{waitUntil:'domcontentloaded',timeout:50000});
  await page.locator('#tleWorkDeck[data-enhanced="true"]').waitFor({timeout:12000});
  const initial=await page.evaluate(()=>{
   const gallery=document.getElementById('tleWorkGallery'),deck=document.getElementById('tleWorkDeck');
   const top=deck.querySelector('.tle-work-card[data-active=true]');
   const gr=gallery.getBoundingClientRect(),tr=top.getBoundingClientRect();
   return {lang:document.documentElement.lang,cards:deck.querySelectorAll('.tle-work-card').length,
    initialSources:[...deck.querySelectorAll('img[src]')].length,
    hidden:[...deck.querySelectorAll('.tle-work-card')].filter(x=>x.getAttribute('aria-hidden')==='true').length,
    overflow:document.documentElement.scrollWidth-innerWidth,
    title:document.getElementById('tleWorkGalleryTitle').textContent,
    rect:{left:tr.left,right:tr.right,top:tr.top,bottom:tr.bottom},gallery:{left:gr.left,right:gr.right}};
  });
  assert.equal(initial.lang,lang,'Wrong language');
  assert.equal(initial.cards,10,'Missing photos');
  assert.equal(initial.hidden,9,'Only the active photo may be accessible');
  assert(initial.initialSources<=3,'Load only the first three optimized gallery photos');
  assert(initial.overflow<=4,'Horizontal overflow '+lang+' '+width+': '+JSON.stringify(initial));
  assert(initial.rect.left>=-2&&initial.rect.right<=width+2,'Photo outside viewport '+JSON.stringify(initial));
  assert.match(initial.title,lang==='es'?/Limpieza en acción/:/Cleaning in action/);
  const areas=page.locator('#bookingServiceAreas');
  assert.equal(await areas.locator('.booking-service-areas__cities span').count(),8,'Eight fictional Palm Beach County areas expected');
  assert.match(await page.locator('#serviceAreasTitle').innerText(),lang==='es'?/atiendes su zona/:/cleaning team can come/);
  assert((await areas.evaluate(el=>el.getBoundingClientRect().width))<=width+2,'Coverage cards should fit '+width);
  const counter=page.locator('#tleWorkGalleryCounter');
  assert.equal(await counter.textContent(),'01 / 10');
  await page.locator('#tleWorkGalleryRight').click();
  await page.waitForFunction(()=>document.getElementById('tleWorkGalleryCounter')?.textContent==='02 / 10',{timeout:4000});
  await page.locator('#tleWorkDeck').focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(()=>document.getElementById('tleWorkGalleryCounter')?.textContent==='03 / 10',{timeout:4000});
  if(!reduced){
   const top=page.locator('#tleWorkDeck .tle-work-card[data-active="true"]');
   const rect=await top.boundingBox();
   assert(rect,'Current card not visible');
   const x=rect.x+rect.width*.5,y=rect.y+rect.height*.44;
   await page.mouse.move(x,y);await page.mouse.down();
   await page.mouse.move(x-88,y+14,{steps:6});await page.mouse.up();
   await page.waitForFunction(()=>document.getElementById('tleWorkGalleryCounter')?.textContent==='04 / 10',{timeout:4000});
  }
  assert.equal(writes.length,0,'Gallery interaction must not send booking writes');
  assert.equal(errors.length,0,'Browser error: '+errors.join(', '));
  await page.close();
  console.log('[PASS] '+lang+' '+width+'x'+height+(reduced?' reduced':'')+' cards, local images, arrows, keyboard, drag and no writes');
 }
}finally{await browser.close();}
