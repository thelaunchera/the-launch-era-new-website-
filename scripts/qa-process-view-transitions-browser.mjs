/* Read-only browser QA against the locally built homepage; does not submit forms. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
// SSR cards can be visible before React attaches their click handlers.
// Wait for real hydration; do not force-click or bypass pointer hit testing.
async function waitForHydratedProcess(page) {
  await page.waitForFunction(() => {
    const card = document.querySelector('.tle-process-grid .tle-process-card');
    return card && Object.keys(card).some(key =>
      key.startsWith('__reactProps') && typeof card[key]?.onClick === 'function'
    );
  }, null, { timeout: 20000 });
}

try {
  for (const [language, path] of [['en', '/'], ['es', '/es/']]) {
    for (const width of [390, 820, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 850 }, reducedMotion: 'reduce' });
      await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await waitForHydratedProcess(page);
      const button = page.locator('.tle-process-grid .tle-process-card').first();
      await button.waitFor({ state: 'visible', timeout: 25000 });
      const count = await page.locator('.tle-process-grid .tle-process-card').count();
      assert.equal(count, 3, language + ' should have three clickable cards at ' + width);
      // Locator.click() scrolls into view and retries React DOM replacements itself.
      // Keep genuine hit-testing (no force click) for interactive QA.
      await button.click({ timeout: 15000 });
      const dialog = page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible' });
      assert.equal(await dialog.getAttribute('aria-modal'), 'true');
      assert(await page.locator('.tle-process-detail-hero').isVisible(), 'Detail hero is hidden');
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert(await page.locator('#contacto form').count(), 'Contact form must not disappear');
      assert(await page.locator('.tle-process-grid .tle-process-card').count(), 'Step cards must return');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(overflow <= 3, language + ' homepage horizontal overflow at ' + width + ': ' + overflow + 'px');
      await page.close();
    }
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await waitForHydratedProcess(page);
  const first = page.locator('.tle-process-grid .tle-process-card').first();
  // Avoid a separate scroll call: React can replace the button between actions.
  await first.click({ timeout: 15000 });
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  const heroName = await page.locator('.tle-process-detail-hero').evaluate(el => el.style.viewTransitionName);
  assert.equal(heroName, 'tle-process-0', 'Source to hero transition name must match');
  await page.getByRole('button', { name: 'Close step details' }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.close();
  console.log('[PROCESS BROWSER QA PASSED] EN/ES, 390/820/1440, detail open/close, keyboard, contact form and shared names.');
} finally {
  await browser.close();
}
