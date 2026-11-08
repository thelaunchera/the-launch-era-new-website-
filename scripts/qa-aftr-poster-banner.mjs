import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium, webkit } from "playwright";

const base = process.env.QA_URL || "http://127.0.0.1:4191";
const out = path.join("qa-screenshots", "aftr-banner");
fs.mkdirSync(out, { recursive: true });

for (const browserType of [chromium, webkit]) {
  const browser = await browserType.launch({ headless: true });
  try {
    for (const width of [360, 390, 768, 1024, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 850 }, deviceScaleFactor: 1 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "/demos/aftr/", { waitUntil: "load" });
      const result = await page.evaluate(async () => {
        const banner = document.querySelector(".ticker.ticker-poster-banner");
        if (!banner) return { missing: true };
        const pseudo = getComputedStyle(banner, "::before");
        const box = banner.getBoundingClientRect();
        const src = new URL("assets/aftr-approved-las-vegas-banner-20261031.webp", location.href).href;
        const photo = new Image();
        photo.src = src;
        await photo.decode();
        return {
          bannerWidth: box.width,
          bannerHeight: box.height,
          layerWidth: parseFloat(pseudo.width),
          tile: parseFloat(pseudo.width) - box.width,
          tileCss: getComputedStyle(banner).getPropertyValue("--aftr-poster-tile"),
          naturalWidth: photo.naturalWidth,
          naturalHeight: photo.naturalHeight,
          background: pseudo.backgroundImage,
          repeat: pseudo.backgroundRepeat,
          animation: pseudo.animationName,
          overflow: getComputedStyle(banner).overflowX,
        };
      });
      assert.equal(result.missing, undefined, "AFTR banner missing");
      assert.ok(result.naturalWidth && result.naturalHeight, "Approved poster failed to load");
      const actualTile = result.naturalWidth * result.bannerHeight / result.naturalHeight;
      console.log("AFTR banner measurements", browserType.name(), width, JSON.stringify(result), "sourceTile", actualTile);
      assert.ok(Math.abs(result.tile - actualTile) < 1, "Poster tile must match actual source ratio");
      assert.ok(result.layerWidth + 1 >= result.bannerWidth + result.tile,
        "Banner layer too narrow: would reveal empty violet space");
      assert.equal(result.repeat, "repeat-x", "Banner needs uninterrupted tiling");
      assert.ok(result.background.includes("aftr-approved-las-vegas-banner-20261031.webp"), "Wrong visual asset");
      assert.equal(result.animation, "aftr-poster-slide", "Banner animation missing");
      assert.equal(result.overflow, "hidden");
      // Snapshot halfway through the animation, where the old finite pair left a gap on desktop.
      await page.addStyleTag({ content: ".ticker.ticker-poster-banner::before{animation-delay:-15s!important}" });
      await page.locator(".ticker.ticker-poster-banner").screenshot({
        path: path.join(out, browserType.name() + "-" + width + ".png"),
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await page.locator(".ticker.ticker-poster-banner").evaluate((e) =>
        getComputedStyle(e, "::before").animationName), "none", "Reduced-motion banner must be static");
      assert.deepEqual(errors, [], "Uncaught JavaScript error");
      console.log(browserType.name(), width, "AFTR poster fills width, repeats seamlessly and respects reduced motion");
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
