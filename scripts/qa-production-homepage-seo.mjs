import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const tmp = mkdtempSync(join(tmpdir(), 'tle-homepage-seo-'));
const origin = 'https://thelaunchera.com';
const scenarios = [
  ['en', 'public/website-for-your-business/index.html', 'index.html', origin + '/'],
  ['es', 'public/es/website-for-your-business/index.html', 'es/index.html', origin + '/es'],
];
try {
  mkdirSync(join(tmp, 'es'), { recursive: true });
  for (const [lang, source, destination] of scenarios) {
    const original = readFileSync(source, 'utf8');
    assert.match(original, /<link rel="canonical" href="https:\/\/thelaunchera.com\/(?:es\/)?website-for-your-business\/">/, lang + ' offer must stay self-canonical');
    copyFileSync(source, join(tmp, destination));
  }
  execFileSync(process.execPath, ['scripts/prepare-homepage-seo.mjs', tmp], { stdio: 'inherit' });
  for (const [lang, source, destination, canonical] of scenarios) {
    const html = readFileSync(join(tmp, destination), 'utf8');
    const sourceHtml = readFileSync(source, 'utf8');
    assert(html.includes('<link rel="canonical" href="' + canonical + '">'), lang + ' canonical mismatch');
    assert(html.includes('<meta property="og:url" content="' + canonical + '">'), lang + ' Open Graph URL mismatch');
    assert(html.includes('<meta property="og:site_name" content="The Launch Era">'), lang + ' OG site name missing');
    assert(html.includes('<meta name="application-name" content="The Launch Era">'), lang + ' application name missing');
    assert(html.includes('hreflang="en-US" href="' + origin + '/"'), lang + ' English alternate missing');
    assert(html.includes('hreflang="es-US" href="' + origin + '/es"'), lang + ' Spanish alternate missing');
    assert(html.includes('hreflang="x-default" href="' + origin + '/"'), lang + ' default alternate missing');
    assert(html.includes('process-build-en.png'), lang + ' non-cleaning social image missing');
    assert(!html.includes('Cleaning Business Automation & Booking | The Launch Era'), lang + ' cleaning-only title remained');
    assert(lang === 'es' ? html.includes('<title>The Launch Era | Websites, IA y herramientas para negocios</title>') : html.includes('<title>The Launch Era | Websites, AI Tools & Business Automation</title>'), lang + ' expected title missing');
    const schema = html.match(/<script type="application\/ld\+json" id="tle-homepage-identity">([^<]*)<\/script>/);
    assert(schema, lang + ' official site-name JSON-LD missing');
    const structured = JSON.parse(schema[1]);
    assert.equal(structured['@graph'][1].name, 'The Launch Era');
    assert.equal(structured['@graph'][1].url, origin + '/');
    assert.equal((html.match(/id="tle-homepage-identity"/g) || []).length, 1, lang + ' duplicate JSON-LD');
    assert(sourceHtml.includes('href="' + origin + (lang === 'es' ? '/es' : '') + '/website-for-your-business/">'), lang + ' standalone offer unexpectedly changed');
  }
  console.log('PASS: EN/ES published home copies canonical to themselves, official site name/schema, safe original offer pages');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
