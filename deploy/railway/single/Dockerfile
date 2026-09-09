# syntax=docker/dockerfile:1
# Free-plan alpha.9 hosting bundle.
# Public: FullSpektrum gateway only. Private inside this container: FlowState + Ollama.
FROM golang:1.26.8-bookworm AS flowstate-builder

ARG FLOWSTATE_SHA=40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN git clone --no-checkout https://github.com/baphled/FlowState.git /src \
    && cd /src \
    && git checkout "$FLOWSTATE_SHA" \
    && test "$(git rev-parse HEAD)" = "$FLOWSTATE_SHA"
WORKDIR /src
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOTOOLCHAIN=local
RUN --mount=type=cache,id=alpha9-single-go-mod,target=/go/pkg/mod \
    --mount=type=cache,id=alpha9-single-go-build,target=/root/.cache/go-build \
    go build -trimpath -ldflags "-s -w" -o /out/flowstate ./cmd/flowstate

FROM ollama/ollama:0.33.1
USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends bash ca-certificates curl nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && node -e "const m=Number(process.versions.node.split('.')[0]); if (m < 18) process.exit(1)"

WORKDIR /app
COPY --from=flowstate-builder /out/flowstate /app/flowstate
COPY deploy/flowstate/config/ /config/flowstate/
COPY backend/flowstate.js /app/backend/flowstate.js
COPY runtime/flowstate-client.mjs /app/runtime/flowstate-client.mjs
COPY runtime/gateway/server.mjs /app/runtime/gateway/server.mjs
COPY deploy/railway/single/start.sh /app/start.sh

ENV XDG_CONFIG_HOME=/config \
    XDG_DATA_HOME=/data \
    FLOWSTATE_AUTH_ENABLED=false \
    OLLAMA_HOST=http://127.0.0.1:11434 \
    FLOWSTATE_BASE_URL=http://127.0.0.1:8080

RUN mkdir -p /data/flowstate /root/.ollama \
    && chmod 0755 /app/start.sh \
    && OLLAMA_HOST=127.0.0.1:11434 bash -euxo pipefail -c '\
      ollama serve >/tmp/ollama-build.log 2>&1 & pid=$!; \
      ready=0; \
      for i in $(seq 1 60); do \
        if ollama list >/dev/null 2>&1; then ready=1; break; fi; \
        sleep 1; \
      done; \
      test "$ready" = 1; \
      ollama pull qwen3:0.6b; \
      kill "$pid"; \
      wait "$pid" || true'

EXPOSE 8788
ENTRYPOINT ["/app/start.sh"]
