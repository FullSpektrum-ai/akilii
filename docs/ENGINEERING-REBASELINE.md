# akilii engineering re-baseline — V0.1 foundation

Status: **canonical rebuild contract for `rebuild/v01-foundation`**

This branch exists to make the codebase easier to understand, review, test and operate before additional product capability is added. The goal is not a cosmetic refactor. It is a clean engineering baseline that preserves useful behaviour while removing prototype-era coupling.

## Engineering objective

A new engineer should be able to answer these questions within 30 minutes:

1. What is the product state?
2. What is canonical personal context?
3. How is a support decision made?
4. How does Chat differ from Voice without becoming a different intelligence?
5. What can write durable state?
6. Where do OpenAI, Anthropic, Ollama and FlowState plug in?
7. What differs between web cloud, desktop cloud and desktop local?
8. How do we test a change before release?

If those answers require reading a 40k-line bundle, relying on global variables, or knowing file concatenation order, the architecture has failed.

## Current-state findings

The current product contains valuable working behaviour, but several prototype-era patterns are now expensive:

- the browser build concatenates many source files into a single script in a manually controlled order;
- high-level UI, interaction state and feature behaviour are concentrated in large files;
- conversational policy is partly deterministic and partly embedded in large provider prompts;
- flat `profile` / `memories` state co-exists with the richer personal-context direction;
- cloud Postgres, root SQLite/Drizzle definitions and desktop SQLite do not yet share one canonical domain contract;
- web cloud, desktop cloud and desktop local expose similar UI while implementing different capabilities;
- provider and runtime concerns are visible too high in the stack;
- FlowState exists as a research/adapter seam but is not a qualified production runtime;
- build, deployment and release responsibilities are documented, but not yet enforced structurally by the source tree.

These are normal prototype trade-offs. They are not acceptable as the long-term implementation model.

## Target source topology

The rebuild uses one deliberately small application core:

```text
app/
  core/           # pure domain contracts and deterministic policy
  api/            # use-cases/orchestration; injected storage and providers
  adapters/       # provider, storage and runtime boundaries
  web/            # browser application and UI composition

desktop/          # Electron host + local/cloud adapters only
supabase/          # deployment wrapper + SQL migrations only
scripts/           # build and architecture verification
tests/             # domain, contract, adapter and end-to-end acceptance
```

The existing `src/` and `backend/` trees remain migration sources until their behaviour has been moved behind the new contracts. New product logic must not be added to legacy monoliths.

## Non-negotiable boundaries

### `app/core`

Pure JavaScript with JSDoc types. No DOM, no Supabase, no Electron, no filesystem, no network calls, no provider SDKs and no database queries.

Owns:

- NPR/context item contracts;
- Context Projection;
- SupportProfile compilation;
- ConversationPolicy compilation;
- Thread / Work / Episode / Outcome contracts;
- engine-neutral ExecutionSpec;
- deterministic precedence and safety invariants.

### `app/api`

Coordinates use-cases. Receives repositories, providers and runtimes through dependency injection.

Owns:

- load relevant state;
- compile bounded context;
- compile support/conversation policy;
- call a provider/runtime adapter;
- persist only through explicit repositories;
- create proposals/receipts for consequential writes.

It must not know whether storage is Postgres or SQLite.

### `app/adapters`

Thin translation layers only.

Examples:

- OpenAI / Anthropic / local model adapters;
- Supabase/Postgres repository adapter;
- SQLite repository adapter;
- FlowState runtime adapter;
- future tool gateway adapters.

Adapters may translate contracts. They may not define product meaning.

### `app/web`

Home / Chat / Work / My akilii rendering and user interaction.

The UI may request behaviour. It may not infer personal facts, call providers directly, query storage directly, or contain hidden policy that disagrees with `app/core`.

### `desktop`

Electron is an operating environment, not another product implementation.

Desktop owns:

- secure loopback/IPC boundary;
- local workspace selection;
- Ollama lifecycle/discovery/downloads;
- SQLite adapter;
- cloud-session adapter;
- OS integration.

It reuses the same core contracts and does not fork product semantics.

### `supabase`

Supabase is a deployment target.

The Edge Function should become a thin HTTP/auth wrapper around `app/api`. SQL migrations own Postgres evolution and RLS. Business logic does not live in SQL or a monolithic Edge entrypoint.

## Canonical data authority

Product meaning is defined by domain contracts, not by a particular database schema.

Required first-class concepts:

- User / Subject
- Conversation
- Thread
- Work item / artefact
- Episode
- Intervention
- Outcome
- NPR item
- NPR proposal
- Evidence
- Context control
- Context projection
- Policy / audit event

Legacy `memories` are migration input only. They are not a second canonical personal-context system.

## Conversation architecture

Text and Voice are modalities of the same system:

```text
input
  -> activity / objective
  -> Context Projection
  -> SupportProfile
  -> ConversationPolicy
  -> modality adapter (text | voice)
  -> provider/runtime
  -> episode/outcome
  -> optional learning proposal
```

Stable safety/epistemic rules belong in a small conversation constitution. Response length, challenge, decomposition, Socratic depth, initiative and representation are compiled dynamically. They must not be permanently baked into one giant system prompt.

Precedence:

1. safety and AIMS policy;
2. current explicit user request;
3. explicit session choice;
4. current activity/objective;
5. confirmed purpose-eligible NPR;
6. bounded evidence-backed observation;
7. safe product default.

## Build rules

- one explicit browser entrypoint;
- real imports/exports; no source-file string concatenation;
- generated bundles are never hand-edited;
- provider keys remain server-side;
- new modules should normally stay below ~400 lines; exceeding that requires an explicit reason in review;
- no circular imports across core/api/adapters/web boundaries;
- no direct `fetch()` from `app/core`;
- no direct database/provider imports from `app/web`;
- no durable model-generated personal context without proposal/confirmation rules;
- no feature claims without an acceptance test.

## Migration sequence

### R0 — foundation

- create canonical topology;
- add architecture verifier and core contract tests;
- keep production behaviour unchanged.

### R1 — domain core

- implement context, support, conversation, Thread, Work, episode/outcome and execution contracts;
- add parity tests for text/voice policy.

### R2 — API use-cases

- create injected repositories/providers;
- move chat, context, work and thread use-cases behind service functions;
- make Supabase Edge a thin wrapper.

### R3 — storage

- define Postgres + SQLite adapter parity;
- replace flat memories with explicit migration into governed context;
- make export/delete cover all canonical user-owned data.

### R4 — web application

- replace concatenated globals with a single module entrypoint;
- Home / Chat / Work remain primary navigation;
- My akilii is the trust/control surface;
- render from state/contracts rather than provider-specific payloads.

### R5 — desktop

- reuse core/api contracts;
- isolate Electron, local model and SQLite concerns;
- publish an explicit local/cloud capability matrix.

### R6 — runtime qualification

- qualify the FS runtime boundary independently;
- FlowState receives an engine-neutral ExecutionSpec through an adapter;
- no FlowState ontology leaks into product state/UI.

### R7 — legacy removal

Delete old paths only after behaviour has migrated and acceptance tests pass. No compatibility layer survives merely because it is old.

## Review standard for Yomi and George

Review the rebuild in this order:

1. `docs/ENGINEERING-REBASELINE.md`
2. `app/core/README.md`
3. core contracts and tests
4. architecture verifier
5. API use-cases/adapters
6. deployment wrappers
7. web UI
8. desktop adapters

A reviewer should not need to inspect generated bundles or legacy source to understand the new design.

## Definition of clean enough to merge

The re-baseline is mergeable only when:

- current user-facing acceptance paths pass;
- text and voice use the same support/context policy spine;
- web/desktop cloud use the same API contracts;
- desktop local conforms to the same domain contracts or is explicitly capability-gated;
- Postgres and SQLite adapter contract tests pass;
- architecture verification passes in CI;
- all consequential writes are explicit and idempotent;
- no duplicate canonical personal-context store remains;
- no provider/runtime-specific object is required by product UI;
- rollback remains documented and reproducible.

The standard is deliberately boring: obvious control flow, small modules, explicit contracts, testable boundaries and no magic.
