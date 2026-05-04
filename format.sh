#!/usr/bin/env bash
set -euo pipefail

echo "=== Formatting frontend ==="
cd "$(dirname "$0")/frontend"
npm install > /dev/null 2>&1
npx eslint . --fix

echo ""
echo "=== Formatting backend ==="
cd ../backend
if command -v python3 &> /dev/null; then
  if python3 -m ruff --version &> /dev/null; then
    python3 -m ruff format .
    python3 -m ruff check --fix .
  else
    echo "Ruff not installed. Install in Docker: docker-compose exec backend pip install ruff"
  fi
else
  echo "Python not found. Format backend in Docker: docker-compose exec backend ruff format ."
fi

echo ""
echo "Done."
