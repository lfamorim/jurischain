<?php
/**
 * Generates a JurisChain challenge for E2E testing.
 * Outputs JSON: { seed, difficulty, challenge }
 */
$difficulty = (int)($argv[1] ?? 2);
$rawSeed = $argv[2] ?? bin2hex(random_bytes(16));

$jc = new Jurischain($difficulty, $rawSeed);
$challenge = $jc->getChallenge();

echo json_encode([
    'seed'       => $rawSeed,
    'difficulty'  => $difficulty,
    'challenge'  => $challenge,
], JSON_PRETTY_PRINT) . "\n";
