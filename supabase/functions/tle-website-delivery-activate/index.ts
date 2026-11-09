import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SITE="https://thelaunchera.com";
const ALLOWED=new Set([SITE,"https://www.thelaunchera.com","https://command.thelaunchera.com"]);
const URL=Deno.env.get("SUPABASE_URL")||"";
const ANON=Deno.env.get("SUPABASE_ANON_KEY")||"";
const KEY=(()=>{let o={};try{o=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{}return (o as Record<string,string>).default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""})();
const CORS=(origin:string)=>({"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":ALLOWED.has(origin)?origin:SITE,"Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"authorization,content-type,apikey","Vary":"Origin","X-Content-Type-Options":"nosniff"});
const resp=(origin:string,status:number,v:object)=>new Response(JSON.stringify(v),{status,headers:CORS(origin)});
const authHeaders={"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json"};
async function db(path:string,init:RequestInit={}){return fetch(URL+"/rest/v1/"+path,{...init,headers:{...authHeaders,...(init.headers||{})}})}
async function parse(r:Response,label:string){const data=await r.json().catch(()=>null);if(!r.ok)throw Error(label+" "+r.status);return data}
async function admin(req:Request){
 const authorization=req.headers.get("authorization")||"";
 if(!authorization.startsWith("Bearer ")||authorization.length<25||!ANON)throw Error("Unauthorized");
 const user=await fetch(URL+"/auth/v1/user",{headers:{"apikey":ANON,authorization}});
 const session=await parse(user,"Authenticated session");
 const id=String(session?.id||"");
 if(!/^[0-9a-f-]{36}$/i.test(id))throw Error("Unauthorized");
 const rows=await parse(await db("platform_admins?user_id=eq."+encodeURIComponent(id)+"&select=user_id&limit=1"),"Owner authorization");
 if(!Array.isArray(rows)||rows.length!==1)throw Error("Unauthorized");
 return id;
}
function monthFrom(date:string){
 const d=new Date(date);
 if(!Number.isFinite(d.getTime()))throw Error("Invalid delivery date");
 const y=d.getUTCFullYear(),m=d.getUTCMonth(),day=d.getUTCDate();
 const last=new Date(Date.UTC(y,m+2,0)).getUTCDate();
 return new Date(Date.UTC(y,m+1,Math.min(day,last),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds())).toISOString();
}
function urlValid(raw:string){
 try{
  const u=new URL(raw);
  return u.protocol==="https:"&&u.hostname.includes(".")&&!u.username&&!u.password&&raw.length<=600;
 }catch{return false}
}
const FIELDS="id,stripe_session_id,package_slug,stripe_customer_email,stripe_customer_name,stripe_customer_id,stripe_payment_intent_id,business_name,project_stage,payment_status,intake_received_at,studio_intake_submission_id,created_at,delivered_at,delivered_url,first_month_ends_at,stripe_subscription_id,subscription_billing_status,billing_activation_claimed_at,billing_activation_error";

const HANDOFF_RESEND_KEY=Deno.env.get("TLE_CRM_RESEND_API_KEY")||"";
function mailEscape(v:string){return String(v||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function mailDate(v:string,es:boolean){
 if(!v||Number.isNaN(new Date(v).getTime()))return es?"Sin mensualidad":"No monthly charge";
 return new Intl.DateTimeFormat(es?"es-US":"en-US",{month:"long",day:"numeric",year:"numeric",timeZone:"America/New_York"}).format(new Date(v));
}
async function sendWebsiteDeliveryReceipt(p:any,language:string){
 const es=language==="es",isMonthly=p.package_slug==="website-ai-crm",recipient=String(p.stripe_customer_email||"").trim().toLowerCase();
 const website=String(p.delivered_url||"").trim();
 if(!HANDOFF_RESEND_KEY||!(/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(recipient))||!urlValid(website))return {email_dispatched:false,email_warning:"Delivery email requires manual review"};
 const title=es?"Tu website está listo.":"Your website is ready.";
 const button=es?"Abrir mi website terminado":"Open my completed website";
 const isPlus=p.package_slug==="website-plus";
 const pack=es?(isMonthly?"Website + IA + CRM":isPlus?"Website + Command Center avanzado":"Website para tu negocio"):(isMonthly?"Website + AI + CRM":isPlus?"Website + Advanced Command Center":"Website for Your Business");
 const delivered=mailDate(String(p.delivered_at||""),es),first=mailDate(String(p.first_month_ends_at||""),es);
 const billing=isMonthly?(es?"Los $8 mensuales comienzan cuando termina el primer mes de servicio, contado desde la fecha de entrega.":"$8 monthly billing begins after the first service month, counted from the completed project's delivery date."):(es?(isPlus?"El paquete avanzado tiene un pago único de $25, sin mensualidad.":"El paquete básico tiene un pago único de $15, sin mensualidad."):(isPlus?"The advanced $25 website is a one-time purchase with no monthly fee.":"The basic $15 website is a one-time purchase, with no monthly fee."));
 const firstLabel=isMonthly?(es?"Primer cargo mensual previsto: ":"Expected first monthly charge: ")+first:"";
 const url=mailEscape(website);
 const legalUrls=es?[
  ["https://thelaunchera.com/es/privacy.html","Privacidad"],["https://thelaunchera.com/es/terms.html","Términos"],["https://thelaunchera.com/es/refunds.html","Reembolsos"],["https://thelaunchera.com/es/cookies.html","Cookies"],["https://thelaunchera.com/es/privacy-choices.html","Tus datos"]
 ]:[
  ["https://thelaunchera.com/privacy.html","Privacy"],["https://thelaunchera.com/terms.html","Terms"],["https://thelaunchera.com/refunds.html","Refunds"],["https://thelaunchera.com/cookies.html","Cookies"],["https://thelaunchera.com/privacy-choices.html","Your data"]
 ];
 const legalHtml='<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;color:#647481;margin:0 0 12px">'+legalUrls.map(([href,label])=>'<a href="'+href+'" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;color:#47657b;text-decoration:underline">'+mailEscape(label)+'</a>').join(' &nbsp;·&nbsp; ')+'</p>';
 const legalText=legalUrls.map(([href,label])=>label+': '+href).join('\\n');
 const html='<!doctype html><html lang="'+(es?"es":"en")+'"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body style="margin:0;background-color:#FAF8F3;font-family:Arial,Helvetica,sans-serif"><table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#FAF8F3"><tr><td align="center" style="padding:28px 14px"><table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFEFA" style="max-width:560px;border:1px solid #DAE3E7;border-radius:17px"><tr><td height="6" bgcolor="#F2D85B" style="background-color:#F2D85B;font-size:1px;line-height:1px">&nbsp;</td></tr><tr><td style="padding:29px 26px 12px"><p style="font:700 11px/18px Arial,Helvetica,sans-serif;letter-spacing:2px;color:#486f85;margin:0 0 19px">THE LAUNCH ERA · DELIVERY</p><h1 style="font:400 36px/43px Georgia,serif;color:#191919;margin:0 0 17px">'+title+'</h1><p style="font:400 15px/25px Arial,Helvetica,sans-serif;color:#52606a;margin:0 0 15px">'+(es?"Tu proyecto terminado ya está entregado. Aquí tienes tu enlace final.":"Your completed website has been delivered. Here is your final link.")+'</p></td></tr><tr><td style="padding:0 26px 18px"><table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#EAF3F8"><tr><td bgcolor="#EAF3F8" style="padding:18px;background-color:#EAF3F8"><p style="font:700 14px/22px Arial,Helvetica,sans-serif;color:#324e60;margin:0 0 7px">'+mailEscape(pack)+'</p><p style="font:400 13px/22px Arial,Helvetica,sans-serif;color:#425765;margin:0 0 10px">'+(es?"Entregado: ":"Delivered: ")+mailEscape(delivered)+'</p><p style="font:400 13px/22px Arial,Helvetica,sans-serif;color:#425765;margin:0 0 8px">'+mailEscape(firstLabel)+'</p><p style="font:400 13px/22px Arial,Helvetica,sans-serif;overflow-wrap:anywhere;color:#456a83;margin:0"><a href="'+url+'" style="color:#456a83;text-decoration:underline">'+url+'</a></p></td></tr></table></td></tr><tr><td style="padding:0 26px 23px"><table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td bgcolor="#191919" align="center" style="background-color:#191919;border-radius:10px;padding:16px"><a href="'+url+'" style="display:block;color:#FFFEFA;text-decoration:none;font:700 15px/22px Arial,Helvetica,sans-serif">'+button+'</a></td></tr></table><p style="font:400 12px/21px Arial,Helvetica,sans-serif;color:#667783;margin:17px 0 0">'+billing+'</p></td></tr><tr><td style="padding:17px 26px 24px;border-top:1px solid #DCE5E8"><p style="font:400 12px/20px Arial,Helvetica,sans-serif;color:#647481;margin:0 0 10px">'+(es?"¿Necesitas ayuda? Responde a este correo.":"Need help? Reply to this email.")+'</p>'+legalHtml+'<p style="font:400 11px/19px Arial,Helvetica,sans-serif;color:#7A898F;margin:0">Powered by <a href="https://thelaunchera.com/" style="color:#40647c">The Launch Era</a></p></td></tr></table></td></tr></table></body></html>';
 const plain=[title,pack,website,(es?"Entregado: ":"Delivered: ")+delivered,firstLabel,billing,es?"Responde a este correo si necesitas ayuda.":"Reply to this email if you need help.",legalText,"Powered by The Launch Era"].filter(Boolean).join("\n\n");
 try{
  const out=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+HANDOFF_RESEND_KEY,"Content-Type":"application/json","Idempotency-Key":"tle-web-delivery-"+String(p.id).slice(0,60)},body:JSON.stringify({from:"The Launch Era <hello@thelaunchera.com>",reply_to:"hello@thelaunchera.com",to:[recipient],subject:es?"Tu website está listo · The Launch Era":"Your website is ready · The Launch Era",text:plain,html}),signal:AbortSignal.timeout(8000)});
  const data=await out.json().catch(()=>null);
  if(!out.ok||!data?.id)throw Error("Resend provider rejected receipt "+out.status);
  return {email_dispatched:true};
 }catch(e){console.error("Handoff receipt needs review",String(e).slice(0,95));return {email_dispatched:false,email_warning:"Delivery email could not be confirmed. Contact buyer manually."}}
}
async function websiteOpsAlert(id:string,issue:string){
 if(!HANDOFF_RESEND_KEY)return;
 try{await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+HANDOFF_RESEND_KEY,"Content-Type":"application/json","Idempotency-Key":"tle-web-ops-"+String(id).slice(0,60)+"-"+issue},body:JSON.stringify({from:"The Launch Era <hello@thelaunchera.com>",to:["hello@thelaunchera.com"],subject:"Website operations alert — "+issue,text:"A website requires attention.\nProject reference: "+String(id).slice(0,60)+"\nIssue: "+issue+"\nReview privately: https://thelaunchera.com/website-delivery-admin/\nVerify project status before retrying."}),signal:AbortSignal.timeout(6000)});}
 catch(e){console.error("Operations alert unavailable",String(e).slice(0,75))}
}

Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:ALLOWED.has(origin)?204:403,headers:CORS(origin)});
 if(req.method!=="POST")return resp(origin,405,{ok:false});
 if(!ALLOWED.has(origin)||!KEY||!URL||!ANON)return resp(origin,403,{ok:false});
 try{await admin(req)}catch{return resp(origin,403,{ok:false,error:"Owner login required"})}
 try{
  const raw=await req.text();if(raw.length>5000)return resp(origin,413,{ok:false});
  let b:any;try{b=JSON.parse(raw)}catch{return resp(origin,400,{ok:false})}
  if(b?.action==="list"){
    const rows=await parse(await db("tle_website_projects?select="+FIELDS+"&order=created_at.desc&limit=100"),"Website orders");
    return resp(origin,200,{ok:true,projects:rows||[]});
  }
  if(b?.action!=="confirm_delivery"||b?.confirmed_delivered!==true)return resp(origin,400,{ok:false,error:"Delivery confirmation required"});
  const id=String(b.project_id||"");
  const live=String(b.delivered_url||"").trim();
  if(!/^[0-9a-f-]{36}$/i.test(id)||!urlValid(live))return resp(origin,400,{ok:false,error:"A valid HTTPS project URL is required"});
  const rows=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&select="+FIELDS+"&limit=1"),"Project");
  const row=Array.isArray(rows)?rows[0]:null;
  if(!row||!["website-basic","website-plus","website-ai-crm"].includes(row.package_slug))return resp(origin,404,{ok:false});
  if(row.payment_status!=="paid"||!/^cs_live_[A-Za-z0-9]+$/.test(String(row.stripe_session_id||"")))return resp(origin,409,{ok:false,error:"A verified LIVE paid order is required"});
  if(!row.intake_received_at||!row.studio_intake_submission_id)return resp(origin,409,{ok:false,error:"Customer intake must be completed before delivery"});
  if(row.delivered_at&&row.delivered_url&&row.delivered_url!==live)return resp(origin,409,{ok:false,error:"Delivery URL has already been recorded; contact support to amend"});
  if(row.package_slug==="website-basic"||row.package_slug==="website-plus"){
    if(row.delivered_at)return resp(origin,200,{ok:true,already_delivered:true,delivered_at:row.delivered_at});
    const changed=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&delivered_at=is.null",{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({project_stage:"delivered",delivered_at:new Date().toISOString(),delivered_url:live,subscription_billing_status:"not_applicable",updated_at:new Date().toISOString()})}),"Basic project delivery");
    if(!Array.isArray(changed)||changed.length!==1)return resp(origin,409,{ok:false,error:"Concurrent delivery update"});
    const receipt=await sendWebsiteDeliveryReceipt(changed[0],b.lang==="es"?"es":"en");
    if(!receipt.email_dispatched)await websiteOpsAlert(id,"delivery_email");
    return resp(origin,200,{ok:true,delivered_at:changed[0].delivered_at,subscription:"not_applicable",...receipt});
  }
  if(row.stripe_subscription_id)return resp(origin,200,{ok:true,already_activated:true,subscription_id:row.stripe_subscription_id,delivered_at:row.delivered_at,first_month_ends_at:row.first_month_ends_at});
  if(!/^cus_[A-Za-z0-9]+$/.test(String(row.stripe_customer_id||""))||!/^pi_[A-Za-z0-9]+$/.test(String(row.stripe_payment_intent_id||"")))return resp(origin,409,{ok:false,error:"Saved customer/payment authorization is missing"});
  const time=new Date().toISOString(),stale=new Date(Date.now()-15*60*1000).toISOString();
  if(!row.delivered_at){
    await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&delivered_at=is.null",{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({delivered_at:time,delivered_url:live,first_month_ends_at:monthFrom(time),project_stage:"delivery_confirmed_pending_billing",updated_at:time})}),"Delivery timestamp");
  }
  const updated=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&select="+FIELDS+"&limit=1"),"Current delivery");
  const state=updated[0];
  if(state.stripe_subscription_id)return resp(origin,200,{ok:true,already_activated:true,subscription_id:state.stripe_subscription_id});
  const end=String(state.first_month_ends_at||"");
  const trialEnd=Math.floor(new Date(end).getTime()/1000);
  if(!Number.isFinite(trialEnd)||trialEnd<Math.floor(Date.now()/1000)+86400||trialEnd>Math.floor(Date.now()/1000)+35*86400)return resp(origin,409,{ok:false,error:"Delivery date requires manual billing review"});
  const claim=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&stripe_subscription_id=is.null&or=(billing_activation_claimed_at.is.null,billing_activation_claimed_at.lt."+encodeURIComponent(stale)+")",{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({billing_activation_claimed_at:new Date().toISOString(),billing_activation_error:null})}),"Activation lock");
  if(!Array.isArray(claim)||claim.length===0)return resp(origin,409,{ok:false,error:"Activation already in progress"});
  let subscribed=false;
  try{
    const route=await parse(await db("tle_private_payment_hooks?kind=eq.website_delivery_activation&select=endpoint"),"Private payment route");
    const endpoint=route?.[0]?.endpoint;
    if(typeof endpoint!=="string"||!endpoint.startsWith("https://hook.us2.make.com/"))throw Error("Billing route unavailable");
    const result=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event_type:"website-delivery-activate",session_id:state.stripe_session_id,plan_price_id:"price_1UYoJ2CnlGzKRSIMEL4AfPB1",trial_end:trialEnd,delivered_at:state.delivered_at,is_test:false}),signal:AbortSignal.timeout(20000)});
    const output=await result.json().catch(()=>null);
    if(!result.ok||output?.ok!==true||!/^sub_[A-Za-z0-9]+$/.test(String(output.subscription_id||""))||output.customer!==state.stripe_customer_id||Number(output.trial_end)!==trialEnd||String(output.livemode)!=="true")throw Error("Stripe activation was not verified");
    const store=await parse(await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&stripe_subscription_id=is.null",{method:"PATCH",headers:{"Prefer":"return=representation"},body:JSON.stringify({stripe_subscription_id:output.subscription_id,project_stage:"delivered",subscription_started_at:new Date().toISOString(),subscription_billing_status:String(output.status||"trialing"),billing_activation_claimed_at:null,billing_activation_error:null,updated_at:new Date().toISOString()})}),"Save Stripe subscription");
    if(!Array.isArray(store)||store.length!==1)throw Error("Subscription created but project update failed");
    subscribed=true;
    const receipt=await sendWebsiteDeliveryReceipt(store[0],b.lang==="es"?"es":"en");
    if(!receipt.email_dispatched)await websiteOpsAlert(id,"delivery_email");
    return resp(origin,200,{ok:true,subscription_id:output.subscription_id,delivered_at:state.delivered_at,first_month_ends_at:state.first_month_ends_at,...receipt});
  }catch(e){
    const problem=String(e).slice(0,150);
    await db("tle_website_projects?id=eq."+encodeURIComponent(id)+"&stripe_subscription_id=is.null",{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({billing_activation_claimed_at:null,billing_activation_error:"Delivery activation needs review; retry idempotently",updated_at:new Date().toISOString()})}).catch(()=>{});
    console.error("website delivery activation",problem);
    await websiteOpsAlert(id,"billing_activation");
    return resp(origin,503,{ok:false,error:"Billing activation is awaiting verification. No duplicate should be created; retry or contact support."});
  }
 }catch(e){console.error("website admin delivery",String(e).slice(0,120));return resp(origin,503,{ok:false,error:"Unable to complete this request"})}
});