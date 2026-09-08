# app/api

`app/api` contains akilii use-cases. It coordinates the pure domain rules in `app/core` with injected ports.

It does **not** know whether the caller is Supabase, Electron, a test or a future service. It does not know whether data lives in Postgres or SQLite and it does not know which AI provider is selected.

## Dependency direction

```text
transport / host
      ↓
adapters
      ↓
app/api
      ↓
app/core
```

Infrastructure is passed in. Product meaning never reaches upward from an adapter.

## Ports

The application layer uses a deliberately small set of capabilities:

- `contextRepository` — reads/writes governed personal context and proposals;
- `conversationRepository` — conversation history and append-only messages;
- `threadRepository` — optimistic Thread state;
- `workRepository` — approved Work persistence;
- `episodeRepository` — episode/outcome evidence;
- `conversationRuntime` — normalized text/voice execution boundary;
- `idFactory` and `clock` — deterministic IDs/time in tests.

Ports are structural JavaScript contracts. We do not introduce a framework or dependency-injection container.

## Rule

If a use-case can be understood without reading an adapter, the boundary is working.
