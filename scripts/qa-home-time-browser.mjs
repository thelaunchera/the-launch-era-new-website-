// The former day/night chapter is retired; verify the current homepage contract.
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
for (const file of ['src/routes/index.tsx', 'src/routes/es.index.tsx']) {
  assert(!/<HomeMotionInterlude\s+lang=/.test(readFileSync(file, 'utf8')), file+' must not resurrect the retired decorative chapter');
}
execFileSync(process.execPath, ['--check', 'public/assets/tle-home-time-of-day.js']);
if (!process.argv.includes('--browser')) {
  console.log('PASS retired day/night chapter remains absent EN/ES; retained scene JavaScript parses');
} else {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const host = process.env.QA_URL || 'http://127.0.0.1:4173';
    for (const lang of ['en', 'es']) {
      for (const width of [360, 390, 820, 1024, 1440]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        await page.goto(host + (lang === 'es' ? '/es/' : '/'), { waitUntil: 'domcontentloaded' });
        assert.equal(await page.locator('.tle-day-night').count(), 0, lang+' retired chapter at '+width);
        assert.equal(await page.locator('.tle-primary-booking-offer').count(), 1, lang+' current primary offer');
        await page.close();
      }
    }
  } finally { await browser.close(); }
  console.log('PASS current EN/ES homepage offer and absent retired chapter at five widths');
}
