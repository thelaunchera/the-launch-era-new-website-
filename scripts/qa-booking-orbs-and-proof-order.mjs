/** Booking lead magnet: blue-bubble full page + quote invite + proof order.
 * Browser-only DOM interaction, no emails, checkout, or customer writes.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const pageHtml=readFileSync('public/booking-demo-reset.html','utf8');
const bubbles=readFileSync('public/assets/tle-booking-blue-orbs.css','utf8');
const original=readFileSync('public/lead-private-preview.html','utf8');
const emailSource=readFileSync('supabase/functions/tle-jessie-demo-lead/index.ts','utf8');
assert.match(pageHtml,/tle-booking-blue-orbs\.css/,'Blue bubbles theme stylesheet missing');
assert.match(pageHtml,/id="bookingCustomOverline"/);
assert.match(pageHtml,/id="bookingCustomSummary"/);
assert.match(pageHtml,/id="bookingCustomAction"/);
assert.match(pageHtml,/id="bookingCustomTitle"/);
assert.match(pageHtml,/class="booking-custom-arrow"/);
assert(pageHtml.indexOf('id="bookingBeforeAfter"')<pageHtml.indexOf('id="bookingProof"'),
  'Before & After must be above Reviews');
assert.match(bubbles,/radial-gradient/);
const premium=readFileSync('public/assets/tle-booking-premium-refresh.css','utf8');
assert.match(premium,/sonny-avatar-mark/,'Original approved Sonny robot bubble must stay intact');
assert.match(emailSource,/lead-private-preview\.html/,'Existing email lead magnet link must remain');
assert.match(original,/owner_preview/,'Buyer preview isolation must remain');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try {
  for(const [lang,width,reduced] of [
    ['en',360,false],['es',390,false],['en',820,false],['es',1440,false],['en',390,true]
  ]){
    const page=await browser.newPage({viewport:{width,height:844},reducedMotion:reduced?'reduce':'no-preference'});
    const errors=[],writes=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(['POST','PATCH','PUT','DELETE'].includes(r.method()))writes.push(r.url())});
    const qp=new URLSearchParams({lang,business:'Blue Bubble Cleaning',area:'Palm Beach',source:'jessie_email',rid:'sample-qa'});
    await page.goto(base+'/lead-private-preview.html?'+qp.toString(),{waitUntil:'load',timeout:50000});
    await page.waitForURL('**/booking-demo-reset.html?*',{timeout:20000});
    assert.equal(await page.locator('#leadBusiness').textContent(),'Blue Bubble Cleaning');
    const r=await page.evaluate(()=>{
      const proof=document.getElementById('bookingProof').getBoundingClientRect();
      const before=document.getElementById('bookingBeforeAfter').getBoundingClientRect();
      const invite=document.querySelector('.booking-custom-invite');
      const custom=document.getElementById('customQuote');
      const bodyCSS=getComputedStyle(document.body);
      const mainCSS=getComputedStyle(document.getElementById('bookingPage'));
      const sonny=document.getElementById('sonnyToggle');
      const avatar=document.querySelector('.sonny-avatar-mark img');
      const avatarBox=avatar?.getBoundingClientRect();
      return {
        order:before.top<proof.top,
        bodyBlue:bodyCSS.backgroundColor,
        bubbleLayers:bodyCSS.backgroundImage.includes('radial-gradient')&&mainCSS.backgroundImage.includes('radial-gradient'),
        quoteCard:custom.querySelectorAll('.booking-custom-text, .booking-custom-arrow').length,
        quoteWidth:custom.getBoundingClientRect().width,
        invite:!!invite&&getComputedStyle(invite).display!=='none',
        sonnyImage:avatar?.getAttribute('src'),sonnyVisible:!!avatarBox&&avatarBox.width>=40&&avatarBox.height>=40,
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        beforeWidth:before.width,proofWidth:proof.width,
        lastCompareBottom:document.querySelector('.booking-compare-card:last-child').getBoundingClientRect().bottom,
        firstReviewTop:document.querySelector('.booking-review:first-child').getBoundingClientRect().top,
        firstReviewTopCode:document.querySelector('#bookingReview1Mark')?.textContent,
        disclosureBelow:document.getElementById('bookingProofDesc').getBoundingClientRect().top>
          document.querySelector('.booking-review:last-child').getBoundingClientRect().bottom
      };
    });
    assert(r.order,'Reviews not underneath Before and After '+lang+' '+width);
    assert(r.bubbleLayers,'Bubbles did not reach full booking page '+lang+' '+width+JSON.stringify(r));
    assert(r.quoteCard===2 && r.quoteWidth>=Math.min(270,width-60),'Custom quote card missing/too narrow '+JSON.stringify(r));
    assert(r.invite,'Custom quote bubble section hidden');
    assert(r.sonnyImage.includes('ai-demo-robot.webp')&&r.sonnyVisible,'Approved Sonny blue robot head must remain visible');
    assert(r.overflow<=3,'Horizontal overflow '+JSON.stringify(r));
    assert.equal(await page.locator('.booking-compare-card').count(),3,'Matched Before/After missing');
    assert.equal(await page.locator('.booking-review').count(),3,'The three original illustrative demo review cards are missing');
    assert(r.firstReviewTop>r.lastCompareBottom&&r.firstReviewTop-r.lastCompareBottom<275,
      'Reviews must appear shortly after the matched photo comparisons without the previous excessive gap '+JSON.stringify(r));
    assert(r.disclosureBelow,'Review cards should appear before the truthful illustrative disclosure');
    assert.match(r.firstReviewTopCode,lang==='es'?/EXPLORA SIN COMPLICARTE/:/EASY TO EXPLORE/,
      'Original cards and their label must be localized EN ES');
    assert.match(await page.locator('#bookingProofDesc').textContent(),
      /not published customer testimonials|No son reseñas publicadas/,'Do not invent customer testimonials');
    assert.equal(await page.locator('.service-media img').count(),6,'Approved service photo cards missing');
    assert.match(await page.locator('#bookingCustomAction').textContent(),
      lang==='es'?/cotización personalizada/i:/custom quote/i,'Quote card lost translation');
    // Quote path must be the ORIGINAL sample-only handler, not a new link to a paid checkout.
    await page.locator('#customQuote').click();
    assert.equal(await page.locator('#detailsPanel').isVisible(),true,'Custom quote flow broken');
    await page.locator('#backDetails').click();
    // No extra Sonny bot, use existing chat button with the blue robot bubble.
    assert.equal(await page.locator('#sonnyToggle').count(),1);
    await page.locator('#sonnyToggle').click();
    assert.equal(await page.locator('#sonnyBody').isVisible(),true,'Sonny chat cannot open');
    await page.locator('#sonnyToggle').click();
    assert.equal(await page.locator('#sonnyBody').isVisible(),false,'Sonny chat cannot close');
    assert.deepEqual(writes,[],'Never send real booking or email');
    assert.deepEqual(errors,[],'JavaScript error '+lang+' '+width);
    console.log('PASS BOOKING_BUBBLES '+JSON.stringify({lang,width,reduced,...r}));
    await page.close();
  }
  console.log('[BOOKING SKY BUBBLES + ORDER QA PASS] EN/ES and all widths');
} finally {await browser.close();}
