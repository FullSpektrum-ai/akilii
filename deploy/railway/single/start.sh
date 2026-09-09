#!/usr/bin/env bash
set -Eeuo pipefail

: "${AKILII_FLOWSTATE_TOKEN:?AKILII_FLOWSTATE_TOKEN is required}"

export OLLAMA_HOST=127.0.0.1:11434
export FLOWSTATE_BASE_URL=http://127.0.0.1:8080
export FLOWSTATE_AUTH_ENABLED=false
export XDG_CONFIG_HOME=/config
export XDG_DATA_HOME=/data
mkdir -p /data/flowstate

ollama serve >/tmp/ollama.log 2>&1 &
OLLAMA_PID=$!
FLOWSTATE_PID=""
GATEWAY_PID=""

cleanup() {
  set +e
  [[ -n "${GATEWAY_PID}" ]] && kill "${GATEWAY_PID}" 2>/dev/null
  [[ -n "${FLOWSTATE_PID}" ]] && kill "${FLOWSTATE_PID}" 2>/dev/null
  kill "${OLLAMA_PID}" 2>/dev/null
  wait 2>/dev/null
}
trap cleanup EXIT INT TERM

ready=0
for _ in $(seq 1 60); do
  if ollama list >/dev/null 2>&1; then ready=1; break; fi
  sleep 1
done
if [[ "$ready" != 1 ]]; then
  echo "Ollama did not become ready" >&2
  exit 1
fi

/app/flowstate serve --host 127.0.0.1 --port 8080 >/tmp/flowstate.log 2>&1 &
FLOWSTATE_PID=$!

ready=0
for _ in $(seq 1 60); do
  if curl -fsS http://127.0.0.1:8080/health >/dev/null; then ready=1; break; fi
  if ! kill -0 "$FLOWSTATE_PID" 2>/dev/null; then
    cat /tmp/flowstate.log >&2 || true
    exit 1
  fi
  sleep 1
done
if [[ "$ready" != 1 ]]; then
  cat /tmp/flowstate.log >&2 || true
  echo "FlowState did not become ready" >&2
  exit 1
fi

node /app/runtime/gateway/server.mjs &
GATEWAY_PID=$!

# Exit the bundle if any critical process dies; Railway will restart it.
wait -n "$OLLAMA_PID" "$FLOWSTATE_PID" "$GATEWAY_PID"
exit 1
