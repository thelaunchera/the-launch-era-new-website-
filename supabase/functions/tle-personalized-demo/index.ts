import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SITE="https://thelaunchera.com";
const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY=Deno.env.get("TLE_CRM_RESEND_API_KEY")||Deno.env.get("RESEND_API_KEY")||"";
const OWNER_EMAIL="hello@thelaunchera.com";
function clean(v:unknown,max=300){return String(v??"").replace(/[<>]/g,"").trim().slice(0,max)}
function esc(v:unknown){return clean(v,500).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function cors(origin:string){const allowed=["https://thelaunchera.com","https://www.thelaunchera.com","https://thelaunchera.github.io"];return {"Access-Control-Allow-Origin":allowed.includes(origin)?origin:SITE,"Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"}}
function json(body:unknown,status=200,origin=""){return new Response(JSON.stringify(body),{status,headers:cors(origin)})}
async function db(path:string,init:RequestInit={}){return fetch(SUPABASE_URL+"/rest/v1/"+path,{...init,signal:init.signal||AbortSignal.timeout(8000),headers:{"apikey":SERVICE_KEY,"Authorization":"Bearer "+SERVICE_KEY,"Content-Type":"application/json","Prefer":"return=representation",...(init.headers||{})}})}
async function send(message:Record<string,unknown>,idempotencyKey:string){
 if(!RESEND_KEY)throw new Error("MAIL_UNAVAILABLE");
 const r=await fetch("https://api.resend.com/emails",{
  method:"POST",
  headers:{"Authorization":"Bearer "+RESEND_KEY,"Content-Type":"application/json","Idempotency-Key":idempotencyKey},
  body:JSON.stringify(message),
  signal:AbortSignal.timeout(9500)
 });
 const result=await r.json().catch(()=>({}));
 if(!r.ok||typeof result.id!=="string"||!result.id)throw new Error("MAIL_REJECTED");
 return result.id as string;
}
function links(id:string,business:string,area:string){const p=new URLSearchParams();p.set("rid",id);p.set("business",business);if(area)p.set("area",area);return {demo:SITE+"/lead-private-preview.html?"+p.toString(),tracker:SITE+"/lead-demo-tracker.html?"+p.toString()}}
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(origin)});
 if(req.method!=="POST")return json({error:"Method not allowed"},405,origin);
 if(origin&&!["https://thelaunchera.com","https://www.thelaunchera.com","https://thelaunchera.github.io"].includes(origin))return json({error:"Not allowed"},403,origin);
 try{
  const d=await req.json(); const action=clean(d.action,40);
  if(action==="viewed"||action==="get_started"){const id=clean(d.id,60);if(!/^[0-9a-f-]{36}$/i.test(id))return json({ok:false},400,origin);const field=action==="viewed"?"viewed_at":"get_started_at";await db("personalized_demo_requests?id=eq."+encodeURIComponent(id),{method:"PATCH",body:JSON.stringify({[field]:new Date().toISOString()})});return json({ok:true},200,origin)}
  const name=clean(d.name,100),email=clean(d.email,200).toLowerCase(),business=clean(d.business,140),area=clean(d.serviceArea,140),goal=clean(d.goal,500);
  if(!name||!business||!area||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Please complete your name, email, business name, and service area."},400,origin);
  const recent=await db("personalized_demo_requests?email=eq."+encodeURIComponent(email)+"&created_at=gte."+encodeURIComponent(new Date(Date.now()-10*60*1000).toISOString())+"&select=id,demo_url,status,sent_at,name,business_name,service_area,goal&order=created_at.desc&limit=1");
  if(!recent.ok)return json({ok:false,code:"request_lookup_failed",error:"We couldn't check your previous request. Please try again."},503,origin);
  const rows=await recent.json();
  const previous=rows[0]||null;
  if(previous&&previous.status==="sent"&&previous.sent_at)return json({ok:true,email_accepted:true,duplicate:true,demo_url:previous.demo_url},200,origin);
  const id=previous?.id||crypto.randomUUID();
  const mailName=previous?.name||name,mailBusiness=previous?.business_name||business,mailArea=previous?.service_area||area,mailGoal=previous?.goal||goal;
  const language=d.language==="es"?"es":"en";
  const es=language==="es";
  const l=links(id,mailBusiness,mailArea);
  if(!previous){
   const ins=await db("personalized_demo_requests",{method:"POST",body:JSON.stringify({id,name,email,business_name:business,service_area:area,services:"",goal,demo_url:l.demo,status:"pending"})});
   if(!ins.ok)return json({ok:false,code:"save_failed",error:"Could not save your request. Please try again."},503,origin);
  }
  const first=mailName.split(/\s+/)[0]||"there";
  const title=es?"Preparamos una demo para "+mailBusiness:"I made this for "+mailBusiness+" ✨";
  const html='<div style="background:#f4f6f7;padding:28px 12px;font-family:Arial,sans-serif;color:#191919"><div style="max-width:560px;margin:auto;background:#faf8f3;border-radius:24px;padding:30px"><div style="font-size:11px;letter-spacing:.14em;font-weight:700;margin-bottom:22px">THE LAUNCH ERA</div>'+
   '<p>'+(es?"Hola ":"Hi ")+esc(first)+',</p>'+
   '<p style="line-height:1.65">'+(es?"Preparamos una demo privada con el nombre de tu negocio, ":"I used the details you shared to make a private demo around ")+esc(mailBusiness)+'.</p>'+
   '<p style="line-height:1.65">'+(es?"También incluimos tu zona de servicio: ":"We also included your service area: ")+esc(mailArea)+'.</p>'+
   '<p style="text-align:center;margin:30px 0 14px"><a href="'+esc(l.demo)+'" style="background:#191919;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:700;display:inline-block">'+(es?"Ver mi demo":"View My Demo")+'</a></p>'+
   '<p style="text-align:center;margin:0 0 30px"><a href="'+esc(l.tracker)+'" style="background:#eef3f5;color:#191919;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:700;display:inline-block">'+(es?"Ver cómo se organiza mi negocio":"See Your Business Side")+'</a></p>'+
   '<div style="background:#eef5f8;border-radius:16px;padding:14px;font-size:12px;line-height:1.5"><b>'+(es?"Vista previa de demostración.":"Private demo preview only.")+'</b> '+(es?"Es un ejemplo ilustrativo. El producto final puede variar.":"This is an illustrative example. Your final setup may differ.")+'</div>'+
   '<p style="line-height:1.65;margin-top:22px">'+(es?"¿Tienes alguna pregunta? Puedes responder directamente a este correo.":"Questions? You can reply directly to this email.")+'</p><p>— The Launch Era</p></div></div>';
  const plain=(es?"Hola ":"Hi ")+first+"\n\n"+(es?"Tu demo personalizada para ":"Your personalized demo for ")+mailBusiness+"\n\n"+(es?"Ver mi demo: ":"View your demo: ")+l.demo+"\n"+(es?"Ver tu sistema: ":"See your business side: ")+l.tracker+"\n\n"+(es?"Es una simulación y no crea reservas reales.":"This is a preview and does not create real bookings.");
  let providerId="";
  try{
   providerId=await send({from:"The Launch Era <hello@thelaunchera.com>",to:[email],reply_to:OWNER_EMAIL,subject:title,html,text:plain},"tle-personalized-demo-"+id);
  }catch(error){
   console.error("Personalized demo email not accepted:",error instanceof Error?error.message:"unknown");
   await db("personalized_demo_requests?id=eq."+id,{method:"PATCH",body:JSON.stringify({status:"send_failed"})}).catch(()=>{});
   return json({ok:false,saved:true,email_accepted:false,code:"email_failed",error:es?"No pudimos enviar el correo. Inténtalo nuevamente.":"We couldn't send your email. Please try again."},503,origin);
  }
  const saved=await db("personalized_demo_requests?id=eq."+id,{method:"PATCH",body:JSON.stringify({status:"sent",sent_at:new Date().toISOString()})}).catch(()=>null);
  if(!saved?.ok)console.error("Personalized demo accepted by provider but status update failed.");
  try{
   const ownerHtml='<div style="font-family:Arial,sans-serif;line-height:1.6;color:#191919"><h2>New personalized demo request</h2><p><b>Business:</b> '+esc(mailBusiness)+'</p><p><b>Name:</b> '+esc(mailName)+'</p><p><b>Email:</b> '+esc(email)+'</p><p><b>Service area:</b> '+esc(mailArea)+'</p><p><b>Goal:</b> '+esc(mailGoal||"Not provided")+'</p><p>Customer demo email accepted by Resend.</p></div>';
   await send({from:"The Launch Era <hello@thelaunchera.com>",to:[OWNER_EMAIL],reply_to:email,subject:"New demo request — "+mailBusiness,html:ownerHtml,text:"New personalized demo request\n\nBusiness: "+mailBusiness+"\nName: "+mailName+"\nEmail: "+email+"\nArea: "+mailArea+"\nGoal: "+mailGoal},"tle-personalized-demo-owner-"+id);
  }catch(error){console.error("Owner demo notification was not accepted:",error instanceof Error?error.message:"unknown")}
  return json({ok:true,saved:true,email_accepted:true,provider_accepted:true,duplicate:false,demo_url:l.demo,tracker_url:l.tracker,recorded:Boolean(saved?.ok)},200,origin);
 }catch(e){console.error(e);return json({error:"We couldn't prepare your demo right now. Please try again."},500,origin)}
});