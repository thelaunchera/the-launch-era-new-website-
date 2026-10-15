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
     compact:document.documentElement.classList.contains('tle-demo-compact-v30'),
     galleryCards:document.querySelectorAll('#tleV31GalleryRail .tle-v31-gallery-card').length,
     editorialCards:document.querySelectorAll('#tleDemoEditorialGallery .tle-editorial-photo-card').length,
     editorialShown:(()=>{const e=$('.tle-demo-v12-why');return !!e&&e.getBoundingClientRect().height>100})(),
     editorialSlides:document.querySelectorAll('#tleV32EditorialControls button').length,
     galleryBeforeReviews:(()=>{const g=$('#tleV31Transformations'),rv=$('#tleDemoReviews');return !!g&&!!rv&&!!(g.compareDocumentPosition(rv)&Node.DOCUMENT_POSITION_FOLLOWING)})(),
     editorialBeforeGallery:(()=>{const e=$('#tleDemoEditorialGallery'),g=$('#tleV31Transformations');return !!e&&!!g&&!!(e.compareDocumentPosition(g)&Node.DOCUMENT_POSITION_FOLLOWING)})(),
     reviewCards:document.querySelectorAll('#tleDemoReviews .tle-demo-v12-reviewgrid article').length,
     galleryVisible:(()=>{const g=document.getElementById('tleV31Transformations');const r=g?.getBoundingClientRect();return !!r&&r.height>130&&getComputedStyle(g).display!=='none'})(),
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
     beginHidden:getComputedStyle(cta).display==='none',
     heroHidden:getComputedStyle($('.hero .demo-hero-cta')).display==='none',
     ctaWithinHeader:cta.getBoundingClientRect().top>=$('.panel .head').getBoundingClientRect().top-2&&cta.getBoundingClientRect().bottom<=$('.panel .head').getBoundingClientRect().bottom+2,
     heroPhotoLoaded:$('.demo-cb-hero-media img')?.complete&&$('.demo-cb-hero-media img')?.naturalWidth>=1536,
     heroPhotoSource:$('.demo-cb-hero-media img')?.getAttribute('src'),
     heroTextColor:getComputedStyle($('.heroText .demo-headline')).color,
     heroPrimaryVisible:(()=>{const r=$('.hero .demo-hero-cta').getBoundingClientRect();const h=$('#leadHero').getBoundingClientRect();return r.left>=h.left-1&&r.right<=h.right+2&&r.bottom<=h.bottom+2})(),
     heroAreaVisible:(()=>{const r=$('#demoHeroArea').getBoundingClientRect();const h=$('#leadHero').getBoundingClientRect();return r.left>=h.left-1&&r.right<=h.right+2&&r.bottom<=h.bottom+2})(),
     categoryButtons:$('#categoryTabs').querySelectorAll('button').length,
     columns:grid.split(' ').length,
     editorialTitle:$('.demo-cinematic-copy h2').textContent,
     mainActive:$('#main').classList.contains('on')
    };
   });
   assert(m.mode&&m.css,'Public sample styles not activated');
   assert(m.scrollWidth<=width+2,'Horizontal overflow '+JSON.stringify(m));
   if(m.compact){
     assert(!m.storyVisible&&m.galleryCards===3&&m.galleryVisible&&m.editorialShown&&m.editorialCards===2&&m.editorialSlides>=4&&m.galleryBeforeReviews&&m.editorialBeforeGallery&&m.reviewCards===3,'Editorial -> Before/After -> Reviews order, swipe, or review rail missing: '+JSON.stringify(m));
   }else{
     assert(m.storyAfterPanel&&m.storyVisible&&m.photoVisible,'Photo editorial section missing or not directly after booking card '+JSON.stringify(m));
   }
   if(!m.compact)assert(m.photoImage.includes('drive-cleaner-kitchen.webp'),'Drive cinematic photo missing');
   const approvedPhotoLoaded=await page.evaluate(()=>new Promise(resolve=>{
     const img=new Image();
     img.onload=()=>resolve(img.naturalWidth>=1536&&img.naturalHeight>=658);
     img.onerror=()=>resolve(false);
     img.src='/assets/cleaning-demo/living-room-original.jpg';
   }));
   assert(approvedPhotoLoaded,'Approved photo asset missing or unreadable');
   const quotePhoto=await page.evaluate(()=>{
    const el=document.querySelector('#quote .demo-quote-header');const c=getComputedStyle(el);
    return {image:c.backgroundImage,title:getComputedStyle(el.querySelector('h3')).color};
   });
   assert(quotePhoto.image.includes('living-room-original.jpg')&&!quotePhoto.image.includes('250, 248, 243'),'Quote card must use the original room and black overlay');
   assert.equal(quotePhoto.title,'rgb(255, 255, 255)','Quote title must stay white');
   assert.equal(m.cardCount,5,'Five working residential options must remain');
   assert(m.cardIconWidth>=19,'Service card icons hidden or too small: '+JSON.stringify({width,cardIconWidth:m.cardIconWidth,photoMode:await page.evaluate(()=>document.documentElement.classList.contains('tle-photo-services-v21'))}));
   assert(m.serviceFont>=14.5,'Service typography too small');
   assert(m.headerFont.includes('Prompt'),'Headings not using Prompt typography');
   assert(m.ctaRadius>=24 && m.circleRadius>=16,'CTA or arrow icon still looks square');
   assert(m.ctaInsideHeader&&(width<=650?m.beginHidden:m.ctaWithinHeader),'Mobile Begin must be hidden; desktop Begin pill must remain inside header: '+JSON.stringify(m));
   assert(m.heroPhotoLoaded&&m.heroPhotoSource?.includes('hero-cleaner-original.jpg'),'CB-style woman cleaning photo did not load');
   assert((m.compact?m.heroPrimaryVisible:(width<=650?m.heroHidden:m.heroPrimaryVisible))&&m.heroAreaVisible,'Hero CTA and service area must fit: '+JSON.stringify(m));
   assert(m.heroTextColor==='rgb(255, 255, 255)','Midnight hero headline should be white');
   const darkUi=await page.evaluate(()=>({
     css:[...document.styleSheets].some(s=>s.href?.includes('tle-demo-midnight-v11.css')),
     page:getComputedStyle(document.body).backgroundColor,
     panelBg:getComputedStyle(document.querySelector('#bookingStarter')).backgroundImage,
     title:getComputedStyle(document.querySelector('#bookingStarter .head h2')).color,
     card:getComputedStyle(document.querySelector('#residentialServiceList .service')).backgroundImage,
     cardColor:getComputedStyle(document.querySelector('#residentialServiceList .service')).backgroundColor,
     price:getComputedStyle(document.querySelector('#residentialServiceList .service .price')).color
   }));
   assert(darkUi.css&&darkUi.page==='rgb(8, 13, 19)','Midnight stylesheet/page backdrop not active '+JSON.stringify(darkUi));
   if(await page.evaluate(()=>document.documentElement.classList.contains('tle-photo-services-v21'))){
     // The v21 photo cards intentionally have a contained photo surface; unlike
     // the old giant nested options, they are compact and remain fully clickable.
     assert(darkUi.panelBg==='none'&&darkUi.cardColor==='rgb(247, 251, 255)',
       'Photo service cards should be intentional, with transparent parent: '+JSON.stringify(darkUi));
     const photoShape=await page.evaluate(()=>{
       const btn=document.querySelector('#residentialServiceList button.service');
       const photo=btn.querySelector('.tle-service-photo-v21 img');
       return {button:btn.getBoundingClientRect().width,image:photo.getBoundingClientRect().width,
               count:document.querySelectorAll('.tle-service-photo-v21 img').length,
               overflow:document.documentElement.scrollWidth>innerWidth+3};
     });
     assert(photoShape.count===7&&photoShape.button<=width&&photoShape.image>45&&!photoShape.overflow,
       'Drive photo cards must be compact, visible and responsive: '+JSON.stringify(photoShape));
   } else {
     assert(darkUi.panelBg==='none'&&darkUi.card==='none','Continuous design should not render nested booking/option cards: '+JSON.stringify(darkUi));
   }
   assert(darkUi.title==='rgb(255, 255, 255)'&&darkUi.price==='rgb(35, 96, 138)','Dark text and strong blue price contrast lost '+JSON.stringify(darkUi));
   assert.equal(m.ctaHref,'#categoryTabs','Begin must be a working anchor');
   assert.equal(m.categoryButtons,2,'Residential/Commercial navigation missing');
   assert(m.editorialTitle.includes(lang==='es'?'El valor está':'The difference'),'The photographic storytelling headline is missing: '+JSON.stringify(m.editorialTitle));
   assert(m.mainActive,'Service selection should open by default');
   // Real tap acceptance: the CTA must move to the VISIBLE service panel,
   // never a hidden marketing eyebrow. Works for English and Spanish.
   if(width<=650){
     // Mobile design removes the giant CTA visually, while preserving its semantic anchor fallback.
     await page.locator('#leadHero a.demo-hero-cta').evaluate(el=>el.click());
   }else await page.locator('#leadHero a.demo-hero-cta').click();
   await page.waitForTimeout(300);
   const heroNavigation=await page.evaluate(()=>{
     const panel=document.getElementById('bookingStarter');
     const cta=document.querySelector('#leadHero .demo-hero-cta');
     const icon=cta.querySelector('.demo-inline-arrow');
     const svg=icon.querySelector('svg');
     const r=panel.getBoundingClientRect();
     return {
       hash:location.hash,
       scroll:window.scrollY,
       focusMode:document.documentElement.classList.contains('tle-demo-booking-active'),
       marketingHidden:getComputedStyle(document.getElementById('demoCinematicStory')).display==='none',
       panelTop:r.top,
       visible:r.height>100&&getComputedStyle(panel).display!=='none',
       panelIdCount:document.querySelectorAll('#bookingStarter').length,
       svgVisible:!!svg&&svg.getBoundingClientRect().width>=20,
       arrowBackground:getComputedStyle(icon).backgroundColor,
       oldArrow:getComputedStyle(icon,'::before').content,
       stylePresent:[...document.styleSheets].some(sheet=>sheet.href?.includes('tle-demo-cta-v9.css'))
     };
   });
   assert.equal(heroNavigation.panelIdCount,1,'Booking target ID must be unique');
   assert(heroNavigation.visible&&(heroNavigation.focusMode?heroNavigation.marketingHidden:heroNavigation.scroll>80)&&heroNavigation.panelTop>=-10&&heroNavigation.panelTop<235,
      'Choose your service did not scroll to visible form: '+JSON.stringify(heroNavigation));
   assert.equal(heroNavigation.hash,'#bookingStarter','Hero CTA destination must update URL');
   assert(heroNavigation.stylePresent&&(heroNavigation.focusMode||width<=650||heroNavigation.svgVisible&&heroNavigation.arrowBackground==='rgba(0, 0, 0, 0)'&&heroNavigation.oldArrow==='none'),
      'Old diamond/block arrow still appears: '+JSON.stringify(heroNavigation));
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
   await page.evaluate(()=>showMain());
   await page.locator('#residentialServiceList button.service').nth(3).click();
   const quoteSize=await page.evaluate(()=>{
    const q=document.querySelector('#quote').getBoundingClientRect();
    const card=document.querySelector('#quote .demo-quote-header').getBoundingClientRect();
    const panel=document.querySelector('#bookingStarter');
    const p=panel.getBoundingClientRect(),s=getComputedStyle(panel);
    return {ratio:q.width/(p.width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)),height:card.height,overflow:document.documentElement.scrollWidth>innerWidth+2};
   });
   assert(!quoteSize.overflow,'Expanded quote creates horizontal overflow');
   if(width>=768)assert(quoteSize.ratio>=.97&&quoteSize.height>=350,'Quote photo must fill desktop/tablet panel '+JSON.stringify(quoteSize));
   assert.equal(faults.length,0,'Unexpected JS errors '+faults.join(' | '));
   console.log('PASS',lang,width,JSON.stringify({compact:m.compact,gallery:m.galleryCards,fonts:m.headerFont,serviceButtons:true}));
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
   sampleStylesActive:[...document.styleSheets].some(s=>s.href?.includes('tle-demo-booking-v7.css')),
   heroDecorativeHidden:getComputedStyle(document.querySelector('#leadHero .demo-cb-hero-media')).display==='none'
  }));
  assert(!status.isPublic&&!status.editorialShown&&status.heroDecorativeHidden,'Private preview unexpectedly shows sample hero/story');
  console.log('PASS isolated',scope);
 }catch(e){errors.push('private '+scope+': '+e.message)}
 finally{await page.close()}
}
await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
