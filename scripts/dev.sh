#!/usr/bin/env bash
# Stable local dev. Avoids EMFILE / broken route discovery on macOS.
set -euo pipefail
cd "$(dirname "$0")/.."

ulimit -n 65536 2>/dev/null || true
export WATCHPACK_POLLING=true
export CHOKIDAR_USEPOLLING=true
export WATCHPACK_POLLING_INTERVAL="${WATCHPACK_POLLING_INTERVAL:-1000}"

PORT="${PORT:-3020}"
HOST="${HOST:-127.0.0.1}"

# Free the port if we own the process (ignore failures)
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${PIDS}" ]]; then
    echo "Port $PORT in use by: $PIDS"
    echo "Kill it with: kill -9 $PIDS"
  fi
fi

exec npx next dev -H "$HOST" -p "$PORT" "$@"
