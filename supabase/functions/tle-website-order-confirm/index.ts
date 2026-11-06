import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const MAKE_HOOK="https://hook.us2.make.com/vmku733oldcldive8qixgqn59yuzvpmx";
const ORIGINS=new Set(["https://thelaunchera.com","https://www.thelaunchera.com"]);
const KEY=(()=>{let v={};try{v=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{}return (v as Record<string,string>).default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""})();
const URL=Deno.env.get("SUPABASE_URL")||"";
const AMOUNTS:Record<string,number>={"website-basic":1500,"website-ai-crm":2500};
const isSession=(s:string)=>/^cs_live_[A-Za-z0-9]+$/.test(s);
function headers(origin:string){return {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Vary":"Origin","Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"content-type"}}
function send(origin:string,status:number,data:object){return new Response(JSON.stringify(data),{status,headers:headers(origin)})}

async function sendVerifiedPurchaseEmail(email:string,offer:string,session:string,lang:string,legacyAdvanced=false){
 if(!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)||!/^cs_live_[A-Za-z0-9]+$/.test(session))return;
 const url=URL+"/rest/v1/";
 const common={"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json"};
 const encoded=encodeURIComponent(session);
 const timestamp=new Date().toISOString();
 const cutoff=encodeURIComponent(new Date(Date.now()-15*60*1000).toISOString());
 const filter="tle_website_projects?stripe_session_id=eq."+encoded+"&payment_status=eq.paid&confirmation_email_sent_at=is.null&or=(confirmation_email_claimed_at.is.null,confirmation_email_claimed_at.lt."+cutoff+")&select=id";
 let claimed=false;
 try{
  const claim=await fetch(url+filter,{method:"PATCH",headers:{...common,"Prefer":"return=representation"},body:JSON.stringify({confirmation_email_claimed_at:timestamp})});
  if(!claim.ok){console.error("website email claim rejected",claim.status);return}
  const rows=await claim.json().catch(()=>[]);
  if(!Array.isArray(rows)||rows.length===0)return;
  claimed=true;
  const route=await fetch(url+"tle_private_mail_hooks?kind=eq.website_paid&select=endpoint",{headers:common});
  const routes=route.ok?await route.json().catch(()=>[]):[];
  const endpoint=Array.isArray(routes)?routes[0]?.endpoint:"";
  if(!endpoint)throw Error("website email route unavailable");
  const isEs=lang==="es",isBasic=offer==="website-basic";
  const plan_name=isEs?(isBasic?"Website para tu negocio · $15":"Website + asistente IA + CRM · $25 iniciales"):(isBasic?"Website for Your Business · $15":"Website + AI Assistant + CRM · $25 setup");
  const billing_note=isEs?(isBasic?"Pago único de $15. Este paquete no incluye una suscripción mensual.":(legacyAdvanced?"Pagaste $25 inicialmente. Tu plan anterior de $8/mes conserva su fecha de facturación de Stripe.":"Pagaste $25 por la configuración inicial. Tu primer mes de servicio empieza cuando recibes el proyecto terminado; los $8 mensuales se facturan al terminar ese primer mes, desde la fecha de entrega.")):(isBasic?"$15 one-time payment. This package does not include a monthly subscription.":(legacyAdvanced?"Your existing $8/month plan follows the billing date shown in your original Stripe checkout.":"You paid $25 for initial setup. Your first month of service starts when your completed project is delivered; $8/month billing begins when that first month ends, measured from delivery."));
  const base=isBasic?"https://thelaunchera.com/intake/website/":"https://thelaunchera.com/intake/website-ai-crm/";
  const intake_url=base+"?"+new URLSearchParams({stage:"onboarding",lang:isEs?"es":"en",session_id:session}).toString();
  let sent=false;
  try{
   const request=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event_type:"website_paid",email,language:isEs?"es":"en",template_id:isEs?"64c552e7-4f20-4cf9-b1c2-cc2c740497eb":"2bfbe412-7477-4266-94a4-958228dac38e",offer,session_id:session,subject:isEs?"Tu proyecto web está confirmado · The Launch Era":"Your website project is confirmed · The Launch Era",event_key:"website-"+session,plan_name,billing_note,intake_url,is_test:false}),signal:AbortSignal.timeout(9500)});
   const body=await request.json().catch(()=>({}));
   sent=request.ok&&body.ok===true&&typeof body.resend_id==="string"&&!!body.resend_id;
  }catch(e){console.error("website email send failed",String(e).slice(0,90))}
  const update=await fetch(url+"tle_website_projects?stripe_session_id=eq."+encoded+"&confirmation_email_sent_at=is.null",{method:"PATCH",headers:{...common,"Prefer":"return=minimal"},body:JSON.stringify(sent?{confirmation_email_sent_at:new Date().toISOString(),confirmation_email_claimed_at:null}:{confirmation_email_claimed_at:null})});
  if(!update.ok)console.error("website email marker failed",update.status);
 }catch(e){
  console.error("website email optional delivery",String(e).slice(0,90));
  if(claimed)await fetch(url+"tle_website_projects?stripe_session_id=eq."+encoded+"&confirmation_email_sent_at=is.null",{method:"PATCH",headers:{...common,"Prefer":"return=minimal"},body:JSON.stringify({confirmation_email_claimed_at:null})}).catch(()=>{});
 }
}

Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return send(origin,405,{ok:false,error:"Method not allowed"});
 if(origin&&!ORIGINS.has(origin))return send(origin,403,{ok:false,error:"Origin denied"});
 if(!URL||!KEY)return send(origin,503,{ok:false,error:"Verification unavailable"});
 try{
  const b=await req.json().catch(()=>({}));
  const session_id=String(b.session_id||""),offer=String(b.offer||"");
  if(!isSession(session_id)||!(offer in AMOUNTS))return send(origin,400,{ok:false,error:"Invalid purchase reference"});
  const response=await fetch(MAKE_HOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({offer:"website-order-verify",session_id})});
  if(!response.ok)return send(origin,503,{ok:false,error:"Checkout verification unavailable"});
  const paid=await response.json().catch(()=>null);
  const legacyAdvanced=offer==="website-ai-crm"&&String(paid.mode)==="subscription"&&/^sub_[A-Za-z0-9]+$/.test(String(paid.subscription||""));
  const deferredAdvanced=offer==="website-ai-crm"&&String(paid.mode)==="payment"&&String(paid.payment_model)==="setup_now_bill_after_delivery_month"&&String(paid.recurring_billing_starts)==="one_month_after_confirmed_delivery"&&/^cus_[A-Za-z0-9]+$/.test(String(paid.customer||""))&&/^pi_[A-Za-z0-9]+$/.test(String(paid.payment_intent||""));
  if(!paid||String(paid.session_id)!==session_id||String(paid.offer)!==offer||
    String(paid.tle_flow)!=="website_packages_20261105"||
    String(paid.payment_status)!=="paid"||String(paid.status)!=="complete"||
    (offer==="website-basic"?String(paid.mode)!=="payment":!(legacyAdvanced||deferredAdvanced))||
    String(paid.livemode)!=="true"||String(paid.currency).toLowerCase()!=="usd"||
    !(Number(paid.amount_total)===AMOUNTS[offer]||(legacyAdvanced&&Number(paid.amount_total)===3300&&Number(paid.created)>0&&Number(paid.created)<1793929781)))return send(origin,403,{ok:false,error:"Payment not confirmed"});
  const email=String(paid.email||"").trim().toLowerCase().slice(0,254);
  const name=String(paid.name||"").trim().slice(0,150);
  const record={stripe_session_id:session_id,package_slug:offer,amount_cents:Number(paid.amount_total),
    currency:"usd",stripe_customer_email:email||null,stripe_customer_name:name||null,
    payment_status:"paid",project_stage:"paid_awaiting_intake",one_time_setup_cents:offer==="website-basic"?1500:2500,monthly_subscription_cents:offer==="website-ai-crm"?800:0,stripe_subscription_id:legacyAdvanced?String(paid.subscription):null,stripe_customer_id:/^cus_[A-Za-z0-9]+$/.test(String(paid.customer||""))?String(paid.customer):null,stripe_payment_intent_id:/^pi_[A-Za-z0-9]+$/.test(String(paid.payment_intent||""))?String(paid.payment_intent):null,subscription_billing_status:deferredAdvanced?"awaiting_delivery":legacyAdvanced?"trialing":null};
  const r=await fetch(URL+"/rest/v1/tle_website_projects?on_conflict=stripe_session_id",{
    method:"POST",headers:{"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json",
    "Prefer":"resolution=ignore-duplicates,return=minimal"},body:JSON.stringify(record)});
  if(!r.ok){console.error("project create failed",r.status);return send(origin,503,{ok:false,error:"Project registration unavailable"})}
  // Email dispatch is optional: never block a verified paid customer or project intake when Resend is unavailable.
  await sendVerifiedPurchaseEmail(email,offer,session_id,String(b.lang)==="es"?"es":"en",legacyAdvanced);
  return send(origin,200,{ok:true,paid:true,offer,amount_cents:Number(paid.amount_total)});
 }catch(e){console.error("website order confirm",String(e).slice(0,90));return send(origin,503,{ok:false,error:"Checkout verification unavailable"})}
});
