# Alpha.9 hosted qualification model. The small model is baked into the image so
# the service can start without a first-request model download or external API key.
FROM ollama/ollama:0.33.1

RUN OLLAMA_HOST=127.0.0.1:11434 sh -euxc '\
  ollama serve >/tmp/ollama-build.log 2>&1 & pid=$!; \
  ready=0; \
  for i in $(seq 1 30); do \
    if ollama list >/dev/null 2>&1; then ready=1; break; fi; \
    sleep 1; \
  done; \
  test "$ready" = 1; \
  ollama pull qwen3:0.6b; \
  kill "$pid"; \
  wait "$pid" || true'

ENV OLLAMA_HOST=0.0.0.0:11434
EXPOSE 11434
CMD ["serve"]
