<?php
/**
 * JurisChain PHP Extension - Integration Test (OOP API)
 */

echo "=== PHP Extension Test ===\n";
echo "PHP Version: " . PHP_VERSION . "\n\n";

// Test 1: Constructor
echo "[1] Testing new Jurischain()... ";
$challenge = new Jurischain(10, "TestSeed");
assert($challenge instanceof Jurischain, "Should be a Jurischain instance");
echo "OK\n";

// Test 2: getChallenge (read challenge hash)
echo "[2] Testing getChallenge()... ";
$hash = $challenge->getChallenge();
assert(is_string($hash), "getChallenge() should return a string");
assert(strlen($hash) === 64, "Hash should be 64 hex characters, got " . strlen($hash));
echo "OK (hash=$hash)\n";

// Test 3: solve() (solve the challenge)
echo "[3] Testing solve() loop... ";
$tries = 0;
while (!$challenge->solve()) {
    $tries++;
    if ($tries > 1000000) {
        echo "FAIL (exceeded 1M tries)\n";
        exit(1);
    }
}
$tries++;
echo "OK (solved in $tries tries)\n";

// Test 4: verify()
echo "[4] Testing verify()... ";
$valid = $challenge->verify();
assert($valid === true, "verify() should return true after solving");
echo "OK\n";

// Test 5: getChallenge() after solving (read solution)
echo "[5] Testing getChallenge() (solution)... ";
$solution = $challenge->getChallenge();
assert(is_string($solution), "Solution should be a string");
assert(strlen($solution) === 64, "Solution should be 64 hex characters");
echo "OK (solution=$solution)\n";

// Test 6: setResponse() + verify (transfer solution to new instance)
echo "[6] Testing setResponse() + verify()... ";
$verifier = new Jurischain(10, "TestSeed");
$verifier->setResponse($solution);
$valid2 = $verifier->verify();
assert($valid2 === true, "verify() should return true for transferred solution");
echo "OK\n";

// Test 7: Input validation - difficulty range
echo "[7] Testing difficulty validation... ";
try {
    new Jurischain(0, "TestSeed");
    echo "FAIL (should have thrown)\n";
    exit(1);
} catch (ValueError $e) {
    echo "OK (caught: {$e->getMessage()})\n";
}

// Test 8: Input validation - empty seed
echo "[8] Testing empty seed validation... ";
try {
    new Jurischain(10, "");
    echo "FAIL (should have thrown)\n";
    exit(1);
} catch (ValueError $e) {
    echo "OK (caught: {$e->getMessage()})\n";
}

// Test 9: setResponse() validation - wrong length
echo "[9] Testing setResponse() hex length validation... ";
try {
    $bad = new Jurischain(10, "TestSeed");
    $bad->setResponse("ABCD");
    echo "FAIL (should have thrown)\n";
    exit(1);
} catch (ValueError $e) {
    echo "OK (caught: {$e->getMessage()})\n";
}

// Test 10: Seed length DoS protection
echo "[10] Testing seed max length validation... ";
try {
    new Jurischain(10, str_repeat("A", 2000));
    echo "FAIL (should have thrown)\n";
    exit(1);
} catch (ValueError $e) {
    echo "OK (caught: {$e->getMessage()})\n";
}

// Test 11: setResponse() rejects whitespace (no sscanf whitespace skip)
echo "[11] Testing setResponse() rejects whitespace... ";
try {
    $ws = new Jurischain(10, "TestSeed");
    $ws->setResponse(" F" . str_repeat("00", 31));
    echo "FAIL (should have thrown)\n";
    exit(1);
} catch (ValueError $e) {
    echo "OK (caught: {$e->getMessage()})\n";
}

// Test 12: setResponse() accepts lowercase hex
echo "[12] Testing setResponse() accepts lowercase hex... ";
$lc = new Jurischain(10, "TestSeed");
$lc->setResponse(strtolower($solution));
assert($lc->verify() === true, "lowercase hex should verify correctly");
echo "OK\n";

echo "\n=== All PHP tests passed! ===\n";
