# flowstate

Private Railway service. Do not assign a public domain.

Builds the exact alpha.9-qualified FlowState revision `40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d` and copies the FullSpektrum-owned alpha.9 agent/swarm configuration into `/config/flowstate`.

Required environment:

- `FLOWSTATE_AUTH_ENABLED=false`
- `OLLAMA_HOST=http://ollama.railway.internal:11434`

Listens on port `8080`.

## Railway source refresh

The production service is connected to `FullSpektrum-ai/akilii` and watches this directory. This marker intentionally refreshes Railway from current `main` after the alpha.9 runtime patch was corrected, so qualification runs against the current repository state rather than a stale deployment snapshot.
