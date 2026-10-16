/* EN/ES public Booking + Command Center system visualization.
   Six stationary feature tiles; SVG lines + dots connect to center.
   Does not submit requests, sell integrations, or modify booking APIs. */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const en=read('src/components/editorial-sections.tsx');
const es=read('src/routes/es.index.tsx');
const component=read('src/components/connected-booking-flow.tsx');
const css=read('src/components/connected-booking-flow.css');
const heroCSS=read('public/assets/tle-hero-scroll.css');
for(const [lang,source,demo] of [
 ['en',en,'/booking-demo/?lang=en'],['es',es,'/booking-demo/?lang=es']
]){
 assert(source.includes('<HeroConnectionBackdrop lang="'+lang+'"/>'),lang+': hero backdrop changed');
 assert(source.includes('<ConnectedBookingFlow lang="'+lang+'"/>'),lang+': feature flow missing');
 assert(source.includes('home-booking-explorer tle-flow-explorer'),lang+': flow in wrong section');
 assert(source.includes('/booking-bundle/?lang='+lang),lang+': purchase CTA changed');
 assert(source.includes(demo),lang+': demo CTA changed');
}
assert(component.includes('aria-pressed={i===active}')&&component.includes('aria-live="polite"'),'Accessible selection and announcement required');
assert(component.includes('IntersectionObserver')&&component.includes('observer.disconnect()'),'In-view animation trigger missing');
assert(component.includes('pathLength={1}')&&component.includes('viewBox="0 0 160 100"')&&component.includes('preserveAspectRatio="none"'),'Six true SVG connectors required');
assert(component.includes('No outside')===false,'No fake integration endorsement in rendered UI');
assert.equal((component.split("heading:").length-1),12,'Exactly six feature headings per language');
assert(!component.includes('fetch('),'Diagram is illustrative, never an API request');
assert(css.includes('tle-hub-draw')&&css.includes('tle-hub-dot')&&css.includes('tle-hub-pulse'),'Arrival sequence missing');
assert(css.includes('450ms')&&css.includes('1.1s')&&css.includes('animation:tle-hub-draw .7s'),'Stagger, draw and travel duration required');
assert(css.includes('prefers-reduced-motion:reduce')&&css.includes('animation:none!important'),'Reduced-motion fallback missing');
assert(css.includes('tle-hero-connection-backdrop')&&heroCSS.includes('z-index: 2'),'Original hero backdrop preserved');
console.log('[CONNECTED FLOW STATIC PASS] Six internal functions, EN/ES, no external logos or writes, original purchase CTA.');
if(!process.argv.includes('--browser'))process.exit(0);
const {chromium}=await import('playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const viewports=[{width:360,height:780},{width:390,height:844},{width:820,height:1180},{width:1024,height:768},{width:1440,height:900}];
mkdirSync('qa-screenshots/connected-flow',{recursive:true});
try{
 for(const [lang,route] of [['en','/'],['es','/es/']]){
  for(const vp of viewports){
   const page=await browser.newPage({viewport:vp,reducedMotion:'no-preference'});
   const errors=[],writes=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url())});
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   const root=page.locator('.tle-connected-flow');
   await root.waitFor({state:'visible',timeout:25000});
   await root.scrollIntoViewIfNeeded();
   const state=await page.evaluate(()=>{
    const root=document.querySelector('.tle-connected-flow'),stage=root.querySelector('.tle-connection-hub__stage');
    const nodes=[...root.querySelectorAll('button.tle-connection-hub__tile')];
    const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
    return {
     six:nodes.length,wires:root.querySelectorAll('.tle-connection-hub__path').length,dots:root.querySelectorAll('.tle-connection-hub__travel-dot').length,
     rings:root.querySelectorAll('.tle-connection-hub__ring').length,
     svg:root.querySelector('.tle-connection-hub__svg').getAttribute('viewBox'),
     stage:rect(stage),core:rect(root.querySelector('.tle-connection-hub__core')),
     nodeRects:nodes.map(rect),
     background:getComputedStyle(stage).backgroundImage,
     documentWidth:document.documentElement.scrollWidth,
     viewport:innerWidth,
     present:root.classList.contains('is-visible')
    };
   });
   assert(state.six===6&&state.wires===6&&state.dots===6&&state.rings===6,lang+' '+vp.width+': missing nodes/paths/dots/rings '+JSON.stringify(state));
   assert(state.svg==='0 0 160 100',lang+' missing 160×100 connector coordinate system');
   assert(state.documentWidth<=vp.width+3,lang+' '+vp.width+' document overflow '+JSON.stringify(state));
   assert(state.background.includes('radial-gradient'),lang+' pastel dotted stage missing');
   assert(state.stage.left>=-2&&state.stage.right<=vp.width+2,lang+' '+vp.width+' stage clips horizontally');
   assert(state.nodeRects.every(r=>r.left>=state.stage.left-1&&r.right<=state.stage.right+1&&r.top>=state.stage.top-2&&r.bottom<=state.stage.bottom+2),
    lang+' '+vp.width+' tiles overflow their stage: '+JSON.stringify(state));
   assert(state.core.left>state.stage.left&&state.core.right<state.stage.right,'Center must remain inside board');
   const last=root.locator('button.tle-connection-hub__tile').last();
   await last.click();
   assert.equal(await last.getAttribute('aria-pressed'),'true',lang+' tiles must respond to keyboard/mouse');
   const detail=await root.locator('.tle-connected-flow__detail').innerText();
   assert(detail.includes('06 / 06'),lang+' six-step selection not reflected');
   assert.deepEqual(writes,[],lang+' diagram made unexpected network write');
   assert.deepEqual(errors,[],lang+' page errors '+JSON.stringify(errors));
   if([390,820,1440].includes(vp.width))await root.screenshot({path:'qa-screenshots/connected-flow/'+lang+'-'+vp.width+'.png'});
   console.log('PASS connected hub '+lang+' '+vp.width);
   await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduced.goto(base+route,{waitUntil:'domcontentloaded'});
  const motion=await reduced.locator('.tle-connection-hub__path').first().evaluate(el=>({offset:getComputedStyle(el).strokeDashoffset,animation:getComputedStyle(el).animationName}));
  assert.equal(motion.animation,'none',lang+' reduced motion must be static');
  assert(Math.abs(parseFloat(motion.offset))<.001,lang+' reduced motion must show final connectors');
  const hidden=await reduced.locator('.tle-connection-hub__travel-dot').first().evaluate(el=>getComputedStyle(el).display);
  assert.equal(hidden,'none',lang+' reduced motion should hide traveling dots');
  await reduced.close();
 }
 console.log('[CONNECTED FLOW BROWSER PASS] Six stationary tiles + hub, EN/ES mobile/iPad/desktop, no writes, reduced motion.');
}finally{await browser.close();}
