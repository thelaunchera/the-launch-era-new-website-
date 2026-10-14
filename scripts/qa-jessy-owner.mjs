import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
const page=read("public/command-center/index.html");
const core=read("public/command-center/assets/command-center-app.js");
const ui=read("public/command-center/assets/jessy-owner.js");
const css=read("public/command-center/assets/jessy-owner.css");
const fn=read("supabase/functions/tle-jessy-owner/index.ts");
assert.match(page,/jessy-owner\.js\?v=202610\d{2}-[a-z0-9-]+-v\d+/);
assert.match(page,/command-center-app\.js\?v=202610(?:12|14)-[a-z0-9-]+-v1/);
assert.match(core,/TLEOwnerJessyGateway/);
assert.match(core,/workspace\?\.is_internal===true/);
assert.match(core,/auth\.getSession\(\)/);
assert.match(core,/tle-jessy-owner/);
assert.match(core,/premiumNavigate\(target\)/);
assert.doesNotMatch(ui,/jessy-site\.js/);
assert.match(ui,/function owner\(\)/);
assert.match(ui,/window\.TLEOwnerJessyGateway\?\.ready/);
assert.match(ui,/if\(!owner\(\)\)\{if\(root\)/);
assert.match(ui,/if\(waiting\|\|!owner\(\)\|\|!root\)return/);
assert.match(ui,/if\(!owner\(\)\)return/);
assert.match(ui,/function sync\(\)/);
assert.match(css,/@media\(max-width:600px\)/);
assert.match(fn,/platform_admins/);
assert.match(fn,/is_internal=eq\.true/);
assert.match(fn,/auth\/v1\/user/);
assert.match(fn,/if\(!allowed\.has\(origin\)\)/);
assert.match(fn,/tle_crm_leads/);
assert.match(fn,/tle_contact_leads/);
assert.match(fn,/tle_ai_agent_orders/);
assert.match(fn,/never/i);
assert.doesNotMatch(fn.slice(0,fn.indexOf("const WHATSAPP_KINDS")),/\bmethod:\s*"PATCH"|\bmethod:\s*"DELETE"/);
assert.match(fn,/method:"PATCH"/); // WhatsApp preference pause only; no operational writes
assert.match(fn,/tle_owner_whatsapp_alert_prefs/);
new Function(ui);
new Function(fn.replace(/^import .*?;\s*$/mg,""));

assert.match(core,/async draftCandidates\(\)/);
assert.match(core,/async prepareFollowupDraft\(leadId\)/);
assert.match(core,/async useFollowupDraft\(draft,subject,body\)/);
assert.match(core,/await this\.prepareFollowupDraft\(draft\.lead_id\)/);
assert.match(core,/ownerDailyBlockReason\(lead/);
assert.match(core,/\$\('prepareFollowup'\)\.click\(\)/);
assert.doesNotMatch(core.slice(core.indexOf("/* Jessy owner bridge"),core.indexOf("const say=",core.indexOf("/* Jessy owner bridge"))),/tle-crm-send-followup/);
assert.match(ui,/jo-draft-panel/);
assert.match(ui,/prepareDraftPanel/);
assert.match(ui,/useFollowupDraft/);
assert.match(ui,/Approve & open editor/);
assert.match(ui,/No due follow-ups have verified email permission/);
assert.match(ui,/Discard/);
assert.match(css,/jo-draft-approve/);
assert.match(fn,/data\?\.action==="draft_followup"/);
assert.match(fn,/const ws=workspaces\.find\(w=>w\.created_by===user\.id\)/);
assert.match(fn,/email_consent_status!=="authorized"/);
assert.match(fn,/email_followup_enabled!==true/);
assert.match(fn,/!lead\.followup\|\|lead\.followup>localToday/);
assert.match(fn,/email_failed/);
assert.match(fn,/24\*60\*60\*1000/);
assert.match(fn,/send_automatically:false/);
assert.match(fn,/requires_review:true/);
assert.doesNotMatch(fn,/fetch\("https:\/\/api\.resend\.com/);
const draftStart=fn.indexOf("function safePersonalName("),draftEnd=fn.indexOf("async function draftForLead(",draftStart);
const sample = {language:"es",contact:"Rosa",business:"Casa Limpia",primary_friction:"booking"};
const fnBuilder = new Function("clean",fn.slice(draftStart,draftEnd)+";return draftText;");
const writer=fnBuilder((x,n=350)=>String(x??"").replace(/[\u0000-\u001f<>]/g," ").trim().slice(0,n));
const draft=writer(sample,false);
assert.match(draft.body,/Hola Rosa/);
assert.match(draft.body,/¿Te gustaría verlo\?/);
assert.ok(draft.body.length<400);
assert.doesNotMatch(draft.body,/pago|tarjeta/i);
console.log("PASS Jessy drafts: authorized due follow-ups only, edited preview, explicit owner approval, no auto-send");

assert.match(core,/ownerJessyNotificationSnapshot/);
assert.match(core,/tle-crm-owner-notifications/);
assert.match(core,/workspace\.is_internal&&document\.body\.classList\.contains\('crm-owner-view'\)/);
assert.match(core,/openNotifications\(\)/);
assert.match(ui,/function onOwnerNotifications\(event\)/);
assert.match(ui,/jo-notification-nudge/);
assert.match(ui,/if\(!owner\(\)\|\|!root\|\|!event\.detail\)return/);
assert.match(ui,/window\.addEventListener\("tle-crm-owner-notifications",onOwnerNotifications\)/);
assert.match(css,/jo-notification-nudge/);
console.log("PASS Jessy listens for new private owner alerts with no duplicate event notices");

assert.match(core,/async whatsappAlertPrefs\(action,values=\{\}\)/);
assert.match(core,/whatsapp_get/);
assert.match(core,/whatsapp_save/);
assert.match(core,/whatsapp_disable/);
assert.match(core,/if\(!this\.ready\(\)\)throw Error\('Owner access required'\)/);
assert.match(ui,/async function showWhatsAppSettings\(\)/);
assert.match(ui,/jessy-whatsapp-settings/);
assert.match(ui,/consent\.required=true/);
assert.match(ui,/approved template/); // chat says not yet active
assert.match(ui,/jo-wa-settings/);
assert.match(css,/jo-wa-consent/);
assert.match(fn,/const WHATSAPP_KINDS=new Set/);
assert.match(fn,/action==="whatsapp_get"/);
assert.match(fn,/action==="whatsapp_save"/);
assert.match(fn,/action==="whatsapp_disable"/);
assert.match(fn,/if\(body\.consent!==true\)/);
assert.match(fn,/alerts_enabled:false/);
assert.match(fn,/provider_status:"awaiting_sender_connection"/);
assert.match(fn,/connected:false,can_send:false/);
assert.doesNotMatch(fn,/api\.whatsapp\.com|graph\.facebook\.com/);
console.log("PASS Jessy WhatsApp settings: owner-only opt-in, masked number, approval required, no sends");


assert.match(core,/if\(result\.action_performed==='mark_notifications_read'\)/);
assert.match(core,/Mark all unread Command Center notifications as read/);
assert.match(core,/all\.onclick=async\(\)=>/);
assert.match(core,/await loadStoredNotifications\(\)/);
assert.match(core,/if\(target==='notifications'\)return this\.openNotifications\(\)/);
assert.match(core,/unread:unread\.length/);
assert.match(ui,/Mark all Command Center notifications as read/);
assert.match(ui,/Marca todas las notificaciones como leídas/);
assert.match(ui,/result\.action_performed==="mark_notifications_read"/);
assert.match(ui,/dest!=="owner-help"/);
assert.match(ui,/if\(result\.navigate_now&&dest\)/);
assert.match(fn,/function classifyOwnerReadIntent\(question\)/);
assert.match(fn,/workspace_id=eq\./);
assert.match(fn,/read_at=is\.null&select=id/);
assert.match(fn,/function emailReadUnavailable/);
assert.match(fn,/const intent=classifyOwnerReadIntent\(message\)/);
assert.match(fn,/if\(intent==="mark_all_notifications_read"\)/);
assert.match(fn,/if\(intent==="email_read_unavailable"\)/);
const classifier = new Function(fn.slice(fn.indexOf("function classifyOwnerReadIntent("),fn.indexOf("async function markOwnerNotificationsRead("))+"; return classifyOwnerReadIntent;")();
for(const [request,expected] of [
 ["mark them read","mark_all_notifications_read"],
 ["Mark all notifications as read","mark_all_notifications_read"],
 ["Márcalos como leídos","mark_all_notifications_read"],
 ["marca todas las notificaciones como leídas","mark_all_notifications_read"],
 ["mark my emails read","email_read_unavailable"],
 ["marca los correos como leídos","email_read_unavailable"],
 ["don't mark them read",""],
 ["how do I mark alerts as read?",""],
 ["mark that notification as read","notification_selection_needed"]
]) assert.equal(classifier(request),expected,"Intent mismatch for "+request);
const markStart=fn.indexOf("async function markOwnerNotificationsRead(");
const markEnd=fn.indexOf("function emailReadUnavailable(",markStart);
const sent=[];
const fakeFetch=async(url,options)=>{
 sent.push({url,method:options.method,headers:options.headers,body:options.body});
 return {ok:true,async json(){return [{id:"a"},{id:"b"}]}};
};
const perform=new Function("BASE","SR","fetch","count","locale","AbortSignal",fn.slice(markStart,markEnd)+";return markOwnerNotificationsRead;")(
 "https://example.supabase.co","server-only-key",fakeFetch,async()=>0,(lang,en,es)=>lang==="es"?es:en,{timeout:()=>undefined});
const done=await perform("6c840a8a-c230-41cf-ae05-ad07c6612b25","es");
assert.equal(done.action_performed,"mark_notifications_read");
assert.equal(done.affected,2);
assert.equal(done.remaining_unread,0);
assert.equal(sent.length,1);
assert.equal(sent[0].method,"PATCH");
assert.match(sent[0].url,/workspace_id=eq\.6c840a8a-c230-41cf-ae05-ad07c6612b25&read_at=is\.null&select=id/);
assert.match(sent[0].body,/"read_at":/);
assert.doesNotMatch(sent[0].body,/delete|archive|email/);
console.log("PASS Jessy acts on notifications (EN/ES) with workspace-locked read-only-to-other-records update and real count");


const standalone=read("public/command-center/assets/jessy-owner-standalone.mjs");
const insights=read("public/command-center/lead-insights.html");
const preview=read("public/command-center/buyer-account-preview.html");
assert.match(core,/tle-owner-section-change/);
assert.match(core,/dataset\.tleOwnerSection=v/);
assert.match(core,/context\(\)\{/);
assert.match(core,/page_context:this\.context\(\)\.section/);
assert.match(ui,/window\.addEventListener\("tle-owner-section-change",syncContext\)/);
assert.match(ui,/function contextPrompts\(\)/);
assert.match(ui,/function syncContext\(\)/);
assert.match(ui,/function show\(\)/);
assert.match(ui,/contextLabel\(\)/);
assert.match(ui,/owner-jump:owner-pages/);
assert.match(ui,/if\(window\.TLEOwnerJessyGateway\?\.standalone\)/);
assert.match(css,/body\.crm-owner-view #tleOwnerJessy/);
assert.match(fn,/validOwnerContext/);
assert.match(fn,/async function projectReadiness/);
assert.match(fn,/client_readiness_review/);
assert.match(fn,/read_only:true/);
assert.match(ui,/function showProjectReadiness/);
assert.match(ui,/result\.read_only===true/);

assert.match(fn,/SAMPLE DATA/);
assert.match(standalone,/export async function mountOwnerJessy/);
assert.match(standalone,/await db\.auth\.getUser\(\)/);
assert.match(standalone,/\.eq\("is_internal",true\)/);
assert.match(standalone,/try\{await post\(\{action:"whatsapp_get"\}\)\}/);
assert.match(standalone,/session\.user\?\.id!==user\.id/);
assert.match(standalone,/this\.navigate\("notifications"\)/);
assert.match(standalone,/tle-owner-pending-section/);
assert.match(standalone,/jessy-owner\.js\?v=202610\d{2}-[a-z0-9-]+-v\d+/);
assert.match(insights,/jessy-owner-standalone\.mjs/);
assert.match(preview,/jessy-owner-standalone\.mjs/);
assert.ok(insights.indexOf("if(we||!w)")<insights.indexOf("mountOwnerJessy"),"Lead insights must verify role first");
assert.ok(preview.indexOf("if(wsErr||!workspace)")<preview.indexOf("mountOwnerJessy"),"Preview must verify role first");
assert.doesNotMatch(standalone,/service_role|SERVICE_ROLE_KEY/);
assert.doesNotMatch(standalone,/\.from\("tle_crm_notifications"\)\.update/);
const checkStandalone=new Function(standalone.replace(/^export /mg,"")+";return mountOwnerJessy;");
assert.equal(typeof checkStandalone,"function");
const contexts=["owner-pages","owner-calendar","pipeline","calendar","clients","inbox","emails","settings","owner-support","owner-help","lead-insights","buyer-preview"];
for(const label of contexts)assert.ok(ui.includes('"'+label+'"'),"Missing Jessy context "+label);
console.log("PASS universal owner Jessy: dashboard sections + private Lead Insights and Preview, login-gated and bilingual");

console.log("PASS Owner Jessy: auth-only visibility, verified aggregate reporting, EN/ES, read-only actions, responsive UI");
