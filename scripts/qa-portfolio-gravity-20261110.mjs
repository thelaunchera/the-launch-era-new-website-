// Replacement regression for the Manus portfolio's own scroll reveal/transition system.
// The prior miniature gravity gallery was intentionally replaced by the owner's new original site.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium, webkit } from 'playwright';

const html = readFileSync('public/portfolio/index.html', 'utf8');
const css = readFileSync('public/portfolio/styles.css', 'utf8');
const js = readFileSync('public/portfolio/site.js', 'utf8');
assert.match(html, /class="hero section-shell"/, 'Manus editorial hero retained');
assert.match(html, /class="projects section-shell"/, 'Projects section retained');
assert.match(html, /class="project-card project-card-featured"/, 'Featured case study retained');
assert.match(css, /\.reveal\.is-visible/, 'Reveal animation still has a visible terminal state');
assert.match(css, /prefers-reduced-motion/, 'Reduced motion supported');
assert.match(css, /@keyframes/, 'Original keyframe animations included');
assert.match(js, /IntersectionObserver/, 'Scroll-linked reveal logic retained');
const origin = (process.env.QA_URL || 'http://127.0.0.1:4198').replace(/\/$/, '');

for (const type of [chromium, webkit]) {
  const browser = await type.launch({ headless: true });
  try {
    for (const [width, motion] of [[375, 'no-preference'], [390, 'reduce'], [1280, 'no-preference']]) {
      const page = await browser.newPage({ viewport: { width, height: 820 }, reducedMotion: motion });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const response = await page.goto(origin + '/portfolio/', { waitUntil: 'domcontentloaded' });
      assert.equal(response?.status(), 200, 'Original portfolio URL resolves');
      assert.ok(await page.locator('.hero h1').isVisible(), 'Hero headline visible');
      const poster = page.locator('.portrait-frame img');
      await poster.waitFor({ state: 'visible' });
      await page.waitForFunction(() => {
        const i = document.querySelector('.portrait-frame img');
        return Boolean(i && i.complete && i.naturalWidth > 0);
      });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 3, 'No horizontal overflow at ' + width + ': ' + overflow);

      const last = page.locator('.project-card').last();
      await last.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const el = document.querySelector('.project-card:last-of-type');
        return [...document.querySelectorAll('.project-card')].some(x => x.classList.contains('is-visible'));
      }, null, { timeout: 12000 });
      await page.waitForTimeout(motion === 'reduce' ? 50 : 700);
      const reveal = await last.evaluate(el => ({ visible: el.classList.contains('is-visible'), opacity: getComputedStyle(el).opacity }));
      assert.equal(reveal.visible, true, 'Last project scroll reveal becomes visible');
      assert.ok(Number(reveal.opacity) >= 0.98, 'Project opacity reaches visible state');
      assert.deepEqual(errors, [], 'No JS errors in migrated portfolio');
      console.log('PORTFOLIO REVEAL PASS', type.name(), width, motion, 'original animations and reduced motion');
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
