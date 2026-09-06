# Engineering Handover Brief

## Outcome

Build and hand over a deployable authenticated akilii web MVP that proves one real loop:

```text
Understand → Support → Act → Outcome → Learn
```

The reference implementation must use FlowState for real orchestration through a FullSpektrum adapter, store longitudinal personal understanding in NPR Phase 0, persist product work separately, and produce sufficient evidence for engineering review and technical diligence.

## What engineering is being asked to deliver

1. Conversational, interruptible onboarding that produces a reviewed initial NPR.
2. Context-aware support conversation with accessible streaming/run states.
3. One project/goal workspace with tasks and a clear next action.
4. One real specialist-agent/tool workflow executed by FlowState.
5. Outcome feedback linked to the intervention and action.
6. An evidence-backed NPR update proposal and later traceable reuse.
7. User inspection, correction, restriction, export, and deletion controls.
8. AIMS-lite events, observability, migrations, recovery, privacy, safety, and accessibility evidence.

## The simplest correct mental model

```text
akilii UI
   ↓
akilii application API
   ├── product state: conversation, project, task, intervention, outcome
   ├── NPR: canonical personal context
   ├── SupportRuntime: FullSpektrum contract
   │       ↓
   │   FlowStateAdapter → FlowState agents/tools/runtime memory
   └── AIMS-lite: normalized audit and policy events
```

Do not expose internal names such as NPR, FlowState, AIMS, FS:One, or FS:Insight as unnecessary user-facing navigation or copy.

## Decisions engineering may rely on

### Locked

- Authenticated responsive web application.
- Per-user data isolation and deny-by-default authorisation.
- Structured NPR with stable, semi-stable, and dynamic tiers.
- Provenance, confidence, confirmation, lifecycle, and user control for material context.
- FlowState behind a FullSpektrum-owned `SupportRuntime` adapter.
- Runtime memory cannot directly mutate NPR.
- Versioned machine-readable contracts and contract tests.
- No high-impact external side-effect tools in MVP.
- One production-quality vertical slice; no mocked orchestration on the acceptance path.

### Preferred, subject to convergence audit

- TypeScript across application boundaries.
- Existing healthy akilii framework; otherwise React/Next.js.
- Existing healthy Supabase/Postgres/auth baseline.
- Server-sent events for one-way run streaming.
- Shared schema validation at trust boundaries.

### Must be decided before or during Gate 1/2

- Canonical repositories and Figma file/node references.
- Deployment platform, region, environments, and promotion route.
- Pinned FlowState version and integration topology.
- Model provider, region, retention, fallback, and cost controls.
- NPR retention/review defaults.
- AIMS-lite store and privileged access.
- Whether semantic retrieval or Qdrant is justified by evidence.

## First five engineering actions

1. Complete the convergence inventory; do not assume the newest repository is canonical.
2. Select and demonstrate the vertical-slice scenario using the real FlowState version.
3. Write contract fixtures for `SupportRuntime`, NPR projection/proposal, run events, and AIMS-lite before UI integration.
4. Prove a walking skeleton from authenticated UI to a persisted action and correlated audit trace.
5. Close the loop with outcome feedback, governed NPR learning, and a later context-aware response.

## Suggested ownership

| Role | Accountable for |
|---|---|
| Product owner | Scope, vertical slice, acceptance, metrics |
| Technical owner / Yomi | Architecture, technical decisions, engineering quality, final technical sign-off |
| Delivery/implementation lead / George | Work sequencing, integration, implementation completeness, day-to-day handover |
| Frontend owner | UX fidelity, accessibility, client state, run interaction |
| Backend/NPR owner | Domain model, permissions, lifecycle, migrations, export/deletion |
| Runtime owner | SupportRuntime, FlowState adapter, agents/tools/gates, runtime SLOs |
| Platform owner | Environments, CI/CD, observability, recovery, incident readiness |
| Safety/privacy owner | Policy, provider review, data flow, retention, safety behaviour |
| QA/evaluation owner | Contract/E2E/accessibility tests, evaluation design, release evidence |

Names are not implied by this table. Assign explicit individuals during handover.

## Implementation rules

- Begin with the smallest vertical slice, not horizontal infrastructure completeness.
- Keep domain logic out of UI components and FlowState workflows.
- Keep provider- and FlowState-native types behind adapters.
- Store canonical product entities once; derived caches and indexes reference their source.
- Treat prompts and model behaviour as versioned implementation assets with tests.
- Make loading, partial success, cancel, retry, resume, denial, and degraded states first-class.
- Never infer that more stored context means a better NPR.
- Trace security-sensitive behaviour, NPR mutation, tools, gates, outcomes, and critical NFRs.

## Required repository material

The canonical product repository should contain or link to:

```text
/docs/prd/
/docs/specs/
/docs/adr/
/docs/runbooks/
/contracts/
/schemas/
/tests/contract/
/tests/e2e/
/tests/accessibility/
/evaluation/
/fixtures/
/migrations/
/.env.example
/README.md
/CONTRIBUTING.md
/SECURITY.md
```

Exact organisation may change, but every class of material needs one canonical home and owner.

## Evidence expected at handback

- Recorded or reproducible canonical-loop demonstration.
- Environment and deployment identifiers.
- Architecture and data-flow diagram matching the deployed system.
- Versioned API/runtime/event/NPR schemas.
- Passing unit, contract, integration, E2E, isolation, accessibility, and recovery evidence.
- Threat model, privacy/data map, provider register, and exceptions.
- Traceability table for all Must requirements.
- Known limitations and unresolved ADRs.
- Cost/latency/error dashboard for real FlowState runs.
- Restore and rollback test record.
- Runbook that another developer has successfully followed.

## Questions to resolve in the first handover meeting

1. Which repository and branch contain the strongest current akilii application baseline?
2. Which current paths are real, mocked, stale, or design-only?
3. What exact FlowState version and operational model are supported today?
4. Is Supabase the verified canonical product data/auth platform or merely a prior assumption?
5. Which Figma nodes represent the approved onboarding, conversation, work, My Context, and feedback flows?
6. What data/provider constraints apply to the external pilot?
7. Who has release authority and who may approve locked-decision changes?
8. What scenario will serve as the single MVP vertical slice?

