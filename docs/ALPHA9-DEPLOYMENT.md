# akilii alpha.9 deployment

alpha.9 is operational only when the private FlowState runtime, the FullSpektrum runtime gateway, the Supabase API and the application shell have all been qualified together. A successful container start is not the release gate.

## 1. Configure the private runtime

Requirements on the runtime host:

- Node.js 24
- Git
- Docker with Compose v2
- outbound access to `github.com` for the pinned FlowState source and to the selected model provider

Create the ignored runtime environment file:

```sh
cp deploy/flowstate/.env.example deploy/flowstate/.env
```

Set `AKILII_FLOWSTATE_TOKEN` to a random value of at least 32 characters and configure at least one provider key (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`). The token is the credential between the akilii backend and the runtime gateway; never expose it to the browser.

FlowState itself is private on the Compose network. Its browser-auth bundle is explicitly disabled with `FLOWSTATE_AUTH_ENABLED=false`; the FullSpektrum gateway is the authenticated external boundary. Do not publish FlowState port 8080.

## 2. Build and start the pinned runtime

The repository pins FlowState to:

`40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d`

Build-only verification:

```sh
npm run flowstate:build
```

Normal local/private startup:

```sh
npm run flowstate:up
```

That command prepares the alpha.9 agent/swarm manifests, verifies the exact upstream SHA, builds `flowstate-backend:alpha9-40e022bd4e0c`, starts FlowState and the gateway, waits for FlowState health and then verifies the gateway capability endpoint. The gateway binds to `127.0.0.1:8788` by default.

For a public TLS runtime host, set `FLOWSTATE_PUBLIC_HOST` and run:

```sh
npm run flowstate:up:public
```

Caddy is an opt-in Compose profile. It exposes the gateway only; FlowState remains private.

## 3. Prove a real provider-backed turn

Health is necessary but insufficient. Run:

```sh
npm run flowstate:smoke
```

The smoke test crosses the gateway, creates a FlowState session, applies the selected provider/model, posts a real message, polls the FlowState turn to completion and rejects silent model fallback or an empty response.

When `AKILII_SMOKE_MODEL_ID` and `AKILII_SMOKE_MODEL_PROVIDER` are not set, the script selects the alpha.9 OpenAI smoke model when `OPENAI_API_KEY` is configured, otherwise the alpha.9 Anthropic smoke model when `ANTHROPIC_API_KEY` is configured.

## 4. Supabase API

For a hosted runtime, set the application backend's `FLOWSTATE_BASE_URL` to the HTTPS gateway origin and `FLOWSTATE_SERVICE_TOKEN` to the same value as `AKILII_FLOWSTATE_TOKEN`. Apply outstanding migrations and deploy `akilii-api`. Neither value belongs in the Pages/browser build.

For local engineering, use the loopback gateway only from trusted server-side code. The browser must never receive the service token.

## 5. Public application shell

Merge only after the alpha.9 CI checks pass. The Pages workflow builds and tests the accepted source before publication. Verify the custom domain, build label, complete model selector, new-account fast start, NPR context removal, one OpenAI response, one Anthropic response, one Work proposal and the runtime capability endpoint. Preserve the rollback branch until the release gate passes.

## Release gate

Do not describe alpha.9 as fully operational until all of the following are green on the same candidate revision:

1. `npm run build`
2. `npm test`
3. desktop shared build and desktop tests
4. `npm run flowstate:up`
5. `npm run flowstate:smoke`
6. one authenticated request from the deployed akilii backend through the hosted gateway
7. one real Home/Chat/Work user journey returning the selected model and a completed FlowState turn

The runtime must report healthy, the gateway must remain Bearer-protected, FlowState must have no public port, and no fallback model may be substituted silently.
