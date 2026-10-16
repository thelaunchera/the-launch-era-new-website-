/* Diagnostics-only: locate actual viewport overflow without hiding or shifting any content. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true});
const base=(process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/,'');
for (const [lang,path] of [['en','/'],['es','/es/']]) {
 for (const width of [360,390,414,768]) {
  for (const mobile of [true,false]) {
   const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:mobile?3:1,isMobile:mobile,hasTouch:mobile});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message.slice(0,250)));
   await page.goto(base+path+'#booking-lead-automation',{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForTimeout(1250);
   // Counterfactual isolation: hiding one homepage section at a time identifies
   // the layout owner, without modifying committed page structure/styles.
   const isolation = await page.evaluate(() => {
     const home=document.querySelector('.sales-home');
     const root=document.documentElement;
     const sections=[...home.children].filter(el=>el.nodeType===1);
     const before=root.scrollWidth;
     const values=sections.map((el,i)=>{
       const rect=el.getBoundingClientRect();
       const old=el.style.display;
       el.style.display='none';
       const after=root.scrollWidth;
       el.style.display=old;
       return {i,name:el.className||el.tagName,id:el.id,outer:Math.round(rect.width),
         scroll:el.scrollWidth,client:el.clientWidth,left:Math.round(rect.left),
         right:Math.round(rect.right),afterHide:after,fixes:before-after};
     });
     return {before,view:root.clientWidth,sections:values};
   });
   console.log('SECTION_DIAG '+JSON.stringify({lang,width,mobile,...isolation}));
   const observed=[];
   for (const phase of ['top','hero','booking','end']) {
     const state=await page.evaluate(phase=>{
       const html=document.documentElement, body=document.body, main=document.querySelector('.sales-home');
       const view=innerWidth;
       const selectors={top:null,hero:'.hero-scroll',booking:'.booking-section',end:'.final-section'};
       const el=selectors[phase] ? document.querySelector(selectors[phase]):null;
       const top=el?scrollY+el.getBoundingClientRect().top : phase==='end'?html.scrollHeight-innerHeight:0;
       scrollTo({top,behavior:'instant',left:0});
       const over=[];
       for(const n of document.querySelectorAll('body *')){
         const cs=getComputedStyle(n);
         if(cs.display==='none'||cs.visibility==='hidden')continue;
         const b=n.getBoundingClientRect();
         const extra=Math.max(0,b.right-view, -b.left);
         if(extra>3 || (n.scrollWidth-n.clientWidth)>4) {
           const cls=typeof n.className==='string'?n.className.slice(0,70):'';
           over.push({tag:n.tagName,cls,id:n.id||'',extra:Math.round(extra),right:Math.round(b.right),left:Math.round(b.left),width:Math.round(b.width),sw:n.scrollWidth,cw:n.clientWidth,position:cs.position,overflowX:cs.overflowX,transform:cs.transform==='none'?'none':'yes',text:n.textContent?.replace(/\\s+/g,' ').slice(0,42)});
         }
       }
       return {phase,innerWidth:view,clientWidth:html.clientWidth,scrollWidth:html.scrollWidth,bodyWidth:body.scrollWidth,mainWidth:main?.scrollWidth,visualWidth:visualViewport?.width,scrollX,offenders:over.sort((a,b)=>b.extra-a.extra).slice(0,25)};
     },phase);
     observed.push(state);
     await page.waitForTimeout(120);
     console.log('CENTRING_DIAG +JSON.stringify({lang,width,mobile,...state,errors:errors.slice(0,2)}));
   }
   if(width<768) {
     const offending=observed.filter(x=>x.scrollWidth>x.clientWidth+2);
     assert.equal(offending.length,0,lang+' '+width+' mobile='+mobile+': document must remain horizontally centered at ALL story phases: '+JSON.stringify(offending.map(x=>({phase:x.phase,scroll:x.scrollWidth,view:x.clientWidth}))));
   }
   await page.close();
  }
 }
}
await browser.close();
