#!/bin/sh
set -e

MIGRATION_DIR="/app/migration"

echo "========================================"
echo "Starting container"
echo "========================================"

echo "Running migrations with advisory lock..."
cd "$MIGRATION_DIR"

bun run run-migrations.ts

cd /app

echo "Starting application..."
exec bun run dist/index.js