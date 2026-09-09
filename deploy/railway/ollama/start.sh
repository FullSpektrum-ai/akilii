#!/bin/sh
set -eu

server_host="0.0.0.0:11434"
client_host="http://127.0.0.1:11434"
model="akilii-qwen3:0.6b"

export OLLAMA_HOST="$server_host"
export OLLAMA_KEEP_ALIVE="${OLLAMA_KEEP_ALIVE:--1}"
export OLLAMA_CONTEXT_LENGTH="${OLLAMA_CONTEXT_LENGTH:-2048}"
export OLLAMA_NUM_PARALLEL="${OLLAMA_NUM_PARALLEL:-1}"

ollama serve &
server_pid=$!

shutdown() {
  kill "$server_pid" 2>/dev/null || true
  wait "$server_pid" 2>/dev/null || true
}
trap shutdown INT TERM EXIT

ready=0
for i in $(seq 1 60); do
  if OLLAMA_HOST="$client_host" ollama list >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done

test "$ready" = 1

echo "alpha9_ollama_warmup_started model=$model"
OLLAMA_HOST="$client_host" ollama run "$model" "/no_think Reply only READY." >/tmp/alpha9-ollama-warmup.log 2>&1
echo "alpha9_ollama_ready model=$model"

wait "$server_pid"
