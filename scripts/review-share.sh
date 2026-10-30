#!/usr/bin/env bash
# Temporary public review tunnel for RADR demo (fictional data only).
# Usage: bash scripts/review-share.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-3036}"
mkdir -p .tmp/review

# Free port if we own it
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "${PIDS}" ]]; then
    kill -9 ${PIDS} 2>/dev/null || true
  fi
fi

export PORT HOST=127.0.0.1 NEXT_PUBLIC_RADR_ENV=DEMO
nohup npm run dev > .tmp/review/next.log 2>&1 &
echo $! > .tmp/review/next.pid

echo "Starting RADR review server on http://127.0.0.1:${PORT} (DEMO mode)..."
for _ in $(seq 1 60); do
  if curl -s -o /dev/null "http://127.0.0.1:${PORT}/app"; then
    echo "Review server ready."
    break
  fi
  sleep 2
done

echo "Opening public tunnel (Cloudflare quick tunnel)..."
nohup npx cloudflared tunnel --url "http://127.0.0.1:${PORT}" > .tmp/review/tunnel.log 2>&1 &
echo $! > .tmp/review/tunnel.pid

PUBLIC_URL=""
for _ in $(seq 1 30); do
  PUBLIC_URL="$(rg -o 'https://[a-z0-9-]+\.trycloudflare\.com' .tmp/review/tunnel.log | head -1 || true)"
  if [[ -n "${PUBLIC_URL}" ]]; then
    break
  fi
  sleep 2
done

if [[ -z "${PUBLIC_URL}" ]]; then
  echo "Tunnel failed. See .tmp/review/tunnel.log"
  exit 1
fi

cat > .tmp/review/urls.txt <<EOF
Public product demo: ${PUBLIC_URL}/app
Public marketing home: ${PUBLIC_URL}/en
Public product page: ${PUBLIC_URL}/en/product

Local only: http://127.0.0.1:${PORT}/app
EOF

echo ""
echo "Share these URLs with your reviewer:"
echo "  Product demo:  ${PUBLIC_URL}/app"
echo "  Marketing:     ${PUBLIC_URL}/en"
echo ""
echo "Keep this terminal open. Press Ctrl+C to stop tunnel + server."
echo "Logs: .tmp/review/next.log · .tmp/review/tunnel.log"

wait
