# akilii alpha.9 Railway runtime

This directory packages the already-qualified alpha.9 runtime for Railway without changing the product/runtime contract.

Topology:

- `ollama` — private model service with `qwen3:0.6b` baked into the image for alpha.9 qualification.
- `flowstate` — private pinned FlowState service built from `40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d` with the FullSpektrum-owned agent/swarm configuration.
- `gateway` — public FullSpektrum service boundary using `runtime/gateway/Dockerfile`; it talks to `flowstate.railway.internal:8080` and requires `AKILII_FLOWSTATE_TOKEN` on `/v1/*`.

Only `gateway` should receive a public domain. Do not expose FlowState or Ollama directly.

The live Supabase `akilii-api` activates hosted FlowState only when both `FLOWSTATE_BASE_URL` and `FLOWSTATE_SERVICE_TOKEN` are configured. Until then, the existing direct provider path remains the rollback path.
