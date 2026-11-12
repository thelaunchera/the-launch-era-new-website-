#!/usr/bin/env node
/* Static, count-independent guard: every public portfolio demo with an index must have the header enhancer. */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import vm from "node:vm";
const root = path.resolve("public/demos");
const enhancer = fs.readFileSync("public/assets/tle-demo-header-controls-20261112.js","utf8");
new vm.Script(enhancer,{filename:"tle-demo-header-controls-20261112.js"});
const entries = fs.readdirSync(root,{withFileTypes:true}).filter(entry => entry.isDirectory());
let checked = 0;
for(const {name} of entries){
  const file=path.join(root,name,"index.html");
  if(!fs.existsSync(file))continue;
  const html=fs.readFileSync(file,"utf8");
  if(!/<header\b/i.test(html) && /http-equiv=["']refresh/i.test(html))continue;
  if(["owner-center","photo-gallery","offcourt","umbral","angela-so-fresh-clean-queen","claudia"].includes(name))continue;
  assert.match(html,new RegExp('data-tle-demo-brand="'+name+'"[^>]+tle-demo-header-controls-20261112[.]js'),name+" missing header controls");
  checked++;
}
assert.ok(checked>0,"No demo entries found");
console.log("Demo header enhancer static check: "+checked+" brand demos wired.");
