import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const read=p=>{assert.ok(existsSync(p),p+' missing');return readFileSync(p,'utf8')};
const basic=read('public/intake/website/index.html');
const advanced=read('public/intake/website-ai-crm/index.html');
const websiteScript=read('public/assets/tle-website-intake.js');
const websiteBrief=read('public/assets/tle-website-intake-brief.js');
const bookingJs=read('public/assets/tle-guided-intakes.js');

for(const path of ['public/assets/tle-website-intake.js','public/assets/tle-website-intake-brief.js','public/assets/tle-guided-intakes.js']){
 execFileSync(process.execPath,['--check',path],{stdio:'pipe'});
}
for(const [label,html] of [['basic',basic],['advanced',advanced]]){
 for(const key of ['name','email','business_name','industry','business_location','services','customer_action','website_language','preferred_email','business_hours','domain_option','domain_preference','phone','website_photos','brand_assets_url','ai_photo_request','consent']){
  assert.match(html,new RegExp('name="'+key+'"'),label+' missing '+key);
 }
 assert.match(html,/<details class="intake-optional full" id="website-extra-details">/,'optional extras collapsed by default');
 assert.match(html,/<summary data-i18n="setupExtrasSummary">/,'optional details have a clear summary');
 assert.doesNotMatch(html,/name="preferred_email"[^>]*\brequired/,'inquiry email should default to checkout email');
 assert.doesNotMatch(html,/name="domain_option"[^>]*\brequired/,'included hosted domain is the safe default');
 assert.match(html,/<option value="need_link"/,'included hosted domain retained');
 assert.match(html,/<select name="website_language"/,'language selected without a long text prompt');
 assert.match(html,/name="consent"[^>]*\brequired/,'explicit consent retained');
 assert.match(html,/id="photo-picker-dialog"/,'photo gallery stays within intake');
 assert.match(html,/id="intake-form" hidden/,'paid-only form must start hidden');
 assert.doesNotMatch(html,/type="password"/,'do not ask customer for their password');
}
assert.match(websiteScript,/preferred_email:get\(f,'preferred_email'\)\|\|get\(f,'email'\)/,'default inquiry email to checkout email');
assert.match(websiteScript,/note\('Preferred website languages',get\(f,'website_language'\)/,'send language preference with verified intake');
assert.match(websiteScript,/tle-studio-website-confirm-payment/,'keep verified paid gate');
assert.match(websiteScript,/Command Center access','never issue access before delivery');
for(const key of ['setupExtrasSummary','inboxOptional','publicPhoneOptional','siteLangLabel','siteLangBoth']){
 const hits=[...websiteBrief.matchAll(new RegExp(key+':','g'))].length;
 assert.equal(hits,2,key+' must have English and Spanish translations');
}

for(const [tag,path] of [['en','public/booking-flow-intake/index.html'],['es','public/es/booking-flow-intake/index.html']]){
 const html=read(path);
 const open=html.indexOf('<details class="optional-details full" id="booking-approval-options">');
 assert.ok(open>=0,tag+' optional approval options missing');
 const closed=html.indexOf('</details>',open);
 assert.ok(closed>open,tag+' missing approval details close');
 const inner=html.slice(open,closed);
 assert.match(inner,/name="quote_estimate_rules"/,'preserve backend pricing approval field');
 assert.match(inner,/name="flat_price_auto_confirm"/,'preserve backend auto confirmation field');
 assert.match(inner,/<option value="always_review" selected>/,'quotes require owner approval by default');
 assert.match(inner,/<option value="false" selected>/,'no automatic booking confirmations by default');
 assert.match(html,/name="availability"[^>]*\brequired/,'availability remains essential');
 assert.match(html,/name="business_category"[^>]*\brequired/,'industry still required');
 assert.match(html,/name="customer_payment_methods"[^>]*\brequired/,'payment methods still collected');
 assert.match(html,/TLEGuidedIntakes\.mountBooking/,'guided pricing preserved');
 assert.match(html,/TLEDurationPicker\?\.mount/,'appointment duration required');
 assert.match(html,/data\.language="(?:en|es)"/,'bilingual identity retained');
}
assert.match(bookingJs,/tle-guided-estimate-optional/,'optional estimate factors collapsed');
assert.match(bookingJs,/style\.hidden=true;style\.required=false/,'duplicate pricing selector hidden');
assert.match(bookingJs,/style\.value=modes\.has\("fixed"\)/,'legacy pricing value derived from actual guided entries');
assert.match(bookingJs,/custom_quotes_require_review:true,auto_confirm:false/,'guided pricing never activates bookings');

for(const [path,names] of [
 ['public/intake/automation/index.html',['full_name','business_name','email','website','website_platform','services','website_workflow','lead_destination']],
 ['public/es/intake/automation/index.html',['full_name','business_name','email','website','website_platform','services','website_workflow','lead_destination']],
 ['public/intake/va/index.html',['full_name','business_name','email','main_services','top_tasks','approval_required']],
 ['public/es/intake/va/index.html',['full_name','business_name','email','main_services','top_tasks','approval_required']],
 ['public/custom-app/index.html',['name','email','business_name','goal_choices','feature_choices','consent']]
]){
 const html=read(path);
 for(const field of names)assert.match(html,new RegExp('name="'+field+'"'),path+' missing '+field);
 assert.match(html,/optional|opcional|extra/i,path+' should keep secondary detail optional');
}
console.log('PASS — concise EN/ES website, booking, automation, VA and custom-app intakes; all gates and safe defaults preserved.');
