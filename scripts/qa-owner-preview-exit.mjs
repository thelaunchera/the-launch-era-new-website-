import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const dir='public/command-center/';
const main=readFileSync(dir+'index.html','utf8');
const css=readFileSync(dir+'assets/command-center.css','utf8');
const app=readFileSync(dir+'assets/command-center-app.js','utf8');
const sample=readFileSync(dir+'buyer-account-preview.html','utf8');

assert.match(main,/<meta name="viewport" content="width=device-width,initial-scale=1">/);
assert.match(main,/id="ownerPreviewClose" class="secondary hidden"/);
assert.match(main,/id="ownerEmbeddedPreviewFrame"/);
assert.match(main,/id="ownerFocusHub"/,'Owner home shortcuts remain visible');
assert.match(main,/id="ownerExtraTools"/,'Advanced owner controls remain accessible');
assert.match(css,/\.crm-owner-view \.owner-focus-grid/,'Owner iPhone layout stays responsive');
assert.match(main,/command-center\.css\?v=20261018-owner-simple-v1/);
assert.match(main,/command-center-app\.js\?v=20\d{6}-[a-z0-9-]+/);

const source=app.slice(app.indexOf('/* Owner previews: real shared markup'));
assert.match(source,/closeButton\.classList\.remove\('hidden'\)/,'Inline owner preview always exposes exit');
assert.match(source,/closeButton\.onclick=close/,'Exit control must be functional');
assert.match(source,/shell\.classList\.add\('hidden'\)/,'Exit closes inline preview');
assert.match(source,/frame\.removeAttribute\('srcdoc'\)/,'Exit discards sample iframe');
assert.match(source,/current=''/,'Exit clears preview state');
assert.match(source,/owner-embedded-preview-expanded/,'Exit unlocks scroll');
assert.match(source,/if\(e\.key==='Escape'&&current\)close\(\)/,'Escape closes owner overlay');
assert.match(source,/event\.source!==frame\.contentWindow/,'Only current preview may request exit');

assert.match(css,/#ownerTwoPreviews\.is-expanded \.owner-preview-controls/,'Controls stay visible in full screen');
assert.match(css,/#ownerPreviewClose:not\(\.hidden\)/,'Exit button styled for contrast');
assert.match(css,/#auth\.auth-shell\{max-width:calc\(100vw - 24px\)/,'Login shell fits small screens');
assert.match(css,/-webkit-text-size-adjust:100%/,'iPhone viewport will not enlarge body text');
assert.match(css,/#ownerPagesHub\{overflow-wrap:anywhere\}/,'Clients & Purchases copy wraps');
assert.match(css,/#ownerTwoPreviews\.is-expanded\{/,'No full-screen clipping regression');

assert.match(sample,/<meta name="viewport" content="width=device-width,initial-scale=1">/);
assert.match(sample,/id="previewExitBar"/);
assert.match(sample,/id="previewExitMobile"[^>]*>← Exit demo/);
assert.match(sample,/href="\/command-center\/\?from=buyer-demo-exit"/);
assert.match(sample,/#previewExitBar\{display:flex;align-items:center;justify-content:space-between;gap:9px;position:sticky/);
assert.match(sample,/position:sticky;top:0;z-index:10/);
assert.match(sample,/if\(window\.parent!==window\)/,'Embedded demo can notify parent');
assert.match(sample,/window\.parent\.postMessage\(\{type:"tle-owner-preview-exit"\}/,'Embedded exit closes parent');
assert.match(sample,/lang==="es"\?"← Salir de la demo":"← Exit demo"/);
assert.match(sample,/created_by",user\.id/,'Demo remains owner restricted');
assert.doesNotMatch(sample,/const samples=\[\{name:".*?@aol\.com"/,'No customer mailbox fixtures');
const moduleCode=sample.split('<script type="module">')[1]?.split('</script>')[0];
assert.ok(moduleCode,'Standalone preview script exists');
new Script(moduleCode.replace(/^import .*?;\s*$/mg,''),{filename:'buyer-account-preview inline module'});
console.log('PASS — mobile owner demo exits are visible, return safely, preserve tenant isolation and fit narrow viewports');
