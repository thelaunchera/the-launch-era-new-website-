import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const en=read('public/ai-booking-assistant/index.html');
const es=read('public/es/ai-booking-assistant/index.html');
const css=read('public/assets/tle-pricing-motion.css');
const js=read('public/assets/tle-pricing-motion.js');
const root=read('src/routes/__root.tsx');
const sales=read('src/components/editorial-sections.tsx');
for(const [lang,html] of [['en',en],['es',es]]){
 assert(html.includes('tle-pricing-motion.css?v=20261016-1'),lang+' CSS missing');
 assert(html.includes('tle-pricing-motion.js?v=20261016-1'),lang+' JS missing');
 assert.equal((html.match(/class="card(?: tle-featured-card)?"/g)||[]).length,3,lang+' must have 3 genuine pricing cards');
 assert.equal((html.match(/class="tle-featured-card"/g)||[]).length,0,'featured class is shared with card');
 assert.equal((html.match(/tle-featured-card/g)||[]).length,1,lang+' must feature exactly one card');
 assert.equal((html.match(/role="radio"/g)||[]).length,3,lang+' selector radio semantics');
 assert(html.includes('role="radiogroup"')&&html.includes('aria-live="polite"'),lang+' accessible plan choice');
 assert(html.indexOf('data-plan="booking"')<html.indexOf('data-plan="business"'),lang+' Booking before combined');
 assert(html.indexOf('data-plan="business"')<html.indexOf('data-plan="followup"'),lang+' combined is middle');
 for(const [offer,setup,monthly] of [['ai-booking','$49',19],['ai-business','$69',25],['ai-followup','$29',12]]){
   const link='/service-checkout/?offer='+offer+'&amp;lang='+lang;
   assert(html.includes(link),lang+' offer link missing '+offer);
   assert(html.includes(setup)&&html.includes('$'+monthly),lang+' real pricing not preserved '+offer);
 }
 assert(html.includes('Save $72/yr')||html.includes('Ahorra $72/año'),lang+' combined savings badge absent');
 assert(!html.includes('Starter / Pro / Team'),'no fictitious plans');
 assert(html.includes('id="demo"')&&html.includes('/lead-private-preview.html'),'demo preserved');
}
assert(css.includes('linear-gradient(#fff,#fff) padding-box')&&css.includes('border-box'),'gradient border');
assert(css.includes('translateY(-7px) scale(1.06)'),'featured lift');
assert(css.includes('translateX(calc(var(--i)*100%))'),'sliding radio pill');
assert(css.includes('tle-savings-pop 760ms'),'savings spring pop');
assert(css.includes('prefers-reduced-motion:reduce'),'reduced-motion fallback');
assert(css.includes('tle-pricing-ready'),'no-JS offers must remain visible');
assert(js.includes('offsetWidth')&&js.includes("aria-checked")&&js.includes('ArrowRight')&&js.includes('Home')&&js.includes('End'),'keyboard and repeatable animation');
assert(js.includes("const saves=key==='business'")&&js.includes("badge.hidden=!saves"),'no invented discount on individual plans');
assert(js.includes("if(el.hidden||el.closest('[hidden]'))return"),'server-gated offers must remain hidden');
assert(root.includes('tle-pricing-motion.css?v=20261016-1')&&root.includes('tle-pricing-motion.js?v=20261016-1'),'root sales price asset missing');
assert(sales.includes('30% OFF')&&sales.includes('"$41.99"')&&sales.includes('"$34.99/mo"'),'existing sales prices must remain untouched');
console.log('[TLE PUBLIC PRICING STATIC PASSED] EN/ES 3 actual plans, truthful savings, checkout isolation, SSR safety');
if(!process.argv.includes('--browser'))process.exit(0);
const {chromium}=await import('playwright');
const browser=await chromium.launch({headless:true});
const site=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const widths=[360,390,820,1024,1440];
const errors=[];
mkdirSync('qa-screenshots',{recursive:true});
try{
 for(const lang of ['en','es']){
  const route=lang==='es'?'/es/ai-booking-assistant/':'/ai-booking-assistant/';
  for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:width<500?844:970}});
   page.on('pageerror',e=>errors.push(lang+' '+width+' '+e.message));
   await page.goto(site+route,{waitUntil:'domcontentloaded',timeout:45000});
   const section=page.locator('#plans.tle-price-motion');
   await section.waitFor({state:'visible'});
   const cards=section.locator('.cards > .card');
   assert.equal(await cards.count(),3,lang+' '+width+' expected three cards');
   assert.equal(await cards.nth(1).getAttribute('data-plan'),'business',lang+' middle should be combined');
   assert.match(await cards.nth(1).innerText(),/\$69[\s\S]*\$25/);
   await section.locator('.cards').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('#plans .cards')?.classList.contains('is-visible'),null,{timeout:8000});
   const cardProperties=await cards.nth(1).evaluate(el=>({
     image:getComputedStyle(el).backgroundImage,
     border:getComputedStyle(el).borderTopWidth,
     animation:getComputedStyle(el.querySelector('.tle-featured-badge')).animationName
   }));
   assert(cardProperties.image.includes('linear-gradient')&&cardProperties.border==='1.5px',lang+' '+width+' featured style absent '+JSON.stringify(cardProperties));
   assert.equal(await section.locator('.tle-featured-badge').innerText(),lang==='es'?'Mejor valor':'Best value');
   const radios=section.locator('.tle-plan-toggle [role="radio"]');
   assert.equal(await radios.count(),3);
   assert.equal(await radios.nth(1).getAttribute('aria-checked'),'true');
   const savings=section.locator('.tle-savings-badge');
   assert(await savings.isVisible(),'Combined discount must be initially visible');
   await radios.nth(0).click();
   assert.equal(await radios.nth(0).getAttribute('aria-checked'),'true');
   assert(!(await savings.isVisible()),'Individual plan cannot show a fabricated savings');
   assert.equal(await section.locator('[data-selected-setup]').innerText(),'$49');
   assert.match(await section.locator('[data-selected-monthly]').innerText(),/\$19/);
   assert.match(await section.locator('[data-selected-checkout]').getAttribute('href'),/offer=ai-booking/);
   await radios.nth(0).focus();
   await page.keyboard.press('ArrowRight');
   assert.equal(await radios.nth(1).getAttribute('aria-checked'),'true','ArrowRight should choose combined');
   assert(await savings.isVisible(),'Combined badge should pop again');
   const announcement=await section.locator('[aria-live="polite"]').textContent();
   assert(/\$72/.test(announcement),'Yearly equivalent savings not announced');
   assert.match(await section.locator('[data-selected-checkout]').getAttribute('href'),/offer=ai-business/);
   await page.keyboard.press('End');
   assert.equal(await radios.nth(2).getAttribute('aria-checked'),'true','End key should choose last');
   assert(!(await savings.isVisible()),'Follow-up has no savings badge');
   await page.keyboard.press('Home');
   assert.equal(await radios.nth(0).getAttribute('aria-checked'),'true');
   const geometry=await section.evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,scroll:el.scrollWidth,client:el.clientWidth}));
   assert(geometry.left>=-3&&geometry.right<=width+3&&geometry.scroll<=geometry.client+4,lang+' '+width+' pricing horizontal overflow '+JSON.stringify(geometry));
   if(width===390){
    await radios.nth(1).click();
    await section.screenshot({path:'qa-screenshots/tle-pricing-'+lang+'-'+width+'.png'});
   }
   await page.close();
  }
  const reduce=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduce.goto(site+route,{waitUntil:'domcontentloaded'});
  await reduce.locator('#plans .cards').scrollIntoViewIfNeeded();
  const anim=await reduce.locator('#plans .tle-featured-badge').evaluate(el=>getComputedStyle(el).animationName);
  assert(anim==='none',lang+' reduced-motion badge should never animate');
  await reduce.locator('#plans [role="radio"][data-plan="followup"]').click();
  assert.equal(await reduce.locator('[data-selected-setup]').innerText(),'$29');
  await reduce.close();
 }
 assert.deepEqual(errors,[], 'No browser errors permitted');
 console.log('[TLE PUBLIC PRICING BROWSER PASSED] EN/ES five widths, discounts, switcher, keyboard, reduced-motion, no charges');
}finally{await browser.close();}
