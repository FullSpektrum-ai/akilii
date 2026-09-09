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
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOTOOLCHAIN=local
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
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
