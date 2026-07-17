#!/bin/sh
set -e

HASH_FILE="/app/node_modules/.package-json-hash"
CURRENT_HASH=$(md5sum /app/package.json | cut -d' ' -f1)
STORED_HASH=""

if [ -f "$HASH_FILE" ]; then
  STORED_HASH=$(cat "$HASH_FILE")
fi

if [ ! -d "/app/node_modules/vite" ] || [ "$CURRENT_HASH" != "$STORED_HASH" ]; then
  echo "Installing dependencies..."
  npm ci
  echo "$CURRENT_HASH" > "$HASH_FILE"
fi

exec "$@"
