import "jsr:@supabase/functions-js/edge-runtime.d.ts";
/**
 * STAGING PROJECT ONLY. Real HTTP -> Supabase QA database.
 * All requests are synthetic, scoped to the verified staging auth user's ID.
 * No production account, booking, payment, email or publication integrations.
 */
const BASE=Deno.env.get("SUPABASE_URL")||"";
const SR=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const ANON=Deno.env.get("SUPABASE_ANON_KEY")||"";
const PROJECT="afyiltvdfqnuyzcqsnoh";
const allowedOrigins=new Set(["http://localhost:4173","http://127.0.0.1:4173","https://command.thelaunchera.com"]);
const modes=new Set(["one_time","weekly","biweekly","monthly"]);
const services=new Map([["Standard Cleaning",{kind:"booking_request",price:120}],["Move-Out Cleaning",{kind:"quote_request",price:null}]]);
const addons=new Map([["Oven",20],["Refrigerator",15]]);
const areas=new Set(["Miami","Miami Beach"]);
const discounts={one_time:0,weekly:10,biweekly:5,monthly:0};
const response=(data,status,origin)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"null","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"}});
const clean=(v,max=150)=>typeof v==="string"?v.trim().slice(0,max):"";
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"null","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"}});
 if(req.method!=="POST")return response({error:"method_not_allowed"},405,origin);
 if(origin&&!allowedOrigins.has(origin))return response({error:"origin_not_allowed"},403,origin);
 if(!BASE.includes(PROJECT)||!SR||!ANON)return response({error:"staging_configuration_required"},503,origin);
 const bearer=req.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return response({error:"staging_sign_in_required"},401,origin);
 try{
  const userResponse=await fetch(BASE+"/auth/v1/user",{headers:{apikey:ANON,authorization:bearer},signal:AbortSignal.timeout(7000)});
  if(!userResponse.ok)return response({error:"staging_sign_in_required"},401,origin);
  const user=await userResponse.json();
  if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(user?.id||""))return response({error:"invalid_staging_identity"},401,origin);
  if(user?.email?.toLowerCase()!=="hello@thelaunchera.com"||!user?.email_confirmed_at)return response({error:"authorized_testing_account_required"},403,origin);
  const body=await req.json();
  if(body?.action==="list"){
   const url=BASE+"/rest/v1/tle_booking_studio_staging_requests?tenant_id=eq."+encodeURIComponent(user.id)+"&select=id,tenant_id,kind,service_name,service_area,frequency,estimated_total,consent_to_contact,confirmed,customer_notified,synthetic_only,created_at&order=created_at.desc&limit=20";
   const read=await fetch(url,{headers:{apikey:SR,authorization:"Bearer "+SR},signal:AbortSignal.timeout(7000)});
   if(!read.ok)return response({error:"staging_database_unavailable"},503,origin);
   const rows=await read.json();
   return response({ok:true,synthetic_only:true,tenant_id:user.id,requests:rows},200,origin);
  }
  if(body?.action!=="submit")return response({error:"unknown_action"},400,origin);
  if(body?.tenant_id!==undefined&&body.tenant_id!==user.id)return response({error:"tenant_mismatch"},403,origin);
  const service=services.get(clean(body.service_name,100)),area=clean(body.service_area,90),frequency=clean(body.frequency,30);
  if(!service||!areas.has(area)||!modes.has(frequency))return response({error:"invalid_synthetic_booking_details"},422,origin);
  if(body.consent_to_contact!==true)return response({error:"contact_consent_required"},422,origin);
  if(!Array.isArray(body.addons)||body.addons.length>5||new Set(body.addons).size!==body.addons.length||body.addons.some(x=>!addons.has(x)))return response({error:"invalid_addons"},422,origin);
  const sum=service.price===null?null:service.price+body.addons.reduce((n,x)=>n+addons.get(x),0);
  const total=sum===null?null:Math.round(sum*(100-discounts[frequency]))/100;
  const record={tenant_id:user.id,kind:service.kind,service_name:clean(body.service_name,100),service_area:area,frequency,estimated_total:total,consent_to_contact:true,confirmed:false,customer_notified:false,synthetic_only:true};
  const saved=await fetch(BASE+"/rest/v1/tle_booking_studio_staging_requests",{method:"POST",headers:{apikey:SR,authorization:"Bearer "+SR,"Content-Type":"application/json","Prefer":"return=representation"},body:JSON.stringify(record),signal:AbortSignal.timeout(7000)});
  if(!saved.ok)return response({error:"staging_database_unavailable"},503,origin);
  const rows=await saved.json();
  return response({ok:true,synthetic_only:true,customer_notified:false,published:false,request:rows[0]},201,origin);
 }catch{return response({error:"staging_request_failed"},500,origin)}
});
