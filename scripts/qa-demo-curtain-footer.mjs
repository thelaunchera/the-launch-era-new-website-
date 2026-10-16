/* Public sample Booking Demo ONLY: footer curtain, EN/ES, no real booking writes. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const html=readFileSync('public/booking-demo-reset.html','utf8');
const css=readFileSync('public/assets/tle-demo-curtain-footer.css','utf8');
const shared=readFileSync('src/components/site-shell.tsx','utf8');
assert.match(html,/class="tle-demo-curtain-page" id="tleDemoCurtainPage"/,'One main demo curtain wrapper');
assert.match(html,/class="tle-demo-curtain-footer" id="tleDemoCurtainFooter"/,'One public demo footer');
assert(html.indexOf('id="bookingProof"')<html.indexOf('id="tleDemoCurtainFooter"'),'Demo proof/reviews must precede footer');
assert.equal((html.match(/id="footerCopy"/g)||[]).length,1,'Single localized original sample disclaimer');
assert(!shared.includes('tle-demo-curtain-page'),'Site-wide footer/marketing pages must NOT change');
assert.match(css,/position:fixed!important/,'Demo curtain footer should wait beneath document');
assert.match(css,/margin-bottom:var\(--tle-demo-curtain-height\)/,'Demo curtain needs a real spacer above footer');
assert.match(css,/prefers-reduced-motion:reduce/,'Reduced-motion footer falls back to static flow');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,width,height,reduced] of [
  ['en',360,780,false],['es',390,844,false],['en',820,1180,false],['es',1440,900,false],
  ['en',390,844,true],['es',360,780,true]
 ]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
   const errors=[],writes=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(['POST','PATCH','PUT','DELETE'].includes(r.method()))writes.push(r.url())});
   await page.goto(base+'/booking-demo-reset.html?lang='+lang,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>!!document.getElementById('tleDemoCurtainFooter'),null,{timeout:10000});
   let s=await page.evaluate(()=>{
    const wrapper=document.getElementById('tleDemoCurtainPage');
    const footer=document.getElementById('tleDemoCurtainFooter');
    const rect=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,left:r.left,right:r.right}};
    return {wrapper:rect(wrapper),footer:rect(footer),
     footerPosition:getComputedStyle(footer).position,
     wrapperPosition:getComputedStyle(wrapper).position,
     gap:parseFloat(getComputedStyle(wrapper).marginBottom),
     overflow:document.documentElement.scrollWidth-innerWidth,
     footerLinks:[...footer.querySelectorAll('a')].map(x=>x.getAttribute('href')),
     language:document.documentElement.lang};
   });
   assert.equal(s.language,lang,lang+' language switch lost');
   assert(s.overflow<=3,'Horizontal overflow '+lang+' '+width+': '+JSON.stringify(s));
   assert.equal(s.footerLinks.length,3,'Footer needs three actual working links');
   assert(s.footerLinks.includes('#bookingPage')&&s.footerLinks.includes('#bookingPortal'),'Booking demo internal links lost');
   assert.equal(s.footerPosition,reduced?'relative':'fixed',lang+' expected layout '+JSON.stringify(s));
   if(!reduced) {
     assert(s.gap>=s.footer.height-2,'Curtain spacer must equal footer height '+JSON.stringify(s));
     assert(s.footer.bottom>height-3&&s.footer.bottom<=height+3,'Footer anchored at viewport bottom');
   }
   await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
   await page.waitForTimeout(320);
   const result=await page.evaluate(()=>{
    const wrapper=document.getElementById('tleDemoCurtainPage');
    const footer=document.getElementById('tleDemoCurtainFooter');
    const wr=wrapper.getBoundingClientRect(),fr=footer.getBoundingClientRect();
    const links=[...footer.querySelectorAll('a')].map(x=>{const b=x.getBoundingClientRect();return {top:b.top,bottom:b.bottom,inside:b.top>=fr.top-2&&b.bottom<=fr.bottom+2}});
    return {wrBottom:wr.bottom,frTop:fr.top,frBottom:fr.bottom,links,
      overflow:document.documentElement.scrollWidth-innerWidth,
      headline:document.getElementById('tleDemoFooterHeadline').textContent,
      topLink:document.getElementById('tleDemoFooterTop').textContent};
   });
   assert(result.overflow<=3,'Post-scroll width overflow '+JSON.stringify(result));
   assert(result.links.every(l=>l.inside),'Footer links clipped on phone '+JSON.stringify(result));
   if(!reduced)assert(result.wrBottom<=result.frTop+3,'Wrapper still covers fixed footer at page end '+JSON.stringify(result));
   assert.match(result.topLink,lang==='es'?/Volver arriba/:/Back to top/,'Footer translation lost');
   assert.match(result.headline,lang==='es'?/Reservas más sencillas/:/A simpler way to book/);
   await page.locator('#tleDemoFooterTop').click();
   assert.equal(new URL(page.url()).hash,'#bookingPortal','Back-to-top href must navigate');
   assert.deepEqual(writes,[],'No POST or real booking side effects from footer');
   assert.deepEqual(errors,[],'No JS errors in footer demo '+lang+' '+width);
   console.log('PASS DEMO CURTAIN '+JSON.stringify({lang,width,height,reduced,footerHeight:Math.round(s.footer.height)}));
   await page.close();
 }
 console.log('[BOOKING DEMO CURTAIN QA PASS] EN/ES, phone/iPad/desktop, reduced motion.');
}finally{await browser.close();}
