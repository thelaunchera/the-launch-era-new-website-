// Targeted real-browser regression test for La Vie in Pink's three tablet discovery images.
// Images and storefront hero remain untouched; only the first editorial photo trio is capped.
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';

const root=(process.env.QA_URL||'http://127.0.0.1:4196').replace(/\/$/,'');
for(const browserType of [chromium,webkit]){
  const browser=await browserType.launch({headless:true});
  try{
    for(const width of [768,820,1024,1180]){
      const page=await browser.newPage({viewport:{width,height:1024},deviceScaleFactor:2});
      const response=await page.goto(root+'/demos/la-vie-in-pink/',{waitUntil:'domcontentloaded'});
      assert.equal(response?.status(),200,'The actual La Vie preview should load');
      const cards=page.locator('.discovery-section .edit-card');
      assert.equal(await cards.count(),3,'Keep exactly three editorial pictures');
      const measures=await cards.evaluateAll(nodes=>nodes.map(node=>{
        const rect=node.getBoundingClientRect();
        const img=node.querySelector('img');
        const box=img.getBoundingClientRect();
        const computed=getComputedStyle(img);
        return {x:rect.x,y:rect.y,h:box.height,w:box.width,fit:computed.objectFit,ratio:computed.aspectRatio};
      }));
      for(const img of measures){
        assert.ok(img.h>=210&&img.h<=301,JSON.stringify({width,img,message:'Tablet photo must remain compact'}));
        assert.equal(img.fit,'cover','Images should crop elegantly inside the shorter card');
      }
      assert.ok(measures[0].x<measures[1].x&&measures[1].x<measures[2].x,'Keep three aligned columns');
      assert.ok(measures.every(img=>Math.abs(img.y-measures[0].y)<3),'Keep the tops aligned');
      assert.equal(await page.locator('.discovery-section .edit-card img').count(),3);
      assert.equal(await page.locator('.bag-trigger').count(),1,'Do not alter shopping bag');
      console.log('PASS',browserType.name(),width,'three images compact',measures.map(a=>Math.round(a.h)));
      await page.close();
    }
    const mobile=await browser.newPage({viewport:{width:390,height:844}});
    await mobile.goto(root+'/demos/la-vie-in-pink/',{waitUntil:'domcontentloaded'});
    const cols=await mobile.locator('.discovery-section .edit-card').evaluateAll(nodes=>nodes.map(node=>({x:node.getBoundingClientRect().x,y:node.getBoundingClientRect().y})));
    assert.ok(Math.abs(cols[0].x-cols[1].x)<2 && cols[1].x<cols[2].x,
      'Keep approved mobile full-width first photo and two images below');
    await mobile.close();
  }finally{await browser.close();}
}
