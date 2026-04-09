#!/bin/bash
set -euo pipefail

CMD="${1:-help}"

case "$CMD" in
  build)
    echo "=== Building ASM.js with Emscripten ==="
    docker compose --profile build run --rm build
    ;;
  serve)
    echo "=== Building & serving on http://localhost:8080 ==="
    docker compose up --build serve
    ;;
  test-php)
    echo "=== Building & testing PHP 8 extension ==="
    docker compose --profile test run --rm test-php
    ;;
  test-node)
    echo "=== Building & testing Node.js native addon ==="
    docker compose --profile test run --rm test-node
    ;;
  test-python)
    echo "=== Running Python smoke tests ==="
    docker compose --profile test run --rm test-python
    ;;
  test-asm)
    echo "=== Building & testing ASM.js CLI ==="
    docker compose --profile test run --rm test-asm
    ;;
  test)
    echo "╔══════════════════════════════════════╗"
    echo "║   JurisChain - Full Test Suite       ║"
    echo "╚══════════════════════════════════════╝"
    echo ""
    echo "─── [1/4] PHP 8 Extension ───"
    docker compose --profile test run --rm test-php
    echo ""
    echo "─── [2/4] Node.js Native Addon ───"
    docker compose --profile test run --rm test-node
    echo ""
    echo "─── [3/4] Python Smoke Tests ───"
    docker compose --profile test run --rm test-python
    echo ""
    echo "─── [4/4] ASM.js / Emscripten CLI ───"
    docker compose --profile test run --rm test-asm
    echo ""
    echo "╔══════════════════════════════════════╗"
    echo "║   All tests passed!                  ║"
    echo "╚══════════════════════════════════════╝"
    ;;
  clean)
    echo "=== Cleaning up ==="
    docker compose down --rmi local --volumes --remove-orphans 2>/dev/null || true
    rm -rf dist/
    ;;
  *)
    echo "Usage: $0 {build|serve|test|test-php|test-node|test-python|test-asm|clean}"
    echo ""
    echo "Commands:"
    echo "  build        Build ASM.js bundle via Emscripten"
    echo "  serve        Build + serve on http://localhost:8080"
    echo "  test         Run ALL tests (PHP, Node, Python, ASM)"
    echo "  test-php     Build & test PHP 8 extension"
    echo "  test-node    Build & test Node.js native addon"
    echo "  test-python  Run Python smoke tests"
    echo "  test-asm     Build & test ASM.js CLI"
    echo "  clean        Remove containers, images, and dist/"
    ;;
esac
