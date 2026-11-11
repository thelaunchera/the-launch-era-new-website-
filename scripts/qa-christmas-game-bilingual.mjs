import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';

const source = fs.readFileSync(new URL('../public/games/navidad/index.html', import.meta.url), 'utf8');
assert.match(source, /The Great Christmas Game/);
assert.match(source, /game-language--setup/);
assert.match(source, /Roll the dice/);
assert.match(source, /id="playerChoices"/);
assert.match(source, /const EVENTS=/);
assert.match(source, /function finishGame/);
const errors = [];
const debug = new VirtualConsole();
debug.on('jsdomError', error => { errors.push(error.message); });
const tick = (ms = 40) => new Promise(resolve => setTimeout(resolve, ms));
function openGame(state = null, language = 'es') {
  const dom = new JSDOM(source, {
    url: 'https://thelaunchera.com/games/navidad/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: debug,
    beforeParse(window) {
      window.HTMLElement.prototype.scrollTo = function() {};
      window.Math.random = () => 0.02;
      if (state) window.localStorage.setItem('tle-xmas-board-v2', JSON.stringify(state));
      window.localStorage.setItem('tle-xmas-game-locale', language);
    }
  });
  return { dom, window: dom.window, document: dom.window.document };
}
const game = openGame();
await tick();
const { document: d, window: w } = game;
assert.equal(d.documentElement.lang, 'es');
for (const n of [1, 2, 3, 4]) {
  d.querySelector('#playerChoices [data-n="' + n + '"]').click();
  await tick();
  assert.equal(d.querySelectorAll('#nameFields input').length, n, 'player input count must match selected count');
  assert.equal(d.querySelector('#playerSelectionStatus').textContent.startsWith(String(n)), true);
}
d.querySelector('#setupOverlay .game-language [data-lang="en"]').click();
await tick();
assert.equal(d.documentElement.lang, 'en');
assert.equal(d.querySelector('#startBtn').textContent, '🎲 Start playing!');
assert.equal(d.querySelector('#playerSelectionStatus').textContent, '4 players selected');
assert.equal(d.querySelectorAll('#nameFields input').length, 4);
assert.equal(d.querySelector('#nameFields input:nth-child(1)') === null, true);
d.querySelector('#startBtn').click();
await tick();
assert.equal(d.querySelector('#setupOverlay').hidden, true);
assert.equal(d.querySelectorAll('.player-list .player').length, 4);
assert.equal(d.querySelector('#rollBtn').textContent, '🎲 Roll the dice');
d.querySelector('#rollBtn').click();
await tick(1500);
assert.equal(d.querySelector('#roundLabel').textContent, 'Round 1');
assert.equal(d.querySelectorAll('.token').length, 4);
assert.equal(d.querySelector('#rollBtn').disabled, false);
d.querySelector('.top-actions .game-language [data-lang="es"]').click();
await tick();
assert.equal(d.documentElement.lang, 'es');
assert.equal(d.querySelector('#rollBtn').textContent, '🎲 Tirar el dado');
assert.equal(d.querySelectorAll('.token').length, 4);
game// Keep the jsdom window open until all gameplay assertions finish.

const saved = {
  version: 2,
  players: [{name: 'Santa', position: 11, skip: 0, rolls: 0}],
  current: 0, round: 1, rolls: 0, extra: false,
  over: false, lastDie: 1, message: '¡Tira el dado para comenzar la aventura!'
};
const quiz = openGame(saved, 'en');
await tick();
const q = quiz.document;
q.querySelector('#resumeBtn').click();
await tick();
assert.equal(q.querySelector('#setupOverlay').hidden, true);
q.querySelector('#rollBtn').click();
await tick(1100);
assert.equal(q.querySelector('#eventOverlay').hidden, false, 'quiz must appear on square 13');
assert.match(q.querySelector('#eventBody').textContent, /Which animal pulls Santa/);
assert.equal(q.querySelector('#answerChoices .answer').textContent, 'Reindeer');
q.querySelector('#answerChoices .answer').click();
await tick();
assert.match(q.querySelector('#eventBody').textContent, /Correct!/);
q.querySelector('#eventContinue').click();
await tick(950);
assert.equal(q.querySelector('#eventOverlay').hidden, true);
quiz// Keep the jsdom window open until all gameplay assertions finish.

const victoryState = {...saved, players:[{name:'Santa',position:41,skip:0,rolls:0}]};
const victory = openGame(victoryState, 'en');
await tick();
victory.document.querySelector('#resumeBtn').click();
victory.document.querySelector('#rollBtn').click();
await tick(1250);
assert.equal(victory.document.querySelector('#winOverlay').hidden, false);
assert.match(victory.document.querySelector('#winTitle').textContent, /North Pole!/);
victory// Keep the jsdom window open until all gameplay assertions finish.
assert.deepEqual(errors, [], 'No uncaught browser scripting errors');
console.log('Christmas game bilingual QA passed: 1–4 players, ES/EN, turns, dice, quiz, resume and victory.');
// Stop this stand-alone QA process after assertions, without closing windows while timer callbacks are pending.
process.exit(0);
