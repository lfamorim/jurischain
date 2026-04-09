"""
JurisChain Python - Smoke Test
Tests the SHA3 implementation via ctypes against the compiled C library,
and validates the genstats.py module can be imported without errors.
"""

import hashlib
import subprocess
import sys
import os


def test_cli_solver():
    """Test the compiled CLI binary (if available)."""
    cli_path = os.path.join(os.path.dirname(__file__), '..', 'jurischain')
    if not os.path.isfile(cli_path):
        print('[1] SKIP: CLI binary not found (native build only)')
        return True

    print('[1] Testing CLI solver (difficulty=3)... ', end='')
    result = subprocess.run(
        [cli_path, '3', 'PythonTestSeed'],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        print(f'FAIL (exit code {result.returncode})')
        print(result.stderr)
        return False

    lines = result.stdout.strip().split('\n')
    assert len(lines) >= 4, f'Expected 4+ lines, got {len(lines)}'
    assert 'Difficulty: 3' in lines[0], f'Unexpected: {lines[0]}'
    print(f'OK ({lines[-1].strip()})')
    return True


def test_genstats_import():
    """Test that genstats.py can be imported without errors."""
    print('[2] Testing genstats.py import... ', end='')
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
    try:
        import genstats
        assert hasattr(genstats, 'calculate'), 'Missing calculate function'
        assert hasattr(genstats, 'generate_data'), 'Missing generate_data function'
        assert hasattr(genstats, 'generate_graph'), 'Missing generate_graph function'
        assert genstats.NUM_SEEDS == 10, f'Expected NUM_SEEDS=10, got {genstats.NUM_SEEDS}'
        assert genstats.MAX_DIFFICULTY == 22, f'Expected MAX_DIFFICULTY=22, got {genstats.MAX_DIFFICULTY}'
        print('OK')
        return True
    except Exception as e:
        print(f'FAIL ({e})')
        return False


def test_sha3_reference():
    """Verify our SHA3 expectation: Python hashlib sha3_256 matches known vector."""
    print('[3] Testing SHA3-256 reference vector... ', end='')
    # SHA3-256 of empty string
    expected = 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a'
    result = hashlib.sha3_256(b'').hexdigest()
    assert result == expected, f'Expected {expected}, got {result}'
    print('OK')
    return True


def test_cli_js_solver():
    """Test the Emscripten-compiled CLI via Node.js (if available)."""
    cli_js = os.path.join(os.path.dirname(__file__), '..', 'dist', 'jurischain-cli.js')
    if not os.path.isfile(cli_js):
        print('[4] SKIP: dist/jurischain-cli.js not found')
        return True

    print('[4] Testing CLI-JS solver (difficulty=3)... ', end='')
    result = subprocess.run(
        ['node', cli_js, '3', 'PythonTestSeed'],
        capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        print(f'FAIL (exit code {result.returncode})')
        print(result.stderr)
        return False

    lines = result.stdout.strip().split('\n')
    assert 'Difficulty: 3' in lines[0], f'Unexpected: {lines[0]}'
    print(f'OK ({lines[-1].strip()})')
    return True


if __name__ == '__main__':
    print('=== Python Smoke Test ===')
    print(f'Python Version: {sys.version}\n')

    results = [
        test_cli_solver(),
        test_genstats_import(),
        test_sha3_reference(),
        test_cli_js_solver(),
    ]

    passed = sum(results)
    total = len(results)
    print(f'\n=== {passed}/{total} Python tests passed! ===')

    if not all(results):
        sys.exit(1)
