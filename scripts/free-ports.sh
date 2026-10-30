#!/usr/bin/env bash
# Free stuck Next.js ports (run in your own Terminal.app if agent cannot kill).
set -euo pipefail
for port in 3020 3030 3040; do
  pids="$(lsof -t -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "Killing $pids on :$port"
    kill -9 $pids || true
  else
    echo ":$port free"
  fi
done
echo "Done. Then: cd $(dirname "$0")/.. && npm run dev"
