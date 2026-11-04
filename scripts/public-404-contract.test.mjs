import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { public404Problems } from './public-404-contract.mjs';

const html = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
test('published public 404 contract accepts home/contact and apostrophe forms', () => {
  for (const apostrophe of ["'", '’', '&#39;', '&apos;']) {
    assert.deepEqual(public404Problems(404, html.replace("couldn't", 'couldn' + apostrophe + 't')), []);
  }
});
test('a successful HTTP page or blank fallback fails', () => {
  assert.ok(public404Problems(200, html).length);
  assert.ok(public404Problems(404, '').length);
});
test('missing or misdirected recovery actions fail', () => {
  for (const target of ['href="/"', 'href="/help"']) {
    assert.ok(public404Problems(404, html.replace(target, 'href="/unavailable"')).length);
  }
});
test('a private workspace link fails even when public recovery links exist', () => {
  assert.ok(public404Problems(404, html + '<a href="/command-center/">Open</a>').length);
});
