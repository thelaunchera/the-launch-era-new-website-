import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const base = process.env.QA_URL || 'https://thelaunchera.com';
const viewports = [
  {name:'small-phone',width:360,height:780},
  {name:'mobile',width:390,height:844},
  {name:'tablet',width:820,height:1180},
  {name:'desktop',width:1440,height:900},
];
const results=[];
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
const fail=(caseName,e)=>{results.push({case:caseName,pass:false,reason:String(e)});console.error('FAIL',caseName,String(e))};
const good=caseName=>{results.push({case:caseName,pass:true});console.log('PASS',caseName)};
for(const v of viewports){
 const page=await browser.newPage({viewport:{width:v.width,height:v.height},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 for(const lang of ['en','es']){
  const label=v.name+' / '+lang;
  try{
    const response=await page.goto(base+'/booking-demo/?lang='+lang,{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response?.status(),200,'demo HTTP status');
    await page.waitForSelector('#ownerTab');
    assert.equal(await page.locator('#language').inputValue(),lang,'language deep link');
    assert.equal(await page.locator('html').getAttribute('lang'),lang,'HTML document language');
    assert.equal(await page.locator('#customerView').isVisible(),true,'customer view visible');
    assert.equal(await page.locator('#step2').isVisible(),true,'property detail step visible');
    await page.screenshot({path:'qa-screenshots/'+v.name+'-'+lang+'-booking.png',fullPage:true});
    const horizontal=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
    assert(horizontal.scroll<=horizontal.width+3,'horizontal overflow '+JSON.stringify(horizontal));
    if(v.width<=580){
      const guide=await page.evaluate(()=>{
        const parent=document.querySelector('.demo-guide');
        const items=[...document.querySelectorAll('.guide-items>span')];
        const p=parent.getBoundingClientRect();
        return {steps:items.length,borderedChildren:items.filter(e=>getComputedStyle(e.querySelector('span')).borderTopWidth!=='0px').length,
          overflowItems:items.filter(e=>{const q=e.getBoundingClientRect();return q.right>p.right+2||q.left<p.left-2}).length};
      });
      assert.equal(guide.steps,3,'three onboarding steps');
      assert.equal(guide.borderedChildren,0,'no nested pills around step text');
      assert.equal(guide.overflowItems,0,'steps fit within guide');
    }
    await page.locator('#standard').click();
    await page.locator('#slots button').filter({hasText:'10:30 AM'}).click();
    assert.equal(await page.locator('#submitDemo').isEnabled(),true);
    await page.locator('#submitDemo').click();
    assert.equal(await page.locator('#ownerView').isVisible(),true,'owner view switches on request');
    assert.equal(await page.locator('#newLead').isVisible(),true,'the sample request is visible to owner');
    assert.match(await page.locator('#leadStatus').innerText(),lang==='es'?/pendiente/i:/needs review/i);
    await page.locator('#editPrice').fill('165');
    await page.locator('#editAvailability').selectOption('morning');
    await page.locator('#saveDemo').click();
    assert.equal(await page.locator('#customerView').isVisible(),true);
    assert.equal(await page.locator('#standardPrice').innerText(),'$165','owner price propagated to booking');
    assert.equal(await page.locator('#slots button').filter({hasText:'1:00 PM'}).isDisabled(),true,'closed slot unavailable');
    await page.locator('#ownerTab').click();
    await page.locator('#confirmDemo').click();
    assert.match(await page.locator('#leadStatus').innerText(),lang==='es'?/confirmada/i:/confirmed/i);
    // Fixed-price instant confirmation is opt-in, not the default.
    await page.locator('#resetDemo').click();
    await page.locator('#ownerTab').click();
    await page.locator('#autoConfirmFlat').check();
    await page.locator('#saveDemo').click();
    await page.locator('#standard').click();
    await page.locator('#slots button').filter({hasText:'9:00 AM'}).click();
    await page.locator('#submitDemo').click();
    assert.match(await page.locator('#leadStatus').innerText(),lang==='es'?/confirmada/i:/confirmed/i,'flat-price auto confirmation');
    assert.equal(await page.locator('#confirmDemo').isVisible(),false,'auto-confirmed needs no owner approval');
    // Custom quotes always need owner review, even if auto confirmation is enabled.
    await page.locator('#resetDemo').click();
    await page.locator('#ownerTab').click();
    await page.locator('#autoConfirmFlat').check();
    await page.locator('#saveDemo').click();
    await page.locator('#deep').click();
    await page.locator('#slots button').filter({hasText:'9:00 AM'}).click();
    await page.locator('#submitDemo').click();
    assert.match(await page.locator('#leadStatus').innerText(),lang==='es'?/cotización por revisar/i:/quote needs review/i,'quotes never auto confirm');
    assert.equal(await page.locator('#confirmDemo').isVisible(),false,'quote cannot be instantly confirmed');
    assert.equal(errors.length,0,'page JavaScript errors: '+errors.join(','));
    await page.screenshot({path:'qa-screenshots/'+v.name+'-'+lang+'-owner.png',fullPage:true});
    good(label);
  }catch(e){fail(label,e);await page.screenshot({path:'qa-screenshots/ERROR-'+v.name+'-'+lang+'.png',fullPage:true}).catch(()=>{})}
 }
 await page.close();
}
for(const [name,path,lookFor] of [
 ['EN sales landing','/booking-lead-automation','/booking-demo/?lang=en'],
 ['ES sales landing','/es/booking-lead-automation/','/booking-demo/?lang=es'],
 ['EN homepage','/','/booking-demo/?lang=en'],
 ['ES homepage','/es','/booking-demo/?lang=es'],
]){
 const p=await browser.newPage({viewport:{width:390,height:844}});
 try {
  const r=await p.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(r?.status(),200);
  assert((await p.locator('a[href="'+lookFor+'"]').count())>0,'demo link missing');
  good(name);
 }catch(e){fail(name,e)}
 await p.close();
}
for(const route of ['/cleaning-web-app','/es/cleaning-web-app/']){
 const page=await browser.newPage();
 try{
  await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
  assert.match(await page.locator('body').innerText(),/30 DAYS FREE|30 DÍAS GRATIS/i);
  assert.equal(await page.locator('.app-command-actions button').count(),0,'visual sample does not pretend to have working buttons');
  assert.equal(await page.locator('.pricing-total button').count(),0,'illustrative quote CTA not an inactive button');
  assert.equal(await page.locator('.app-command-actions .fake-action').count(),3,'sample actions visible');
  assert.equal(await page.locator('.app-preview-heading a').count(),1,'interactive preview CTA appears near sample');
  good('30-day app trial '+route);
 }catch(e){fail('30-day app trial '+route,e)}
 await page.close();
}
// Cleaning App: independent, no-login sample preview, tested in both languages.
for(const v of viewports){
 for(const lang of ['en','es']){
  const p=await browser.newPage({viewport:{width:v.width,height:v.height},deviceScaleFactor:1});
  const label='Cleaning App preview '+v.name+' / '+lang;
  const errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  try{
   const response=await p.goto(base+'/cleaning-app-demo/?lang='+lang,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(response?.status(),200,'preview HTTP status');
   await p.waitForSelector('#nav [data-tab="0"]');
   assert.equal(await p.locator('html').getAttribute('lang'),lang);
   assert.equal(await p.locator('#nav button').count(),6,'six sample sections available');
   assert.equal(await p.locator('#trial').getAttribute('href'),'https://app.thelaunchera.com/?entry=signup','demo trial CTA remains separate');
   await p.screenshot({path:'qa-screenshots/'+v.name+'-'+lang+'-cleaning-overview.png',fullPage:true});
   const horizontal=await p.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
   assert(horizontal.scroll<=horizontal.width+3,'horizontal overflow '+JSON.stringify(horizontal));
   if(v.width<=580){
     const layout=await p.evaluate(()=>{
       const content=document.querySelector('.content').getBoundingClientRect();
       const scene=document.querySelector('.scene').getBoundingClientRect();
       const bounds=(el,outer)=>{const r=el.getBoundingClientRect();return r.left>=outer.left-3&&r.right<=outer.right+3};
       return {allNavFit:[...document.querySelectorAll('#nav button')].every(el=>bounds(el,scene)),
          allStatsFit:[...document.querySelectorAll('.stat')].every(el=>bounds(el,content)),
          allTilesFit:[...document.querySelectorAll('.tile')].every(el=>bounds(el,content)),
          stats:document.querySelectorAll('.stat').length,
          nav:document.querySelectorAll('#nav button').length};
     });
     assert.equal(layout.nav,6,'six navigation sections');
     assert.equal(layout.stats,3,'three summary cards');
     assert(layout.allNavFit,'navigation buttons clipped: '+JSON.stringify(layout));
     assert(layout.allStatsFit,'summary cards clipped: '+JSON.stringify(layout));
     assert(layout.allTilesFit,'dashboard sections clipped: '+JSON.stringify(layout));
   }
   await p.locator('#nav [data-tab="2"]').click();
   await p.locator('[data-action="done"]').click();
   assert.equal(await p.locator('[data-action="done"]').isDisabled(),true,'sample job completed');
   await p.locator('#nav [data-tab="4"]').click();
   await p.locator('[data-action="quote"]').click();
   assert.equal(await p.locator('[data-action="quote"]').isDisabled(),true,'sample quote ready');
   await p.locator('#nav [data-tab="5"]').click();
   await p.locator('[data-action="paid"]').click();
   assert.equal(await p.locator('[data-action="paid"]').isDisabled(),true,'sample invoice paid');
   await p.locator('[data-action="reset"]').click();
   assert.equal(await p.locator('#nav [data-tab="0"]').getAttribute('aria-current'),'page','preview returns to overview');
   assert.equal(errors.length,0,'JavaScript errors: '+errors.join(','));
   good(label);
  }catch(e){fail(label,e);await p.screenshot({path:'qa-screenshots/ERROR-'+v.name+'-'+lang+'-cleaning.png',fullPage:true}).catch(()=>{})}
  await p.close();
 }
}
for(const [path,lang] of [['/cleaning-web-app','en'],['/es/cleaning-web-app/','es']]){
 const p=await browser.newPage();
 try{
  const response=await p.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(response?.status(),200);
  assert((await p.locator('a[href="/cleaning-app-demo/?lang='+lang+'"]').count())>0,'Cleaning App preview link missing');
  good('Cleaning App preview landing link '+lang);
 }catch(e){fail('Cleaning App preview landing link '+lang,e)}
 await p.close();
}

// Landing-page duplicate-demo cleanup: reuse one existing interactive tour and show real contact form.
for(const [path,language,demoHref] of [
  ['/', 'en', '/booking-demo/?lang=en'],
  ['/es/', 'es', '/booking-demo/?lang=es']
]){
 for(const v of viewports){
  const page=await browser.newPage({viewport:{width:v.width,height:v.height},deviceScaleFactor:1});
  const label='Homepage contact + existing demo '+language+' '+v.name;
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   const r=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(r?.status(),200,'homepage HTTP');
   assert.equal(await page.locator('.homepage-demo-contact').count(),1,'one demo/contact section');
   assert.equal(await page.locator('#contacto').count(),1,'unique contact section anchor');
   assert.equal(await page.locator('.homepage-demo-access a[href="'+demoHref+'"]').count(),1,'links to existing demo');
   assert.equal(await page.locator('.homepage-demo-contact form').count(),1,'existing real contact form');
   assert.equal(await page.locator('.homepage-demo-contact form input[name="email"]').count(),1,'email field');
   assert.equal(await page.locator('.homepage-demo-contact form textarea[name="message"]').count(),1,'contact message');
   assert.equal(await page.locator('.homepage-demo-contact button[type="submit"]').count(),1,'contact submit');
   assert.equal(await page.locator('text=Ask for your Demo').count(),0,'obsolete personalized demo removed');
   const bounds=await page.evaluate(()=>{
    const card=document.querySelector('.homepage-demo-contact').getBoundingClientRect();
    const form=document.querySelector('.homepage-demo-contact form').getBoundingClientRect();
    return {scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth,
            cardLeft:card.left,cardRight:card.right,formRight:form.right,formLeft:form.left};
   });
   assert(bounds.scroll<=bounds.width+3,'no document horizontal overflow '+JSON.stringify(bounds));
   assert(bounds.cardLeft>=-2&&bounds.cardRight<=bounds.width+2,'contact card fits screen '+JSON.stringify(bounds));
   assert(bounds.formLeft>=bounds.cardLeft-2&&bounds.formRight<=bounds.cardRight+2,'contact form fits card '+JSON.stringify(bounds));
   assert.equal(errors.length,0,'JavaScript errors: '+errors.join(','));
   await page.locator('#contacto').scrollIntoViewIfNeeded();
   await page.screenshot({path:'qa-screenshots/'+v.name+'-'+language+'-homepage-contact.png',fullPage:true});
   good(label);
  }catch(e){fail(label,e);await page.screenshot({path:'qa-screenshots/ERROR-'+v.name+'-'+language+'-homepage-contact.png',fullPage:true}).catch(()=>{})}
  await page.close();
 }
}
await browser.close();
console.log('SUMMARY',JSON.stringify({pass:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,tests:results}));
if(results.some(x=>!x.pass))process.exitCode=1;
