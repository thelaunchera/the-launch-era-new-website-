/** Booking lead magnet visual integration. No external writes, real emails, or checkout.
 * Confirm one approved hero portal/strike, isolated Sonny, EN/ES, photos,
 * sample-only reviews, paired before/after and untouched booking business logic.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const html=readFileSync('public/booking-demo-reset.html','utf8');
const style=readFileSync('public/assets/tle-demo-hero-portal.css','utf8');
const script=readFileSync('public/assets/tle-demo-hero-portal.js','utf8');
assert.match(html,/tle-booking-hero-original\.webp/);
assert.match(html,/bookingPortalHeadline/);
assert.match(html,/bookingBeforeAfter/);
assert.match(html,/bookingHeroSonny/);
assert.match(html,/id="bookingPortalCompany"/,'Hero must show a company name immediately');
assert.match(html,/id="bookingPortalCompanyFinal"/,'Hero name must survive window zoom');
assert.doesNotMatch(html,/id="pageIntro"|id="eyebrow"/,'Booking heading must have no unnecessary preheading or intro');
assert.match(html,/id="pageTitle">A simpler way to book a clean\./,'Preserve requested short booking heading');
assert.match(html,/data-photo="\/assets\/demo-transformations\/track-before\.webp"/,'Restore real paired window tracks before photo');
assert.match(html,/data-photo="\/assets\/demo-transformations\/track-after\.webp"/,'Restore matching window tracks after photo');
assert.doesNotMatch(html,/data-photo="\/assets\/demo-transformations\/vanity-(before|after)\.webp"/,'Remove subdued bathroom comparison');
assert.match(html,/Experience snapshots from this interactive sample, not customer testimonials or verified reviews/);
assert(!/gsap|Flip\.min|zoom:|backdrop-filter/.test(style),'No unrelated zoom libraries or glassmorphism');
assert.match(style,/@media\(prefers-reduced-motion:reduce\)/,'Respect reduced-motion accessibility');
assert.match(style, /--portal-scale/, 'Window zoom through focal point missing');
assert.match(script,/sonnyToggle/,'Must open real Sonny chat, no dummy widget');
assert.match(script,/portalClickDuration=2800/,'Window click must use the deliberate 2.8s transition instead of native smooth scrolling');
assert.match(style,/booking-portal-back::after[\\s\\S]*linear-gradient/,'Hero back scene must have gradient');
assert.match(style,/2026-10-17 Blue cinematic hero/,'Blue upgrade must be scoped to existing hero');
assert.match(style,/booking-strike/,'Do not lose remarkable original strike animation');
assert.match(html,/family=Caveat:wght@500;600;700/,'Handwriting font must be requested non-blocking alongside interface fonts');
const ink=readFileSync('public/assets/tle-demo-ink-service-cards.css','utf8');
assert.match(ink,/--tle-demo-handwriting:'Caveat'/,'Use same handwriting family across editorial headings');
assert.match(ink,/#bookingProofTitle/,'Editorial proof must share handwritten font');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const records=[];
try {
 for(const [lang,width,reduced] of [
  ['en',360,false],['es',390,false],['en',820,false],
  ['es',1024,false],['en',1440,false],['es',390,true]
 ]){
  const page=await browser.newPage({viewport:{width,height:850},reducedMotion:reduced?'reduce':'no-preference'});
  const errors=[],unexpectedWrites=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/POST|PATCH|PUT|DELETE/.test(r.method())&&!r.url().includes('/tle-ai-booking-demo'))unexpectedWrites.push(r.url());});
  const qs=new URLSearchParams({business:'Sample Sunny Cleaning',area:'Palm Beach',lang,source:'jessie_email',rid:'QA-safe'});
  await page.goto(base+'/lead-private-preview.html?'+qs.toString(),{waitUntil:'load',timeout:50000});
  await page.waitForURL('**/booking-demo-reset.html?*',{timeout:16000});
  const image=page.locator('.booking-portal-picture').first();
  await page.waitForFunction(()=>{
    const img=document.querySelector('.booking-portal-picture');
    return img?.complete&&img.naturalWidth>=1100;
  },null,{timeout:16000});
  assert.equal(await page.locator('#leadBusiness').textContent(),'Sample Sunny Cleaning');
  assert.equal(await page.locator('#bookingPortalCompany').textContent(),'Sample Sunny Cleaning','Personalized business must be in original photo hero');
  assert.equal(await page.locator('#bookingPortalCompanyFinal').textContent(),'Sample Sunny Cleaning','Business name must stay on the hero after window zoom');
  assert.equal(await page.locator('#leadContext').isVisible(),false,'Do not repeat company in a white box under hero');
  assert.equal(await page.locator('#pageTitle').textContent(),lang==='es'?'Una forma más sencilla de reservar una limpieza.':'A simpler way to book a clean.');
  assert.equal(await page.locator('#pageIntro').count(),0,'Remove redundant paragraph');

  assert.equal(await page.locator('#leadArea').textContent().then(x=>x.includes('Palm Beach')),true);
  assert.equal(await page.locator('#bookingPortalHeadline').getAttribute('aria-label'),
    lang==='es'?'Haz que tus reservas sean extraordinarias.':'Make your booking flow remarkable.');
  assert.equal(await page.locator('#bookingPortalHeadline .booking-portal-swap').getAttribute('aria-hidden'),'true');
  const swap=await page.locator('#bookingPortalHeadline').evaluate(el=>{
    const old=el.querySelector('.booking-portal-old'),newWord=el.querySelector('.booking-portal-new');
    const strike=el.querySelector('.booking-portal-strike'),word=el.querySelector('.booking-portal-old-word');
    return {nested: strike?.parentElement===old,oldHidden:old?.getAttribute('aria-hidden'),newHidden:newWord?.getAttribute('aria-hidden'),
      oldText:word?.textContent,newText:newWord?.textContent,
      oldWidth:word?.getBoundingClientRect().width,strikeWidth:strike?.getBoundingClientRect().width,
      swapWidth:el.querySelector('.booking-portal-swap')?.getBoundingClientRect().width,
      newWidth:newWord?.getBoundingClientRect().width};
  });
  assert(swap.nested&&swap.oldHidden==='true'&&swap.newHidden==='true','Strike belongs only to old word: '+JSON.stringify(swap));
  assert(swap.strikeWidth<=swap.oldWidth+2&&swap.swapWidth>=swap.newWidth-2,'Strike may not cross longer replacement: '+JSON.stringify(swap));
  assert.equal(swap.oldText,lang==='es'?'aceptables.':'decent.');
  assert.equal(swap.newText,lang==='es'?'extraordinarias.':'remarkable.');
  const editorial=await page.evaluate(()=>{
    const headline=document.getElementById('bookingPortalHeadline');
    const scriptLine=document.getElementById('bookingPortalLine');
    const swap=document.querySelector('.booking-portal-swap');
    const old=document.getElementById('bookingPortalOld');
    const newWord=document.getElementById('bookingPortalNew');
    const rect=scriptLine.getBoundingClientRect();
    const gradient=getComputedStyle(document.querySelector('.booking-portal-back'),'::after').backgroundImage;
    return {
      font:getComputedStyle(scriptLine).fontFamily,
      swapFont:getComputedStyle(newWord).fontFamily,
      margin:getComputedStyle(swap).marginTop,
      effect:getComputedStyle(newWord).animationName,
      oldEffect:getComputedStyle(old).animationName,
      left:rect.left,right:rect.right,
      within:rect.left>=0&&rect.right<=innerWidth+3,
      heroWidth:headline.getBoundingClientRect().width,
      gradient,
      proofFont:getComputedStyle(document.getElementById('bookingProofTitle')).fontFamily,
      galleryFont:getComputedStyle(document.getElementById('tleWorkGalleryTitle')).fontFamily,
      journeyFont:getComputedStyle(document.getElementById('bookingBubbleTitle')).fontFamily,
      comparisonFont:getComputedStyle(document.getElementById('bookingCompareTitle')).fontFamily,
      footerFont:getComputedStyle(document.getElementById('tleDemoFooterHeadline')).fontFamily
    };
  });
  assert(editorial.font.includes('Caveat'),'Make your booking flow must use the one handwriting family '+JSON.stringify(editorial));
  assert(!editorial.swapFont.includes('Caveat'),'Preserve remarkable as serif, never handwriting');
  assert(editorial.proofFont.includes('Caveat')&&editorial.galleryFont.includes('Caveat')&&editorial.journeyFont.includes('Caveat')&&editorial.comparisonFont.includes('Caveat')&&editorial.footerFont.includes('Caveat'),
   'All editorial chapter titles must reuse one consistent handwriting style');
  assert(editorial.within,lang+' '+width+' booking flow must fit one line without overflow '+JSON.stringify(editorial));
  assert(editorial.gradient.includes('linear-gradient')&&(editorial.gradient.includes('rgba(4, 28, 51')||editorial.gradient.includes('rgba(6, 34, 57')),
   'Hero must show dark blue overlay instead of a white wash '+JSON.stringify(editorial));
  assert(parseFloat(editorial.margin)<0,'Raise remarkable slightly, preserving its old/new swap');
  const stage=await page.locator('.booking-portal-stage').boundingBox();
  assert(stage?.width>=width-3,'Hero must use full viewport width: '+JSON.stringify(stage));
  const linked=await page.locator('#bookingHeroDemo').getAttribute('href');
  assert.equal(linked,'#bookingPage');
  assert.equal(await page.locator('#bookingPortalEnter').count(),1);
  assert.equal(await page.locator('.booking-review').count(),3,'Three clearly illustrative proof cards');
  assert.match(await page.locator('#bookingProofDesc').textContent(),/not customer testimonials or verified reviews|no son testimonios ni reseñas verificadas/);
  assert.equal(await page.locator('.booking-compare-card').count(),3,'Existing matched before/after library pairs reused');
  assert.match(await page.locator('#bookingPair3Title').textContent(),lang==='es'?/Rieles de ventana/:/Window tracks/);
  const track=page.locator('.booking-compare-card').nth(2);
  assert.equal(await track.locator('img.before').getAttribute('data-photo'),'/assets/demo-transformations/track-before.webp');
  assert.equal(await track.locator('img.after').getAttribute('data-photo'),'/assets/demo-transformations/track-after.webp');

  assert.equal(await page.locator('.service-media img').count(),6,'Existing large service cards preserved');
  const viewport=await page.evaluate(()=>({
   extra:document.documentElement.scrollWidth-document.documentElement.clientWidth,
   hero:getComputedStyle(document.querySelector('#bookingPortal')).height,
   media:getComputedStyle(document.querySelector('.booking-portal-front')).display,
   open:document.querySelector('.booking-portal-copy').classList.contains('is-active')
  }));
  assert(viewport.extra<=3,lang+' '+width+' unwanted horizontal zoom/overflow '+JSON.stringify(viewport));
  if(reduced){
    assert.equal(viewport.media,'none','Reduced motion must skip the scene zoom');
    assert.equal(viewport.open,true,'Reduced motion must expose final heading');
  }else{
    await page.locator('#bookingPortalEnter').click();
    // On an iPhone tap the window should still be visible after the first half second,
    // rather than immediately disappearing as it did in the supplied screen recording.
    await page.waitForTimeout(550);
    const early=await page.locator('#bookingPortalFront').evaluate(el=>({
      opacity:parseFloat(getComputedStyle(el).opacity),
      fraction:Math.max(0,-document.getElementById('bookingPortal').getBoundingClientRect().top)/
        Math.max(1,document.getElementById('bookingPortal').offsetHeight-innerHeight)
    }));
    assert(early.opacity>.5&&early.fraction<.5,
      'Entrance vanished in under a second instead of progressing gradually: '+JSON.stringify(early));
    await page.waitForFunction(()=>document.querySelector('.booking-portal-copy')?.classList.contains('is-active'),null,{timeout:10000});
    await page.waitForFunction(()=>parseFloat(getComputedStyle(document.getElementById('bookingPortalFront')).opacity)<.08,
      null,{timeout:8000});
    const zoom=await page.locator('#bookingPortalFront').evaluate(el=>({
      opacity:parseFloat(getComputedStyle(el).opacity),
      transform:getComputedStyle(el).transform
    }));
    assert(zoom.opacity<.1,lang+' '+width+' front window must fade to reveal second scene: '+JSON.stringify(zoom));
    const remarkableAnimation=await page.locator('#bookingPortalHeadline').evaluate(el=>({
      newAnimation:getComputedStyle(el.querySelector('.booking-portal-new')).animationName,
      oldAnimation:getComputedStyle(el.querySelector('.booking-portal-old')).animationName,
      strikeAnimation:getComputedStyle(el.querySelector('.booking-portal-strike')).animationName
    }));
    assert(remarkableAnimation.newAnimation.includes('booking-new-in')&&remarkableAnimation.oldAnimation.includes('booking-old-out')&&remarkableAnimation.strikeAnimation.includes('booking-strike'),
     'Do not replace or suppress the original remarkable effect '+JSON.stringify(remarkableAnimation));
    await page.waitForFunction(()=>{
      const line=document.querySelector('.booking-portal-strike');
      const old=line?.closest('.booking-portal-old');
      const newer=document.querySelector('.booking-portal-new');
      // With the line inside old text, the parent's opacity also hides its line.
      return old&&newer&&parseFloat(getComputedStyle(old).opacity)<.08
        &&parseFloat(getComputedStyle(newer).opacity)>.95;
    },null,{timeout:5000});
    await page.locator('#bookingHeroSonny').click();
    assert.equal(await page.locator('#sonnyBody').isVisible(),true,'Hero shortcut must open the real Sonny chat');
    await page.locator('#sonnyToggle').click();
    assert.equal(await page.locator('#sonnyBody').isVisible(),false,'Sonny must close');
  }
  // The image comparison must be a real accessible range, never two unrelated
  // pictures or fabricated customer outcomes.
  const sliders=page.locator('.booking-compare-visual input[type="range"]');
  assert.equal(await sliders.count(),3);
  const first=sliders.first();
  await first.evaluate(el=>{el.value='72';el.dispatchEvent(new Event('input',{bubbles:true}))});
  assert.equal(await first.evaluate(el=>el.closest('.booking-compare-visual').style.getPropertyValue('--compare-split')),'72%');
  await page.locator('#resServices .service').first().dispatchEvent('click');
   assert.equal(await page.locator('#resServices .service-flip-card').first().getAttribute('class').then(x=>x.includes('is-flipped')),true);
   await page.locator('#resServices .service-flip-select').first().click();
  assert.equal(await page.locator('#detailsPanel').isVisible(),true,'Booking flow must remain functional');
  assert.deepEqual(unexpectedWrites,[],'Demo must not create orders or email leads');
  assert.deepEqual(errors,[],lang+' '+width+' JS exception(s)');
  records.push({lang,width,reduced,extra:viewport.extra});
  console.log('PASS HERO_PORTAL '+JSON.stringify(records.at(-1)));
  await page.close();
 }
 const defaultPage=await browser.newPage({viewport:{width:390,height:844}});
 await defaultPage.goto(base+'/booking-demo-reset.html?lang=en',{waitUntil:'load'});
 assert.equal(await defaultPage.locator('#bookingPortalCompany').textContent(),'Sunshine Cleaning Demo','Unpersonalized public hero should show fictional company');
 assert.equal(await defaultPage.locator('#bookingPortalCompanyFinal').textContent(),'Sunshine Cleaning Demo');
 await defaultPage.close();
 console.log('[HERO PORTAL AND PROOF QA PASS] '+JSON.stringify(records));
} finally {await browser.close()}
