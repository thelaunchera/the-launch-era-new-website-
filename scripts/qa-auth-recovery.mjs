/**
 * The Launch Era | reusable Command Center password recovery release guard.
 * No credentials, customer records, or live recovery tokens are used.
 * Must pass before a client release and after the website build.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const built = process.argv.includes('--built');
const root = built ? '.output/public/' : 'public/';
const read = (name) => readFileSync(root + name, 'utf8');
const verify = (label, test) => {
  try { test(); console.log('PASS — ' + label); }
  catch (error) { console.error('FAIL — ' + label + ': ' + error.message); process.exitCode = 1; }
};

verify('Recovery page is present and has a real password form', () => {
  const page = read('auth-recovery.html');
  assert.match(page, /id="passwordForm"/);
  assert.match(page, /id="save"/);
  assert.match(page, /auth\.onAuthStateChange/);
  assert.match(page, /PASSWORD_RECOVERY/);
  assert.match(page, /auth\.updateUser\(\{password\}\)/);
  assert.match(page, /new URLSearchParams\(location\.hash\.slice\(1\)\)/);
  assert.match(page, /hasRecoveryCode/);
  assert.match(page, /location\.pathname/);
  assert.match(page, /noindex,nofollow/);
  assert.match(page, /no-referrer/);
});

verify('Recovery page stays tenant-neutral, without a former client URL', () => {
  const page = read('auth-recovery.html');
  assert.doesNotMatch(page, /cb[- ]depot|cj403|chrisj403|\?app=cb-depot/i);
  assert.match(page, /id="signinLink"[^>]*href="\/command-center\/"/);
  assert.match(page, /Back to sign in/);
  assert.doesNotMatch(page, /console\.(?:log|info)\([^\n]*(?:access_token|refresh_token|password)/);
});

verify('Recovery works with the extensionless URL and preserves fragments', () => {
  const alias = read('auth-recovery/index.html');
  assert.match(alias, /\/auth-recovery\.html/);
  assert.match(alias, /location\.search\+location\.hash/);
});

verify('Command Center password resets always target the deployed recovery page', () => {
  const app = read('command-center/assets/command-center-app.js');
  const calls = [...app.matchAll(/resetPasswordForEmail\(/g)].length;
  const good = [...app.matchAll(/resetPasswordForEmail\([^\n]*redirectTo:new URL\('\/auth-recovery\.html',location\.origin\)\.href/g)].length;
  assert(calls >= 2, 'Expected customer and settings reset entry points');
  assert.equal(good, calls, 'Every reset entry point must use the deployed recovery URL');
  assert.doesNotMatch(app, /resetPasswordForEmail\([^\n]*redirectTo:location\.origin\+location\.pathname/);
});

verify('Alternate private client sign-in is generic and uses the same route', () => {
  const access = read('command-center/access.html');
  assert.match(access, /resetPasswordForEmail\([^\n]*redirectTo:new URL\('\/auth-recovery\.html',location\.origin\)\.href/);
  assert.match(access, /\.\/\?from=private-access/);
  assert.doesNotMatch(access, /redirectTo:location\.origin\+'\/\?app=tle'/);
  const app = read('command-center/assets/command-center-app.js');
  assert.match(app, /get\('from'\)==='private-access'/);
  assert.match(app, /\$\('signup'\)\.classList\.add\('hidden'\)/);
});

verify('First-password enrollment is generic for every client', () => {
  const page = read('command-center/index.html');
  assert.match(page, /id="buyerPasswordSetup"/);
  assert.match(page, /PRIVATE ACCOUNT · SECURE ACCESS/);
  assert.doesNotMatch(page, /CB DEPOT · PRIVATE ACCOUNT/);
});

verify('Old app reset links keep recovery tokens rather than open marketing', () => {
  const legacy = read('cleaning-app/index.html');
  assert.match(legacy, /\/auth-recovery\.html/);
  assert.match(legacy, /location\.hash/);
  assert.match(legacy, /location\.search/);
  assert.doesNotMatch(legacy, /http-equiv="refresh"/);
});

if (!built) {
  verify('Former landing URLs redirect recovery traffic safely', () => {
    const rootRoute = readFileSync('src/routes/__root.tsx', 'utf8');
    assert.match(rootRoute, /tokenRecovery/);
    assert.match(rootRoute, /\/auth-recovery\.html/);
    assert.match(rootRoute, /location\.replace/);
  });
}

if (built) {
  verify('Production artifact contains the complete private sign-in system', () => {
    for (const path of [
      'auth-recovery.html',
      'auth-recovery/index.html',
      'command-center/index.html',
      'command-center/access.html',
      'command-center/assets/command-center-app.js',
      'command-center/vendor/supabase-js-v2.57.0.umd.js'
    ]) assert(existsSync(root + path), 'Missing deployed artifact: ' + path);
    assert.match(read('auth-recovery.html'), /Reset your password/);
  });
}
if (process.exitCode) console.error('Command Center recovery guard FAILED; publication must stop.');
else console.log('Command Center recovery guard passed (' + (built ? 'built artifact' : 'source') + ').');
