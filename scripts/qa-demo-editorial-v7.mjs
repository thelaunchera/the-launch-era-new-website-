/** Acceptance test for the reference-approved responsive Cleaning booking demo.
 * Sample mode only. Never submits form, sends email, or loads customer data.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium }=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const errors=[];
fs.mkdirSync('qa-screenshots/demo-v7',{recursive:true});
for(const lang of ['en','es']){
 for(const width of [360,390,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const faults=[];
  page.on('pageerror',e=>faults.push(e.message));
  try{
   await page.goto(base+'/lead-private-preview.html?business=Sample%20Cleaning&area=Miami&lang='+lang,{waitUntil:'domcontentloaded',timeout:30000});
   await page.locator('.panel #main .service').first().waitFor({state:'visible',timeout:15000});
   await page.waitForTimeout(350);
   const m=await page.evaluate(()=>{
    const $=s=>document.querySelector(s);
    const rec=s=>$(s)?.getBoundingClientRect();
    const panel=rec('.panel'),story=rec('.demo-cinematic-story'),photo=rec('.demo-cinematic-photo');
    const cta=$('.demo-panel-start'),circ=$('.demo-panel-start-circle');
    const select=$('#residentialServiceList');
    const grid=getComputedStyle(select).gridTemplateColumns;
    return {
     mode:document.documentElement.classList.contains('demo-editorial'),
     css:[...document.styleSheets].some(s=>s.href?.includes('tle-demo-booking-v7.css')),
     viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
     storyAfterPanel:story.top>=panel.bottom-3,
     storyVisible:story.width>0&&story.height>150,
     photoVisible:photo.width>0&&photo.height>200,
     photoImage:getComputedStyle($('.demo-cinematic-photo')).backgroundImage,
     cardCount:select.querySelectorAll('button.service').length,
     cardIconWidth:rec('#residentialServiceList .service .ico svg').width,
     cardPrice:select.querySelector('.price')?.textContent,
     headerFont:getComputedStyle($('.panel .head h2')).fontFamily,
     serviceFont:parseFloat(getComputedStyle($('#residentialServiceList .service b')).fontSize),
     ctaBg:getComputedStyle(cta).backgroundImage,ctaRadius:parseFloat(getComputedStyle(cta).borderTopLeftRadius),
     circleRadius:parseFloat(getComputedStyle(circ).borderTopLeftRadius),
     ctaHref:cta.getAttribute('href'),
     ctaInsideHeader:$('.panel .head').contains(cta),
     ctaWithinHeader:cta.getBoundingClientRect().top>=$('.panel .head').getBoundingClientRect().top-2&&cta.getBoundingClientRect().bottom<=$('.panel .head').getBoundingClientRect().bottom+2,
     categoryButtons:$('#categoryTabs').querySelectorAll('button').length,
     columns:grid.split(' ').length,
     editorialTitle:$('.demo-cinematic-copy h2').textContent,
     mainActive:$('#main').classList.contains('on')
    };
   });
   assert(m.mode&&m.css,'Public sample styles not activated');
   assert(m.scrollWidth<=width+2,'Horizontal overflow '+JSON.stringify(m));
   assert(m.storyAfterPanel&&m.storyVisible&&m.photoVisible,'Photo editorial section missing or not directly after booking card '+JSON.stringify(m));
   assert(m.photoImage.includes('living-suite.png'),'Real home photo not available in editorial panel');
   assert.equal(m.cardCount,5,'Five working residential options must remain');
   assert(m.cardIconWidth>=19,'Service card icons hidden or too small');
   assert(m.serviceFont>=14.5,'Service typography too small');
   assert(m.headerFont.includes('Prompt'),'Headings not using Prompt typography');
   assert(m.ctaRadius>=24 && m.circleRadius>=16,'CTA or arrow icon still looks square');
   assert(m.ctaInsideHeader&&m.ctaWithinHeader,'Begin pill must sit inside header, not as a full-width bar: '+JSON.stringify(m));
   assert.equal(m.ctaHref,'#categoryTabs','Begin must be a working anchor');
   assert.equal(m.categoryButtons,2,'Residential/Commercial navigation missing');
   assert(m.editorialTitle.includes(lang==='es'?'Detalles pensados':'Thoughtful details'),'New editorial copy missing: '+JSON.stringify(m.editorialTitle));
   assert(m.mainActive,'Service selection should open by default');
   await page.screenshot({path:'qa-screenshots/demo-v7/'+lang+'-'+width+'-booking-and-story.png',fullPage:true});
   await page.locator('#categoryTabs button[data-category="commercial"]').click();
   const commercial=await page.evaluate(()=>({
      visible:!document.querySelector('#commercialServiceList').hidden,
      residentialHidden:document.querySelector('#residentialServiceList').hidden,
      buttons:document.querySelectorAll('#commercialServiceList button.service').length
   }));
   assert(commercial.visible&&commercial.residentialHidden&&commercial.buttons===6,'Commercial services toggle regressed: '+JSON.stringify(commercial));
   await page.locator('#commercialServiceList button.service').first().click();
   assert(await page.locator('#commercial.screen.on').count()===1,'Commercial quote action not functional');
   await page.evaluate(()=>showMain());
   await page.locator('#categoryTabs button[data-category="residential"]').click();
   await page.locator('#residentialServiceList button.service').first().click();
   assert(await page.locator('#res.screen.on').count()===1,'Residential cleaning action not functional');
   assert.equal(faults.length,0,'Unexpected JS errors '+faults.join(' | '));
   console.log('PASS',lang,width,JSON.stringify({story:true,photo:true,fonts:m.headerFont,serviceButtons:true,ctaRound:true}));
  }catch(e){errors.push(lang+' '+width+': '+e.message);console.error('FAIL',lang,width,e.message)}
  finally{await page.close()}
 }
}
for(const scope of ['?key=qa-invalid-key','?owner_preview=1']){
 const page=await browser.newPage();
 try{
  await page.goto(base+'/lead-private-preview.html'+scope,{waitUntil:'domcontentloaded',timeout:30000});
  const status=await page.evaluate(()=>({
   isPublic:document.documentElement.classList.contains('demo-editorial'),
   editorialShown:getComputedStyle(document.querySelector('#demoCinematicStory')).display!=='none',
   sampleStylesActive:[...document.styleSheets].some(s=>s.href?.includes('tle-demo-booking-v7.css'))
  }));
  assert(!status.isPublic&&!status.editorialShown,'Private preview unexpectedly shows sample story');
  console.log('PASS isolated',scope);
 }catch(e){errors.push('private '+scope+': '+e.message)}
 finally{await page.close()}
}
await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
