/* Read-only browser regression: one original branded footer per public demo.
   No orders, checkout, reservations, forms or client data are touched. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const routes=[
 '/demos/aftr/','/demos/angela-so-fresh-clean-queen/','/demos/casa-brownie/',
 '/demos/claudia/','/demos/crumb/','/demos/golden-grid/','/demos/havana-19/',
 '/demos/ivory-and-bloom/','/demos/la-vie-in-pink/','/demos/lavender-edit/',
 '/demos/marea-wigs-miami/','/demos/sova/','/experience-cleaning/'
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const route of routes){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  try{
   const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(response?.status(),200,route+' must load');
   await page.waitForFunction(()=>{
    const nav=document.querySelector('#tle-global-legal-nav');
    return !!nav?.closest('footer')&&nav.querySelectorAll('.tle-legal-links a').length===5;
   },null,{timeout:18000});
   const result=await page.evaluate(()=>{
    const nav=document.querySelector('#tle-global-legal-nav');
    const footers=[...document.querySelectorAll('footer')].filter(f=>!f.closest('dialog,[role="dialog"],[hidden],template'));
    const appFooter=document.querySelector('#app footer, #root footer');
    return {
      count:footers.length,
      navCount:document.querySelectorAll('#tle-global-legal-nav').length,
      integrated:footers.includes(nav.closest('footer'))&&(!appFooter||appFooter.contains(nav)),
      links:[...nav.querySelectorAll('.tle-legal-links a')].map(a=>a.getAttribute('href')),
      lang:document.documentElement.lang,
      overflow:nav.scrollWidth>nav.clientWidth+3
    };
   });
   assert.equal(result.count,1,route+' duplicate footer: '+JSON.stringify(result));
   assert.equal(result.navCount,1,route+' duplicated legal nav');
   assert(result.integrated,route+' legal nav outside original footer');
   const prefix=result.lang.startsWith('es')?'/es':'';
   assert.deepEqual(result.links,['privacy','terms','refunds','cookies','privacy-choices'].map(x=>prefix+'/'+x+'.html'),route+' wrong legal destinations');
   assert(!result.overflow,route+' legal links overflow iPhone width');
   console.log('PASS one branded demo footer '+route);
  }finally{await page.close()}
 }
}finally{await browser.close()}
