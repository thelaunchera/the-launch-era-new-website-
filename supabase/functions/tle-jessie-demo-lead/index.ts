import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.0";

const BASE=Deno.env.get("SUPABASE_URL")||"";
const SR=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const RESEND=Deno.env.get("TLE_CRM_RESEND_API_KEY")||"";
const WORKSPACE="c0b24907-3a17-4273-b00c-70efbba314c4"; // Existing internal TLE workspace, same as tle-crm-interest.
const ALLOWED=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","https://thelaunchera.github.io"]);
const clean=(v:unknown,n:number)=>String(v??"").replace(/[\u0000-\u001f\u007f<>]/g," ").trim().slice(0,n);
const escapeHtml=(v:string)=>v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const json=(o:unknown,status:number,origin:string)=>new Response(JSON.stringify(o),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin","Access-Control-Allow-Origin":ALLOWED.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, OPTIONS"}});
const SERVICE:Record<string,{name:string,code:string,url:string}>={
 booking:{name:"Booking Automation",code:"booking-automation",url:"https://thelaunchera.com/lead-private-preview.html"},
 "cleaning-app":{name:"Cleaning App",code:"cleaning-app",url:"https://thelaunchera.com/cleaning-app-demo/"},
 "ai-booking":{name:"AI Assistants",code:"ai-assistant",url:"https://thelaunchera.com/ai-booking-assistant/"},
 "ai-followup":{name:"AI Assistants",code:"ai-assistant",url:"https://thelaunchera.com/ai-booking-assistant/"},
 "ai-business":{name:"AI Assistants",code:"ai-assistant",url:"https://thelaunchera.com/ai-booking-assistant/"},
 website:{name:"Website Automation",code:"booking-automation",url:"https://thelaunchera.com/website-automation"},
 va:{name:"VA Support",code:"booking-automation",url:"https://thelaunchera.com/virtual-assistant"}
};
function emailHtml(business:string,area:string,svc:{name:string,url:string},interest:string,lang:string){
 const es=lang==="es";
 const title=es?"Tu demo de The Launch Era":"Your The Launch Era demo";
 const expl=es?"Gracias por solicitar una demostración. Aquí tienes una vista de ejemplo de nuestro sistema. No crea reservas reales.":"Thanks for requesting a demo! You can explore our sample experience below. This doesn't create real bookings.";
 const interestLabel="I'm Interested";
 const areaLine=es?"Área de servicio":"Service area";
 return '<div style="background:#faf8f3;padding:27px 16px;font:15px/1.65 Arial,sans-serif;color:#191919"><div style="max-width:580px;margin:auto;background:#fff;border:1px solid #d7e5ee;border-radius:20px;padding:28px"><div style="font-weight:800;letter-spacing:.14em;font-size:12px">THE LAUNCH ERA</div><h1 style="font-size:28px;margin:24px 0 10px">'+title+'</h1><p>'+escapeHtml(business)+' · '+areaLine+': '+escapeHtml(area)+'</p><p>'+expl+'</p><a href="'+svc.url+'" style="display:inline-block;background:#d8edfc;color:#173a54;padding:13px 21px;border-radius:12px;text-decoration:none;font-weight:800;margin:8px 0 14px">'+(es?"View the Demo":"View the Demo")+'</a><p style="color:#52697b;font-size:13px">'+(es?"¿Quieres que hablemos de cómo aplicarlo a tu negocio?":"Interested in exploring a setup for your business?")+'</p><a href="'+interest+'" style="display:inline-block;background:#191919;color:#fff;padding:13px 23px;border-radius:12px;text-decoration:none;font-weight:800">'+interestLabel+'</a><p style="font-size:12px;color:#687783;margin-top:22px">'+(es?"Ese botón abre una pantalla de confirmación. No te suscribe automáticamente a campañas.":"The interest button opens a confirmation page. It does not automatically subscribe you to campaigns.")+'</p></div></div>';
}
async function rateLimit(req:Request,email:string){
 if(!BASE||!SR)return false;
 const raw=clean(req.headers.get("cf-connecting-ip")||req.headers.get("x-forwarded-for")||"anonymous",100)+"|"+email;
 const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(raw));
 const hashed=[...new Uint8Array(buf)].map(n=>n.toString(16).padStart(2,"0")).join("");
 const start=new Date();start.setUTCHours(0,0,0,0);
 const res=await fetch(BASE+"/rest/v1/rpc/tle_ai_demo_consume",{method:"POST",headers:{apikey:SR,Authorization:"Bearer "+SR,"Content-Type":"application/json"},body:JSON.stringify({p_key:"jessie-demo-request:"+hashed,p_window:start.toISOString(),p_limit:3}),signal:AbortSignal.timeout(4000)});
 return res.ok&&(await res.json())===true;
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return json({},204,origin);
 if(req.method!=="POST")return json({error:"Method not allowed"},405,origin);
 if(!ALLOWED.has(origin))return json({error:"Not allowed"},403,origin);
 if(Number(req.headers.get("content-length")||0)>2000)return json({error:"Too large"},413,origin);
 const data=await req.json().catch(()=>null);
 if(!data||typeof data!=="object")return json({error:"Invalid request"},400,origin);
 const business=clean(data.business_name,100),email=clean(data.email,200).toLowerCase();
 const area=clean(data.service_area,100),service=SERVICE[clean(data.service,40)]||SERVICE.booking,lang=data.language==="es"?"es":"en";
 if(!business||!area||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||data.consent!==true||clean(data.website,150))return json({error:"Business, email, service area and explicit consent are required"},400,origin);
 if(!BASE||!SR)return json({error:"Temporarily unavailable"},503,origin);
 try{if(!await rateLimit(req,email))return json({error:"Too many requests; please try again later"},429,origin);}catch{return json({error:"Please try again later"},503,origin);}
 const db=createClient(BASE,SR,{auth:{persistSession:false,autoRefreshToken:false}});
 // Preserve existing lead and opt-out choices. Never create two CRM rows for the same email.
 const {data:existing,error:lookError}=await db.from("tle_crm_leads").select("id,email_consent_status,archived_at,contact_decision,source").eq("workspace_id",WORKSPACE).ilike("email",email).order("created_at",{ascending:false}).limit(1);
 if(lookError)return json({error:"Could not check existing request"},503,origin);
 const previous=existing?.[0];
 if(previous&&(previous.email_consent_status==="withdrawn"||previous.archived_at||previous.contact_decision==="no"))return json({error:"This email cannot receive a new invitation. Please contact support."},409,origin);
 let leadId=String(previous?.id||"");
 if(!leadId){
  const {data:created,error:insertError}=await db.from("tle_crm_leads").insert({
   workspace_id:WORKSPACE,business,contact:business,email,language:lang,stage:"New",
   source:"jessie_demo",service_fit:service.name,notes:"Visitor-requested Jessie demo. Service area: "+area+". Transactional demo requested with explicit consent; not a marketing subscription.",
   email_consent_status:"unknown",email_followup_enabled:false,contact_decision:"review"
  }).select("id").single();
  if(insertError||!created?.id)return json({error:"Could not save the request"},503,origin);
  leadId=created.id;
 }
 const {count:sent,error:sentQueryError}=await db.from("tle_crm_email_events").select("id",{count:"exact",head:true}).eq("workspace_id",WORKSPACE).eq("lead_id",leadId).eq("event_type","jessie_demo_sent");
 if(sentQueryError)return json({error:"Request saved, but email status is unavailable",saved:true,email_sent:false},503,origin);
 if(sent)return json({ok:true,email_sent:false,duplicate:true,service:service.name});
 const interest="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-crm-interest?lead="+encodeURIComponent(leadId)+"&service="+encodeURIComponent(service.code);
 if(!RESEND)return json({ok:true,saved:true,email_sent:false,service:service.name});
 const message={
  from:"The Launch Era <hello@thelaunchera.com>",
  to:[email],subject:(lang==="es"?"Tu demo para ":"Your demo for ")+business+" — The Launch Era",
  html:emailHtml(business,area,service,interest,lang),
  text:"The Launch Era\n\nDemo for "+business+" · Service area: "+area+"\n\nExplore: "+service.url+"\n\nI'm Interested: "+interest+"\n\nThe interest link requires a second confirmation. No marketing subscription is added by requesting this demo."
 };
 let accepted=false;
 try{
  const result=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+RESEND,"Content-Type":"application/json","Idempotency-Key":"tle-jessie-demo-"+leadId},body:JSON.stringify(message),signal:AbortSignal.timeout(9500)});
  const payload=await result.json().catch(()=>({}));
  accepted=result.ok&&typeof payload.id==="string"&&payload.id.length>4;
 }catch{}
 if(!accepted)return json({ok:true,saved:true,email_sent:false,service:service.name});
 const {error:eventError}=await db.from("tle_crm_email_events").insert([
  {workspace_id:WORKSPACE,lead_id:leadId,event_type:"email_sent",details:"Visitor consented to one demo email from Jessie; no recurring marketing consent"},
  {workspace_id:WORKSPACE,lead_id:leadId,event_type:"jessie_demo_sent",details:"Opt-in demo sent; service "+service.name}
 ]);
 if(eventError)return json({ok:true,saved:true,email_sent:true,service:service.name,event_pending_review:true});
 // Notify the owner in the already-existing Command Center; do not send additional emails.
 await db.from("tle_crm_notifications").insert({workspace_id:WORKSPACE,kind:"new_lead",title:"Jessie demo requested",body:business+" · "+service.name+" · "+area,source_key:"jessie-demo-"+leadId}).catch(()=>null);
 return json({ok:true,saved:true,email_sent:true,service:service.name});
});
