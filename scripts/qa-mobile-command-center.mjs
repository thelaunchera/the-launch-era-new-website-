import {readFileSync} from "node:fs";
import {Script} from "node:vm";
import assert from "node:assert/strict";
const base="public/command-center/";
const html=readFileSync(base+"index.html","utf8");
const css=readFileSync(base+"assets/command-center.css","utf8");
const i18n=readFileSync(base+"assets/command-center-i18n.js","utf8");
const owner=readFileSync(base+"assets/jessy-owner.css","utf8");
const ownerJS=readFileSync(base+"assets/jessy-owner.js","utf8");
const news=readFileSync(base+"assets/command-center-notification-settings.js","utf8");
const checks=[
 ["viewport meta uses device width",html.includes('name="viewport" content="width=device-width,initial-scale=1"')],
 ["owner and client share responsive dashboard",css.includes("#app:not(.hidden) .premium-workspace")],
 ["mobile display stays inside viewport",css.includes("overflow-x:clip")&&css.includes("max-width:100%!important")],
 ["embedded phone preview never overflows narrow screens",css.includes("#ownerTwoPreviews #ownerEmbeddedPreviewShell.is-phone")&&css.includes("width:min(390px,100%)!important")],
 ["preview controls wrap on phone",css.includes("#ownerTwoPreviews .owner-preview-controls")&&css.includes("grid-template-columns:repeat(2,minmax(0,1fr))")],
 ["owner preview text can wrap",css.includes("#ownerTwoPreviews>p")&&css.includes("overflow-wrap:break-word")],
 ["language widget docks out of floating overlap",i18n.includes("function tleSyncLanguageDock()")&&i18n.includes(".crm-workspace-backrow")&&css.includes("body:has(#app:not(.hidden)) .crm-workspace-backrow #crmLanguagePicker.floating")],
 ["Jessy mobile trigger reduces to single icon",owner.includes("Compact Jessy over narrow")&&owner.includes(".jo-fab > span{display:none!important}")],
 ["Jessy panel obeys viewport",owner.includes("width:min(400px,calc(100dvw - 12px))")],
 ["iOS form inputs avoid focus zoom",css.includes("Prevent iOS WebKit from auto-zooming")&&css.includes("font-size:max(16px,1rem)!important")],
 ["responsive assets cache busted",html.includes("command-center.css?v=20261012-preview-exit-v1")&&html.includes("command-center-i18n.js?v=20261012-mobilefit-v2")&&/jessy-owner\.css\?v=20261012-[a-z0-9-]+-v[0-9]+/.test(ownerJS)],
 ["notification preferences stay available",html.includes("command-center-notification-settings.js")&&news.includes("Notification.requestPermission()")]
];
new Script(i18n,{filename:"command-center-i18n.js"});
new Script(ownerJS,{filename:"jessy-owner.js"});
new Script(news,{filename:"command-center-notification-settings.js"});
for(const [name,pass] of checks){console.log((pass?"PASS":"FAIL")+" "+name);assert.ok(pass,name)}
console.log("PASS "+checks.length+" mobile Command Center regression checks");
