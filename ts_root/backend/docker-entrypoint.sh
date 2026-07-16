#!/bin/sh
set -e

if [ ! -d "/app/node_modules/uWebSockets.js" ]; then
  echo "node_modules missing or incomplete — running npm ci..."
  npm ci
fi

exec "$@"
