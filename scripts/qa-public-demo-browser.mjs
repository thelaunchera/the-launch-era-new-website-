/**
 * Run after dependencies install: execute public demo inline scripts in JSDOM.
 * Asserts the page actually renders content, not a blank sample workspace.
 * All data/actions are local and synthetic. No network or customer authentication.
 */
import {readFileSync} from 'node:fs';
import {JSDOM,VirtualConsole} from 'jsdom';
const source=readFileSync('public/cleaning-app-demo/index.html','utf8');
const errors=[];
const vc=new VirtualConsole();
vc.on('jsdomError',err=>errors.push('Browser script error: '+err.message));
const dom=new JSDOM(source,{
  url:'https://thelaunchera.com/cleaning-app-demo/?lang=en',
  runScripts:'dangerously',
  virtualConsole:vc
});
const doc=dom.window.document;
const fail=msg=>errors.push(msg);
const nav=doc.querySelector('#nav');
const app=doc.querySelector('#app');
if(!nav||!app)fail('Navigation or workspace missing');
else {
 const buttons=nav.querySelectorAll('[data-tab]');
 if(buttons.length<6)fail('Demo tabs did not render');
 if(!app.textContent?.includes('Good morning'))fail('Overview is blank or demo script failed');
 if(app.textContent?.trim().length<150)fail('Workspace is unexpectedly empty');
 const c=nav.querySelector('[data-tab="3"]');
 if(c){c.click();if(!app.textContent?.includes('Sarah Mitchell'))fail('Clients tab failed to render synthetic client');}
 const es=doc.getElementById('es');
 if(es){es.click();if(!app.textContent?.includes('Tus clientes'))fail('Spanish client tab did not render');}
}
const clone=doc.body.cloneNode(true);
clone.querySelectorAll('script,style').forEach(n=>n.remove());
const bodyText=clone.textContent||'';
if(/(?:screens\.push\s*\(|function render\s*\(|document\.getElementById\s*\()/i.test(bodyText)){
 fail('Raw JavaScript appears as visible body text');
}
dom.window.close();
if(errors.length){console.error('[PUBLIC DEMO BROWSER QA FAILED]\n'+errors.join('\n'));process.exitCode=1}
else console.log('[PUBLIC DEMO BROWSER QA PASSED] EN/ES sample workspace, tabs, client data and visible content.');
