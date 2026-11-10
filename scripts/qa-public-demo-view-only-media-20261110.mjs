/**
 * Public demos: show photography, never provide a direct download action.
 * Deliberately excludes private Studio, Content Lab and owner file exports.
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const extraPublic=['public/booking-demo','public/cleaning-app-demo','public/experience-cleaning','public/sample-cleaning','public/portfolio'];
const roots = ['public/demos', 'demo-source', ...extraPublic];
const files = [];
function walk(root) {
  if (!existsSync(root)) return;
  for (const e of readdirSync(root, { withFileTypes:true })) {
    const path=join(root,e.name);
    if (e.isDirectory()) walk(path);
    else if (e.isFile() && /\.(?:html|js|jsx|ts|tsx)$/.test(e.name)) files.push(path);
  }
}
roots.forEach(walk);
assert.ok(files.length >= 55, 'Expected all demo source and published pages');
const publicPages=files.filter(p=>p.startsWith('public/demos/')&&p.endsWith('/index.html'));
const sourcePages=files.filter(p=>p.startsWith('demo-source/')&&p.endsWith('/index.html'));
assert.ok(publicPages.length >= 19, 'Expected all public demo index pages');
assert.ok(sourcePages.length >= 4, 'Expected all editable demo entry points');
const standalonePages=extraPublic.map(path=>join(path,'index.html'));
for(const path of standalonePages) assert.ok(files.includes(path),'Missing standalone public demo '+path);
const guard='/assets/tle-demo-view-only-media-20261110.js';
const banned=[
  /<a\b[^>]*\bdownload(?:\s|=|>)/i,
  /(?:Download original PNG|Descargar PNG original|download its individual PNG|descargar su PNG individual)/i,
  /\.download\s*=\s*[^=]/i,
  /\bdownload\s*:\s*['"](?:Download|Descargar)[^'"]*(?:PNG|photo|foto|image|imagen)/i
];
for (const f of files) {
  const code=readFileSync(f,'utf8');
  for (const pattern of banned) assert.doesNotMatch(code,pattern,'Public media export found in '+f);
}
for (const f of [...publicPages,...standalonePages,...sourcePages]) {
  const code=readFileSync(f,'utf8');
  assert.equal(code.split(guard).length-1,1,'Missing/duplicate public view-only guard: '+f);
}
const sovaSource=readFileSync('demo-source/sova/src/site.js','utf8');
const sovaPublished=readFileSync('public/demos/sova/assets/index-C3ToK82y.js','utf8');
for (const [path,code] of [['source',sovaSource],['published',sovaPublished]]) {
  assert.match(code,/photo-navigation/,path+' must retain navigation');
  assert.match(code,/data-previous/,path+' must retain Previous');
  assert.match(code,/data-next/,path+' must retain Next');
  assert.doesNotMatch(code,/download\s*=|download\s*:/i,path+' must never link raw PNG');
}
const viewOnly=readFileSync('public/assets/tle-demo-view-only-media-20261110.js','utf8');
assert.match(viewOnly,/location\.pathname\.startsWith\('\/demos\/'\)/,'guard scoped to public demos');
assert.match(viewOnly,/dragstart/);
assert.match(viewOnly,/contextmenu/);
assert.doesNotMatch(viewOnly,/(?:preventDefault\(\)).*?(?:click|touchstart)/,'never block standard photo taps');
console.log('PUBLIC PHOTO VIEW-ONLY PASS:',publicPages.length,'library demos,',standalonePages.length,'standalone public experiences,',sourcePages.length,'editable demos; no download controls');
