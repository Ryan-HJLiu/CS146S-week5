@@ -0,0 +1,42 @@
#!/usr/bin/env bash

set -euo pipefail

find_available_port() {
  local port=3000

  # Keep the preferred port range predictable for local development.
  while lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1; do
    port=$((port + 1))
  done

  printf '%s\n' "$port"
}

PORT="${PORT:-$(find_available_port)}"
export PORT
OPEN_CMD="${OPEN_CMD:-open}"

cleanup() {
  if [[ -n "${server_pid:-}" ]] && kill -0 "$server_pid" >/dev/null 2>&1; then
    kill "$server_pid" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

pnpm exec next dev -p "$PORT" &
server_pid=$!

until curl -fsS "http://127.0.0.1:$PORT" >/dev/null 2>&1; do
  if ! kill -0 "$server_pid" >/dev/null 2>&1; then
    wait "$server_pid"
    exit $?
  fi

  sleep 0.2
done

"$OPEN_CMD" "http://localhost:$PORT"

wait "$server_pid"
