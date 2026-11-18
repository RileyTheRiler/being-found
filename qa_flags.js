/* Build-order and mode-policy regression. Node.js standard library only. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const js = fs.readFileSync('flags.js', 'utf8');
const html = fs.readFileSync('dist/index.html', 'utf8');
const flagPos = html.indexOf('src="flags.js?v=');
const patternPos = html.indexOf('src="patterns.js?v=');
assert(flagPos >= 0 && patternPos > flagPos, 'flags.js must precede overlay modules');
assert(fs.existsSync('dist/flags.js'), 'flags.js must ship in dist');

function boot(hostname, search = '') {
  const set = new Set();
  const body = { classList: { contains: value => set.has(value) } };
  const context = { window: {}, document: { body }, location: { hostname, search }, URLSearchParams };
  vm.runInNewContext(js, context, { filename: 'flags.js' });
  return { flags: context.window.BFFlags, set };
}
const normal = boot('example.com');
assert.equal(normal.flags.pilot, false);
assert.equal(normal.flags.guided, false);
assert.equal(normal.flags.dice, true);
assert.equal(normal.flags.heavyHold, true);
normal.set.add('cl-route');
assert.equal(normal.flags.guided, true);
for (const key of ['dice', 'heavyHold', 'moodSpeed', 'worldSwap', 'sealedLegacy'])
  assert.equal(normal.flags[key], false, key + ' must default off while guided');
normal.set.delete('cl-route');
assert.equal(normal.flags.dice, true, 'flags must respond to route exit');

const production = boot('example.com', '?bf_dice=1&bf_heavyHold=1');
production.set.add('cl-route');
assert.equal(production.flags.dice, false, 'public URL cannot reactivate dice');
assert.equal(production.flags.heavyHold, false, 'public URL cannot reactivate hold');

const local = boot('localhost', '?bf_dice=0&bf_heavyHold=0');
assert.equal(local.flags.dice, false);
assert.equal(local.flags.heavyHold, false);
const optIn = boot('127.0.0.1', '?bf_dice=1');
optIn.set.add('cl-route');
assert.equal(optIn.flags.dice, true, 'local-only override should work outside pilot');

const pilot = boot('localhost', '?pilot=1&bf_dice=1&bf_heavyHold=1');
assert.equal(pilot.flags.guided, true);
assert.equal(pilot.flags.pilot, true);
assert.equal(pilot.flags.dice, false, 'pilot must ignore local overrides');
assert.equal(pilot.flags.heavyHold, false, 'pilot must ignore local overrides');

console.log('8.5.2A flags: module order, dynamic route changes, local overrides, pilot isolation passed.');
