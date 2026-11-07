// Safari-engine regression for Ivory & Bloom's Instagram iPhone date bug.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {webkit,devices} from 'playwright';
const origin=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/[/]$/,'');
const browser=await webkit.launch({headless:true});
try {
  for(const width of [360,390]){
    const context=await browser.newContext({...devices['iPhone 13'],viewport:{width,height:780},reducedMotion:'reduce'});
    const page=await context.newPage();
    await page.goto(origin+'/demos/ivory-and-bloom/',{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('#inquiryForm input[type=date]').count(),0,'No native iOS picker on wedding inquiry');
    const trigger=page.locator('#ib-date-trigger');
    await trigger.click();
    const panel=page.locator('#ib-date-calendar');
    assert.equal(await panel.isVisible(),true,'Open in-card calendar');
    const geometry=await panel.evaluate(el=>{
      const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();
      const t=document.querySelector('#ib-date-trigger').getBoundingClientRect();
      const hidden=document.querySelector('#ib-date-value');
      return {right:r.right,parentRight:p.right,width:r.width,scrollWidth:document.documentElement.scrollWidth,
        viewport:window.innerWidth,triggerHeight:t.height,hiddenWidth:hidden.getBoundingClientRect().width,
        hiddenDisplay:getComputedStyle(hidden).display};
    });
    assert.ok(geometry.right<=geometry.parentRight+2,'Calendar clips at '+width+': '+JSON.stringify(geometry));
    assert.ok(geometry.scrollWidth<=geometry.viewport+2,'No horizontal overflow at '+width+': '+JSON.stringify(geometry));
    assert.equal(geometry.triggerHeight,50,'Wedding date button should be 50px');
    assert.equal(geometry.hiddenDisplay,'none','ISO value must not create a white rectangle');
    assert.equal(geometry.hiddenWidth,0,'Hidden ISO value must not occupy layout');
    await mkdir('qa-screenshots',{recursive:true});
    await panel.screenshot({path:'qa-screenshots/hero-ivory-calendar-webkit-'+width+'.png'});
    const date=await page.evaluate(()=>{
      const t=new Date(),d=new Date(t.getFullYear(),t.getMonth()+2,17);
      return {year:String(d.getFullYear()),month:String(d.getMonth()),iso:[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
    });
    await page.locator('#ib-calendar-year').selectOption(date.year);
    await page.locator('#ib-calendar-month').selectOption(date.month);
    await page.locator('#ib-calendar-days button[data-day="'+date.iso+'"]').click();
    assert.equal(await page.locator('#ib-date-value').inputValue(),date.iso);
    assert.equal(await panel.isVisible(),false);
    const form=page.locator('#inquiryForm');
    await form.locator('input[name=name]').fill('Example Person');
    await form.locator('input[name=email]').fill('example@example.com');
    await form.locator('[name=guests]').selectOption({index:1});
    await form.locator('[name=style]').selectOption({index:1});
    await form.locator('[name=location]').fill('Demo Venue');
    await form.locator('button[type=submit]').click();
    assert.ok(await page.locator('#result').isVisible(),'Submit must still preview, not send');
    assert.ok((await page.locator('#requestSummary').innerText()).includes(date.iso),'Preview must contain selected wedding date');
    console.log('WEBKIT IPHONE CALENDAR OK',width,JSON.stringify(geometry));
    await context.close();
  }
} finally {await browser.close();}
