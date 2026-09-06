# Build Backlog and Work Packages

## Planning rule

Deliver vertical evidence, not disconnected layers. Each work package must leave the product in a demonstrably coherent state and must include tests, observability, accessibility, documentation, and traceability where applicable.

## Milestone map

```text
M0 Convergence
→ M1 Contracts and design readiness
→ M2 Authenticated walking skeleton
→ M3 Real Support/Act integration
→ M4 Outcome/Learn closure
→ M5 Quality, safety and pilot readiness
```

## Work-package template

Every ticket/work package should contain:

```text
ID and title
Outcome, not activity
Requirement IDs
Canonical Figma nodes
Inputs/contracts
State read/written and canonical owner
Security/privacy/accessibility considerations
Dependencies
Acceptance scenarios
Tests/evidence
Traceability update
Explicit exclusions
Owner/reviewer/status
```

## WP-00 — Convergence and ownership

**Outcome:** one canonical product baseline, one design source, one FlowState dependency path, named owners, and an evidence-backed asset inventory.

Tasks:

- inventory repositories, branches, Figma files, runtime versions, infrastructure, schemas, agents, mocks, and prior prototypes;
- classify Canonical/Reuse/Migrate/Reference/Archive/Reject;
- record build/test status and last verified evidence;
- choose the vertical-slice scenario;
- assign accountable owners and release authority;
- approve ADR-001/002 or document challenges.

Done when Gate 0 evidence exists and no implementation relies on an unclassified asset.

## WP-01 — Development foundation

**Outcome:** a repeatable local/test build with versioned configuration and CI.

Tasks:

- repository instructions, dependency installation, `.env.example`, safe synthetic seed;
- local/test/staging configuration separation;
- lint/type/unit/contract test commands;
- migration framework and test database;
- CI scanning, test artefacts and build version;
- basic metrics/traces/log redaction scaffolding.

Excludes production deployment and full observability tuning.

## WP-02 — Figma implementation source

**Outcome:** approved implementation-ready core flow with exact node traceability.

Tasks:

- foundations/variables/components;
- canonical mobile and desktop screens;
- required run/gate/failure/context/feedback states;
- component descriptions and annotations;
- keyboard/focus/status behaviour;
- usability pass on onboarding and outcome feedback;
- link Must requirements to nodes.

Done when the Figma handoff gate passes.

## WP-03 — Identity, shell, and isolation

**Requirements:** AUTH-001, relevant NFRs.

**Outcome:** individual user can authenticate and access only their own shell/resources.

Tasks:

- session lifecycle and expired-session UX;
- server-derived identity and object-level authorisation;
- app shell/navigation/responsive behaviour;
- per-user isolation integration tests;
- no privileged operator surface unless separately required and gated.

## WP-04 — NPR core

**Requirements:** NPR-001 to NPR-004.

**Outcome:** structured, governed context can be created, projected, corrected, restricted, and deleted.

Tasks:

- schema/migrations for core item/control/evidence/version records;
- lifecycle service and policy validation;
- minimal projection query;
- My Context API/UI;
- derived-index invalidation interface;
- synthetic fixtures A/B/C;
- conflict, expiry, version, restriction and deletion tests.

## WP-05 — Onboarding and initial understanding

**Requirements:** ONB-001, NPR-001/002.

**Outcome:** user reaches first value with an initial reviewed NPR without a long assessment.

Tasks:

- welcome/memory/control explanation;
- immediate-intent capture;
- short discovery turns with skip/pause/resume;
- initial synthesis separating assertions and observations;
- confirm/edit/reject and progress persistence;
- onboarding analytics without raw content.

## WP-06 — SupportRuntime and fake adapter

**Requirements:** SUP-001/002, RUN-002.

**Outcome:** UI/API operate against normalized typed run events independently of FlowState.

Tasks:

- machine-readable schemas and shared/generated types;
- fake adapter fixtures;
- ordered resumable stream;
- status, cancel, retry, resume and gate APIs;
- safe error mapping;
- consumer/provider contract tests;
- accessible status announcements.

## WP-07 — FlowState adapter and real vertical slice

**Requirements:** RUN-001/002, GATE-001, OBS-001.

**Outcome:** one real FlowState specialist/tool workflow produces a normalized, observable, gated result.

Tasks:

- pin version and integration topology;
- map provider/session/agent/tool/gate events;
- supply minimal NPR projection;
- enforce tool allow-list and no external side effects;
- normalize errors/usage/latency;
- real runtime smoke and E2E tests;
- demonstrate no direct NPR mutation.

## WP-08 — Product workspace and action

**Requirements:** ACT-001, GATE-001.

**Outcome:** approved internal action becomes a persistent project/task/artefact with a next action.

Tasks:

- product schema/migrations;
- validate proposed output before persistence;
- optimistic concurrency/idempotency;
- approval/deny/cancel UI;
- cross-session continuation;
- partial success and persistence-failure handling.

## WP-09 — Outcome and learning

**Requirements:** OUT-001, LRN-001/002.

**Outcome:** feedback closes the loop and confirmed learning changes later support.

Tasks:

- implement current Figma outcome-feedback pattern;
- outcome/intervention/episode links;
- proposal policy and explanation;
- confirm/correct/reject/restrict flow;
- NPR version/supersession;
- later-use trace;
- negative, weak-signal, conflict and empty-context tests.

## WP-10 — AIMS-lite and observability

**Requirements:** AUD-001, OBS-001.

**Outcome:** material actions and operational health are reconstructable without exposing raw sensitive content.

Tasks:

- event envelope/catalogue/storage;
- normalized adapters from app/NPR/FlowState;
- redaction and privileged access;
- correlation across services;
- dashboards for latency/error/gate/tool/context and cost;
- audit failure policy and alerting;
- trace replay for canonical loop.

## WP-11 — Privacy, safety, and user data controls

**Requirements:** PRIV-001 and safety baseline.

**Outcome:** data flows and high-risk behaviour are controlled, reviewable, and usable by the individual.

Tasks:

- data map/provider register/retention decisions;
- export and account-deletion status flow;
- log/prompt/tool data minimisation;
- safety classifier/policy/gated response tests;
- secrets, rate limits, prompt-injection/tool isolation;
- operational incident owner and escalation path.

## WP-12 — Accessibility and resilience

**Requirements:** ACC-001, FBK-001 and all NFRs.

**Outcome:** core loop works with keyboard/screen reader and survives expected failure/interruption.

Tasks:

- semantic landmarks and focus management;
- status/live-region mapping;
- reduced motion, zoom, long text, 320px layout;
- draft persistence and session recovery;
- failure injection and scoped retries;
- browser/device matrix;
- manual assistive-technology evidence.

## WP-13 — Evaluation and pilot readiness

**Requirements:** EXP-001 and success metrics.

**Outcome:** the MVP can be assessed against its actual product thesis.

Tasks:

- blinded NPR-enabled versus disabled scenarios;
- utility, understanding, agency, correction and loop metrics;
- denominator/missing-feedback reporting;
- dogfood/pilot protocol and synthetic rehearsal;
- release, rollback, restore, runbook and known-limitations review.

## Dependency view

```text
WP-00
├── WP-01
├── WP-02
└── decisions
    ├── WP-03
    ├── WP-04 ── WP-05
    └── WP-06 ── WP-07

WP-03 + WP-04 + WP-06 + WP-07
→ WP-08
→ WP-09

WP-10, WP-11 and WP-12 begin with the skeleton and mature through every slice
→ WP-13
```

## Work-in-progress discipline

- Prefer one core-loop slice in progress per domain owner.
- Do not begin WP-09 while outcome and NPR proposal contracts are undefined.
- Do not add optional semantic retrieval before structured projection is evaluated.
- Do not defer safety/privacy/accessibility/observability to a final “hardening sprint.”
- A prototype UI does not complete a work package whose acceptance requires real persistence/runtime evidence.

