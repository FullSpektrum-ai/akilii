# Security boundary

- `ollama` and `flowstate` stay private on Railway private networking.
- Upstream FlowState browser authentication is disabled only on that private service network.
- The FullSpektrum `gateway` is the only public service and requires `Authorization: Bearer <AKILII_FLOWSTATE_TOKEN>` for `/v1/*`.
- `/health` contains no user data and is intentionally unauthenticated for infrastructure health checks.
- The token is service-to-service only. Do not expose it to the browser or commit it to the repository.
