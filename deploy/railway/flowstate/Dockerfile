# syntax=docker/dockerfile:1
# Railway build for the exact FlowState revision qualified by akilii alpha.9.
FROM golang:1.26.8-bookworm AS builder

ARG FLOWSTATE_SHA=40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN git clone --no-checkout https://github.com/baphled/FlowState.git /src \
    && cd /src \
    && git checkout "$FLOWSTATE_SHA" \
    && test "$(git rev-parse HEAD)" = "$FLOWSTATE_SHA"
WORKDIR /src
# Railway's CPU runtime can legitimately take >60s to cold-load even the 0.6B
# qualification model. Keep the upstream SHA pinned and apply only two guarded,
# deployment-local compatibility edits: a 5-minute first-header window and a
# two-thread / 2048-token Ollama request budget. If upstream changes either
# reviewed source shape, these guards fail the build instead of patching blindly.
RUN test "$(grep -c 'const DefaultResponseHeaderTimeout = 60 \* time.Second' internal/provider/shared/httpguard.go)" = "1" \
    && sed -i 's/const DefaultResponseHeaderTimeout = 60 \* time.Second/const DefaultResponseHeaderTimeout = 300 * time.Second/' internal/provider/shared/httpguard.go \
    && test "$(grep -c 'Tools:    ollamaTools,' internal/provider/ollama/ollama.go)" = "2" \
    && sed -i '/Tools:    ollamaTools,/a\            Options: map[string]any{"num_thread": 2, "num_ctx": 2048},' internal/provider/ollama/ollama.go \
    && gofmt -w internal/provider/shared/httpguard.go internal/provider/ollama/ollama.go \
    && grep -q 'DefaultResponseHeaderTimeout = 300 \* time.Second' internal/provider/shared/httpguard.go \
    && test "$(grep -c 'Options: map\[string\]any{" internal/provider/ollama/ollama.go)" = "2"
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOTOOLCHAIN=local
RUN --mount=type=cache,id=s/087ce0d7-52b4-4a22-8cd2-fbb9d69d33b5-/go/pkg/mod,target=/go/pkg/mod \
    --mount=type=cache,id=s/087ce0d7-52b4-4a22-8cd2-fbb9d69d33b5-/root/.cache/go-build,target=/root/.cache/go-build \
    go build -trimpath -ldflags "-s -w" -o /out/flowstate ./cmd/flowstate

FROM alpine:3.20
RUN addgroup -S -g 10001 flowstate \
    && adduser -S -u 10001 -G flowstate flowstate \
    && apk add --no-cache ca-certificates tzdata \
    && mkdir -p /data/flowstate /config/flowstate \
    && chown -R 10001:10001 /data /config
WORKDIR /app
COPY --from=builder /out/flowstate /app/flowstate
COPY --chown=10001:10001 deploy/flowstate/config/ /config/flowstate/
ENV XDG_CONFIG_HOME=/config \
    XDG_DATA_HOME=/data \
    FLOWSTATE_AUTH_ENABLED=false \
    OLLAMA_HOST=http://ollama.railway.internal:11434
EXPOSE 8080
USER flowstate
ENTRYPOINT ["/app/flowstate"]
CMD ["serve", "--host", "0.0.0.0", "--port", "8080"]
