/**
 * The Launch Era — public demo / Owner Center contract.
 *
 * Static-only, no network and no changes to real business data.
 * Run from the repository root:
 *   node scripts/qa-owner-center-links.mjs
 *
 * This protects the handoff between existing portfolio demos and their
 * simulated Owner View, even while visual work continues in parallel.
 * Browser and deployed-URL checks remain separate release gates.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const gallery = readFileSync(join(root, 'public/demos/index.html'), 'utf8');
const owner = readFileSync(join(root, 'public/demos/owner-center/index.html'), 'utf8');

const cards = [...gallery.matchAll(/<article\b[^>]*data-brand="([^"]+)"[^>]*>[\s\S]*?<\/article>/g)];
assert.ok(cards.length >= 16, 'Expected existing portfolio demos; no cards may be lost');

const linked = new Map();
for (const [whole, slug] of cards) {
  const links = [...whole.matchAll(/class="owner-view"\s+href="([^"]+)"/g)]
    .map(match => match[1]);
  assert.ok(links.length <= 1, `Duplicate Owner View link on ${slug}`);
  if (!links.length) continue;
  const url = new URL(links[0], 'https://thelaunchera.com');
  assert.equal(url.pathname, '/demos/owner-center/', `Invalid Owner Center route for ${slug}`);
  assert.equal(url.searchParams.get('demo'), slug, `Wrong selected brand for ${slug}`);
  assert.equal(url.searchParams.size, 1, `Unexpected Owner View query arguments for ${slug}`);
  assert.ok(!linked.has(slug), `Duplicate branded demo card: ${slug}`);
  linked.set(slug, url);
}

const themes = [...owner.matchAll(/^\s*"([a-z0-9-]+)":\{name:/gm)].map(match => match[1]);
assert.ok(linked.size >= 13, 'The 13 original Owner View demos must remain available');
assert.equal(new Set(themes).size, themes.length, 'Duplicate Owner Center theme identifier');
assert.deepEqual([...linked.keys()].sort(), themes.sort(),
  'Demo Owner View links must match the Owner Center brand themes exactly');

assert.match(gallery, /function openInitialDemo\(\)/,
  'Library must restore the selected Customer View on deep link');
assert.match(gallery, /get\('demo'\)/,
  'Library must read the deep-linked selected demo');
assert.match(gallery, /ownerView\.href=ownerLink\.href/,
  'Modal must open Owner View for the current demo');
assert.match(owner, /id="back-preview"/,
  'Owner Center must have an explicit Back to Website Preview link');
assert.match(owner, /BASE\+"\?demo="\+encodeURIComponent\(current\)/,
  'Back from Owner Center must select the same Customer View');
assert.match(owner, /All information is simulated\./,
  'Owner View must clearly disclose simulated data');
assert.match(owner, /localStorage\.setItem\(/,
  'Any demo edits must stay local; this test does not claim cloud persistence');
assert.doesNotMatch(owner, /fetch\s*\(|XMLHttpRequest\s*\(/,
  'Owner Center cannot unexpectedly send demo edits to a live API');

console.log(`PASS: ${cards.length} portfolio demos; ${linked.size} Owner View links / themes; deep links, return paths and simulation guardrails checked.`);
