#!/bin/sh
set -eu

export OLLAMA_HOST="0.0.0.0:11434"
export OLLAMA_KEEP_ALIVE="${OLLAMA_KEEP_ALIVE:--1}"
export OLLAMA_CONTEXT_LENGTH="${OLLAMA_CONTEXT_LENGTH:-2048}"
export OLLAMA_NUM_PARALLEL="${OLLAMA_NUM_PARALLEL:-1}"

echo "alpha9_ollama_server_starting"
exec ollama serve
