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
assert(html.includes('id="bookingServiceAreas"'),'Show illustrative sample area coverage');
assert(html.includes('vanity-before.webp')&&html.includes('vanity-after.webp'),'Use matched sink photos');
assert(css.includes('prefers-reduced-motion:reduce')&&deck.includes('setPointerCapture')&&deck.includes('ArrowLeft'),'Accessible swipe, reduced motion and keyboard fallbacks required');
assert(css.includes('touch-action:pan-y')&&!css.includes('.tle-work-card[data-active="true"]{touch-action:none'),
 'Photo deck must allow native vertical finger scrolling between services and lower sections');
assert(deck.includes("if(ev.pointerType==='mouse')ev.preventDefault()")&&deck.includes('Math.abs(dx)<=Math.abs(dy)*1.25'),
 'Horizontal swipe must not capture ordinary vertical finger gestures');
assert(html.includes('id="demoExploreNav"')&&html.includes('id="demoExploreReviews"'), 'Services must provide routes to the rest of demo');
assert(html.includes('id="siteLink"')&&html.includes('id="tleDemoFooterWebsite"'), 'Back to Home must be reachable at top and bottom');
assert(!/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)\s*\(/.test(deck),'Gallery may not write to backend or storage');
console.log('[STATIC PASS] Ten unique, locally checked-in sample images; isolated EN/ES deck, no writes.');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width,height,reduced] of [
  ['en',360,780,false],['es',390,844,false],['en',820,1180,false],
  ['es',1440,900,false],['en',390,844,true]
 ]){
  const page=await browser.newPage({viewport:{width,height},isMobile:width<700,hasTouch:width<700,reducedMotion:reduced?'reduce':'no-preference'});
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
  // Top navigation remains visible even on mobile, with localized Home text.
  const backHome=page.locator('#siteLink');
  const homeState=await backHome.evaluate(el=>({width:el.getBoundingClientRect().width,display:getComputedStyle(el).display}));
  assert(homeState.width>60&&homeState.display!=='none','Back to Home hidden on '+lang+' '+width+': '+JSON.stringify(homeState));
  assert.equal(new URL(await backHome.getAttribute('href'),base).pathname,'/','Top Home link must return to main site');
  assert.match(await backHome.innerText(),lang==='es'?/Volver al inicio/:/Back to Home/);
  assert.equal(new URL(await page.locator('#tleDemoFooterWebsite').getAttribute('href'),base).pathname,'/','Bottom Home link must return to main site');
  assert.equal(await page.locator('.booking-review').count(),3,'Retain three review-style experience examples');
  assert.match(await page.locator('#bookingProofDesc').innerText(),lang==='es'?/no son testimonios ni reseñas verificadas/:/not customer testimonials or verified reviews/);
  // The service chapter should not be a terminal screen: navigation moves to
  // the gallery, before/after, and review-style proof below the sample form.
  await page.locator('#demoExploreReviews').click();
  const proofPosition=await page.locator('#bookingProof').evaluate(el=>el.getBoundingClientRect().top);
  assert(proofPosition>=-15&&proofPosition<Math.min(height*.45,220),'Services navigation must reach lower reviews '+JSON.stringify({lang,width,proofPosition}));
  await page.locator('#demoExploreGallery').click();
  const galleryPosition=await page.locator('#tleWorkGallery').evaluate(el=>el.getBoundingClientRect().top);
  assert(galleryPosition>=-15&&galleryPosition<Math.min(height*.45,220),'Services navigation must reach lower gallery '+JSON.stringify({lang,width,galleryPosition}));
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
  if(width<700&&!reduced){
    // Use actual Chrome touch events, not wheel: this caught a real iPhone
    // vertical-scroll trap caused by touch-action:none on the active card.
    const top=page.locator('#tleWorkDeck .tle-work-card[data-active="true"]');
    await top.scrollIntoViewIfNeeded();
    const box=await top.boundingBox();
    const centerX=box.x+box.width*.53;
    const touchY=box.y+Math.min(box.height*.62,260);
    const start=await page.evaluate(()=>scrollY);
    const countBefore=await counter.textContent();
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:centerX,y:touchY}]});
    for(let i=1;i<=8;i++){
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:centerX+1,y:touchY-i*29}]});
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForTimeout(260);
    const ending=await page.evaluate(()=>scrollY);
    assert(ending>start+65,'Dragging vertically over the active gallery card MUST scroll to lower reviews '+JSON.stringify({lang,width,start,ending}));
    assert.equal(await counter.textContent(),countBefore,'Vertical scroll is not a card swipe');
    await cdp.detach();
  }
  assert.equal(writes.length,0,'Gallery interaction must not send booking writes');
  assert.equal(errors.length,0,'Browser error: '+errors.join(', '));
  await page.close();
  console.log('[PASS] '+lang+' '+width+'x'+height+(reduced?' reduced':'')+' cards, local images, arrows, keyboard, drag and no writes');
 }
}finally{await browser.close();}
