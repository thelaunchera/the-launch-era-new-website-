// Read-only HTTP checks against the installed Smart Welcome production edge.
// Never change a customer, create a booking, send email or publish promotions.
import assert from 'node:assert/strict';
const endpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-smart-welcome';
const origin='https://thelaunchera.com';
const timeoutMs=9000;
async function call(method,body,headers={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
   const r=await fetch(endpoint,{method,headers:{Origin:origin,...headers,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:controller.signal});
   const text=r.status===204?'':await r.text();
   return {status:r.status,origin:r.headers.get('access-control-allow-origin'),json:text?JSON.parse(text):null};
 }finally{clearTimeout(timer)}
}
const preflight=await call('OPTIONS',null,{'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type, authorization'});
assert.equal(preflight.status,204);assert.equal(preflight.origin,origin);
const invalid=await call('POST',{action:'public',booking_key:'not-valid'});
assert.equal(invalid.status,400);assert.equal(invalid.origin,origin);
const missing=await call('POST',{action:'public',booking_key:'00000000-0000-4000-8000-000000000000'});
assert.equal(missing.status,200);assert.equal(missing.json?.welcome,null);
const unauthorized=await call('POST',{action:'get',workspace_id:'00000000-0000-4000-8000-000000000000'});
assert.equal(unauthorized.status,401);
const forbidden=await call('POST',{action:'save',workspace_id:'00000000-0000-4000-8000-000000000000',config:{enabled:true}});
assert.equal(forbidden.status,401);
console.log('Smart Welcome Edge: OPTIONS, invalid public, absent business and unauthorized owner writes PASS');
