import {readFileSync,existsSync} from "node:fs";
import {resolve} from "node:path";
import assert from "node:assert/strict";
const root=process.cwd();
const en=readFileSync(resolve(root,"public/guias/index.html"),"utf8");
const es=readFileSync(resolve(root,"public/es/guias/index.html"),"utf8");
const js=readFileSync(resolve(root,"public/guias/app.js"),"utf8");
const css=readFileSync(resolve(root,"public/guias/styles.css"),"utf8");
for (const [lang,html,route] of [["en",en,"/guias/"],["es",es,"/es/guias/"]]) {
  assert.match(html,new RegExp('<html lang="'+lang+'">'));
  assert.ok(html.includes('rel="canonical" href="https://thelaunchera.com'+route+'"'),lang+" canonical");
  assert.ok(html.includes('href="/guias/"')&&html.includes('href="/es/guias/"'),lang+" language links");
  assert.ok(html.includes('href="/guias/styles.css"')&&html.includes('src="/guias/app.js"'),lang+" shared assets");
  assert.ok(html.includes('href="mailto:hello@thelaunchera.com?subject='),lang+" verified contact");
  assert.ok(html.includes('id="guide-list"')&&html.includes('id="search"')&&html.includes('id="filters"'),lang+" controls");
  assert.ok(html.includes('href="/favicon-tle.svg"'),lang+" favicon");
  assert.ok(!/<form\b/i.test(html),"No fake backend forms");
  assert.ok(!/hero-avatar-concept|person-photo-placeholder/i.test(html),"No unapproved personal avatar");
}
assert.ok(existsSync(resolve(root,"public/favicon-tle.svg")),"Existing official favicon");
assert.match(js,/clipboard\.writeText/);assert.match(js,/aria-pressed/);assert.match(js,/Escape/);
assert.match(css,/@media\(max-width:800px\)/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
const ids=[...js.matchAll(/"id":"([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,10,"Exactly 10 original bilingual guides");
assert.equal(new Set(ids).size,10,"No duplicate guide IDs");
for(const field of ["en","es","steps","prompt","outcome","note"])assert.ok(js.includes('"'+field+'":'),"Missing "+field);
console.log("[TLE GUIDES] EN/ES routes, shared assets, SEO, contact, privacy and 10 unique resources: OK");
