import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const originAllow=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","https://the-launch-era-crm.dailinsegura17.workers.dev","http://localhost:5173","http://127.0.0.1:5173"]);
const json=(data:unknown,status=200,origin="")=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Access-Control-Allow-Origin":originAllow.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}});
const txt=(v:unknown,max=160)=>String(v??"").trim().replace(/[<>]/g,"").slice(0,max);
const validCurrency=new Set(["USD","CAD"]);
const validPolicies=new Set(["review_unpriced_jobs","always_review","large_or_special","no_quotes"]);
const keyRegex=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function normalizedServices(x:unknown){
 if(!Array.isArray(x)||x.length>40)throw Error("Provide no more than 40 services.");
 const used=new Set<string>();
 return x.map((p:any)=>{
   const name=txt(p?.name,90),mode=["flat","estimate","quote"].includes(p?.mode)?p.mode:"quote";
   const price=p?.price===""||p?.price===null?null:Number(p?.price);
   const estimatedFrom=p?.estimated_from===""||p?.estimated_from===null||p?.estimated_from===undefined?null:Number(p.estimated_from);
   if(mode==="estimate"&&estimatedFrom!==null&&(!Number.isFinite(estimatedFrom)||estimatedFrom<=0||estimatedFrom>50000))
     throw Error("Estimated starting price must be a valid positive amount.");
   if(!name)throw Error("Every service needs a name.");
   if(mode==="flat"&&(!Number.isFinite(price)||price===null||price<=0||price>50000))throw Error("Fixed-price services need a valid price.");
   const id=keyRegex.test(String(p?.id))?String(p.id):crypto.randomUUID();
   if(used.has(id))throw Error("Duplicate service identifier.");used.add(id);
   const category=["residential","commercial","both"].includes(p?.category)?p.category:
    /office|commercial|retail|restaurant|salon|medical|warehouse|construction|janitorial|business/i.test(name)?"commercial":"residential";
   return {id,name,mode,price:mode==="flat"?Math.round(price!*100)/100:null,estimated_from:mode==="estimate"&&estimatedFrom!==null?Math.round(estimatedFrom*100)/100:null,category,active:p?.active!==false};
 });
}
function normalizedAddons(x:unknown){
 if(!Array.isArray(x)||x.length>40)throw Error("Provide no more than 40 add-ons.");
 const used=new Set<string>();
 return x.map((p:any)=>{
   const name=txt(p?.name,90),price=Number(p?.price),id=keyRegex.test(String(p?.id))?String(p.id):crypto.randomUUID();
   if(!name||!Number.isFinite(price)||price<0||price>50000)throw Error("Every add-on needs a name and valid price.");
   if(used.has(id))throw Error("Duplicate add-on identifier.");used.add(id);
   const category=["residential","commercial","both"].includes(p?.category)?p.category:
    /oven|fridge|refrigerator|baseboard|laundry|cabinets|bedroom/i.test(name)?"residential":
    /floor scrub|breakroom|restroom|partition|high.touch|commercial|office|after.hour|workstation/i.test(name)?"commercial":"both";
   return {id,name,price:Math.round(price*100)/100,category,active:p?.active!==false};
 });
}
const calculatorFields={residential_base:[0,50000],bedroom_fee:[0,2000],bathroom_fee:[0,2000],sqft_increment_fee:[0,5000],commercial_minimum:[0,50000],commercial_sqft_rate:[0,100],deep_multiplier:[1,5],moveout_multiplier:[1,5],weekly_discount:[0,60],biweekly_discount:[0,60],monthly_discount:[0,60],travel_fee:[0,2000],estimate_variance:[0,40]} as const;
const emptyCalculator=()=>({...Object.fromEntries(Object.keys(calculatorFields).map(k=>[k,k==="deep_multiplier"||k==="moveout_multiplier"?1:k==="estimate_variance"?10:0])),zip_fees:""});
function normalizeCalculator(raw:any,base:any){
 const out:any={...emptyCalculator(),...(base&&typeof base==="object"&&!Array.isArray(base)?base:{})};
 for(const [key,limits] of Object.entries(calculatorFields)){
  const [min,max]=limits as number[];
  const value=raw?.[key]===undefined?Number(out[key]):Number(raw[key]);
  if(!Number.isFinite(value)||value<min||value>max)throw Error("Enter a valid cleaning calculator value for "+key.replace(/_/g," ")+".");
  out[key]=Math.round(value*100)/100;
 }
 const zipFees=txt(raw?.zip_fees===undefined?base?.zip_fees:raw?.zip_fees,1800);
 const lines=zipFees.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(lines.length>50||lines.some(line=>{
   const m=line.match(/^(\d{5})\s*:\s*(\d+(?:\.\d{1,2})?)$/);
   return !m||Number(m[2])>2000;
 }))throw Error("ZIP fees must be lines like 33436:15 (maximum 50 ZIPs, $2,000 each).");
 out.zip_fees=lines.join("\n");
 return out;
}
function intakeDefaults(i:any){
 const parse=(raw:unknown,extras=false)=>txt(raw,6500).split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,35).map(line=>{
   const m=line.match(/(?:\$|USD\s?)(\d+(?:\.\d{1,2})?)/i),name=txt(line.replace(/\s*[—–:=-]\s*(?:from|desde|a partir de|\+)?\s*(?:\$|USD\s?)[\d.,]+.*$/i,""),90)||txt(line,90);
   const price=m?Number(m[1]):null;
   const category=/office|commercial|retail|restaurant|salon|medical|warehouse|construction|janitorial|business|restroom|floor scrub|breakroom|after.hour/i.test(name)?"commercial":/oven|fridge|refrigerator|baseboard|laundry|cabinet|bedroom/i.test(name)?"residential":"both";
   if(extras)return {id:crypto.randomUUID(),name,price:price??0,category,active:true};
   return {id:crypto.randomUUID(),name,price,mode:price!==null&&price>0?"flat":"quote",category,active:true};
 });
 const flatRows=i?.main_flat_services?parse(i.main_flat_services).map(x=>({...x,mode:x.price!==null&&x.price>0?"flat":"quote"})):[];
  const estimateRows=i?.main_estimate_services?parse(i.main_estimate_services).map(x=>({...x,mode:"estimate",estimated_from:x.price,price:null})):[];
  const prepared=[...flatRows,...estimateRows];
  return {services:prepared.length?prepared:parse(i?.services),addons:parse(i?.add_ons,true),cleaning_calculator:emptyCalculator(),auto_confirm_flat:false,currency:validCurrency.has(i?.currency_code)?i.currency_code:"USD",quote_policy:validPolicies.has(i?.quote_estimate_rules)?i.quote_estimate_rules:"review_unpriced_jobs"};
}
function isReleased(a:any){return a&&a.payment_status==="paid"&&a.intake_completed_at&&a.booking_page_url&&a.crm_workspace_id&&a.delivery_sent_at&&a.status==="active";}

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
Deno.serve(async(req)=>{
 const origin=req.headers.get("Origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":originAllow.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Vary":"Origin"}});
 if(req.method!=="POST")return json({error:"Method not allowed"},405,origin);
 if(origin&&!originAllow.has(origin))return json({error:"Origin not allowed"},403,origin);
 try{
  const b=await req.json(),action=txt(b?.action,32);
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
  if(action==="public"){
   const key=txt(b?.booking_key,80);
   if(!keyRegex.test(key))return json({error:"Invalid booking key"},400,origin);
   const {data:a}=await admin.from("tle_booking_flow_accounts").select("id,business_name,business_category,language,intake_payload,timezone,booking_page_url,payment_status,status,intake_completed_at,crm_workspace_id,delivery_sent_at,booking_public_key").eq("booking_public_key",key).maybeSingle();
   if(!isReleased(a))return json({error:"Booking Page not available"},404,origin);
   const {data:p}=await admin.from("tle_booking_flow_pricing").select("services,addons,currency,auto_confirm_flat,quote_policy,updated_at").eq("account_id",a.id).maybeSingle();
   if(!p)return json({error:"Booking Page pricing is still being configured"},404,origin);
   const intake=a.intake_payload||{};
   const directImage=(value:unknown)=>{
     const str=String(value||"").trim().slice(0,800);
     if(!/^https:\/\/[^\s?#]+\.(?:jpe?g|png|webp)(?:\?[^ ]*)?$/i.test(str)&&!/^https:\/\/raw\.githubusercontent\.com\/thelaunchera\/the-launch-era-new-website-\/main\/public\/assets\/clients\/[a-z0-9-]+\/[a-z0-9-]+\.svg$/i.test(str))return null;
     return str;
   };
   const {data:custom}=await admin.from("tle_booking_page_branding").select("business_name,headline,description,service_area,hero_image,logo_image,primary_color,accent_color,reviews,service_photos").eq("account_id",a.id).maybeSingle();
   const branding={description:txt(custom?.description||intake.about_business,480),service_area:txt(custom?.service_area||intake.service_areas,240),
    headline:txt(custom?.headline||intake.main_offer,115),hero_image:directImage(custom?.hero_image)||directImage(intake.hero_photo_url)||directImage(intake.photos_link),
    logo_image:directImage(custom?.logo_image)||directImage(intake.logo_assets_link),primary_color:custom?.primary_color||"#DCEFFA",
    accent_color:custom?.accent_color||"#3A7399",
    service_photos:Object.fromEntries(["exterior","paint","interior","full"].map(k=>[k,directImage(custom?.service_photos?.[k]?.url)||null])),
    reviews:Array.isArray(custom?.reviews)?custom.reviews.slice(0,6):[]};
   return json({business_name:txt(custom?.business_name||a.business_name,120),business_category:a.business_category,language:a.language,timezone:a.timezone||"America/New_York",branding,currency:p.currency,services:p.services.filter((v:any)=>v.active),addons:p.addons.filter((v:any)=>v.active),auto_confirm_flat:p.auto_confirm_flat,quote_policy:p.quote_policy,updated_at:p.updated_at},200,origin);
  }
  if(action!=="get"&&action!=="save")return json({error:"Unknown action"},400,origin);
  const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"").trim();
  if(!token)return json({error:"Sign in required"},401,origin);
  const {data:{user},error:ue}=await admin.auth.getUser(token);
  if(ue||!user?.id||!user.email||!user.email_confirmed_at)return json({error:"Verified account login required"},401,origin);
  const workspaceId=txt(b?.workspace_id,80);
  if(!keyRegex.test(workspaceId))return json({error:"Workspace required"},400,origin);
  const {data:ws}=await admin.from("tle_crm_workspaces").select("id,created_by,is_internal,password_login_required,password_setup_completed_at").eq("id",workspaceId).eq("created_by",user.id).maybeSingle();
  if(!ws)return json({error:"Not authorized for this workspace"},403,origin);
  if(!permittedBuyerWorkspace(ws,token))return json({error:"Password sign-in required for private buyer data"},403,origin);
  const buyerId=txt(b?.owner_account_id,80),ownerEditing=ws.is_internal===true&&keyRegex.test(buyerId);
  if(!ownerEditing&&buyerId)return json({error:"Only the system owner can review buyer pricing"},403,origin);
  const accountQuery=admin.from("tle_booking_flow_accounts").select("id,business_name,owner_email,language,intake_payload,business_category,booking_public_key,booking_page_url,payment_status,status,intake_completed_at,crm_workspace_id,delivery_sent_at");
  const {data:a}=ownerEditing?await accountQuery.eq("id",buyerId).eq("payment_status","paid").maybeSingle():await accountQuery.eq("crm_workspace_id",ws.id).maybeSingle();
  if(ownerEditing){
    if(!a)return json({error:"No paid buyer account found"},404,origin);
  }else if(!isReleased(a)||String(a.owner_email).toLowerCase()!==String(user.email).toLowerCase()){
    return json({error:"Booking pricing is available after your personalized system is delivered."},403,origin);
  }
  if(action==="get"){
   const {data:p,error:pe}=await admin.from("tle_booking_flow_pricing").select("*").eq("account_id",a.id).maybeSingle();
   if(pe)return json({error:"Could not load pricing"},500,origin);
   return json({ok:true,account_id:a.id,business_name:a.business_name,business_category:a.business_category,booking_url:a.delivery_sent_at?"https://thelaunchera.com/booking/?key="+a.booking_public_key:null,settings:p||intakeDefaults(a.intake_payload||{}),saved:!!p,owner_preview:ownerEditing,delivery_ready:!!a.delivery_sent_at},200,origin);
  }
  const services=normalizedServices(b.services),addons=normalizedAddons(b.addons);
  if(!services.some(x=>x.active))return json({error:"Keep at least one active service."},400,origin);
  const prior=await admin.from("tle_booking_flow_pricing").select("auto_confirm_flat,cleaning_calculator").eq("account_id",a.id).maybeSingle();
  // A fixed-price service does not imply permission to confirm it.
  let autoConfirm=prior.data?.auto_confirm_flat===true;
  if(b.auto_confirm_flat!==undefined){
    const requested=b.auto_confirm_flat===true;
    if(requested&&!autoConfirm){
      if(!ownerEditing&&(!a.delivery_sent_at||a.status!=="active"))return json({error:"This option becomes available to customers after final delivery."},409,origin);
      const {data:calendar,error:calendarError}=await admin.from("tle_booking_flow_availability").select("weekly,job_minutes").eq("account_id",a.id).maybeSingle();
      if(calendarError||!calendar||!Number.isFinite(Number(calendar.job_minutes))||Number(calendar.job_minutes)<15||
         !Object.values(calendar.weekly||{}).some((d:any)=>d?.enabled===true&&d?.start&&d?.end&&d.start<d.end)){
        return json({error:"Set valid working hours and appointment length before enabling automatic confirmations."},409,origin);
      }
    }
    autoConfirm=requested;
  }
  const quotePolicy=validPolicies.has(b.quote_policy)?String(b.quote_policy):"review_unpriced_jobs";
  const currency=validCurrency.has(b.currency)?String(b.currency):"USD";
  if(quotePolicy==="always_review")autoConfirm=false;
  const calculator=a.business_category==="cleaning"?
       normalizeCalculator(b.cleaning_calculator,prior.data?.cleaning_calculator):
       (prior.data?.cleaning_calculator||{});
  const {data:p,error:se}=await admin.from("tle_booking_flow_pricing").upsert({account_id:a.id,services,addons,currency,quote_policy,auto_confirm_flat:autoConfirm,cleaning_calculator:calculator,updated_at:new Date().toISOString(),updated_by:user.id},{onConflict:"account_id"}).select("updated_at").single();
  if(se)return json({error:"Could not save prices"},500,origin);
  return json({ok:true,updated_at:p.updated_at,auto_confirm_flat:autoConfirm,cleaning_calculator:calculator,booking_url:a.delivery_sent_at?"https://thelaunchera.com/booking/?key="+a.booking_public_key:null,owner_preview:ownerEditing},200,origin);
 }catch(e){return json({error:e instanceof Error?e.message:"Request failed"},400,origin)}
});
