# Vibe-Coding Prompt Pack

## How to use this pack

These prompts are starting contracts, not substitutes for review. Replace bracketed placeholders with exact repository, branch, Figma node, requirement, environment, and fixture references.

Do not paste secrets, real user data, unrestricted transcripts, provider credentials, or production database exports into any tool.

At the top of every generation session, state:

```text
Status of this output: [disposable spike | candidate implementation | canonical implementation]
Canonical source: [repository + branch or Figma file + exact node links]
Bounded task: [one sentence]
Requirements: [IDs]
Do not modify: [paths/nodes/systems]
Evidence required: [tests/screenshots/traceability]
```

---

## Prompt 1 — Figma implementation-readiness audit

```text
Act as a senior product designer and design-engineering handoff reviewer.

Audit only these exact canonical Figma frames/components:
[FIGMA LINKS OR NODE IDS]

Use these sources in order:
1. approved ADRs: [LINKS]
2. akilii Definitive MVP PRD: [LINK]
3. UX and Figma Implementation Specification: [LINK]
4. requirements: [IDS]

Product constraints:
- akilii is the user-facing product.
- The MVP proves Understand → Support → Act → Outcome → Learn.
- NPR is user-governed personal context, not visible architecture jargon.
- FlowState is behind an adapter and must not shape UI terminology.
- Individual user only; no institutional, diagnostic, clinical, marketplace, or unrestricted-agent features.

Check:
- required screens and default/empty/loading/streaming/success/partial-failure/denied/cancelled states;
- component reuse, semantic variables, auto layout, responsive constraints, content stress;
- keyboard order, visible focus, screen-reader/status intent, contrast, reduced motion and cognitive load;
- data read/write, AI/runtime behaviour, permissions, events and requirement IDs;
- exact outcome-feedback and learning-proposal loop;
- ambiguous or contradictory behaviour.

Return:
1. blockers;
2. missing states;
3. component/token problems;
4. accessibility problems;
5. traceability gaps;
6. exact proposed corrections by node ID;
7. readiness verdict: Not Ready / Ready for Interaction Spike / Ready for Implementation.

Do not redesign unrelated surfaces or invent new product scope.
```

## Prompt 2 — Figma canonical-flow construction or revision

```text
Create or revise only the canonical akilii MVP flow in the specified Figma design file.

Target page/section: [PAGE AND SECTION]
Existing design system/components: [LINKS]
Requirements: [IDS]
Synthetic fixture: [FIXTURE LINK]

Build this flow:
Sign in → welcome/memory explanation → immediate intent → short discovery → initial understanding review → adapted support → gated internal action → project/tasks → outcome feedback → learning proposal → confirm/correct → later adapted interaction.

Also include branches for skip discovery, deny/cancel action, partial runtime failure, and reject/correct learning.

Rules:
- Use semantic variables and existing components first.
- Use auto layout for structural containers and responsive reflow.
- Include mobile and desktop canonical frames.
- Create or update component variants for all required states.
- Load the current font before every text mutation.
- Add descriptions/annotations for purpose, data, runtime behaviour, accessibility, events and requirement IDs.
- Return all created/mutated node IDs and a concise change list.
- Do not create production code, backend behaviour or architecture claims.
```

## Prompt 3 — Figma Make interactive spike

```text
Build an interactive, responsive akilii MVP prototype from only these approved Figma frames and components:
[EXACT FIGMA FRAME/COMPONENT LINKS]

This is a DISPOSABLE INTERACTION SPIKE unless separately adopted by engineering.

Implement the visible canonical loop:
Understand → Support → Act → Outcome → Learn.

Use only synthetic fixture data from:
[FIXTURE]

Simulate the backend through a single typed FakeSupportRuntime boundary. Simulate ordered events for:
- run starting/running/completed/failed/cancelled;
- response streaming;
- specialist delegation;
- tool proposal and gated approval/denial;
- persisted internal action;
- outcome requested/recorded;
- NPR update proposed.

Required states:
- onboarding skip/pause/resume;
- no-context and context-informed support;
- waiting for approval;
- partial tool failure with completed work preserved;
- stream reconnect;
- context proposal confirm/correct/reject;
- keyboard focus and reduced-motion behaviour.

Do not:
- connect to production services;
- store real personal data;
- create a direct FlowState dependency;
- treat runtime memory as NPR;
- add external side-effect tools;
- invent institutional, clinical, marketplace or FS:One functionality.

Return:
1. runnable prototype;
2. route/screen map;
3. component map;
4. fake event fixtures;
5. known differences from Figma;
6. accessibility and responsive limitations;
7. files that could be candidates for adoption versus files that are spike-only.
```

## Prompt 4 — Lovable application scaffold

```text
Create a CANDIDATE IMPLEMENTATION scaffold for the akilii MVP using the supplied Figma frames and contracts.

Approved design frames: [LINKS]
PRD: [LINK]
UX spec: [LINK]
Runtime/API contracts: [LINK]
Synthetic fixtures: [LINK]
Target repository/project: [IDENTIFIER]

Build only:
- individual authentication shell;
- responsive navigation and core screens;
- interruptible onboarding UI;
- conversation and normalized run-event UI;
- one project/task workspace;
- My Context inspection/edit/restrict/delete UI;
- outcome-feedback and learning-proposal UI;
- settings/privacy/help surfaces.

Architecture rules:
- All data access goes through service/repository interfaces.
- All agent behaviour goes through SupportRuntime; start with FakeSupportRuntime.
- NPR is a structured service boundary with tier/provenance/confidence/confirmation/lifecycle.
- FlowState-specific types must not enter UI or domain schemas.
- No production secrets or real data.
- Use row-level/per-user isolation if a temporary Supabase backend is created, but label migrations and policies as review-required.
- Add loading, empty, failure, denial, cancel, retry and accessibility states.

Do not build full AIMS, FS:One, FS:Insight UX, institutions, diagnosis, external side effects, an agent marketplace, or arbitrary integrations.

Before finishing:
- list all generated dependencies;
- list database tables/migrations/policies;
- identify every mocked path;
- provide local run instructions;
- provide tests or a manual acceptance checklist;
- report deviations from the approved Figma/contract;
- do not claim production readiness.
```

## Prompt 5 — Codex repository convergence audit

```text
Inspect the repository and report before making feature changes.

Goal: identify the safest canonical baseline for the akilii MVP and produce the Gate 0 convergence inventory.

Read repository instructions and preserve existing user changes. Inspect:
- application entry points and frameworks;
- authentication and data stores;
- migrations and row/object-level permissions;
- current NPR/profile implementations;
- agent/runtime paths and whether they are real or mocked;
- FlowState integration and version;
- design-system and Figma references;
- tests, CI/CD, environments, observability and runbooks;
- duplicated, stale, generated or abandoned paths;
- secrets and dependency risks without exposing secret values.

Classify each relevant asset as Canonical, Reuse, Migrate, Reference, Archive or Reject, with evidence.

Do not delete, migrate, deploy, contact external systems or choose a new architecture during the audit.

Return:
1. recommended canonical baseline and confidence;
2. evidence-backed inventory;
3. contradictions with the PRD/contracts;
4. mocked versus real execution paths;
5. blockers and open decisions;
6. smallest walking-skeleton implementation plan;
7. files/commands/tests that prove each conclusion.
```

## Prompt 6 — Codex walking skeleton implementation

```text
Implement Gate 2 of the akilii MVP in the canonical repository.

Sources, in order:
[ADR LINKS]
[PRD LINK]
[ARCHITECTURE LINK]
[NPR LINK]
[RUNTIME/API CONTRACT LINK]
[FIGMA NODE LINKS]
[REQUIREMENT IDS]

Target outcome:
authenticated UI → API → minimal NPR projection → SupportRuntime → real pinned FlowState run → ordered accessible stream → gated internal action → canonical product persistence → correlated AIMS-lite trace.

Implementation constraints:
- preserve unrelated changes;
- extend healthy existing patterns;
- do not create a second app/runtime/data model;
- keep FlowState behind FlowStateAdapter;
- do not allow runtime memory to write NPR;
- use versioned schemas and idempotency keys;
- implement cancel/retry/resume and partial failure;
- use only allow-listed internal actions;
- no production secrets or external high-impact side effects;
- include migration and rollback/forward-fix plan;
- trace all material actions with safe metadata.

Verification required:
- unit tests for domain logic;
- consumer/provider contract tests;
- per-user isolation tests;
- E2E canonical path using real FlowState in the designated test environment;
- FakeSupportRuntime tests for deterministic edge cases;
- keyboard/accessibility checks;
- failure injection for timeout, disconnect, denial and persistence failure.

Update the traceability file and create ADRs for any material choice not already decided. Report exact implemented paths, tests run, remaining mocks, risks and next gate.
```

## Prompt 7 — Codex closed-loop implementation

```text
Implement Gate 3: close Outcome → Learn and prove later adaptation.

Required behaviour:
1. outcome feedback is stored against intervention and episode;
2. eligible evidence creates an NPR proposal, not a direct write;
3. NPR validates type/tier/confidence/sensitivity/policy;
4. user can confirm, correct, reject or restrict;
5. canonical version/supersession and derived-index invalidation occur;
6. a later eligible support run receives the updated context projection;
7. traceability shows which item influenced adaptation;
8. current explicit instruction still overrides stored preference for the turn.

Use [NPR SPEC], [CONTRACT], [FIGMA NODES], [REQUIREMENTS], and synthetic fixtures A/B/C.

Add tests for positive outcome, negative outcome, single weak signal, repeated evidence, conflict, expiry, restriction, deletion and empty context. Do not create diagnostic attributes or automatic tier promotion.
```

## Prompt 8 — Codex harden exported Lovable/Figma Make code

```text
Review this generated candidate implementation before adoption into the canonical akilii repository:
[PATH/BRANCH/COMMIT]

Treat generated code as untrusted. Compare it with the PRD, architecture, contracts, Figma nodes, safety/privacy/accessibility pack and repository conventions.

Check for:
- duplicate apps/components/routes/data models;
- direct database or FlowState access from UI;
- weak or missing per-user authorisation;
- unversioned JSON/profile blobs;
- runtime-memory/NPR conflation;
- secrets, insecure defaults and excessive logging;
- inaccessible generated components;
- missing loading/failure/cancel/deny/resume states;
- unnecessary dependencies or licensing issues;
- invented scope;
- mocks presented as integrated behaviour.

First report adopt/refactor/reject recommendations by bounded unit. Then, if authorised, integrate only the accepted units with tests, traceability and explicit removal of superseded generated paths. Preserve unrelated repository changes.
```

## Prompt 9 — Design-to-code verification

```text
Verify the implemented akilii core loop against the approved Figma source and contracts.

Implementation: [URL/LOCAL RUN]
Figma frames: [EXACT LINKS]
Requirements: [IDS]
Viewport matrix: [MOBILE/DESKTOP]

Compare:
- layout, spacing, typography, tokens and component states;
- responsive reflow and long-content stress;
- navigation and interaction sequence;
- streaming, gate, partial-failure, feedback and context-control states;
- keyboard order, focus visibility, screen-reader status and reduced motion;
- actual data/runtime behaviour versus simulated design behaviour.

Classify findings:
P0 blocks safety/privacy/data integrity;
P1 blocks canonical loop or accessibility;
P2 material fidelity/usability issue;
P3 polish.

For each finding include requirement, Figma node, implementation location, reproduction, expected/actual, and recommended owner. Do not modify code or Figma unless separately authorised.
```

## Prompt 10 — Release evidence review

```text
Conduct a read-first Gate 4 release review for the akilii MVP.

Review the deployed candidate, repository, CI evidence, migrations, runtime version, data flows, NFR dashboard, accessibility results, restore test, threat model, privacy controls, provider register, open ADRs and traceability table.

Do not deploy, migrate, delete, send messages or change external state.

Return:
- gate verdict: Pass / Conditional / Fail;
- blocking evidence gaps;
- Must requirement status;
- real-versus-mocked execution map;
- unresolved high-risk decisions/exceptions;
- reproducible checks and exact evidence references;
- recommended go/no-go decision with assumptions.
```

## Prompt quality checklist

Before running any prompt:

- [ ] Output status is stated.
- [ ] Exact bounded target is supplied.
- [ ] Canonical sources and precedence are supplied.
- [ ] Requirement IDs and acceptance evidence are supplied.
- [ ] Real and synthetic data are distinguished.
- [ ] Files/nodes/systems that must not change are identified.
- [ ] Product “Do Not Build” constraints are present.
- [ ] Tool is instructed to report deviations and mocks.
- [ ] No secret, credential or real personal record is embedded.
- [ ] A human owner will review adoption.

