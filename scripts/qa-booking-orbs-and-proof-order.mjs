/** Booking lead magnet: blue-bubble full page + quote invite + proof order.
 * Browser-only DOM interaction, no emails, checkout, or customer writes.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const pageHtml=readFileSync('public/booking-demo-reset.html','utf8');
const bubbles=readFileSync('public/assets/tle-booking-blue-orbs.css','utf8');
const curtain=readFileSync('public/assets/tle-demo-curtain-footer.css','utf8');
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
assert.match(pageHtml,/tle-demo-curtain-footer\.css/,'Booking demo curtain style missing');
assert(pageHtml.indexOf('id="tleDemoCurtainPage"')<pageHtml.indexOf('id="bookingPortal"')
 &&pageHtml.indexOf('id="bookingProof"')<pageHtml.indexOf('id="tleDemoCurtainFooter"'),
 'Wrap only the demo content before its single footer');
assert.equal((pageHtml.match(/id="tleDemoCurtainFooter"/g)||[]).length,1,'Only one demo footer');
assert(!pageHtml.includes('site-footer tle-footer-theme'),'Do not merge main marketing footer into demo');
assert.match(curtain,/position:fixed!important/,'Curtain must reveal its fixed footer under the page');
assert.match(curtain,/prefers-reduced-motion:reduce/,'Reduced-motion static footer is required');
assert.match(curtain,/animation-timeline:scroll\(root block\)/,'CSS-only parallax where supported');
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
    await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
    await page.waitForTimeout(120);
    const curtainState=await page.evaluate(()=>{
      const wrap=document.getElementById('tleDemoCurtainPage');
      const footer=document.getElementById('tleDemoCurtainFooter');
      const footerInner=footer.querySelector('.tle-demo-curtain-footer__inner');
      const footerLinks=[...footer.querySelectorAll('nav a')];
      const pos=el=>{const v=el.getBoundingClientRect();return {left:v.left,right:v.right,top:v.top,bottom:v.bottom,width:v.width,height:v.height}};
      const first=footerLinks[0],r=pos(first);
      const clickedOn=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
      return {
       fixed:getComputedStyle(footer).position,
       margin:parseFloat(getComputedStyle(wrap).marginBottom)||0,
       height:footer.getBoundingClientRect().height,
       end:wrap.getBoundingClientRect().bottom,
       innerScroll:footerInner.scrollHeight,
       innerHeight:footerInner.clientHeight,
       links:footerLinks.map(l=>({text:l.textContent.trim(),rect:pos(l),href:l.getAttribute('href')})),
       exposed:!!clickedOn&&(first===clickedOn||first.contains(clickedOn)),
       footerColor:getComputedStyle(footer).backgroundColor,
       overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
       viewHeight:innerHeight
      };
    });
    const shouldBeStatic=reduced;
    assert.equal(curtainState.fixed,shouldBeStatic?'relative':'fixed',
      'Footers must be static in reduced motion and fixed in regular demo: '+JSON.stringify(curtainState));
    assert.equal(curtainState.links.length,3,'Do not lose demo footer links');
    assert(curtainState.links.every(l=>l.href&&l.rect.left>=-2&&l.rect.right<=width+2),
      'Footer links must remain horizontally accessible: '+JSON.stringify(curtainState));
    assert(curtainState.overflow<=3,'Curtain must not create horizontal overflow '+JSON.stringify(curtainState));
    if(!shouldBeStatic){
      assert(Math.abs(curtainState.margin-curtainState.height)<3,'End spacer must equal fixed footer height '+JSON.stringify(curtainState));
      assert(Math.abs(curtainState.end-(curtainState.viewHeight-curtainState.height))<8,'Main must lift above footer reveal '+JSON.stringify(curtainState));
      assert(curtainState.innerScroll<=curtainState.innerHeight+3,'Footer content clipped at '+lang+' '+width+' '+JSON.stringify(curtainState));
      assert(curtainState.exposed,'First footer link is covered by an overlay '+JSON.stringify(curtainState));
    }else{
      assert(curtainState.margin<2,'Reduced-motion footer must return to normal reading order');
    }
    assert.match(await page.locator('#tleDemoFooterHeadline').textContent(),
      lang==='es'?/Una forma más sencilla|Una manera más fácil|Reservar debería/:/A simpler way to book/i,
      'Curtain footer must translate naturally EN/ES');
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
