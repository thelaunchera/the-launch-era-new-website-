import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync('supabase/migrations/20261015145000_tle_owner_bundle_integrity_watch.sql','utf8');
const ui=readFileSync('public/command-center/assets/command-center-app.js','utf8');
const html=readFileSync('public/command-center/index.html','utf8');
for(const expected of [
  "private.tle_ai_team_watch_bundle_integrity()",
  "payment_status='paid'",
  "tle_sales_workspace_id=v_ws",
  "ai_addon_offer in ('ai-booking','ai-followup','ai-business')",
  "stripe_session_id=v_booking.stripe_session_id",
  "offer=v_booking.ai_addon_offer",
  "v_booking.intake_completed_at is not null",
  "interval '15 minutes'",
  "interval '24 hours'",
  "watch:bundle:missing-ai:",
  "watch:bundle:ai-pending:",
  "watch:bundle:booking-pending:",
  "watch:bundle:active-no-delivery:",
  "revoke all on function private.tle_ai_team_watch_bundle_integrity() from public,anon,authenticated",
  "'tle-owner-bundle-integrity-hourly'",
  "'external_actions',0",
  "'customer_orders_changed',0"
])assert(sql.includes(expected),'Missing bundle guard '+expected);
assert(!/fetch\(|net\.http_|http_post|api\.stripe|api\.resend/i.test(sql),'Bundle watchdog must not send, charge or browse');
assert(!/update public\.tle_(?:ai_agent_orders|booking_flow_accounts)/i.test(sql),'Monitor must not change paid orders');
for(const marker of [
 "const ownerBundlePlans=",
 "function ownerBundleComplete(",
 "function ownerPurchaseDisplayStage(",
 "function ownerOrderBuckets(",
 "function ownerBundleNext(",
 "async function loadOwnerBundles()",
 "db.rpc('tle_owner_bundle_queue')",
 "const joinedAI=new Set(",
 "if(!linked.ai_order_id||linked.ai_status==='not_prepared')",
 "return ownerBundleComplete(a,linked)?'completed':'bundle';"
])assert(ui.includes(marker),'Missing bundle owner view '+marker);
assert(html.includes('<option value="bundle">Booking + AI Bundle</option>'),'Bundle must be selectable from owner order filters');
console.log('PASS Bundle owner QA: paid-only, linked intake, separated releases, idempotent internal alerts, zero external actions.');
