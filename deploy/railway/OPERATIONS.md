# Operations

Release checks for the hosted alpha.9 runtime:

1. `GET /health` on the public gateway returns HTTP 200 and `{ "status": "ok" }`.
2. `GET /v1/capabilities` with the service bearer token returns `status: ready` and routes `orient`, `shape`, `work`, `reflect`.
3. `POST /v1/generate` with `provider: ollama`, `model.id: qwen3:0.6b`, and route `orient` returns non-empty content.
4. FlowState and Ollama have no public domains.
5. Supabase activates the hosted path only after `FLOWSTATE_BASE_URL` and `FLOWSTATE_SERVICE_TOKEN` are configured together.
