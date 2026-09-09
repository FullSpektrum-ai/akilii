# akilii alpha.9 deployment

This release has three independently verifiable parts: the private FlowState
runtime, the Supabase API, and the GitHub Pages shell. Deploy in that order so
the public application never advertises an unavailable runtime.

## 1. Private FlowState runtime

Build the pinned `baphled/FlowState` revision documented in the repository and
tag its backend image as `flowstate-backend:latest`. In this repository run:

```sh
npm run flowstate:prepare
cd deploy/flowstate
cp .env.example .env
```

Set a dedicated runtime hostname and generate three different random values for
`FLOWSTATE_AUTH_SECRET`, `FLOWSTATE_AUTH_CSRF_KEY`, and
`AKILII_FLOWSTATE_TOKEN`. Add the provider keys on the server only. Point the
runtime hostname to the host, permit inbound TCP 80/443, then run:

```sh
docker compose up -d --build
curl --fail https://RUNTIME_HOST/health
curl --fail -H "Authorization: Bearer $AKILII_FLOWSTATE_TOKEN" https://RUNTIME_HOST/v1/capabilities
```

The public proxy exposes only health and the authenticated bounded gateway.
FlowState itself has no published port. The gateway hashes the akilii subject,
keeps users in separate upstream sessions, enforces an agent/swarm allowlist,
and rejects silent model fallback.

## 2. Supabase API

Set `FLOWSTATE_BASE_URL` to the HTTPS runtime origin and
`FLOWSTATE_SERVICE_TOKEN` to the matching gateway token. Apply outstanding
migrations, deploy `akilii-api`, and verify database advisors. Do not put either
secret in the Pages build.

## 3. Public shell

Merge the accepted alpha.9 branch to `main`. The Pages workflow builds and
tests the exact source before publication. Verify the custom domain, build
label, complete model selector, new-account fast start, NPR context removal,
one GPT response, one Claude response, one Work proposal and the runtime
capability endpoint. Preserve the existing rollback branch until all checks
pass.

## Release gate

Do not describe the combined system as operational until a real request has
crossed all three deployed boundaries and returned the selected model, a
completed FlowState turn and the expected humanistic akilii response.
