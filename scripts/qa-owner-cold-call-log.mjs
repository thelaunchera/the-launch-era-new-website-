import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {Script, createContext} from 'node:vm';

const html=readFileSync('public/command-center/index.html','utf8');
const app=readFileSync('public/command-center/assets/command-center-app.js','utf8');

const panelStart=html.indexOf('<section id="ownerColdCallGuide"');
const notesStart=html.indexOf('<details class="lead-section" id="leadNotesSection"');
const notesEnd=html.indexOf('</details>',notesStart);
assert.ok(panelStart>notesStart&&panelStart<notesEnd,'call guide must stay inside the existing Notes section');
assert.match(html.slice(panelStart,notesEnd),/class="consent-panel hidden"/,'guide must be hidden by default');
assert.ok(html.slice(panelStart,notesEnd).includes('<button type="button" id="ownerCallLogAdd"'),'log template action must not submit the lead form');

const internalGate="$('ownerColdCallGuide').classList.toggle('hidden',!workspace?.is_internal)";
assert.ok(app.includes(internalGate),'editor must show the helper only for internal owner workspace');
assert.ok(app.includes("if(!workspace?.is_internal)return;\n const field=$('leadForm').elements.notes;"),'log action must fail closed outside internal owner workspace');
assert.ok(app.includes("$('leadNotesSection').open=true;showLeadTab('notes')"),'inserting a log must lead the owner to the Notes field');
assert.ok(app.includes('ownerDailyLabel(values[0],values[1])'),'guide labels must follow English/Spanish preference');
assert.ok(app.includes('Exact scope they agreed to: [fill in]')&&app.includes('Alcance exacto que autorizó: [completar]'),'both templates must capture the specific permission scope');
assert.ok(app.includes('Next follow-up date: [fill in]')&&app.includes('Fecha del próximo seguimiento: [completar]'),'both templates must support next-action scheduling');
assert.ok(app.includes('a publicly listed phone number alone is not permission')&&app.includes('que el número esté publicado no es permiso por sí solo'),'guide must not equate public phone listings with SMS consent');

const start=app.indexOf('function ownerColdCallEntryTemplate(){');
const end=app.indexOf('\nfunction ownerDailyDate(){',start);
assert.ok(start>=0&&end>start,'call log template function must exist');
const ctx=createContext({ownerDailyEs:()=>false,Intl,Date});
const generated=new Script(`(${app.slice(start,end)}).call(null)`).runInContext(ctx);
assert.match(generated,/CALL LOG/);
assert.match(generated,/Entry created:/);
assert.match(generated,/Did they agree to receive the demo link by text when it is ready\? \[Yes \/ No \/ Not asked\]/);
assert.doesNotMatch(generated,/\[Yes\]/,'permission must not default to Yes');
ctx.ownerDailyEs=()=>true;
const generatedEs=new Script(`(${app.slice(start,end)}).call(null)`).runInContext(ctx);
assert.match(generatedEs,/REGISTRO DE LLAMADA/);
assert.match(generatedEs,/\[Sí \/ No \/ No se preguntó\]/);

const handlerStart=app.indexOf("$('ownerCallLogAdd').onclick=()=>{");
const handlerEnd=app.indexOf("$('remove').onclick=async()=>",handlerStart);
assert.ok(handlerStart>=0&&handlerEnd>handlerStart,'template insertion handler must exist');
const handler=app.slice(handlerStart,handlerEnd);
assert.ok(handler.includes('field.value=updated'),'handler should append to the existing notes field');
assert.ok(handler.includes('field.maxLength'),'handler must enforce the existing notes limit');
assert.doesNotMatch(handler,/db\.from|fetch\(|sendFollowup|sendSms|sendText/i,'helper must not create backend writes or send communications');

console.log('PASS owner-only bilingual cold-call consent log static guard');
