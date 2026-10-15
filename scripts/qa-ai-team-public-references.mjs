import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync('public/command-center/assets/ai-team.js','utf8');
const page=readFileSync('public/command-center/ai-team.html','utf8');
for(const x of [
 'startsWith("Public evidence · ")',
 'startsWith("Prepared review · ")',
 'preparedReview?.status==="draft"',
 'await api({action:"review_output",id:preparedReview.id,decision})',
 'await api({action:"approve",id:t.id})',
 'await api({action:"status",id:t.id,status:"blocked"})',
 'if(t.status==="needs_approval"&&!pendingPreparedReview)'
])assert(ui.includes(x),'Missing safe public-source review UI requirement: '+x);
assert(page.includes('20261015-public-evidence-review'),'Must not serve stale approval UI');
assert(!ui.includes('fetch(preparedReview.content)'), 'Do not fetch arbitrary URLs from public draft text');
console.log('PASS: public-source findings prioritized; both owner decision paths remain approval-gated.');
