// Current live-route responsive checks. Safe: no orders, emails, payments or writes.
// Supersedes legacy v49 assertions that referenced removed selectors and prices.
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const base=(process.env.QA_URL||'https://thelaunchera.com').replace(/\/+$/,'');
const sizes=[
 {name:'small-phone',width:320,height:720},
 {name:'phone',width:390,height:844},
 {name:'tablet',width:820,height:1180},
 {name:'desktop',width:1440,height:900}
];
const pages=['/','/es/','/solutions/','/how-it-works/'];
const results=[];
mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
async function check(name,viewport,fn){
 const context=await browser.newContext({viewport,deviceScaleFactor:1, reducedMotion:'no-preference'});
 const page=await context.newPage();
 try{
  await fn(page);
  results.push({case:name,pass:true});
  console.log('PASS '+name);
 }catch(error){
  const reason=String(error?.stack||error);
  results.push({case:name,pass:false,reason});
  console.error('FAIL '+name+': '+reason);
  try{await page.screenshot({path:'qa-screenshots/'+name.replace(/[^a-z0-9-]+/gi,'-')+'.png',fullPage:true,timeout:4500})}catch{}
 }finally{await context.close()}
}
for(const viewport of sizes){
 for(const path of pages){
  await check('responsive '+viewport.name+' '+path,viewport,async page=>{
   const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(response?.status(),200,'Route must load');
   await page.locator('h1').first().waitFor({state:'visible',timeout:15000});
   await page.evaluate(()=>document.fonts.ready);
   const state=await page.evaluate(()=>{
    const over=document.documentElement.scrollWidth-innerWidth;
    const offenders=[...document.querySelectorAll('body *')].filter(el=>{
     const style=getComputedStyle(el);
     if(style.position==='fixed'||style.visibility==='hidden'||style.display==='none')return false;
     const rect=el.getBoundingClientRect();
     return rect.width>0&&(rect.right>innerWidth+6||rect.left< -6);
    }).slice(0,8).map(el=>el.tagName.toLowerCase()+'.'+String(el.className).slice(0,90));
    const cards=[...document.querySelectorAll('.solutions-section .tle-service-flip')];
    const badCards=cards.filter(card=>{
     const front=card.querySelector('.tle-service-flip__front');
     const back=card.querySelector('.tle-service-flip__back');
     return getComputedStyle(front).position!=='absolute'||getComputedStyle(back).position!=='absolute'||card.getBoundingClientRect().width>innerWidth+2;
    }).length;
    const small=[...document.querySelectorAll('.solutions-section .section-heading p,.solutions-section .tle-service-flip__front p')]
     .filter(el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0&&parseFloat(s.fontSize)<15.5;})
     .map(el=>el.tagName+'.'+el.className+' size='+getComputedStyle(el).fontSize+' homeRule='+el.matches('.sales-home .solutions-section .tle-service-flip__front p'));
    const steps=[...document.querySelectorAll('.process-section .tle-process-card')];
    const unstyledSteps=steps.filter(el=>getComputedStyle(el).borderRadius==='0px').length;
    return {over,offenders,badCards,cardCount:cards.length,small,stepCount:steps.length,unstyledSteps};
   });
   assert(state.over<=3,'Horizontal overflow '+JSON.stringify(state));
   assert.equal(state.cardCount,6,'All service choices rendered');
   assert.equal(state.badCards,0,'Service card faces must be bounded in every route');
   if(viewport.width<768)assert.deepEqual(state.small,[],'Readable mobile service descriptions');
   if(path==='/how-it-works/') {
    assert.equal(state.stepCount,3,'All three process steps rendered');
    assert.equal(state.unstyledSteps,0,'Process steps use the responsive component style');
   }
  });
 }
}
await check('card interaction + service link',sizes[1],async page=>{
 await page.goto(base+'/solutions/',{waitUntil:'domcontentloaded'});
 const card=page.locator('.solutions-section .tle-service-flip').first();
 const front=card.locator('.tle-service-flip__front-button');
 await front.click();
 await page.waitForFunction(()=>document.querySelector('.solutions-section .tle-service-flip')?.classList.contains('is-flipped'));
 const link=card.locator('.tle-service-flip__cta');
 assert.match(await link.getAttribute('href'),/^\/[a-z-]+\/?$/,'Service opens a real landing route');
 assert(await link.isVisible(),'Explore service link stays visible');
});
await check('process modal opens and closes',sizes[1],async page=>{
 await page.goto(base+'/how-it-works/',{waitUntil:'domcontentloaded'});
 await page.locator('.process-section .tle-process-card').first().click();
 await page.locator('.tle-process-dialog[role="dialog"]').waitFor({state:'visible',timeout:8000});
 await page.locator('.tle-process-close').click();
 await page.locator('.tle-process-dialog').waitFor({state:'detached',timeout:8000});
});
for(const language of ['en','es']) {
 for(const accepted of [true,false]){
  await check('demo mock email '+language+' '+(accepted?'accepted':'failed'),sizes[1],async page=>{
   let requests=0;
   await page.route('**/functions/v1/tle-personalized-demo',route=>{
    requests++;
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(
     accepted?{ok:true,email_accepted:true,duplicate:true}:{ok:true,email_accepted:false,code:'email_failed'})});
   });
   await page.goto(base+'/booking-demo/?lang='+language,{waitUntil:'domcontentloaded'});
   await page.locator('#demoForm [name=name]').fill('QA Example');
   await page.locator('#demoForm [name=email]').fill('qa@example.com');
   await page.locator('#demoForm [name=business]').fill('Sample Cleaning');
   await page.locator('#demoForm [name=serviceArea]').fill('Charlotte NC');
   await page.locator('#submit').click();
   await page.waitForFunction(yes=>{
    const success=document.querySelector('#success');
    const error=document.querySelector('#error');
    return yes?success&&!success.hidden:error&&!error.hidden;
   },accepted,{timeout:8000});
   assert.equal(requests,1,'No duplicate email request');
   assert.equal(await page.locator('#success').isVisible(),accepted,'Only provider-accepted email can show success');
   assert.equal(await page.locator('#submit').isDisabled(),false,'Sending button recovers');
  });
 }
}
const renderFile=readFileSync('public/assets/tle-home-time-of-day.js','utf8');
assert(renderFile.includes('if(!settled)raf=requestAnimationFrame(tick)'), 'WebGL pauses when progress settles');
assert(renderFile.includes("window.removeEventListener('scroll',requestFrame)"), 'WebGL cleans up scroll listener');
const fallback=readFileSync('src/components/home-motion-interlude.tsx','utf8');
assert(fallback.includes('if(reduced||lowPower)return;'),'Low-resource devices retain lightweight SVG day/night scene');
await browser.close();
const failures=results.filter(r=>!r.pass);
console.log('Current responsive QA '+(results.length-failures.length)+'/'+results.length+' passed');
if(failures.length)process.exitCode=1;
