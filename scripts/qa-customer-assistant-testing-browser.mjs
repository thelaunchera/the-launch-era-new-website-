// Operator-run browser + live Testing API, synthetic fixtures only. Never points to production.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const {chromium,request}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const key='cdc38a40-968d-4b54-beb0-1b22a6d043b5';
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;res.setHeader('Content-Type',path.endsWith('.css')?'text/css':path.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(path==='/'?'<meta name="viewport" content="width=device-width,initial-scale=1"><h1>QA ONLY — Testing</h1><script src="/assets/tle-customer-assistant.js"></script>':await readFile('public'+path));}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
const http=await request.newContext({proxy:{server:process.env.HTTPS_PROXY}});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const calls=[];
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());if(u.origin===origin)return route.continue();
  assert.equal(u.pathname,'/functions/v1/tle-customer-assistant');
  const data=route.request().postDataJSON();
  if(data.action==='submit')data.external_ref='req_11111111-2222-4333-8444-555555555553';
  // Test proxy changes only the endpoint, fixed QA reference and transport CORS origin.
  const response=await http.post('https://afyiltvdfqnuyzcqsnoh.supabase.co'+u.pathname,{headers:{'Content-Type':'application/json',Origin:'https://thelaunchera.com'},data:JSON.stringify(data),timeout:45000});
  const result=await response.json();calls.push({action:data.action,status:response.status(),result});
  await route.fulfill({status:response.status(),headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':origin},body:JSON.stringify(result)});
 });
 await page.goto(origin+'/?key='+key+'&lang=es');await page.locator('.tca-launch').click();
 await page.locator('.tca-chat textarea').fill('Necesito Office Cleaning B para mi oficina.');await page.locator('.tca-chat button').click();await page.locator('.tca-message').nth(2).waitFor({timeout:45000});
 await page.locator('.tca-review-button').click();
 const data={service_id:'office-b',property_type:'Office',customer_name:'[QA ONLY] Sample Customer',customer_email:'qa@example.invalid',customer_phone:'2025550100',address:'123 Example Road, Suite 4',city:'Example City',state:'NY',zip:'10001',date:'2099-10-21',time:'09:00'};
 for(const [name,value]of Object.entries(data)){const f=page.locator('[name="'+name+'"]');if(name==='service_id')await f.selectOption(value);else await f.fill(value)}
 await page.locator('[name="appointment_reminders_opt_in"]').check();await page.locator('[name="confirmed"]').check();await page.locator('.tca-submit').click();
 await page.getByText('Recibimos tu solicitud. Tu cita todavía no está confirmada.',{exact:true}).waitFor({timeout:45000});
 assert.match(await page.locator('.tca-status').innerText(),/no pudimos verificar el correo/);
 assert.ok(calls.every(x=>x.status===200));assert.equal(calls.find(x=>x.action==='submit').result.booking_confirmed,false);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
 await page.screenshot({path:'/workspace/scratch/tle-assistant-live-testing-mobile.png'});
 console.log('PASS actual widget → real Testing AI → review/consent → live request saved; pending confirmation and unverified email accurately displayed',JSON.stringify(calls.map(x=>({action:x.action,status:x.status}))));
}finally{await http.dispose();await browser.close();await new Promise(r=>server.close(r))}
