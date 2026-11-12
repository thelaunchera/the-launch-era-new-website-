const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const base = "http://127.0.0.1:8172";
(async()=>{
  const browser = await chromium.launch({headless:true});
  for(const width of [360,390,768,820,1024,1440]){
    for(const [path,lang] of [["/guias/","en"],["/es/guias/","es"]]){
      const context=await browser.newContext({viewport:{width,height:860},reducedMotion:"reduce",hasTouch:width<=390});
      const page=await context.newPage(),errors=[];
      page.on("pageerror",e=>errors.push(e.message));
      const r=await page.goto(base+path,{waitUntil:"networkidle"});
      assert.equal(r.status(),200,path+" should serve 200");
      assert.equal(await page.locator("html").getAttribute("lang"),lang);
      assert.equal(await page.locator(".guide").count(),10,"ten public guides");
      assert.equal(await page.locator("#reading-progress").count(),1,"reading progress exists");
      assert.equal(await page.locator(".ticker-track span").count(),24,"scroll keywords exist");
      assert.ok(await page.locator(".hero-portrait").evaluate(async img=>{await img.decode();return img.naturalWidth>0}),"portrait loads");
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth),"no overflow at top "+width);
      if(width<=390){
        const titleMetrics=await page.locator(".hero h1").evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {height:r.height,fontSize:parseFloat(s.fontSize),letterSpacing:parseFloat(s.letterSpacing),weight:parseInt(s.fontWeight),width:r.width};});
        assert.ok(titleMetrics.fontSize<=41,"mobile title font is controlled: "+JSON.stringify(titleMetrics));
        assert.ok(titleMetrics.letterSpacing>-1.8,"mobile heading letter spacing prevents collision");
        assert.ok(titleMetrics.height<=160,"mobile title no longer dominates screen");
        const art=await page.locator(".hero-art").boundingBox();
        const copy=await page.locator(".hero-copy").boundingBox();
        assert.ok(Math.abs(art.y-copy.y)<100,"image and introduction sit side-by-side");
        assert.ok(art.x+art.width<=copy.x+4,"photo and copy do not overlap");
        const button=await page.locator(".hero .button").boundingBox();
        assert.ok(button.y<790,"hero CTA appears above lower viewport");
      }
      const nav=page.locator("body>.grid header");
      assert.equal(await nav.evaluate(el=>getComputedStyle(el).position),"fixed");
      assert.equal(await page.locator(".ticker-track").evaluate(el=>getComputedStyle(el).animationName),"none","reduced motion stops marquee");
      const guide=page.locator(".guide").first();
      await guide.scrollIntoViewIfNeeded();
      await page.evaluate(()=>window.dispatchEvent(new Event("scroll")));
      await page.waitForTimeout(100);
      const progress=await page.locator("#reading-progress").evaluate(el=>getComputedStyle(el).transform);
      assert.ok(progress!=="none"&&progress!=="matrix(1, 0, 0, 1, 0, 0)","progress changes after scroll: "+progress);
      assert.equal(await nav.isVisible(),true,"header remains on screen");
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth),"no overflow after scroll "+width);
      const canvas=page.locator("#como");
      await canvas.scrollIntoViewIfNeeded();
      assert.equal(await page.locator("#como .step").count(),3);
      const imageBounds=await page.locator(".hero-portrait").boundingBox();
      assert.ok(imageBounds && imageBounds.width>100,"portrait has usable dimensions");
      assert.deepEqual(errors,[],"no JS errors: "+errors.join("; "));
      await context.close();
    }
    console.log("[TLE GUIDES SCROLL] "+width+"px EN/ES reduced-motion, progress, header, portrait, 10 guides, no overflow passed");
  }
  // Non-reduced-motion: reveal elements become visible once scrolled into view.
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"no-preference"});
  const page=await context.newPage();
  await page.goto(base+"/es/guias/",{waitUntil:"networkidle"});
  assert.equal(await page.locator(".ticker-track").evaluate(el=>getComputedStyle(el).animationName),"tle-guides-marquee");
  await page.locator(".guide").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(750);
  assert.equal(await page.locator(".guide").first().evaluate(el=>el.classList.contains("is-visible")),true,"reveal visible");
  await context.close();await browser.close();
  console.log("[TLE GUIDES SCROLL] Animated reveal and marquee passed");
})().catch(err=>{console.error(err);process.exit(1)});
