// Regression: compact native dates and non-submitting inquiry feedback in iPhone-size layouts.
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
const root=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/[/]$/,'');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce'});
const paths=[
 '/demos/havana-19/','/demos/ivory-and-bloom/',
 '/demos/angela-so-fresh-clean-queen/','/demos/claudia/','/experience-cleaning/'
];
try {
  for (const path of paths) {
    const page=await context.newPage();
    const response=await page.goto(root+path,{waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200,path+' should load');
    const date=page.locator('input[type="date"]').first();
    await date.waitFor({state:'attached'});
    const geometry=await date.evaluate(el=>{
      const css=getComputedStyle(el);
      const box=el.getBoundingClientRect();
      const label=el.closest('label,.date-selector,.field');
      const parent=label?.getBoundingClientRect();
      return {height:css.height,fontSize:css.fontSize,boxWidth:css.boxSizing,
              width:box.width,right:box.right,parentRight:parent?.right||0,visible:box.width>0};
    });
    assert.equal(geometry.height,'50px',path+' calendar must be compact: '+JSON.stringify(geometry));
    assert.ok(parseFloat(geometry.fontSize)>=16,path+' iPhone date must not trigger text zoom');
    assert.equal(geometry.boxWidth,'border-box',path+' date must use border-box');
    if(geometry.visible){
      assert.ok(geometry.right<=geometry.parentRight+2,path+' date overflows its label: '+JSON.stringify(geometry));
    }
    console.log('DATE OK',path,JSON.stringify(geometry));
    if (path.includes('havana-19')||path.includes('ivory-and-bloom')) {
      const form=page.locator(path.includes('havana-19')?'#booking':'#inquiryForm');
      const progress=form.locator('.tle-form-progress [role="progressbar"]');
      await progress.waitFor({state:'visible'});
      const start=Number(await progress.getAttribute('aria-valuenow'));
      await form.locator('input[name="date"]').fill('2026-12-17');
      const next=Number(await progress.getAttribute('aria-valuenow'));
      assert.ok(next>start,path+' should advance the inquiry progress');
      const dateNote=form.locator('.tle-date-chosen');
      assert.ok(await dateNote.isVisible(),path+' should show selected date');
      await form.locator('input[name="email"]').fill('invalid-email');
      await form.locator('input[name="email"]').blur();
      assert.equal(await form.locator('input[name="email"]').getAttribute('aria-invalid'),'true',path+' invalid email notice');
      await form.locator('input[name="email"]').fill('sample@example.com');
      assert.equal(await form.locator('input[name="email"]').getAttribute('aria-invalid'),null,path+' valid email clears warning');
      await form.locator('input[name="name"]').fill('Sample Customer');
      if(path.includes('havana-19')) {
        await form.locator('[name="time"]').selectOption({label:'7:00 PM'});
      } else {
        await form.locator('[name="guests"]').selectOption({index:1});
        await form.locator('[name="style"]').selectOption({index:1});
        await form.locator('[name="location"]').fill('Sample venue, Miami');
      }
      assert.equal(Number(await progress.getAttribute('aria-valuenow')),100,path+' completed form should reach 100%');
      await form.locator('button[type="submit"]').click();
      const result=page.locator(path.includes('havana-19')?'#receipt':'#result');
      await result.waitFor({state:'visible'});
      assert.ok(/demo|preview|vista previa|not a confirmed|not been|no booking|no payment|not sent|no se ha enviado/i.test(await result.innerText()),path+' must remain a non-sending demo');
      console.log('INQUIRY PREVIEW OK',path);
    }
    await page.close();
  }
} finally {await browser.close();}
