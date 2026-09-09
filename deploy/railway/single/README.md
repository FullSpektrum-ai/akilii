# alpha.9 single-service Railway runtime

This profile exists for Railway environments where the account plan cannot provision the canonical three-service topology.

Runtime boundary inside one container:

- FullSpektrum gateway: public, listens on Railway `PORT`.
- FlowState: loopback only at `127.0.0.1:8080`, pinned to `40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d`.
- Ollama: loopback only at `127.0.0.1:11434`, with `qwen3:0.6b` baked into the alpha.9 qualification image.

`AKILII_FLOWSTATE_TOKEN` is mandatory and remains service-to-service only. This packaging profile does not change the canonical pluggable-runtime architecture.

For the connected Railway service, keep the GitHub source branch-following rather than commit-pinned. Changes under this directory are the deployment trigger so a release promotion on `main` builds the current alpha.9 bundle instead of replaying an older Railway snapshot.
