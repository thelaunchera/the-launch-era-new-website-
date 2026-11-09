/** The standalone Cleaning App demo is retired, not an available sign-up path. */
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const page=readFileSync('public/cleaning-app-demo/index.html','utf8');
assert.match(page,/<!doctype html>/i);
assert.match(page,/<meta name="robots" content="noindex,nofollow">/);
assert.match(page,/location\.replace\(lang==='es'\?'\/es\/website-for-your-business\/'\:'\/website-for-your-business\/'\)/);
assert(!/entry=signup|Start my 30-day trial|Get 30 days free|id="trial"/i.test(page),'Retired demo may not sell or register');
for(const script of page.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(script[1]);
console.log('[PUBLIC DEMO QA PASSED] Retired app demo redirects to live website offers in both languages without signup or payment.');
