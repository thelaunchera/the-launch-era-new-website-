// Single-gallery founder portfolio: nine responsive, reversible miniature website cards.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium,webkit} from 'playwright';
const html=readFileSync('public/portfolio/index.html','utf8');
assert.doesNotMatch(html,/class="tle-brand-pill"/,'Do not duplicate websites as draggable name pills');
assert.doesNotMatch(html,/id="tleGravityStage"/,'Remove old empty physics stage');
assert.doesNotMatch(html,/id="tleGravityReplay"/,'No abandoned gravity replay button');
assert.match(html,/id="tleDemoDropGrid"/,'One website gallery is present');
assert.match(html,/function paintMiniDrops\(\)/,'Scroll-linked website drop is still available');
assert.match(html,/function updateHero\(\)/,'Cinematic hero windows still respond to scrolling');
const origin=(process.env.QA_URL||'http://127.0.0.1:4198').replace(/\/$/,'');
for(const browserType of [chromium,webkit]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const width of [375,390,1280]){
   const page=await browser.newPage({viewport:{width,height:820},reducedMotion:'reduce'});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(origin+'/portfolio/',{waitUntil:'domcontentloaded'});
   assert.equal(response?.status(),200,'Portfolio route must resolve');
   await page.waitForFunction(()=>document.querySelectorAll('.tle-demo-drop-item').length===9,null,{timeout:12000});
   assert.equal(await page.locator('.tle-demo-drop-item').count(),9,'Exactly nine individual website miniatures');
   assert.equal(await page.locator('.tle-brand-pill').count(),0,'No duplicate brand pills');
   assert.equal(await page.locator('.tle-demo-drop-section').count(),1,'Only one website gallery');
   assert.ok(await page.locator('.tle-gravity-arena #tleDemoDropGrid').count(),'Cards sit inside the blue showcase');
   assert.ok(await page.locator('#heroVideo').count(),'Approved cinematic hero stays');
   assert.ok((await page.locator('#heroPoster').getAttribute('src')).includes('founder-poster.jpg'),'Hero retains approved opening frame');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=3,'No horizontal overflow at '+width+'px: '+overflow);
   const first=page.locator('.tle-demo-drop-item').first();
   await first.click();
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),true,'Website card opens actual preview');
   assert.equal((await page.locator('#modalTitle').innerText()).trim(),'La Vie in Pink','Correct website shown in preview');
   await page.locator('#closeDialog').click();
   assert.equal(await page.locator('#projectDialog').evaluate(el=>el.open),false,'Preview closes and unlocks scroll');
   assert.deepEqual(errors,[],'No JS errors in portfolio');
   console.log('PASS',browserType.name(),width,'single blue gallery, nine clickable websites and reduced motion');
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:820},reducedMotion:'no-preference'});
  await page.goto(origin+'/portfolio/',{waitUntil:'domcontentloaded'});
  const first=page.locator('.tle-demo-drop-item').first();
  await first.waitFor({state:'attached'});
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(120);
  const before=await first.evaluate(el=>Number(el.querySelector('.tle-mini-browser-fall')?.style.getPropertyValue('--mini-opacity')||'0'));
  await first.scrollIntoViewIfNeeded();
  await page.waitForTimeout(170);
  const landed=await first.evaluate(el=>Number(el.querySelector('.tle-mini-browser-fall')?.style.getPropertyValue('--mini-opacity')||'0'));
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(170);
  const rewound=await first.evaluate(el=>Number(el.querySelector('.tle-mini-browser-fall')?.style.getPropertyValue('--mini-opacity')||'0'));
  assert.ok(landed>before+0.12,'Scrolling down makes the website card land: '+JSON.stringify({before,landed}));
  assert.ok(rewound<landed-0.12,'Scrolling up reverses website falling motion: '+JSON.stringify({rewound,landed}));
  await first.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const replay=await first.evaluate(el=>Number(el.querySelector('.tle-mini-browser-fall')?.style.getPropertyValue('--mini-opacity')||'0'));
  assert.ok(replay>rewound+0.12,'Re-entering view repeats the drop');
  await page.close();
 }finally{await browser.close()}
}
