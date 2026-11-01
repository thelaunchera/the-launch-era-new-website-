/**
 * 375px public-site mobile-first visual QA (read-only, no login/send/pay).
 * Checks main TLE marketing routes and the five public client-style demos.
 * Screenshot snapshots are attached to the Website Responsive QA workflow.
 */
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

const base=(process.env.QA_URL||'https://thelaunchera.com').replace(/[/]+$/,'');
const routes=[
 ['home-en','/'],['home-es','/es/'],['solutions','/solutions/'],
 ['how-it-works','/how-it-works/'],['booking-en','/booking-lead-automation/'],
 ['booking-es','/es/booking-lead-automation/'],['cleaning-web-app','/cleaning-web-app/'],
 ['website-automation','/website-automation/'],['virtual-assistant','/virtual-assistant/'],
 ['free-guide','/free-cleaning-lead-guide/'],['bundle','/booking-bundle/'],
 ['booking-demo','/booking-demo/'],['sample-cleaning','/sample-cleaning/'],
 ['booking-experience','/experience-cleaning/'],['try-booking','/try-booking/'],
 ['cleaning-app-preview','/cleaning-app-demo/'],['ai-assistants','/ai-booking-assistant/'],
 ['casa-brownie','/demos/casa-brownie/'],['crumb','/demos/crumb/'],
 ['aftr','/demos/aftr/'],['claudia','/demos/claudia/'],
 ['angela','/demos/angela-so-fresh-clean-queen/']
];
const browser=await chromium.launch({headless:true});
const issues=[];
mkdirSync('qa-screenshots',{recursive:true});
try {
 for(const [name,path] of routes){
  const page=await browser.newPage({viewport:{width:375,height:812},deviceScaleFactor:1,
    isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  let pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(e.message));
  try{
   const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(response?.status(),200,'HTTP 200 required');
   await page.locator('body').waitFor({state:'visible',timeout:12000});
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForTimeout(350);
   const r=await page.evaluate(()=>{
     const visible=el=>!!el&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().height>0;
     const heading=[...document.querySelectorAll('main h1,main h2,.hero h1,.hero h2,.hero-editorial h2,body h1')]
       .find(visible);
     const ctaSelectors=[
       '.tle-app-landing .tle-app-btn.primary',
       '.tle-freebie-page a[href="#freebie-form"]',
       '.page-intro .page-intro-cta',
       '.sales-home .hero-intro .cta-button',
       '.service-hero a.cta-button','.service-hero .service-cta',
       '.tle-hero-actions a:first-child','.hero-main-action','.intro-cta',
       '.hero-start','.hero-copy .primary-button','.hero-editorial-cta',
       '.hero-cta .btn-solid','.hero-action-start','.hero-start-link',
       '.nextActions .primaryLink','.buttons .primary',
       'a.cta-button','.buttons a','.hero a[href]'
     ];
     const cta=ctaSelectors.map(s=>document.querySelector(s)).find(visible);
     const style=cta?getComputedStyle(cta):null,rect=cta?.getBoundingClientRect();
     const grids=['.sales-home .solutions-section .service-grid',
       'body[data-tle-demo="casa-brownie"] .flavor-grid',
       'body[data-tle-demo="crumb"] .cookie-grid',
       'body[data-tle-demo="aftr"] .vip-grid',
       'body[data-tle-demo="angela"] .serviceGrid',
       'body[data-tle-demo="claudia"] .main-grid'];
     const layout=grids.map(s=>document.querySelector(s)).filter(visible).map(el=>{
       let cs=getComputedStyle(el),children=[...el.children].filter(visible);
       return {selector:el.className,display:cs.display,template:cs.gridTemplateColumns,
         children:children.length,
         overlap:children.slice(1).some((c,i)=>{
           let a=children[i].getBoundingClientRect(),b=c.getBoundingClientRect();
           return Math.abs(b.top-a.top)<8 && b.left>a.left+25;
         })};
     });
     const cards=[...document.querySelectorAll('.solutions-section .tle-service-static')];
     const brokenCardImages=cards.filter(el=>{
       let im=el.querySelector('.service-image img');
       return im && im.complete && im.naturalWidth===0;
     }).length;
     return {
       viewport:innerWidth,docWidth:document.documentElement.scrollWidth,
       headings:heading?.textContent?.trim().slice(0,70)||'',
       cta:cta?.textContent?.trim().slice(0,80)||'',
       ctaTop:rect?.top??null,ctaHeight:rect?.height??null,
       ctaWidth:rect?.width??null,ctaFont:style?parseFloat(style.fontSize):null,
       cssLinked:!!document.querySelector('link[href*="tle-mobile-first-375.css"]'),
       layout, cards:cards.length,brokenCardImages
     };
   });
   assert(r.cssLinked,'Mobile-first stylesheet not linked');
   assert(r.docWidth-r.viewport<=5,'Page overflows 375px by '+(r.docWidth-r.viewport));
   assert(r.headings,'Primary heading missing or hidden');
   assert(r.cta,'Visible hero or primary CTA missing');
   assert(r.ctaHeight>=44,'Primary CTA smaller than 44px: '+r.ctaHeight);
   if(['home-en','home-es','solutions','how-it-works','crumb'].includes(name)){
     assert(r.ctaTop>=0 && r.ctaTop<790,'Primary hero CTA below first 375px screen: '+r.ctaTop);
   }

   assert(r.ctaFont>=13.5,'Primary CTA font too small: '+r.ctaFont);
   assert(r.brokenCardImages===0,'Service photos failed to load');
   assert(r.layout.every(g=>!g.overlap),'Cards are not stacked in one reading column');
   assert(pageErrors.length===0,'Uncaught browser errors: '+pageErrors.slice(0,2).join(' | '));
   if(name==='home-en'||name==='home-es'){
     const serviceCards=page.locator('.solutions-section .tle-service-static');
     assert.equal(await serviceCards.count(),5,'All five services must be visible');
     for(let i=0;i<5;i++){
       const card=serviceCards.nth(i);
       await card.scrollIntoViewIfNeeded();
       const img=card.locator('.service-image img');
       await page.waitForFunction(index=>{
         const im=document.querySelectorAll('.solutions-section .tle-service-static .service-image img')[index];
         return !!im && im.complete && im.naturalWidth>0;
       },i,{timeout:10000});
       const height=await card.evaluate(el=>el.getBoundingClientRect().height);
       assert(height<=430,'Service card '+i+' contains empty height: '+height);
     }
     await serviceCards.first().scrollIntoViewIfNeeded();
     await page.screenshot({path:'qa-screenshots/tle-375-services-'+name+'.png',fullPage:false,timeout:10000});
     await page.evaluate(()=>window.scrollTo(0,0));
   }
   await page.screenshot({path:'qa-screenshots/tle-375-'+name+'.png',fullPage:false,timeout:10000});
   console.log('PASS '+name+' 375px: '+JSON.stringify(r));
  }catch(e){
   issues.push({name,path,error:String(e)});
   console.error('FAIL '+name+' '+path+': '+String(e));
   try{await page.screenshot({path:'qa-screenshots/tle-375-FAIL-'+name+'.png',fullPage:false,timeout:10000})}catch{}
  }finally{await page.close()}
 }
}finally{await browser.close()}
console.log('375px mobile-first QA: '+(routes.length-issues.length)+'/'+routes.length+' routes passed');
if(issues.length)process.exitCode=1;
