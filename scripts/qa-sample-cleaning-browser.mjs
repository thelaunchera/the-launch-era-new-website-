/** Live-browser-style QA on an isolated built PR preview. No network writes. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  for(const lang of ['en','es'])for(const width of [390,820,1440]){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    const errors=[],writes=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(/supabase\.co|resend\.com/.test(r.url())||r.method()==='POST')writes.push(r.method()+' '+r.url());});
    const response=await page.goto(base+'/sample-cleaning/?lang='+lang+'&source=qa',{waitUntil:'domcontentloaded',timeout:45000});
    assert.equal(response?.status(),200,'Sample Cleaning must be publicly reachable');
    assert.equal(await page.locator('#leadHero').count(),1);
    assert.match(await page.locator('#leadHero').innerText(),lang==='en'?/Beautifully cleaned/i:/Limpieza bien hecha/i,'Hero should show the original Sample Cleaning brand experience');
    assert.match(await page.locator('#leadName').innerText(),/SAMPLE CLEANING/i);
    assert.equal(await page.locator('#bookingStarter').count(),1);
    assert.equal(await page.locator('#demoSuccessSummary').count(),1);
    assert(await page.locator('.demo-hero-cta').isVisible(),'Service CTA must remain visible');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+5),'No horizontal overflow at '+lang+' '+width);
    await page.locator('#bookingStarter').scrollIntoViewIfNeeded();
    assert(await page.locator('#bookingStarter').isVisible());
    await page.screenshot({path:'qa-screenshots/sample-cleaning-'+lang+'-'+width+'.png',fullPage:false});
    if(lang==='en'&&width===390){
      await page.evaluate(()=>{document.querySelector('#name').value='Practice Customer';document.querySelector('#email').value='sample@example.com';window.startResidential('Standard Cleaning',120);});
      await page.evaluate(()=>window.submitResidential());
      assert(await page.locator('#demoSuccessSummary').isVisible(),'Sample request should lead to local confirmation');
      assert.equal(new URL(await page.locator('#trackerLink').getAttribute('href'),page.url()).pathname,'/try-booking/','No protected Command Center access via public sample');
    }
    assert.deepEqual(writes,[],'Public demo may not access real Supabase or POST data');
    assert.deepEqual(errors,[],'Browser errors in '+lang+' '+width);
    await page.close();
  }
  console.log('PASS: Sample Cleaning visual/public EN/ES and simulated no-send booking at phone, tablet, desktop');
} finally {await browser.close();}
