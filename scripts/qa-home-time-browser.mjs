/** Homepage process steps replace retired WebGL day/night marketing cinema; keep archived source valid. */
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
const current=read('src/components/official-home.tsx');
const en=read('src/routes/index.tsx'),es=read('src/routes/es.index.tsx');
const oldMotion=read('public/assets/tle-home-time-of-day.js');
assert(current.includes('id=\\"proceso\\"')&&current.includes('class=\\"step\\"'),'Four-stage website process markup missing');
assert(en.includes('<OfficialHome lang="en" />')&&es.includes('<OfficialHome lang="es" />'),'Bilingual official routes not connected');
assert(oldMotion.includes('RoomEnvironment'),'Archived legacy 3D animation should remain intact');
execFileSync(process.execPath,['--check','public/assets/tle-home-time-of-day.js'],{stdio:'pipe'});
if(!process.argv.includes('--browser')){console.log('PASS four-step official process + archived 3D source');process.exit(0);}
const {chromium}=await import('playwright');
const browser=await chromium.launch({headless:true});
try{
 const host=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
 for(const [lang,route] of [['en','/'],['es','/es/']])for(const width of [390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(host+route,{waitUntil:'domcontentloaded',timeout:45000});
  const steps=page.locator('.tle-universal #proceso .step');
  await steps.first().waitFor({state:'visible',timeout:15000});
  assert.equal(await steps.count(),4,lang+' '+width+' must have four process steps');
  for(const [i,step] of [0,1,2,3].map(i=>[i,steps.nth(i)])){
   assert(await step.locator('img').count()===1,'Each step must show one visual');
   assert(await step.locator('h3').isVisible(),'Each step must describe its action');
  }
  const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,faq:!!document.querySelector('#preguntas'),old3D:!!document.querySelector('.tle-day-night')}));
  assert(metrics.overflow<=3,lang+' '+width+' overflow');
  assert(metrics.faq,lang+' '+width+' no FAQ');
  assert(!metrics.old3D,'Archived WebGL chapter should not load in the new official homepage');
  assert.deepEqual(errors,[],lang+' '+width+' runtime errors');
  await page.close();
  console.log('PASS official process '+lang+' '+width);
 }
}finally{await browser.close();}
