import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Accept a completed paid intake only after the verified project exists.
// No follow-up automation is activated by intake submission.
const URL=Deno.env.get("SUPABASE_URL")||"";
const KEY=(()=>{let v={};try{v=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{}return (v as Record<string,string>).default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""})();
const ORIGINS=new Set(["https://thelaunchera.com","https://www.thelaunchera.com","https://fhrvuhikrybobidxpvnh.supabase.co"]);
function send(status:number,data:object,origin:string){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://thelaunchera.com","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST,OPTIONS"}})}
const clean=(v:any,l:number)=>typeof v==="string"?v.trim().slice(0,l):"";
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return send(204,{},origin);
 if(req.method!=="POST")return send(405,{ok:false},origin);
 if(origin&&!ORIGINS.has(origin))return send(403,{ok:false},origin);
 if(!KEY||!URL)return send(503,{ok:false},origin);
 try{
  const raw=await req.text();if(raw.length>16000)return send(413,{ok:false},origin);
  const x=JSON.parse(raw),session=clean(x.session_id,100),pkg=clean(x.package_slug,30),
        email=clean(x.email,254).toLowerCase(),sid=clean(x.submission_id,60);
  if(!/^cs_live_[A-Za-z0-9]+$/.test(session)||!["website-basic","website-plus","website-ai-crm"].includes(pkg)||
     !/^[0-9a-f-]{36}$/i.test(sid)||!email||!clean(x.business_name,150)||!clean(x.industry,120)||!clean(x.preferred_email,254)||!clean(x.goals,3500))
     return send(400,{ok:false},origin);
  const r=await fetch(URL+"/rest/v1/tle_website_projects?select=id,stripe_customer_email,studio_intake_submission_id&stripe_session_id=eq."+encodeURIComponent(session)+"&package_slug=eq."+encodeURIComponent(pkg)+"&limit=1",{
    headers:{apikey:KEY,Authorization:"Bearer "+KEY}});
  if(!r.ok)return send(503,{ok:false},origin);
  const projects=await r.json();const project=projects[0];
  if(!project || !project.stripe_customer_email || project.stripe_customer_email.toLowerCase()!==email)return send(403,{ok:false,error:"Purchase email must match"});
  if(project.studio_intake_submission_id && project.studio_intake_submission_id!==sid)
    return send(409,{ok:false,error:"Intake already attached"});
  const patch={business_name:clean(x.business_name,150),industry:clean(x.industry,120),preferred_email:clean(x.preferred_email,254),
    goals:clean(x.goals,3500),automation_goals:clean(x.automation_goals,2500)||null,ai_brief:clean(x.ai_brief,2500)||null,
    studio_intake_submission_id:sid,intake_received_at:new Date().toISOString(),project_stage:"intake_received",
    updated_at:new Date().toISOString()};
  const u=await fetch(URL+"/rest/v1/tle_website_projects?id=eq."+encodeURIComponent(project.id),{method:"PATCH",headers:{
    apikey:KEY,Authorization:"Bearer "+KEY,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(patch)});
  if(!u.ok)return send(503,{ok:false,error:"Project update failed"},origin);
  return send(200,{ok:true,project_linked:true},origin);
 }catch(e){console.error("Website project intake",String(e).slice(0,75));return send(503,{ok:false},origin)}
});
