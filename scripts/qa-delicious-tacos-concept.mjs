import assert from "node:assert/strict";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Script } from "node:vm";

const root = join(process.cwd(), "public", "demos", "delicious-tacos");
const html = readFileSync(join(root, "index.html"), "utf8");
assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
assert.match(html, /not affiliated with or operated by Delicious Tacos/i);
assert.match(html, /1950 S Federal Hwy/);
assert.match(html, /tel:\+15617816080/);
assert.match(html, /href="https:\/\/www\.google\.com\/maps\/search\//);
assert.match(html, /const dictionary\s*=\s*\{[\s\S]*?en:[\s\S]*?es:/);
assert.match(html, /@media\(max-width:760px\)/);
assert.match(html, /prefers-reduced-motion/);
assert.doesNotMatch(html, /<form\b|href="[^"]*(?:checkout|stripe|squareup|doordash)/i);
const matches = [...html.matchAll(/src="\.\/media\/([^"]+\.svg)"/g)].map(x => x[1]);
assert.equal(matches.length, 8);
assert.equal(new Set(matches).size, matches.length);
for (const file of matches) {
  const p = join(root, "media", file);
  assert.ok(existsSync(p), "Missing " + file);
  assert.match(readFileSync(p, "utf8"), /<svg\b[\s\S]*<\/svg>\s*$/i);
}
const inlineJs = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x => x[1]).join("\n");
new Script(inlineJs, { filename: "delicious-tacos-inline.js" });
console.log("PASS static QA: isolated concept, phone, 8 original images, script syntax, EN/ES and no checkout");

if (!process.env.QA_URL) process.exit(0);
const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless:true });
const sizes = [375, 390, 820, 1440];
try {
  for (const width of sizes) {
    const context = await browser.newContext({ viewport:{width, height: width < 600 ? 812 : 900}, reducedMotion:"reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(String(e)));
    const response = await page.goto(new URL("/demos/delicious-tacos/", process.env.QA_URL).href, { waitUntil:"domcontentloaded", timeout:30000 });
    assert.equal(response.status(), 200);
    assert.equal(await page.locator(".dish").count(), 6);
    await page.locator("img").evaluateAll(images => images.forEach(img => { img.loading = "eager" }));
    await page.waitForFunction(() => [...document.querySelectorAll('img')].every(x => x.complete && x.naturalWidth > 0), null, { timeout:15000 }).catch(async err => { const state = await page.locator("img").evaluateAll(images => images.map(img => ({src:img.getAttribute("src"), complete:img.complete, width:img.naturalWidth}))); throw new Error("Image load verification failed: " + JSON.stringify(state) + " / " + err.message) });
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(pageWidth <= width + 1, "Horizontal overflow " + width + "px, content " + pageWidth);
    await page.locator('.filter[data-kind="tacos"]').click();
    assert.equal(await page.locator(".dish:visible").count(), 3);
    await page.locator('.filter[data-kind="more"]').click();
    assert.equal(await page.locator(".dish:visible").count(), 3);
    await page.locator('.filter[data-kind="all"]').click();
    assert.equal(await page.locator(".dish:visible").count(), 6);
    await page.locator("#language").click();
    assert.equal(await page.locator("html").getAttribute("lang"), "es");
    assert.equal(await page.locator('[data-i18n="menuTitle"]').innerText(), "Lo bueno.");
    if (width <= 390) {
      await page.locator("#menuToggle").click();
      assert.equal(await page.locator("#menuToggle").getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#menuToggle").getAttribute("aria-expanded"), "false");
    }
    assert.deepEqual(errors, []);
    mkdirSync("qa-screenshots/delicious-tacos", { recursive: true });
    if ([375,820,1440].includes(width)) {
      await page.locator("#language").click();
      await page.screenshot({ path:"qa-screenshots/delicious-tacos/" + width + ".png", fullPage:true, animations:"disabled" });
    }
    await context.close();
  }
} finally { await browser.close() }
console.log("PASS Chromium QA at 375, 390, 820, 1440 widths");
