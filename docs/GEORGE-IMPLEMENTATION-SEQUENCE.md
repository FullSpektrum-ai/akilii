# George's implementation sequence

7 September 2026 · proposed engineering backlog after the alpha.8 audit and Phase 6 design-to-build convergence.

André owns product/design acceptance; George owns implementation and technical acceptance. This sequence closes the existing product loop before optional feature expansion. It does not mark a gate or ADR accepted.

Read [V0.1 Design → Build Convergence](V01-DESIGN-BUILD-CONVERGENCE.md) alongside this file. That document is the current product tracer and screen-to-code contract. This file remains the cumulative engineering/gate backlog; implementation may overlap, but gate acceptance may not be silently skipped.

## Product-selected acceptance scenario

Use a **fictional user preparing for a Thursday investor meeting**. The product tracer is:

`real input → Shape → one useful move → explicit persistence proposal → user approval → Work → Hold Thread → leave → return → Resume Point → finish → outcome feedback`

This replaces the previously proposed project-command-centre fixture for the V0.1 product tracer. It does **not** use André's real investor, business, family, health or financial data. The fixture is a product/design decision; George still owns technical acceptance and the corresponding release decision must be recorded under the existing ADR process before a cumulative gate is marked accepted.

Governed learning remains the next differentiated slice after continuity is stable: outcome → evidence-backed proposal → approve/edit/reject → explained later use. Episode feedback alone must not silently create lasting personal context.

## Ordered work packages

| Order | Package / requirement | Concrete delivery | Required evidence | Owner |
|---|---|---|---|---|
| 1 | Reproduce and reconcile / G01–G03 | Clean clone, environment manifest, exact backend/schema/frontend versions, auth and local/cloud capability matrix | George runs synthetic setup/chat/save/resume; unsupported controls are honestly gated; two-user negative paths pass | George; André grants access |
| 2 | Governed context / G04; NPR-001/002/004 | Versioned context item/proposal and bounded projection; source, scope, confirmation, restriction, expiry and supersession semantics | Corrected item affects next eligible response; rejected/restricted/expired items excluded; empty context remains usable | George; André accepts review UX |
| 3 | Persistent activity / G05; ACT-001 | One proposal → explicit action → saved editable artefact/tasks → resume flow; local/cloud parity or explicit scoped availability | Repeated/expired decisions cannot duplicate work; restart, conflict and save-failure paths pass | George |
| 4 | Qualified runtime / G06; RUN-001/002, GATE-001 | Pinned FlowState behind the owned runtime boundary, real bounded tool workflow, run IDs/events, cancellation and receipts | Real execution, isolation, denied/expired permissions, partial failure, retry and actual cancellation tested | George; joint runtime decision |
| 5 | Outcome and learning / G07; OUT-001, LRN-001/002 | Helpful/partial/unhelpful outcome linked to action; evidence-backed proposal; confirm/edit/reject; later-use explanation | Rejection leaves canonical context unchanged; approved context affects a later session with traceable evidence | George; André accepts usefulness |
| 6 | Recovery/accessibility / G08 | Lifecycle receipts, retained drafts, responsive sheets, keyboard/screen-reader flows and data controls | Store-by-store export/delete tests; 320px+, tablet, desktop, zoom and real device checks | George; André design review |
| 7 | Release rehearsal / G09–G10 | Immutable release manifest, isolated migration rehearsal, restore/rollback, cost/health monitoring, support route and native distribution | Dated joint go/no-go and known limitations; no automatic gate pass from version labels | Joint |

The **UI/product implementation order** inside these packages is the Phase 6 slice order: baseline → Shape/Move → Proposal/Work/Receipt → Thread Hold/Return/Resume → Finish/Outcome → governed learning → FlowState qualification. This does not waive any prerequisite gate; it prevents the first continuity tracer from being blocked by optional platform expansion.

Each package should be a reviewable PR or a small sequence of PRs. Estimate only after George reproduces the build.

## Screen-to-contract handoff

Use [V0.1 Design → Build Convergence](V01-DESIGN-BUILD-CONVERGENCE.md) as the current tracer map and [the bidirectional flow and component audit](USER-FLOW-DESIGN-AUDIT.md) as the wider gap register. UF01–UF22 remain open until both design and engineering evidence are linked.

For each selected screen or state, record:

- PRD requirement and ladder gate; exact Figma node and design authority.
- Entry/exit, primary/alternative action, loading/empty/error/offline states.
- Context read/write, approval consequence, persistence/version rule and API/schema.
- Code location, automated test, manual acceptance evidence and reviewer.
- Any deliberate departure from Figma, its rationale and acceptance status.

Start with **Page 07 → `05 · COMMERCIAL GOLDEN PATH · V0.1 BUILD AUTHORITY` (`5184:13582`)** and **Page 08 → `00 · PHASE 6 — V0.1 DESIGN → BUILD CONVERGENCE AUTHORITY`**. Use Page 03 Human Journeys as validation, Page 06 for responsive/state contracts and Page 09 for lifecycle/state trace. Historical ASK/DISCOVER/SUPPORT screens are reference, not build authority. Do not count a component or screenshot as an implemented journey.

## Decisions to record before dependent work

| Decision | Current evidence | Required disposition |
|---|---|---|
| ADR-001 / ADR-V01-002/003 | Direct provider currently active; FlowState adapter unqualified | Keep direct runtime for the continuity tracer; agree the owned boundary and qualify FlowState separately. Any substitute requires equivalent workflow proof and joint approval |
| ADR-005 / ADR-V01-005 | Basic memory/preferences do not meet full NPR contract | Approve minimum physical schema and lifecycle/projection guarantees; Thread is not an NPR/memory substitute |
| ADR-006 / ADR-V01-006 | Streaming exists; resumability not established | Pin normalized event/status/error contract and replay/cancel guarantees; add product Thread resumability without calling it runtime replay |
| ADR-V01-007 | Phase 6 product authority selects the fictional investor-meeting continuity tracer | Record the selected fixture and consequences before cumulative release acceptance; do not reintroduce a second competing acceptance fixture |
| ADR-003/004 / ADR-V01-004 | Pages + Supabase + Electron/SQLite observed | Record current stack and migration ownership; do not trigger a speculative rewrite |
| ADR-V01-009/010 | AWS proposal and manual release paths | Record hosting/cost boundary, environments, promotion and restore evidence |
| Design exception | 760px implementation vs Figma 960px breakpoint; mobile sheet differences | André/George choose accepted responsive contract and test it |

Record date, status, context, decision, alternatives, consequences, evidence, owner/reviewer and superseded references in each accepted ADR. An index entry is not an accepted ADR.

## Completion evidence

Use [the alignment audit](HANDOVER-ALIGNMENT-AUDIT.md) as the gap register, [the full-stack handover](FULL-STACK-HANDOVER.md) as the current architecture reference and [V0.1 Design → Build Convergence](V01-DESIGN-BUILD-CONVERGENCE.md) as the current product tracer. Update them when a gap closes, linking the PR and evidence. A successful test on the author's machine does not establish clean-clone, native-platform or production acceptance.
