import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const sql=readFileSync('supabase/migrations/20261015135000_tle_ai_team_order_blocker_watch.sql','utf8');
const js=readFileSync('public/command-center/assets/command-center-app.js','utf8');
const html=readFileSync('public/command-center/index.html','utf8');

for(const invariant of [
  'private.tle_ai_team_watch_order_blockers()',
  "w.is_internal is true",
  'public.platform_admins',
  "payment_status='paid' and delivery_sent_at is null",
  'tle_sales_workspace_id=v_ws or tle_sales_workspace_id is null',
  "a.intake_sent_at is null",
  "interval '24 hours'",
  "interval '48 hours'",
  "activation_email_delivery_status is distinct from 'delivered'",
  "stripe_session_id like 'cs_live_%'",
  "where delivered_at is null and tle_sales_workspace_id=v_ws",
  "create or replace function private.tle_ai_team_watch_order_blockers()",
  "from public,anon,authenticated",
  "tle-ai-team-order-blockers-hourly",
  "external_actions',0"
])assert(sql.includes(invariant), 'Missing private watchdog invariant: '+invariant);
assert(!/net\.http_|sendBusinessEmail|api\.resend\.com|api\.stripe\.com|stripe\.checkout|fetch\(/i.test(sql),'Watchdog must not contact or charge customers');
assert(!sql.includes('update public.tle_booking_flow_accounts')&&!sql.includes('update public.tle_ai_agent_orders'),'Monitoring must not change orders');

for(const id of ['ownerOrderControl','ownerOrderControlItems','ownerAIAssistantOrders','ownerAIOrdersList'])assert(html.includes('id="'+id+'"'),'Missing unified owner element '+id);
for(const fragment of [
 "ownerPurchases=[];ownerBookingError='unavailable'",
 "ownerBookingError=''",
 "void loadOwnerAIOrders();",
 "ownerAIError='unavailable'",
 "a.buyer_signed_in_after_email===true",
 "a.release_ready===true",
 "a.activation_email_delivery_status==='delivered'"
])assert(js.includes(fragment),'Missing fail-closed owner overview behavior '+fragment);
console.log('PASS: hourly owner watch (no sends), real delivery evidence, Booking/AI failure isolation.');

const bundleWatch=readFileSync('supabase/migrations/20261015153000_tle_ai_team_bundle_stall_watch.sql','utf8');
for(const invariant of [
 'private.tle_ai_team_watch_bundles()',
 "payment_status='paid'",
 "b.ai_addon_offer in ('ai-booking','ai-followup','ai-business')",
 'o.stripe_session_id=b.stripe_session_id',
 'o.offer=b.ai_addon_offer',
 'o.tle_sales_workspace_id=v_ws',
 "interval '20 minutes'",
 "interval '4 hours'",
 'missing-ai:',
 'ai-pending:',
 'booking-pending:',
 'external_actions',
 'from public,anon,authenticated'
])assert(bundleWatch.includes(invariant),'Missing bundle alert safeguard '+invariant);
assert(!/api\.resend|api\.stripe|net\.http|stripe\.checkout|fetch\(/i.test(bundleWatch),'Bundle watcher must not send or charge');
assert(!/update\s+public\.tle_(booking_flow_accounts|ai_agent_orders)/i.test(bundleWatch),'Watcher must not change customer orders');
const linkedRpc=readFileSync('supabase/migrations/20261015151000_tle_owner_bundle_queue_linked_ai.sql','utf8');
assert(linkedRpc.includes("'ai_order_id',a.id"),'Bundle owner queue must contain linked AI id');
assert(linkedRpc.includes('o.stripe_session_id=b.stripe_session_id'),'Owner AI order must be linked by exact verified checkout session');
assert(linkedRpc.includes("b.payment_status='paid'"),'Never surface unpaid bundles as purchases');
console.log('PASS: bundle lifecycle alerts are owner-only, checkout-linked, deduplicated and read-only.');
