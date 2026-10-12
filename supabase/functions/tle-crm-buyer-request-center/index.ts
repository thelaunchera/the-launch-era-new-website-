import {decorateBusinessEmail,sendBusinessEmail} from "../_shared/business-email.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.0";

const emailHook="https://hook.us2.make.com/ztirdqf4g4i9i1npb0k4lsci4zt822gf";
const allowed=new Set(["https://the-launch-era-crm.dailinsegura17.workers.dev","https://thelaunchera.com","https://www.thelaunchera.com"]);
function cors(req:Request){
 const origin=req.headers.get("origin")||"";
 return {"Access-Control-Allow-Origin":allowed.has(origin)?origin:"https://the-launch-era-crm.dailinsegura17.workers.dev",
 "Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"GET,POST,OPTIONS",
 "Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin"};
}
function reply(req:Request,status:number,data:unknown){return new Response(JSON.stringify(data),{status,headers:cors(req)})}
const clean=(v:any,max=350)=>String(v??"").replace(/[<>]/g,"").trim().slice(0,max);
const html=(v:any)=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const validUuid=(s:string)=>/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(s);
function emailLogoUrl(value:any,name:string){
 try{const u=new URL(clean(value,1000));if(u.protocol==="https:"&&/\.(png|jpe?g|webp)$/i.test(u.pathname))return u.toString()}catch{}
 return /^cb\s*depot$/i.test(name)?"https://thelaunchera.com/assets/clients/cb-depot/approved-favicon-192.png":"";
}
function validBrandColor(v:any,fallback:string){return /^#[0-9a-fA-F]{6}$/.test(String(v||""))?String(v):fallback}
function foreground(bg:string){const y=[1,3,5].map(i=>parseInt(bg.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*y[0]+.7152*y[1]+.0722*y[2]>.4?"#191919":"#ffffff"}
function emailWrap(fragment:string,name:string,logo:string,primary:string,accent:string){
 const safe=html(name);
 const image=logo?'<img width="60" height="60" alt="'+safe+' logo" src="'+html(logo)+'" style="display:block;max-height:60px;height:auto;max-width:90px;margin-right:14px;border:0"/>':"";
 const heading=validBrandColor(primary,'#191919'),highlight=validBrandColor(accent,'#087DFF');return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:24px 12px;background:#f6f4f0;font-family:Arial,Helvetica,sans-serif"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:590px;margin:0 auto;border:1px solid #e6e0d7;border-collapse:separate;border-spacing:0;background:#fff;border-radius:16px"><tr><td style="background:'+heading+';border-radius:16px 16px 0 0;padding:19px 25px"><table role="presentation"><tr><td>'+image+'</td><td style="font:800 20px Arial;color:'+foreground(heading)+'">'+safe+'</td></tr></table></td></tr><tr><td style="padding:20px 24px">'+fragment+'</td></tr><tr><td style="padding:16px 24px;border-top:1px solid #ece8df;color:#777;font-size:11px;background:#faf9f6;border-radius:0 0 16px 16px">'+safe+' · <a href="https://thelaunchera.com/" style="color:'+highlight+';text-decoration:underline;font-weight:700">Powered by The Launch Era</a></td></tr></table></body></html>';
}

function passwordVerifiedJwt(token:string){
 // The session JWT has already been verified with Auth getUser() before this
 // is called. This only reads its authentication-method claim.
 try{
  const fragment=token.split(".")[1];
  const payload=JSON.parse(atob(fragment.replace(/-/g,"+").replace(/_/g,"/")));
  return Array.isArray(payload.amr)&&payload.amr.some((item:any)=>item?.method==="password");
 }catch{return false}
}
function permittedBuyerWorkspace(ws:any,token:string){
 return ws?.is_internal===true||ws?.password_login_required!==true||
  (!!ws.password_setup_completed_at&&passwordVerifiedJwt(token));
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
 if(!["GET","POST"].includes(req.method))return reply(req,405,{error:"Method not allowed"});
 const origin=req.headers.get("origin");
 if(origin&&!allowed.has(origin))return reply(req,403,{error:"Origin not allowed"});
 const url=Deno.env.get("SUPABASE_URL"),secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 const bearer=(req.headers.get("authorization")||"").replace(/^Bearer /i,"").trim();
 if(!url||!secret||!bearer)return reply(req,401,{error:"Sign in required"});
 const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await db.auth.getUser(bearer);
 if(authError||!user||!user.email_confirmed_at)return reply(req,401,{error:"Please sign in with your confirmed business account"});
 const ownerAccountId=new URL(req.url).searchParams.get("owner_account_id")||"";
 const ownerPreview=!!ownerAccountId;
 let ws:any=null,acct:any=null;
 if(ownerPreview){
   if(req.method!=="GET"||!validUuid(ownerAccountId))return reply(req,403,{error:"Owner preview is read-only."});
   const {data:internal,error:ownerError}=await db.from("tle_crm_workspaces").select("id,created_by,is_internal")
     .eq("id","c0b24907-3a17-4273-b00c-70efbba314c4").eq("created_by",user.id).eq("is_internal",true).maybeSingle();
   if(ownerError||!internal)return reply(req,403,{error:"The Launch Era owner access required."});
   const {data:target,error:targetError}=await db.from("tle_booking_flow_accounts")
     .select("id,crm_workspace_id,business_name,business_category,owner_email,notification_email,language,follow_up_enabled,follow_up_delay_hours,payment_status,status,intake_completed_at,booking_page_url,delivery_sent_at")
     .eq("id",ownerAccountId).eq("payment_status","paid").maybeSingle();
   if(targetError||!target)return reply(req,404,{error:"Buyer order not found."});
   acct=target;
   ws={id:target.crm_workspace_id,name:target.business_name,is_internal:false};
 }else{
   const {data:myWs,error:myError}=await db.from("tle_crm_workspaces").select("id,name,created_by,is_internal,password_login_required,password_setup_completed_at")
     .eq("created_by",user.id).eq("is_internal",false).order("created_at",{ascending:true}).limit(1).maybeSingle();
   if(myError||!myWs)return reply(req,403,{error:"Buyer account required"});
   if(!permittedBuyerWorkspace(myWs,bearer))return reply(req,403,{error:"Finish password verification before using the private Command Center."});
   ws=myWs;
   const {data:target,error:targetError}=await db.from("tle_booking_flow_accounts")
     .select("id,crm_workspace_id,business_name,business_category,owner_email,notification_email,language,follow_up_enabled,follow_up_delay_hours,payment_status,status,intake_completed_at,booking_page_url,delivery_sent_at")
     .eq("crm_workspace_id",ws.id).eq("payment_status","paid").order("created_at",{ascending:false}).limit(1).maybeSingle();
   if(targetError)return reply(req,503,{error:"Could not load your booking system"});
   acct=target;
 }
 if(!acct||acct.status!=="active"||!acct.intake_completed_at||!acct.booking_page_url||!acct.delivery_sent_at)
   return reply(req,423,{error:"Booking system must be completed and delivered before requests are available"});
 if(req.method==="GET"){
   const {data:items,error}=await db.from("tle_booking_flow_leads")
     .select("id,source,request_type,customer_name,customer_email,customer_phone,preferred_language,service_name,service_address,requested_start_at,status,workflow_stage,follow_up_at,follow_up_count,follow_up_sent_at,notes,raw_payload,created_at,updated_at")
     .eq("account_id",acct.id).order("created_at",{ascending:false}).limit(250);
   if(error)return reply(req,503,{error:"Could not load booking requests"});
   let automation=null;
   if(ownerPreview&&acct.crm_workspace_id){
     const {data:state}=await db.rpc("tle_crm_buyer_mail_status",{p_workspace:acct.crm_workspace_id});
     automation=state?{activated:!!state.activated,connected:!!state.connected,reply_tested:!!state.reply_tested,purchase_ready:!!state.purchase_ready}:null;
   }
   return reply(req,200,{ok:true,owner_preview:ownerPreview,workspace:ws.name,business:acct.business_name,preferred_language:acct.language==="es"?"es":"en",requests:items||[],automation});
 }
 const input=await req.json().catch(()=>null);
 if(!input||typeof input!=="object")return reply(req,400,{error:"Invalid action"});
 const requestId=clean(input.request_id,80),action=clean(input.action,30);
 if(!validUuid(requestId)||!["reviewing","quoted","booked","declined","change_requested","closed","reply","final_contact","stop_final_contact"].includes(action))
   return reply(req,400,{error:"Invalid request or action"});
 const {data:item,error:itemError}=await db.from("tle_booking_flow_leads")
   .select("id,account_id,source,request_type,customer_name,customer_email,preferred_language,service_name,requested_start_at,status,workflow_stage,raw_payload,follow_up_count,updated_at")
   .eq("account_id",acct.id).eq("id",requestId).maybeSingle();
 if(itemError||!item)return reply(req,404,{error:"This request does not belong to your business"});
 const isBooking=item.request_type==="booking"&&item.status==="booked";
 const isFinalAction=["final_contact","stop_final_contact"].includes(action);
 if(isFinalAction){
  const response=item.raw_payload?.quote_response?.status;
  if(item.request_type!=="quote"||Number(item.follow_up_count||0)<2||item.status==="booked"||["accepted","declined","lets_talk"].includes(response))
   return reply(req,409,{error:"Final contact is available only after two follow-ups and no customer response."});
  if(item.raw_payload?.final_contact_decision)return reply(req,409,{error:"Final contact decision has already been saved. Refresh the inbox."});
  if(action==="final_contact"&&input.send_email!==true)return reply(req,400,{error:"Confirm the optional final email before sending."});
  if(action==="stop_final_contact"&&input.send_email===true)return reply(req,400,{error:"Stop must not send any email."});
 }
 const message=clean(input.message,3000);
 const sendRequested=input.send_email===true;
 if(sendRequested&&(message.length<8||message.length>3000))return reply(req,400,{error:"Write a clear message before sending"});
 const quoteAmount=Number(input.quote_amount||0);
 if(action==="quoted"&&sendRequested&&(!Number.isFinite(quoteAmount)||quoteAmount<=0||quoteAmount>999999))
   return reply(req,400,{error:"Add a valid quote price before sending the customer a quote."});
 let newSlotClaimed=false,confirmedDate="",confirmedTime="",bookingStartUtc:string|null=null;
 if(action==="booked"&&!isBooking){
   confirmedDate=clean(input.request_date,10);
   confirmedTime=clean(input.request_time,5);
   if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(confirmedDate)||!/^([01]\\d|2[0-3]):(00|30)$/.test(confirmedTime))
     return reply(req,400,{error:"Choose an available booking date and 30-minute start time before confirming."});
   const {data:holds,error:holdError}=await db.from("tle_booking_flow_slot_holds")
      .select("id,starts_local,status,expires_at").eq("account_id",acct.id).eq("lead_id",item.id).limit(6);
   if(holdError)return reply(req,503,{error:"Could not check existing reservations"});
   const sameSlot=(holds||[]).some((h:any)=>{
     const start=String(h.starts_local||"").replace(" ","T");
     return start.startsWith(confirmedDate+"T"+confirmedTime)&&
       (h.status==="confirmed"||(h.status==="held"&&new Date(h.expires_at).getTime()>Date.now()));
   });
   if(!sameSlot){
     const {data:claimed,error:claimError}=await db.rpc("tle_booking_claim_slot",{p_account_id:acct.id,p_lead_id:item.id,p_local_start:confirmedDate+"T"+confirmedTime+":00"});
     if(claimError||claimed!==true)
       return reply(req,409,{error:"That time cannot be reserved. Check your Availability settings and select a free date and time."});
     newSlotClaimed=true;
   }
   try{
     const {data:availability}=await db.from("tle_booking_flow_availability").select("timezone").eq("account_id",acct.id).maybeSingle();
     const tz=String(availability?.timezone||"America/New_York");
     const expected=Date.UTC(Number(confirmedDate.slice(0,4)),Number(confirmedDate.slice(5,7))-1,Number(confirmedDate.slice(8,10)),Number(confirmedTime.slice(0,2)),Number(confirmedTime.slice(3,5)));
     let candidate=expected;
     for(let i=0;i<4;i++){
       const parts=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(candidate)).filter((x:any)=>x.type!=="literal").map((x:any)=>[x.type,x.value]));
       const represented=Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute));
       const difference=expected-represented;candidate+=difference;if(difference===0)break;
     }
     bookingStartUtc=new Date(candidate).toISOString();
   }catch{}
 }
 if(item.status==="booked"&&["declined","closed"].includes(action))
   return reply(req,409,{error:"Booked jobs cannot be cancelled from this quick-reply panel. Review the reservation and its slot first."});
 const patch:any={updated_at:new Date().toISOString()};
 if(action==="reviewing"){patch.workflow_stage="reviewing";}
 if(action==="quoted"){patch.workflow_stage="quoted";patch.status="contacted";patch.follow_up_at=null;patch.last_contacted_at=new Date().toISOString();}
 if(action==="booked"){patch.workflow_stage="booked";patch.status="booked";patch.follow_up_at=null;patch.last_contacted_at=new Date().toISOString(); if(!isBooking){patch.raw_payload={...(item.raw_payload||{}),requested_date:confirmedDate,requested_time:confirmedTime};if(bookingStartUtc)patch.requested_start_at=bookingStartUtc;}}
 if(action==="declined"){patch.workflow_stage="closed";patch.status="closed";patch.follow_up_at=null;}
 if(action==="change_requested"){patch.workflow_stage="reviewing";patch.follow_up_at=null;}
 if(action==="closed"){patch.workflow_stage="closed";patch.status="closed";patch.follow_up_at=null;}
 if(action==="stop_final_contact"){
  patch.follow_up_at=null;
  patch.raw_payload={...(item.raw_payload||{}),final_contact_decision:"stopped",final_contact_decided_at:new Date().toISOString()};
 }
 if(action!=="reply"&&action!=="final_contact"){
  const query=db.from("tle_booking_flow_leads").update(patch).eq("account_id",acct.id).eq("id",item.id);
  const {data:saved,error:updateError}=await (action==="stop_final_contact"?query.eq("updated_at",item.updated_at):query).select("id").maybeSingle();
  if(updateError||!saved){
   if(newSlotClaimed)await db.from("tle_booking_flow_slot_holds").delete().eq("account_id",acct.id).eq("lead_id",item.id).eq("status","held");
   return reply(req,503,{error:"Could not save the request status"});
  }
 }
 if(!sendRequested)return reply(req,200,{ok:true,status_saved:true,email_sent:false});
 const target=clean(item.customer_email,254);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target))return reply(req,200,{ok:true,status_saved:action!=="reply",email_sent:false,warning:"Customer email is missing or invalid"});
 const {data:brandRecord,error:brandError}=await db.from("tle_booking_page_branding").select("business_name,logo_image,primary_color,accent_color,design_reviewed_at").eq("account_id",acct.id).maybeSingle();
 if(brandError)return reply(req,503,{error:"Business identity could not be verified before sending"});
 const es=item.preferred_language==="es",owner=clean(acct.notification_email||acct.owner_email,254),
       business=clean(brandRecord?.design_reviewed_at?brandRecord.business_name:acct.business_name||ws.name,100);
 const businessLogo=emailLogoUrl(brandRecord?.design_reviewed_at?brandRecord.logo_image:"",business);
 const themePrimary=validBrandColor(brandRecord?.design_reviewed_at?brandRecord.primary_color:"","#191919");
 const themeAccent=validBrandColor(brandRecord?.design_reviewed_at?brandRecord.accent_color:"","#087DFF");
 const subjects:any={
   reviewing:es?"Estamos revisando tu solicitud":"We're reviewing your request",
   quoted:es?"Actualización de tu cotización":"Your quote update",
   booked:es?"Tu reserva está confirmada":"Your booking is confirmed",
   declined:es?"Actualización de tu solicitud":"Update on your request",
   change_requested:es?"Un detalle de tu reserva":"A detail about your booking",
   closed:es?"Actualización de tu solicitud":"Update on your request",
   reply:es?"Mensaje de "+business:"Message from "+business,
   final_contact:es?"Último contacto personal":"A final personal check-in"
 };
 const first=clean(item.customer_name,120).split(/\s+/)[0]|| (es?"cliente":"there");
 let quoteLinkId:string|null=null;
 let quoteLinkRaw="";
 let quoteCurrency="USD";
 let quoteMarkup="";
 if(action==="quoted"&&sendRequested){
   const {data:priceConfig}=await db.from("tle_booking_flow_pricing").select("currency").eq("account_id",acct.id).maybeSingle();
   quoteCurrency=priceConfig?.currency==="CAD"?"CAD":"USD";
   const secretBytes=crypto.getRandomValues(new Uint8Array(32));
   quoteLinkRaw=[...secretBytes].map(b=>b.toString(16).padStart(2,"0")).join("");
   const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(quoteLinkRaw));
   const tokenHash=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
   const {data:created,error:quoteError}=await db.from("tle_booking_quote_response_links").insert({
      account_id:acct.id,lead_id:item.id,token_hash:tokenHash,amount:quoteAmount,currency:quoteCurrency,
      expires_at:new Date(Date.now()+30*86400000).toISOString()
   }).select("id").single();
   if(quoteError||!created)return reply(req,503,{error:"Could not create a secure quote response. Please retry."});
   quoteLinkId=created.id;
   const quoted=new Intl.NumberFormat(es?"es-US":"en-US",{style:"currency",currency:quoteCurrency}).format(quoteAmount);
   const root="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-quote-response?token="+quoteLinkRaw;
   const button=(label:string,actionKey:string,color:string)=>'<a href="'+root+'&amp;action='+actionKey+'" style="display:inline-block;background:'+color+';color:#191919;border-radius:11px;padding:12px 16px;text-decoration:none;font-size:13px;font-weight:700;margin:7px 7px 6px 0">'+html(label)+'</a>';
   quoteMarkup='<section style="border-top:1px solid #dce9f2;margin-top:20px;padding-top:16px">'
    +'<h3 style="margin:0 0 9px;font-size:18px">'+html(es?"Tu cotización":acct.business_category==="detailing"?"Your car detailing quote":acct.business_category==="other"?"Your service quote":"Your cleaning quote")+': '+html(quoted)+'</h3>'
    +'<p style="font-size:13px">'+html(es?"Puedes aceptar la cotización, rechazarla indicando el motivo o pedir que conversemos. Acepta el estimado y elige un horario disponible para confirmar tu reserva.":"Accept the quote, decline with a reason, or ask to talk. Accept the estimate and choose an available appointment time to confirm your booking.")+'</p>'
    +button(es?"Aceptar cotización":"Accept quote","accept","#cae8d8")
    +button(es?"Rechazar / ¿Por qué?":"Decline / Why?","decline","#f5e9e6")
    +button(es?"Hablemos":"Let's talk","talk","#e4f1fc")
    +'</section>';
 }
 const markup='<div style="font-family:Arial,Helvetica,sans-serif;color:#191919;line-height:1.65;max-width:600px;margin:auto;background:#fff;padding:20px">'
   +'<strong style="font-size:12px;letter-spacing:.1em">'+html(business)+'</strong><p>'+html(es?"Hola ":"Hi ")+html(first)+',</p><p style="white-space:pre-wrap">'+html(message)+'</p><p>'
   +html(es?"Si tienes preguntas, responde a este correo.":"If you have questions, reply to this email.")+'</p><p style="font-size:12px;color:#657888">'+html(business)+'</p>'+quoteMarkup+'</div>';
 if(action==="final_contact"){
  const stamp=new Date().toISOString();
  const {data:claimed,error:claimError}=await db.from("tle_booking_flow_leads").update({
   raw_payload:{...(item.raw_payload||{}),final_contact_decision:"sending",final_contact_decided_at:stamp},
   follow_up_at:null,updated_at:stamp
  }).eq("account_id",acct.id).eq("id",item.id).eq("updated_at",item.updated_at).select("id").maybeSingle();
  if(claimError||!claimed)return reply(req,409,{error:"Another final-contact decision was saved. Refresh before sending."});
 }
 let delivered=false;
 try{
   delivered=await sendBusinessEmail({type:"booking_flow_message",customer_email:target,business_name:business,reply_to:owner,email_subject:subjects[action]+" — "+business,email_html:emailWrap(markup,business,businessLogo,themePrimary,themeAccent),business_id:String(acct.id),outbox_id:String(item.id),optional_email:action==="final_contact",event_key:action==="final_contact"?"buyer_final_contact_"+String(item.id):"owner_update_"+action+"_"+new Date().toISOString()},es);
 }catch{}
 if(!delivered&&quoteLinkId)await db.from("tle_booking_quote_response_links").delete().eq("id",quoteLinkId).eq("account_id",acct.id);
 if(delivered&&quoteLinkId){
   await db.from("tle_booking_quote_response_links")
     .update({status:"revoked"}).eq("account_id",acct.id).eq("lead_id",item.id).eq("status","pending").neq("id",quoteLinkId);
   const now=new Date().toISOString();
   const {data:latest}=await db.from("tle_booking_flow_leads").select("raw_payload").eq("id",item.id).eq("account_id",acct.id).maybeSingle();
   await db.from("tle_booking_flow_leads").update({
     raw_payload:{...(latest?.raw_payload||item.raw_payload||{}),quote_offer:{amount:quoteAmount,currency:quoteCurrency,state:"sent",sent_at:now}},
     follow_up_at:acct.follow_up_enabled===true&&item.status!=="booked"?
        new Date(Date.now()+Math.max(12,Math.min(168,Number(acct.follow_up_delay_hours||24)))*3600000).toISOString():null,
     updated_at:now
   }).eq("id",item.id).eq("account_id",acct.id);
 }
 if(action==="final_contact"&&!delivered){
  const at=new Date().toISOString();
  const {data:latest}=await db.from("tle_booking_flow_leads").select("raw_payload").eq("id",item.id).eq("account_id",acct.id).maybeSingle();
  await db.from("tle_booking_flow_leads").update({
    raw_payload:{...(latest?.raw_payload||{}),final_contact_decision:"needs_review",final_contact_decided_at:at},
    updated_at:at
  }).eq("id",item.id).eq("account_id",acct.id);
  if(acct.crm_workspace_id)await db.from("tle_crm_notifications").insert({
    workspace_id:acct.crm_workspace_id,kind:"lead",title:"Final email needs review",
    body:clean(item.customer_name,90)+" · Check email history before another attempt.",
    source_key:"final-contact-review:"+item.id
  });
 }
 if(delivered){
   if(action==="final_contact"){
     const sentAt=new Date().toISOString();
     const {data:latest}=await db.from("tle_booking_flow_leads").select("raw_payload").eq("id",item.id).eq("account_id",acct.id).maybeSingle();
     await db.from("tle_booking_flow_leads").update({
       raw_payload:{...(latest?.raw_payload||item.raw_payload||{}),final_contact_decision:"sent",final_contact_decided_at:sentAt,final_contact_email_accepted:true},
       follow_up_at:null,last_contacted_at:sentAt,updated_at:sentAt
     }).eq("account_id",acct.id).eq("id",item.id);
   }
   await db.from("tle_booking_flow_leads").update({last_contacted_at:new Date().toISOString(),updated_at:new Date().toISOString()})
     .eq("account_id",acct.id).eq("id",item.id);
 }
 return reply(req,200,{ok:true,status_saved:action!=="reply",email_sent:delivered,
  warning:delivered?null:"Request status saved, but the email service did not accept the message. Review and retry."});
});

