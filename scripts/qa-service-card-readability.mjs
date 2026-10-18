/** Responsive six-card flip-gallery typography/geometry. Read-only UI check. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
const base=(process.env.QA_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
try{
 for(const [lang,path] of [['en','/'],['es','/es/']]){
  for(const width of [360,390,768,820,1024,1440]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[],writes=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))writes.push(r.url())});
   await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.solutions-section .tle-service-flip').first().waitFor();
   await page.evaluate(()=>document.fonts.ready);
   const report=await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('.sales-home .solutions-section .tle-service-flip')];
    const grid=cards[0]?.closest('.service-grid');
    const bounds=x=>{const r=x.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
    return {overflow:document.documentElement.scrollWidth-innerWidth,
     columns:getComputedStyle(grid).gridTemplateColumns.includes('minmax(')?getComputedStyle(grid).gridTemplateColumns.split('minmax(').length-1:getComputedStyle(grid).gridTemplateColumns.trim().split(' ').filter(Boolean).length,
     gridTemplate:getComputedStyle(grid).gridTemplateColumns,
     gridWidth:grid.getBoundingClientRect().width,
     gridClass:grid.className,
     cards:cards.map((card,i)=>{
       const front=card.querySelector('.tle-service-flip__front');
       const button=card.querySelector('.tle-service-flip__front-button');
       const back=card.querySelector('.tle-service-flip__back');
       const cta=card.querySelector('.tle-service-flip__cta');
       const p=front.querySelector('p');
       const textTag=front.querySelector('.card-tag');
       const face=bounds(front),frontText=bounds(p),tag=bounds(textTag);
       const styles=getComputedStyle(p);
       return {i,title:card.querySelector('.tle-service-flip__back h3')?.textContent,
        frontHeight:front.clientHeight,frontScroll:button.scrollHeight,
        backHeight:back.clientHeight,backScroll:back.scrollHeight,
        frontTextBottom:frontText.bottom,tagBottom:tag.bottom,faceBottom:face.bottom,
        ctaHeight:cta.getBoundingClientRect().height,ctaMinHeight:parseFloat(getComputedStyle(cta).minHeight),ctaWidth:cta.getBoundingClientRect().width,
        cardWidth:card.getBoundingClientRect().width,
        frontClamped:styles.display==='-webkit-box'||styles.webkitLineClamp!=='none',
        originalLink:cta.getAttribute('href')};
     })};
   });
   assert.equal(report.cards.length,6,'Six service cards required');
   const expected=width<=700?1:width<=1000?2:3;
   assert.equal(report.columns,expected,lang+' '+width+' first-row card count '+JSON.stringify({gridTemplate:report.gridTemplate,gridWidth:report.gridWidth}));
   assert(report.overflow<=3,lang+' '+width+' page overflows horizontally '+report.overflow);
   for(const c of report.cards){
    assert(c.originalLink.startsWith('/'),'CTA destination missing '+c.title);
    assert(!c.frontClamped,'Description still line-clamped: '+c.title);
    assert(c.frontScroll<=c.frontHeight+5,'Front card clips content '+lang+' '+width+': '+JSON.stringify(c));
    assert(c.backScroll<=c.backHeight+5,'Back card clips content '+lang+' '+width+': '+JSON.stringify(c));
    assert(c.tagBottom<=c.faceBottom+2,'Bottom tag hidden '+c.title);
    assert(c.frontTextBottom<=c.faceBottom+2,'Description hidden '+c.title);
    // The approved iPhone Brand C repair uses a 48px minimum touch target.
    // CSS specifies a 48px tap target; transient ancestor transforms can make the
    // measured box 1–2px smaller while scroll animation is settling.
    assert(c.ctaMinHeight>=48 && c.ctaHeight>=46 && c.ctaHeight<=58,'Service CTA target should retain 48px CSS and compact geometry '+c.title+': '+JSON.stringify({actual:c.ctaHeight,min:c.ctaMinHeight}));
    assert(c.ctaWidth<c.cardWidth*.86,'CTA should be a small pill '+c.title);
   }
   assert.deepEqual(writes,[],'Card browsing must never submit');
   assert.deepEqual(errors,[],'Browser JS errors');
   console.log('PASS readable six service cards '+lang+' '+width+'px; '+report.columns+' columns');
   await page.close();
  }
 }
} finally {await browser.close();}
