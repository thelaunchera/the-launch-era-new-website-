/** Focused EN/ES smartphone CTA audit. No booking submission or purchases. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const css=readFileSync('src/components/service-sales-mobile-cta.css','utf8');
const component=readFileSync('src/components/service-sales.tsx','utf8');
assert(css.includes('.service-sales .service-fit a.service-demo-link'),'Scoped booking/app link style missing');
assert(component.includes("import './service-sales-mobile-cta.css'"),'ServiceSales must import cache-busted scoped styling');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,360,390,768]){
  for(const lang of ['en','es']){
   const path=lang==='es'?'/es/booking-lead-automation/':'/booking-lead-automation/';
   const page=await browser.newPage({viewport:{width,height:860},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const res=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(res?.status(),200,'Landing must exist: '+path);
   const link=page.locator('.service-sales .service-fit a.service-demo-link');
   await link.waitFor({state:'visible',timeout:15000});
   const d=await link.evaluate(el=>{
    const r=el.getBoundingClientRect(),s=getComputedStyle(el);
    return {text:el.textContent.trim(),href:el.getAttribute('href'),width:r.width,height:r.height,
      left:r.left,right:r.right,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,
      clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,font:parseFloat(s.fontSize),
      whiteSpace:s.whiteSpace,lineHeight:s.lineHeight,documentWidth:document.documentElement.scrollWidth,viewport:innerWidth};
   });
   assert(d.href?.includes('cleaning-web-app'),lang+' must retain the real cross-sell page');
   assert(d.height>=47&&d.font>=15.5,lang+' readable CTA target '+JSON.stringify(d));
   assert(d.scrollHeight<=d.clientHeight+2&&d.scrollWidth<=d.clientWidth+2,'Cross-sell text must not clip '+JSON.stringify(d));
   assert(d.left>=-2&&d.right<=width+2,'Link must fit viewport '+JSON.stringify(d));
   assert(d.documentWidth<=width+3,'Booking landing should not horizontally overflow '+JSON.stringify(d));
   assert.deepEqual(errors,[],lang+' page errors '+JSON.stringify(errors));
   console.log('PASS service-cross-link',lang,width,JSON.stringify({height:d.height,text:d.text}));
   await page.close();
  }
 }
 // Diagnostic only: legacy /solutions and /how-it-works may need a separate
 // targeted fix; report offending nodes, never disguise a problem as a pass.
 for(const path of ['/solutions/','/how-it-works/']){
  const page=await browser.newPage({viewport:{width:320,height:800}});
  await page.goto(base+path,{waitUntil:'domcontentloaded'});
  const out=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth-innerWidth,
   offenders:[...document.querySelectorAll('main *')].filter(x=>{
    const s=getComputedStyle(x),r=x.getBoundingClientRect();
    return s.position!=='fixed' && r.width && (r.right>innerWidth+3||r.left< -3);
   }).slice(0,12).map(el=>({tag:el.tagName,classes:String(el.className).slice(0,100),text:(el.textContent||'').slice(0,42),left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right)}))
  }));
  console.log('DIAGNOSTIC',path,JSON.stringify(out));
  await page.close();
 }
 console.log('PASS booking cross-link EN/ES across four sizes');
}finally{await browser.close();}
