import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('public/command-center/index.html','utf8');
const app=readFileSync('public/command-center/assets/command-center-app.js','utf8');
for(const id of ['ownerInternalIncidents','ownerIncidentList','ownerIncidentSummary','ownerIncidentAddToggle','ownerIncidentCreateForm','ownerIncidentClient','ownerIncidentTitle','ownerIncidentDetails','ownerIncidentCreateStatus']){
 assert.ok(html.includes('id="'+id+'"'), 'Missing owner-only incident element: '+id);
}
assert.match(html,/crm-owner-only[^"]*"[^>]*>[\s\S]*?id="ownerInternalIncidents"/,'Internal history must be contained inside owner-only support view');
assert.match(html,/command-center-app\.js\?v=20\d{6}-[a-z0-9-]+/,'Command Center JS must have a dated cache-busting version');
for(const rpc of ['tle_crm_owner_incidents_list','tle_crm_owner_incidents_create','tle_crm_owner_incidents_update']){
 assert.ok(app.includes(rpc),'Missing private owner RPC: '+rpc);
}
assert.match(app,/if\(!workspace\?\.is_internal\)/,'Internal issue actions require owner workspace');
assert.match(app,/p_qa_verified:checked\.checked/,'Resolution needs explicit QA verification');
assert.match(app,/const \{data,error\}=await db\.rpc\('tle_crm_owner_incidents_list'\)/);
assert.ok(!html.includes('id="buyerInternalIncidents"'),'Never expose owner history to client workspace');
// Reuse the existing website-delivery screen; never clone buyer records or a second Command Center.
const websiteDelivery=readFileSync('public/website-delivery-admin/index.html','utf8');
assert.equal((html.match(/id="ownerWebsiteDeliveryShortcut"/g)||[]).length,1,'Exactly one website-delivery shortcut in the existing owner home');
assert.equal((html.match(/href="\/website-delivery-admin\/"/g)||[]).length,1,'No duplicate website-delivery links');
const shortcutPosition=html.indexOf('id="ownerWebsiteDeliveryShortcut"');
assert.ok(shortcutPosition>html.indexOf('id="ownerPagesHub"')&&shortcutPosition<html.indexOf('id="ownerSupportPanel"'),'Website shortcut must remain in owner-only orders');
assert.match(html,/No aparecen automáticamente en esta lista de Booking/,'Do not misrepresent website purchases as synced');
assert.match(websiteDelivery,/href="\/command-center\/"/,'Existing delivery panel must return to the original Command Center');
assert.match(websiteDelivery,/storageKey:"tle-crm-auth"/,'Owner delivery must reuse Command Center authentication storage');
assert.match(app,/storageKey:'tle-crm-auth'/,'Original Command Center session key must remain unchanged');
assert.match(websiteDelivery,/action:"list"/);
assert.match(websiteDelivery,/action:"confirm_delivery"/);
console.log('PASS — owner-only incidents, single website delivery link and shared existing login');
