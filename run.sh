#!/bin/sh
set -e

MIGRATION_DIR="/app/migration"

echo "========================================"
echo "Starting container"
echo "========================================"

if [ -d "$MIGRATION_DIR" ]; then
  echo "Running migrations with advisory lock..."
  cd "$MIGRATION_DIR"

  bun run run-migrations.ts

  cd /app

  echo "Cleaning up migration files..."
  rm -rf "$MIGRATION_DIR"
fi

echo "Starting application..."
exec bun run dist/index.js