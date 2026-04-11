<?php
/**
 * Verifies a JurisChain solution for E2E testing.
 * Args: <difficulty> <seed> <solution_hex>
 * Outputs JSON: { valid: true/false }
 */
$difficulty = (int)($argv[1] ?? 0);
$seed       = $argv[2] ?? '';
$solution   = $argv[3] ?? '';

if ($difficulty < 1 || empty($seed) || empty($solution)) {
    echo json_encode(['valid' => false, 'error' => 'missing arguments']) . "\n";
    exit(1);
}

$jc = new Jurischain($difficulty, $seed);
$jc->setResponse($solution);
$valid = $jc->verify();

echo json_encode([
    'valid'      => $valid,
    'difficulty' => $difficulty,
    'seed'       => $seed,
    'solution'   => $solution,
], JSON_PRETTY_PRINT) . "\n";
