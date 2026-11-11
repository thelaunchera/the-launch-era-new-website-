import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const built=process.argv.includes('--built');
const root=built?'.output/public':'public';
const read=path=>readFileSync(join(root,path),'utf8');
const auth=read('command-center/index.html');
const app=read('command-center/assets/command-center-app.js');
const premium=read('command-center/assets/premium-access-20261111.js');
const toggles=read('command-center/assets/ios-settings-20261111.js');
const style=read('command-center/assets/ios-settings-20261111.css');
const shared=read('assets/tle-ios-language-switch-20261111.js');
const sharedCss=read('assets/tle-ios-language-switch-20261111.css');
assert.ok(auth.includes('premium-access-20261111.js'));
assert.ok(auth.includes('ios-settings-20261111.js'));
assert.ok(auth.includes('tleIosSettingsFollowups'));
assert.ok(app.includes("db.auth.signInWithPassword(x)"));
assert.ok(app.includes("db.auth.signUp({email:x.email,password:x.password"));
assert.ok(app.includes("db.rpc('tle_crm_buyer_auth_state')"));
assert.ok(app.includes("dataset.authMode==='signup'"));
assert.ok(app.includes('clearExpiredCommandAccount()'));
assert.ok(premium.includes('data-access-mode="signin"'));
assert.ok(premium.includes('data-access-mode="signup"'));
assert.ok(premium.includes('data-email-resend'));
assert.ok(premium.includes('readyAt=Date.now()+60000'));
assert.ok(toggles.includes("select.dispatchEvent(new Event('change'"));
assert.ok(toggles.includes("activate?.click()"));
assert.ok(toggles.includes("pause?.click()"));
assert.ok(toggles.includes('followup.disabled='));
assert.ok(style.includes('width:84px;height:46px'));
assert.ok(style.includes('cubic-bezier(.20,1.42,.38,1)'));
assert.ok(shared.includes('target.click()'));
assert.ok(shared.includes("original.dispatchEvent(new Event('change'"));
assert.ok(shared.includes('data-tle-alternate-path')||shared.includes('tleAlternatePath'));
assert.ok(sharedCss.includes('width:84px!important'));
assert.ok(sharedCss.includes(':active .tle-ios-locale-knob'));
assert.ok(sharedCss.includes('prefers-reduced-motion:reduce'));
if(built){
 const expected=['demos/la-vie-in-pink/index.html','demos/freska/index.html',
  'demos/casa-brownie/index.html','website-for-your-business/index.html',
  'es/website-for-your-business/index.html'];
 for(const path of expected){
  const page=read(path);
  assert.ok(page.includes('tle-ios-language-switch-20261111.js'),path);
 }
 assert.ok(!read('command-center/index.html').includes('tle-ios-language-switch-20261111.js'),
  'Private Command Center must not receive public demo language switch');
}
console.log('iOS language and settings QA passed'+(built?' against built Pages assets':' against sources'));
