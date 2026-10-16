/* Read-only diagnostic. Compares root hydration with and without public
 * pre-hydration scripts. No form submits, clicks, emails or checkout. */
import {chromium} from 'playwright';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const variants=[
 ['all',{block:[]}],
 ['no-jessy',{block:['jessy-site.js']}],
 ['no-proof',{block:['tle-purchase-proof.js']}],
 ['no-newsletter',{block:['tle-footer-newsletter.js']}],
 ['no-3rd-party',{block:['jessy-site.js','tle-purchase-proof.js','tle-footer-newsletter.js']}]
];
const browser=await chromium.launch({headless:true});
let result=[];
try{
 for(const [variant,settings] of variants){
  for(const lang of ['en','es']){
   for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:844}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error'&&m.text().includes('hydration'))errors.push(m.text().slice(0,400))});
    for(const asset of settings.block)await page.route('**/assets/'+asset+'*',route=>route.abort());
    await page.goto(base+(lang==='es'?'/es/':'/'),{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForFunction(()=>{
      const btn=document.querySelector('.booking-section .product-tabs button');
      return !!(btn && Object.keys(btn).some(k=>k.startsWith('__reactProps')));
    },null,{timeout:30000}).catch(()=>{});
    await page.waitForTimeout(500);
    const d=await page.evaluate(()=>({
      chat:!!document.querySelector('.tle-jessy-root'),
      reactBtn:!!document.querySelector('.booking-section .product-tabs button'),
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      img:!!document.querySelector('.hero-split-visual img')
    }));
    const entry={variant,lang,width,hydration:errors.filter(e=>/418|Hydrat/i.test(e)),others:errors.filter(e=>!/418|Hydrat/i.test(e)),dom:d};
    result.push(entry);
    console.log('HYDRATION_DIAG '+JSON.stringify(entry));
    await page.close();
   }
  }
 }
 console.log('HYDRATION_COMPARISON '+JSON.stringify(result.map(x=>({variant:x.variant,lang:x.lang,width:x.width,hydration:x.hydration.length,other:x.others.length,dom:x.dom}))));
}finally{await browser.close();}
