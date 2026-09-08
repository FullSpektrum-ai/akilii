# app/adapters

Adapters translate infrastructure into the small ports expected by `app/api`.

They may know about Postgres, SQLite, Supabase, OpenAI, Anthropic, Ollama, Electron or FlowState. They may **not** redefine product semantics.

## Rules

- map storage/provider/runtime shapes at the boundary;
- keep product IDs, lifecycle states and version semantics intact;
- fail explicitly when a capability is unavailable;
- never invent a successful write, tool result or runtime receipt;
- keep credentials inside the adapter/host boundary;
- make retries/idempotency visible rather than implicit;
- use the same repository contract tests for cloud and local implementations.

## Storage migration policy

The re-baseline is additive until parity is proven.

- existing `threads` are retained and adapted;
- legacy flat `memories` are read-only migration input;
- legacy `outcomes` (helpful/partial/unhelpful Thread ratings) remain migration input;
- canonical NPR, Episode, Intervention and outcome-evidence tables are added separately;
- no legacy table is dropped in the same change that introduces its replacement;
- export/delete must cover both legacy and canonical user-owned data during the migration window.

The product domain remains defined by `app/core`, not by a SQL table name.
