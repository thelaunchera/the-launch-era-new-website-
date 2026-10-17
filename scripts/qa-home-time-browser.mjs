import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const f=p=>readFileSync(p,'utf8');
const en=f('src/routes/index.tsx'),es=f('src/routes/es.index.tsx');
const css=f('src/components/home-motion-interlude.css'),mod=f('public/assets/tle-home-time-of-day.js');
assert(en.includes('<HomeMotionInterlude lang="en"/><ProcessSection/>'),'English chapter precedes process in current home');
assert(es.includes('<HomeMotionInterlude lang="es"/>'),'Spanish sequence');
assert(css.includes('@media(prefers-reduced-motion:reduce)'),'reduced-motion');
assert(mod.includes('160*3')&&mod.includes('RoomEnvironment'),'real Three.js scene');
execFileSync(process.execPath,['--check','public/assets/tle-home-time-of-day.js'],{stdio:'pipe'});
if(!process.argv.includes('--browser')){console.log('PASS source-level day-night motion tests');process.exit(0)}
const {chromium}=await import('playwright');
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
try{
 const host=process.env.QA_URL||'http://127.0.0.1:4173';
 for(const lang of ['en','es']){
  for(const width of [390,820,1440]){
   const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'no-preference'});
   const page=await context.newPage();const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(host+(lang==='en'?'/':'/es/'),{waitUntil:'domcontentloaded',timeout:40000});
   const root=page.locator('.tle-day-night'),band=page.locator('.tle-kinetic-band');
   await root.waitFor({state:'attached',timeout:15000});
   assert.equal(await page.locator('.tle-time-chapter').count(),4,lang+' chapter count');
   assert.equal(await page.locator('.tle-marquee-row').count(),2,lang+' kinetic rows');
   // Product tabs are no longer mounted on the redesigned homepage; validate this section instead.
   assert.equal(await page.locator('.tle-time-rotator > span').count(),3,lang+' rotating headline words');
   await page.evaluate(()=>document.querySelector('.tle-day-night')?.scrollIntoView());
   await page.waitForTimeout(1000);
   const webgl=await page.evaluate(()=>{try{return Boolean(document.createElement('canvas').getContext('webgl2'))}catch{return false}});
   if(webgl){
    await page.waitForFunction(()=>document.querySelector('.tle-day-night')?.dataset.render==='webgl',null,{timeout:12500}).catch(()=>{});
    assert((await page.locator('.tle-time-art canvas').count()===1)||(await page.locator('.tle-time-fallback').count()===1),lang+' missing WebGL and native fallback');
   }else{
    assert(await page.locator('.tle-time-fallback').count()===1,'static fallback missing');
   }
   await page.evaluate(()=>{
    const root=document.querySelector('.tle-day-night');
    if(root)window.scrollTo(0,window.scrollY+root.getBoundingClientRect().top+root.offsetHeight-window.innerHeight-4);
   });
   await page.waitForFunction(()=>document.querySelector('.tle-day-night')?.dataset.evening==='true',null,{timeout:12500}).catch(()=>{});
   const scene=await root.evaluate(e=>({step:e.dataset.activeStep,night:e.dataset.evening,render:e.dataset.render||'fallback',gradient:getComputedStyle(e).backgroundImage,progress:Math.round((-e.getBoundingClientRect().top/Math.max(1,e.getBoundingClientRect().height-window.innerHeight))*100)}));
   assert(scene.night==='true',lang+' '+width+' must reach night: '+JSON.stringify(scene));
   assert(scene.gradient.includes('gradient'),lang+' background gradient missing');
   const animations=await band.locator('.tle-marquee-track').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).animationName));
   assert(animations.every(n=>n!=='none'),lang+' marquee motion disabled unexpectedly');
   assert(!errors.some(e=>/tle-home-time-of-day|home-motion-interlude|RoundedBoxGeometry/.test(e)),lang+' '+width+' fatal motion JS: '+errors.join(' | '));
   await context.close();
   console.log('PASS '+lang+' '+width+' renderer='+scene.render+' night='+scene.night+' progress='+scene.progress);
  }
 }
 for(const lang of ['en','es']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(host+(lang==='en'?'/':'/es/'),{waitUntil:'domcontentloaded',timeout:40000});
  await page.locator('.tle-day-night').waitFor();
  const reduced=await page.evaluate(()=>{
   const e=document.querySelector('.tle-day-night'),tracks=document.querySelectorAll('.tle-marquee-track');
   return {evening:getComputedStyle(e).backgroundImage, animations:[...tracks].map(x=>getComputedStyle(x).animationName)};
  });
  assert(reduced.evening.includes('gradient'),lang+' reduced-motion evening fallback');
  assert(reduced.animations.every(x=>x==='none'),lang+' reduce must stop marquee');
  await context.close();
 }
 console.log('PASS bilingual live 3D/reduced-motion/browser motion QA');
}finally{await browser.close()}
