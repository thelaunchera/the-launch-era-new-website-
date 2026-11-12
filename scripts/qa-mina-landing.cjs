const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { chromium } = require('playwright');

const base = 'http://127.0.0.1:8172';
const fixture = readFileSync('public/guias/assets/dailin-avatar-hero-poster.webp');
const idMap = JSON.parse(readFileSync('public/guias/mina-assets/living-portrait.js', 'utf8').match(/const IDS = (.*);/)[1]);
const faceId = name => idMap[name];
const locales = [
  { path: '/guias/mina.html', library: '/guias/', lang: 'en', title: 'Mina -- 3D Creator', price: 'Price', project: 'Live Project', contact: 'Contact Me' },
  { path: '/es/guias/mina.html', library: '/es/guias/', lang: 'es', title: 'Mina -- Creadora 3D', price: 'Precios', project: 'Ver proyecto', contact: 'Contáctame' },
];

(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
  try {
    const layoutPage = await browser.newPage({ reducedMotion: 'reduce' });
    for (const width of [360, 390, 768, 1024, 1440]) {
      for (const locale of locales) {
        const page = layoutPage;
        await page.setViewportSize({ width, height: 850 });
        const errors = [];
        const trackError = error => errors.push(error.message);
        page.on('pageerror', trackError);
        await page.route('https://**/*', route => {
          const host = new URL(route.request().url()).hostname;
          if (host.includes('fonts.')) return route.abort();
          return route.fulfill({ body: fixture, contentType: 'image/webp' });
        });
        await page.goto(base + locale.path, { waitUntil: 'domcontentloaded' });
        await page.locator('#faceFallback').waitFor();
        assert.equal(await page.title(), locale.title);
        assert.equal(await page.locator('html').getAttribute('lang'), locale.lang);
        assert.equal(await page.locator('nav a').count(), 4);
        assert.equal(await page.locator('#price li').count(), 5);
        assert.equal(await page.locator('#projects article').count(), 3);
        assert.equal(await page.locator('footer [hreflang]').count(), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page has no horizontal scroll');
        assert.ok(await page.locator('.hero-bottom .contact-btn').evaluate(link => {
          const r = link.getBoundingClientRect();
          return r.bottom <= innerHeight && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === link;
        }), 'contact CTA fits and receives taps');
        await page.getByRole('link', { name: locale.price, exact: true }).click();
        assert.equal(new URL(page.url()).hash, '#price');
        await page.getByRole('button', { name: locale.project, exact: true }).first().click();
        assert.equal(await page.locator('dialog[open] h2').textContent(), 'Nextlevel Studio');
        await page.keyboard.press('Escape');
        await page.locator('dialog').waitFor({ state: 'hidden' });
        await page.getByRole('link', { name: locale.contact, exact: true }).last().click();
        assert.equal(new URL(page.url()).pathname, locale.library);
        assert.equal(new URL(page.url()).hash, '#contacto');
        await page.locator('#vault-inquiry-form').waitFor();
        await page.goto(base + locale.path + '?guide=google-flow-avatar');
        assert.equal(new URL(page.url()).pathname, locale.library);
        await page.locator('#dialog-backdrop').waitFor({ state: 'visible' });
        assert.deepEqual(errors, []);
        page.off('pageerror', trackError);
        await page.unrouteAll();
      }
    }

    const page = layoutPage;
    await page.setViewportSize({ width: 1100, height: 820 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**/*', route => {
      const host = new URL(route.request().url()).hostname;
      if (host.includes('fonts.')) return route.abort();
      return route.fulfill({ body: fixture, contentType: 'image/webp', headers: { 'access-control-allow-origin': '*' } });
    });
    await page.addInitScript(() => {
      const prototype = WebGLRenderingContext.prototype;
      const images = new WeakMap();
      const bindings = new WeakMap();
      const activeTexture = prototype.activeTexture;
      const bindTexture = prototype.bindTexture;
      const texImage2D = prototype.texImage2D;
      const drawElements = prototype.drawElements;
      prototype.activeTexture = function (unit) {
        const state = bindings.get(this) || { textures: [] };
        state.unit = unit - this.TEXTURE0;
        bindings.set(this, state);
        return activeTexture.call(this, unit);
      };
      prototype.bindTexture = function (target, texture) {
        const state = bindings.get(this);
        if (state) state.textures[state.unit] = texture;
        return bindTexture.call(this, target, texture);
      };
      prototype.texImage2D = function (...args) {
        const state = bindings.get(this);
        const source = args[5];
        if (state && source?.src) {
          images.set(state.textures[state.unit], source.src);
          window.loadedFaceImages ||= new Set();
          window.loadedFaceImages.add(source.src);
        }
        return texImage2D.apply(this, args);
      };
      prototype.drawElements = function (...args) {
        const state = bindings.get(this);
        if (state) window.faceOnCanvas = images.get(state.textures[1]);
        return drawElements.apply(this, args);
      };
    });
    await page.goto(base + '/guias/mina.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.loadedFaceImages?.size === 58);
    const expectFace = name => page.waitForFunction(id => window.faceOnCanvas?.includes(id), faceId(name), { timeout: 4500 });
    await expectFace('closed');
    await page.mouse.move(1030, 390);
    await expectFace('right');
    const box = await page.locator('#faceFallback').boundingBox();
    const move = (u, v) => page.mouse.move(box.x + box.width * u, box.y + box.height * v);
    await move(.5, .645);
    await expectFace('kiss');
    await page.mouse.down();
    await page.mouse.up();
    await expectFace('tongue');
    await move(.54, .62);
    await page.mouse.down();
    await move(.88, .62);
    await expectFace('scared');
    await page.mouse.up();
    await expectFace('dizzy');
    await page.locator('.hero-bottom .contact-btn').hover();
    await expectFace('hearts');
    await page.mouse.move(1030, 390);
    await expectFace('grin');
    assert.deepEqual(errors, []);
    console.log('Mina: both languages at 360/390/768/1024/1440, project dialog, inquiry, guide deep link and WebGL portrait interactions passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
