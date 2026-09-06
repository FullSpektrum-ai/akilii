# Convergence, Traceability, and ADR Pack

## 1. Convergence inventory

### Classification

| Status | Meaning |
|---|---|
| Canonical | Current authoritative asset |
| Reuse | Adopt substantially as-is after verification |
| Migrate | Valuable material must move into canonical structure |
| Reference | Inform decisions; not executable/canonical |
| Archive | Retain for history; clearly excluded from build |
| Reject | Do not use because unsafe, contradictory, obsolete, or unowned |

### Inventory template

| Asset ID | Type | Location/version | Owner | Last verified | Build/test evidence | Real/mock | Dependencies | PRD alignment | Classification | Migration/action | Decision/ADR |
|---|---|---|---|---|---|---|---|---|---|---|---|
| INV-001 | Product repo | TBD | TBD | TBD | TBD | Mixed/TBD | TBD | TBD | TBD | TBD | TBD |
| INV-002 | Figma file | TBD | TBD | TBD | Node audit | Design | N/A | TBD | Reference/Canonical TBD | Trace core nodes | OD-10 |
| INV-003 | NPR work | TBD | TBD | TBD | Schema/tests TBD | TBD | Product DB | Stable/semi/dynamic, confidence, provenance | Migrate/Reuse TBD | Map fields/lifecycle | ADR-005 |
| INV-004 | FlowState | TBD/pin version | Runtime owner TBD | TBD | Real run TBD | Real capability | Providers/tools | Selected runtime | Reuse | Adapter mapping | ADR-001 |
| INV-005 | Mock agents | TBD | TBD | TBD | Fixture only | Mock | TBD | Cannot satisfy MVP | Reference/Reject | Label/remove acceptance path | — |
| INV-006 | AIMS assets | TBD | TBD | TBD | TBD | TBD | TBD | Wider than MVP | Reference | Extract event/policy minimum | ADR-008 |
| INV-007 | FS:One | TBD | TBD | TBD | TBD | Direction | Wider infra | Not MVP | Reference | Record unavoidable coupling | ADR as needed |
| INV-008 | FS:Insight | TBD | TBD | TBD | TBD | Reference | Domain assets | Not MVP UX | Reference | Identify reusable patterns | — |

### Evidence rules

- “Exists” is not evidence that a service works.
- A screenshot is not evidence of runtime integration.
- A mocked response is not evidence of agent execution.
- A migration file is not evidence that production/test schemas match.
- A Figma frame is not implementation acceptance without node/behaviour trace.
- A document claim must link to current code, deployment, test, or owner decision.

## 2. Traceability

### Required CSV columns

```csv
requirement_id,decision_status,owner,figma_file,figma_node_id,code_ref,contract_ref,data_or_event_ref,test_ref,evidence_ref,implementation_status,last_verified_at,notes
```

### Example rows

```csv
AK-MVP-RUN-001,LOCKED,Runtime Owner,TBD,TBD,TBD,SupportRuntime@1.0,support.run.*,TBD,TBD,not_started,,Real FlowState path required
AK-MVP-NPR-002,LOCKED,NPR Owner,TBD,TBD,TBD,NprItem@1.0,npr.item.corrected,TBD,TBD,not_started,,Derived-store invalidation required
AK-MVP-OUT-001,LOCKED,Product Owner,TBD,TBD,TBD,Outcome@1.0,outcome.recorded,TBD,TBD,not_started,,Use approved Figma feedback pattern
```

### Traceability scope

Mandatory for:

- all Must requirements;
- authentication/authorisation;
- NPR access/mutation/restriction/deletion;
- FlowState agent/tool/gate behaviour;
- outcome-to-learning transitions;
- safety policy behaviour;
- critical NFRs and release evidence.

Optional for cosmetic details with no material behavioural effect.

### Status vocabulary

```text
not_started
designed
contracted
in_progress
implemented
verified
blocked
deferred
rejected
```

“Implemented” is not “verified.” Verification requires dated evidence in the intended environment.

## 3. ADR template

```markdown
# ADR-NNN — Decision title

- Status: Proposed | Accepted | Superseded | Rejected
- Date:
- Owners:
- Requirement/risk refs:
- Supersedes:

## Context

What forces a decision now? Separate evidence from assumptions.

## Decision drivers

- product/contract constraints;
- security/privacy/accessibility;
- operability and ownership;
- time/cost/reversibility;
- current implementation evidence.

## Options considered

### Option A
Benefits, costs, risks and evidence.

### Option B
Benefits, costs, risks and evidence.

## Decision

State exactly what is chosen, including version/scope and what is not decided.

## Consequences

Positive, negative, migration, testing, operations and revisit trigger.

## Acceptance evidence

Tests, spike, benchmark, threat review or owner approval required.

## Rollback/replacement path

How to reverse or supersede safely.
```

## 4. Initial decision register

| ADR | Topic | Decision needed | Evidence before acceptance |
|---|---|---|---|
| ADR-001 | FlowState selection | Pinned MVP version behind SupportRuntime | Real run, event/gate mapping, SLO/security/operability spike |
| ADR-002 | NPR/runtime separation | Canonical boundary and proposal-only writes | Contract and negative write test |
| ADR-003 | Canonical product repo/stack | Repository, framework, ownership | Build/test/dependency/convergence audit |
| ADR-004 | Data/auth platform | Platform and isolation model | Migration/permission/isolation/restore test |
| ADR-005 | NPR schema/lifecycle | Physical model and policy defaults | Fixture, migration, conflict/deletion tests |
| ADR-006 | Streaming | SSE/WebSocket and resume/idempotency | Reconnect and ordered-event test |
| ADR-007 | Models/providers | Provider/model/region/retention/fallback | Quality, latency, cost, privacy review |
| ADR-008 | AIMS-lite | Store, event envelope, access, retention, fail policy | Redaction, correlation and outage test |
| ADR-009 | Semantic retrieval | Whether/where Qdrant is justified | Baseline evaluation demonstrating material need |
| ADR-010 | Deletion | Cross-store deletion semantics | Data-flow map and end-to-end deletion test |

## 5. Change-control rules

- Changing a LOCKED decision requires an ADR plus product and engineering approval.
- A prompt or generated implementation cannot change scope or contract by implication.
- Update PRD/contracts/Figma/backlog/traceability in the same change when behaviour changes materially.
- Superseded assets remain labelled and linked to their replacement.
- Review TBD decisions by their gate; do not let an implicit default become permanent architecture.

## 6. Handover decision log

Use during George/Yomi handover:

| Date | Question | Decision/assumption | Owner | Due | Artefacts to update | Status |
|---|---|---|---|---|---|---|
| TBD | Vertical-slice scenario | TBD | Product/Engineering | G1 | PRD, backlog, Figma, tests | Open |
| TBD | Canonical repositories | TBD | Technical owner | G0 | Inventory, runbook | Open |
| TBD | Figma canonical nodes | TBD | Design owner | G1 | Traceability | Open |

