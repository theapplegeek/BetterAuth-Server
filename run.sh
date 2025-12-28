#!/bin/sh
set -e

echo "========================================"
echo "Starting container"
echo "========================================"

echo "Running database migrations..."
if [ ! -d "/app/migration" ]; then
  echo "ERROR: /app/migration not found"
  exit 1
fi
cd /app/migration
bunx drizzle-kit migrate
echo ""
echo "Migrations completed successfully"

cd /app
echo "Cleaning up migration files..."
rm -rf /app/migration
echo "Cleanup completed"

echo "Starting application..."
exec bun run dist/index.js