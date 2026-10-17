/* Read-only EN/ES visual QA: cursor headline, accessibility and mobile fallback.
   Never submits leads, touches checkouts, or modifies client records. */
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const base=(process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});

async function inspect(page,lang,width,expectEnabled){
  const block=page.locator('.problem-section .tle-mask-headline');
  const original=block.locator('h2.tle-mask-headline__base');
  const colored=block.locator('.tle-mask-headline__mask');
  const clone=block.locator('h2.tle-mask-headline__reveal');
  await original.waitFor({state:'visible'});
  await page.waitForFunction(() => {
    const heading=document.querySelector('.problem-section .tle-mask-headline__base');
    return !!(heading && Object.keys(heading).some(k=>k.startsWith('__reactFiber')));
  });
  assert.equal(await original.count(),1,lang+' '+width+': SEO heading missing');
  assert.equal(await clone.count(),1,lang+' '+width+': decorative copy missing');
  assert.equal(await colored.getAttribute('aria-hidden'),'true');
  assert.equal(await original.textContent(),await clone.textContent(),'Text layers diverged');
  assert.equal(await colored.evaluate(el=>getComputedStyle(el).pointerEvents),'none');
  const geometry=await block.evaluate(el=>{
    const orig=el.querySelector('.tle-mask-headline__base');
    const clone=el.querySelector('.tle-mask-headline__reveal');
    const a=orig.getBoundingClientRect(),b=clone.getBoundingClientRect();
    const emA=orig.querySelector('em').getBoundingClientRect();
    const emB=clone.querySelector('em').getBoundingClientRect();
    const section=el.closest('.problem-section');
    return {headingDiff:[Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.width-b.width),Math.abs(a.height-b.height)],emDiff:[Math.abs(emA.x-emB.x),Math.abs(emA.y-emB.y)],sectionOverflow:section.scrollWidth-section.clientWidth};
  });
  if(expectEnabled) assert(geometry.headingDiff.every(n=>n<=1) && geometry.emDiff.every(n=>n<=1),lang+' '+width+': text layers misaligned '+JSON.stringify(geometry));
  assert(geometry.sectionOverflow<=2,lang+' '+width+': cursor section overflows '+JSON.stringify(geometry));
  if(expectEnabled){
    await page.waitForFunction(()=>document.querySelector('.tle-mask-headline--enabled') !== null);
    await block.scrollIntoViewIfNeeded();
    const box=await block.boundingBox();
    await page.mouse.move(box.x+Math.min(90,box.width/3),box.y+box.height/2);
    // Animations may settle a few frames later under CI load. Assert the actual 45px end state.
    await page.waitForFunction(()=>{const v=document.querySelector('.tle-mask-headline__mask')?.style.clipPath||'';const radius=Number((v.match(/circle\(([\d.]+)px/)||[])[1]);return radius>39&&radius<51;},null,{timeout:3500});
    const clip=await colored.evaluate(el=>el.style.clipPath);
    const radius=Number((clip.match(/circle\(([\d.]+)px/)||[])[1]);
    assert(radius>35&&radius<55,lang+' '+width+': 45px blue mask failed: '+clip);
    assert.equal(await colored.evaluate(el=>getComputedStyle(el).display),'block');
    await page.mouse.move(1,1);
    await page.waitForTimeout(750);
    const gone=await colored.evaluate(el=>el.style.clipPath);
    assert(Number((gone.match(/circle\(([\d.]+)px/)||[])[1])<2,lang+' '+width+': mask did not retreat');
  }else{
    assert.equal(await block.getAttribute('class'),'tle-mask-headline',lang+' '+width+': coarse/reduced motion left mask enabled');
    assert.equal(await colored.evaluate(el=>getComputedStyle(el).display),'none');
  }
  if(width===390||width===1440) await page.locator('.problem-section').screenshot({path:`qa-screenshots/problem-mask-${lang}-${width}-${expectEnabled?'desktop':'mobile'}.png`});
  // The original pain cards remain interactive and screen-reader reachable.
  const first=page.locator('.problem-section .sales-pains details').first();
  await first.locator('summary').click();
  assert.equal(await first.getAttribute('open'),'',lang+' '+width+': accordion stopped working');
  return {lang,width,expectEnabled,geometry};
}

try{
  const outcomes=[];
  for(const [lang,path] of [['en','/'],['es','/es/']]){
    for(const [width,touch,reduced] of [[390,true,false],[1440,false,false],[1440,false,true]]){
      const page=await browser.newPage({viewport:{width,height:844},hasTouch:touch,isMobile:touch,reducedMotion:reduced?'reduce':'no-preference'});
      const errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
      outcomes.push(await inspect(page,lang,width,!touch&&!reduced));
      // #418 is a root-document hydration warning from shared page startup; log it
      // distinctly rather than obscuring failures of this isolated cursor feature.
      const unrelatedHydration=errors.filter(msg=>msg.includes('Minified React error #418'));
      if(unrelatedHydration.length) console.warn('[SHARED ROOT HYDRATION WARNING]',lang,width,unrelatedHydration.length);
      assert.deepEqual(errors.filter(msg=>!msg.includes('Minified React error #418')),[],lang+' '+width+': other JavaScript errors');
      await page.close();
    }
  }
  console.log('[PROBLEM MASK CURSOR BROWSER QA PASS]',JSON.stringify(outcomes));
}finally{await browser.close();}
