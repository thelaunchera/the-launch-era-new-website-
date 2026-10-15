import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync('supabase/migrations/20261015124000_tle_ai_team_auto_prepared_briefs.sql','utf8');
const js=readFileSync('public/command-center/assets/ai-team.js','utf8');

for(const marker of [
  'private.tle_ai_team_prepare_automatic_briefs',
  'tle_ai_team_outputs_automation_dedupe',
  'on conflict (workspace_id,automation_key)',
  "q.task_origin in ('platform_event','daily_review')",
  "w.is_internal is true",
  "status='needs_approval'",
  "'draft','template','prepared:'",
  "'*/5 * * * *'",
  "where id=v_suffix::uuid and tle_sales_workspace_id=t.workspace_id",
  "payment_status='paid' and delivery_sent_at is null",
  "and delivered_at is null",
  'external_actions'
])assert(sql.includes(marker),'Missing guarded automation invariant: '+marker);
assert(!/net\.http_|api\.resend|api\.stripe|pg_sleep|http_post\(/i.test(sql),'Auto worker must be DB-only');
for(const marker of [
 'const preparedReview=outputs.find(',
 'const pendingPreparedReview=preparedReview?.status==="draft"',
 'await api({action:"review_output",id:preparedReview.id,decision})',
 'await api({action:"approve",id:t.id})',
 'await api({action:"status",id:t.id,status:"blocked"})',
 'No public links were inspected',
 'No messages sent or orders changed'
])assert(js.includes(marker),'Missing UI owner-review safety behavior: '+marker);
assert(js.includes('if(t.status==="needs_approval"&&!pendingPreparedReview)'), 'Do not bypass prepared brief review');
console.log('PASS automatic source-backed briefs: scoped, idempotent, approval-gated, no outbound actions');
