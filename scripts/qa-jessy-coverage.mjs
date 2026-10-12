import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const text = (path) => readFileSync(path, "utf8");
const root = text("src/routes/__root.tsx");
assert.match(root, /<script src="\/assets\/jessy-site\.js\?v=[^"]+" defer \/>/);

const publicPages = [
  "ai-booking-assistant/index.html",
  "es/ai-booking-assistant/index.html",
  "whatsapp-ai-agent/index.html",
  "es/whatsapp-ai-agent/index.html",
  "cleaning-app-demo/index.html",
  "booking-demo/index.html",
  "privacy.html",
  "es/privacy.html",
  "terms.html",
  "es/terms.html",
  "automation-terms/index.html",
  "es/automation-terms/index.html",
  "va-terms/index.html",
  "es/va-terms/index.html",
];
for (const page of publicPages) {
  const html = text("public/" + page);
  assert.match(html, /src="\/assets\/jessy-site\.js\?v=[^"]+"/, page + " missing Jessy");
}
const front = text("public/assets/jessy-site.js");
new Function(front); // Syntax-check without running a browser assistant.
assert.match(front, /page_path:location\.pathname/);
assert.match(front, /function handleRoute\(\)/);
assert.match(front, /"cleaning-app"/);
assert.match(front, /cleaning-app-demo/);
assert.match(front, /Start free trial/);
const contextFunction = front.slice(front.indexOf("function currentPage()"), front.indexOf("let lang="));
for (const [path, expected] of [
  ["/", ""],
  ["/cleaning-web-app", "cleaning-app"],
  ["/es/cleaning-web-app/", "cleaning-app"],
  ["/cleaning-app-demo/", "cleaning-app"],
  ["/booking-lead-automation", "booking"],
  ["/es/ai-booking-assistant", "ai-booking"],
  ["/website-automation", "website"],
]) {
  const box = { location: { pathname: path } };
  vm.createContext(box);
  vm.runInContext(contextFunction + ";contextResult=currentPage();", box);
  assert.equal(box.contextResult, expected, path);
}
const backend = text("supabase/functions/tle-jessy-chat/index.ts");
assert.match(backend, /const focus=pageOffer\(b\.page_path\)/);
assert.match(backend, /id==="cleaning-app"\?"\/cleaning-app-demo/);
assert.match(backend, /trial:id==="cleaning-app"/);
assert.match(backend, /function appHelp/);
console.log("PASS Jessy universal public pages, English/Spanish route focus, Cleaning App answers and safe next steps");
