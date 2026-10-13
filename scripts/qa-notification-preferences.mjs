import {readFileSync,existsSync} from "node:fs";
import assert from "node:assert/strict";
import {Script} from "node:vm";
const root="public/command-center/";
const page=readFileSync(root+"index.html","utf8");
const app=readFileSync(root+"assets/command-center-app.js","utf8");
const js=readFileSync(root+"assets/command-center-notification-settings.js","utf8");
const sw=readFileSync(root+"sw.js","utf8");
const manifest=JSON.parse(readFileSync(root+"manifest-tle.webmanifest","utf8"));
const checks=[
 ["client script is linked",page.includes('assets/command-center-notification-settings.js')],
 ["owner and buyer use shared authenticated gateway",app.includes("TLECommandCenterNotificationsGateway")&&app.includes("crm-buyer-view")],
 ["requires authenticated Supabase session",app.includes("db.auth.getSession()")&&app.includes("session.access_token")],
 ["uses per-workspace request routing",app.includes("workspace_id:workspace.id")],
 ["email channel explicit opt-in",js.includes('["email","Email"')&&js.includes("email_enabled")],
 ["phone channel explicit opt-in",js.includes('["phone","Phone notifications"')&&js.includes("push_enabled")],
 ["user controls topics independently",js.includes("tle-ns-topics")&&js.includes("getTopics()")],
 ["AI messaging is entitlement gated",js.includes('kind[0]==="ai_message"&&!data.ai_eligible')],
 ["push notification permission from a real click",js.includes("Notification.requestPermission()")&&js.includes('enableDevice')],
 ["iOS Home Screen guidance",js.includes("Add to Home Screen")],
 ["iOS PWA is standalone",manifest.display==="standalone"&&manifest.scope==="./"],
 ["service worker implements notification click",sw.includes('addEventListener("push"')&&sw.includes('addEventListener("notificationclick"')],
 ["no legacy Jessy push duplication",!page.includes('assets/jessy-push.js?v=')],
 ["client app script is present",existsSync(root+"assets/command-center-app.js")]
];
new Script(js,{filename:"command-center-notification-settings.js"});
new Script(sw,{filename:"sw.js"});
let failures=0;for(const [label,pass] of checks){if(!pass)failures++;console.log((pass?"PASS":"FAIL")+" - "+label)}
assert.equal(failures,0,"Notification preference QA did not pass");
console.log("PASS - "+checks.length+" notification UI/permission checks");
