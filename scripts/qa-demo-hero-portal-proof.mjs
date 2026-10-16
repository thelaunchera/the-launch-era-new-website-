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
assert.match(html,/These example review cards.+not published customer testimonials/);
assert(!/gsap|Flip\.min|zoom:|backdrop-filter/.test(style),'No unrelated zoom libraries or glassmorphism');
assert.match(style,/@media\(prefers-reduced-motion:reduce\)/,'Respect reduced-motion accessibility');
assert.match(style, /--portal-scale/, 'Window zoom through focal point missing');
assert.match(script,/sonnyToggle/,'Must open real Sonny chat, no dummy widget');
assert.match(script,/portalClickDuration=2800/,'Window click must use the deliberate 2.8s transition instead of native smooth scrolling');
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
  // Only the OLD word may carry the strike. The replacement stays clean in both languages.
  const strikeScope=await page.locator('#bookingPortalHeadline').evaluate(heading=>{
   const old=heading.querySelector('.booking-portal-old');
   const next=heading.querySelector('.booking-portal-new');
   const line=heading.querySelector('.booking-portal-strike');
   const word=heading.querySelector('.booking-portal-old-word');
   return {parent:line?.parentElement===old,oldHidden:old?.getAttribute('aria-hidden'),
    newHidden:next?.getAttribute('aria-hidden'),oldText:word?.textContent,
    newText:next?.textContent,strokeWidth:line?.getBoundingClientRect().width,
    oldWidth:word?.getBoundingClientRect().width,swapWidth:heading.querySelector('.booking-portal-swap')?.getBoundingClientRect().width,
    nextWidth:next?.getBoundingClientRect().width};
  });
  assert(strikeScope.parent&&strikeScope.oldHidden==='true'&&strikeScope.newHidden==='true',
   'Strike must be nested exclusively in accessible-hidden OLD word: '+JSON.stringify(strikeScope));
  assert(strikeScope.strokeWidth<=strikeScope.oldWidth+2&&strikeScope.swapWidth>=strikeScope.nextWidth-2,
   'Line must not stretch to replacement word: '+JSON.stringify(strikeScope));
  assert.equal(strikeScope.oldText,lang==='es'?'aceptables.':'decent.');
  assert.equal(strikeScope.newText,lang==='es'?'extraordinarias.':'remarkable.');
  const stage=await page.locator('.booking-portal-stage').boundingBox();
  assert(stage?.width>=width-3,'Hero must use full viewport width: '+JSON.stringify(stage));
  const linked=await page.locator('#bookingHeroDemo').getAttribute('href');
  assert.equal(linked,'#bookingPage');
  assert.equal(await page.locator('#bookingPortalEnter').count(),1);
  assert.equal(await page.locator('.booking-review').count(),3,'Three clearly illustrative proof cards');
  assert.match(await page.locator('#bookingProofDesc').textContent(),/not published customer testimonials|No son reseñas publicadas/);
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
    // Final headline must remain visibly clean after the 450ms stroke and 400ms beat.
    await page.waitForTimeout(2350);
    const words=await page.locator('#bookingPortalHeadline').evaluate(heading=>({
      oldOpacity:Number(getComputedStyle(heading.querySelector('.booking-portal-old')).opacity),
      newOpacity:Number(getComputedStyle(heading.querySelector('.booking-portal-new')).opacity)
    }));
    assert(words.oldOpacity<.05&&words.newOpacity>.95,
      'Old word AND its nested strike must fade before clean replacement settles: '+JSON.stringify(words));
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
  await page.locator('#resServices .service').first().click();
  await page.locator('#chooseNext').click();
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
