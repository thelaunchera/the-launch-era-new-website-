#!/usr/bin/env node
// Safe, non-mutating guards for the private official Booking Demo release.
// The full example is intentionally NOT checked into the public website repository.
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../', import.meta.url);
const read=(p)=>readFileSync(new URL(p, root),'utf8');
const gateway=read('public/booking-demo-reset.html');
const form=read('public/booking-demo/index.html');
const doc=read('docs/official-cleaning-booking-demo.md');
assert.match(gateway,/tle-booking-demo-gate/,'private gate must remain in place');
assert.match(gateway,/action:"content"/,'protected server content fetch required');
assert.match(gateway,/access/,'signed invitation flow required');
assert.doesNotMatch(gateway,/Sample Cleaning Co\.|Brightside Cleaning Co\.|<div class="svcs"/,'public gate must not expose source');
assert.match(form,/tle-personalized-demo/,'request form must keep consent path');
assert.match(form,/acceptance_url/,'request form must send to AppDeploy consent');
assert.match(doc,/private-demos\/official-cleaning-booking\/index\.html/);
assert.match(doc,/No customer information is persisted/);
assert.ok(!existsSync(new URL('public/official-cleaning-booking-demo.html',root)), 'no static public raw demo copy');
console.log('Official booking demo shell, access gate, private-source and consent guards passed.');
