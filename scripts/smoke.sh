#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PORT:-}" ]]; then
  PORT="$(node -e "const net=require('node:net'); const server=net.createServer(); server.listen(0,'127.0.0.1',()=>{console.log(server.address().port); server.close();});")"
fi
BASE_URL="http://127.0.0.1:${PORT}/reference-photo-organizer/"
STAGE_DIR="tmp/pages"

npm run build
rm -rf "${STAGE_DIR}"
mkdir -p "${STAGE_DIR}/reference-photo-organizer"
cp -R docs/. "${STAGE_DIR}/reference-photo-organizer/"

npx http-server "${STAGE_DIR}" -a 127.0.0.1 -p "${PORT}" -c-1 >/tmp/reference-photo-organizer-smoke.log 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "${SERVER_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in {1..40}; do
  if curl -fsS "${BASE_URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

curl -fsS "${BASE_URL}" >/dev/null
PLAYWRIGHT_BASE_URL="${BASE_URL}" npx playwright test --project=chromium
