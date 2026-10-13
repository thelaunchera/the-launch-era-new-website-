/**
 * Guard public sample Cleaning App against code leaking into the HTML page.
 * Usage: node scripts/qa-public-demo-integrity.mjs
 * Fails the deploy if JavaScript appears after </html>, inline JS is malformed,
 * or the interactive sample UI's essential hooks disappear.
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const path = 'public/cleaning-app-demo/index.html';
const html = readFileSync(path, 'utf8');
const faults = [];
function assert(condition, msg) { if (!condition) faults.push(msg); }
const count = regex => Array.from(html.matchAll(regex)).length;
assert(/^\s*<!doctype html>/i.test(html), 'Missing HTML doctype');
assert(count(/<\/html\s*>/gi) === 1, 'Unexpected duplicate or missing closing HTML');
assert(/<\/html\s*>\s*$/i.test(html), 'Extra content after </html> (likely raw JavaScript exposed publicly)');
assert(count(/<script\b/gi) === count(/<\/script\s*>/gi), 'Mismatched <script> / </script> tags');
const scripts = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi));
for (const [i, script] of scripts.entries()) {
  if (/\bsrc\s*=/.test(script[1])) continue;
  try { new vm.Script(script[2], { filename: path + ':inline-' + i }); }
  catch (error) { faults.push('Malformed inline JavaScript #' + i + ': ' + error.message); }
}
assert(html.includes('id="nav"') && html.includes('id="app"'), 'Sample navigation / workspace missing');
assert(html.includes('const screens=[overview,calendar,jobs,clients,quotes,invoices]'), 'Sample screens missing');
assert(html.includes('render();'), 'Sample render invocation missing');
assert(html.includes('SAMPLE WORKSPACE') && html.includes('No real client records'), 'Safe demo disclaimer missing');

// The public demo uses invented clients in Miami and nearby cities, not owner-local Palm Beach data.
// Guard all dynamic views (Clients, Routes, Requests) against leaking legacy sample locations.
const populatedJs = readFileSync('public/assets/cleaning-demo-populated.js', 'utf8');
try { new vm.Script(populatedJs, { filename:'public/assets/cleaning-demo-populated.js' }); }
catch(error){faults.push('Invalid dynamic sample fixture: '+error.message);}
const expectedLocations = ['Miami','Coral Gables','Doral','Kendall','Hialeah','Miami Beach','North Miami','Aventura','Cutler Bay','Miami Gardens'];
for(const city of expectedLocations) assert(populatedJs.includes('"'+city+'"'),'Missing Miami sample city '+city);
const forbiddenPlaces = /West Palm Beach|Palm Beach|Boynton Beach|Lake Worth|Delray Beach|Wellington|Florida|Service areas|Service area|Zona de servicio|\barea\b/i;
assert(!forbiddenPlaces.test(populatedJs),'Legacy Palm Beach, Florida or area wording leaked into populated sample');
assert(!/location:"Service area"|location:"Zona de servicio"/.test(html),'Old service-area labels remain in base demo');
assert(html.includes('cleaning-demo-populated.js?v=20261013-miami-1'),'Demo not loading refreshed sample fixture');
assert(populatedJs.includes('c.location')&&populatedJs.includes('locations[clients.findIndex'),'Clients and booking requests must share Miami locations');
assert(!/<script\s+src="\/assets\/jessy-site\.js/.test(html),'Repeated Jessy must not appear inside sample iframe');

if (faults.length) {
 console.error('[PUBLIC DEMO QA BLOCKED]\n' + faults.join('\n'));
 process.exitCode = 1;
} else {
 console.log('[PUBLIC DEMO QA PASSED] Inline JavaScript parses, markup is intact, sample UI hooks present.');
}
