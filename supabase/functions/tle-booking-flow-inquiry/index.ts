import {decorateBusinessEmail,sendBusinessEmail} from "../_shared/business-email.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const MAKE_HOOK="https://hook.us2.make.com/ztirdqf4g4i9i1npb0k4lsci4zt822gf";
const allowedOrigins=new Set(["https://thelaunchera.com","https://www.thelaunchera.com"]);

function cors(origin:string){
  return {
    "Content-Type":"application/json",
    "Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"https://thelaunchera.com",
    "Access-Control-Allow-Headers":"content-type",
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Vary":"Origin"
  };
}
function clean(v:any,max=2000){return String(v??"").replace(/[<>]/g,"").trim().slice(0,max)}
function html(v:any){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
async function sha256(value:string){const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,"0")).join("")}
function newToken(){const a=new Uint8Array(32);crypto.getRandomValues(a);return [...a].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function send(payload:any){
 if(payload?.type==="booking_flow_message")return sendBusinessEmail(payload,payload.email_language==="es");
 try{const resp=await fetch(MAKE_HOOK,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});return resp.ok}catch{return false}
}
function pick(...vals:any[]){for(const v of vals){const s=clean(v,1200);if(s)return s}return ""}
function moneyish(v:any){const s=clean(v,80);if(!s)return "";const n=Number(s.replace(/[^0-9.]/g,""));return Number.isFinite(n)&&n>0?"$"+Math.round(n):s}
function emailSafeLogo(value:any,businessName:string){
 try{const url=new URL(clean(value,1100));if(url.protocol==="https:"&&/\.(png|jpe?g|webp)$/i.test(url.pathname))return url.toString()}catch{}
 if(/^cb\s*depot$/i.test(clean(businessName,120)))return "https://thelaunchera.com/assets/clients/cb-depot/approved-favicon-192.png";
 return "";
}
function brandHex(v:any,fallback:string){const val=String(v||"");return /^#[0-9a-fA-F]{6}$/.test(val)?val:fallback}
function textOn(bg:string){const a=[1,3,5].map(x=>parseInt(bg.slice(x,x+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return (.2126*a[0]+.7152*a[1]+.0722*a[2])>.4?"#191919":"#ffffff"}
function emailBrandHeader(name:string,logo:string,foreground="#ffffff"){
 const safe=html(name);
 const picture=logo?'<img src="'+html(logo)+'" alt="'+safe+' logo" width="58" height="58" style="display:block;max-width:58px;max-height:58px;height:auto;border:0;margin-right:14px"/>':"";
 return '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse"><tr><td style="width:70px;vertical-align:middle">'+picture+'</td><td style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;color:'+foreground+';font-size:21px;font-weight:800;line-height:1.3">'+safe+'</td></tr></table>';
}
function brandedCustomerEmail(body:string,name:string,logo:string,service:string,details:string,timing:string,confirmed:boolean,es:boolean,primary:string,accent:string){
 const detailRow=(label:string,value:string)=>value?'<tr><td style="padding:11px 0;border-bottom:1px solid #e8e5df;color:#777;font-size:13px;width:42%">'+html(label)+'</td><td style="padding:11px 0;border-bottom:1px solid #e8e5df;font-size:13px;color:#222;font-weight:700">'+html(value)+'</td></tr>':"";
 const record='<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">'+detailRow(es?"Servicio":"Service",service)+detailRow(es?"Detalles":"Details",details)+detailRow(es?"Horario solicitado":"Requested time",timing)+'</table>';
 const status=confirmed?(es?"Reserva confirmada":"Booking confirmed"):(es?"Pendiente de confirmación":"Awaiting confirmation");
 const disclaimer=confirmed?"":'<p style="margin:10px 0 0;font-size:13px;line-height:1.5">'+(es?"La cita todavía no está confirmada. El negocio revisará tu solicitud antes de reservar un horario.":"Your appointment is not confirmed yet. The business will review your request before reserving a time.")+'</p>';
 return '<!doctype html><html lang="'+(es?"es":"en")+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'+
 '<body style="margin:0;background:#f5f3ef;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#222">'+
 '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:580px;margin:0 auto;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #e4e0d7;border-radius:16px">'+
 '<tr><td style="background:'+primary+';padding:24px 25px;border-radius:16px 16px 0 0">'+emailBrandHeader(name,logo,textOn(primary))+'</td></tr>'+
 '<tr><td style="padding:26px 25px">'+
 '<div style="font-size:11px;letter-spacing:1.2px;font-weight:800;color:'+accent+';margin:0 0 13px">'+(es?"ACTUALIZACIÓN DE TU SOLICITUD":"YOUR REQUEST UPDATE")+'</div>'+
 '<div style="font-size:15px;line-height:1.7;color:#30353a">'+body+'</div>'+
 '<div style="background:#fbfaf8;padding:15px 17px;border:1px solid #ede9e1;border-radius:12px;margin:20px 0">'+record+'</div>'+
 '<div style="background:'+(confirmed?"#eaf5eb":"#f8edd8")+';border-radius:10px;padding:14px 16px;font-size:13px;color:#36332c;line-height:1.5"><strong>'+status+'</strong>'+disclaimer+'</div>'+
 '</td></tr><tr><td style="background:#faf9f6;border-top:1px solid #e4e0d7;border-radius:0 0 16px 16px;padding:16px 25px;font-size:11px;color:#777">'+html(name)+' · <a href="https://thelaunchera.com/" style="color:#276eaf;text-decoration:underline;font-weight:700">Powered by The Launch Era</a></td></tr>'+
 '</table></body></html>';
}

Deno.serve(async(req)=>{
  const origin=req.headers.get("origin")||"";
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:cors(origin)});
  if(req.method!=="POST") return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:cors(origin)});
  if(origin && !allowedOrigins.has(origin)) return new Response(JSON.stringify({error:"Not allowed"}),{status:403,headers:cors(origin)});

  const b=await req.json().catch(()=>({}));
  if(clean(b.website,120)) return new Response(JSON.stringify({ok:true}),{status:200,headers:cors(origin)});

  const bookingKey=clean(b.booking_key,80);
  const customerName=clean(b.customer_name,160);
  const customerEmail=clean(b.customer_email,200).toLowerCase();
  const requestRef=/^req_[a-z0-9-]{16,76}$/i.test(clean(b.external_ref,80))?clean(b.external_ref,80).toLowerCase():null;
  // Optional permission is always a separate unchecked choice, never implied by an inquiry.
  const optionalCareOptIn=b.optional_care_opt_in===true;
  const appointmentRemindersOptIn=b.appointment_reminders_opt_in===true;
  if(!bookingKey||!customerName||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)){
    return new Response(JSON.stringify({error:"Missing or invalid booking details."}),{status:400,headers:cors(origin)});
  }

  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
  const {data:acct,error:ae}=await admin.from("tle_booking_flow_accounts").select("*").eq("booking_public_key",bookingKey).maybeSingle();
  if(ae||!acct||acct.status!=="active"||acct.payment_status!=="paid"||!acct.intake_completed_at||!acct.crm_workspace_id||!acct.booking_page_url||!acct.delivery_sent_at) return new Response(JSON.stringify({error:"This booking page is not published yet."}),{status:404,headers:cors(origin)});
  const {data:approvedBrand,error:brandError}=await admin.from("tle_booking_page_branding")
    .select("business_name,logo_image,primary_color,accent_color,design_reviewed_at").eq("account_id",acct.id).maybeSingle();
  if(brandError)return new Response(JSON.stringify({error:"The booking details could not be verified. Please try again."}),{status:503,headers:cors(origin)});
  const brandName=clean(approvedBrand?.design_reviewed_at?approvedBrand?.business_name:acct.business_name,120)||clean(acct.business_name,120)||"Service Team";
  const brandLogo=emailSafeLogo(approvedBrand?.design_reviewed_at?approvedBrand?.logo_image:"",brandName);
  const primary=brandHex(approvedBrand?.design_reviewed_at?approvedBrand.primary_color:"","#191919");
  const accent=brandHex(approvedBrand?.design_reviewed_at?approvedBrand.accent_color:"","#087DFF");

  const lang=["en","es","fr","ht"].includes(String(b.preferred_language))?String(b.preferred_language):(acct.language||"en");
  let requestType=(b.request_type==="quote"||b.request_type==="inquiry")?"quote":"booking";
  const requestIntent=b.request_type==="inquiry"?"inquiry":(b.request_intent==="estimate"?"estimate":b.request_type==="quote"?"quote":null);
  // Only schedule a managed reminder after the customer receipt is accepted. The buyer never needs a separate mail account.
  const followAt=null;

  const manageRaw=newToken();
  const manageHash=await sha256(manageRaw);

  const autoDetailing=acct.business_category==="detailing";
  const propertyType=autoDetailing?pick(b.vehicle_type,b.qtype,b.property_type):pick(b.property_type,b.home_type,b.property);
  const vehicleCondition=autoDetailing?pick(b.vehicle_condition,b.qsize,b.condition):"";
  const bedrooms=pick(b.bedrooms,b.beds);
  const bathrooms=pick(b.bathrooms,b.baths);
  const squareFootage=pick(b.square_footage,b.square_feet,b.sqft,b.sqft_label);
  const frequency=pick(b.frequency,b.cleaning_frequency);
  let extras=Array.isArray(b.extras)?b.extras.map((x:any)=>clean(typeof x==="string"?x:(x?.name||x?.label),160)).filter(Boolean).join(", "):pick(b.extras,b.add_ons,b.addons);
  const requestedDate=pick(b.requested_date,b.preferred_date);
  const requestedTime=pick(b.requested_time,b.preferred_time);
  const notes=pick(b.notes,b.client_notes);
  let service=pick(b.service_name,b.service)||(requestType==="quote"?"Quote request":autoDetailing?"Detailing request":acct.business_category==="other"?"Service request":"Cleaning request");
  const low=moneyish(b.estimate_low||b.estimated_low);
  const high=moneyish(b.estimate_high||b.estimated_high);
  let estimate=pick(b.estimate_display,b.estimate_range,b.estimated_range,b.approximate_range);
  if(!estimate&&(low||high)) estimate=low&&high?low+"–"+high:(low||high);
  if(requestType==="quote") estimate="Custom quote";

  // Never trust client-supplied service prices or addons for the managed Booking Page.
  // Legacy custom pages without a service_id continue through their existing review flow.
  const serviceId=clean(b.service_id,80);
  let validatedServiceId="",verifiedPrice:number|null=null;
  let instantConfirmed=false;
  let allowAutomaticFlatConfirmation=false;
  if(serviceId){
    const {data:pricing,error:pricingError}=await admin.from("tle_booking_flow_pricing")
      .select("services,addons,currency,quote_policy,auto_confirm_flat").eq("account_id",acct.id).maybeSingle();
    if(pricingError||!pricing) return new Response(JSON.stringify({error:"Pricing is not available yet."}),{status:409,headers:cors(origin)});
    const chosen=serviceId==="special_request"&&pricing.quote_policy!=="no_quotes"?{id:"special_request",name:autoDetailing?"Custom Car Detailing":acct.business_category==="other"?"Custom Service":"Special / Custom Cleaning",mode:"quote",price:null,active:true}:(Array.isArray(pricing.services)?pricing.services.find((s:any)=>s.id===serviceId&&s.active===true):null);
    if(!chosen) return new Response(JSON.stringify({error:"This service is no longer available. Please refresh."}),{status:400,headers:cors(origin)});
    service=clean(chosen.name,160);
    requestType=chosen.mode==="flat"&&b.request_type==="booking"?"booking":"quote";
    validatedServiceId=serviceId;
    // The customer's published flat price alone is not permission to confirm.
    // An explicit account setting and an available slot are both required.
    allowAutomaticFlatConfirmation=requestType==="booking"&&pricing.auto_confirm_flat===true&&pricing.quote_policy!=="always_review";
    const extraIds=Array.isArray(b.selected_addon_ids)?b.selected_addon_ids:[];
    if(extraIds.length>40||new Set(extraIds).size!==extraIds.length)return new Response(JSON.stringify({error:"Invalid add-ons."}),{status:400,headers:cors(origin)});
    const availableExtras=Array.isArray(pricing.addons)?pricing.addons:[];
    const chosenExtras=extraIds.map((id:any)=>availableExtras.find((a:any)=>a.id===id&&a.active===true));
    if(chosenExtras.some((a:any)=>!a))return new Response(JSON.stringify({error:"Some add-ons are no longer available. Please refresh."}),{status:400,headers:cors(origin)});
    extras=chosenExtras.map((a:any)=>clean(a.name,160)).join(", ");
    if(requestType==="booking"){
      const amount=Number(chosen.price)+chosenExtras.reduce((sum:number,a:any)=>sum+Number(a.price),0);
      if(!Number.isFinite(amount)||amount<=0||amount>100000)return new Response(JSON.stringify({error:"Invalid published price."}),{status:409,headers:cors(origin)});
      verifiedPrice=Math.round(amount*100)/100;
      estimate=new Intl.NumberFormat("en-US",{style:"currency",currency:pricing.currency==="CAD"?"CAD":"USD"}).format(verifiedPrice);
    }else estimate="Custom quote";
  }

  const rawPayload={
    requested_date:requestedDate,
    requested_time:requestedTime,
    property_type:propertyType,
    vehicle_type:autoDetailing?propertyType:null,vehicle_condition:autoDetailing?vehicleCondition:null,
    bedrooms:autoDetailing?null:bedrooms,bathrooms:autoDetailing?null:bathrooms,
    square_footage:squareFootage,
    frequency,extras,
    estimate_display:estimate,
    notes,service,request_intent:requestIntent,service_id:requestType==="booking"?(validatedServiceId||null):null,quote_service_id:requestType==="quote"?(validatedServiceId||null):null,verified_fixed_price:verifiedPrice,
    automatic_confirmation_requested:allowAutomaticFlatConfirmation,
    appointment_reminders_opt_in:appointmentRemindersOptIn,
    reminder_consent_source:appointmentRemindersOptIn?"Customer opted into appointment reminders in Booking Page":null,
    reminder_consent_at:appointmentRemindersOptIn?new Date().toISOString():null,
    optional_care_opt_in:optionalCareOptIn,
    care_consent_source:optionalCareOptIn?"Customer checked the optional email box on the published Booking Page":null,
    care_consent_at:optionalCareOptIn?new Date().toISOString():null
  };

  // Duplicate browser submissions must not create another lead, quote follow-up, or customer email.
  if(requestRef){
    const {data:oldLead,error:lookupError}=await admin.from("tle_booking_flow_leads")
      .select("id,customer_email,status,raw_payload").eq("account_id",acct.id).eq("external_ref",requestRef).maybeSingle();
    if(lookupError)return new Response(JSON.stringify({error:"Could not verify your previous submission. Please try later."}),{status:503,headers:cors(origin)});
    if(oldLead){
      if(oldLead.customer_email!==customerEmail)return new Response(JSON.stringify({error:"This submission was already used. Please refresh and try again."}),{status:409,headers:cors(origin)});
      return new Response(JSON.stringify({ok:true,lead_id:oldLead.id,duplicate_submission:true,booking_confirmed:oldLead.status==="booked",
        customer_email_sent:oldLead.raw_payload?.email_handoff?.customer_handoff_accepted===true,
        owner_email_sent:oldLead.raw_payload?.email_handoff?.owner_handoff_accepted===true}),{status:200,headers:cors(origin)});
    }
  }
  const {data:lead,error:le}=await admin.from("tle_booking_flow_leads").insert({
    account_id:acct.id,
    external_ref:requestRef||clean(b.external_ref,160)||null,
    source:clean(b.source,80)||"booking_page",
    request_type:requestType,
    customer_name:customerName,
    customer_email:customerEmail,
    customer_phone:clean(b.customer_phone,80)||null,
    preferred_language:lang,
    service_name:service||null,
    service_address:clean(b.service_address,600)||null,
    requested_start_at:b.requested_start_at||null,
    status:"new",
    workflow_stage:"new",
    follow_up_at:followAt,
    notes:notes||null,
    raw_payload:rawPayload,
    manage_token_hash:manageHash,
    manage_token_expires_at:new Date(Date.now()+90*24*3600000).toISOString()
  }).select("id").single();
  if(le?.code==="23505"&&requestRef){
    const {data:existing}=await admin.from("tle_booking_flow_leads").select("id,customer_email,status,raw_payload")
       .eq("account_id",acct.id).eq("external_ref",requestRef).maybeSingle();
    if(existing&&existing.customer_email===customerEmail)return new Response(JSON.stringify({ok:true,lead_id:existing.id,
      duplicate_submission:true,booking_confirmed:existing.status==="booked",
      customer_email_sent:existing.raw_payload?.email_handoff?.customer_handoff_accepted===true,
      owner_email_sent:existing.raw_payload?.email_handoff?.owner_handoff_accepted===true}),{status:200,headers:cors(origin)});
    return new Response(JSON.stringify({error:"The request is being processed. Do not submit it twice."}),{status:409,headers:cors(origin)});
  }
  if(le||!lead) return new Response(JSON.stringify({error:"Could not save request."}),{status:500,headers:cors(origin)});

  if(serviceId&&requestType==="booking"&&allowAutomaticFlatConfirmation){
    // Only owner-enabled flat-price bookings reserve a real slot.
    // With automatic confirmation disabled, the request remains pending and holds no slot.
    // The database function checks real weekly hours, closures and overlapping holds atomically.
    if(!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate) || !/^(?:[01]\d|2[0-3]):(?:00|30)$/.test(requestedTime)){
      await admin.from("tle_booking_flow_leads").delete().eq("id",lead.id).eq("account_id",acct.id);
      return new Response(JSON.stringify({error:"Choose a valid date and available start time."}),{status:400,headers:cors(origin)});
    }
    const localStart=requestedDate+"T"+requestedTime+":00";
    const {data:claimed,error:claimError}=await admin.rpc("tle_booking_claim_slot",{p_account_id:acct.id,p_lead_id:lead.id,p_local_start:localStart});
    if(claimError||claimed!==true){
      await admin.from("tle_booking_flow_leads").delete().eq("id",lead.id).eq("account_id",acct.id);
      if(claimError)console.error("Slot claim failed",String(claimError.code||""));
      return new Response(JSON.stringify({error:claimError?"Could not check availability. Please try again.":"This time was just taken or is no longer available. Please choose another."}),{status:409,headers:cors(origin)});
    }
    // Derive a trustworthy UTC appointment time from the business local slot, not the browser.
    let utcStart:string|null=null;
    try {
      const tz=(await admin.from("tle_booking_flow_availability").select("timezone").eq("account_id",acct.id).single()).data?.timezone||acct.timezone||"America/New_York";
      const expected=Date.UTC(Number(requestedDate.slice(0,4)),Number(requestedDate.slice(5,7))-1,Number(requestedDate.slice(8,10)),Number(requestedTime.slice(0,2)),Number(requestedTime.slice(3,5)));
      let candidate=expected;
      for(let i=0;i<4;i++){
        const ps=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(candidate)).filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
        const represented=Date.UTC(Number(ps.year),Number(ps.month)-1,Number(ps.day),Number(ps.hour),Number(ps.minute));
        const diff=expected-represented;
        candidate+=diff;
        if(diff===0)break;
      }
      utcStart=new Date(candidate).toISOString();
    }catch(e){console.error("Could not derive UTC appointment time; local date/time remains available",e);}
    // Trigger CRM routing only after successful slot reservation.
    instantConfirmed=allowAutomaticFlatConfirmation&&requestType==="booking"&&verifiedPrice!==null;
    const {error:routeError}=await admin.from("tle_booking_flow_leads").update({
      updated_at:new Date().toISOString(),
      ...(instantConfirmed?{status:"booked",workflow_stage:"booked",follow_up_at:null}:{}),
      ...(utcStart?{requested_start_at:utcStart}:{})
    }).eq("id",lead.id).eq("account_id",acct.id);
    if(routeError){
      console.error("Reserved appointment could not be routed to CRM",String(routeError.code||""));
      await admin.from("tle_booking_flow_leads").delete().eq("id",lead.id).eq("account_id",acct.id);
      return new Response(JSON.stringify({error:"Could not complete your booking request. Please try again."}),{status:500,headers:cors(origin)});
    }
  }


  let customerSubject="",customerHtml="";
  if(lang==="es"){
    customerSubject="Recibimos tu solicitud — "+(acct.business_name||"");
    customerHtml='<div style="font-family:Arial,sans-serif;line-height:1.6;color:#173f3d"><h2>Gracias, '+html(customerName.split(/\s+/)[0])+'.</h2><p>Recibimos tu solicitud para <strong>'+html(service)+'</strong>.</p><p>'+html(acct.business_name||"El equipo")+' revisará los detalles y continuará contigo pronto.</p><p>No necesitas completar el formulario otra vez. Puedes responder a este correo si necesitas agregar algo.</p></div>';
  }else{
    customerSubject="We received your request — "+(acct.business_name||"");
    customerHtml='<div style="font-family:Arial,sans-serif;line-height:1.6;color:#173f3d"><h2>Thank you, '+html(customerName.split(/\s+/)[0])+'.</h2><p>We received your request for <strong>'+html(service)+'</strong>.</p><p>'+html(acct.business_name||"The team")+' will review the details and follow up with you soon.</p><p>You do not need to submit the form again. Just reply to this email if you need to add anything.</p></div>';
  }

  if(requestType==="booking"&&!instantConfirmed&&!autoDetailing){
    const notice=lang==="es"?
      "<p><strong>Tu cita todavía NO está confirmada.</strong> El horario solicitado no queda reservado hasta que el negocio apruebe y confirme la reserva.</p>":
      "<p><strong>Your appointment is NOT confirmed yet.</strong> The requested time is not reserved until the business approves and confirms the booking.</p>";
    customerHtml=customerHtml.replace("</div>",notice+"</div>");
  }
  if(autoDetailing&&!instantConfirmed){
    const given=html(customerName.split(/\s+/)[0]);
    const safeService=html(service);
    if(lang==="es"){
      customerSubject="Recibimos tu solicitud de detailing — "+brandName;
      customerHtml='<h1 style="font-size:24px;color:#20252a;line-height:1.25;margin:0 0 14px">¡Gracias, '+given+'!</h1><p>Recibimos tu solicitud de <strong>'+safeService+'</strong>. Revisaremos los detalles de tu vehículo y te responderemos con el siguiente paso.</p><p>Si necesitas agregar algo, puedes responder a este correo.</p>';
    }else{
      customerSubject="We received your detailing request — "+brandName;
      customerHtml='<h1 style="font-size:24px;color:#20252a;line-height:1.25;margin:0 0 14px">Thanks, '+given+'!</h1><p>We received your <strong>'+safeService+'</strong> request. We’ll review your vehicle details and get back to you with the next step.</p><p>Need to add anything? Just reply to this email.</p>';
    }
  }
  if(instantConfirmed){
    const when=[requestedDate,requestedTime].filter(Boolean).join(" · ");
    if(lang==="es"){
      customerSubject="Reserva confirmada — "+(acct.business_name||"");
      customerHtml='<div style="font-family:Arial,sans-serif;line-height:1.6;color:#173f3d"><h2>¡Tu reserva está confirmada!</h2><p>Gracias, '+html(customerName.split(/\s+/)[0])+'. Tu servicio <strong>'+html(service)+'</strong> está reservado para <strong>'+html(when)+'</strong>.</p><p>Precio de la reserva: <strong>'+html(estimate)+'</strong>.</p><p>Si necesitas cambiar algún detalle, responde a este correo. '+html(acct.business_name||"El negocio")+' recibirá tu mensaje.</p></div>';
    }else{
      customerSubject="Booking confirmed — "+(acct.business_name||"");
      customerHtml='<div style="font-family:Arial,sans-serif;line-height:1.6;color:#173f3d"><h2>Your booking is confirmed!</h2><p>Thank you, '+html(customerName.split(/\s+/)[0])+'. Your <strong>'+html(service)+'</strong> service is reserved for <strong>'+html(when)+'</strong>.</p><p>Booking price: <strong>'+html(estimate)+'</strong>.</p><p>If anything needs to change, reply to this email so '+html(acct.business_name||"the business")+' can help.</p></div>';
    }
  }
  if(instantConfirmed){
    try{
      const bytes=crypto.getRandomValues(new Uint8Array(32));
      const secret=[...bytes].map(n=>n.toString(16).padStart(2,"0")).join("");
      const sha=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(secret));
      const tokenHash=[...new Uint8Array(sha)].map(n=>n.toString(16).padStart(2,"0")).join("");
      const {error:tokenError}=await admin.from("tle_booking_customer_change_links").insert({
        account_id:acct.id,lead_id:lead.id,token_hash:tokenHash,
        expires_at:new Date(Date.now()+90*86400000).toISOString()
      });
      if(!tokenError){
        const endpoint="https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1/tle-booking-customer-change?token="+secret+"&action=";
        const makeButton=(label:string,action:string)=>'<a style="display:inline-block;padding:12px 18px;border-radius:12px;margin:10px 7px 6px 0;background:#e5f3fb;color:#235b7c;text-decoration:none;font-size:14px;font-weight:700" href="'+endpoint+action+'">'+label+'</a>';
        customerHtml+='<div style="font-family:Arial,sans-serif;margin-top:22px;padding-top:15px;border-top:1px solid #dbe9f2">'+
          '<p style="font-size:14px">'+(lang==="es"?"¿Necesitas cambiar algo? Solicita una cancelación o una nueva fecha. El negocio revisará tu solicitud antes de modificar tu reserva.":"Need to change something? Request a cancellation or a new date. The business will review before changing your confirmed booking.")+'</p>'+
          makeButton(lang==="es"?"Solicitar cancelación":"Request cancellation","cancel")+
          makeButton(lang==="es"?"Cambiar fecha":"Request reschedule","reschedule")+'</div>';
      }else console.error("Customer self-service token unavailable; confirmation remains valid.");
    }catch(e){console.error("Customer self-service link unavailable:",String(e).slice(0,160))}
  }
  const summaryDetail=autoDetailing?[propertyType,vehicleCondition].filter(Boolean).join(" · "):[propertyType,bedrooms?bedrooms+" bed":"",bathrooms?bathrooms+" bath":"",squareFootage].filter(Boolean).join(" · ");
  const summaryTime=[requestedDate,requestedTime].filter(Boolean).join(" · ");
  customerHtml=brandedCustomerEmail(customerHtml,brandName,brandLogo,service,summaryDetail,summaryTime,instantConfirmed,lang==="es",primary,accent);
  const ownerEmail=acct.notification_email||acct.owner_email;
  // The same inbox should not receive both the customer's receipt and the business alert.
  const ownerSameAsCustomer=clean(ownerEmail,254).toLowerCase()===customerEmail;
  const base="https://thelaunchera.com/lead-action/?token="+manageRaw+"&action=";
  const ownerSubject=(instantConfirmed?"New confirmed booking":requestIntent==="inquiry"?"New customer inquiry":requestType==="quote"?"New quote request":"New booking request")+" — "+customerName;
  const propertyBits=autoDetailing?[propertyType,vehicleCondition].filter(Boolean).join(" · "):[propertyType,bedrooms?bedrooms+" bed":"",bathrooms?bathrooms+" bath":"",squareFootage].filter(Boolean).join(" · ");
  const timing=[requestedDate,requestedTime].filter(Boolean).join(" · ");
  const row=(label:string,value:string)=>value?'<tr><td style="padding:9px 0;color:#7a817e;font-size:12px;border-bottom:1px solid #e9ecea">'+html(label)+'</td><td style="padding:9px 0;text-align:right;font-weight:700;font-size:12px;border-bottom:1px solid #e9ecea">'+html(value)+'</td></tr>':"";
  const btn=(label:string,url:string,bg:string,color:string)=>'<a href="'+url+'" style="display:inline-block;background:'+bg+';color:'+color+';padding:11px 13px;text-decoration:none;border-radius:8px;margin:4px 5px 4px 0;font-size:12px;font-weight:700">'+html(label)+'</a>';
  const commandCenterUrl=/^cb\s*depot$/i.test(brandName)?"https://the-launch-era-crm.dailinsegura17.workers.dev/?app=cb-depot":"https://thelaunchera.com/command-center/";
  const trackerCta='<div style="margin-top:18px"><a href="'+commandCenterUrl+'" style="display:block;text-align:center;background:#c7e7fa;color:#191919;padding:13px 15px;text-decoration:none;border-radius:9px;font-size:13px;font-weight:800">Open Command Center →</a></div>';
  const middleLabel=requestType==="quote"?"Prepare Quote":"Review";
  const ownerHtml='<div style="font-family:Arial,sans-serif;background:#f7f8f7;padding:24px;color:#191919"><div style="max-width:620px;margin:auto;background:#fff;border:1px solid #e1e5e3;border-radius:14px;padding:22px"><div style="border-radius:12px;background:'+primary+';padding:17px;margin-bottom:19px">'+emailBrandHeader(brandName,brandLogo,textOn(primary))+'</div><div style="font-size:11px;font-weight:800;letter-spacing:.08em;color:#355f78">'+(instantConfirmed?'CONFIRMED BOOKING':requestType==='quote'?'NEW QUOTE REQUEST':'NEW BOOKING REQUEST')+'</div><h2 style="margin:8px 0 4px;font-size:24px">'+html(customerName)+'</h2><p style="margin:0 0 18px;color:#6d7471;font-size:13px">Everything the client sent, in one place.</p><table style="width:100%;border-collapse:collapse">'+row("Service",service)+row(autoDetailing?"Vehicle type & condition":"Property",propertyBits)+row("Preferred time",timing)+row("Estimate",estimate)+(autoDetailing?"":row("Frequency",frequency))+row("Extras",extras)+row(autoDetailing?"Service location":"Address",clean(b.service_address,600))+row("Phone",clean(b.customer_phone,80))+row("Email",customerEmail)+row("Notes",notes)+'</table><div style="margin-top:18px">'+btn("Reviewing",base+"reviewing","#c7e7fa","#191919")+btn(middleLabel,base+"quoted","#191919","#ffffff")+(instantConfirmed?'':btn("Booked",base+"booked","#191919","#ffffff"))+btn("Pause follow-up",base+"pause","#ffffff","#191919")+'</div>'+trackerCta+'<p style="margin:16px 0 0;color:#7a817e;font-size:11px">The request is saved in your private Lead Command Center with its status and follow-up attached.</p><p style="font-size:11px;margin-top:12px"><a href="https://thelaunchera.com/" style="color:#276eaf;text-decoration:underline">Powered by The Launch Era</a></p></div></div>';

  const customerSent=await send({
    type:"booking_flow_message",
    customer_email:customerEmail,
    business_name:brandName,
    reply_to:acct.crm_workspace_id&&acct.follow_up_enabled?"r-"+lead.id+"@nupelke.resend.app":ownerEmail,
    email_subject:customerSubject,email_language:lang,
    email_html:customerHtml,
    business_id:String(acct.id),
    outbox_id:String(lead.id),email_role:"customer_receipt"
  });
  const ownerSent=ownerEmail&&!ownerSameAsCustomer?await send({
    type:"booking_flow_message",
    customer_email:ownerEmail,
    business_name:brandName,
    reply_to:customerEmail,
    email_subject:ownerSubject,
    email_html:ownerHtml,
    business_id:String(acct.id),
    outbox_id:String(lead.id),email_role:"owner_notification"
  }):false;


  // Record provider handoff results. Never claim inbox delivery based solely on a webhook acknowledgement.
  // Surface failures within the buyer's private Command Center, without resending automatically
  // (an upstream timeout can be ambiguous and an automatic retry could duplicate messages).
  const checkedAt=new Date().toISOString();
  const emailCheck={customer_handoff_accepted:customerSent,owner_handoff_accepted:ownerSent||ownerSameAsCustomer,owner_notification_suppressed_same_recipient:ownerSameAsCustomer,checked_at:checkedAt};
  const managedFirstDue=customerSent&&optionalCareOptIn&&requestType==="quote"&&acct.follow_up_enabled===true&&acct.crm_workspace_id&&acct.delivery_sent_at?
    new Date(Date.now()+Math.max(12,Math.min(168,Number(acct.follow_up_delay_hours||24)))*3600000).toISOString():null;
  const {data:mailLead}=await admin.from("tle_booking_flow_leads").select("raw_payload")
    .eq("id",lead.id).eq("account_id",acct.id).maybeSingle();
  await admin.from("tle_booking_flow_leads").update({
     raw_payload:{...(mailLead?.raw_payload||{}),email_handoff:emailCheck},
     follow_up_at:managedFirstDue,
     updated_at:checkedAt
  }).eq("id",lead.id).eq("account_id",acct.id);
  if((!customerSent||(!ownerSent&&!ownerSameAsCustomer))&&acct.crm_workspace_id){
    const issues=[!customerSent?"customer confirmation":"",!ownerSent&&!ownerSameAsCustomer?"business notification":""].filter(Boolean).join(" and ");
    await admin.from("tle_crm_notifications").insert({
      workspace_id:acct.crm_workspace_id,kind:"lead",
      title:"Email needs attention",
      body:customerName+" · "+service+" · Failed handoff: "+issues+". Check email status before retrying manually.",
      source_key:"booking-email-handoff:"+String(lead.id)
    }).then(({error}:any)=>{if(error)console.error("Email alert could not be recorded",error.code)});
  }


  // After an inbound quote request has been acknowledged, schedule up to two
  // operational follow-ups in the buyer's own CRM, never in The Launch Era's CRM.
  // Booked flat-rate jobs never enter this quote-follow-up sequence.
  // Optional quote follow-ups are handled by one consent-aware managed worker, never two CRM sequences.
  return new Response(JSON.stringify({ok:true,lead_id:lead.id,booking_confirmed:instantConfirmed,customer_email_sent:customerSent,owner_email_sent:ownerSent}),{status:200,headers:cors(origin)});
});
