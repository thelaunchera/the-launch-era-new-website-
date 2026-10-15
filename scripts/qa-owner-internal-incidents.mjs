import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('public/command-center/index.html','utf8');
const app=readFileSync('public/command-center/assets/command-center-app.js','utf8');
for(const id of ['ownerInternalIncidents','ownerIncidentList','ownerIncidentSummary','ownerIncidentAddToggle','ownerIncidentCreateForm','ownerIncidentClient','ownerIncidentTitle','ownerIncidentDetails','ownerIncidentCreateStatus']){
 assert.ok(html.includes('id="'+id+'"'), 'Missing owner-only incident element: '+id);
}
assert.match(html,/crm-owner-only[^"]*"[^>]*>[\s\S]*?id="ownerInternalIncidents"/,'Internal history must be contained inside owner-only support view');
assert.match(html,/command-center-app\\.js\\?v=20\\d{6}-[a-z0-9-]+/,'Command Center JS must have a dated cache-busting version');
for(const rpc of ['tle_crm_owner_incidents_list','tle_crm_owner_incidents_create','tle_crm_owner_incidents_update']){
 assert.ok(app.includes(rpc),'Missing private owner RPC: '+rpc);
}
assert.match(app,/if\(!workspace\?\.is_internal\)/,'Internal issue actions require owner workspace');
assert.match(app,/p_qa_verified:checked\.checked/,'Resolution needs explicit QA verification');
assert.match(app,/const \{data,error\}=await db\.rpc\('tle_crm_owner_incidents_list'\)/);
assert.ok(!html.includes('id="buyerInternalIncidents"'),'Never expose owner history to client workspace');
console.log('PASS — owner-only incident history wiring and QA guard');
