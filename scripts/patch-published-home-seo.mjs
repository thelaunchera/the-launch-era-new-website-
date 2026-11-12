/**
 * The Pages workflow publishes the universal website landing at the domain root.
 * Update ONLY the two copied homepage files, not the canonical landing pages.
 * This keeps the official The Launch Era site identity consistent for crawlers.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const origin = 'https://thelaunchera.com';
const enOffer = origin + '/website-for-your-business/';
const esOffer = origin + '/es/website-for-your-business/';
const enHome = origin + '/';
const esHome = origin + '/es/';

function replaceOne(markup, before, after, label) {
  const count = markup.split(before).length - 1;
  assert.equal(count, 1, 'Expected exactly one ' + label + '; found ' + count);
  return markup.replace(before, after);
}

const siteNameData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'The Launch Era',
  alternateName: ['TLE', 'thelaunchera.com'],
  url: enHome,
});

for (const [path, currentCanonical, newCanonical] of [
  ['.output/public/index.html', enOffer, enHome],
  ['.output/public/es/index.html', esOffer, esHome],
]) {
  let markup = readFileSync(path, 'utf8');
  assert.match(markup, /<title>The Launch Era \| Websites,/);
  assert.match(markup, /<meta name="description" content="[^"]*(?:website|Website|Websites)/);
  markup = replaceOne(
    markup,
    '<link rel="canonical" href="' + currentCanonical + '">',
    '<link rel="canonical" href="' + newCanonical + '">',
    path + ' canonical',
  );
  for (const [locale, oldUrl, newUrl] of [
    ['en-US', enOffer, enHome],
    ['es-US', esOffer, esHome],
  ]) {
    markup = replaceOne(
      markup,
      '<link rel="alternate" hreflang="' + locale + '" href="' + oldUrl + '">',
      '<link rel="alternate" hreflang="' + locale + '" href="' + newUrl + '">',
      path + ' ' + locale + ' alternate',
    );
  }
  markup = replaceOne(
    markup,
    '<meta property="og:url" content="' + currentCanonical + '">',
    '<meta property="og:url" content="' + newCanonical + '">',
    path + ' social URL',
  );
  assert.ok(!markup.includes('type="application/ld+json"'), 'Unexpected structured-data duplicate in ' + path);
  markup = replaceOne(
    markup,
    '</head>',
    '<link rel="alternate" hreflang="x-default" href="' + enHome + '">' +
      '<script type="application/ld+json">' + siteNameData + '</script></head>',
    path + ' head end',
  );
  assert.ok(markup.includes('<meta property="og:site_name" content="The Launch Era">'));
  writeFileSync(path, markup);
  console.log('[HOME SEO] canonical, alternates and site name updated:', path);
}
