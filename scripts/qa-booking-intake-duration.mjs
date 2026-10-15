import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {existsSync,readFileSync,statSync,mkdirSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('public');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css'};
const server=createServer((req,res)=>{
  const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let filename=resolve(root,'.'+p);
  if(filename!==root&&!filename.startsWith(root+sep)){res.writeHead(403).end();return}
  if(existsSync(filename)&&statSync(filename).isDirectory())filename=resolve(filename,'index.html');
  if(!existsSync(filename)){res.writeHead(404).end('Missing');return}
  res.writeHead(200,{'Content-Type':types[extname(filename)]||'application/octet-stream'});
  res.end(readFileSync(filename));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
try{
 for(const lang of ['en','es'])for(const width of [360,390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:860}});
  const errors=[];
  let liveCalls=0;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/functions/v1/**',r=>{liveCalls++;return r.abort();});
  const uri=lang==='es'?'/es/booking-flow-intake/?demo=1':'/booking-flow-intake/?demo=1';
  await page.goto(base+uri,{waitUntil:'domcontentloaded'});
  const area=page.locator('[data-tle-duration-picker]');
  await area.locator('input[name=duration_mode]').first().waitFor();
  assert.equal(await page.locator('[name=job_duration_minutes]').count(),1);
  assert.equal(await page.locator('[name=service_duration_rules]').count(),1);
  assert.equal(await page.evaluate(()=>durationPicker.validate()),false,'Duration required');
  await area.locator('[name=duration_mode][value=same]').check();
  assert.equal(await area.locator('[data-duration-same]').isVisible(),true);
  assert.equal(await area.locator('[data-duration-varies]').isVisible(),false);
  await area.locator('#durationOne').selectOption('180');
  assert.equal(await page.evaluate(()=>durationPicker.apply()),true);
  assert.equal(await page.locator('[name=job_duration_minutes]').inputValue(),'180');
  assert.equal(await page.locator('[name=service_duration_rules]').inputValue(),'');
  await area.locator('[name=duration_mode][value=varies]').check();
  assert.equal(await area.locator('[data-duration-varies]').isVisible(),true);
  assert.equal(await page.evaluate(()=>durationPicker.validate()),false,'Service required');
  await area.locator('.dt-row').first().locator('input').fill('Standard cleaning');
  await area.locator('.dt-row').first().locator('select').selectOption('120');
  await area.locator('[data-duration-add]').click();
  await area.locator('.dt-row').nth(1).locator('input').fill('Deep cleaning');
  await area.locator('.dt-row').nth(1).locator('select').selectOption('300');
  assert.equal(await page.evaluate(()=>durationPicker.apply()),true);
  assert.equal(await page.locator('[name=job_duration_minutes]').inputValue(),'300','Conservative planning duration');
  const result=await page.locator('[name=service_duration_rules]').inputValue();
  assert.match(result,/Standard cleaning.*120 min/);
  assert.match(result,/Deep cleaning.*300 min/);
  await area.locator('.dt-row').nth(1).locator('.dt-remove').click();
  assert.equal(await area.locator('.dt-row').count(),1);
  assert.equal(await page.evaluate(()=>durationPicker.apply()),true);
  assert.equal(await page.locator('[name=job_duration_minutes]').inputValue(),'120');
  await area.locator('[name=duration_mode][value=same]').check();
  assert.equal(await page.evaluate(()=>durationPicker.apply()),true);
  assert.equal(await page.locator('[name=service_duration_rules]').inputValue(),'','Stale service-specific durations cleared');
  const metrics=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,formWidth:document.querySelector('[data-tle-duration-picker]').getBoundingClientRect().width}));
  assert(metrics.documentWidth<=metrics.viewportWidth+3,'No horizontal overflow: '+JSON.stringify(metrics));
  assert(metrics.formWidth>0&&metrics.formWidth<=width,'Duration controls fit screen');
  assert.equal(liveCalls,0,'No real backend calls in test mode');
  assert.deepEqual(errors,[],'No browser JS errors');
  await page.screenshot({path:'qa-screenshots/booking-duration-'+lang+'-'+width+'.png',fullPage:true});
  console.log('PASS booking duration '+lang+' '+width);
  await page.close();
 }
}finally{await browser.close();await new Promise(ok=>server.close(ok))}
