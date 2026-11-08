/** Safe browser-only check of three owner-approved, brand-isolated demo heroes. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const BASE=(process.env.QA_URL||'http://127.0.0.1:4191').replace(/\/$/,'');
const cases=[
 {name:'golden-grid',path:'/demos/golden-grid/',hero:'.hero',img:'.hero-art img',cta:'.hero .button'},
 {name:'ivory-and-bloom',path:'/demos/ivory-and-bloom/',hero:'.hero',img:'.hero-photo img',cta:'.hero a[href="#cake-gallery"]'},
 {name:'havana-19',path:'/demos/havana-19/',hero:'.hero',img:'.hero>img',cta:'.hero a[href="#reservations"]'}
];
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
try {
  for(const width of [390,768,1440]){
    for(const item of cases){
      const context=await browser.newContext({viewport:{width,height:width<=768?844:900},reducedMotion:'reduce'});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      const res=await page.goto(BASE+item.path,{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(res?.status(),200,item.name+' route returned non-200');
      const hero=page.locator(item.hero).first();
      await hero.waitFor({state:'visible'});
      const photo=page.locator(item.img).first();
      await photo.scrollIntoViewIfNeeded();
      await photo.evaluate(async el=>{if(!el.complete)await new Promise((ok,fail)=>{el.addEventListener('load',ok,{once:true});el.addEventListener('error',fail,{once:true});})});
      assert(await photo.evaluate(el=>el.naturalWidth>=300&&el.naturalHeight>=150),item.name+' original hero image missing');
      assert.equal(await page.locator(item.cta).count(),1,item.name+' original hero CTA changed');
      const action=await page.locator(item.cta).first().getAttribute('href');
      assert(action?.startsWith('#'),item.name+' CTA destination changed');
      const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
      assert(geometry.scroll<=geometry.view+3,item.name+' horizontal overflow at '+width+': '+JSON.stringify(geometry));
      assert.deepEqual(errors,[],item.name+' JS errors at '+width);
      await hero.screenshot({path:'qa-screenshots/hero-'+item.name+'-'+width+'.png',timeout:15000,animations:'disabled'});
      await context.close();
      console.log('PASS',item.name,width);
    }
  }
}finally{await browser.close()}