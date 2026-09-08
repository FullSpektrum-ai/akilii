# app/core

`app/core` is the smallest, most stable part of akilii.

It contains **product meaning**, not infrastructure. Everything here must run identically in a browser test, a Supabase function, Electron, or a local Node process.

## Allowed

- pure JavaScript and JSDoc types;
- deterministic functions;
- immutable/plain data contracts;
- explicit validation;
- context selection and policy compilation;
- state-transition rules.

## Forbidden

- `fetch`, provider SDKs or network calls;
- Supabase, Postgres or SQLite clients;
- Electron or filesystem APIs;
- DOM globals such as `window` or `document`;
- environment variables;
- analytics side effects;
- model calls;
- hidden persistence.

## Modules

- `context.js` — governed NPR/context items and bounded Context Projection.
- `support.js` — compiles a situation-specific `SupportProfile` from an approved projection.
- `conversation.js` — combines the stable conversation constitution with dynamic support policy and modality rules.
- `state.js` — Thread, Work, Episode and Outcome state contracts/transitions.
- `execution.js` — creates engine-neutral execution specifications; it does not know FlowState.
- `index.js` — public exports for the core package.

## Authority order

When instructions conflict, the system resolves them in this order:

1. safety / AIMS policy;
2. the user's current explicit request;
3. the user's explicit session choice;
4. current activity and objective;
5. confirmed purpose-eligible NPR context;
6. bounded evidence-backed observations;
7. safe product defaults.

This is implemented in code and regression tested. Models do not choose which source of personal context outranks another.

## Context rule

The runtime never receives the whole person. A request produces the smallest useful context projection for a declared purpose. Restricted, expired, unconfirmed or disallowed context is excluded before any provider/runtime adapter sees it.

## Learning rule

Conversation history and model observations are evidence sources, not durable personal truth. A model may propose a learning candidate. Durable context requires the lifecycle rules owned outside the provider adapter.

## Review rule

Keep modules boring and readable. Prefer named functions, explicit data and small composition over clever metaprogramming. A reviewer should understand a module without reading infrastructure code first.
