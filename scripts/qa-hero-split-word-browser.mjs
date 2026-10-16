/* Non-purchasing browser QA for the two-half "See how it works" link.
   Tests both languages and actual same-page scroll rather than a dead demo. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin=(process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const stories=[['en','/','See how it works'],['es','/es/','Descubre cómo funciona']];
try{
 for(const [lang,path,copy] of stories){
  for(const width of [360,390,414]){
   const page=await browser.newPage({viewport:{width,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
   await page.goto(origin+path+'#qa-split-check',{waitUntil:'domcontentloaded',timeout:45000});
   const link=page.locator('.hero-scroll-reveal a.tle-hero-split-link');
   await link.waitFor({state:'visible',timeout:20000});
   assert.equal(await link.getAttribute('href'),'#hero-next');
   assert.match(await link.getAttribute('aria-label')||'',lang==='es'?/reservas/:/booking/);
   assert.equal(await link.locator('.tle-hero-split-front').count(),2);
   assert.equal(await link.locator('.tle-hero-split-reveal').count(),1);
   assert.equal(await link.locator('.tle-hero-split-front').first().innerText(),copy);
   // The actual link—not a decorative container—must be readable at phone size.
   const mobileSize=await link.evaluate(el=>{
     const box=el.getBoundingClientRect();
     const style=getComputedStyle(el);
     return {font:parseFloat(style.fontSize),height:box.height,width:box.width,viewport:innerWidth,
       kicker:parseFloat(getComputedStyle(el.closest('.hero-scroll-reveal').querySelector(':scope > span')).fontSize)};
   });
   assert(mobileSize.font>=17 && mobileSize.height>=90 && mobileSize.kicker>=10.5,
     lang+' '+width+': booking-flow hint still too small '+JSON.stringify(mobileSize));
   assert(mobileSize.width<=mobileSize.viewport+1,lang+' '+width+': oversized link '+JSON.stringify(mobileSize));
   // SSR markup can briefly be replaced during hydration; check attached
   // nodes and their final computed clip rather than a transient detached node.
   await page.waitForFunction(()=>{
     const words=[...document.querySelectorAll('.hero-scroll-reveal .tle-hero-split-front')];
     return words.length===2 && words.every(el=>el.isConnected && getComputedStyle(el).clipPath.includes('50%'));
   },null,{timeout:10000});
   const clip=await link.locator('.tle-hero-split-front').evaluateAll(els=>els.map(el=>getComputedStyle(el).clipPath));
   assert(clip.every(x=>x.includes('50%')),lang+': uncut word halves');
   const before=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   assert(before.scroll <= before.width+2,lang+' '+width+': horizontal scroll');
   // Native anchor must respond on the very first tap and retain browser hash/history.
   await link.tap();
   await page.waitForFunction(()=>location.hash==='#hero-next',{timeout:6000});
   try {
     await page.waitForFunction(()=>{
       const target=document.querySelector('#hero-next');
       return scrollY>20 || (target && Math.abs(target.getBoundingClientRect().top)<120);
     },null,{timeout:10500});
   }catch(err){
     const debug=await page.evaluate(()=>({
       hash:location.hash, y:scrollY, top:document.querySelector('#hero-next')?.getBoundingClientRect().top,
       rootHeight:document.documentElement.scrollHeight, innerHeight, scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior,
       bodyOverflow:getComputedStyle(document.body).overflow, focused:document.activeElement?.outerHTML?.slice(0,250),
     }));
     console.log('[HERO NATIVE TAP DEBUG]',lang,width,JSON.stringify(debug));
     throw err;
   }
   const scroll=await page.evaluate(()=>scrollY);
   assert(scroll>20,lang+' '+width+': tap did not scroll to the next section');
   await page.close();
  }

  // Keyboard accessible focus and desktop mouse hover both reveal the label.
  const desktop=await browser.newPage({viewport:{width:1024,height:780},reducedMotion:'no-preference'});
  await desktop.goto(origin+path+'#qa-split-check',{waitUntil:'domcontentloaded',timeout:45000});
  const a=desktop.locator('.hero-scroll-reveal a.tle-hero-split-link');
  await desktop.evaluate(()=>{
   // Position hero at the end of its original sticky reveal to test actual hover.
   const hero=document.querySelector('.hero-scroll');
   if(!hero)throw Error('Missing hero');
   const top=hero.getBoundingClientRect().top + scrollY;
   scrollTo({top:top+hero.offsetHeight-innerHeight+18,behavior:'instant'});
  });
  await a.waitFor({state:'visible',timeout:10000});
  const desktopSize=await a.evaluate(el=>({font:parseFloat(getComputedStyle(el).fontSize),height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width}));
  assert(desktopSize.font>=20 && desktopSize.height>=100 && desktopSize.width>=420,
    lang+': booking-flow text must be readable and centered on computer '+JSON.stringify(desktopSize));
  await a.hover({timeout:10000});
  await desktop.waitForTimeout(1250);
  const hovered=await a.evaluate(el=>{
   const upper=el.querySelector('.tle-hero-split-upper'),lower=el.querySelector('.tle-hero-split-lower'),reveal=el.querySelector('.tle-hero-split-reveal');
   return {upper:new DOMMatrixReadOnly(getComputedStyle(upper).transform).m42,lower:new DOMMatrixReadOnly(getComputedStyle(lower).transform).m42,opacity:Number(getComputedStyle(reveal).opacity)};
  });
  assert(hovered.upper<-19&&hovered.lower>19&&hovered.opacity>.95,lang+': split-word hover did not reveal accent label '+JSON.stringify(hovered));
  await desktop.close();

  // A touchscreen needs a readable, slower one-time reveal without hovering
  // or requiring a second tap. Sample it mid-animation in a separate page.
  const touchPeek=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
  await touchPeek.goto(origin+path+'#qa-split-check',{waitUntil:'domcontentloaded',timeout:45000});
  const touchLink=touchPeek.locator('.hero-scroll-reveal a.tle-hero-split-link');
  await touchLink.waitFor({state:'visible',timeout:20000});
  await touchPeek.waitForFunction(()=>{
    const el=document.querySelector('.hero-scroll-reveal .tle-hero-split-upper');
    return Boolean(el?.isConnected && getComputedStyle(el).animationName.includes('tle-word-peek-upper'));
  },null,{timeout:10000});
  await touchPeek.waitForTimeout(3750);
  const peekState=await touchLink.evaluate(el=>{
    const up=el.querySelector('.tle-hero-split-upper'),down=el.querySelector('.tle-hero-split-lower'),reveal=el.querySelector('.tle-hero-split-reveal');
    const cs=getComputedStyle(el);
    return {
      top:new DOMMatrixReadOnly(getComputedStyle(up).transform).m42,
      bottom:new DOMMatrixReadOnly(getComputedStyle(down).transform).m42,
      label:Number(getComputedStyle(reveal).opacity),
      background:cs.backgroundColor, shadow:cs.boxShadow,
      root:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
      duration:getComputedStyle(up).animationDuration,
    };
  });
  assert(peekState.top<-8 && peekState.bottom>8 && peekState.label>.85,lang+': touch peek halves overlap or center label is hidden '+JSON.stringify(peekState));
  assert(peekState.background==='rgba(0, 0, 0, 0)' && peekState.shadow==='none',lang+': white press card returned '+JSON.stringify(peekState));
  assert(peekState.root<=peekState.viewport+2,lang+': animated split causes horizontal overflow');
  assert.equal(peekState.duration,'8.2s',lang+': touch should be slow and one-time');
  await touchPeek.close();

  // Motion-reduction users still get the link and a static label switch.
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduced.goto(origin+path+'#qa-split-check',{waitUntil:'domcontentloaded',timeout:45000});
  const link=reduced.locator('.hero-scroll-reveal a.tle-hero-split-link');
  await link.waitFor({state:'visible'});
  await reduced.waitForFunction(()=>{
    const el=document.querySelector('.hero-scroll-reveal .tle-hero-split-upper');
    return Boolean(el?.isConnected && getComputedStyle(el).transitionDuration === '0s');
  },null,{timeout:10000});
  const reducedMotion=await link.locator('.tle-hero-split-upper').evaluate(el=>getComputedStyle(el).transitionDuration);
  assert.equal(reducedMotion,'0s',lang+': prefers-reduced-motion must disable sliding transition');
  await link.click();
  await reduced.waitForFunction(()=>location.hash==='#hero-next',{timeout:6000});
  await reduced.close();
 }
 console.log('[SPLIT-WORD HERO QA PASSED] EN/ES readable sizing, clean hover split, 360/390/414 first tap, slow touch and reduced motion.');
} finally {await browser.close()}
