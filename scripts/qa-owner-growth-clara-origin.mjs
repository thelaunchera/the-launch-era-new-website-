import assert from 'node:assert/strict';
const base='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/';
const owner='https://command.thelaunchera.com',foreign='https://invalid.example';
for(const [slug,body,expected] of [['tle-booking-demo-gate',{action:'owner_preview'},401],['tle-ai-booking-demo',{},400]]){
 const preflight=await fetch(base+slug,{method:'OPTIONS',headers:{Origin:owner,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':slug==='tle-booking-demo-gate'?'content-type,authorization':'content-type'},signal:AbortSignal.timeout(12000)});
 assert.equal(preflight.status,204,slug+' preflight');assert.equal(preflight.headers.get('access-control-allow-origin'),owner);
 const response=await fetch(base+slug,{method:'POST',headers:{Origin:owner,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
 assert.equal(response.status,expected,slug+' must preserve validation/auth without an owner token');assert.equal(response.headers.get('access-control-allow-origin'),owner);
 const data=await response.json();assert.equal(typeof data.html,'undefined','No private content without owner authentication');
 const denied=await fetch(base+slug,{method:'POST',headers:{Origin:foreign,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
 assert.equal(denied.status,403,slug+' foreign origin');assert.notEqual(denied.headers.get('access-control-allow-origin'),foreign);
}
console.log('PASS live Clara/Sonny Command Center preflight, invalid/no-session requests, foreign-origin denial; no email, model request, booking or private content.');
