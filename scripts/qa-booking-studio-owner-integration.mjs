import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=async p=>readFile(p,"utf8");
const [edge,sql,html,client]=await Promise.all([
 read("supabase/functions/tle-booking-studio-owner/index.ts"),
 read("supabase/migrations/20261014_tle_booking_studio_jobs.sql"),
 read("public/command-center/booking-studio.html"),
 read("public/command-center/assets/booking-studio.js")
]);
assert.match(edge,/platform_admins/);
assert.match(edge,/is_internal=eq\.true/);
assert.match(edge,/crm_workspace_id=not\.is\.null/);
assert.match(edge,/account\.crm_workspace_id!==a\[0\]\.client_workspace_id/);
assert.match(edge,/client_workspace_id:account\.crm_workspace_id/);
assert.match(edge,/b\.tenant_id!==job\.client_workspace_id/);
assert.doesNotMatch(edge,/crm_workspace_id=eq\."\+ctx\.workspace/);
assert.match(edge,/payment_status=eq\.paid/);
assert.match(edge,/owner_start_approved!==true/);
assert.match(edge,/owner_workspace_id=eq\./);
assert.match(edge,/QA_IDS/);
assert.match(edge,/creative_suggest/);
assert.match(edge,/GROQ_API_KEY/);
assert.match(edge,/photos_verified:false/);
assert.match(edge,/requires_owner_review:true/);
assert.match(edge,/stage:"approved"/);
assert.match(edge,/published:false/);
assert.match(edge,/client_notified:false/);
assert.doesNotMatch(edge,/api\.resend\.com|metricool\.com|github\.com\/repos|Deno\.run\(/);
assert.match(sql,/enable row level security/);
assert.match(sql,/revoke all .* from anon,authenticated/);
assert.match(sql,/unique \(owner_workspace_id,booking_account_id\)/);
const tenantSql=await read("supabase/migrations/20261014_tle_booking_studio_customer_tenant.sql");
assert.match(tenantSql,/client_workspace_id uuid references/);
assert.match(tenantSql,/client_workspace_id set not null/);
assert.match(html,/noindex,nofollow,noarchive/);
assert.match(html,/booking-studio\.js/);
assert.match(client,/tle-booking-studio-owner/);
assert.match(client,/db\.auth\.getSession/);
assert.match(client,/Authorization:"Bearer "/);
assert.match(client,/confirm\(/);
assert.match(client,/published:false/);
assert.match(client,/tenant_id:state\.selected\.client_workspace_id/);
assert.match(client,/tenant_id:job\.client_workspace_id/);
assert.match(client,/client_notified:false/);
assert.doesNotMatch(client,/innerHTML\s*=/);
assert.doesNotMatch(client,/localStorage\.setItem/);
const browserPreview=await read("public/command-center/assets/booking-studio-preview.mjs");
const nodePreview=await read("lib/booking-studio-preview.mjs");
assert.equal(browserPreview,nodePreview,"Browser and CI preview renderer must match");
assert.match(html,/sandbox=""/);
console.log("Booking Studio owner API and UI: 38 security and integration checks passed.");
