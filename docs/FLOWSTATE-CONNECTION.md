# FlowState connection and current-hosting workaround

## What works without new hosting

Use the existing direct provider and authenticated Work runtime. It already supports bounded Work lookup, proposed Work creation/update, approval, version checks, receipts and cancellation of pending proposals. No hosted FlowState service is needed for those operations. These are building blocks for the initial guided workflow, not a durable multi-agent or browser-execution system.

The runtime capability response explicitly distinguishes approved Work actions from background execution and browser control. The browser executor remains a separate implementation task. A FlowState health response must never turn these capabilities on.

## Connection diagnostic

Run with Node 24:

```
npm run flowstate:check -- --local
```

This checks the existing loopback service on port 8081. It reads health and only the HTTP status of an unauthenticated identity request. It sends no prompt, credentials, personal context or tool instruction, and does not modify the running service.

For George's eventual hosted endpoint, set server-side `FLOWSTATE_BASE_URL` to its HTTPS origin and run `npm run flowstate:check`. The report always marks `productionReady: false`: this diagnostic cannot prove execution, tenancy or cancellation. A zero exit code indicates only healthy connectivity and rejection of unauthenticated identity requests. No API key authentication contract is invented; upstream currently has session/CSRF authentication and needs a verified machine access path.

## Adapter preparation

The adapter remains pinned to upstream `baphled/FlowState` commit `40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d`. It bounds transport duration and total streamed bytes, reconstructs UTF-8 and SSE frames, rejects malformed/error events and refuses redirects. Secrets are never placed in the endpoint URL. Constructor headers are server-side only and must follow the actual deployed gateway authentication protocol.

An abort cancels the local reader. It does **not** certify that the upstream agent or its tools stopped: upstream `/api/chat` dispatch uses `context.WithoutCancel`. Do not label this full cancellation. Typed runtime events are untrusted data and are not automatically executable tool calls.

## Production activation work still required

1. Dedicated hosted service and isolated akilii agent/storage, with an agreed operating budget. Do not expose or mount the user's personal FlowState installation.
2. Verified backend-to-service authentication and server-derived user identity.
3. Owner-bound upstream run identifiers, two-user isolation and revocation tests.
4. A scoped read/propose tool bridge to the existing approval path. Runtime output cannot execute writes.
5. Explicit cancellation acknowledgement for actual work, durable event reconciliation and bounded cost/concurrency.
6. Real execution, interruption and recovery tests. Health and adapter unit tests are insufficient.

The current public application remains on its direct runtime. This preparation does not initialise a production FlowState agent, expose a laptop, create cloud infrastructure, or enable browser automation.
