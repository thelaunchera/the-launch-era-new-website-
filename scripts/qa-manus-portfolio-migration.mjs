/**
 * Static QA for the migrated Manus portfolio. Run:
 * node scripts/qa-manus-portfolio-migration.mjs
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

const repo = fileURLToPath(new URL("../", import.meta.url));
const site = join(repo, "public/portfolio");
const read = (name) => readFileSync(join(site, name), "utf8");
const html = read("index.html");
const css = read("styles.css");
const js = read("site.js");
const files = [
  "index.html", "styles.css", "site.js", "favicon.svg",
  "assets/dailin-portrait.webp",
  "assets/website-demo-freska.webp",
  "assets/website-demo-crumb.webp",
  "assets/website-demo-soluna.webp",
  "assets/cb-depot-hero.webp",
  "assets/podcast-episode.webp",
  ...[400, 500, 600, 700].map(n => "assets/dm-sans-latin-" + n + "-normal.woff2"),
];
for (const f of files) {
  const p = join(site, f);
  assert(existsSync(p) && statSync(p).size > 0, "Missing or empty: " + f);
  if (f.endsWith(".webp")) {
    const b = readFileSync(p);
    assert.equal(b.toString("ascii", 0, 4), "RIFF", "Broken WebP RIFF: " + f);
    assert.equal(b.toString("ascii", 8, 12), "WEBP", "Broken WebP header: " + f);
    assert.equal(b.readUInt32LE(4) + 8, b.length, "Truncated WebP: " + f);
  }
  if (f.endsWith(".woff2")) {
    assert.equal(readFileSync(p).toString("ascii", 0, 4), "wOF2", "Broken WOFF2: " + f);
  }
}
assert.match(html, /<html lang="es">/);
assert.match(html, /<link rel="canonical" href="https:\/\/thelaunchera\.com\/portfolio\/">/);
assert.match(html, /<meta property="og:url" content="https:\/\/thelaunchera\.com\/portfolio\/">/);
assert.match(html, /href="\/portfolio\/styles\.css"/);
assert.match(html, /src="\/portfolio\/site\.js"/);
assert.match(html, /src="\/portfolio\/assets\/dailin-portrait\.webp"/);
assert.match(css, /@media/);
assert.match(css, /transition:/);
assert.match(js, /IntersectionObserver/);
assert.match(js, /menuButton\.addEventListener\('click'/);
const scopedText = html.replaceAll("/portfolio/assets/", "") + "\n" +
  css.replaceAll("/portfolio/assets/", "");
assert(!/manuscdn\.com|manus-web-edit-runtime|\/assets\//.test(scopedText),
  "Manus runtime or unscoped asset URLs found");
const resources = new Set();
for (const m of html.matchAll(/(?:src|href)="(\/portfolio\/[^"]+)"/g)) resources.add(m[1]);
for (const m of css.matchAll(/url\(['"]?(\/portfolio\/[^)'"]+)/g)) resources.add(m[1]);
for (const url of resources) {
  const path = join(repo, "public", url.replace(/^\/+/, ""));
  assert(existsSync(path), "Missing scoped resource: " + url);
}
const syntax = spawnSync(process.execPath, ["--check", join(site, "site.js")], { encoding: "utf8" });
assert.equal(syntax.status, 0, syntax.stderr || "Invalid JavaScript syntax");
console.log("PASS Manus portfolio: " + files.length + " local files; " +
  resources.size + " scoped dependencies; SEO, animation and syntax checks");
