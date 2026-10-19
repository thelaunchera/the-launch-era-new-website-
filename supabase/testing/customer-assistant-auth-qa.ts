// Testing only. No password, sign-in link or access token is returned or logged.
import {createClient} from 'npm:@supabase/supabase-js@2.57.0';
const accounts=['aa25fbee-9034-4a68-8862-47d6a32dffb5','5cff82f1-0f8b-4422-ad87-bb8fb7dd4ca5'];
const emails=['tle-assistant-qa+54efb779-72b5-4c0b-a813-0dbe978f76c9@example.invalid','tle-assistant-qa+3237457d-0a29-45fe-b58d-b47fd529eaae@example.invalid'];
Deno.serve(async req=>{
 const url=Deno.env.get('SUPABASE_URL')||'',key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
 if(Deno.env.get('TLE_ASSISTANT_AUTH_QA_ENABLED')!=='true'||req.method!=='POST'||url!=='https://afyiltvdfqnuyzcqsnoh.supabase.co')return new Response(null,{status:403});
 const db=createClient(url,key,{auth:{persistSession:false}}),checks=[];
 for(let i=0;i<2;i++){
  const {data:acct}=await db.from('tle_booking_flow_accounts').select('crm_workspace_id').eq('id',accounts[i]).single();
  const {data:row}=await db.from('tle_customer_assistant_submissions').select('request_id').eq('account_id',accounts[i]).not('request_id','is',null).limit(1).single();
  if(!acct||!row)return Response.json({error:'Fixture not ready'},{status:409});
  const {data:link,error}=await db.auth.admin.generateLink({type:'magiclink',email:emails[i]});
  if(error||!link?.properties?.hashed_token)return Response.json({error:'Fixture Auth link unavailable'},{status:503});
  const client=createClient(url,key,{auth:{persistSession:false}});
  const {data:session,error:verifyError}=await client.auth.verifyOtp({token_hash:link.properties.hashed_token,type:'magiclink'});
  if(verifyError||!session.session)return Response.json({error:'Fixture Auth session unavailable'},{status:503});
  async function conversation(workspace_id,token=session.session.access_token){
   const r=await fetch(url+'/functions/v1/tle-customer-assistant',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://thelaunchera.com',Authorization:'Bearer '+token},body:JSON.stringify({action:'conversation',workspace_id,request_id:row.request_id})});
   const body=await r.json();return {status:r.status,messages:body.messages?.length||0};
  }
  const own=await conversation(acct.crm_workspace_id);
  const {data:other}=await db.from('tle_booking_flow_accounts').select('crm_workspace_id').eq('id',accounts[1-i]).single();
  const foreign=await conversation(other.crm_workspace_id),invalid=await conversation(acct.crm_workspace_id,'invalid-fixture-token');
  await client.auth.signOut();
  checks.push({fixture:i+1,own:own.status===200&&own.messages>0,cross_workspace_denied:foreign.status===403,invalid_session_denied:invalid.status===401});
 }
 return Response.json({ok:checks.every(x=>x.own&&x.cross_workspace_denied&&x.invalid_session_denied),checks});
});
