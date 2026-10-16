import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=read('src/components/site-shell.tsx');
const css=read('public/assets/tle-footer-theme-sweep.css');
const root=read('src/routes/__root.tsx');
assert(source.includes('role="switch"')&&source.includes('startViewTransition'),'Missing footer toggle');
assert(css.includes('::view-transition-new(tle-footer)')&&css.includes('::view-transition-old(tle-footer)'),'No circular transition');
assert(root.includes('tle-footer-theme-sweep.css?v=20261016-4'),'CSS must load after newsletter');
assert.equal((source.match(/<nav className="footer-links"/g)||[]).length,1,'Do not duplicate footer links');
assert.equal((source.match(/data-tle-newsletter/g)||[]).length,1,'Do not duplicate newsletter');
if(!process.argv.includes('--browser')){console.log('PASS: footer theme static guard');process.exit(0);}
const {chromium}=await import('playwright');
const browser=await chromium.launch({headless:true});
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
mkdirSync('qa-screenshots',{recursive:true});
try{
 for(const [route,lang] of [['/help/','en'],['/es/booking-lead-automation/','es']]){
  for(const width of [390,1440]){
   const page=await browser.newPage({viewport:{width,height:850},colorScheme:'light'});
   const pageErrors=[];
   page.on('pageerror',err=>pageErrors.push(err.message));
   await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
   const footer=page.locator('.site-footer.tle-footer-theme');
   const toggle=footer.locator('.tle-footer-toggle[role="switch"]');
   await toggle.waitFor({state:'attached',timeout:18000});
   await page.waitForFunction(()=>document.querySelector('.site-footer')?.classList.contains('tle-footer-ready'));
   const nav=footer.locator('.footer-links a');
   const urls=await nav.evaluateAll(links=>links.map(a=>a.getAttribute('href')));
   assert.equal(urls.length,5,'Five real footer links: '+route);
   assert.equal(await footer.locator('form[data-tle-newsletter]').count(),1,'One newsletter: '+route);
   assert.equal(await toggle.getAttribute('aria-checked'),'false','Light initial preference: '+route);
   assert(await page.locator('link[href*="tle-footer-theme-sweep.css"]').count()>0,'Missing published stylesheet '+route);
   await toggle.click();
   await page.waitForFunction(()=>document.querySelector('.tle-footer-toggle')?.getAttribute('aria-checked')==='true');
   const ink=await nav.first().evaluate(node=>getComputedStyle(node).color);
   assert.equal(ink,'rgb(245, 248, 252)','Dark link contrast: '+route+' '+width);
   assert.equal(await page.evaluate(()=>localStorage.getItem('tle_footer_theme_v1')),'dark','Theme preference missing');
   assert.deepEqual(await nav.evaluateAll(links=>links.map(a=>a.getAttribute('href'))),urls,'Routes must stay intact');
   assert.equal(await footer.locator('form[data-tle-newsletter]').count(),1,'Newsletter duplicated');
   const geometry=await footer.evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,width:innerWidth}));
   assert(geometry.left>=-2&&geometry.right<=width+2,'Footer horizontally overflowing: '+JSON.stringify(geometry));
   await page.waitForTimeout(960);
   if(width===390)await footer.screenshot({path:'qa-screenshots/footer-theme-'+lang+'.png'});
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('.site-footer.tle-footer-dark .tle-footer-toggle')?.getAttribute('aria-checked')==='true');
   await page.locator('.site-footer .tle-footer-toggle').click();
   await page.waitForFunction(()=>document.querySelector('.site-footer .tle-footer-toggle')?.getAttribute('aria-checked')==='false');
   assert.equal(await page.evaluate(()=>localStorage.getItem('tle_footer_theme_v1')),'light');
   assert.equal(await page.locator('.site-footer .footer-links a').count(),5);
   assert.deepEqual(pageErrors.filter(x=>x.includes('footer')),[],'Footer runtime errors: '+route);
   await page.close();
  }
 }
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',colorScheme:'light'});
 await reduced.goto(base+'/help/',{waitUntil:'domcontentloaded'});
 await reduced.locator('.tle-footer-toggle').click();
 await reduced.waitForFunction(()=>document.querySelector('.tle-footer-toggle')?.getAttribute('aria-checked')==='true');
 const none=await reduced.locator('.tle-footer-toggle-thumb').evaluate(el=>getComputedStyle(el).transitionDuration);
 assert(none==='0s','Reduced motion should disable thumb animation');
 await reduced.close();
 console.log('PASS: real EN/ES footer theme, mobile+desktop, saved preference, contrast, unique links and newsletter, reduced motion');
}finally{await browser.close();}
