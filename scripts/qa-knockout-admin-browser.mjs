import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(process.argv[2]||'.output/public/demos/knockout-deli');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let file;
 try{const url=new URL(req.url||'/', 'http://127.0.0.1');file=path.resolve(root,'.'+decodeURIComponent(url.pathname));}
 catch{res.writeHead(400);res.end('Invalid path');return;}
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end('Forbidden');return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
try{
 const widths=[390,820,1440];
 fs.mkdirSync('qa-screenshots',{recursive:true});
 for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:840},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>{
   if(route.request().url().startsWith(origin))return route.continue();
   return route.abort();
  });
  await page.goto(origin+'/admin-panel/',{waitUntil:'networkidle'});
  await page.getByText('30', {exact:true}).first().waitFor();
  const nav=code=>page.locator('.nav-btn[data-view="'+code+'"]:visible').first();
  await nav('menu').click();
  await page.locator('[data-product-card]').first().waitFor();
  assert.equal(await page.locator('[data-product-card]').count(),30,'Full official menu loaded on '+width);
  await page.locator('[data-edit-product="jab"]').click();
  await page.locator('#product-form [name="price"]').fill('19');
  await page.locator('#product-form button[type="submit"]').click();
  await page.locator('[data-edit-product="jab"]').waitFor();
  assert.ok((await page.locator('[data-product-card][data-search*="the jab"]').innerText()).includes('$19'),'Price edit failed');
  await nav('locations').click();
  await page.locator('#location-form [name="name"]').fill('QA sample market');
  await page.locator('#location-form [name="address"]').fill('Example plaza — preview only');
  await page.locator('#location-form [name="published"]').check();
  await page.locator('#location-form button[type="submit"]').click();
  await page.getByText('QA sample market',{exact:true}).first().waitFor();
  await nav('events').click();
  await page.locator('[data-new-event]').click();
  await page.locator('#event-form [name="title"]').fill('Demo event');
  await page.locator('#event-form [name="venue"]').fill('Sample venue');
  await page.locator('#event-form [name="date"]').fill('2026-11-20');
  await page.locator('#event-form [name="published"]').check();
  await page.locator('#event-form button[type="submit"]').click();
  await page.getByText('Demo event',{exact:true}).first().waitFor();
  await nav('offers').click();
  await page.locator('#offer-form [name="title"]').fill('Demo offer');
  await page.locator('#offer-form [name="discount"]').fill('10');
  await page.locator('#offer-form [name="enabled"]').check();
  await page.locator('#offer-form button.btn.primary').click();
  await nav('alerts').click();
  await page.locator('#alert-form [name="subject"]').fill('Demo next stop');
  await page.locator('#alert-form [name="body"]').fill('Preview message only — never delivered.');
  await page.locator('#alert-form button[type="submit"]').click();
  await page.getByText('Demo next stop',{exact:true}).first().waitFor();
  assert.ok((await page.locator('#view-root').innerText()).includes('NOT SENT'),'Alert wrongly implies delivery');
  await nav('preview').click();
  const preview=await page.locator('#view-root').innerText();
  for(const required of ['QA sample market','Demo event','Demo offer'])assert.ok(preview.includes(required),'Missing preview '+required);
  await page.reload({waitUntil:'networkidle'});
  await nav('preview').click();
  assert.ok((await page.locator('#view-root').innerText()).includes('QA sample market'),'Browser edits not persistent');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
  assert.equal(overflow,false,'Horizontal page overflow at '+width);
  assert.deepEqual(errors,[],'Browser runtime errors at '+width);
  await page.screenshot({path:'qa-screenshots/knockout-admin-'+width+'.png',fullPage:true});
  await context.close();
 }
 console.log('Knockout Admin Panel browser QA passed: 390/820/1440, 30 items, editing, event, offer, alert preview, persistence, responsive layout.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
