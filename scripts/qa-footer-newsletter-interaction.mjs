// Dependency-free VM tests for the actual footer script; no production writes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/assets/tle-footer-newsletter.js', import.meta.url), 'utf8');

async function scenario({ email = 'newsletter-fixture@example.com', response, expected }) {
  const handlers = {};
  const fields = { error: '', confirmation: '', button: 'Subscribe' };
  const classes = new Set();
  const attrs = {};
  const input = {
    value: email, disabled: false, validity: { valid: email.includes('@') && email.includes('.') },
    setAttribute(k, v) { attrs['input-' + k] = v; },
    removeAttribute(k) { delete attrs['input-' + k]; },
    focus() { this.focused = true; },
  };
  const buttonLabel = {
    set textContent(value) { fields.button = value; },
    get textContent() { return fields.button; },
  };
  const error = {
    set textContent(value) { fields.error = value; },
    get textContent() { return fields.error; },
  };
  const successLabel = {
    set textContent(value) { fields.confirmation = value; },
    get textContent() { return fields.confirmation; },
  };
  const success = { setAttribute(k, v) { attrs['success-' + k] = v; } };
  const button = { disabled: false, querySelector() { return buttonLabel; } };
  class HTMLFormElement {}
  const form = new HTMLFormElement();
  form.dataset = {};
  form.classList = { add: value => classes.add(value), contains: value => classes.has(value) };
  form.matches = value => value === '[data-tle-newsletter]';
  form.setAttribute = (k, v) => { attrs[k] = v; };
  form.removeAttribute = k => { delete attrs[k]; };
  form.querySelector = selector => ({
    '[data-newsletter-email]': input,
    'button[type="submit"]': button,
    '[data-newsletter-error]': error,
    '[data-newsletter-confirmation]': success,
    '[data-newsletter-confirmation-label]': successLabel,
    '[data-newsletter-website]': { value: '' },
  })[selector];
  let fetchCalls = 0;
  runInNewContext(source, {
    HTMLFormElement,
    AbortController,
    Date,
    Promise,
    document: {
      readyState: 'complete',
      querySelectorAll: () => [form],
      addEventListener: (name, callback) => { handlers[name] = callback; },
    },
    window: {
      setTimeout: (fn, delay) => setTimeout(fn, Math.min(delay, 8)),
      clearTimeout,
    },
    fetch: async () => {
      fetchCalls++;
      if (response === 'hang') return new Promise(() => {});
      if (response === 'error') return { ok: false, status: 503 };
      return { ok: true, status: 200, json() { throw Error('Safari response body hung'); } };
    }
  }, { filename: 'tle-footer-newsletter.js' });
  assert.ok(handlers.submit, 'Submit handler was registered');
  let prevented = false;
  await handlers.submit({ target: form, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(form.dataset.sending, undefined, 'Form may not stay sending');
  assert.equal(attrs['aria-busy'], undefined, 'Busy status must always clear');
  if (expected === 'done') {
    assert.equal(fetchCalls, 1);
    assert.equal(classes.has('done'), true, 'HTTP 200 should complete');
    assert.equal(fields.confirmation, "You're in");
    assert.equal(attrs['success-aria-hidden'], 'false');
    assert.equal(input.disabled, true);
  } else if (expected === 'invalid') {
    assert.equal(fetchCalls, 0, 'Invalid email must not send');
    assert.equal(classes.has('done'), false);
    assert.ok(fields.error.length > 0);
    assert.equal(input.disabled, false);
  } else {
    assert.equal(fetchCalls, 1);
    assert.equal(classes.has('done'), false);
    assert.ok(fields.error.includes('confirm'), 'Failure must display retryable error');
    assert.equal(input.disabled, false);
    assert.equal(button.disabled, false);
    assert.equal(fields.button, 'Subscribe');
  }
}
await scenario({ expected: 'done' });
await scenario({ response: 'error', expected: 'error' });
await scenario({ response: 'hang', expected: 'error' });
await scenario({ email: 'not-an-email', expected: 'invalid' });
console.log('PASS: HTTP 200 success without reading body, rejected response, stalled request timeout, invalid email.');
