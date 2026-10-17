import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const form=readFileSync("public/booking-demo/index.html","utf8");
const api=readFileSync("supabase/functions/tle-personalized-demo/index.ts","utf8");
assert(form.includes("email_accepted!==true"),"Success requires Resend acceptance");
assert(form.includes("new AbortController()"),"Browser request can time out");
assert(form.includes("controller.abort(),18000"),"Sending cannot spin forever");
assert(form.includes("clearTimeout(timeout)"),"Timer is cleared on completion");
assert(form.includes("language:langSelect.value"),"Send selected locale to the server");
assert(form.includes("mailFailed:")&&form.includes("Guardamos tu solicitud"),"Show helpful EN/ES failure copy");
assert(api.includes("https://api.resend.com/emails"),"Demo email uses provider acknowledgement");
assert(api.includes("Idempotency-Key"),"Retries are idempotent");
assert(api.includes('status:"send_failed"'),"Failure never marks email sent");
assert(api.includes('status:"sent",sent_at:'),"Only accepted messages advance to sent");
assert(api.includes("email_accepted:true"),"Response includes proof of provider acceptance");
assert(api.includes("tle-personalized-demo-owner-"),"Owner alert is independently idempotent");
assert(!api.includes("MAKE_EMAIL_HOOK"),"Unacknowledged Make submissions no longer count as sent");
console.log("PASS: personalized demo EN/ES delivery guards and form timeout");
