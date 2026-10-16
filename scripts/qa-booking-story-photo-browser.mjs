/* Visual-only home booking story QA: original booking/checkout flow remains untouched. */
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const origin=(process.env.QA_URL || 'http://127.0.0.1:4173').replace(/\/$/,'');
const cases=[
 ['en',390,844],['es',390,844],
 ['en',820,1180],['es',820,1180],
 ['en',1440,900],['es',1440,900]
];
mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 for(const [lang,width,height] of cases) {
  const page=await browser.newPage({viewport:{width,height}, reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(origin+(lang==='es'?'/es/':'/'),{waitUntil:'domcontentloaded',timeout:45000});
  const story=page.locator('.booking-scrolly-wrap');
  await story.waitFor({state:'attached',timeout:20000});
  await story.scrollIntoViewIfNeeded();
  const photos=story.locator('.booking-scrolly-photo');
  assert.equal(await photos.count(),3,'One distinct photograph for every step');
  await page.waitForFunction(()=>{
   const images=[...document.querySelectorAll('.booking-scrolly-photo')];
   return images.length===3 && images.every(img=>img.complete&&img.naturalWidth>0);
  },null,{timeout:20000});
  for(let i=0;i<3;i++){
   await story.locator('.walkthrough-controls button').nth(i).click();
   await page.waitForFunction(index=>document.querySelector('.booking-scrolly-wrap')?.dataset.step===String(index),i,{timeout:10000});
   await page.waitForTimeout(750);
   const opacity=await photos.nth(i).evaluate(el=>Number(getComputedStyle(el).opacity));
   assert(opacity>.95,lang+' '+width+' step '+i+' image should be visible');
   const photoWidth=await story.locator('.booking-scrolly-shape').evaluate(el=>el.getBoundingClientRect().width);
   assert(photoWidth>210,'Photograph too small on '+width+'px viewport');
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert(overflow<=2,'Unexpected document horizontal overflow: '+lang+' '+width+' '+overflow);
  assert(!errors.length,lang+' '+width+' browser error: '+errors.join(' | '));
  if(width===820)await page.screenshot({path:'qa-screenshots/booking-photo-story-'+lang+'-ipad.png'});
  console.log('PASS: '+lang+' '+width+'px photos loaded, staged, interactive and no overflow');
  await page.close();
 }
 const reduced=await browser.newPage({viewport:{width:820,height:1180},reducedMotion:'reduce'});
 await reduced.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:45000});
 const story=reduced.locator('.booking-scrolly-wrap');
 await story.scrollIntoViewIfNeeded();
 const transition=await story.locator('.booking-scrolly-photo').first().evaluate(el=>getComputedStyle(el).transitionDuration);
 assert(transition.split(',').every(s=>parseFloat(s)===0),'Reduced motion must disable all photo transitions: '+transition);
 await reduced.close();
 console.log('[BOOKING STORY PHOTO BROWSER QA PASSED]');
} finally {await browser.close();}
