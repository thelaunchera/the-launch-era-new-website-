/** Visual-only QA for The Launch Era fictional prospect cleaning demo.
 * Never sends a booking, submits contact details, opens customer records, or triggers email.
 * Uses built-in UI-only transition functions to render request and confirmation.
 */
import {strict as assert} from 'node:assert';
import fs from 'node:fs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
fs.mkdirSync('qa-screenshots/demo-v6',{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
for(const lang of ['en','es']){
 for(const width of [360,390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const url=base+'/lead-private-preview.html?business=Coastal%20Cleaners&area=Fort%20Lauderdale&lang='+lang;
  try{
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   await page.locator('.demo-hero-cta').waitFor({state:'visible',timeout:18000});
   await page.waitForTimeout(350);
   const main=await page.evaluate(()=>{
    const q=s=>document.querySelector(s);
    const rect=e=>e?.getBoundingClientRect();
    const hero=q('.hero'),h=q('.heroText h1.demo-headline'),cta=q('.demo-hero-cta'),area=q('#demoHeroArea');
    return {
     width:document.documentElement.scrollWidth,viewport:innerWidth,
     style:[...document.styleSheets].some(s=>s.href?.includes('tle-demo-editorial-v6.css')),
     mode:document.documentElement.classList.contains('demo-editorial'),
     blue:getComputedStyle(cta).backgroundColor,
     headline:h?.textContent.trim(),headFont:parseFloat(getComputedStyle(h).fontSize),
     headlineVisible:!!rect(h)&&rect(h).width>0&&rect(h).height>0,
     ctaVisible:rect(cta).bottom<=rect(hero).bottom+2&&rect(cta).left>=rect(hero).left,
     areaText:area?.textContent?.trim(),areaVisible:rect(area).bottom<=rect(hero).bottom+2,
     heroPhoto:document.querySelector('#leadHero .demo-cb-hero-media img')?.getAttribute('src'),
     heroImgLoaded:(()=>{const img=document.querySelector('#leadHero .demo-cb-hero-media img');return !!img&&img.complete&&img.naturalWidth>700})(),
     heroCbCss:[...document.styleSheets].some(sheet=>sheet.href?.includes('tle-demo-cb-hero-v8.css')),
     ctaInHero:rect(cta).bottom<=rect(hero).bottom+2&&rect(cta).left>=rect(hero).left,
     areaInHero:rect(area).bottom<=rect(hero).bottom+2,
     showcaseTitle:q('.demo-showcase-intro h2')?.textContent.trim(),
     quoteCards:q('.demo-showcase-cards')?.children.length
    };
   });
   assert(main.mode,'Not a public sample');
   assert(main.style,'Brand-approved stylesheet not loaded');
   assert(main.width<=main.viewport+3,'Horizontal overflow on hero: '+JSON.stringify(main));
   assert.equal(main.blue,'rgb(215, 239, 255)','CTA must be brand Soft Blue');
   assert(main.headlineVisible && main.headFont>=32,'Hero headline illegible');
   assert(main.ctaVisible && main.areaVisible,'First-impression CTA / area clipped by hero');
   assert(main.areaText===(lang==='es'?'Atendemos Fort Lauderdale':'Serving Fort Lauderdale'),'Area not localized or personalized: '+main.areaText);
   assert(main.showcaseTitle.includes(lang==='en'?'Clear details':'Detalles claros'),'New slogans missing');
   assert.equal(main.quoteCards,3,'Functional cleaning-service cards missing');
   assert(main.heroPhoto?.includes('/assets/cleaning-demo/hero-woman-cleaning.jpg')&&main.heroImgLoaded&&main.heroCbCss,'CB Depot style cleaning professional hero must load');
   assert(main.ctaInHero&&main.areaInHero,'Hero action or personalized service badge is clipped');
   try{await page.screenshot({path:'qa-screenshots/demo-v6/'+lang+'-'+width+'-hero.png',fullPage:false});}catch(imageError){console.warn('Optional browser screenshot failed at hero for',lang,width,imageError.message);}
   await page.evaluate(()=>startQuote('estimate'));
   const quote=await page.evaluate(()=>{
    const e=document.querySelector('#quote');
    const box=e?.getBoundingClientRect();
    return {shown:e?.classList.contains('on'),photo:getComputedStyle(document.querySelector('#quote .demo-quote-header')).backgroundImage,area:document.querySelector('#demoQuoteArea')?.textContent,quoteVisible:!!box&&box.width>0};
   });
   assert(quote.shown && quote.quoteVisible,'Quote page not active');
   assert(quote.photo.includes('cleaner-action.png'),'Missing professional cleaners photo for quote');
   assert(quote.area.includes('Fort Lauderdale'),'Quote area personalization missing');
   try{await page.screenshot({path:'qa-screenshots/demo-v6/'+lang+'-'+width+'-quote.png',fullPage:false});}catch(imageError){console.warn('Optional browser screenshot failed at quote for',lang,width,imageError.message);}
   // Present a synthetic confirmation without invoking any save() or submit().
   await page.evaluate(()=>{
     showDemoRequestSummary({service:'Deep Cleaning',date:'2026-10-22',time:'09:30'});
     showBrandedRequestSuccess('Coastal Cleaners');
     show('done','Request received','✓');
   });
   const done=await page.evaluate(()=>({
    shown:document.querySelector('#done').classList.contains('on'),
    summary:!document.querySelector('#demoSuccessSummary').hidden,
    title:document.querySelector('#done .success h2')?.textContent,
    service:document.querySelector('#demoSuccessService')?.textContent,
    area:document.querySelector('#demoSuccessArea')?.textContent,
    note:document.querySelector('#tleSuccessPreview')?.textContent,
    cta:document.querySelector('#trackerLink')?.getAttribute('href'),
    width:document.documentElement.scrollWidth
   }));
   assert(done.shown&&done.summary&&done.service?.length>0,'Summary UI failed: '+JSON.stringify(done));
   assert(done.area==='Fort Lauderdale','Confirmation area not personalized');
   assert(/demo|prueba|sample|muestra/i.test(done.note)&&done.note.length>35,'Sample-safe confirmation notice missing: '+done.note);
   assert(done.cta.includes('Coastal+Cleaners') || done.cta.includes('Coastal%20Cleaners'),'Tracker preserves business identity');
   assert(done.width<=width+3,'Confirmation causes overflow');
   try{await page.screenshot({path:'qa-screenshots/demo-v6/'+lang+'-'+width+'-confirmation.png',fullPage:false});}catch(imageError){console.warn('Optional browser screenshot failed at confirmation for',lang,width,imageError.message);}
   console.log('PASS',lang,width,JSON.stringify({cta:main.blue,area:done.area,quotePhoto:true,confirm:true}));
  }catch(e){errors.push(lang+' '+width+': '+e.message);console.error('FAIL',lang,width,e.message)}
  finally{await page.close()}
 }
}
for(const type of ['buyer','owner']){
 const page=await browser.newPage();
 try{
  const url=base+'/lead-private-preview.html'+(type==='buyer'?'?key=qa-test-no-real-key':'?owner_preview=1');
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  const safety=await page.evaluate(()=>({mode:document.documentElement.classList.contains('demo-editorial'),showcase:getComputedStyle(document.querySelector('.demo-service-showcase')).display,styles:[...document.styleSheets].some(s=>s.href?.includes('tle-demo-editorial-v6.css'))}));
  assert(!safety.mode,'Private path misclassified as public sample');
  assert.equal(safety.showcase,'none','Private path shows sample showcase');
  console.log('PASS isolated',type);
 }catch(e){errors.push('isolation '+type+': '+e.message)}
 finally{await page.close()}
}
await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
