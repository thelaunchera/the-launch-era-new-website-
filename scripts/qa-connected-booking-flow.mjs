/* EN/ES homepage illustration safety checks. No bookings or server writes. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const en = read('src/components/editorial-sections.tsx');
const es = read('src/routes/es.index.tsx');
const board = read('src/components/connected-booking-flow.tsx');
const css = read('src/components/connected-booking-flow.css');
const heroCSS = read('public/assets/tle-hero-scroll.css');
for (const [lang, source, demo] of [
  ['en',en,'/booking-demo/?lang=en'],
  ['es',es,'/booking-demo/?lang=es'],
]) {
  assert(source.includes('<HeroConnectionBackdrop/>'), lang + ': no hero backdrop');
  assert(source.includes('<ConnectedBookingFlow lang="' + lang + '"/>'), lang + ': flow board not mounted');
  assert(source.includes('home-booking-explorer tle-flow-explorer'), lang + ': old preview not replaced');
  assert(!source.includes('<ProductExplorer lang=') && !source.includes('<ProductExplorer>'), lang + ': old preview duplicate');
  assert(source.includes(demo), lang + ': personalized demo destination changed');
  assert(source.includes('/booking-bundle/?lang=' + lang), lang + ': checkout changed');
}
assert(board.includes('aria-pressed={active === index}'), 'board notes must have keyboard-accessible selection');
assert(board.includes('aria-live="polite"'), 'selection must announce details');
assert(board.includes('role="status"'), 'detail must remain readable');
assert(board.includes('IntersectionObserver') && board.includes('observer.disconnect()'), 'in-view controller missing');
assert(board.includes('No fake leads') && !board.includes('fetch('), 'illustration must have no live data side effects');
assert(css.includes('overflow-x: auto') && css.includes('min-width: 760px'), 'small screens must pan board not overflow page');
assert(css.includes('prefers-reduced-motion:reduce') && css.includes('animation: none !important'), 'reduced motion missing');
assert(css.includes('z-index: 1') && heroCSS.includes('z-index: 2'), 'hero must stay in FRONT of wires');
assert(css.includes('pointer-events: none'), 'hero wiring must not steal taps');
console.log('[CONNECTED BOOKING FLOW STATIC PASS] EN/ES, accessible five steps, no data writes, original demo + checkout.');

if (!process.argv.includes('--browser')) process.exit(0);
const { chromium } = await import('playwright');
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const widths=[
  {width:360,height:780},{width:390,height:844},{width:820,height:1180},
  {width:1024,height:768},{width:1440,height:900},
];
mkdirSync('qa-screenshots/connected-flow',{recursive:true});
try {
  for(const [lang,route] of [['en','/'],['es','/es/']]){
    for(const vp of widths){
      const page=await browser.newPage({viewport:vp,reducedMotion:'no-preference'});
      await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
      const component=page.locator('.tle-connected-flow');
      await component.waitFor({state:'attached',timeout:15000});
      await component.scrollIntoViewIfNeeded();
      const report=await page.evaluate(()=>{
        const el=document.querySelector('.tle-connected-flow');
        const viewport=el.querySelector('.tle-connected-flow__viewport');
        const content=el.querySelector('.tle-connected-flow__plane');
        const backdrop=document.querySelector('.hero-scroll .tle-hero-connection-backdrop');
        const frame=document.querySelector('.hero-scroll .hero-scroll-frame');
        return {
          nodes:el.querySelectorAll('button.tle-connected-flow__note').length,
          boardWidth:viewport.clientWidth,sceneWidth:content.scrollWidth,
          frameZ:getComputedStyle(frame).zIndex,
          backdropZ:getComputedStyle(backdrop).zIndex,
          background:getComputedStyle(viewport).backgroundImage,
          detail:el.querySelector('.tle-connected-flow__detail').textContent,
          docWidth:document.documentElement.scrollWidth,
        };
      });
      assert.equal(report.nodes,5,lang+' '+vp.width+': lost diagram nodes');
      assert(report.boardWidth>250 && report.boardWidth<=vp.width+2,lang+' '+vp.width+': board wider than viewport');
      assert.equal(report.frameZ,'2',lang+': hero foreground lost');
      assert.equal(report.backdropZ,'1',lang+': connections not behind hero');
      assert(report.background.includes('radial-gradient'),lang+': dots missing');
      assert(report.docWidth<=vp.width+3,lang+' '+vp.width+': horizontal document overflow '+report.docWidth);
      const last=component.locator('button.tle-connected-flow__note').last();
      await last.click();
      assert.equal(await last.getAttribute('aria-pressed'),'true',lang+': note cannot be selected');
      const details=await component.locator('.tle-connected-flow__detail').textContent();
      assert(details.includes('05 / 05'),lang+': detail did not reflect last step');
      assert.equal(await page.locator('.hero-intro a[href^="/booking-demo/"]').count(),1,lang+': demo CTA lost');
      if([390,820,1440].includes(vp.width)) {
        await page.screenshot({path:'qa-screenshots/connected-flow/'+lang+'-'+vp.width+'.png',fullPage:false});
      }
      await page.close();
    }
    const reduced=await browser.newPage({viewport:{width:820,height:1180},reducedMotion:'reduce'});
    await reduced.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
    const motion=await reduced.locator('.tle-connected-flow__signal').evaluate(el=>getComputedStyle(el).animationName);
    assert.equal(motion,'none',lang+': reduced motion cannot animate connectors');
    await reduced.close();
  }
  console.log('[CONNECTED BOOKING FLOW BROWSER PASS] EN/ES 360/390/820/1024/1440, click, scroll, hero layers and reduced motion.');
} finally { await browser.close(); }
