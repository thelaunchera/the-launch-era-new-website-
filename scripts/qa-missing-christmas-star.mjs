import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../public/games/missing-christmas-star/index.html', import.meta.url), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(source, 'The game must include its interactive script');

const elements = new Map();
const listeners = new Map();
const storage = new Map();
const element = selector => {
  if (!elements.has(selector)) {
    elements.set(selector, {
      textContent: '', innerHTML: '', value: '',
      classList: { add() {}, remove() {}, toggle() {} },
      setAttribute() {},
    });
  }
  return elements.get(selector);
};
const document = {
  documentElement: { lang: 'en' },
  querySelector: element,
  querySelectorAll: () => [],
  addEventListener: (name, listener) => listeners.set(name, listener),
};
const context = {
  document,
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  },
  window: { scrollTo() {}, confirm: () => true },
  setInterval() {},
  setTimeout(callback) { callback(); },
  Math, Date, console,
};
vm.createContext(context);
vm.runInContext(source.replace(/\}\)\(\);\s*$/, 'globalThis.gameState = () => s;})();'), context);
const state = context.gameState;
const click = (kind, value) => listeners.get('click')({
  target: {
    closest: selector => selector === `[data-${kind === 'action' ? 'game-step' : kind}]`
      ? { dataset: { [kind === 'action' ? 'gameStep' : kind]: String(value) } }
      : null,
  },
});
const submit = id => listeners.get('submit')({ target: { id }, preventDefault() {} });
const expectScreen = screen => assert.equal(state().screen, screen, `Expected ${screen} screen`);

assert.match(element('#app').innerHTML, /The Missing Christmas Star/);
element('#player-name').value = '<b>Star finder</b>';
submit('start-form');
expectScreen('game');
assert.equal(state().name, '<b>Star finder</b>');
click('action', 'hint');
assert.equal(state().hints[0], 1);
click('action', 'check1');
assert.equal(state().feedback, 'allLetters');
for (const [gift, person] of [['book', 'ava'], ['mittens', 'noah'], ['cocoa', 'mia']]) {
  click('gift', gift);
  click('person', person);
}
click('action', 'check1');
expectScreen('reward');
click('action', 'continue');
click('action', 'watch');
await new Promise(resolve => setImmediate(resolve));
assert.equal(state().memoryReady, true);
for (const light of [...state().memory]) click('light', light);
expectScreen('reward');
click('action', 'continue');
for (const tray of [2, 5, 7]) click('tray', tray);
click('action', 'check3');
assert.equal(state().feedback, 'tryAgain');
click('tray', 2);
click('tray', 3);
click('action', 'check3');
expectScreen('reward');
click('action', 'continue');
for (const shape of ['tree', 'star', 'bell', 'moon', 'mitten']) click('sky', shape);
click('action', 'check4');
assert.equal(state().feedback, 'tryAgain');
click('action', 'clearSky');
for (const shape of ['bell', 'mitten', 'moon', 'star', 'tree']) click('sky', shape);
click('action', 'check4');
expectScreen('reward');
click('action', 'continue');
element('#lock-code').value = '0000';
submit('lock-form');
assert.equal(state().feedback, 'codeWrong');
element('#lock-code').value = [3, 1, 2, 0].map(i => state().digits[i]).join('');
submit('lock-form');
expectScreen('finish');
assert.match(element('#app').innerHTML, /&lt;b&gt;Star finder&lt;\/b&gt;/);
assert.equal(JSON.parse(storage.get('tle-missing-star-v1')).screen, 'finish');

listeners.get('click')({ target: { closest: selector => selector === '#lang-btn' ? {} : null } });
assert.equal(document.documentElement.lang, 'es');
assert.match(element('#app').innerHTML, /La estrella volvió/);
assert.match(element('#app').innerHTML, /&lt;b&gt;Star finder&lt;\/b&gt;/);
console.log('Missing Christmas Star QA passed: four puzzles, wrong answers, hints, final code, save, safe certificate and Spanish.');
