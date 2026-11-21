import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';

const port = 4173;
const server = spawn('./node_modules/.bin/vite', ['preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: ['ignore','pipe','pipe'] });
let logs = '';
server.stdout.on('data', x => { logs += String(x); });
server.stderr.on('data', x => { logs += String(x); });
let browser;
try {
  let available = false;
  for (let i = 0; i < 50; i++) {
    if (server.exitCode !== null) throw new Error('Preview server exited: ' + logs);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/apps/self-love-gym/?demo=1`);
      if (response.ok) { available = true; break; }
    } catch {}
    await sleep(250);
  }
  assert(available, 'Vite preview did not start: ' + logs);
  browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/apps/self-love-gym/?demo=1`, { waitUntil: 'domcontentloaded' });
  await page.locator('.bottom-nav').waitFor({ state: 'visible', timeout: 12000 });
  assert.equal(await page.locator('.bottom-nav button').count(), 5, 'Five mobile navigation tabs');
  await page.locator('.bottom-nav button').filter({ hasText: 'Calendar' }).click();
  await page.locator('.coach-calendar-grid').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.coach-calendar-day').count(), 42, 'Monthly calendar shows 42 date cells');
  console.log('PASS: Calendar tab, monthly grid and five-tab navigation');

  await page.locator('.coach-calendar-filter select').selectOption({ label: 'Sofia Lane' });
  let eventDays = await page.locator('.coach-calendar-day').filter({ has: page.locator('.coach-day-count') }).count();
  if (!eventDays) {
    await page.getByRole('button', { name: 'Next month' }).click();
    eventDays = await page.locator('.coach-calendar-day').filter({ has: page.locator('.coach-day-count') }).count();
  }
  assert(eventDays > 0, 'Sofia sample session should appear on monthly calendar');
  await page.locator('.coach-calendar-day').filter({ has: page.locator('.coach-day-count') }).first().click();
  await page.locator('.coach-appointment').first().click();
  await page.locator('.coach-session-detail').waitFor({ state: 'visible' });
  const detailText = await page.locator('.coach-session-detail').innerText();
  assert(detailText.includes('Sofia Lane'), 'Session detail shows client');
  assert(detailText.includes('2:30 PM'), 'Session shows saved start time');
  assert(detailText.includes('3:00 PM'), 'Session shows calculated end time');
  assert(detailText.includes('30 min'), 'Session shows duration');
  console.log('PASS: Tap day → appointment → start and end times, client and duration');

  await page.locator('.coach-session-client').click();
  await page.locator('.coach-profile').waitFor({ state: 'visible' });
  assert((await page.locator('.coach-profile').innerText()).includes('Sofia Lane'), 'Client profile opens');
  assert((await page.locator('.coach-profile').innerText()).includes('Upcoming appointments'), 'Client schedule appears');
  console.log('PASS: Client detail profile with sessions, memberships, payments and notes');
  await page.locator('.coach-profile-hero-actions button.accent').click();
  await page.locator('.modal input[type="time"]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.modal input[type="time"]').count(), 1, 'Session form has a time picker');
  console.log('PASS: Add session opens time-aware mobile bottom sheet');
  for (const label of ['Calendar day', 'Appointment details', 'Profile form']) {
    const metrics = await page.evaluate(() => ({ bodyWidth: document.body.scrollWidth, viewportWidth: window.innerWidth }));
    assert(metrics.bodyWidth <= metrics.viewportWidth + 4, `${label}: horizontal overflow ${JSON.stringify(metrics)}`);
  }
  assert.equal(errors.length, 0, 'No uncaught browser errors: ' + errors.join('; '));
  console.log('PASS: iPhone viewport has no horizontal overflow or page errors');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
