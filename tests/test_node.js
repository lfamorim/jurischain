'use strict';

/**
 * JurisChain Node.js Native Addon - Integration Test
 */

const { Jurischain } = require('../bindings/node');

console.log('=== Node.js Addon Test ===');
console.log(`Node Version: ${process.version}\n`);

// Test 1: Constructor
console.log('[1] Testing constructor... ');
const challenge = new Jurischain(10, 'TestSeed');
console.log('OK');

// Test 2: readChallenge
console.log('[2] Testing readChallenge... ');
const hash = challenge.readChallenge();
if (typeof hash !== 'string' || hash.length !== 64) {
  console.error(`FAIL: expected 64-char hex string, got "${hash}" (len=${hash.length})`);
  process.exit(1);
}
console.log(`OK (hash=${hash})`);

// Test 3: solveStep (solve the challenge)
console.log('[3] Testing solveStep (solving)... ');
let tries = 0;
while (!challenge.solveStep()) {
  tries++;
  if (tries > 1000000) {
    console.error('FAIL: exceeded 1M tries');
    process.exit(1);
  }
}
tries++;
console.log(`OK (solved in ${tries} tries)`);

// Test 4: verify
console.log('[4] Testing verify... ');
const valid = challenge.verify();
if (valid !== true) {
  console.error(`FAIL: expected true, got ${valid}`);
  process.exit(1);
}
console.log('OK');

// Test 5: readChallenge (solution)
console.log('[5] Testing readChallenge (solution)... ');
const solution = challenge.readChallenge();
if (typeof solution !== 'string' || solution.length !== 64) {
  console.error(`FAIL: expected 64-char hex string, got "${solution}"`);
  process.exit(1);
}
console.log(`OK (solution=${solution})`);

// Test 6: challengeResponse (transfer solution)
console.log('[6] Testing challengeResponse + verify... ');
const challenge2 = new Jurischain(10, 'TestSeed');
const setResult = challenge2.challengeResponse(solution);
if (setResult !== true) {
  console.error(`FAIL: challengeResponse returned ${setResult}`);
  process.exit(1);
}
const verify2 = challenge2.verify();
if (verify2 !== true) {
  console.error(`FAIL: verify after challengeResponse returned ${verify2}`);
  process.exit(1);
}
console.log('OK');

// Test 7: Input validation - difficulty range
console.log('[7] Testing difficulty validation... ');
try {
  new Jurischain(0, 'TestSeed');
  console.error('FAIL: should have thrown');
  process.exit(1);
} catch (e) {
  console.log(`OK (caught: ${e.message})`);
}

// Test 8: Input validation - empty seed
console.log('[8] Testing empty seed validation... ');
try {
  new Jurischain(10, '');
  console.error('FAIL: should have thrown');
  process.exit(1);
} catch (e) {
  console.log(`OK (caught: ${e.message})`);
}

console.log('\n=== All Node.js tests passed! ===');
