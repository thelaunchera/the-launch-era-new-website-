import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p, import.meta.url),'utf8');
const css=read('public/assets/tle-marketing-cta-motion.css');
const root=read('src/routes/__root.tsx');
const cta=read('src/components/marketing-cta.tsx');
const morph=read('src/components/morph-submit.tsx');
const routeFiles=[
 'src/components/editorial-sections.tsx','src/routes/es.index.tsx',
 'src/routes/booking-lead-automation.tsx','src/routes/es.booking-lead-automation.tsx',
 'src/routes/website-automation.tsx','src/routes/es.website-automation.tsx',
 'src/routes/virtual-assistant.tsx','src/routes/es.virtual-assistant.tsx',
 'src/components/service-sales.tsx','src/components/cleaning-app-editorial.tsx',
 'src/components/freebie-page.tsx','src/components/ai-agent-addon.tsx',
];
for(const p of routeFiles){
 const s=read(p);
 assert(s.includes('MarketingCTA'),p+': missing marketing action');
 assert.equal((s.match(/<MarketingCTA/g)||[]).length,s.split('</MarketingCTA>').length-1,p+': unbalanced CTA tags');
}
assert(root.includes('tle-marketing-cta-motion.css'), 'missing scoped marketing stylesheet');
assert(css.includes('animation:tle-cta-quiet-pulse 2.8s cubic-bezier(.32,.72,0,1) infinite'));
assert(css.includes('animation-delay:450ms')&&css.includes('scale(1.34,1.7)'));
assert(css.includes('conic-gradient(')&&css.includes('height:300px')&&css.includes('inset:2px'));
assert(css.includes('clip-path:inset(0 var(--tle-morph-inset,127px) round 999px)'));
assert(css.includes('560ms cubic-bezier(.32,.72,0,1)'));
assert(css.includes('tle-cta-draw-check 380ms')&&css.includes('stroke-dashoffset'));
assert(css.includes('prefers-reduced-motion:reduce'));
assert(root.includes('tle-marketing-cta-motion.css?v=20261016-3'),'old stylesheet version may be cached');
assert(css.includes('background:#568FB3'),'endcap ripple must contrast with the endcap');
assert(css.includes('tle-final-mobile-safe-pulse')&&css.includes('.sales-home .final-section .tle-cta-pulse-shell'),'mobile homepage endcap ripple must stay inside viewport');
assert(css.includes('tle-primary-cta-border-spin 3s'),'primary purchase CTA must have moving border');
assert(cta.includes('className="tle-cta-text"'),'purchase label must sit above animated border');
assert(morph.includes('aria-busy')&&morph.includes('aria-live')&&morph.includes('ResizeObserver'));
assert(cta.includes('demo|preview|\\/command-center')&&cta.includes('href={href}'));
for(const p of ['src/components/editorial-sections.tsx','src/routes/es.index.tsx','src/components/freebie-page.tsx']){
 const s=read(p);
 assert(s.includes('MorphSubmit status={status}'),p+': missing real form morph');
 assert(s.includes("setStatus('sent')")&&s.includes('SuccessConfirmation'),p+': visible success requires server-acknowledged confirmation');
}
for(const p of ['public/ai-booking-assistant/index.html','public/es/ai-booking-assistant/index.html']){
 const s=read(p);
 assert(s.includes('tle-marketing-standalone')&&s.includes('tle-marketing-cta-motion.css'));
 assert.equal((s.match(/class="tle-cta-pulse-shell"/g)||[]).length,3,p+': only three real plan links should pulse');
 assert(!/class="btn alt tle-cta-gradient"/.test(s),p+': demo cannot animate');
 assert(s.includes('tle-marketing-cta-motion.css?v=20261016-2'),p+': missing cache-busted stylesheet');
 assert.equal((s.match(/class="tle-cta-text"/g)||[]).length,3,p+': plan labels not above animated ring');
}
console.log('[TLE CTA STATIC PASSED] marketing actions, form states, isolation and destinations');
if(!process.argv.includes('--browser'))process.exit(0);
const {chromium}=await import('playwright');
const browser=await chromium.launch({headless:true});
const baseURL=process.env.QA_URL||'http://127.0.0.1:4173';
const site=baseURL.endsWith('/')?baseURL.slice(0,-1):baseURL;
const sizes=[{width:360,height:780},{width:390,height:844},{width:820,height:1000},{width:1024,height:768},{width:1440,height:900}];
const errors=[];
mkdirSync('qa-screenshots',{recursive:true});
try{
 for(const route of ['/','/es/','/booking-lead-automation/','/es/booking-lead-automation/','/ai-booking-assistant/','/es/ai-booking-assistant/']){
  for(const viewport of sizes){
   const page=await browser.newPage({viewport});
   page.on('pageerror',error=>errors.push(route+' '+viewport.width+' '+error.message));
   await page.goto(site+route,{waitUntil:'domcontentloaded',timeout:45000});
   // Hydration may replace SSR nodes after DOMContentLoaded. Wait for real CSS,
   // not just an attached element, to avoid false visual passes or false failures.
   await page.waitForFunction(()=>{
     const el=document.querySelector('.tle-cta-pulse-ring');
     return el?.isConnected && getComputedStyle(el).animationName==='tle-cta-quiet-pulse';
   },null,{timeout:18000});
   const ctas=page.locator('.tle-cta-pulse-shell');
   await ctas.first().waitFor({state:'attached',timeout:14000});
   const links=await ctas.locator('a').evaluateAll(els=>els.map(el=>({href:el.getAttribute('href'),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})));
   assert(links.length>0,route+' missing marketing CTAs');
   assert(links.every(x=>x.href&&!/demo|preview|command-center/i.test(x.href)),route+' demo/private CTA was animated');
   assert(links.every(x=>x.left>=-3&&x.right<=viewport.width+3),route+' '+viewport.width+' CTA crosses viewport '+JSON.stringify(links));
   // Inspect pulse + conic border in one hydrated DOM snapshot.
   const sample=await page.waitForFunction(()=>{
    const shell=[...document.querySelectorAll('.tle-cta-pulse-shell')].find(item=>{
     const ring=item.querySelector('.tle-cta-pulse-ring');
     return ring?.isConnected&&getComputedStyle(ring).animationName==='tle-cta-quiet-pulse';
    });
    if(!shell)return false;
    const a=shell.querySelector('a.tle-cta-pulse-button');
    const ring=shell.querySelector('.tle-cta-pulse-ring');
    const label=a?.querySelector('.tle-cta-text');
    if(!a||!label)return false;
    const rotor=getComputedStyle(a,'::before'),face=getComputedStyle(a,'::after');
    if(rotor.animationName!=='tle-primary-cta-border-spin')return false;
    return {pulse:getComputedStyle(ring).backgroundColor,
      borderAnimation:rotor.animationName,borderShape:rotor.backgroundImage,
      faceInset:face.inset,labelVisible:getComputedStyle(label).color,labelMarkup:true};
   },null,{timeout:18000});
   const effective=await sample.jsonValue();
   assert(effective.pulse==='rgb(86, 143, 179)',route+' '+viewport.width+' ripple must be visible on pale blue: '+JSON.stringify(effective));
   assert(effective.borderAnimation==='tle-primary-cta-border-spin'&&effective.borderShape.includes('conic-gradient')&&effective.labelMarkup,route+' '+viewport.width+' border/text not rendered: '+JSON.stringify(effective));
   if(route==='/'||route==='/es/'){
    const contrast=await page.locator('.final-section .tle-cta-pulse-shell').first().evaluate(el=>{
      const parent=getComputedStyle(el.closest('.final-section')).backgroundColor;
      const ring=getComputedStyle(el.querySelector('.tle-cta-pulse-ring')).backgroundColor;
      const rgb=x=>(x.match(/[0-9]+/g)||[]).slice(0,3).map(Number);
      const a=rgb(parent),b=rgb(ring);
      return {parent,ring,maxDiff:Math.max(...a.map((v,i)=>Math.abs(v-b[i])))};
    });
    assert(contrast.maxDiff>55,route+' '+viewport.width+' final CTA ripple has no visible contrast: '+JSON.stringify(contrast));
   }
   if(route==='/'||route==='/es/'){
    assert.equal(await page.locator('.hero-intro .tle-cta-pulse-shell').count(),0,'Do not animate demo CTA');
    if(viewport.width===390)await page.screenshot({path:`qa-screenshots/cta-marketing-${route==='/es/'?'es':'en'}-390.png`});
   }
   await page.close();
  }
 }
 // Real submit tests intercept all requests — no customer message is sent.
 for(const [route,form,endpoint,lang] of [
  ['/help/','.contact-form form','tle-contact','en'],
  ['/es/','.contact-form form','tle-contact','es'],
  ['/free-cleaning-lead-guide/','.tle-freebie-page form','tle-freebie','en']
 ]){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.on('pageerror',error=>errors.push(route+' form: '+error.message));
  await page.route('**/functions/v1/'+endpoint,async request=>{
   await new Promise(resolve=>setTimeout(resolve,650));
   await request.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,email_sent:true})});
  });
  await page.goto(site+route,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator(form).waitFor({state:'attached',timeout:15000});
  if(endpoint==='tle-contact'){
   const steps=page.locator(form+'.tle-contact-steps');
   await steps.waitFor({state:'visible'});
   assert.equal(await steps.getAttribute('data-step'),'0',route+' initial contact step');
   await page.locator(form+' .tle-contact-next').click();
   assert.equal(await steps.getAttribute('data-step'),'0',route+' must validate required contact fields');
   await page.locator(form+' input[name="name"]').fill('Synthetic QA');
   await page.locator(form+' input[name="email"]').fill('synthetic@example.invalid');
   await page.locator(form+' .tle-contact-next').click();
   assert.equal(await steps.getAttribute('data-step'),'1',route+' business contact step');
   await page.locator(form+' .tle-contact-next').click();
   assert.equal(await steps.getAttribute('data-step'),'1',route+' business name must be required');
   await page.locator(form+' input[name="business"]').fill('Fixture Business');
   await page.locator(form+' .tle-contact-next').click();
   assert.equal(await steps.getAttribute('data-step'),'2',route+' message contact step');
   await page.locator(form+' .tle-contact-back').click();
   assert.equal(await steps.getAttribute('data-step'),'1',route+' back must return to business');
   assert.equal(await page.locator(form+' input[name="business"]').inputValue(),'Fixture Business',route+' back must retain values');
   await page.locator(form+' .tle-contact-next').click();
   await page.locator(form+' textarea[name="message"]').fill('Synthetic QA only; never send.');
  }else await page.locator('#freebie-email').fill('synthetic@example.invalid');
  const button=page.locator(form+' .tle-morph-submit');
  assert.equal(await button.getAttribute('data-state'),'idle',route+' initial state');
  // Capture genuine transitions even when network timing varies.
  await button.evaluate(el=>{
   window.__tleStages=[];
   const record=()=>window.__tleStages.push({state:el.dataset.state,busy:el.getAttribute('aria-busy')});
   record();
   new MutationObserver(record).observe(el,{attributes:true,attributeFilter:['data-state','aria-busy']});
  });
  await button.click();
  await page.locator('.tle-success-card[role="status"]').waitFor({state:'visible',timeout:9000});
  const states=await page.evaluate(()=>window.__tleStages||[]);
  assert(states.some(x=>x.state==='loading'&&x.busy==='true'),route+' missing loading state: '+JSON.stringify(states));
  assert.equal(await page.locator(form).count(),0,route+' form must immediately yield to server-confirmed success');
  assert((await page.locator('.tle-success-card').innerText()).includes('synthetic@example.invalid'),route+' missing accurate destination summary');
  assert.equal(await page.locator('.tle-success-disc .tle-success-check').count(),1,route+' missing check icon');
  if(endpoint==='tle-contact') assert.equal(await page.locator('.tle-success-card.tle-success-compact').count(),1,route+' contact should remain compact');
  await page.close();
 }
 // Shared footer theme: test real switch, persistent preference, safe links and a single newsletter.
 for (const route of ['/help/','/es/']) {
  for (const width of [390,1440]) {
   const page=await browser.newPage({viewport:{width,height:844},colorScheme:'light'});
   page.on('pageerror',error=>errors.push(route+' footer '+width+': '+error.message));
   await page.goto(site+route,{waitUntil:'domcontentloaded',timeout:45000});
   const toggle=page.locator('.site-footer .tle-footer-toggle');
   await toggle.waitFor({state:'attached',timeout:15000});
   await page.waitForFunction(()=>document.querySelector('.site-footer')?.classList.contains('tle-footer-ready'));
   assert.equal(await page.locator('.site-footer form[data-tle-newsletter]').count(),1,'Never duplicate newsletter');
   const firstLinks=await page.locator('.site-footer .footer-links a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
   assert.equal(firstLinks.length,5,'Footer must keep all navigation links');
   await toggle.click();
   await page.waitForFunction(()=>document.querySelector('.site-footer .tle-footer-toggle')?.getAttribute('aria-checked')==='true');
   assert.equal(await page.locator('.site-footer.tle-footer-dark').count(),1,'Dark footer switch did not work');
   const darkInk=await page.locator('.site-footer .footer-links a').first().evaluate(el=>getComputedStyle(el).color);
   assert.equal(darkInk,'rgb(245, 248, 252)','Dark footer links must be readable');
   const secondLinks=await page.locator('.site-footer .footer-links a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
   assert.deepEqual(secondLinks,firstLinks,'Theme must preserve all destinations');
   assert.equal(await page.locator('.site-footer form[data-tle-newsletter]').count(),1,'Newsletter must remain unique');
   if (width===390) await page.screenshot({path:'qa-screenshots/footer-theme-'+(route==='/es/'?'es':'en')+'.png'});
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('.site-footer .tle-footer-toggle')?.getAttribute('aria-checked')==='true');
   await page.locator('.site-footer .tle-footer-toggle').click();
   await page.waitForFunction(()=>document.querySelector('.site-footer .tle-footer-toggle')?.getAttribute('aria-checked')==='false');
   assert.equal(await page.locator('.site-footer.tle-footer-dark').count(),0,'Light theme should return');
   await page.close();
  }
 }
 // Reduced-motion must remove the decorative animations.
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await reduced.goto(site+'/',{waitUntil:'domcontentloaded',timeout:45000});
 const anim=await reduced.locator('.tle-cta-pulse-ring').first().evaluate(el=>getComputedStyle(el).animationName);
 assert(anim==='none','reduced-motion ring should be disabled');
 const rotor=await reduced.locator('.tle-cta-pulse-button').last().evaluate(el=>getComputedStyle(el,'::before').animationName);
 assert(rotor==='none','reduced-motion border should not spin');
 await reduced.close();
 assert.deepEqual(errors,[], 'Unexpected browser errors');
 console.log('[TLE CTA BROWSER PASSED] EN/ES five widths, isolated demos, mocked success, reduced motion');
}finally{await browser.close();}
