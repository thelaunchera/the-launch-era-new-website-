/**
 * TLE public demo v12 regression tests. Sample-only, no real requests.
 * Run with QA_URL and PLAYWRIGHT_MODULE in local CI browser.
 */
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const failures=[];
for(const width of [360,390,820,1024,1440]){
 for(const lang of ['en','es']){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base+'/lead-private-preview.html?business=Coastal%20Cleaners&area=Fort%20Lauderdale&lang='+lang+'&sonny=1',{waitUntil:'domcontentloaded',timeout:30000});
   await page.locator('#tleDemoReviews').waitFor({state:'visible',timeout:12000});
   const sonnyQuietOnEntry=await page.locator('#tleSonnyGreetingPopup').evaluate(el=>el.hidden);
   assert(sonnyQuietOnEntry,'Sonny greeting must be hidden on page entry');
   const proof=await page.evaluate(()=>{
    const $=s=>document.querySelector(s);
    const image=$('.tle-demo-v12-why>img');
    const avatar=$('.tle-ai-launch .tle-demo-ai-avatar');
    const area=[...document.querySelectorAll('#tleDemoAreaTags span')].map(x=>x.textContent);
    return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
     sections:['#tleDemoReviews','#tleDemoAreas','#tleDemoFaq'].every(s=>!!$(s)),
     reviews:document.querySelectorAll('#tleDemoReviews article').length,
     honest:[...document.querySelectorAll('#tleDemoReviews article')].every(e=>/SAMPLE|EJEMPLO/i.test(e.textContent)),
     area,faqs:document.querySelectorAll('#tleDemoFaq details').length,
     ai:!!avatar&&avatar.complete&&avatar.naturalWidth>=96,
     photo:image?.complete&&image?.naturalWidth>=900,
     photoSource:image?.getAttribute('src'),
     endLink:$('.tle-demo-v12-end a')?.getAttribute('href'),
     addOn:$('.tle-ai-head small')?.textContent
    };
   });
   const customer=await page.evaluate(()=>{
     const $=sel=>document.querySelector(sel);
     const banner=$('.demo-top-label')?.textContent||'';
     const progress=$('#tleClientProgress');
     const services=$('#residentialServiceList button.service');
     const sticky=$('.tle-client-sticky-cta');
     const brand=$('#demoBrandName')?.textContent||'';
     return {
       enabled:document.documentElement.classList.contains('tle-demo-client-v14'),
       banner:banner,
       brand:brand,
       progress:!!progress,
       progressLabel:progress?.textContent||'',
       steps:document.querySelectorAll('.tle-client-quicksteps li').length,
       sticky:!!sticky,
       serviceOnclick:services?.getAttribute('onclick'),
       note:$('#tleClientSmallNotice')?.textContent||''
     };
   });
   assert(customer.enabled&&customer.progress&&customer.steps===3&&!customer.sticky,
     'Customer-first demo components missing: '+JSON.stringify(customer));
   assert(/SAMPLE|EJEMPLO/i.test(customer.banner),
     'The page must transparently disclose sample-only status');
   assert(customer.brand.includes('Coastal Cleaners'),
     'Customer-facing sample branding must reflect the configured business');
   // Public fictional contact and legal details must not leak to paid tenants.
   const bloom=await page.evaluate(()=>{
     const $=s=>document.querySelector(s), logo=$('#demoBrandName');
     return {
       enabled:document.documentElement.classList.contains('tle-demo-brand-v17'),
       logoCount:logo?.querySelectorAll('.tle-bloom-name').length,
       oldLogoCount:logo?.querySelectorAll('.demo-brand-pink,.demo-logo-spark').length,
       logoAlignment:getComputedStyle(logo).alignItems,
       contact:!!$('#demoContact'),
       email:$('#demoContact .tle-sample-email')?.textContent||'',
       phone:$('#demoContact .tle-sample-phone')?.textContent,
       footer:$('footer.demo-footer')?.classList.contains('tle-demo-full-footer'),
       policies:document.querySelectorAll('footer.demo-footer [data-demo-policy]').length,
       overflow:document.documentElement.scrollWidth>innerWidth+3
     };
   });
   assert(bloom.enabled&&bloom.logoCount===1&&bloom.oldLogoCount===0&&bloom.logoAlignment==='center',
     'Sample brand should have one aligned wordmark: '+JSON.stringify(bloom));
   assert(bloom.contact&&bloom.email.endsWith('.example')&&bloom.phone==='(305) 555-0148'
     &&bloom.footer&&bloom.policies===4&&!bloom.overflow,
     'Fictional contact/footer must be present and responsive: '+JSON.stringify(bloom));
   const compact=await page.evaluate(()=>{
     const footer=document.querySelector('footer.demo-footer');
     const contact=document.querySelector('#demoContact');
     return {
       active:document.documentElement.classList.contains('tle-demo-compact-v18'),
       oldContactSection:!!document.querySelector('section#demoContact'),
       contactTag:contact?.tagName,
       collapsed:!contact?.open,
       moreCollapsed:!document.querySelector('.tle-mini-more')?.open,
       height:Math.round(footer?.getBoundingClientRect().height||0),
       noOverflow:document.documentElement.scrollWidth<=innerWidth+3
     };
   });
   assert(compact.active&&!compact.oldContactSection
     &&compact.contactTag==='DETAILS'&&compact.collapsed&&compact.moreCollapsed
     &&compact.height<=340&&compact.noOverflow,
     'Compact footer must not fill a phone screen: '+JSON.stringify(compact));
   await page.locator('#demoContact summary').click();
   assert.equal(await page.locator('#demoContact').evaluate(el=>el.open),true,
     'Contact should expand only when asked');
   await page.locator('#demoContact summary').click();
   assert.equal(await page.locator('#demoContact').evaluate(el=>el.open),false,
     'Contact should collapse again');
   await page.locator('footer.demo-footer [data-demo-policy="privacy"]').click();
   assert.equal(await page.locator('#tleDemoLegalDialog').evaluate(el=>el.open),true,'Privacy link failed to open');
   assert((await page.locator('.tle-policy-heading').textContent()).includes(lang==='es'?'privacidad':'Privacy'),
     'Policy dialog is not localized');
   await page.locator('.tle-policy-close').click();
   assert.equal(await page.locator('#tleDemoLegalDialog').evaluate(el=>el.open),false,'Policy dialog did not close');
   assert(customer.progressLabel.includes(lang==='es'?'Elige tu servicio':'Choose a cleaning'),
     'Booking progress should start at choosing a service');
   const organic=await page.evaluate(()=>{
     const $=s=>document.querySelector(s);
     const residential=$('#residentialServiceList');
     const commercial=$('#commercialServiceList');
     const custom=residential?.querySelector('.tle-service-subsection');
     const flow=$('.tle-client-quicksteps');
     const first=flow?.querySelector('li');
     const service=residential?.querySelector('button.service');
     return {
       CSS:[...document.styleSheets].some(s=>s.href?.includes('tle-demo-organic-flow-v16.css')),
       residentialBreak:!!custom,
       commercialBreak:!!commercial?.querySelector('.tle-service-subsection'),
       breakText:custom?.textContent||'',
       intro:flow?.querySelector('.tle-steps-intro')?.textContent||'',
       steps:flow?.querySelectorAll('li').length,
       rowBorder:getComputedStyle(service).borderBottomWidth,
       iconBorder:getComputedStyle(service?.querySelector('.ico')).borderWidth,
       stepShape:getComputedStyle(first,'::before').borderRadius,
       horizontalOverflow:document.documentElement.scrollWidth>innerWidth+3
     };
   });
   assert(organic.CSS&&organic.residentialBreak&&organic.commercialBreak,
     'Organic-flow styles or custom-request divider missing: '+JSON.stringify(organic));
   assert(organic.breakText.includes(lang==='es'?'¿NECESITAS':'NEED SOMETHING'),
     'Custom request divider should be localized: '+JSON.stringify(organic));
   assert(organic.intro.includes(lang==='es'?'UNA SOLA EXPERIENCIA':'ONE EASY FLOW')
     &&organic.steps===3,'Timeline label/steps missing: '+JSON.stringify(organic));
   assert(organic.rowBorder==='0px'&&organic.iconBorder==='0px',
     'Service choices should have no square card borders: '+JSON.stringify(organic));
   assert(!organic.horizontalOverflow,
     'Organic layout overflowed responsive viewport: '+JSON.stringify(organic));
   assert(customer.serviceOnclick?.includes('startResidential'),
     'Sample service selection must retain the original booking functionality');
   assert(customer.note.includes(lang==='es'?'confirma':'confirms'),
     'Estimates must disclose that businesses confirm services/prices');
   // This image is intentionally lazy-loaded to keep the demo fast. Scroll it
   // into view and wait for actual decoded pixels before measuring; otherwise
   // a slow mobile browser can report a false image failure.
   await page.locator('.tle-demo-v12-why>img').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>{
     const img=document.querySelector('.tle-demo-v12-why>img');
     return Boolean(img&&img.complete&&img.naturalWidth>700);
   },null,{timeout:12000});
   const chapters=await page.evaluate(()=>{
     const cinematic=document.querySelector('#demoCinematicStory');
     const highlights=cinematic.querySelector('.demo-cinematic-highlights');
     const scene=document.querySelector('.tle-demo-v12-why');
     const media=scene.querySelector(':scope > img');
     const copy=scene.querySelector('.tle-demo-v12-copy');
     const sceneTitle=scene.querySelector('h2');
     const rect=e=>e.getBoundingClientRect();
     return {
       chapterStyle:document.documentElement.classList.contains('tle-demo-story-v15'),
       dark:getComputedStyle(cinematic.querySelector('.demo-cinematic-copy')).backgroundColor,
       ivory:getComputedStyle(copy).backgroundColor,
       heading:sceneTitle.textContent,
       highlightsHidden:getComputedStyle(highlights).display==='none',
       photoBeforeText:rect(media).bottom<=rect(copy).top+1,
       photoWidth:rect(media).width,
       fullWidth:rect(scene).width,
       photoLoaded:media.complete&&media.naturalWidth>700,
       copyWidth:rect(copy).width,
       overflow:document.documentElement.scrollWidth>innerWidth+3
     };
   });
   assert(chapters.chapterStyle,'New editorial chapter styling must be active');
   assert(chapters.highlightsHidden,'Duplicated icon-highlight list must not remain');
   assert.equal(chapters.ivory,'rgb(250, 248, 243)','Second editorial chapter needs warm ivory to separate it from the dark story');
   assert(chapters.heading.includes(lang==='es'?'Una limpieza para cada momento':'The right clean for your everyday'),'The service chapter repeats the earlier narrative');
   if(width<=820)assert(chapters.photoBeforeText,'Finished home photo should bridge between both sections on mobile/tablet: '+JSON.stringify(chapters));
   assert(chapters.photoLoaded&&!chapters.overflow,'Editorial chapter photo failed or page overflows: '+JSON.stringify(chapters));
   assert(proof.sections,'missing proof sections');
   // v19: horizontal sample-review carousel plus gentle promotional ribbon.
   const motion=await page.evaluate(()=>{
     const root=document.documentElement;
     const block=document.getElementById('tleDemoReviews');
     const track=block?.querySelector('.tle-demo-v12-reviewgrid');
     const items=[...(track?.querySelectorAll('article')||[])];
     const ribbon=document.getElementById('tleDemoBlueRibbon');
     const why=document.querySelector('.tle-demo-v12-why');
     const popup=document.getElementById('tleSonnyGreetingPopup');
     return {
       installed:root.classList.contains('tle-demo-motion-v19'),
       reviewDisplay:track?getComputedStyle(track).display:'',
       reviewCount:items.length,trackScroll:track?.scrollWidth||0,trackClient:track?.clientWidth||0,
       sampleLabels:items.every(item=>/SAMPLE|EJEMPLO/.test(item.textContent)),
       controls:block?.querySelectorAll('.tle-review-controls button').length,
       ribbon:!!ribbon,bannerDots:ribbon?.querySelectorAll('.tle-wave-dots button').length,
       bannerAfterPhoto:why?.nextElementSibling===ribbon,
       bannerText:ribbon?.querySelector('.tle-wave-title')?.textContent,
       popupExists:!!popup,
       noOverflow:document.documentElement.scrollWidth<=innerWidth+3
     };
   });
   assert(motion.installed&&motion.reviewDisplay==='flex'
      &&motion.reviewCount===3&&motion.trackScroll>motion.trackClient
      &&motion.sampleLabels&&motion.controls===5,
      'Carousel must be horizontally swipeable with only sample reviews: '+JSON.stringify(motion));
   assert(motion.ribbon&&motion.bannerAfterPhoto&&motion.bannerDots===3
      &&motion.bannerText?.includes(lang==='es'?'más fresca':'fresher home')
      &&motion.popupExists&&motion.noOverflow,
      'Blue ribbon placement or quiet Sonny entrance regressed: '+JSON.stringify(motion));
   await page.locator('.tle-review-arrows button').nth(1).click();
   assert.equal(await page.locator('.tle-review-dots button[aria-current="true"]').getAttribute('aria-label'),
       lang==='es'?'Ver ejemplo 2':'View sample 2','Review next arrow failed');
   await page.locator('.tle-wave-dots button').nth(1).click();
   assert((await page.locator('.tle-wave-title').textContent())?.includes(lang==='es'?'Menos vueltas':'Less back-and-forth'),
      'Banner carousel cannot switch messages');
   assert.equal(proof.reviews,3,'three honest review slots expected');
   assert(proof.honest,'fake unlabelled testimonials detected');
   assert(proof.area.includes('Fort Lauderdale'),'service area is not derived from the current business');
   // v20: locality selection must use business-provided area only, and FAQ
   // must show one meaningful answer rather than four giant stacked blocks.
   const purpose=await page.evaluate(()=>{
     const $=s=>document.querySelector(s);
     const area=$('#tleDemoAreas'),faq=$('#tleDemoFaq');
     const areas=[...area.querySelectorAll('#tleDemoAreaTags .tle-area-v20-chip')];
     const details=[...faq.querySelectorAll('.tle-demo-v12-faqgrid>details')];
     const image=area.querySelector(':scope > img')?.getBoundingClientRect();
     return {
      installed:document.documentElement.classList.contains('tle-demo-purpose-v20'),
      selectedAreas:areas.map(b=>b.textContent.trim()),
      checked:areas.filter(b=>b.getAttribute('aria-pressed')==='true').length,
      sampleNotice:area.querySelector('.tle-demo-v12-disclaimer')?.textContent||'',
      areaCta:area.querySelector('.tle-area-v20-cta')?.getAttribute('href'),
      faqTopics:faq.querySelectorAll('.tle-faq-v20-tab').length,
      activeTopics:faq.querySelectorAll('.tle-faq-v20-tab[aria-pressed="true"]').length,
      visibleAnswers:details.filter(d=>!d.hidden).length,
      firstOpen:details[0]?.open,
      areaImageHeight:image?.height,
      horizontalOverflow:document.documentElement.scrollWidth>innerWidth+3
     };
   });
   assert(purpose.installed&&purpose.selectedAreas.length===1
     &&purpose.selectedAreas[0].includes('Fort Lauderdale')&&purpose.checked===1,
     'Only grounded prospect area may be shown: '+JSON.stringify(purpose));
   assert(purpose.sampleNotice.includes(lang==='es'?'confirma':'confirms')
     &&purpose.areaCta==='#bookingStarter'&&purpose.faqTopics===4
     &&purpose.activeTopics===1&&purpose.visibleAnswers===1&&purpose.firstOpen
     &&!purpose.horizontalOverflow,
     'Area and focused FAQ should have meaningful UI: '+JSON.stringify(purpose));
   if(width<=820)assert(purpose.areaImageHeight<=351,
     'Mobile/tablet coverage hero cannot occupy a full screen: '+JSON.stringify(purpose));
   await page.locator('.tle-faq-v20-tab').nth(1).click();
   assert.equal(await page.locator('.tle-faq-v20-tab[aria-pressed="true"]').count(),1,
      'Only one FAQ topic may be active');
   assert.equal(await page.locator('.tle-demo-v12-faqgrid>details:not([hidden])').count(),1,
      'Only one FAQ answer should be visible');
   assert.equal(await page.locator('.tle-faq-v20-action').getAttribute('href'),'#bookingStarter',
      'FAQ booking action must lead to sample service request');

   assert(proof.faqs>=4,'FAQ is missing');
   assert(proof.ai,'assistant robot file not loaded');
   const photoAfterLazyLoad=await page.locator('.tle-demo-v12-why>img').evaluate(img=>img.complete&&img.naturalWidth>=900);
   assert(photoAfterLazyLoad,'The clean-finished-kitchen image did not load after scrolling and waiting');
   assert(proof.photoSource.includes('pristine-kitchen.png'),'Visual story must advance from active cleaning to the finished kitchen');
   assert(proof.addOn.includes(lang==='es'?'opcional':'optional'),'AI separate service disclosure missing');
   assert.equal(proof.endLink,'#bookingStarter','CTA no longer goes to the existing request UI');
   assert(proof.scrollWidth<=width+3,'horizontal overflow on prospect '+JSON.stringify(proof));
   // Booking editor: no square inset shadow, no rounded service cards,
   // thin updated icon family and a small airy arrow; all 11 buttons still work.
   // v21: the public sample shows real cleaning gallery photos, but original
   // service click handlers, number of choices and estimate paths remain intact.
   const photoChoices=await page.evaluate(()=>{
     const res=[...document.querySelectorAll('#residentialServiceList button.service')];
     const com=[...document.querySelectorAll('#commercialServiceList button.service')];
     const images=[...document.querySelectorAll('.tle-service-photo-v21 img')];
     const first=res[0]?.getBoundingClientRect();
     const image=images[0]?.getBoundingClientRect();
     return {
       enabled:document.documentElement.classList.contains('tle-photo-services-v21'),
       residential:res.length,commercial:com.length,
       imageCount:images.length,
       driveCount:images.filter(img=>img.src.includes('drive.google.com/thumbnail')).length,
       uniqueSources:new Set(images.map(img=>img.dataset.drivePhoto)).size,
       originalActions:[...res,...com].every(button=>button.hasAttribute('onclick')),
       photosHiddenFromScreenReaders:images.every(img=>img.alt===''),
       firstWidth:first?.width,firstImageWidth:image?.width,
       noOverflow:document.documentElement.scrollWidth<=innerWidth+3
     };
   });
   assert(photoChoices.enabled&&photoChoices.residential===5&&photoChoices.commercial===6
     &&photoChoices.imageCount===7&&photoChoices.driveCount===7
     &&photoChoices.uniqueSources===7&&photoChoices.originalActions
     &&photoChoices.photosHiddenFromScreenReaders&&photoChoices.noOverflow,
     'Drive-photo service cards must preserve original actions: '+JSON.stringify(photoChoices));
   assert(photoChoices.firstWidth<=width&&photoChoices.firstImageWidth>45,
     'Service photos cannot overflow or disappear on mobile: '+JSON.stringify(photoChoices));
   const chooser=await page.evaluate(()=>{
     const main=document.querySelector('#bookingStarter #main');
     const styles=getComputedStyle(main);
     const buttons=[...document.querySelectorAll('#residentialServiceList button.service,#commercialServiceList button.service')];
     const row=buttons[0], icon=row.querySelector('.ico'), arrow=row.querySelector('.demo-service-go');
     const s=getComputedStyle(row),i=getComputedStyle(icon),a=getComputedStyle(arrow);
     const rect=row.getBoundingClientRect(), iconRect=icon.getBoundingClientRect();
     const iconShapes=buttons.map(b=>b.querySelector('.ico svg')?.innerHTML).filter(Boolean);
     return {
       squareBackdrop:styles.backgroundColor,backdropImage:styles.backgroundImage,backdropShadow:styles.boxShadow,
       rowBg:s.backgroundImage,rowRadius:parseFloat(s.borderTopLeftRadius),rowShadow:s.boxShadow,
       iconBg:i.backgroundColor,iconRadius:parseFloat(i.borderTopLeftRadius),
       iconWidth:iconRect.width,arrowWidth:parseFloat(a.width),iconUnique:new Set(iconShapes).size,
       buttonCount:buttons.length,overflow:rect.right>innerWidth+2||rect.left<0
     };
   });
   assert.equal(chooser.squareBackdrop,'rgba(0, 0, 0, 0)','The square inset backdrop reappeared: '+JSON.stringify(chooser));
   assert.equal(chooser.backdropImage,'none','The inset background must be transparent');
   assert.equal(chooser.backdropShadow,'none','The square backdrop cannot have a shadow');
   assert.equal(chooser.rowBg,'none','Service rows may not be filled cards');
   assert(chooser.rowRadius<=1&&chooser.rowShadow==='none','Service rows must be border-only, without rounded cards');
   assert(chooser.iconRadius<=14&&chooser.iconWidth>=37,'Lightweight outline icon sizing regressed');
   assert(chooser.iconUnique>=10&&chooser.buttonCount===11,'The eleven distinct booking-service icons are missing');
   assert(chooser.arrowWidth<=29,'Bulky circular service arrow returned');
   assert(!chooser.overflow,'Booking row overflows the mobile viewport');
   const agentTitle=await page.locator('.tle-ai-head b').textContent();
   assert(agentTitle?.includes('Sonny'),'booking agent should be named Sonny');
   assert.equal(await page.locator('#tleDemoRobotWelcome').count(),0,'Duplicate floating assistant welcome remains');
   if(width<=650){
     const mobile=await page.evaluate(()=>{
       const cs=s=>getComputedStyle(document.querySelector(s));
       const avatar=document.querySelector('.tle-ai-launch .tle-demo-ai-avatar');
       return {
         heroCta:cs('#leadHero .demo-hero-cta').display,
         begin:cs('#bookingStarter .demo-panel-start').display,
         robotSize:parseFloat(cs('.tle-ai-launch').width),
         robotIcon:avatar?.complete&&avatar.naturalWidth>=96,
         botCount:document.querySelectorAll('.tle-ai-launch').length,
         decorativeBefore:cs('.tle-ai-launch').getPropertyValue('content'),
         noSticky:document.querySelectorAll('.tle-client-sticky-cta').length===0
       };
     });
     assert(mobile.heroCta==='none'&&mobile.begin==='none','Redundant mobile Choose Services/Begin buttons still shown: '+JSON.stringify(mobile));
     assert(mobile.robotSize<=49&&mobile.robotIcon&&mobile.botCount===1,'Sonny bubble too large or missing: '+JSON.stringify(mobile));
     assert(mobile.noSticky,'Floating Request Cleaning button reappeared');
   }
   assert.equal(await page.locator('.tle-ai-launch').count(),1,'Only Sonny should have one launch button');
   assert.equal(await page.locator('#tleSonnyInlineHello').count(),0,'Obsolete dark Sonny banner must be removed');
   assert.equal(await page.locator('#tleSonnyInlineGreeting').count(),0,'Obsolete white in-hero Sonny card must be removed');
   assert.equal(await page.locator('#tleSonnyGreetingPopup').count(),1,'Exactly one small greeting popup');
   assert.equal(await page.locator('.tle-ai-panel').isHidden(),true,'Sonny cannot cover the demo before visitor asks');
   const greeting=await page.evaluate(()=>{
     const node=document.querySelector('#tleSonnyGreetingPopup'),launcher=document.querySelector('.tle-ai-launch');
     const css=getComputedStyle(node),rect=node.getBoundingClientRect(),bot=launcher.getBoundingClientRect();
     return {position:css.position,background:css.backgroundColor,color:css.color,
       popupWidth:rect.width,popupRight:innerWidth-rect.right,
       launcherWidth:bot.width,launcherRight:innerWidth-bot.right,
       hidden:node.hidden,chatClosed:document.querySelector('.tle-ai-panel')?.hidden};
   });
   assert(greeting.position==='fixed'&&greeting.background==='rgb(20, 43, 61)','Greeting must be a dark popup, not white: '+JSON.stringify(greeting));
   assert(greeting.popupWidth<=236&&greeting.popupRight>=-2&&greeting.launcherRight>=-2,'Sonny popup must be compact and right-aligned: '+JSON.stringify(greeting));
   assert(greeting.chatClosed,'Chat is not permitted to auto-open behind the popup');
   await page.locator('.tle-ai-launch').click();
   await assertVisible(page,'.tle-ai-panel');
   assert.equal(await page.locator('#tleSonnyGreetingPopup').isVisible(),false,'Greeting must dismiss when visitor opens Sonny');
   const field=page.locator('.tle-ai-form textarea');
   const contrast=await field.evaluate(e=>{
     const s=getComputedStyle(e),ph=getComputedStyle(e,'::placeholder');
     return {color:s.color,textFill:s.webkitTextFillColor,background:s.backgroundColor,placeholder:ph.color,caret:s.caretColor};
   });
   assert.equal(contrast.color,'rgb(25, 25, 25)','Sonny textarea typed text must be dark');
   assert.equal(contrast.textFill,'rgb(25, 25, 25)','iPhone text fill must not inherit white on white');
   assert.equal(contrast.background,'rgb(255, 255, 255)','Sonny typing background must be white');
   assert.equal(contrast.caret,'rgb(25, 25, 25)','Sonny caret must be visible');
   await field.fill('Help with a sample booking');
   assert.equal(await field.inputValue(),'Help with a sample booking','Typing must remain editable');
   await page.locator('.tle-ai-head button').click();
   // Simulated finished demo: no real form submission, API call, or email.
   await page.evaluate(()=>{
      window.showBrandedRequestSuccess('Coastal Cleaners');
      window.showDemoRequestSummary({service:'Standard Cleaning',date:'2026-10-24',time:'10:00'});
      window.show('done','Request received','✓');
   });
   const retry=page.locator('#tleTrySonny');
   await retry.waitFor({state:'visible',timeout:5000});
   assert((await retry.textContent()).includes(lang==='es'?'Sonny':'Try it again with the booking agent'),'missing retry call to action');
   await retry.click();
   await assertVisible(page,'.tle-ai-panel');
   assert(await page.locator('#main').evaluate(e=>e.classList.contains('on')),'Retry must restore the service-picker start screen');
   assert((await page.locator('.tle-ai-head b').textContent())?.includes('Sonny'),'Retry did not open Sonny');
   assert((await page.locator('.tle-ai-msg.bot').first().textContent())?.includes('Sonny'),'Retry did not restart Sonny conversation');
   assert(await page.locator('#done').evaluate(e=>!e.classList.contains('on')),'Old confirmation must not remain active');
   console.log('PASS prospect',lang,width);
  }catch(e){failures.push('prospect '+lang+' '+width+': '+e.message);console.error('FAIL prospect',lang,width,e.message,'js errors:',errors)}
  finally{await page.close();}
 }
}
for(const width of [360,390,820,1024,1440]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base+'/booking-demo/index.html',{waitUntil:'domcontentloaded',timeout:30000});
  try{await page.locator('#tleDemoFormGuide').waitFor({state:'visible',timeout:5000})}
  catch{
   const diag=await page.evaluate(()=>({path:location.pathname,title:document.title,main:!!document.querySelector('main.wrap'),form:!!document.querySelector('#demoForm'),sales:!!document.querySelector('#tleDemoSalesExperience'),includesScript:[...document.scripts].some(s=>s.src.includes('tle-demo-enhancements-v12.js'))}));
   throw new Error('Sales enhancement not loaded: '+JSON.stringify(diag));
  }
  const state=await page.evaluate(()=>{
   const $=s=>document.querySelector(s);
   const avatar=$('.tle-jessy-fab img');
   const photo=$('.tle-demo-v12-salesphotos img');
   return {scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,
    sales:!!$('#tleDemoSalesExperience'),reviews:!!$('#tleDemoSalesProof'),
    form:!!$('#demoForm'),jessyUnchanged:!!avatar&&avatar.src.includes('/assets/jessy-avatar.webp'),
    gallery:photo?.complete&&photo.naturalWidth>900,
    controls:document.querySelectorAll('.tle-demo-v12-formactions button').length};
  });
  assert(state.sales&&state.reviews&&state.form,'sales page preview missing');
  assert(state.jessyUnchanged&&state.gallery,'Jessy must retain her own avatar; sales gallery must load');
  assert.equal(state.controls,3,'sales guide needs three help actions');
  assert(state.scrollWidth<=width+3,'sales page horizontal overflow '+JSON.stringify(state));
  await page.locator('#demoForm [name="name"]').fill('QA Tester');
  await page.locator('#demoForm [name="business"]').fill('Sample Company');
  await page.locator('.tle-demo-v12-formactions [data-action="form"]').click();
  const active=await page.evaluate(()=>document.activeElement?.name);
  assert.equal(active,'business','Help with form did not focus business field');
  await page.selectOption('#language','es');
  assert.equal(await page.locator('#demoForm [name="business"]').inputValue(),'Sample Company','Language switch wiped the form');
  await page.locator('.tle-jessy-fab').click();
  await assertVisible(page,'.tle-jessy-panel');
  assert((await page.locator('.tle-jessy-title b').textContent())?.includes('Jessy'),'Jessy was incorrectly renamed on sales demo');
  console.log('PASS sales',width);
 }catch(e){failures.push('sales '+width+': '+e.message);console.error('FAIL sales',width,e.message,'js errors:',errors)}
 finally{await page.close()}
}
for(const query of ['?key=qa-test-no-real-key','?owner_preview=1']){
 const page=await browser.newPage();
 try{
  await page.goto(base+'/lead-private-preview.html'+query,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(250);
  const hidden=await page.evaluate(()=>!document.getElementById('tleDemoReviews')&&!document.querySelector('.tle-demo-v12-welcome'));
  assert(hidden,'customer or owner booking preview must not display sample-only v12 sections');
  console.log('PASS isolation',query);
 }catch(e){failures.push('isolated '+query+': '+e.message)}
 finally{await page.close()}
}
await browser.close();
if(failures.length){console.error('\n'+failures.join('\n'));process.exit(1)}
async function assertVisible(page,selector){await page.locator(selector).waitFor({state:'visible',timeout:7000})}
