// QA for the original, now self-hosted Manus founder portfolio (not the previous mini-card template).
import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { readFileSync } from 'node:fs';

const html = readFileSync('public/portfolio/index.html', 'utf8');
const ids = [...html.matchAll(/<article class="[^"]*project-card[^"]*" id="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, 4, 'Four distinct case studies from Manus are retained');
assert.equal(new Set(ids).size, 4, 'Unique case-study ids');
assert.match(html, /href="\/portfolio\/styles\.css"/);
assert.match(html, /src="\/portfolio\/site\.js"/);
assert.doesNotMatch(html, /manuscdn\.com|manus-web-edit-runtime/);
const root = (process.env.QA_URL || 'http://127.0.0.1:4198').replace(/\/$/, '');

for (const type of [chromium, webkit]) {
  const browser = await type.launch({ headless: true });
  try {
    for (const [width, motion] of [[375, 'no-preference'], [390, 'reduce'], [1280, 'no-preference']]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: motion });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const response = await page.goto(root + '/portfolio/', { waitUntil: 'domcontentloaded' });
      assert.equal(response?.status(), 200, 'Portfolio route resolves');
      assert.equal(await page.locator('.project-card').count(), 4, 'All four case studies rendered');
      assert.deepEqual(await page.locator('.project-card').evaluateAll(els => els.map(e => e.id)), ids);
      assert.ok(await page.locator('.hero h1').isVisible(), 'Original hero is visible');
      assert.equal(await page.locator('details').count(), 3, 'Three case study disclosures remain');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 3, 'No horizontal overflow at ' + width + ': ' + overflow);

      if (width < 700) {
        const toggle = page.locator('.menu-toggle');
        assert.ok(await toggle.isVisible(), 'Mobile menu button exists');
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'Menu opens');
        await page.locator('#primary-nav a[href="#projects"]').click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Menu closes on navigation');
      } else {
        assert.ok(await page.locator('#primary-nav a[href="#projects"]').isVisible());
      }

      const first = page.locator('details').first();
      await first.locator('summary').scrollIntoViewIfNeeded();
      await first.locator('summary').click();
      assert.equal(await first.evaluate(el => el.open), true, 'Case study opens');
      await first.locator('summary').press('Enter');
      assert.equal(await first.evaluate(el => el.open), false, 'Keyboard closes case study');
      await page.locator('main img').evaluateAll(imgs => imgs.forEach(i => { i.loading = 'eager'; }));
      await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0), null, { timeout: 12000 });
      assert.deepEqual(errors, [], 'No browser JavaScript errors');
      console.log('PORTFOLIO INTERACTION PASS', type.name(), width, motion, 'four distinct case studies');
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
