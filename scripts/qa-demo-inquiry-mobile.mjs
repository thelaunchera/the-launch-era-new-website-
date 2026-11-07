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
    const isWedding = path.includes('ivory-and-bloom');
    if(isWedding){
      // iPhone / Instagram must never invoke Apple's oversized native date popover.
      assert.equal(await page.locator('#inquiryForm input[type="date"]').count(),0,'Wedding inquiry should not use a native date input');
      const trigger=page.locator('#ib-date-trigger');
      const geometry=await trigger.evaluate(el=>({
        height:el.getBoundingClientRect().height,
        width:el.getBoundingClientRect().width,
        right:el.getBoundingClientRect().right,
        parentRight:el.parentElement.getBoundingClientRect().right
      }));
      assert.equal(geometry.height,50,'Compact wedding date trigger must be 50px');
      assert.ok(geometry.right<=geometry.parentRight+1,'Wedding trigger must not overflow');
      await trigger.click();
      const picker=page.locator('#ib-date-calendar');
      assert.equal(await picker.isVisible(),true,'Wedding date opens inline');
      const bounds=await picker.evaluate(el=>({
        width:el.getBoundingClientRect().width,
        right:el.getBoundingClientRect().right,
        parentRight:el.parentElement.getBoundingClientRect().right,
        scroll:document.documentElement.scrollWidth,
        viewport:window.innerWidth
      }));
      assert.ok(bounds.right<=bounds.parentRight+1,'Inline calendar stays inside its card: '+JSON.stringify(bounds));
      assert.ok(bounds.scroll<=bounds.viewport+2,'No horizontal overflow after opening calendar: '+JSON.stringify(bounds));
      assert.ok(await picker.locator('#ib-calendar-days button[data-day]').count()>=28,'Day grid must render');
      const past=picker.locator('#ib-calendar-days button[disabled]').first();
      if(await past.count())assert.equal(await past.isDisabled(),true,'Past dates remain unavailable');
      // Use a stable date in the future regardless of run date.
      const target=await page.evaluate(()=>{
        const t=new Date(); const d=new Date(t.getFullYear(),t.getMonth()+2,17);
        return {y:String(d.getFullYear()),m:String(d.getMonth()),day:String(d.getDate()),
          iso:[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
      });
      await picker.locator('#ib-calendar-year').selectOption(target.y);
      await picker.locator('#ib-calendar-month').selectOption(target.m);
      await picker.locator('#ib-calendar-days button[data-day="'+target.iso+'"]').click();
      assert.equal(await page.locator('#ib-date-value').inputValue(),target.iso,'Calendar must store ISO date');
      assert.equal(await picker.isVisible(),false,'Calendar closes after selection');
      assert.equal(await trigger.getAttribute('data-selected'),'true','Selected date appears on date button');
      console.log('INLINE WEDDING CALENDAR OK',JSON.stringify({geometry,bounds,date:target.iso}));
    } else {
      const date=page.locator('input[type="date"]').first();
      await date.waitFor({state:'attached'});
      const geometry=await date.evaluate(el=>{
        const css=getComputedStyle(el);const box=el.getBoundingClientRect();
        const label=el.closest('label,.date-selector,.field');const parent=label?.getBoundingClientRect();
        return {height:css.height,fontSize:css.fontSize,boxWidth:css.boxSizing,
                width:box.width,right:box.right,parentRight:parent?.right||0,visible:box.width>0};
      });
      assert.equal(geometry.height,'50px',path+' calendar must be compact: '+JSON.stringify(geometry));
      assert.ok(parseFloat(geometry.fontSize)>=16,path+' iPhone date must not trigger text zoom');
      assert.equal(geometry.boxWidth,'border-box',path+' date must use border-box');
      if(geometry.visible)assert.ok(geometry.right<=geometry.parentRight+2,path+' overflow: '+JSON.stringify(geometry));
      console.log('DATE OK',path,JSON.stringify(geometry));
    }
    if (path.includes('havana-19')||path.includes('ivory-and-bloom')) {
      const form=page.locator(path.includes('havana-19')?'#booking':'#inquiryForm');
      const progress=form.locator('.tle-form-progress [role="progressbar"]');
      await progress.waitFor({state:'visible'});
      const start=Number(await progress.getAttribute('aria-valuenow'));
      if (!isWedding) await form.locator('input[name="date"]').fill('2026-12-17');
      const next=Number(await progress.getAttribute('aria-valuenow'));
      assert.ok(next>start,path+' should advance the inquiry progress');
      if (!isWedding) {
        const dateNote=form.locator('.tle-date-chosen');
        assert.ok(await dateNote.isVisible(),path+' should show selected date');
      }
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
