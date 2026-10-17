// Source-level checks for public Jessie, sample Sonny and owner-only Jessy chat motion.
// No accounts, form submissions, emails, bookings or customer data involved.
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
const paths=[
 "public/assets/jessy-site.js",
 "public/assets/tle-ai-booking-chat.js",
 "public/command-center/assets/jessy-owner.js"
];
for(const path of paths){
 const source=readFileSync(path,"utf8");
 assert.doesNotThrow(()=>new Function(source),path+" must remain valid JavaScript");
 for(const requirement of [
  "function attachTleChatMotion(", "attachTleChatMotion(log)",
  "MutationObserver", "prefers-reduced-motion: reduce", "document.hidden",
  "role", "aria-live", "Math.max(0,900-",
  "tle-chat-waiting", "tleChatBubbleIn", "tle-chat-caret"
 ])assert(source.includes(requirement),path+" missing motion guard: "+requirement);
 const typeDelay=/state\.timer=setTimeout\(next,(\d+)\)/.exec(source);
 assert(typeDelay&&Number(typeDelay[1])>=45&&Number(typeDelay[1])<=150,
  path+" should animate one word at a human-readable, bounded 45–150ms interval");
 assert(source.includes('if(node.classList.contains("user")){finishAll()'),
  path+" must never replay or stream real user messages");
 assert(source.includes("if(reduce.matches||!visible(node))"),
  path+" must reveal full replies when hidden or reduced motion");
 assert(!source.includes("setInterval(next"),
  path+" must not loop any real conversation");
 assert(source.includes("#347ba8")&&source.includes("#286c99"),
  path+" missing accessible soft-blue accent");
}
console.log("PASS — consistent Jessie, Sonny and owner Jessy motion; no replay, accessible fallback, valid JS.");
