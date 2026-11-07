/* The old homepage photo story was retired by the owner. Validate its
 * replacement contract: focused offer, no duplicate booking panel, intact
 * product links, adjacent sections and responsive layouts. No submissions. */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
execFileSync(process.execPath, [fileURLToPath(new URL('./qa-connected-booking-flow.mjs', import.meta.url)), '--browser'], {
  stdio: 'inherit', env: process.env,
});
