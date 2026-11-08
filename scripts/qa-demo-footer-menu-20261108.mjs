// Editorial footer finale + menu-first layout safety, 11 main-site demos.
import assert from 'node:assert/strict';
import {chromium,webkit,devices} from 'playwright';
const origin=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
const slugs=['sova','golden-grid','casa-brownie','crumb','havana-19','ivory-and-bloom','la-vie-in-pink','marea-wigs-miami','aftr','lavender-edit','experience-cleaning'];
const path=slug=>slug==='experience-cleaning'?'/experience-cleaning/':'/demos/'+slug+'/';
const moved={
 'havana-19':['#story','#kitchen'],
 'aftr':['#tonight','#offers'],
 'lavender-edit':['#ritual','#gallery'],
 'experience-cleaning':['.hero.hero-cleaning-site','#experience']
};
const browser=await chromium.launch({headless:true});
try{
 for(const width of [360,390]){
  const context=await browser.newContext({...devices['iPhone 13'],viewport:{width,height:800},reducedMotion:'reduce'});
  for(const slug of slugs){
   const page=await context.newPage(),problems=[];
   page.on('pageerror',err=>problems.push(String(err)));
   const r=await page.goto(origin+path(slug),{waitUntil:'domcontentloaded'});
   assert.equal(r?.status(),200,slug+' route loads');
   // The 21+ age gate is intentional; pass it with an adult QA fixture before testing footer navigation.
   if(slug==='aftr'){
    const gate=page.locator('#ageGate');
    await gate.waitFor({state:'visible'});
    await page.locator('#ageYes').click();
    assert.equal(await gate.isVisible(),false,'Age gate must close after adult confirmation');
   }
   const finale=page.locator('.tle-footer-finale[data-tle-owned="true"]');
   await finale.waitFor({state:'visible',timeout:12000});
   assert.equal(await finale.count(),1,slug+' must have one interactive footer stage');
   assert.ok((await finale.locator('h2').innerText()).trim(),slug+' footer heading');
   const cta=finale.locator('a.tle-footer-finale__link');
   const href=await cta.getAttribute('href');
   assert.ok(href?.startsWith('#'),slug+' catalog link must be internal');
   assert.equal(await page.locator(href).count(),1,slug+' footer link has an existing target');
   const fit=await finale.evaluate(el=>{
    const b=el.getBoundingClientRect(),button=el.querySelector('button').getBoundingClientRect();
    return {left:b.left,right:b.right,buttonRight:button.right,viewport:innerWidth};
   });
   assert.ok(fit.left>=-2&&fit.right<=fit.viewport+2,slug+' footer overflows at '+width+': '+JSON.stringify(fit));
   assert.ok(fit.buttonRight<=fit.viewport+2,slug+' back button overflows');
   assert.ok(await page.locator('footer').count()>0,slug+' original legal footer remains');
   if(moved[slug]){
    const ordering=await page.evaluate(([a,t])=>{
     const first=document.querySelector(a),second=document.querySelector(t);
     return Boolean(first&&second&&first.nextElementSibling===second);
    },moved[slug]);
    assert.ok(ordering,slug+' original menu/catalog moved to requested early position');
   }
   await cta.click();
   assert.equal(new URL(page.url()).hash,href,slug+' catalog link navigates within same demo');
   await finale.locator('button.tle-footer-finale__return').click();
   await page.waitForFunction(()=>scrollY<10,null,{timeout:3000});
   assert.deepEqual(problems,[],slug+' JS errors: '+problems.join(' | '));
   console.log('FOOTER + MENU PASS',slug,width,href,JSON.stringify(fit));
   await page.close();
  }
  await context.close();
 }
}finally{await browser.close()}
const safari=await webkit.launch({headless:true});
try{
 const context=await safari.newContext({...devices['iPhone 13'],viewport:{width:390,height:800},reducedMotion:'reduce'});
 for(const slug of ['sova','havana-19','ivory-and-bloom','aftr','experience-cleaning']){
  const page=await context.newPage();
  await page.goto(origin+path(slug),{waitUntil:'domcontentloaded'});
  if(slug==='aftr'){
   await page.locator('#ageGate').waitFor({state:'visible'});
   await page.locator('#ageYes').click();
  }
  const stage=page.locator('.tle-footer-finale');
  await stage.waitFor({state:'visible',timeout:12000});
  assert.equal(await stage.locator('button.tle-footer-finale__return').count(),1);
  const width=await stage.evaluate(el=>el.getBoundingClientRect().width);
  assert.ok(width<=390,slug+' Safari footer width');
  console.log('SAFARI FOOTER PASS',slug);
  await page.close();
 }
 await context.close();
}finally{await safari.close()}
