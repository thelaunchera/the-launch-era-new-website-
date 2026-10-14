import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SITE="https://thelaunchera.com";
const allowed=new Set([SITE,"https://www.thelaunchera.com"]);
const SUPABASE_URL=Deno.env.get("SUPABASE_URL")||"";
const SERVICE_ROLE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const STRIPE_KEY=Deno.env.get("STRIPE_SECRET_KEY")||"";
const MAKE_NOTIFY="https://hook.us2.make.com/e2kwo18h9cx4sq12hwfli48e5twqzom4";
function headers(origin:string){return {"Content-Type":"application/json","Access-Control-Allow-Origin":allowed.has(origin)?origin:SITE,"Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Cache-Control":"no-store","Vary":"Origin"};}
function json(data:unknown,status=200,origin=""){return new Response(JSON.stringify(data),{status,headers:headers(origin)});}
function clean(value:unknown,max=300){return String(value??"").replace(/[<>\u0000-\u001f]/g," ").trim().slice(0,max);}
function validUrl(v:string){if(!v)return true;try {const u=new URL(v);return u.protocol==="https:"&&u.hostname.includes(".")&&!u.username&&!u.password;}catch{return false;}}
function mailEsc(x:any){return String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function safeImage(v:any){const x=clean(v,850);if(!x)return "";try{const u=new URL(x);return u.protocol==="https:"&&/\.(png|jpe?g|webp)$/i.test(u.pathname)?u.toString():""}catch{return ""}}
function color(v:any,fallback:string){return /^#[0-9a-fA-F]{6}$/.test(String(v||""))?String(v):fallback}
function contrast(bg:string){const a=[1,3,5].map(i=>parseInt(bg.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*a[0]+.7152*a[1]+.0722*a[2]>.4?"#191919":"#ffffff"}
function aiEmail(name:string,logo:string,primary:string,accent:string,lang:string,offer:string){
 const es=lang==="es",bn=mailEsc(name),image=logo?'<img src="'+mailEsc(logo)+'" alt="'+bn+' logo" width="68" height="68" style="display:block;max-height:68px;max-width:100px;height:auto;border:0;margin-right:12px"/>':"";
 const body=es?'<h1 style="font-size:25px;margin:0 0 15px">Recibimos tu configuración.</h1><p>Gracias por enviar la información de <strong>'+bn+'</strong> para tu asistente de IA ('+mailEsc(offer)+').</p><p>Primero revisaremos los datos de configuración, los accesos y el pago. Tu proyecto todavía no está en producción. Recibirás otro correo cuando aprobemos el inicio; desde ese momento comienza el plazo estimado de 48 horas de producción, durante el siguiente período disponible.</p><p>Hoy pagaste solamente la instalación. Tus primeros 30 días de servicio empiezan cuando entreguemos y activemos tu asistente; la mensualidad comienza después de esos 30 días.</p><p>Te escribiremos cuando esté listo. Revisa Entrada, Promociones y Spam.</p>':
 '<h1 style="font-size:25px;margin:0 0 15px">We received your setup details.</h1><p>Thanks for sharing <strong>'+bn+'</strong> details for your AI Assistant ('+mailEsc(offer)+').</p><p>We’ll review your setup details, required access and payment first. Your project is not yet in production. We’ll send a separate email when the start is approved; the estimated 48-hour production window begins from that kickoff, in the next available production period.</p><p>You only paid the installation fee today. Your first 30 days of service begin when we deliver and activate your assistant; monthly billing starts after those 30 days.</p><p>We’ll email you when it’s ready. Please check Inbox, Promotions and Spam.</p>';
 return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#f6f4f0;margin:0;padding:24px 12px;font-family:Arial,Helvetica,sans-serif"><table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:580px;margin:auto;border-radius:16px;border:1px solid #e3ded6;background:#fff"><tr><td style="padding:23px;background:'+primary+';border-radius:16px 16px 0 0"><table role="presentation"><tr><td>'+image+'</td><td style="font-size:21px;font-weight:800;color:'+contrast(primary)+'">'+bn+'</td></tr></table></td></tr><tr><td style="padding:27px 24px;font-size:15px;line-height:1.65;color:#191919">'+body+'</td></tr><tr><td style="padding:15px 24px;background:#faf9f6;border-top:1px solid #e6e0d9;font-size:11px;color:#666">'+bn+' · <span style="font-weight:700">Powered by The Launch Era</span></td></tr></table></body></html>';
}
async function db(path:string,init:RequestInit={}){return fetch(SUPABASE_URL+"/rest/v1/"+path,{...init,headers:{"apikey":SERVICE_ROLE,"Authorization":"Bearer "+SERVICE_ROLE,"Content-Type":"application/json","Prefer":"return=representation",...(init.headers||{})}});}
async function verifiedSession(sessionId:string){
 if(!/^cs_live_[A-Za-z0-9_]+$/.test(sessionId)||sessionId.length>160)throw new Error("invalid-session");
 const result=await fetch("https://api.stripe.com/v1/checkout/sessions/"+encodeURIComponent(sessionId),{headers:{"Authorization":"Bearer "+STRIPE_KEY}});
 if(!result.ok)throw new Error("unverified-session");
 const s=await result.json();
 const amountByOffer:Record<string,number>={"ai-booking":7900,"ai-followup":5900,"ai-business":11900}; 
 const paidOffer=String(s.metadata?.offer||"");
 const bundledAddon=String(s.metadata?.ai_addon||"");
 const isBundle=paidOffer==="booking-flow"&&s.metadata?.tle_flow==="booking_flow"&&Object.prototype.hasOwnProperty.call(amountByOffer,bundledAddon);
 const selectedOffer=isBundle?bundledAddon:paidOffer;
 const rawDiscount=String(s.metadata?.bundle_discount_percent||"");
 const percent=rawDiscount==="40"?40:rawDiscount===""||rawDiscount==="0"?0:-1;
 if(percent<0||(!isBundle&&percent!==0))throw new Error("unverified-discount");
 const expectedAmount=isBundle?Math.round(1999*(100-percent)/100)+Math.round(amountByOffer[selectedOffer]*(100-percent)/100):amountByOffer[selectedOffer];
 if(isBundle&&percent!==0&&(Number(s.metadata?.booking_setup_paid_cents)!==Math.round(1999*(100-percent)/100)||Number(s.metadata?.ai_setup_paid_cents)!==Math.round(amountByOffer[selectedOffer]*(100-percent)/100)))throw new Error("invalid-bundle-price");
 if(s.id!==sessionId||s.livemode!==true||s.mode!=="payment"||s.status!=="complete"||s.payment_status!=="paid"||!amountByOffer[selectedOffer]||Number(s.amount_total)!==expectedAmount||typeof s.payment_intent!=="string"||typeof s.customer!=="string")throw new Error("payment-not-confirmed");
 const email=clean(s.customer_details?.email||s.customer_email,200);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("email-not-confirmed");
 return {email,customer:s.customer,payment_intent:s.payment_intent,offer:selectedOffer,isBundle};
}
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return json({error:"Method not allowed"},405,origin);
 if(!allowed.has(origin))return json({error:"Not allowed"},403,origin);
 if(!STRIPE_KEY||!SERVICE_ROLE||!SUPABASE_URL)return json({error:"Verification unavailable"},503,origin);
 const isPhotoUpload=(req.headers.get("content-type")||"").includes("multipart/form-data");
 if(Number(req.headers.get("content-length")||0)>(isPhotoUpload?5500000:5500))return json({error:"Request too large"},413,origin);
 try{
  const uploadForm=isPhotoUpload?await req.formData().catch(()=>null):null;
  const b=isPhotoUpload?{session_id:uploadForm?.get("session_id"),action:uploadForm?.get("action")}:await req.json().catch(()=>null);
  if(!b||typeof b!=="object")return json({error:"Invalid request"},400,origin);
  const sessionId=clean(b.session_id,170);
  const verified=await verifiedSession(sessionId);
  const existing=await db("tle_ai_agent_orders?stripe_session_id=eq."+encodeURIComponent(sessionId)+"&select=status,owner_notified_at,owner_notification_attempt_at&limit=1");
  if(!existing.ok)throw new Error("orders-read");
  const rows=await existing.json(),stored=rows?.[0]||null;
  if(b.action==="upload_avatar"){
   if(!isPhotoUpload||stored?.owner_notified_at||stored?.status==="active"||stored?.status==="in_setup")return json({error:"This setup is no longer open for uploads."},409,origin);
   const photo=uploadForm?.get("photo");
   if(!(photo instanceof File)||!photo.size||photo.size>5242880)return json({error:"Choose a photo no larger than 5 MB."},400,origin);
   const bytes=new Uint8Array(await photo.arrayBuffer());
   const isJpeg=bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
   const isPng=bytes.length>=8&&[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);
   const isWebp=bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
   const isHeic=bytes.length>=12&&String.fromCharCode(...bytes.slice(4,8))==="ftyp"&&["heic","heix","hevc","hevx","mif1","msf1","heif"].includes(String.fromCharCode(...bytes.slice(8,12)));
   if(!isJpeg&&!isPng&&!isWebp&&!isHeic)return json({error:"Choose a JPG, PNG, WebP or HEIC image."},400,origin);
   const ext=isJpeg?"jpg":isPng?"png":isWebp?"webp":"heic",mime=isJpeg?"image/jpeg":isPng?"image/png":isWebp?"image/webp":"image/heic";
   const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(sessionId));
   const key=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
   const path="ai-assistant/"+key+"/avatar."+ext;
   const save=await fetch(SUPABASE_URL+"/storage/v1/object/tle-intake-brand-assets/"+path,{method:"POST",headers:{"Authorization":"Bearer "+SERVICE_ROLE,"apikey":SERVICE_ROLE,"Content-Type":mime,"x-upsert":"true"},body:bytes});
   if(!save.ok){console.error("AI avatar private upload failed",save.status);return json({error:"The photo could not be uploaded. Please retry."},500,origin);}
   return json({ok:true,path,name:clean(photo.name,120)},200,origin);
  }
  if(b.action==="verify")return json({verified:true,agent_offer:verified.offer,bundle_booking_flow:verified.isBundle,already_submitted:stored?.status==="intake_submitted"||stored?.status==="in_setup"||stored?.status==="active"},200,origin);
  if(b.action!=="submit")return json({error:"Unknown action"},400,origin);
  if(stored?.owner_notified_at)return json({ok:true,already_submitted:true},200,origin);
  if(stored?.owner_notification_attempt_at)return json({ok:true,already_submitted:true,notification_pending_verification:true},200,origin);
  const business=clean(b.business_name,120),target=clean(b.install_target,30);
  const website=clean(b.website_url,260),booking=clean(b.booking_page_url,260);
  const services=clean(b.services_offered,700),notes=clean(b.business_notes,600),goals=clean(b.assistant_goals,170),lang=b.language==="es"?"es":"en";
  const contactName=clean(b.contact_name,120),avatarName=clean(b.avatar_name,80),avatarPath=clean(b.avatar_photo_path,260);
  if(contactName.length<2||avatarName.length<2)return json({error:"Add your name and your assistant avatar name."},400,origin);
  if(avatarPath){
   const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(sessionId));
   const key=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
   const prefix="ai-assistant/"+key+"/",filename=avatarPath.slice(prefix.length);
   if(!avatarPath.startsWith(prefix)||!/^avatar\.(jpg|png|webp|heic)$/.test(filename))return json({error:"Avatar photo was not verified."},400,origin);
   const listing=await fetch(SUPABASE_URL+"/storage/v1/object/list/tle-intake-brand-assets",{method:"POST",headers:{"Authorization":"Bearer "+SERVICE_ROLE,"apikey":SERVICE_ROLE,"Content-Type":"application/json"},body:JSON.stringify({prefix,limit:20})});
   if(!listing.ok)return json({error:"Could not verify uploaded avatar."},500,origin);
   const photos=await listing.json();if(!Array.isArray(photos)||!photos.some((p:any)=>p.name===filename))return json({error:"Please upload your avatar photo again."},400,origin);
  }
  let brandLogo=safeImage(b.brand_logo_url),brandPrimary=color(b.brand_primary_color,"#191919"),brandAccent=color(b.brand_accent_color,"#087DFF");
  let brandCategory=["cleaning","detailing","other"].includes(String(b.business_category||""))?String(b.business_category):"";
  // Reuse a matching already-paid and owner-approved brand, never another company's logo.
  try{
   const match=await db("tle_booking_flow_accounts?owner_email=eq."+encodeURIComponent(verified.email)+"&payment_status=eq.paid&select=id,business_name,business_category&limit=20");
   if(match.ok){
    const candidates=await match.json();const found=candidates.find((a:any)=>String(a.business_name||"").trim().toLowerCase()===business.toLowerCase());
    if(found){
     const response=await db("tle_booking_page_branding?account_id=eq."+found.id+"&select=logo_image,primary_color,accent_color,design_reviewed_at&limit=1");
     if(response.ok){const [approved]=await response.json();if(approved?.design_reviewed_at){
       brandLogo=safeImage(approved.logo_image)||brandLogo;brandPrimary=color(approved.primary_color,brandPrimary);brandAccent=color(approved.accent_color,brandAccent);brandCategory=found.business_category||brandCategory;
     }}
    }
   }
  }catch(e){console.error("Optional approved AI branding lookup unavailable");}
  if(clean(b.agent_requested,40)!==verified.offer)return json({error:"The selected assistant does not match your paid plan."},403,origin);
  if(business.length<2||!["booking_page","existing_website","both"].includes(target)||!validUrl(website)||!validUrl(booking)||!services)return json({error:"Please complete your business and installation details."},400,origin);
  if(target==="booking_page"&&!booking&&!verified.isBundle)return json({error:"Please include your Booking Page URL."},400,origin);
  if(target==="existing_website"&&!website)return json({error:"Please include your website URL."},400,origin);
  if(target==="both"&&(!website||(!booking&&!verified.isBundle)))return json({error:"Please include both URLs."},400,origin);
  const order={
   stripe_session_id:sessionId,stripe_subscription_id:null,stripe_customer_id:verified.customer,stripe_payment_intent_id:verified.payment_intent,customer_email:verified.email,
   offer:verified.offer,status:"intake_submitted",business_name:business,contact_name:contactName,avatar_name:avatarName,avatar_photo_path:avatarPath||null,install_target:target,
   booking_page_url:booking||null,website_url:website||null,services_offered:services,business_notes:("Priority: "+goals+"\n"+(verified.isBundle?"Bundle: Booking Automation + Command Center + "+verified.offer+". Link new Booking Page after delivery.\n":"")+notes).slice(0,800),
   preferred_language:lang,brand_logo_url:brandLogo||null,brand_primary_color:brandPrimary,brand_accent_color:brandAccent,brand_category:brandCategory||null,monthly_amount_cents:({"ai-booking":2900,"ai-followup":1900,"ai-business":3900} as Record<string,number>)[verified.offer],submitted_at:new Date().toISOString(),updated_at:new Date().toISOString()
  };
  const saved=await db("tle_ai_agent_orders?on_conflict=stripe_session_id",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=representation"},body:JSON.stringify(order)});
  if(!saved.ok)throw new Error("intake-save");
  // Exactly one in-flight notification per paid order, even with parallel submits.
  const attemptAt=new Date().toISOString();
  const claim=await db("tle_ai_agent_orders?stripe_session_id=eq."+encodeURIComponent(sessionId)+"&owner_notified_at=is.null&owner_notification_attempt_at=is.null",{
    method:"PATCH",body:JSON.stringify({owner_notification_attempt_at:attemptAt})
  });
  if(!claim.ok)throw new Error("intake-email-claim");
  const claimed=await claim.json().catch(()=>[]);
  if(!Array.isArray(claimed)||claimed.length!==1)
   return json({ok:true,already_submitted:true,notification_pending_verification:true},200,origin);
  let notified=false;
  try{
    const response=await fetch(MAKE_NOTIFY,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer_email:verified.email,business_name:business,contact_name:contactName,avatar_name:avatarName,avatar_photo_path:avatarPath||null,agent_offer:verified.offer,assistant_goals:goals,install_target:target,website_url:website,booking_page_url:booking,services_offered:services,business_notes:notes,session_id:sessionId,bundle_booking_flow:verified.isBundle,language:lang,brand_logo_url:brandLogo,brand_primary_color:brandPrimary,brand_accent_color:brandAccent,business_category:brandCategory,email_html:aiEmail(business,brandLogo,brandPrimary,brandAccent,lang,verified.offer)})});
    notified=response.ok;
  }catch(e){console.error("AI intake email route unavailable",e instanceof Error?e.message:"unknown");}
  if(notified){await db("tle_ai_agent_orders?stripe_session_id=eq."+encodeURIComponent(sessionId)+"&owner_notification_attempt_at=eq."+encodeURIComponent(attemptAt),{method:"PATCH",body:JSON.stringify({owner_notified_at:new Date().toISOString()})});}
  // If provider acceptance is ambiguous, keep the attempt lock. Do not resend automatically.
  return json({ok:true,notifications_sent:notified,already_submitted:false},200,origin);
 }catch(e){console.error("AI onboarding verification failed",e instanceof Error?e.message:"unknown");return json({error:"We couldn't verify your payment or save your setup information. Please try again."},403,origin);}
});