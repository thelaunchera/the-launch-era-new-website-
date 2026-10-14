// Safe, read-only live smoke tests for CB Depot's isolated Cloudflare Pages site.
// Never creates a booking, contacts a lead, or sends a customer email.
import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const HOST='https://the-launch-era-new-website.pages.dev';
const API='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1';
const KEY='05a5f9ae-9b1b-4b1c-9e06-392940e028b1';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function checked(url,opts={}){
 const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),20000);
 try{return await fetch(url,{...opts,signal:controller.signal,cache:'no-store'})}
 finally{clearTimeout(timer)}
}
async function retry(name,check){
 let last;
 for(let i=0;i<7;i++){
  try{await check();console.log('PASS: '+name);return}
  catch(e){last=e;console.log('RETRY '+(i+1)+'/7 '+name+': '+String(e.message).slice(0,150));if(i<6)await delay(12000)}
 }
 throw Error(name+': '+last?.message);
}
for(const path of ['cb-depot/index.html','booking/index.html','booking/return/index.html','cb-depot/privacy/index.html','cb-depot/terms/index.html']){
 assert.ok(existsSync('dist-client-bookings/'+path),'Build output is missing '+path);
}
const landing=readFileSync('dist-client-bookings/cb-depot/index.html','utf8');
assert.ok(landing.includes(KEY)&&landing.includes("'/booking/'"),'Client slug must route to its paid booking key');
assert.ok(!landing.includes('service_role'),'Do not ship private service role keys');
await retry('CB Depot Cloudflare entry',async()=>{
 const r=await checked(HOST+'/cb-depot/',{redirect:'manual'});
 assert.equal(r.status,200);
 const html=await r.text();
 assert.match(html,/CB Depot/);
 assert.match(html,/booking/);
});
for(const route of ['/cb-depot/privacy/','/cb-depot/terms/','/booking/return/']){
 await retry('Public route '+route,async()=>{
  const r=await checked(HOST+route);
  assert.equal(r.status,200);
  const html=await r.text();
  assert.match(html,/<html/i);
  if(route.includes('/cb-depot/'))assert.match(html,/CB Depot/);
 });
}
async function cors(slug){
 const endpoint=API+'/'+slug;
 const response=await checked(endpoint,{
  method:'OPTIONS',
  headers:{Origin:HOST,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}
 });
 assert.ok(response.ok,'OPTIONS '+slug+' returned '+response.status);
 assert.equal(response.headers.get('access-control-allow-origin'),HOST,slug+' did not allow the Pages origin');
 return endpoint;
}
async function postPublic(slug,payload){
 const endpoint=await cors(slug);
 const r=await checked(endpoint,{
  method:'POST',headers:{Origin:HOST,'Content-Type':'application/json'},
  body:JSON.stringify(payload)
 });
 assert.equal(r.headers.get('access-control-allow-origin'),HOST,slug+' response origin');
 const body=await r.json();
 assert.equal(r.status,200,slug+' '+JSON.stringify(body).slice(0,260));
 return body;
}
await retry('CB Depot priced catalog + CORS',async()=>{
 const pricing=await postPublic('tle-booking-flow-pricing',{action:'public',booking_key:KEY});
 assert.equal(pricing.business_name,'CB Depot');
 assert.ok(Array.isArray(pricing.services)&&pricing.services.length>=1,'No active CB Depot services');
 assert.ok(pricing.branding?.headline,'CB Depot approved branding unavailable');
});
const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()+3*864e5));
await retry('Availability + CORS',async()=>{
 const availability=await postPublic('tle-booking-flow-availability',{action:'public',booking_key:KEY,date});
 assert.ok(Array.isArray(availability.slots),'Missing slot response');
});
for(const slug of ['tle-booking-flow-inquiry','tle-booking-return-service','tle-booking-smart-welcome']){
 await retry('CORS '+slug,()=>cors(slug));
}
console.log('CB Depot public hosting and read-only API smoke test passed. No customer booking was created.');
