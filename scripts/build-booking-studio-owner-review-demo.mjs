#!/usr/bin/env node
/**
 * Build a visual-only, fictional Booking Studio review packet. NO client account,
 * purchase, Supabase write, external delivery, email, or production publishing.
 */
import assert from "node:assert/strict";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {createHash} from "node:crypto";
import {renderBookingStudioPreview} from "../lib/booking-studio-preview.mjs";
const root=resolve(".private-preview/owner-approval-demo");
await mkdir(root,{recursive:true,mode:0o700});
const source=JSON.parse(await readFile("fixtures/booking-studio-bright-rooms-synthetic.json","utf8"));
const other=JSON.parse(await readFile("fixtures/booking-studio-synthetic.json","utf8"));
const revision={...source,design:{...source.design,
 layout:"split",cards:"photographic",typography:"elegant",
 hero_title:"A little more calm, right at home.",
 hero_body:"From everyday upkeep to a deeper refresh, tell us what your space needs. We'll help with the next step.",
 design_rationale:"Owner-requested revision: quieter split editorial layout and more human language, still a fictional brand."}};
const jobs=[
 {name:"bright-rooms-first-draft",job:source,decision:"REQUEST_CHANGES",notes:"Make the hero calmer, improve the supporting copy and try a split editorial layout."},
 {name:"bright-rooms-revised",job:revision,decision:"READY_FOR_OWNER_REVIEW",notes:"Revised copy and layout. This synthetic preview is not a verified client build."},
 {name:"harbor-house-alternative-brand",job:other,decision:"VISUAL_COMPARISON_ONLY",notes:"Separate fictional business and different layout, not a logo swap."}
];
assert.notEqual(source.client.business_name,other.client.business_name);
assert.notEqual(source.design.hero_title,revision.design.hero_title);
assert.notEqual(source.design.layout,revision.design.layout);
const manifest={type:"synthetic-owner-review-visual-only",published:false,client_notified:false,
 production_order_created:false,production_qa_passed:false,owner_approval_recorded:false,
 functional_booking_tested:false,generated_at:new Date().toISOString(),previews:[]};
for(const item of jobs){
 const html=renderBookingStudioPreview(item.job,{watermark:"FICTIONAL · OWNER REVIEW ONLY"});
 assert.ok(!html.includes("<script"),"No active scripts in review artifact");
 assert.ok(!html.includes("<form"),"No live form in review artifact");
 const file=item.name+".html";
 await writeFile(resolve(root,file),html,{flag:"wx",mode:0o600});
 manifest.previews.push({file,fictional_business:item.job.client.business_name,tenant_fixture:item.job.tenant_id,
  decision:item.decision,owner_notes:item.notes,layout:item.job.design.layout,
  hero_title:item.job.design.hero_title,sha256:createHash("sha256").update(html).digest("hex")});
}
await writeFile(resolve(root,"review-manifest.json"),JSON.stringify(manifest,null,2)+"\n",{flag:"wx",mode:0o600});
console.log("PASS: 3 distinct fictional owner-review HTML artifacts + revision manifest, PRIVATE / NOT DEPLOYED.");
