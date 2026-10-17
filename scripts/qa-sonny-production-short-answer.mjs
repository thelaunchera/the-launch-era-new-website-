// Public demo ONLY. No real booking, payment, customer profile or email writes.
import assert from 'node:assert/strict';

const endpoint='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-ai-booking-demo';
const origin='https://thelaunchera.com';
const preflight=await fetch(endpoint,{
  method:'OPTIONS',
  headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}
});
assert.equal(preflight.status,204,'Sonny CORS preflight must return 204');
assert.equal(preflight.headers.get('access-control-allow-origin'),origin,'CORS must allow actual website origin');

const response=await fetch(endpoint,{
  method:'POST',
  headers:{Origin:origin,'Content-Type':'application/json'},
  body:JSON.stringify({
    customer_message:'5',
    business_name:'Automated QA Sample Cleaning',
    service_area:'Palm Beach County',
    services_offered:'Standard cleaning, deep cleaning, move-in/out cleaning, commercial quotes',
    language:'en',
    thread_id:'9d9929ab-2c37-4451-9035-216599421405',
    conversation_history:'Visitor: I need deep cleaning at home\\nAssistant: Great—how many bedrooms does the house have?',
    booking_draft:{category:'residential',property_type:'House',service:'deep',frequency:'weekly'}
  })
});
const payload=await response.json().catch(()=>({}));
assert.equal(response.status,200,
  'A one-character numeric reply must work; HTTP '+response.status+': '+JSON.stringify(payload).slice(0,250));
assert.equal(typeof payload.reply,'string','Sonny must return a reply');
assert(payload.reply.trim().length>0,'Sonny must return a nonempty reply');
assert.equal(payload.booking?.bedrooms,5,'Sonny must remember 5 bedrooms from last explicit question');
assert.equal(payload.booking_created,false,'Public demo must not create a real booking');
assert.equal(payload.email_sent,false,'Public demo must not send any email');
assert.equal(response.headers.get('access-control-allow-origin'),origin,'CORS on normal answer');
console.log('PASS: live Sonny answered single-digit 5, retained bedrooms=5, CORS 204/200 and zero live writes');
