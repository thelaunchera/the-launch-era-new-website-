import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const key='11111111-1111-4111-8111-111111111111',request='55555555-5555-4555-8555-555555555555';
const server=createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><h1>Sample business page</h1><script src="/assets/tle-customer-assistant.js"></script></body></html>')}
  if(!['/assets/tle-customer-assistant.js','/assets/tle-customer-assistant.css'].includes(u.pathname))throw Error('Unknown route');
  res.setHeader('Content-Type',u.pathname.endsWith('.css')?'text/css':'application/javascript');res.end(await readFile(resolve('public','.'+u.pathname)));
 }catch{res.writeHead(404);res.end('Not found')}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
const fill={service_id:'deep',property_type:'Office',customer_name:'Sample Customer',customer_email:'qa@example.invalid',customer_phone:'2025550100',address:'123 Example Road, Suite 4',city:'Example City',state:'NY',zip:'10001',date:'2099-10-21',time:'09:00'};
try{
 browser=await chromium.launch({headless:true});
 for(const width of [360,390,820,1024,1440])for(const lang of ['en','es']){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[],submissions=[];let writes=0;
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.origin===origin)return route.continue();
   assert.equal(url.pathname,'/functions/v1/tle-customer-assistant','Unexpected external request');
   const input=route.request().postDataJSON();let data;
   if(input.action==='config')data={ok:true,business:'Sample Cleaning Co',services:[{id:'deep',name:'Deep cleaning'}]};
   if(input.action==='message')data={ok:true,reply:lang==='es'?'¿Qué tipo de espacio tienes?':'What type of space do you have?',draft:{service_id:'deep',notes:'Please call before arrival.'},submitted:false};
   if(input.action==='submit'){
    submissions.push(input);assert.equal(input.confirmed,true);assert.equal(input.draft.address,fill.address);assert.equal(input.draft.customer_email,'qa@example.invalid');
    writes++;if(writes===1)return route.abort('timedout'); // Ambiguous network result must keep the same reference.
    data={ok:true,request_id:request,duplicate:true,booking_confirmed:false,customer_email_accepted:false};
   }
   assert.ok(data,'Unexpected action');await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.goto(origin+'/?key='+key+'&lang='+lang);
  const launch=page.locator('.tca-launch');await launch.waitFor();await launch.click();
  assert.equal(await launch.getAttribute('aria-expanded'),'true');
  await page.locator('.tca-chat textarea').fill(lang==='es'?'Necesito una limpieza profunda.':'I need deep cleaning.');
  await page.locator('.tca-chat button').click();await page.locator('.tca-message').nth(2).waitFor();assert.equal(writes,0);
  await page.locator('.tca-review-button').click();assert.equal(await page.locator('[name="service_id"]').inputValue(),'deep');
  for(const [name,value]of Object.entries(fill)){
   const input=page.locator('[name="'+name+'"]');if(name==='service_id')await input.selectOption(value);else await input.fill(value);
  }
  await page.locator('.tca-submit').click();assert.equal(writes,0,'Consent cannot be implied');
  if(width===390)await page.screenshot({path:'/tmp/customer-assistant-review-'+lang+'.png'});
  await page.locator('[name="confirmed"]').check();await page.locator('.tca-submit').click();
  await page.waitForFunction(()=>document.querySelector('.tca-status').textContent.includes('Retry without')||document.querySelector('.tca-status').textContent.includes('Reintenta sin'));
  assert.equal(await page.locator('[name="customer_email"]').inputValue(),'qa@example.invalid');
  await page.locator('.tca-submit').click();await page.locator('.tca-log').getByText(request,{exact:false}).waitFor();
  assert.equal(submissions.length,2);assert.equal(submissions[0].external_ref,submissions[1].external_ref,'Retry reference changed');
  assert.match(await page.locator('.tca-log').textContent(),lang==='es'?/todavía no está confirmada/:/not confirmed yet/);
  assert.match(await page.locator('.tca-status').textContent(),lang==='es'?/no pudimos verificar el correo/:/could not verify the receipt email/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'Page overflow at '+width);
  assert.equal(await page.locator('.tca-panel').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'Panel overflow at '+width);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'/tmp/customer-assistant-'+width+'-'+lang+'.png'});
  console.log('PASS assistant review, consent, safe retry and responsive layout',width,lang);await page.close();
 }
 // Public samples, owner preview and unenabled businesses must never mount a live widget.
 for(const query of ['', '?owner_preview=1', '?key='+key+'&owner_preview=1']){
  const page=await browser.newPage();let external=0;
  await page.route('**/*',r=>{if(new URL(r.request().url()).origin!==origin){external++;return r.abort()}return r.continue()});
  await page.goto(origin+'/'+query);assert.equal(await page.locator('.tca-launch').count(),0);assert.equal(external,0);await page.close();
 }
 const disabled=await browser.newPage();await disabled.route('**/functions/v1/tle-customer-assistant',r=>r.fulfill({status:404,contentType:'application/json',body:'{"error":"Disabled"}'}));
 await disabled.goto(origin+'/?key='+key);assert.equal(await disabled.locator('.tca-launch').count(),0);await disabled.close();
 console.log('PASS no live widget in demos, owner preview or unenabled businesses');
}finally{await browser?.close();await new Promise(done=>server.close(done))}
