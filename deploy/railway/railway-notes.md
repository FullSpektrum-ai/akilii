# Railway service settings

Production project: `akilii-alpha9-runtime`

Service build paths:

- `ollama`: `deploy/railway/ollama/Dockerfile`
- `flowstate`: `deploy/railway/flowstate/Dockerfile`
- `gateway`: `deploy/railway/gateway/Dockerfile`

Private service URLs:

- FlowState: `http://flowstate.railway.internal:8080`
- Ollama: `http://ollama.railway.internal:11434`

Gateway environment:

- `FLOWSTATE_BASE_URL=http://flowstate.railway.internal:8080`
- `AKILII_FLOWSTATE_TOKEN=<service secret>`

FlowState environment:

- `FLOWSTATE_AUTH_ENABLED=false`
- `OLLAMA_HOST=http://ollama.railway.internal:11434`

Only the gateway should be assigned a public HTTPS domain. The same gateway token must be configured in Supabase as `FLOWSTATE_SERVICE_TOKEN`, with the public gateway origin as `FLOWSTATE_BASE_URL`.
