/**
 * Make the two production home routes canonical to themselves.
 * The Pages build copies the universal website offer onto / and /es/.
 * Never mutate the standalone website-offer pages or any demo/client route.
 *
 * --check : verify home metadata using source fixtures; do not write files.
 * <root>  : update the two already-copied HTML files under the Pages build root.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const checkOnly = process.argv[2] === '--check';
const root = checkOnly ? 'public' : (process.argv[2] || '.output/public');
const origin = 'https://thelaunchera.com';
const variants = [
  {
    lang: 'en',
    source: 'website-for-your-business/index.html',
    destination: 'index.html',
    canonical: origin + '/',
    title: 'The Launch Era | Websites, AI Tools & Business Automation',
    description: 'The Launch Era creates custom websites, booking pages, AI assistants and digital tools for small businesses. Explore interactive demos and smart business solutions.',
    socialTitle: 'The Launch Era | Websites & AI Tools for Small Businesses',
    socialDescription: 'Custom websites, booking pages, AI assistants and digital tools built for small businesses.',
  },
  {
    lang: 'es',
    source: 'es/website-for-your-business/index.html',
    destination: 'es/index.html',
    canonical: origin + '/es',
    title: 'The Launch Era | Websites, IA y herramientas para negocios',
    description: 'The Launch Era crea websites, páginas de reservas, asistentes con IA y herramientas digitales para pequeños negocios. Explora nuestros demos y soluciones.',
    socialTitle: 'The Launch Era | Websites y herramientas para negocios',
    socialDescription: 'Websites personalizados, reservas, asistentes con IA y herramientas digitales para pequeños negocios.',
  }
];
function replaceExactlyOnce(html, expression, replacement, label) {
  const matches = html.match(new RegExp(expression.source, 'g')) || [];
  assert.equal(matches.length, 1, 'Expected one ' + label + ', got ' + matches.length);
  return html.replace(expression, replacement);
}
function buildHomepage(html, variant) {
  const home = variant.canonical;
  html = replaceExactlyOnce(html, /<title>[^<]*<\/title>/, '<title>' + variant.title + '</title>', variant.lang + ' title');
  html = replaceExactlyOnce(html, /<meta name="description" content="[^"]*">/, '<meta name="description" content="' + variant.description + '">', variant.lang + ' meta description');
  html = replaceExactlyOnce(html, /<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + variant.socialTitle + '">', variant.lang + ' OG title');
  html = replaceExactlyOnce(html, /<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + variant.socialDescription + '">', variant.lang + ' OG description');
  html = replaceExactlyOnce(html, /<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + home + '">', variant.lang + ' OG URL');
  html = replaceExactlyOnce(html, /<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + home + '">', variant.lang + ' canonical');
  html = replaceExactlyOnce(html, /<link rel="alternate" hreflang="en-US" href="[^"]*">/, '<link rel="alternate" hreflang="en-US" href="' + origin + '/">', variant.lang + ' en alternate');
  html = replaceExactlyOnce(html, /<link rel="alternate" hreflang="es-US" href="[^"]*">/, '<link rel="alternate" hreflang="es-US" href="' + origin + '/es">', variant.lang + ' es alternate');
  assert(!html.includes('id="tle-homepage-identity"'), 'Homepage structured data already injected');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': origin + '/#organization', name: 'The Launch Era', url: origin + '/', logo: origin + '/favicon.png' },
      { '@type': 'WebSite', '@id': origin + '/#website', name: 'The Launch Era', alternateName: 'TLE', url: origin + '/', publisher: { '@id': origin + '/#organization' }, inLanguage: ['en', 'es'] }
    ]
  };
  const extra = '<link rel="alternate" hreflang="x-default" href="' + origin + '/">' +
    '<script type="application/ld+json" id="tle-homepage-identity">' + JSON.stringify(schema) + '</script>';
  html = replaceExactlyOnce(html, /<\/head>/, extra + '</head>', variant.lang + ' closing head');
  assert(html.includes('href="' + home + '"'), variant.lang + ' home canonical missing');
  assert(html.includes('The Launch Era'), variant.lang + ' brand missing');
  assert(!html.includes('Cleaning Business Automation & Booking | The Launch Era'), 'Obsolete cleaning-only page title');
  return html;
}
for (const variant of variants) {
  const relative = checkOnly ? variant.source : variant.destination;
  const file = join(root, relative);
  const original = readFileSync(file, 'utf8');
  const updated = buildHomepage(original, variant);
  if (!checkOnly) writeFileSync(file, updated, 'utf8');
  console.log('Homepage SEO ' + variant.lang + ': ' + (checkOnly ? 'checked' : 'prepared') + ' at ' + file);
}
