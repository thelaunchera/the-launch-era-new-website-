import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const url = new URL('../public/demos/ivory-and-bloom/index.html', import.meta.url).href;
const browser = await chromium.launch({headless: true});
try {
  for (const width of [360, 390, 768, 820, 1024, 1440]) {
    const page = await browser.newPage({viewport:{width,height:900}, deviceScaleFactor:1});
    await page.goto(url, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => {
      const img = document.querySelector('.hero-photo img');
      return img?.complete && img.naturalWidth > 0;
    });
    const data = await page.evaluate(() => {
      const rect = sel => {
        const r = document.querySelector(sel).getBoundingClientRect();
        return {x:r.x,y:r.y,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
      };
      return {
        photo:rect('.hero-photo'), inset:rect('.hero-inset'),
        aside:rect('.hero-aside'), title:rect('#hero-title'),
        hero:rect('.hero'), cta:rect('.hero-aside a'),
        pageWidth:document.documentElement.scrollWidth,
        overflowNodes:[...document.querySelectorAll('body *')].map(e=>({node:e.tagName.toLowerCase(),cls:typeof e.className==='string'?e.className.slice(0,70):'',right:Math.round(e.getBoundingClientRect().right),left:Math.round(e.getBoundingClientRect().left)})).filter(r=>r.right>innerWidth+1).slice(0,12),
        imageLoaded:document.querySelector('.hero-photo img').naturalWidth > 0,
        detailLoaded:document.querySelector('.hero-inset img').naturalWidth > 0,
        ctaTarget:document.querySelector('.hero-aside a').getAttribute('href')
      };
    });
    assert.equal(data.imageLoaded, true, `Main photo missing at ${width}px`);
    assert.equal(data.detailLoaded, true, `Inset photo missing at ${width}px`);
    assert.equal(data.ctaTarget, '#cake-gallery');
    assert(data.cta.width > 60 && data.cta.height > 15, `CTA not visible at ${width}px`);
    if (data.pageWidth > width + 2) console.error('OVERFLOW DETAIL', width, data.pageWidth, JSON.stringify(data.overflowNodes));
    assert(data.pageWidth <= width + 2, `Horizontal overflow at ${width}px: ${data.pageWidth}`);
    if (width >= 761) {
      assert(data.photo.height >= 520, `Desktop/tablet hero too short at ${width}px: ${data.photo.height}`);
      assert(data.photo.width / data.hero.width > 0.55, `Photo not prominent at ${width}px`);
      assert(data.inset.right <= data.aside.left + 2, `Detail overlaps hero copy at ${width}px`);
      assert(data.title.top >= data.photo.bottom - 2, `Title covers photo at ${width}px`);
    } else {
      assert(data.photo.height >= 280, `Mobile photo collapsed at ${width}px`);
      assert(data.aside.top > data.photo.top, `Mobile story order changed at ${width}px`);
    }
    console.log(`IVORY & BLOOM ${width}px: main photo ${Math.round(data.photo.width)} × ${Math.round(data.photo.height)}, no overflow`);
    await page.close();
  }
} finally { await browser.close(); }
