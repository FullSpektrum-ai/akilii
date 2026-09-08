# app/adapters/http

This package is the transport boundary for the re-baselined `/api/v1` surface.

HTTP is deliberately boring. It may validate method/content type/body size, derive route parameters, call an injected application service and shape a response. It may not decide product policy, infer identity from request bodies, choose a memory model or expose provider/runtime internals.

## Security rules

- authenticated actor identity is injected by the deployment wrapper;
- any `subjectId`, `userId` or owner field supplied in JSON is ignored;
- non-empty JSON writes require `application/json`;
- request bodies are capped at 48 KiB at the transport boundary;
- unknown paths return 404 and known paths with the wrong method return 405;
- optimistic conflicts map to 409;
- raw provider/model/session internals never appear in HTTP payloads;
- chat streams normalized akilii runtime events only.

Supabase-specific authentication, beta access and CORS remain in the Edge composition wrapper, not this package.
