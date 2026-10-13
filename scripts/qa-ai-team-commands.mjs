import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const jessie=readFileSync("public/command-center/assets/jessy-owner.js","utf8");
const ui=readFileSync("public/command-center/assets/ai-team.js","utf8");
const first=jessie.indexOf("function aiTeamCommand(");
const last=jessie.indexOf("function aiTeamIntent(",first);
assert(first>=0 && last>first);
const snippet=jessie.slice(first,last)+";aiTeamCommand;";
const parse=vm.runInNewContext(snippet,{
 window:{TLEAIOpsGateway:{ready:()=>true}},
 activeContext:()=>({section:"ai-team"})
});
assert.deepEqual(JSON.parse(JSON.stringify(parse("Jessie, crea una tarea para QA revisar los enlaces del demo"))),{kind:"create",agent:"qa"});
assert.deepEqual(JSON.parse(JSON.stringify(parse("Jessie, prepara un borrador de email para mis leads"))),{kind:"draft",agent:"sales"});
assert.equal(parse("Jessie, publica un post ahora"),null);
assert.equal(parse("Jessie, envía un email a mis clientes"),null);
const bad=vm.runInNewContext(snippet,{
 window:{TLEAIOpsGateway:{ready:()=>false}},
 activeContext:()=>({section:"ai-team"})
});
assert.equal(bad("Jessie, prepara un borrador de email para mis leads"),null);
const nonowner=vm.runInNewContext(snippet,{
 window:{TLEAIOpsGateway:{ready:()=>true}},
 activeContext:()=>({section:"buyer-preview"})
});
assert.equal(nonowner("Jessie, crea una tarea para QA revisar los enlaces del demo"),null);
assert.match(ui,/async create\(agentKey,description\)/);
assert.match(ui,/async draft\(agentKey,description\)/);
assert.match(ui,/action:"compose_output"/);
assert.match(ui,/action:"create"/);
assert.doesNotMatch(ui,/action:"send_email"|action:"publish"/);
console.log("PASS Jessie QA task + sales draft commands; owner-only and no auto-send");
