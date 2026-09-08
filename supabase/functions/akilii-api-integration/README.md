# akilii-api-integration

Parallel production-integration Edge composition for the clean V0.1 stack.

This function is intentionally separate from both the live legacy `akilii-api` and the R7 transport-review `akilii-api-v1`. It exists so production integration can be tested without mutating either rollback path.

## Boundary

The function owns deployment concerns only:

- Supabase bearer authentication and beta access;
- exact-origin CORS;
- Postgres connection construction;
- explicit provider/model configuration;
- wiring the clean application services, strict repositories and HTTP transport.

It does not define NPR, Thread, Work, ConversationPolicy or provider-specific personalities.

## Capabilities

- text Chat only when an explicit text provider + model + key are configured;
- Voice only when an explicit Realtime model + OpenAI key are configured;
- Voice transcript retries are available independently of live Voice capability;
- FlowState remains unqualified and receives no traffic;
- no provider fallback;
- no automatic local/cloud sync.

The live production function is not retired until this composition passes deployment rehearsal and acceptance smoke tests.
