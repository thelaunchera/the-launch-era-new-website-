// QA for pointer/scroll responsive hero depth; all original photos and CTAs remain intact.
import assert from 'node:assert/strict';
import {chromium,webkit,devices} from 'playwright';
const base='http://127.0.0.1:4191';
const slugs=["sova","golden-grid","casa-brownie","crumb","havana-19","ivory-and-bloom","la-vie-in-pink","marea-wigs-miami","aftr","lavender-edit","experience-cleaning"];
const route=slug=>slug==='experience-cleaning'?'/experience-cleaning/':'/demos/'+slug+'/';
const mainPhoto=['[data-tle-reactive-photo]'];
const phone=await chromium.launch({headless:true});
try {
 const ctx=await phone.newContext({...devices['iPhone 13'],viewport:{width:390,height:800},reducedMotion:'no-preference'});
 for(const slug of slugs){
  const page=await ctx.newPage();
  const response=await page.goto(base+route(slug),{waitUntil:'domcontentloaded'});
  assert.equal(response?.status(),200,slug+' route should load');
  await page.waitForFunction(()=>document.querySelector('section.hero[data-tle-reactive-hero]')?.querySelector('[data-tle-reactive-photo]'),null,{timeout:9000});
  const initial=await page.evaluate(()=>{
   const hero=document.querySelector('section.hero[data-tle-reactive-hero]');
   const photos=hero.querySelectorAll('[data-tle-reactive-photo]');
   const el=photos[0];
   return {brand:hero.dataset.tleReactiveHero,photos:photos.length,scale:getComputedStyle(el).scale,
     over:Math.round(document.documentElement.scrollWidth-window.innerWidth),
     before:hero.style.getPropertyValue('--tle-rh-py')};
  });
  assert.equal(initial.brand,slug,slug+' brand identity should stay scoped');
  assert.ok(initial.photos>=1,slug+' needs photo target');
  if(slug==='golden-grid') {
    // The approved image has baked-in text and a package; zoom blurs the
    // printed headline and must never be required by reactive motion QA.
    assert.equal(initial.scale,'none','Golden Grid hero must remain unscaled to keep its product type sharp');
  } else {
    assert.ok(initial.scale!=='none',slug+' should activate CSS image depth');
  }
  assert.ok(initial.over<=2,slug+' has horizontal overflow '+JSON.stringify(initial));
  await page.evaluate(()=>window.scrollTo({top:Math.min(280,document.querySelector('section.hero').offsetHeight*.35),behavior:'instant'}));
  await page.waitForTimeout(200);
  const after=await page.evaluate(()=>{
   const hero=document.querySelector('section.hero[data-tle-reactive-hero]');
   return {scroll:window.scrollY,progress:Number(hero.dataset.tleReactiveProgress||0),
     y:hero.style.getPropertyValue('--tle-rh-py')};
  });
  if(after.scroll>1)assert.ok(after.progress>0,slug+' scroll should update hero depth '+JSON.stringify(after));
  if(slug==='golden-grid'){
   // The approved artwork-first Golden Grid hero intentionally has no overlaid CTA.
   assert.equal(await page.locator('nav a[href="#collection"]').count(),1,
     'golden-grid must preserve the collection navigation');
  } else {
   assert.equal(await page.locator('section.hero a,section.hero button').count()>0,true,slug+' should retain original CTA');
  }
  console.log('REACTIVE HERO IPHONE',slug,JSON.stringify({photos:initial.photos,scrollProgress:after.progress,scale:initial.scale}));
  await page.close();
 }
 await ctx.close();
 const desktop=await phone.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference',hasTouch:false});
 const p=await desktop.newPage();
 const focus='golden-grid';
 await p.goto(base+route(focus),{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>document.querySelector('section.hero[data-tle-reactive-hero]'),null,{timeout:9000});
 const hero=p.locator('section.hero[data-tle-reactive-hero]');
 const box=await hero.boundingBox();
 assert.ok(box,'desktop hero available');
 // Golden's approved full-bleed hero can be taller than the visible viewport.
 // Hover a reachable point near its top, not an off-screen midpoint.
 await hero.hover({position:{x:Math.round(box.width*.78),y:Math.min(110,Math.max(24,Math.round(box.height*.12)))},timeout:12000});
 await p.waitForTimeout(280);
 const pointer=await p.evaluate(()=>{
  const h=document.querySelector('section.hero[data-tle-reactive-hero]');
  return {x:h.style.getPropertyValue('--tle-rh-px'),fine:matchMedia('(hover: hover) and (pointer: fine)').matches};
 });
 assert.ok(pointer.fine,'desktop mouse expected');
 assert.ok(Math.abs(parseFloat(pointer.x))>1,focus+' pointer should update hero X motion '+JSON.stringify(pointer));
 console.log('REACTIVE HERO POINTER',focus,JSON.stringify(pointer));
 await desktop.close();
 const reduce=await phone.newContext({...devices['iPhone 13'],viewport:{width:390,height:800},reducedMotion:'reduce'});
 const reduced=await reduce.newPage();
 await reduced.goto(base+route(focus),{waitUntil:'domcontentloaded'});
 await reduced.waitForFunction(()=>document.querySelector('section.hero[data-tle-reactive-hero]'),null,{timeout:9000});
 const style=await reduced.locator('[data-tle-reactive-photo]').first().evaluate(node=>getComputedStyle(node).scale);
 assert.equal(style,'none',focus+' reduced-motion must keep still photography');
 console.log('REACTIVE HERO REDUCED MOTION',focus,style);
 await reduce.close();
}finally{await phone.close()}
const safari=await webkit.launch({headless:true});
try{
 const ctx=await safari.newContext({...devices['iPhone 13'],viewport:{width:390,height:800},reducedMotion:'no-preference'});
 for(const slug of ["golden-grid","havana-19","marea-wigs-miami"]){
  const page=await ctx.newPage();
  await page.goto(base+route(slug),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('section.hero[data-tle-reactive-hero]')?.querySelector('[data-tle-reactive-photo]'),null,{timeout:9000});
  const isActive=await page.locator('section.hero[data-tle-reactive-hero] [data-tle-reactive-photo]').count();
  assert.ok(isActive,slug+' safari hero should activate');
  console.log('REACTIVE HERO WEBKIT',slug,'OK');
  await page.close();
 }
 await ctx.close();
}finally{await safari.close()}
