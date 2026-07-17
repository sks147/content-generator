#!/bin/sh
set -e

if [ ! -d "/app/node_modules/uWebSockets.js" ]; then
  echo "node_modules missing or incomplete — running npm ci..."
  npm ci
fi

if [ ! -d "/shared/node_modules/@modelcontextprotocol" ]; then
  echo "shared node_modules missing — running npm ci..."
  cd /shared && npm ci && cd /app
fi

exec "$@"
