/** Editorial brand regression for the current bilingual home; retain historical CSS/component integrity. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const css=read('public/assets/tle-editorial-refresh.css');
const app=read('src/routes/__root.tsx');
const current=read('src/components/official-home.tsx');
const product=read('public/assets/tle-website-official.css');
assert(css.includes('THE LAUNCH ERA — BRAND SYSTEM C · HOME PHASE 1 (EN + ES)'),'Historical brand styles must remain for archived customer routes');
assert(app.includes('tle-editorial-refresh.css'),'Shared editorial CSS must remain accessible');
assert(current.includes('hero-jaramillo.jpg'),'The approved Jaramillo source is the official hero');
assert(current.includes('website-basic')&&current.includes('website-ai-crm'),'Only two public packages');
assert(product.includes('#191919')&&product.includes('#FAF8F3'),'Current premium black/ivory tokens must remain');
assert(existsSync('public/assets/website-packages-20261105/hero-jaramillo.jpg'),'Source hero asset missing');
console.log('PASS editorial style and current premium Jaramillo homepage source');
if(!process.argv.includes('--browser'))process.exit(0);
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
try{
 for(const [lang,path] of [['en','/'],['es','/es/']])for(const width of [390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:860},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(base+path,{waitUntil:'domcontentloaded'});
  const img=page.locator('.tle-universal .hero img');
  await img.waitFor({state:'visible',timeout:15000});
  assert.match(await img.getAttribute('src'),/hero-jaramillo\.jpg$/);
  assert.equal(await page.locator('.tle-universal .plan').count(),2,'Exactly two new packages');
  const action=page.locator('.tle-universal .hero-copy .btn').first();
  assert(await action.isVisible(),'Primary hero CTA is hidden');
  assert.equal(await action.getAttribute('href'),'#paquetes','Hero CTA must scroll to plans');
  const sizes=await page.evaluate(()=>{
   const root=document.querySelector('.tle-universal'),hero=root?.querySelector('.hero'),cta=root?.querySelector('.hero-copy .btn');
   return {overflow:document.documentElement.scrollWidth-innerWidth,headline:!!root?.querySelector('h1'),heroSize:hero?.getBoundingClientRect().height||0,ctaSize:cta?.getBoundingClientRect().height||0};
  });
  assert(sizes.headline&&sizes.heroSize>160&&sizes.ctaSize>=40,'Premium hero missing or touch target too small '+JSON.stringify(sizes));
  assert(sizes.overflow<=3,'Mobile horizontal overflow '+JSON.stringify({lang,width,sizes}));
  assert.deepEqual(errors,[],lang+' '+width+' page errors');
  console.log('PASS editorial homepage '+lang+' '+width);
  await page.close();
 }
}finally{await browser.close();}
