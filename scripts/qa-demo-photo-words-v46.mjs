/* v46 photo caption regression: public fictional sample only; no form submissions or client writes. */
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [['en',360],['es',390],['es',768],['en',820],['en',1024],['es',1440]]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url())});
  await page.goto(base+'/lead-private-preview.html?lang='+lang,{waitUntil:'load'});
  await page.waitForSelector('html.tle-v46-photo-words-ready',{timeout:15000});
  const state=await page.evaluate(()=>{
   const words=[...document.querySelectorAll('#residentialServiceList .tle-v46-photo-words,#commercialServiceList .tle-v46-photo-words')];
   return {count:words.length,
    eachOnService:words.every(x=>x.closest('button.service')?.querySelector('.tle-service-photo-v21 img')),
    triplets:words.every(x=>x.querySelectorAll('.tle-v46-word').length===3),
    unique:new Set(words.map(x=>x.querySelector('.tle-v46-static')?.textContent)).size,
    first:words[0]?.querySelector('.tle-v46-word')?.textContent,
    aria:words.map(x=>[...x.querySelectorAll('.tle-v46-word')].map(w=>w.getAttribute('aria-hidden'))),
    motions:words[0]?[...words[0].querySelectorAll('.tle-v46-word')].map(x=>({animation:getComputedStyle(x).animationName,opacity:getComputedStyle(x).opacity})):[],
    width:document.documentElement.scrollWidth-innerWidth};
  });
  assert.equal(state.count,7,'Every photo must contain one caption: '+JSON.stringify(state));
  assert(state.eachOnService&&state.triplets&&state.unique>=6,'Caption must stay inside its original photo with unique words');
  assert.equal(state.first,lang==='es'?'fresco':'fresh','Correct localized first word');
  assert(state.aria.every(x=>x[0]===null&&x[1]==='true'&&x[2]==='true'),'Assistive names should not repeat rotating words');
  assert(state.motions[0].animation==='none'&&Number(state.motions[0].opacity)===1
     &&state.motions.slice(1).every(x=>Number(x.opacity)===0),'Reduced motion must show first static word');
  assert(state.width<=7,'No horizontal overflow '+lang+' '+width+': '+state.width);
  assert.equal(await page.locator('#residentialServiceList button.service').count()>0,true,'Functional service buttons retained');
  assert.deepEqual(errors,[],'No page errors '+lang+' '+width);
  assert.deepEqual(writes,[],'No live writes '+lang+' '+width);
  await page.goto(base+'/lead-private-preview.html?key=synthetic-isolation-check&lang='+lang,{waitUntil:'load'});
  assert.equal(await page.locator('html.tle-v46-photo-words-ready').count(),0,'No photo microcopy injected in personalized client pages');
  await page.close();
  console.log('PASS v46 photo captions',lang,width);
 }
}finally{await browser.close()}
