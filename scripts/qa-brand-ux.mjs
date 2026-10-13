/** Brand experience smoke checks: public marketing and fictional demo ONLY.
 * Does not authenticate, send inquiries, submit bookings or access tenant data.
 */
import {strict as assert} from 'node:assert';
import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
fs.mkdirSync('qa-screenshots/brand-ux',{recursive:true});
let failures=[],passed=0;
const cases=[
 {url:'/',name:'home-en',type:'home'},
 {url:'/es/',name:'home-es',type:'home'},
 {url:'/cleaning-web-app/',name:'app-en',type:'app'},
 {url:'/es/cleaning-web-app/',name:'app-es',type:'app'},
 {url:'/booking-lead-automation/',name:'booking-en',type:'booking'},
 {url:'/lead-private-preview.html?business=Coastal%20Cleaners&area=South%20Florida',name:'sample-demo',type:'demo'}
];
for(const item of cases){
 for(const w of [360,390,820,1440]){
  const page=await browser.newPage({viewport:{width:w,height:900},reducedMotion:'reduce'});
  try{
   await page.goto(base+item.url,{waitUntil:'domcontentloaded',timeout:30000});
   const selector=item.type==='demo'?'html.demo-editorial':item.type==='app'?'.tle-app-landing':item.type==='booking'?'.service-hero':'.sales-home';
   await page.locator(selector).waitFor({state:'attached',timeout:15000});
   await page.waitForTimeout(300);
   const out=await page.evaluate((t)=>{
    const html=document.documentElement;
    const body=document.body;
    const screenshotWidth=html.scrollWidth;
    const viewport=window.innerWidth;
    const paletteProbe=t==='demo'?document.querySelector('.demo-hero-cta'):document.querySelector('.site-footer');
    const bg=paletteProbe?getComputedStyle(paletteProbe).backgroundColor:null;
    const linkCount=[...document.querySelectorAll('.site-footer a')].filter(x=>/get in touch/i.test(x.textContent||'')).length;
    const brandStyles=[...document.styleSheets].some(s=>s.href?.includes('tle-saas-ui-v1.css'));
    const cta=[...document.querySelectorAll('.cta-button svg.lucide-arrow-right,.service-cta svg.lucide-arrow-right')][0];
    const icon=cta?getComputedStyle(cta):null;
    return {width:screenshotWidth,viewport,bg,linkCount,brandStyles,iconWidth:icon?parseFloat(icon.width):null,sampleMode:html.classList.contains('demo-editorial'),formPresent:!!document.querySelector('.panel #main .category-tabs')};
   },item.type);
   assert(out.width<=out.viewport+3,'horizontal overflow '+JSON.stringify(out));
   if(item.type==='demo'){
    assert(out.sampleMode,'Public sample did not enter demo mode');
    assert(out.formPresent,'Sample booking UI missing');
    assert.equal(out.bg,'rgb(215, 239, 255)','Demo CTA is not Butter/Soft Blue '+JSON.stringify(out));
   }else{
    assert(out.brandStyles,'Unified marketing stylesheet absent');
    assert.equal(out.linkCount,0,'Repeated Get in Touch remains in footer');
    if(out.iconWidth!==null) assert(out.iconWidth>=26,'Primary CTA icon too small');
   }
   await page.screenshot({path:'qa-screenshots/brand-ux/'+item.name+'-'+w+'.png',fullPage:w===390});
   passed++;
   console.log('PASS '+item.name+' '+w+' '+JSON.stringify(out));
  }catch(e){failures.push(item.name+' '+w+': '+e.message);console.error('FAIL '+item.name+' '+w+' '+e.message)}
  finally{await page.close()}
 }
}
const guard=await browser.newPage();
try{await guard.goto(base+'/lead-private-preview.html?key=qa-nonexistent-token',{waitUntil:'domcontentloaded',timeout:30000});assert(!await guard.locator('html').evaluate(e=>e.classList.contains('demo-editorial')),'Buyer key accidentally gets public sample blue theme');console.log('PASS buyer key isolation')}catch(e){failures.push('buyer isolation: '+e.message)}
await guard.close();
await browser.close();
console.log('RESULT: '+passed+'/'+cases.length*4+' public layouts passed');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
