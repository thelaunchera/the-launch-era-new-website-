// Private Jessie dashboard browser fixture — synthetic data only. No production writes, sends or client records.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {existsSync,mkdirSync,statSync,readFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('public');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const server=createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 let file=resolve(root,'.'+pathname);
 if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403).end();return}
 if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
 if(!existsSync(file)){res.writeHead(404).end('Not found');return}
 res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(readFileSync(file));
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const base='http://127.0.0.1:'+server.address().port;
const roles=['jessie','sales','projects','developer','qa','creative','care'];
const fakeAuth=`window.supabase={createClient:()=>({auth:{
 getSession:async()=>({data:{session:{access_token:"fixture-no-real-token"}},error:null}),
 getUser:async()=>({data:{user:null}}),
 onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})
 }})};`;
function mockResponse(body){
 const lang=body.language==='en'?'en':'es';
 const reports=roles.map(agent=>({
  agent,read_only:true,status:agent==='projects'?'partial':'checked',
  summary:lang==='es'?'Revisión de ejemplo, sin datos reales.':'Synthetic review with no real client records.',
  facts:[{label:'Active prospects',value:agent==='sales'?1:null},{label:'Paid with intake missing',value:agent==='projects'?1:null}]
 }));
 if(body.action==='list')return {ok:true,tasks:[],events:[],runs:[],outputs:[],capabilities:{ai_key_detected:true,provider:'groq'}};
 if(body.action==='team_brief')return {ok:true,collected_at:'2026-10-14T11:00:00Z',counts:{prospects:1,unread_notifications:0,open_support:0,active_tasks:0},reports,priority_actions:[{agent:'projects',severity:'high',label:lang==='es'?'Revisar intake de prueba':'Review synthetic intake',count:1}],no_external_actions:true};
 if(body.action==='capability_manifest')return {ok:true,owner_only:true,roles,external_actions_enabled:false};
 if(body.action==='provider_check')return {ok:true,configured:true,verified:true,provider:'groq',reason:'connected'};
 return {ok:false,error:'Fixture refuses unsafe or unknown action'};
}
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
const results=[];
try{
 for(const lang of ['es','en'])for(const width of [390,820,1440]){
  const context=await browser.newContext({viewport:{width,height:width<600?844:900},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',err=>errors.push(String(err)));
  await page.addInitScript(selected=>localStorage.setItem('tle_crm_owner_language',selected),lang);
  await page.route('**/vendor/supabase-js-v2.57.0.umd.js',route=>route.fulfill({status:200,contentType:'application/javascript',body:fakeAuth}));
  await page.route('**/functions/v1/tle-ai-team',async route=>{
   if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{
    'access-control-allow-origin':'*','access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'authorization,apikey,content-type'}});
   const body=route.request().postDataJSON()||{};
   const payload=mockResponse(body);
   return route.fulfill({status:payload.ok?200:400,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(payload)});
  });
  await page.goto(base+'/command-center/ai-team.html',{waitUntil:'domcontentloaded'});
  await page.locator('#app:not(.hidden)').waitFor({timeout:12000});
  await page.locator('#scan').click();
  await page.locator('#team-brief-reports > article').first().waitFor({timeout:12000});
  assert.equal(await page.locator('#team-brief-reports > article').count(),7,'Seven agent cards missing');
  const title=await page.locator('#team-overview-title').innerText();
  assert.match(title,lang==='es'?/Todo tu equipo/:/The whole team/,'Overview language mismatch');
  await page.locator('#owner-diagnostic-run').click();
  await page.locator('.ait-owner-diagnostic-result').first().waitFor({timeout:12000});
  assert.equal(await page.locator('.ait-owner-diagnostic-result').count(),4,'Missing owner diagnostic checks');
  await page.locator('#owner-diagnostic-copy').click();
  const report=await page.evaluate(()=>navigator.clipboard.readText());
  assert.equal(JSON.parse(report).provider,'GroqCloud');
  assert.doesNotMatch(report,/fixture-no-real-token|service_role|client_name|private@example/i,'Sensitive data in copied QA report');
  const geometry=await page.evaluate(()=>{
   const ids=['app','team-overview','team-brief-reports','owner-diagnostic'];
   return {full:document.documentElement.scrollWidth,viewport:innerWidth,
    nodes:ids.map(id=>{const el=document.getElementById(id),r=el.getBoundingClientRect();return {id,left:r.left,right:r.right}})};
  });
  assert(geometry.full<=geometry.viewport+3,'Page overflows at '+lang+'/'+width+' ('+JSON.stringify(geometry)+')');
  for(const node of geometry.nodes)assert(node.left>=-3&&node.right<=width+3,'Clipped '+node.id+' at '+lang+'/'+width);
  assert.equal(errors.length,0,'Browser errors at '+lang+'/'+width+': '+errors.join(' / '));
  await page.screenshot({path:'qa-screenshots/jessie-ai-team-'+lang+'-'+width+'.png',fullPage:true});
  results.push(lang+'/'+width);
  await context.close();
 }
 console.log('PASS — fake owner seven agents, read-only diagnostic, clipboard redaction and EN/ES responsive widths: '+results.join(', '));
 console.log('FIXTURE ONLY — live signed-in session, other-tenant and real Groq/device tests still require independent QA.');
}finally{await browser.close();await new Promise(ok=>server.close(ok))}
