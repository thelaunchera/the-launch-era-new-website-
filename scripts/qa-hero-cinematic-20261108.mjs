/** Read-only browser QA for the three live shared cinematic heroes.
 *  CRUMB remains deliberately still. Other demos use their own hero players.
 *  This check never sends forms, emails, events or customer data.
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

const origin = (process.env.QA_URL || 'http://127.0.0.1:4188').replace(/\/$/, '');
const brands = ['casa-brownie', 'ivory-and-bloom', 'marea-wigs-miami'];
const folder = 'qa-screenshots/motion-20261108';
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const slug of brands) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'no-preference',
      serviceWorkers: 'block'
    });
    try {
      const page = await context.newPage();
      const response = await page.goto(origin + '/demos/' + slug + '/', {
        waitUntil: 'domcontentloaded', timeout: 40000
      });
      assert.equal(response?.status(), 200, slug + ' page should load');
      await page.waitForFunction(
        brand => {
          const v = document.querySelector('video[data-tle-cinematic-hero="' + brand + '"]');
          return !!v && v.videoWidth > 0 && v.readyState >= 2;
        },
        slug, { timeout: 25000 }
      );
      const state = await page.evaluate(brand => {
        const v = document.querySelector('video[data-tle-cinematic-hero="' + brand + '"]');
        const r = v.getBoundingClientRect();
        return {
          src: new URL(v.currentSrc).pathname,
          poster: new URL(v.poster).pathname,
          pointerEvents: getComputedStyle(v).pointerEvents,
          reactive: v.hasAttribute('data-tle-reactive-photo'),
          muted: v.muted,
          loop: v.loop,
          width: v.videoWidth,
          visibleWidth: r.width,
          visibleHeight: r.height
        };
      }, slug);
      assert(state.src.endsWith('/demos/' + slug + '/media/hero-motion-20261108.mp4'),
        slug + ' must use its own approved video');
      assert(state.poster.endsWith('/demos/' + slug + '/media/hero-motion-poster-hq.webp'),
        slug + ' must have its matching first-frame poster');
      assert.equal(state.pointerEvents, 'none', slug + ' must never intercept buttons or scroll');
      assert(state.reactive && state.muted && state.loop, slug + ' needs touch-safe silent looping');
      assert(state.visibleWidth > 50 && state.visibleHeight > 50, slug + ' hero must have real size');
      await page.screenshot({ path: folder + '/' + slug + '-390.png' });
      console.log('PASS', slug, 'approved decoded motion, matching poster and touch-safe layer');
    } finally {
      await context.close();
    }
  }
  for (const slug of ['casa-brownie', 'crumb']) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce', serviceWorkers: 'block'
    });
    try {
      const page = await context.newPage();
      const response = await page.goto(origin + '/demos/' + slug + '/',
        { waitUntil: 'domcontentloaded', timeout: 40000 });
      assert.equal(response?.status(), 200, slug + ' still fallback route should work');
      await page.waitForTimeout(350);
      assert.equal(await page.locator('video[data-tle-cinematic-hero]').count(), 0,
        slug + ' must not force cinematic video in still/reduced-motion mode');
      console.log('PASS', slug, 'original still/reduced-motion mode');
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
