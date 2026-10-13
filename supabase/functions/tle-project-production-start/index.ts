import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const SITE="https://thelaunchera.com";
const ORIGINS=new Set([SITE,"https://www.thelaunchera.com","https://the-launch-era-crm.dailinsegura17.workers.dev"]);
const uid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const escapeHtml=(value:unknown)=>String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function headers(req:Request){const origin=req.headers.get("origin")||"";return {"Content-Type":"application/json","Cache-Control":"no-store","Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:SITE,"Access-Control-Allow-Headers":"authorization,content-type,apikey","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"};}
const respond=(req:Request,status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers:headers(req)});
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(req)});
 if(req.method!=="POST")return respond(req,405,{error:"Method not allowed"});
 const origin=req.headers.get("origin")||"";
 if(origin&&!ORIGINS.has(origin))return respond(req,403,{error:"Origin not allowed"});
 const base=Deno.env.get("SUPABASE_URL")||"",secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 const bearer=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"").trim();
 if(!base||!secret||!bearer)return respond(req,401,{error:"Verified owner sign-in required"});
 const db=createClient(base,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await db.auth.getUser(bearer);
 if(authError||!user?.email_confirmed_at)return respond(req,401,{error:"Verified owner sign-in required"});
 const {data:ownerWorkspace,error:workspaceError}=await db.from("tle_crm_workspaces").select("id").eq("created_by",user.id).eq("is_internal",true).limit(1).maybeSingle();
 if(workspaceError||!ownerWorkspace)return respond(req,403,{error:"Only the verified The Launch Era owner can start production"});
 const body=await req.json().catch(()=>null);
 const type=String(body?.subject_type||""),id=String(body?.subject_id||""),action=String(body?.action||"status");
 if(!["booking","ai"].includes(type)||!uid.test(id)||!["status","approve"].includes(action))return respond(req,400,{error:"Invalid project or action"});
 const table=type==="booking"?"tle_booking_flow_accounts":"tle_ai_agent_orders";
 const fields=type==="booking"?"id,business_name,owner_email,language,payment_status,intake_completed_at,build_started_at,delivery_sent_at,status":"id,business_name,customer_email,preferred_language,submitted_at,delivered_at,status";
 const {data:order,error:orderError}=await db.from(table).select(fields).eq("id",id).maybeSingle();
 if(orderError||!order)return respond(req,404,{error:"Project not found"});
 const paid=type==="booking"?order.payment_status==="paid":!!order.submitted_at&&["intake_submitted","in_setup","active"].includes(order.status);
 const intakeComplete=type==="booking"?!!order.intake_completed_at:!!order.submitted_at;
 const delivered=type==="booking"?!!order.delivery_sent_at:!!order.delivered_at||order.status==="active";
 const eligible=paid&&intakeComplete&&!delivered;
 const {data:existing,error:readError}=await db.from("tle_project_kickoffs").select("approved_at,email_status,resend_email_id").eq("subject_type",type).eq("subject_id",id).maybeSingle();
 if(readError)return respond(req,503,{error:"Project history unavailable"});
 if(action==="status")return respond(req,200,{ok:true,ready:eligible&&!existing&&!order.build_started_at,already_started:!!existing||!!order.build_started_at,approved_at:existing?.approved_at||order.build_started_at||null,email_status:existing?.email_status||null});
 if(body.confirm!==true)return respond(req,400,{error:"Explicit production approval is required"});
 if(existing||order.build_started_at)return respond(req,200,{ok:true,already_started:true,approved_at:existing?.approved_at||order.build_started_at,email_status:existing?.email_status||null});
 if(!eligible)return respond(req,409,{error:"Confirm the paid intake and review the data before production. Delivered projects cannot be restarted."});
 const email=String(type==="booking"?order.owner_email:order.customer_email).trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return respond(req,409,{error:"The purchaser's verified email is missing"});
 const {data:kickoff,error:insertError}=await db.from("tle_project_kickoffs")
  .insert({subject_type:type,subject_id:id,approved_by:user.id,email_status:"pending"})
  .select("approved_at").single();
 if(insertError){
  if(insertError.code==="23505")return respond(req,200,{ok:true,already_started:true,message:"Previously approved; no duplicate email triggered"});
  return respond(req,503,{error:"Could not record production start"});
 }
 const approvedAt=kickoff.approved_at;
 const setState=async(state:string,emailId?:string)=>{
  const {error}=await db.from("tle_project_kickoffs").update({email_status:state,resend_email_id:emailId||null,email_checked_at:new Date().toISOString()}).eq("subject_type",type).eq("subject_id",id);
  if(error)console.error("Failed to record kickoff email status",error.code);
 };
 try{
  if(type==="booking"){
   const {error}=await db.from("tle_booking_flow_accounts").update({build_started_at:approvedAt}).eq("id",id).is("build_started_at",null);
   if(error)throw Error("Could not synchronize production timestamp");
  }
  const apiKey=Deno.env.get("TLE_CRM_RESEND_API_KEY")||"";
  if(!apiKey)throw Error("Email provider not configured");
  const es=(type==="booking"?order.language:order.preferred_language)==="es";
  const name=escapeHtml(String(order.business_name||"your business").slice(0,110));
  const service=type==="booking"?"Booking Automation + Command Center":"AI Assistant";
  const subject=es?"Tu proyecto ya está en producción — The Launch Era":"Your project is now in production — The Launch Era";
  const heading=es?"Tu proyecto ya está en producción.":"Your project is now in production.";
  const bodyCopy=es?"Ya revisamos la información de <strong>"+name+"</strong> y aprobamos el inicio de tu proyecto. Nuestro equipo comenzó a trabajar en <strong>"+service+"</strong>. El tiempo estimado de producción es de 48 horas desde este inicio.":"We've reviewed the details for <strong>"+name+"</strong> and approved the start of your project. Our team has begun work on <strong>"+service+"</strong>. Estimated production time is 48 hours from this kickoff.";
  const next=es?"Te escribiremos cuando esté listo para las pruebas o si necesitamos algún detalle adicional. No tienes que enviar otro formulario.":"We'll email you when it's ready for testing or if we need any clarification. You don't need to fill out another setup form.";
  const aiNote=type!=="ai"?"":es?"<p>Tu primer mes incluido de AI Assistant empieza cuando se entregue y active, no hoy.</p>":"<p>Your included first month of AI Assistant starts at delivery and activation, not today.</p>";
  const html='<div style="background:#f2f7fb;padding:30px 12px;font-family:Arial,sans-serif"><div style="background:#FAF8F3;max-width:560px;margin:auto;border-radius:18px;overflow:hidden;border:1px solid #dce6ed"><div style="background:#191919;padding:23px 28px"><strong style="font-size:17px;color:#F2D85B;letter-spacing:.05em">THE LAUNCH ERA</strong></div><div style="padding:32px 28px;color:#191919;line-height:1.7"><small style="color:#3379a6;font-weight:700;letter-spacing:.08em">'+(es?"PRODUCCIÓN INICIADA":"PRODUCTION STARTED")+'</small><h1 style="font-size:26px;line-height:1.2;margin:12px 0 20px">'+heading+'</h1><p>'+bodyCopy+'</p><p>'+next+'</p>'+aiNote+'<p style="margin-top:24px">The Launch Era team</p></div><div style="background:#e5f2fb;padding:16px 28px;font-size:12px;color:#52697a">'+(es?"¿Dudas? Responde a este correo.":"Questions? Reply to this email.")+'</div></div></div>';
  const provider=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json","Idempotency-Key":"tle-project-start-"+type+"-"+id},body:JSON.stringify({from:"The Launch Era <hello@thelaunchera.com>",to:[email],subject,html,reply_to:"hello@thelaunchera.com"})});
  const result=await provider.json().catch(()=>({}));
  if(!provider.ok||typeof result.id!=="string"||!result.id)throw Error("Email provider did not confirm acceptance");
  await setState("provider_accepted",result.id);
  return respond(req,200,{ok:true,approved_at:approvedAt,email_status:"provider_accepted",message:"Production was approved and the confirmation email was accepted by the email provider"});
 }catch(e){
  console.error("Production kickoff requires manual email verification",e instanceof Error?e.message:"unknown");
  await setState("needs_review");
  return respond(req,202,{ok:true,approved_at:approvedAt,email_status:"needs_review",message:"Production start was saved; confirm email delivery with the provider before retrying any send"});
 }
});