#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "=== Formatting frontend ==="
cd frontend
npm install > /dev/null 2>&1
npx eslint . --fix
cd ..

echo ""
echo "=== Formatting backend ==="
docker compose exec backend ruff format .
docker compose exec backend ruff check --fix .

echo ""
echo "Done."
