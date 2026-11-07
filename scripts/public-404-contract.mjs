// Public recovery stays on the marketing site, with no private portal CTA.
export function public404Problems(status, html) {
  const problems = [];
  const normalized = html.replace(/(?:’|&#0*39;|&#x0*27;|&apos;)/gi, "'");
  if (status !== 404) problems.push('Missing route must return HTTP 404');
  if (!/<h1\b[^>]*>\s*We couldn't find that page\.\s*<\/h1>/i.test(normalized))
    problems.push('Missing route needs a readable heading');
  for (const [id, destination] of [['home-link', '/'], ['help-link', '/help']]) {
    const anchor = [...html.matchAll(/<a\b([^>]*)>/gi)].find(([, attrs]) =>
      new RegExp('\\bid=["\\\']' + id + '["\\\']', 'i').test(attrs));
    const href = anchor?.[1].match(/\bhref=["']([^"']*)["']/i)?.[1];
    if (href !== destination) problems.push('Missing route has no safe ' + id);
  }
  if (/<a\b[^>]*\bhref=["'][^"']*\/command-center(?:\/|[?#"'])/i.test(html))
    problems.push('Public recovery must not advertise a private workspace');
  return problems;
}
