# akilii Engineering Re-baseline

Status: canonical working authority for `refactor/conversation-core-rebuild`
Date: 2026-09-08
Audience: Andre, Yomi, George and future contributors

## Objective

Rebuild the akilii codebase and stack into a small, reviewable, operationally coherent system that preserves proven behaviour while removing transitional duplication, oversized modules, hidden coupling and provider-specific product logic.

The goal is not a rewrite for its own sake. The goal is a codebase that an engineer can understand by following explicit boundaries, tests and contracts.

## Engineering principles

1. One product model. Home, Chat and Work are views over the same canonical state.
2. One personal-context model. NPR is canonical; legacy `memories`, profile focus/style and runtime recall are not parallel authorities.
3. One support-policy path. Text, voice, local and cloud compile the same support policy before reaching a model provider.
4. Thin provider adapters. OpenAI, Anthropic, realtime voice, Ollama and future runtimes translate contracts; they do not own product behaviour.
5. Deterministic authority first. Auth, tenancy, consent, policy, context eligibility, persistence, idempotency and receipts remain deterministic.
6. Small modules with single ownership. Avoid files that mix rendering, persistence, network calls, orchestration and product policy.
7. Explicit data flow. No hidden global state or implicit cross-module mutation where a typed/validated contract can be used.
8. Progressive enhancement. Empty context must work; richer context should improve support without creating a mandatory profile gate.
9. User control over durable context. Model output can propose learning; it cannot silently commit durable personal context.
10. Operational truthfulness. Never fabricate progress, synchronisation, external actions, task completion or background work.

## Canonical stack

```text
Web / Desktop UI
    |
    v
Application services
    |- Home experience
    |- Conversation
    |- Work / Thread
    |- Context control
    |
    v
Domain services
    |- NPR / Living Context
    |- Context Projection
    |- Support Policy
    |- Experience Compiler
    |- Execution Compiler
    |- Outcome / Learning
    |
    v
Control plane
    |- Auth / tenancy
    |- AIMS policy
    |- Persistence / idempotency
    |- Tool Gateway
    |- Model Gateway
    |- Runtime boundary
    |
    v
Adapters
    |- Supabase / Postgres
    |- Desktop SQLite
    |- OpenAI
    |- Anthropic
    |- Realtime voice
    |- Ollama
    |- FlowState (qualified only)
```

## Directory target

The existing tree will be migrated incrementally toward the following boundaries:

```text
src/
  app/              # composition/bootstrap only
  features/
    home/
    chat/
    work/
    context/
    voice/
  components/       # reusable UI primitives
  services/         # browser-side API clients only
  styles/           # tokens, primitives, feature styles

core/
  context/           # NPR contracts, projection, controls
  support/           # support policy/compiler
  conversation/      # modality-neutral conversation contracts
  work/              # Thread/Work domain rules
  learning/          # episode/outcome/learning proposals
  execution/         # FSExecutionSpec and runtime contracts
  policy/            # AIMS-facing policy contracts

server/
  routes/            # request parsing + response mapping only
  application/       # use cases
  repositories/      # persistence interfaces/implementations
  providers/         # model/media/provider adapters
  runtime/           # execution-engine adapters

platform/
  supabase/
  desktop/
  deployment/

tests/
  unit/
  integration/
  contract/
  e2e/
```

The migration must not introduce these directories merely for appearance. Files move only when responsibility is clear and tests protect behaviour.

## Current structural findings

### Frontend

The current frontend contains several broad modules (`app.js`, `app.css`, `api.js`, `living.js`, `experience.js`) carrying too many responsibilities. They will be decomposed by feature and by domain boundary. Rendering should consume application state/contracts rather than embed product policy.

### API / Edge

The cloud API currently has a large route surface and transitional context logic. Request routing, application use cases, repositories and provider calls will be separated. The Supabase Edge function remains a deployment adapter, not the canonical domain implementation.

### Data

The current SQLite Drizzle schema still includes legacy `profiles` focus/style and `memories`. These remain migration inputs only. Canonical personal context will be NPR items/proposals/evidence/controls/episodes/interventions/outcomes. Local and cloud stores must implement the same repository contracts even where feature parity is intentionally gated.

### Conversation and voice

Text and voice currently have different context and prompting paths. They will converge on:

```text
ConversationRequest
  -> ContextProjection
  -> SupportProfile
  -> ConversationPolicy
  -> modality adapter
  -> provider
  -> Episode
  -> optional Outcome
  -> governed LearningProposal
```

Voice modes are explicit session overrides, not separate personalities. The stable conversational constitution contains safety, agency, epistemic and capability rules only. Response length, Socratic depth, decomposition, challenge, initiative and representation come from the compiled support policy.

### Desktop

Desktop cloud and local execution remain separate supported modes. The desktop shell should own only shell/security/session/local-host concerns. Product/domain rules must be shared rather than forked into desktop-specific behaviour.

### Runtime / FlowState

FlowState remains behind an FS-owned engine-neutral runtime contract and does not become product ontology. No UI or canonical state may depend directly on FlowState manifests, recall or session semantics. Direct provider execution can remain active until a pinned FlowState path passes qualification tests.

## Authority order

For any adaptive interaction:

1. safety / AIMS policy
2. current explicit user instruction
3. current session override
4. current activity/objective
5. confirmed purpose-eligible NPR
6. bounded evidence-backed observations
7. safe product default

Older preferences never override a current explicit instruction.

## Deletion / consolidation targets

The following patterns are transitional and must disappear as the re-baseline progresses:

- legacy memory as parallel conversational authority;
- direct raw profile/workspace injection into model prompts;
- product policy embedded inside provider adapters;
- feature-specific duplicate context assembly;
- global UI modules accumulating unrelated behaviours;
- fixed persona/archetype assumptions in product logic;
- FlowState-specific state leaking into product state;
- provider-specific model decisions inside UI code;
- duplicated cloud/local domain rules;
- documentation that contradicts current architecture.

## Reviewability standard

A change is not complete until a reviewer can answer these questions from code and tests:

1. What domain owns this behaviour?
2. What inputs are authoritative?
3. What state can it read and write?
4. What happens when context is empty, restricted or stale?
5. What side effects are possible?
6. How are retries/idempotency handled?
7. How is the behaviour tested?
8. What does the user control?
9. What provider/runtime assumptions exist?
10. Can the implementation be replaced without changing product semantics?

## Migration sequence

### R0 - Baseline and inventory
Freeze feature expansion on the rebuild branch. Classify files and state as canonical, transitional, adapter, test, documentation or removal candidate.

### R1 - Core domain extraction
Extract context, support, conversation, work, learning and execution contracts into provider-independent modules with unit tests.

### R2 - Application/API split
Replace monolithic route logic with small route handlers calling application use cases and repository interfaces.

### R3 - Data re-baseline
Make NPR/Thread/Work/Episode/Outcome canonical. Add repository parity contracts for Postgres and SQLite. Migrate legacy profile/memory values without keeping them as runtime authority.

### R4 - UI feature split
Break broad frontend files into Home, Chat, Work, Context and Voice features plus reusable UI primitives. Remove hidden global coupling and duplicated state derivation.

### R5 - Conversation/voice unification
Run both modalities through the same ContextProjection -> SupportProfile -> ConversationPolicy path. Keep modality-specific turn-taking and rendering only at the edge.

### R6 - Runtime boundary
Introduce/finish FSExecutionSpec and engine-neutral runtime events. Keep FlowState behind the adapter until qualification succeeds.

### R7 - Operational hardening
Strengthen CI, contract tests, migration tests, tenant isolation, idempotency, recovery, observability and release smoke tests.

### R8 - Documentation convergence
Replace conflicting handover documents with one architecture index, ADR set, local-development guide and review checklist.

## Definition of done

The re-baseline is complete when:

- an engineer can trace a user interaction from UI to storage/provider without reading unrelated files;
- text and voice use one support-intelligence path;
- cloud and local implement shared domain contracts;
- legacy memory/profile fields are no longer parallel behavioural authority;
- Home/Chat/Work use one canonical product state model;
- provider/runtime adapters are replaceable;
- every consequential write is permissioned, idempotent and receipted;
- CI covers build, unit, integration, contract and release-smoke paths;
- no major source file is large because it owns multiple unrelated domains;
- Yomi and George can review or own bounded modules without understanding the entire codebase first.
