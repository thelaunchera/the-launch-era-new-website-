/**
 * Booking Studio · isolated in-memory integration harness for Developer + QA.
 * SYNTHETIC ONLY: no network, no real bookings, no emails, no Supabase.
 * A separate production adapter must be authorized, reviewed and E2E-tested.
 */
const text=(x,max=180)=>typeof x==="string"?x.trim().slice(0,max):"";
const modes=new Set(["weekly","biweekly","monthly","one_time"]);
const uuid=/^[a-zA-Z0-9_-]{3,128}$/;
export function createSyntheticBookingHarness({tenant_id,services,service_areas,addons=[],discounts={}}={}){
 if(!uuid.test(tenant_id||"")||!Array.isArray(services)||!services.length||!Array.isArray(service_areas)||!service_areas.length)
  throw Error("Synthetic tenant, services and service areas required");
 const cleanServices=services.map(s=>({name:text(s.name,120),mode:s.mode==="flat"?"flat":"quote",price:s.mode==="flat"?Number(s.price):null}));
 if(cleanServices.some(s=>!s.name||(s.mode==="flat"&&(!Number.isFinite(s.price)||s.price<=0))))throw Error("Invalid synthetic services");
 const cleanAddons=addons.map(a=>({name:text(a.name,120),price:Number(a.price)}));
 if(cleanAddons.some(a=>!a.name||!Number.isFinite(a.price)||a.price<0))throw Error("Invalid synthetic add-ons");
 const allowed=new Set(service_areas.map(x=>text(x,90).toLowerCase()).filter(Boolean));
 const requests=new Map();
 let sequence=0;
 function submit(payload={}){
  if(payload.tenant_id!==tenant_id)return {ok:false,status:403,error:"tenant_mismatch"};
  if(!modes.has(payload.frequency))return {ok:false,status:422,error:"invalid_frequency"};
  if(!allowed.has(text(payload.service_area,90).toLowerCase()))return {ok:false,status:422,error:"outside_service_area"};
  if(!text(payload.customer_name,140)||!text(payload.customer_email,180).includes("@"))return {ok:false,status:422,error:"customer_details_required"};
  if(payload.consent_to_contact!==true)return {ok:false,status:422,error:"contact_consent_required"};
  const service=cleanServices.find(x=>x.name===payload.service_name);
  if(!service)return {ok:false,status:422,error:"unknown_service"};
  const selected=Array.isArray(payload.addons)?payload.addons:[];
  if(new Set(selected).size!==selected.length)return {ok:false,status:422,error:"duplicate_addon"};
  const chosen=selected.map(name=>cleanAddons.find(a=>a.name===name));
  if(chosen.some(a=>!a))return {ok:false,status:422,error:"unknown_addon"};
  const discount=Number(discounts[payload.frequency]||0);
  if(!Number.isFinite(discount)||discount<0||discount>60)return {ok:false,status:422,error:"invalid_discount"};
  const subtotal=service.mode==="flat"?service.price+chosen.reduce((sum,a)=>sum+a.price,0):null;
  const estimate=subtotal===null?null:Math.round(subtotal*(100-discount))/100;
  const request={id:"synthetic-"+(++sequence),tenant_id,service_name:service.name,
   service_area:text(payload.service_area,90),frequency:payload.frequency,
   kind:service.mode==="flat"?"booking_request":"quote_request",
   estimate,confirmed:false,customer_notified:false,created_at:"SYNTHETIC"};
  requests.set(request.id,request);
  return {ok:true,status:201,request:{...request},sent_email:false,published:false};
 }
 return Object.freeze({
  synthetic_only:true,tenant_id,
  submit,
  list:(requestedTenant)=>requestedTenant===tenant_id?[...requests.values()].map(x=>({...x})):[]
 });
}
