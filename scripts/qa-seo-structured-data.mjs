/** 
 * Read-only SEO/GEO contract test. Run with Bun:
 * bun scripts/qa-seo-structured-data.mjs
 * Validates rendered JSON-LD rather than only searching source strings.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  SeoStructuredData, organizationWebsiteSchema, bookingServiceSchema, cleaningAppSchema
} from '../src/components/seo-structured-data.tsx';

const origin = 'https://thelaunchera.com';
const organizationId = origin + '/#organization';
const fixtures = [
  { data: organizationWebsiteSchema, route: '/', source: 'src/routes/__root.tsx', kind: 'site' },
  { data: bookingServiceSchema('en'), route: '/booking-lead-automation', source: 'src/routes/booking-lead-automation.tsx', kind: 'service' },
  { data: bookingServiceSchema('es'), route: '/es/booking-lead-automation/', source: 'src/routes/es.booking-lead-automation.tsx', kind: 'service' },
  { data: cleaningAppSchema('en'), route: '/cleaning-web-app', source: 'src/routes/cleaning-web-app.tsx', kind: 'app' },
  { data: cleaningAppSchema('es'), route: '/es/cleaning-web-app/', source: 'src/routes/es.cleaning-web-app.tsx', kind: 'app' },
];
const extracted = data => {
  const html = renderToStaticMarkup(createElement(SeoStructuredData, { data }));
  const match = html.match(/^<script type="application\/ld\+json">([\s\S]+)<\/script>$/);
  assert.ok(match, 'Expected one valid application/ld+json script');
  return JSON.parse(match[1]);
};

assert.equal(fixtures.length, 5);
for (const { data, route, source, kind } of fixtures) {
  const structured = extracted(data);
  assert.equal(structured['@context'], 'https://schema.org');
  const code = readFileSync(source, 'utf8');
  assert.match(code, /SeoStructuredData/, source + ' must mount its schema');
  if (kind === 'site') {
    const organization = structured['@graph'].find(x => x['@type'] === 'Organization');
    const website = structured['@graph'].find(x => x['@type'] === 'WebSite');
    assert.equal(organization['@id'], organizationId);
    assert.equal(organization.url, origin + '/');
    assert.equal(website.publisher['@id'], organizationId);
    assert.deepEqual(website.inLanguage, ['en-US', 'es-US']);
  } else {
    assert.equal(structured.url, origin + route, 'URL must match canonical route');
    assert.equal(structured['@id'], origin + route + (kind === 'service' ? '#service' : '#app'));
    assert.equal((kind === 'service' ? structured.provider : structured.publisher)['@id'], organizationId);
    assert.equal(structured['@type'], kind === 'service' ? 'Service' : 'SoftwareApplication');
    assert.ok(structured.description.length > 55, 'Description should be genuinely descriptive');
  }
  assert.ok(!/aggregateRating|reviewCount|ratingValue|openingHours|priceRange|house cleaning near me/.test(JSON.stringify(structured)), 'No fabricated reputation or local-cleaning claims');
  console.log('SEO_JSONLD_PASS', route, kind);
}

// Escaping must prevent an embedded </script> from terminating the JSON-LD element.
const malicious = { '@context': 'https://schema.org', test: '</script><script>alert(1)</script>' };
const rendered = renderToStaticMarkup(createElement(SeoStructuredData, { data: malicious }));
assert.ok(!rendered.includes('</script><script>'), 'Unsafe HTML must not leak into JSON-LD');
assert.deepEqual(extracted(malicious), malicious, 'Escaping must preserve JSON values');

const sitemap = readFileSync('public/sitemap.xml','utf8');
for (const route of fixtures.slice(1).map(x => x.route)) {
  assert.ok(sitemap.includes('<loc>' + origin + route + '</loc>'), 'Missing sitemap URL: ' + route);
}
assert.ok(!sitemap.includes('whatsapp-ai-agent'), 'Coming-soon noindex routes must not be in sitemap');
console.log('[SEO JSON-LD QA PASS] First-party EN/ES Organization, Service, SoftwareApplication, safe JSON and sitemap.');
