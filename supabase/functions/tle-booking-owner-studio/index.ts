import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const origins=new Set(["https://the-launch-era-crm.dailinsegura17.workers.dev","https://thelaunchera.com","https://www.thelaunchera.com"]);
// New client invitations must always open the PRIVATE workspace, never marketing or legacy hosting.
const PRIVATE_CLIENT_ENTRY="https://thelaunchera.com/command-center/?from=private-access";
const headers=(origin:string)=>({"Content-Type":"application/json","Cache-Control":"no-store","Access-Control-Allow-Origin":origins.has(origin)?origin:"https://the-launch-era-crm.dailinsegura17.workers.dev","Access-Control-Allow-Headers":"authorization,content-type,apikey","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin"});
const respond=(status:number,x:any,origin:string)=>new Response(JSON.stringify(x),{status,headers:headers(origin)});
const trim=(x:any,max=400)=>String(x??"").trim().slice(0,max);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const color=(v:any,fallback:string)=>/^#[0-9a-fA-F]{6}$/.test(String(v||""))?String(v).toUpperCase():fallback;
function safeImage(raw:any){
 const s=trim(raw,800);if(!s)return "";
 try{const u=new URL(s);if(u.protocol!=="https:"||u.username||u.password||/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(u.hostname)||(!/\.(jpe?g|png|webp)$/i.test(u.pathname)&&!(u.hostname==="raw.githubusercontent.com"&&u.pathname.startsWith("/thelaunchera/the-launch-era-new-website-/main/public/assets/clients/")&&u.pathname.endsWith(".svg"))))throw Error("Invalid image");
 return u.href}catch{throw Error("Use an HTTPS JPG, PNG or WEBP image link.")}}
function parseReviews(value:any){
 if(!Array.isArray(value))return [];
 if(value.length>6)throw Error("Use no more than six genuine customer reviews.");
 return value.map(x=>({name:trim(x?.name,70).replace(/[<>]/g,""),text:trim(x?.text,450).replace(/[<>]/g,""),rating:Number.isInteger(Number(x?.rating))&&Number(x.rating)>=1&&Number(x.rating)<=5?Number(x.rating):null}))
 .filter(x=>x.name&&x.text);
}
function intakeDraft(a:any){
 const i=a.intake_payload||{};
 return {business_name:trim(a.business_name||i.business_name,120),headline:trim(i.main_offer,115),description:trim(i.about_business,420),
 service_area:trim(i.service_areas,240),hero_image:trim(i.hero_photo_url,800),logo_image:trim(i.logo_assets_link,800),
 primary_color:"#DCEFFA",accent_color:"#3A7399",reviews:parseReviews(i.reviews_permission===true?i.customer_reviews:[])};
}

function intakePhotos(account:any){
 const photos=account.intake_payload?.branding_photos;
 if(!Array.isArray(photos))return [];
 return photos.slice(0,10).filter((x:any)=>x&&typeof x.path==="string"&&x.path.length<700&&!x.path.includes("..")&&!x.path.startsWith("/")&&/^[a-z0-9_.\/-]+\.(jpg|jpeg|png|webp|heic|heif)$/i.test(x.path))
 .map((x:any)=>({path:x.path,name:trim(x.name,130),mime:trim(x.mime,70)}));
}
async function previewPhotos(db:any,items:any[]){
 const signed=await Promise.all(items.map(async (asset:any)=>{
  const {data,error}=await db.storage.from("tle-intake-brand-assets").createSignedUrl(asset.path,900);
  return {...asset,preview_url:!error?data?.signedUrl||"":""};
 }));
 return signed;
}
async function publishSelected(db:any,accountId:string,path:string){
 if(!path)return "";
 const format=path.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)?.[1];
 if(!format)throw Error("HEIC images can be stored privately, but select a JPG, PNG or WebP for the public Booking Page.");
 const {data:blob,error:readError}=await db.storage.from("tle-intake-brand-assets").download(path);
 if(readError||!blob)throw Error("Selected intake photo is missing. Ask the buyer to upload the photo again.");
 if(blob.size>5242880)throw Error("The selected image exceeds the 5 MB limit.");
 const mime=format==="png"?"image/png":format==="webp"?"image/webp":"image/jpeg";
 const bytes=new Uint8Array(await blob.slice(0,14).arrayBuffer());
 const verified=mime==="image/png"?(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71):
  mime==="image/webp"?(bytes[0]===82&&bytes[1]===73&&bytes[2]===70&&bytes[3]===70&&bytes[8]===87):
  (bytes[0]===255&&bytes[1]===216&&bytes[2]===255);
 if(!verified)throw Error("The image file could not be verified for public display.");
 const target=accountId+"/"+crypto.randomUUID()+"."+(format==="jpeg"?"jpg":format);
 const {error:uploadError}=await db.storage.from("tle-booking-approved-media").upload(target,blob,{cacheControl:"3600",upsert:false,contentType:mime});
 if(uploadError)throw Error("Could not publish the selected image to the booking website.");
 return db.storage.from("tle-booking-approved-media").getPublicUrl(target).data.publicUrl||"";
}

const escapeHtml=(v:any)=>String(v??"").replace(/[&<>"']/g,(ch:string)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"} as Record<string,string>)[ch]||ch);
function emailLogoUrl(value:any,businessName:string){
 const supplied=trim(value,1000);
 try{
  const u=new URL(supplied);
  if(u.protocol==="https:" && /\.(png|jpe?g|webp)$/i.test(u.pathname))return u.toString();
 }catch{}
 // Approved CB Depot PNG, rather than an SVG unsupported by many email clients.
 if(/^cb\s*depot$/i.test(trim(businessName,120)))return "https://thelaunchera.com/assets/clients/cb-depot/approved-favicon-192.png";
 return "";
}
function approvedEmailColor(v:any,fallback:string){const x=String(v||"");return /^#[\da-fA-F]{6}$/.test(x)?x:fallback}
function emailContrast(hex:string){const r=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return (.2126*r[0]+.7152*r[1]+.0722*r[2])>.4?"#191919":"#ffffff"}
function validBusinessCategory(category:string,other:string){
 return ["cleaning","detailing","other"].includes(category)&&(category!=="other"||!!trim(other,80));
}
function activationContent(category:string,other:string,businessName:string,language:string,link:string,firstName:string,logoUrl:string,primaryColor="#191919",accentColor="#176dd8"){
 const es=language==="es";
 const h=escapeHtml;
 const label=category==="detailing"?(es?"detallado profesional de autos":"professional car detailing"):category==="cleaning"?(es?"servicios de limpieza":"cleaning services"):trim(other,80)||"business services";
 const brand=h(businessName),focus=h(label),href=h(link),image=emailLogoUrl(logoUrl,businessName),primary=approvedEmailColor(primaryColor,"#191919"),accent=approvedEmailColor(accentColor,"#176dd8"),fg=emailContrast(primary),buttonFg=emailContrast(accent);
 const subject=es?"Acceso privado de "+businessName+" | The Launch Era":businessName+" — your private Command Center access";
 // Never guess the account holder's name from checkout fields: multiple names can appear on an order.
 const intro=es?"Hola,":"Hello,";
 const line1=es?"Tu Command Center privado de <strong>"+brand+"</strong> está preparado.":"Your private <strong>"+brand+"</strong> Command Center is ready."
 const line2=es?"En tu Command Center podrás gestionar solicitudes, cotizaciones, reservas y actividad de clientes en un solo lugar.":"Your Command Center brings customer inquiries, quotes, bookings, and follow-ups together in one place.";
 const line3=es?"Configurado para tu negocio de "+focus+". Al abrir el enlace, confirma tu correo y crea tu contraseña si el sistema te lo solicita.":"Set up for your "+focus+" business. Open the secure link, verify your email and create a password if prompted."
 const cta=es?"Activar mi Command Center":"Activate my Command Center";
 const note=es?"Usa el mismo correo de tu compra. Si no solicitaste este acceso, ignora este mensaje. No compartas este enlace.":"Use the email address from your purchase. If you didn't request this access, you can safely ignore this message. Do not share the link.";
 const next=es?"La entrega final de tu Booking Page se confirmará por separado después de las pruebas.":"Your final Booking Page delivery will be confirmed separately after testing.";
 const reviewHeadsUp=es?"Sabemos que tienes mucho que hacer. Si pasan 8 horas sin respuesta, podríamos enviarte un recordatorio amable.":"We know you're busy. If we haven't heard back after 8 hours, we may send one friendly reminder.";
 const companyLogo=image?'<img src="'+h(image)+'" alt="'+brand+' logo" width="72" height="72" style="display:block;max-width:72px;height:auto;max-height:72px;border:0;object-fit:contain;margin:0 auto 8px"/>':'';
 const logoBlock='<table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin:0 0 23px;border-collapse:separate;border-spacing:0"><tr><td align="center" style="padding:16px 12px;background:#ffffff;border:1px solid #e2e5e9;border-radius:12px">'+companyLogo+'<div style="font-family:Arial,Helvetica,sans-serif;font-weight:800;font-size:19px;line-height:25px;color:#191919">'+brand+'</div><div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;color:#667e8a">'+(es?'TU ESPACIO PRIVADO':'YOUR PRIVATE WORKSPACE')+'</div></td></tr></table>';
 const html='<!DOCTYPE html><html lang="'+(es?"es":"en")+'"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>'+h(subject)+'</title></head><body style="margin:0;padding:0;background-color:#f3f6f9"><table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="background-color:#f3f6f9"><tr><td align="center" bgcolor="#f3f6f9" style="padding-top:24px;padding-bottom:30px;padding-left:14px;padding-right:14px"><table width="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="max-width:560px;background-color:#FAF8F3;border:1px solid #e1e7ed;border-radius:16px"><tr><td bgcolor="'+primary+'" style="background-color:'+primary+';border-radius:16px 16px 0 0;padding-top:27px;padding-bottom:27px;padding-left:29px;padding-right:29px"><p style="font-family:Arial,Helvetica,sans-serif;color:'+fg+';font-size:13px;font-weight:700;line-height:20px;letter-spacing:1.8px;margin:0">THE LAUNCH ERA</p><p style="font-family:Arial,Helvetica,sans-serif;color:'+fg+';font-size:12px;line-height:20px;margin-top:7px;margin-bottom:0">Booking Automation + Command Center</p></td></tr><tr><td bgcolor="#FAF8F3" style="background-color:#FAF8F3;padding-top:32px;padding-bottom:29px;padding-left:29px;padding-right:29px">'+logoBlock+'<p style="font-family:Arial,Helvetica,sans-serif;color:#2878bd;font-size:11px;font-weight:700;line-height:17px;letter-spacing:1.6px;margin-top:0;margin-bottom:10px">'+(es?"ACCESO PRIVADO":"PRIVATE CLIENT ACCESS")+'</p><h1 style="font-family:Arial,Helvetica,sans-serif;color:#191919;font-size:28px;font-weight:700;line-height:35px;letter-spacing:-0.5px;margin-top:0;margin-bottom:21px">'+(es?"Tu Command Center está preparado.":"Your Command Center access is ready.")+'</h1><p style="font-family:Arial,Helvetica,sans-serif;color:#26323c;font-size:15px;line-height:24px;margin-top:0;margin-bottom:15px">'+intro+'</p><p style="font-family:Arial,Helvetica,sans-serif;color:#26323c;font-size:15px;line-height:25px;margin-top:0;margin-bottom:16px">'+line1+'</p><p style="font-family:Arial,Helvetica,sans-serif;color:#475767;font-size:15px;line-height:25px;margin-top:0;margin-bottom:16px">'+line2+'</p><p style="font-family:Arial,Helvetica,sans-serif;color:#475767;font-size:14px;line-height:23px;margin-top:0;margin-bottom:23px">'+line3+'</p><table cellspacing="0" cellpadding="0" border="0" role="presentation" style="margin-top:22px;margin-bottom:20px"><tr><td bgcolor="'+accent+'" style="background-color:'+accent+';border-radius:10px;padding-top:15px;padding-bottom:15px;padding-left:24px;padding-right:24px"><a href="'+href+'" style="font-family:Arial,Helvetica,sans-serif;color:'+buttonFg+';text-decoration:none;font-size:14px;font-weight:700;line-height:21px">'+cta+' &rarr;</a></td></tr></table><p style="font-family:Arial,Helvetica,sans-serif;color:#5a6b7a;font-size:12px;line-height:20px;margin-top:0;margin-bottom:9px">'+(es?"¿No abrió el primer botón? Prueba el acceso seguro aquí:":"If the first button doesn&#39;t open, try the secure access button below:")+'</p><table cellspacing="0" cellpadding="0" border="0" role="presentation" style="margin-top:0;margin-bottom:21px"><tr><td bgcolor="#e7f1fb" style="background-color:#e7f1fb;border:1px solid #b4d0ea;border-radius:9px;padding-top:11px;padding-bottom:11px;padding-left:17px;padding-right:17px"><a href="'+href+'" style="font-family:Arial,Helvetica,sans-serif;color:#145c9c;text-decoration:none;font-size:13px;font-weight:700;line-height:20px">'+(es?"Abrir enlace seguro":"Open secure link")+' &rarr;</a></td></tr></table><p style="font-family:Arial,Helvetica,sans-serif;color:#4d5c69;font-size:13px;line-height:22px;margin-top:0;margin-bottom:14px">'+next+'</p><p style="font-family:Arial,Helvetica,sans-serif;color:#4d5c69;font-size:13px;line-height:22px;margin-top:0;margin-bottom:17px">'+reviewHeadsUp+'</p><p style="font-family:Arial,Helvetica,sans-serif;color:#647080;font-size:12px;line-height:20px;margin-top:0;margin-bottom:20px">'+note+'</p><p style="font-family:Arial,Helvetica,sans-serif;color:#191919;font-size:14px;font-weight:700;line-height:23px;margin:0">The Launch Era team</p></td></tr><tr><td bgcolor="#e7f1fb" style="background-color:#e7f1fb;border-radius:0 0 16px 16px;padding-top:17px;padding-bottom:17px;padding-left:29px;padding-right:29px"><p style="font-family:Arial,Helvetica,sans-serif;color:#546b80;font-size:12px;line-height:20px;margin:0">'+brand+' · <span style="font-weight:700">Powered by The Launch Era</span><br>'+(es?"¿Necesitas ayuda? Responde a este correo.":"Need help? Reply to this email.")+'</p></td></tr></table></td></tr></table></body></html>';
 const text=[intro,"",es?"Tu Command Center está preparado.":"Your Command Center access is ready.","",(es?"Acceso privado para ":"Private access for ")+businessName,es?"Confirma tu cuenta para gestionar solicitudes, presupuestos y reservas.":"Confirm your account to manage requests, estimates and bookings.",label,"",cta+": "+link,"",next,"",reviewHeadsUp,"",note,"","The Launch Era team"].join("\n");
 return {subject,html,text};
}

Deno.serve(async req=>{
 const origin=req.headers.get("Origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return respond(405,{error:"POST required"},origin);
 if(origin&&!origins.has(origin))return respond(403,{error:"Origin not allowed"},origin);
 let body:any;try{body=await req.json()}catch{return respond(400,{error:"Invalid request"},origin)}
 const accountId=trim(body.account_id,70),action=trim(body.action,20);
 if(!uuid.test(accountId)||!["get","save","review","prepare","invite","send_activation","activation_preview","upload","preflight","qa_test_lead","qa_dashboard","qa_email_test","qa_simulate_lifecycle"].includes(action))return respond(400,{error:"Invalid buyer account or action"},origin);
 const token=req.headers.get("Authorization")?.replace(/^Bearer\s+/i,"")||"";
 if(!token)return respond(401,{error:"Please sign in first"},origin);
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return respond(503,{error:"Service unavailable"},origin);
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:ue}=await db.auth.getUser(token);
 if(ue||!user?.email_confirmed_at)return respond(401,{error:"Verified login required"},origin);
 const {data:w}=await db.from("tle_crm_workspaces").select("id").eq("created_by",user.id).eq("is_internal",true).maybeSingle();
 if(!w)return respond(403,{error:"Owner workspace required"},origin);
 const {data:a,error:ae}=await db.from("tle_booking_flow_accounts").select("id,owner_name,owner_email,business_name,language,intake_payload,intake_completed_at,payment_status,status,booking_public_key,booking_page_url,crm_workspace_id,delivery_sent_at,activated_at,business_category,business_category_other,activation_email_sent_at,activation_email_attempt_at,activation_email_link_version,activation_email_delivery_status,activation_email_delivery_checked_at")
  .eq("id",accountId).eq("payment_status","paid").maybeSingle();
 if(ae||!a)return respond(404,{error:"Paid buyer order not found"},origin);
 const {data:brand,error:be}=await db.from("tle_booking_page_branding").select("*").eq("account_id",a.id).maybeSingle();
 if(be)return respond(503,{error:"Could not load design"},origin);
 const base=intakeDraft(a),saved=!!brand;
 const branding=saved?{...base,...brand}:{...base};
 const uploaded=await previewPhotos(db,intakePhotos(a));
 if(action==="upload"){
  if(!a.intake_completed_at)return respond(409,{error:"The buyer intake is not complete"},origin);
  const priorPhotos=intakePhotos(a);
  if(priorPhotos.length>=10)return respond(409,{error:"Maximum of 10 photos per client. Please reuse or remove an existing photo."},origin);
  const mime=trim(body.mime,50).toLowerCase();
  const ext=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp"} as Record<string,string>)[mime];
  const base64=String(body.base64||"");
  if(!ext||!base64||base64.length>5500000||!/^[A-Za-z0-9+/]+={0,2}$/.test(base64))
   return respond(400,{error:"Choose a JPG, PNG or WebP photo under 4 MB."},origin);
  let bytes:Uint8Array;
  try{bytes=Uint8Array.from(atob(base64),x=>x.charCodeAt(0))}catch{return respond(400,{error:"Image could not be decoded"},origin)}
  if(bytes.length<32||bytes.length>4000000)return respond(400,{error:"Image must be under 4 MB."},origin);
  const valid=mime==="image/jpeg"?(bytes[0]===255&&bytes[1]===216&&bytes[2]===255):
   mime==="image/png"?(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71):
   (bytes[0]===82&&bytes[1]===73&&bytes[2]===70&&bytes[3]===70&&bytes[8]===87&&bytes[9]===69&&bytes[10]===66&&bytes[11]===80);
  if(!valid)return respond(400,{error:"Image format did not match the uploaded file"},origin);
  const path=a.id+"/owner/"+crypto.randomUUID()+"."+ext;
  const {error:up}=await db.storage.from("tle-intake-brand-assets").upload(path,bytes,{contentType:mime,upsert:false});
  if(up)return respond(503,{error:"Could not store this photo"},origin);
  const name=trim(body.filename,120).replace(/[<>]/g,"")||"Owner photo";
  const next=[...priorPhotos,{path,name,mime}];
  const {error:saveErr}=await db.from("tle_booking_flow_accounts").update({
   intake_payload:{...(a.intake_payload||{}),branding_photos:next},
   updated_at:new Date().toISOString()
  }).eq("id",a.id).eq("payment_status","paid");
  if(saveErr){await db.storage.from("tle-intake-brand-assets").remove([path]);return respond(503,{error:"Could not attach photo to this client"},origin)}
  return respond(200,{ok:true,uploaded:true,count:next.length},origin);
 }
 // Read-only buyer sign-in signal; login is different from delivery of the email.
 let buyerSignedInAfterEmail=false;
 if((action==="get"||action==="activation_preview")&&a.crm_workspace_id&&a.activation_email_sent_at){
   const {data:buyerWorkspace}=await db.from("tle_crm_workspaces").select("created_by").eq("id",a.crm_workspace_id).maybeSingle();
   if(buyerWorkspace?.created_by){
    const {data:buyerAuth}=await db.auth.admin.getUserById(buyerWorkspace.created_by);
    const lastSeen=buyerAuth?.user?.last_sign_in_at;
    buyerSignedInAfterEmail=!!lastSeen&&new Date(lastSeen).getTime()>new Date(a.activation_email_sent_at).getTime();
   }
 }
 if(action==="get")return respond(200,{ok:true,order:{business_name:a.business_name,owner_name:a.owner_name,owner_email:a.owner_email,language:a.language,intake_received:!!a.intake_completed_at,
 intake:a.intake_payload||{},status:a.status,has_booking_link:!!a.booking_page_url,booking_url:a.delivery_sent_at?a.booking_page_url:null,
 workspace_ready:!!a.crm_workspace_id,delivered:!!a.delivery_sent_at,business_category:a.business_category||null,business_category_other:a.business_category_other||"",activation_email_sent_at:a.activation_email_sent_at||null,activation_email_link_version:a.activation_email_link_version||null,activation_email_delivery_status:a.activation_email_delivery_status||null,buyer_signed_in_after_email:buyerSignedInAfterEmail},branding,saved,reviewed:!!brand?.design_reviewed_at,uploaded_photos:uploaded},origin);
 if(action==="activation_preview"){
   // Read-only: previews the same design used by send_activation, but does not create a token or send mail.
   const category=trim(a.business_category,30);
   const other=trim(a.business_category_other,65).replace(/[<>]/g,"");
   if(!validBusinessCategory(category,other))return respond(409,{error:"Business category must be verified in the buyer intake before activation"},origin);
   const businessName=trim(brand?.business_name||a.business_name,120)||"Your business";
   const isLegacyCB=/^cb\s*depot$/i.test(trim(a.business_name,120))||/^cb\s*depot$/i.test(trim(brand?.business_name,120));
   const previewUrl=PRIVATE_CLIENT_ENTRY;
   const simulated=activationContent(category,other,businessName,a.language,
     previewUrl, "", emailLogoUrl(brand?.logo_image,businessName),brand?.primary_color,brand?.accent_color);
   return respond(200,{ok:true,preview_only:true,never_send_from_preview:true,
      business_name:businessName,to:trim(a.owner_email,254).toLowerCase(),
      from:"The Launch Era <hello@thelaunchera.com>",subject:simulated.subject,
      html:simulated.html,text:simulated.text,
      category,
      status:!a.booking_page_url||!brand?.design_reviewed_at?"configuration_incomplete":a.activation_email_delivery_status==="delivered"&&a.activation_email_link_version==="handoff-v2"?"delivered":a.activation_email_sent_at?(["handoff-v2","direct-worker-v3","private-command-center-v4"].includes(a.activation_email_link_version||"")?"previously_sent":"legacy_link_needs_replacement"):"ready_to_send",
      delivery_status:a.activation_email_delivery_status||null,
      repair_available:a.activation_email_link_version==="handoff-v2"&&!!a.activation_email_sent_at&&!buyerSignedInAfterEmail,
      corrected_destination:"private_command_center",
      activation_email_sent_at:a.activation_email_sent_at||null,
      buyer_signed_in_after_email:buyerSignedInAfterEmail,
      workspace_ready:!!a.crm_workspace_id,
      note:"Preview link is for display only. The actual one-time secure token is generated only after the owner confirms sending."},origin);
 }
 if(action==="qa_simulate_lifecycle"){
  // Exercises the real booking→CRM trigger, in-app notification and
  // reply-driven follow-up cancellation using a synthetic non-deliverable lead.
  // The stored procedure removes all created sample records before returning.
  if(a.delivery_sent_at)return respond(409,{error:"Pre-delivery lifecycle QA is available only before handoff"},origin);
  const {data:result,error:testError}=await db.rpc("tle_booking_owner_qa_simulate_lifecycle",{
    p_account_id:a.id,p_owner_user_id:user.id
  });
  if(testError||!result?.ok)return respond(503,{
    error:"Private lifecycle simulation did not pass: "+String(result?.reason||result?.phase_error||"unknown")
  },origin);
  return respond(200,result,origin);
 }
 if(action==="qa_email_test"){
  // Agency-owner-only. Sends a clearly labelled QA email to the authenticated
  // internal owner's verified address, never the buyer or a customer.
  const {data:result,error:testError}=await db.rpc("tle_booking_owner_send_qa_mail",{
    p_account_id:a.id,p_owner_user_id:user.id
  });
  if(testError)return respond(503,{error:"Email pipeline did not accept the QA request. No success recorded."},origin);
  if(!result?.ok)return respond(result?.reason==="recent_test_already_requested"?429:409,
    {error:result?.reason==="recent_test_already_requested"?
    "A QA email was already requested recently. Check your inbox before repeating.":"QA email unavailable: "+String(result?.reason||"unknown")},origin);
  return respond(200,{...result,warning:"Queued by the email service. Check your own inbox to confirm delivery; this does not certify real buyer notifications."},origin);
 }
 if(action==="qa_dashboard"){
  const [{data:pricing,error:pe},{data:availability,error:ae2},
   {data:status,error:se},{count:leadCount,error:ce}]=await Promise.all([
    db.from("tle_booking_flow_pricing").select("services,addons,currency").eq("account_id",a.id).maybeSingle(),
    db.from("tle_booking_flow_availability").select("weekly,job_minutes,timezone").eq("account_id",a.id).maybeSingle(),
    db.rpc("tle_booking_owner_qa_release_snapshot",{p_account_id:a.id}),
    db.from("tle_booking_flow_leads").select("id",{head:true,count:"exact"}).eq("account_id",a.id)
  ]);
  if(pe||ae2||se||ce||!status)return respond(503,{error:"Cannot read this buyer QA state. No tests were recorded."},origin);
  const services=Array.isArray(pricing?.services)?pricing.services:[];
  const addons=Array.isArray(pricing?.addons)?pricing.addons:[];
  const weekday=availability?.weekly&&typeof availability.weekly==="object"?availability.weekly:{};
  const slots=Object.entries(weekday).filter(([_,v]:[string,any])=>v?.enabled===true).length;
  // Show owner's *selected* buyer only. Do not create buyer sessions,
  // disclose private leads, or change live booking state.
  return respond(200,{ok:true,read_only:true,testing_as_owner:true,
    business_name:trim(brand?.business_name||a.business_name||"Business",120),
    business_category:a.business_category||"other",
    language:a.language==="es"?"es":"en",
    category_note:"Buyer-specific branding, pricing and private workspace",
    design:{saved:!!brand,approved_for_preview:!!brand?.design_reviewed_at,
      hero_configured:!!brand?.hero_image,logo_configured:!!brand?.logo_image},
    catalog:{active_services:services.filter((x:any)=>x?.active!==false).map((x:any)=>({
       name:trim(x?.name||"Service",100),mode:trim(x?.mode||"quote",20),price:x?.price??null
     })).slice(0,40),addons_count:addons.filter((x:any)=>x?.active!==false).length,
     currency:pricing?.currency||"USD",availability_days:slots,job_minutes:availability?.job_minutes||null},
    qa:status,existing_requests_count:leadCount??0,
    audit_note:"Only timestamped QA checks are marked verified. Synthetic lead testing, email acceptance and final end-to-end delivery are separate."
  },origin);
 }
 if(action==="qa_test_lead"){
  if(a.delivery_sent_at)return respond(409,{error:"Pre-delivery QA is for pending systems only"},origin);
  if(!a.booking_page_url||!a.crm_workspace_id)return respond(409,{error:"Prepare and link the private booking workspace before QA"},origin);
  const {data:testResult,error:testError}=await db.rpc("tle_booking_owner_qa_lead_route_sample",{p_account_id:a.id,p_sample:body.qa_payload&&typeof body.qa_payload==="object"?body.qa_payload:{}});
  if(testError||!testResult?.ok)return respond(503,{error:"Lead routing QA did not pass. Review the private workspace connection before approving delivery."},origin);
  return respond(200,testResult,origin);
 }
 if(action==="preflight"){
  // Owner-authorized read-only pre-delivery verification. No workspace, booking, email or user is created.
  const [{data:pricing,error:prError},{data:av,error:avError},{count:requestCount,error:leadError}]=await Promise.all([
   db.from("tle_booking_flow_pricing").select("services,addons").eq("account_id",a.id).maybeSingle(),
   db.from("tle_booking_flow_availability").select("weekly,job_minutes,min_notice_hours,timezone").eq("account_id",a.id).maybeSingle(),
   db.from("tle_booking_flow_leads").select("id",{count:"exact",head:true}).eq("account_id",a.id)
  ]);
  if(prError||avError||leadError)return respond(503,{error:"Could not verify buyer setup"},origin);
  let existingUser=false,verifiedUser=false;
  const buyerEmail=String(a.owner_email||"").trim().toLowerCase();
  if(buyerEmail){
   for(let page=1;page<=10;page++){
    const {data:users,error:usersError}=await db.auth.admin.listUsers({page,perPage:200});
    if(usersError)return respond(503,{error:"Could not check buyer account identity"},origin);
    const match=users.users.find((u:any)=>String(u.email||"").trim().toLowerCase()===buyerEmail);
    if(match){existingUser=true;verifiedUser=!!match.email_confirmed_at;break}
    if(users.users.length<200)break;
   }
  }
  const allServices=Array.isArray(pricing?.services)?pricing.services:[];
  const activeServices=allServices.filter((x:any)=>x?.active!==false&&String(x?.name||"").trim().length>0);
  const weekly=av?.weekly&&typeof av.weekly==="object"?av.weekly:{};
  const minutes=Number(av?.job_minutes||0);
  const isValidTime=(v:any)=>typeof v==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  const openDays=Object.entries(weekly).filter(([day,value]:[string,any])=>{
   if(!/^\d$/.test(day)||!value?.enabled||!isValidTime(value.start)||!isValidTime(value.end)||minutes<=0)return false;
   const toM=(x:string)=>Number(x.slice(0,2))*60+Number(x.slice(3));
   return toM(value.end)-toM(value.start)>=minutes;
  }).map(([day,value]:[string,any])=>({day:Number(day),start:value.start,end:value.end}));
  const checks={
   paid:a.payment_status==="paid",
   intake:!!a.intake_completed_at,
   design:!!brand?.design_reviewed_at,
   business_category:validBusinessCategory(trim(a.business_category,30),trim(a.business_category_other,65)),
   branded_email_logo:!!emailLogoUrl(brand?.logo_image,trim(brand?.business_name||a.business_name,120)),
   services:activeServices.length>0,
   hours:openDays.length>0,
   booking_page:!!a.booking_page_url&&!!a.booking_public_key&&a.status==="active",
   identity_exists:existingUser,
   identity_verified:verifiedUser,
   workspace_linked:!!a.crm_workspace_id,
   public_delivery:!!a.delivery_sent_at
  };
  const setupReady=checks.paid&&checks.intake&&checks.design&&checks.business_category&&checks.branded_email_logo&&checks.services&&checks.hours&&checks.booking_page;
  return respond(200,{ok:true,dry_run:true,no_emails_sent:true,setup_ready:setupReady,
   can_test_private_setup:true,can_test_real_buyer_login:checks.workspace_linked&&checks.identity_verified,
   delivery_blocked:!checks.public_delivery,
   checks,service_names:activeServices.map((x:any)=>trim(x.name,100)),
   open_days:openDays,job_minutes:minutes,request_count:requestCount??0,
   routing:checks.workspace_linked?"linked_to_private_workspace":"pending_client_verification",
   next_step:!existingUser?"buyer_identity_required":!verifiedUser?"buyer_email_verification_required":!checks.workspace_linked?"private_link_required":"login_and_tenant_tests_required",
   note:"Read-only preflight. No invitations, emails, bookings, workspaces or settings changes were made."},origin);
 }
 if(!a.intake_completed_at)return respond(409,{error:"Wait for the buyer to complete the intake before customizing"},origin);
 if(action==="save"){
  const inBrand=body.branding||{};
  let hero="",logo="",reviews:any[];const requestedHero=trim(inBrand.hero_photo_path,700),requestedLogo=trim(inBrand.logo_photo_path,700);
  const permitted=new Set(intakePhotos(a).map((x:any)=>x.path));
  const photoKeys=["exterior","paint","interior","full"];
  const chosenServicePhotos:any={};
  for(const k of photoKeys){
   const selected=trim(inBrand.service_photo_paths?.[k],700);
   if(selected&&!permitted.has(selected))return respond(403,{error:"Selected service photos must belong to this buyer's intake"},origin);
   const prior=brand?.service_photos?.[k];
   chosenServicePhotos[k]={path:selected||"",url:selected&&prior?.path===selected?prior.url||"":""};
  }
  if((requestedHero&&!permitted.has(requestedHero))||(requestedLogo&&!permitted.has(requestedLogo)))
   return respond(403,{error:"Selected photos must belong to this buyer's intake"},origin);
  try{hero=requestedHero?(brand?.hero_image||""):safeImage(inBrand.hero_image||brand?.hero_image||"");
      logo=requestedLogo?(brand?.logo_image||""):safeImage(inBrand.logo_image||brand?.logo_image||"");
      reviews=parseReviews(inBrand.reviews)}catch(e){return respond(400,{error:String(e instanceof Error?e.message:e)},origin)}
  const fields={account_id:a.id,business_name:trim(inBrand.business_name,120).replace(/[<>]/g,""),headline:trim(inBrand.headline,115).replace(/[<>]/g,""),
   description:trim(inBrand.description,480).replace(/[<>]/g,""),service_area:trim(inBrand.service_area,240).replace(/[<>]/g,""),
   hero_image:hero,logo_image:logo,hero_photo_path:requestedHero||null,logo_photo_path:requestedLogo||null,service_photos:chosenServicePhotos,primary_color:color(inBrand.primary_color,"#DCEFFA"),accent_color:color(inBrand.accent_color,"#3A7399"),
   reviews,design_reviewed_at:null,updated_at:new Date().toISOString(),updated_by:user.id};
  if(!fields.business_name)return respond(400,{error:"Business name is required"},origin);
  const {error:we}=await db.from("tle_booking_page_branding").upsert(fields,{onConflict:"account_id"});
  if(we)return respond(503,{error:"Could not save design"},origin);
  return respond(200,{ok:true,saved:true,reviewed:false},origin);
 }
 if(action==="review"){
  if(!brand)return respond(409,{error:"Save your personalized design before reviewing"},origin);
  const {data:pricing}=await db.from("tle_booking_flow_pricing").select("services").eq("account_id",a.id).maybeSingle();
  const {data:av}=await db.from("tle_booking_flow_availability").select("weekly,job_minutes").eq("account_id",a.id).maybeSingle();
  if(!Array.isArray(pricing?.services)||!pricing.services.some((x:any)=>x.active!==false)||!av?.weekly||!Object.values(av.weekly).some((d:any)=>d?.enabled&&d.end>d.start))
    return respond(409,{error:"Save active services, valid prices and business hours before marking the design reviewed"},origin);
  const originals=new Set(intakePhotos(a).map((x:any)=>x.path));
  if((brand.hero_photo_path&&!originals.has(brand.hero_photo_path))||(brand.logo_photo_path&&!originals.has(brand.logo_photo_path)))
   return respond(403,{error:"The selected images no longer match the buyer's intake"},origin);
  const publishedServicePhotos:any={...(brand.service_photos||{})};
  for(const k of ["exterior","paint","interior","full"]){
   const path=trim(publishedServicePhotos[k]?.path,700);
   if(path&&!originals.has(path))return respond(403,{error:"The selected service photo no longer matches the buyer's intake"},origin);
  }
  let publishedHero=brand.hero_image||"",publishedLogo=brand.logo_image||"";
  try{
   if(brand.hero_photo_path)publishedHero=await publishSelected(db,a.id,brand.hero_photo_path);
   if(brand.logo_photo_path)publishedLogo=await publishSelected(db,a.id,brand.logo_photo_path);
   for(const k of ["exterior","paint","interior","full"]){
    const photo=publishedServicePhotos[k];
    if(photo?.path&&!photo?.url)publishedServicePhotos[k]={path:photo.path,url:await publishSelected(db,a.id,photo.path)};
   }
  }catch(e){return respond(409,{error:e instanceof Error?e.message:"Could not approve image"},origin)}
  const {error:e}=await db.from("tle_booking_page_branding").update({hero_image:publishedHero,logo_image:publishedLogo,service_photos:publishedServicePhotos,design_reviewed_at:new Date().toISOString()}).eq("account_id",a.id);
  if(e)return respond(503,{error:"Could not confirm design review"},origin);
  return respond(200,{ok:true,reviewed:true},origin);
 }


 if(action==="send_activation"){
  if(a.status!=="active"||!a.booking_page_url||!brand?.design_reviewed_at)return respond(409,{error:"Approve the design and prepare the paid Booking Page before activation"},origin);
  const category=trim(a.business_category,30);
  const other=trim(a.business_category_other,65).replace(/[<>]/g,"");
  if(!validBusinessCategory(category,other))return respond(409,{error:"Verify the business type in the paid buyer intake before activation"},origin);
  if(body.business_category&&trim(body.business_category,30)!==category)
    return respond(409,{error:"Business type has changed. Reload the customer order before activating."},origin);
  const activationLogo=emailLogoUrl(brand?.logo_image,trim(brand?.business_name||a.business_name,120));
  if(!activationLogo)return respond(409,{error:"An approved PNG, JPG or WebP business logo is required before sending branded activation."},origin);
  const ownerEmail=trim(a.owner_email,254).toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ownerEmail))return respond(409,{error:"This paid order needs a valid customer email"},origin);
  const tenMinutesAgo=new Date(Date.now()-10*60*1000).toISOString();
  const replacingBrokenLink=body.replace_broken_link===true && a.activation_email_link_version==="handoff-v2";
  if(!replacingBrokenLink&&["handoff-v2","direct-worker-v3","private-command-center-v4"].includes(a.activation_email_link_version||"")&&a.activation_email_sent_at&&
     (a.activation_email_delivery_status==="delivered"||new Date(a.activation_email_sent_at).getTime()>Date.now()-10*60*1000))
   return respond(200,{ok:true,already_sent:true,activation_email_sent_at:a.activation_email_sent_at,note:"Activation email was already accepted recently. No duplicate was sent."},origin);
  const attemptAt=new Date().toISOString();
  const {data:claimed,error:claimError}=await db.from("tle_booking_flow_accounts")
    .update({activation_email_attempt_at:attemptAt,business_category:category,business_category_other:category==="other"?other:null,updated_at:attemptAt})
    .eq("id",a.id).eq("payment_status","paid")
    .or("activation_email_attempt_at.is.null,activation_email_attempt_at.lt."+tenMinutesAgo)
    .select("id");
  if(claimError)return respond(503,{error:"Could not lock the activation request"},origin);
  if(!claimed?.length)return respond(409,{error:"An activation is already being processed. Please do not send a duplicate."},origin);
  let completed=false;
  try{
   const emailKey=Deno.env.get("TLE_CRM_RESEND_API_KEY")||"";
   if(!emailKey)throw Error("Activation email sender is not configured");
   let buyerUser:any=null;
   for(let page=1;page<=10;page++){
    const {data:users,error:usersError}=await db.auth.admin.listUsers({page,perPage:200});
    if(usersError)throw Error("Could not check the buyer's account");
    buyerUser=users.users.find((u:any)=>trim(u.email,254).toLowerCase()===ownerEmail);
    if(buyerUser||users.users.length<200)break;
   }
   const redirectTo=PRIVATE_CLIENT_ENTRY;
   const linkType=buyerUser?"magiclink":"invite";
   const {data:linkData,error:linkError}=await db.auth.admin.generateLink({type:linkType,email:ownerEmail,options:{redirectTo}});
   if(linkError||!linkData?.properties?.action_link||!linkData?.user?.id)throw Error("Could not generate the secure activation link");
   const privateUserId=buyerUser?.id||linkData.user.id;
   if(a.crm_workspace_id){
    const {data:linked}=await db.from("tle_crm_workspaces").select("id,created_by").eq("id",a.crm_workspace_id).maybeSingle();
    if(!linked||linked.created_by!==privateUserId)throw Error("This order's private workspace must be reviewed before sending access");
   }else{
    const {data:workspaceId,error:wsError}=await db.rpc("tle_crm_provision_buyer_workspace",{p_account_id:a.id,p_user_id:privateUserId});
    if(wsError||!workspaceId)throw Error("Private workspace could not be linked to this buyer");
   }
   // Use the verified OTP token hash directly in the private Command Center. Supabase's
   // redirect allow-list currently falls back to a legacy public Cleaning App URL.
   // A fragment avoids exposing the one-time token to the hosting server or Referer.
   // The hosted Auth server uses SHA-224 (56 hex chars) for email OTP hashes,
   // while some Auth versions use SHA-256 (64 hex chars). Read the token from
   // its authoritative verification link to avoid stale properties.
   const actionUrl=new URL(linkData.properties.action_link);
   if(actionUrl.origin!=="https://bowacxhmjvrqixtwaikv.supabase.co"||!actionUrl.pathname.startsWith("/auth/v1/verify"))
     throw Error("Activation provider returned an unexpected verification URL");
   const hashedToken=String(actionUrl.searchParams.get("token")||linkData.properties.hashed_token||"");
   if(!/^(?:pkce_)?[a-f0-9]{56,64}$/i.test(hashedToken))throw Error("Could not prepare the direct private activation link");
   const privateLink=new URL(PRIVATE_CLIENT_ENTRY);
   // The verified buyer identity, not the URL, selects the tenant workspace.
   privateLink.hash=new URLSearchParams({token_hash:hashedToken,type:linkType}).toString();
   const email=activationContent(category,other,trim(brand?.business_name||a.business_name,120)||"Your business",a.language,
    privateLink.toString(),trim(a.owner_name,50).split(/\s+/)[0]||"there",activationLogo,brand?.primary_color,brand?.accent_color);
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+emailKey,"Content-Type":"application/json"},
     body:JSON.stringify({from:"The Launch Era <hello@thelaunchera.com>",to:[ownerEmail],reply_to:["hello@thelaunchera.com"],subject:email.subject,html:email.html,text:email.text})});
   const result=await response.json().catch(()=>({}));
   if(!response.ok||!result.id)throw Error("Email provider did not accept the activation: "+trim(result.message||response.status,150));
   const sentAt=new Date().toISOString();
   const {error:recordError}=await db.from("tle_booking_flow_accounts")
    .update({activation_email_sent_at:sentAt,activation_email_message_id:String(result.id),activation_email_link_version:"private-command-center-v4",activation_email_delivery_status:"sent",activation_email_delivery_checked_at:null,activation_email_attempt_at:null,updated_at:sentAt})
    .eq("id",a.id).eq("activation_email_attempt_at",attemptAt);
   if(recordError)console.error("Activation accepted but delivery record could not be saved",a.id,recordError.message);
   completed=true;
   return respond(200,{ok:true,accepted:true,workspace_ready:true,activation_email_sent_at:sentAt,
    note:"Activation email accepted by Resend for the paid buyer. Check the provider for delivery status."},origin);
  }catch(e){return respond(503,{error:e instanceof Error?e.message:"Activation not completed"},origin)}
  finally{if(!completed)await db.from("tle_booking_flow_accounts").update({activation_email_attempt_at:null}).eq("id",a.id).eq("activation_email_attempt_at",attemptAt)}
 }

 if(action==="invite"){
  if(a.status!=="active"||!a.booking_page_url||!brand?.design_reviewed_at)return respond(409,{error:"Complete the design review and prepare the private Booking Page before sending an invitation"},origin);
  if(a.crm_workspace_id)return respond(200,{ok:true,workspace_ready:true,invitation_sent:false,note:"The buyer's private workspace is already linked"},origin);
  const ownerEmail=String(a.owner_email||"").trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ownerEmail))return respond(409,{error:"A valid buyer purchase email is required"},origin);
  let buyerUser:any=null;
  // Avoid resending invitations: reuse a user already registered with the verified order email.
  for(let page=1;page<=10;page++){
   const {data:users,error:usersError}=await db.auth.admin.listUsers({page,perPage:200});
   if(usersError)return respond(503,{error:"Could not check the buyer's existing access"},origin);
   buyerUser=users.users.find((u:any)=>String(u.email||"").toLowerCase()===ownerEmail);
   if(buyerUser||users.users.length<200)break;
  }
  if(buyerUser&&!buyerUser.email_confirmed_at){
   // Verification was sent separately by Supabase Auth; do not re-invite or provision an unverified owner.
   return respond(409,{error:"The buyer has not confirmed the purchase email yet. Do not resend an invitation. Ask the buyer to open the verification email already received."},origin);
  }
  if(!buyerUser){
   // Prepare the private account without a generic Auth invitation. Supabase's
   // redirect allow-list can fall back to the public marketing Site URL.
   // Owner-approved send_activation alone sends the branded private access email.
   const {data:inviteData,error:inviteError}=await db.auth.admin.generateLink({
    type:"invite",email:ownerEmail,options:{redirectTo:PRIVATE_CLIENT_ENTRY}});
   if(inviteError||!inviteData?.user?.id)return respond(503,{error:"Could not prepare the private buyer account."},origin);
   buyerUser=inviteData.user;
  }
  const {data:workspaceId,error:wsError}=await db.rpc("tle_crm_provision_buyer_workspace",{p_account_id:a.id,p_user_id:buyerUser.id});
  if(wsError||!workspaceId)return respond(503,{error:"Buyer access exists, but the private workspace could not be linked. Review the order before inviting again."},origin);
  return respond(200,{ok:true,workspace_ready:true,invitation_sent:false,
   note:"Private buyer workspace prepared. No email has been sent. Review the personalized activation email and explicitly approve its send."},origin);
 }
 if(action==="prepare"){
  if(!brand?.design_reviewed_at)return respond(409,{error:"Review the personalized design before preparing access"},origin);
  const {data:pricing}=await db.from("tle_booking_flow_pricing").select("services").eq("account_id",a.id).maybeSingle();
  const {data:av}=await db.from("tle_booking_flow_availability").select("weekly,job_minutes").eq("account_id",a.id).maybeSingle();
  const active=Array.isArray(pricing?.services)&&pricing.services.some((x:any)=>x.active!==false);
  const minutes=Number(av?.job_minutes||0);
  const openings=Object.values(av?.weekly||{}).some((v:any)=>{
   if(!v?.enabled||!/^\d{2}:\d{2}$/.test(v.start)||!/^\d{2}:\d{2}$/.test(v.end))return false;
   const m=(t:string)=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
   return m(v.end)-m(v.start)>=minutes&&minutes>0
  });
  if(!active||!openings)return respond(409,{error:"At least one active service and one bookable open day are required"},origin);
  if(!uuid.test(a.booking_public_key))return respond(503,{error:"Booking identifier has not been prepared"},origin);
  const page="https://thelaunchera.com/booking/?key="+a.booking_public_key;
  const {error:e}=await db.from("tle_booking_flow_accounts").update({booking_page_url:page,status:"active",activated_at:a.activated_at||new Date().toISOString(),
   updated_at:new Date().toISOString()}).eq("id",a.id).eq("payment_status","paid").not("intake_completed_at","is",null);
  if(e)return respond(503,{error:"Could not prepare the private access"},origin);
  return respond(200,{ok:true,prepared:true,public_live:false,workspace_ready:!!a.crm_workspace_id,booking_url:null,next:"Buyer access must be activated and tested before final delivery"},origin);
 }
 return respond(400,{error:"Unknown action"},origin);
});