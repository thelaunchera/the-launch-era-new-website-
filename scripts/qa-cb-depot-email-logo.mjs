import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';

// Render the real mail shell without invoking the queue or an email provider.
const source=readFileSync('supabase/functions/tle-service-care-worker/index.ts','utf8');
const js=stripTypeScriptTypes(source,{mode:'strip'}).replace(/^import[^\n]*\n/gm,'');
const context=vm.createContext({Deno:{serve(){}},TextEncoder});
vm.runInContext(js,context);
const logo='https://raw.githubusercontent.com/thelaunchera/the-launch-era-new-website-/main/public/assets/clients/cb-depot/panda-original-mark.svg';
const body='<h1 style="margin:0 0 13px;font-size:23px;color:#191919">Hi Alex,</h1><p>Just a friendly reminder that your appointment is tomorrow. We look forward to seeing you!</p><p style="padding:13px 15px;background:#f3f8fb;border-radius:12px;color:#456275;font-size:13px">Appointment: Interior Detailing · Tomorrow at 11:00 AM</p>';
const render=(name,url=logo)=>context.makeShell(name,url,'#07111C','#087DFF',body,'Fixture reminder','');
const cb=render('CB Depot');
assert(cb.html.includes('bgcolor="#07111C"'));
assert(cb.html.includes('background-image:linear-gradient(#07111C,#07111C)'));
assert(cb.html.includes('alt="CB Depot logo" width="64" height="50"'));
assert(cb.html.includes(logo));
assert.equal(cb.text,'Fixture reminder');
assert.equal((cb.html.match(/<img /g)||[]).length,1);
const other=render('Fixture Cleaning','https://example.com/own-logo.png');
assert(!other.html.includes('CB Depot'));
assert(!other.html.includes('linear-gradient'));
assert(other.html.includes('width="48" height="48"'));
assert(!render('CB Depot','').html.includes('<img'));
assert(render('  cb depot  ').html.includes('bgcolor="#07111C"'));
assert(render('<CB Depot>').html.includes('&lt;CB Depot&gt;'));

if(process.argv[2]){
 const directory=process.argv[2];mkdirSync(directory,{recursive:true});
 const svg=readFileSync('public/assets/clients/cb-depot/panda-original-mark.svg','utf8');
 const local=cb.html.replace(logo,'data:image/svg+xml,'+encodeURIComponent(svg));
 // Synthetic Gmail-style colors reproduce the screenshot's pale header.
 // This is visual regression QA, not a claim of a real Gmail/iPhone test.
 const dark=local.replace('background:#FAF8F3','background:#131313').replace('background:white','background:#202124').replace('background:#07111C;','background:#ebf3ff;').replace('font-weight:800;color:#ffffff','font-weight:800;color:#191919').replaceAll('color:#191919','color:#e8eaed').replace('font-weight:800;color:#e8eaed','font-weight:800;color:#191919').replace('background:#f3f8fb','background:#232829').replace('color:#456275','color:#a0c1d4');
 const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
 const frames=[360,390,820,1024,1440].flatMap(width=>[['Light',local],['Dark simulation',dark]].map(([mode,html])=>'<section><p>'+width+'px — '+mode+'</p><iframe title="'+width+' '+mode+'" width="'+width+'" height="600" srcdoc="'+esc(html)+'"></iframe></section>')).join('');
 writeFileSync(directory+'/index.html','<!doctype html><title>CB Depot email logo QA</title><style>body{background:#ddd;font:14px Arial}section{display:inline-block;vertical-align:top;margin:12px}iframe{border:0;display:block}</style>'+frames);
}
console.log('PASS: original panda retained, larger dark tile, other tenant output unchanged, no queue or provider invoked');
