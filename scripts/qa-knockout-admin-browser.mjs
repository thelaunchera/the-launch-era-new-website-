import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const root=path.resolve(process.argv[2]||'.output/public/demos/knockout-deli');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
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
  console.log('KNOCKOUT APP INITIAL',width,JSON.stringify({url:page.url(),pageErrors:errors,visibleText:(await page.locator('#view-root').innerText()).slice(0,700),head:(await page.locator('#page-title').innerText()).slice(0,120),hasScript:await page.evaluate(()=>!!document.querySelector('script[src="./app.js"]')),hasSettings:await page.evaluate(()=>!!localStorage.getItem("tle-knockout-admin-demo-v1"))}));
  await page.getByText('30', {exact:true}).first().waitFor({timeout:9000});
  assert.match(await page.locator('#page-title').innerText(),/ORDERS & NOTIFICATIONS/i,'Orders and alerts must open first');
  assert.match(await page.locator('.app-home-hero').innerText(),/GET THE DAY STARTED/i,'Branded welcome message missing');
  const expectedGreeting=await page.evaluate(()=>{const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening';});
  assert.ok((await page.locator('.app-home-hero h2').innerText()).toLowerCase().includes(expectedGreeting.toLowerCase()),'Time-aware greeting is wrong');
  assert.equal(await page.locator('.app-home-content img').evaluate(el=>el.complete&&el.naturalWidth>0),true,'Knockout logo did not load');
  if(width<=700){
    await page.locator('#menu-toggle').click();
    assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('sidebar-open')),true,'App sidebar must open on phone');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('sidebar-open')),false,'Sidebar must close with Escape');
  }
  const nav=code=>page.locator('.nav-btn[data-view="'+code+'"]:visible').first();
  await nav('notifications').click();
  await page.locator('#owner-settings-form [name="email"]').fill('demo-orders@example.com');
  await page.locator('#owner-settings-form [name="phone"]').fill('+15615550101');
  await page.locator('#owner-settings-form button[type="submit"]').click();
  await nav('dashboard').click();
  await page.locator('[data-simulate-order]').first().click();
  await page.locator('[data-order-preparing="DEMO-KO-1002"]').first().waitFor();
  const notices=await page.evaluate(()=>JSON.parse(localStorage.getItem('tle-knockout-admin-demo-v1')).ownerNotifications);
  assert.ok(notices.some(n=>n.channel==='EMAIL'&&n.target==='demo-orders@example.com'&&n.status.includes('NOT SENT')),'Email preview must be recorded without sending');
  assert.ok(notices.some(n=>n.channel==='SMS'&&n.target==='+15615550101'&&n.status.includes('NOT SENT')),'SMS preview must be recorded independently of PWA installation');
  await nav('requests').click();
  const planCards=page.locator('.ko-package-grid .panel');
  assert.equal(await planCards.count(),2,'Both commercial packages must be visible on Orders page');
  const planCopy=(await page.locator('#view-root').innerText()).toLocaleLowerCase('en-US');
  for(const phrase of ['Your website. Your control.','We manage it for you.','Your team manually changes','The Launch Era updates your menu prices','food photos'])
    assert.ok(planCopy.includes(phrase.toLocaleLowerCase('en-US')),'Plan benefits missing: '+phrase);
  assert.ok(!planCopy.includes('everything above'),'Second plan must explain its own benefits without relative placement');
  assert.ok(!planCopy.includes('additional fee')&&!planCopy.includes('optional in either package')&&!planCopy.includes('quoted separately'),'There must be exactly two packages and no paid add-on');
  if(width<=700){
    const first=await planCards.nth(0).boundingBox(),second=await planCards.nth(1).boundingBox();
    assert.ok(first&&second&&second.y>=first.y+first.height-3,'Plan cards must stack vertically on iPhone');
  }
  await nav('content').click();
  const contentCopy=await page.locator('#view-root').innerText();
  assert.ok(contentCopy.toLowerCase().includes('owner'),'Content center must explain owner control');
  assert.ok(contentCopy.includes('The Launch Era')&&contentCopy.toLowerCase().includes('prices'),'$200 plan must include TLE-managed prices and photos');
  assert.ok(!contentCopy.toLowerCase().includes('additional fee'),'Content center must not advertise a third paid tier');
  await nav('requests').click();
  await page.locator('[data-order-preparing="DEMO-KO-1002"]').click();
  await page.locator('[data-order-ready="DEMO-KO-1002"]').click();
  const orderStatus=await page.evaluate(()=>JSON.parse(localStorage.getItem('tle-knockout-admin-demo-v1')).orders.find(o=>o.id==='DEMO-KO-1002').status);
  assert.equal(orderStatus,'Ready','New sample orders should move through Preparing to Ready');
  await nav('notifications').click();
  assert.equal(await page.locator('#owner-settings-form [name="phone"]').inputValue(),'+15615550101','Owner phone must stay configured without installing app');
  await nav('install').click();
  assert.match(await page.locator('#view-root').innerText(),/Add to Home Screen/i,'Install instructions missing');
  const manifest=await page.evaluate(async()=>{const r=await fetch('./manifest.webmanifest');return r.json();});
  assert.equal(manifest.display,'standalone','PWA manifest must offer standalone app mode');
  await nav('menu').click();
  await page.locator('[data-product-card]').first().waitFor();
  assert.equal(await page.locator('[data-product-card]').count(),30,'Full official menu loaded on '+width);
  await page.locator('[data-edit-product="jab"]').click();
  await page.locator('#product-form [name="price"]').fill('19');
  console.log('ADMIN VALIDITY',JSON.stringify(await page.locator('#product-form').evaluate(f=>({valid:f.checkValidity(),invalid:[...f.elements].filter(e=>!e.checkValidity()).map(e=>({name:e.name,value:e.value,why:e.validationMessage}))}))));
  await page.locator('#product-form button[type="submit"]').click();
  console.log('ADMIN DEBUG after save '+width,JSON.stringify({url:page.url(),heading:await page.locator('#page-title').textContent(),modalHidden:await page.locator('#modal-backdrop').evaluate(e=>e.hidden),cards:await page.locator('[data-product-card]').count(),savedJab:await page.evaluate(()=>{try{return JSON.parse(localStorage.getItem("tle-knockout-admin-demo-v1")).products.find(p=>p.id==="jab").price}catch(e){return String(e)}}),errors,excerpt:(await page.locator('#view-root').innerText()).slice(0,400)}));
  if ((await page.locator('[data-edit-product="jab"]').count())===0) await nav('menu').click();
  await page.locator('[data-edit-product="jab"]').waitFor({timeout:9000});
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
  await nav('requests').click();
  const ready=page.locator('[data-order-ready="DEMO-KO-1001"]');
  await ready.click();
  assert.ok((await page.locator('#view-root').innerText()).includes('Ready email prepared'),'Pickup ready action must prepare branded email without sending');
  await nav('alerts').click();
  assert.ok((await page.locator('#alert-form [name="subject"]').inputValue()).includes('ready for pickup'),'Branded order ready email must be composed');
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
