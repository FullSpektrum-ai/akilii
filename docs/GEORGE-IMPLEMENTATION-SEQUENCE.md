# George's implementation sequence

6 September 2026 · proposed engineering backlog after the alpha.8 audit.

André owns product/design acceptance; George owns implementation and technical acceptance. This sequence closes the existing product loop before optional feature expansion. It does not mark a gate or ADR accepted.

## Proposed acceptance scenario

Use a fictional project officer building a small project command centre: clarify the reporting objective, review one helpful working preference, create an editable project plan with three next actions, complete one action, review its outcome, approve or reject a context-specific learning proposal, then return in a new conversation and inspect whether that learning was used.

This reflects André's later project-management direction. It is a proposed replacement for the original meeting-preparation scenario, not an additional required workflow. André and George must record adoption under ADR-V01-007 before making it the release acceptance fixture. Do not use Bex's identity, employer data or personal context as a default fixture.

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

Each package should be a reviewable PR or a small sequence of PRs. Implementation order may overlap where dependencies permit; cumulative gate acceptance may not be skipped. Estimate only after George reproduces the build.

## Screen-to-contract handoff

For each selected screen or state, record:

- PRD requirement and ladder gate; exact Figma node and design authority.
- Entry/exit, primary/alternative action, loading/empty/error/offline states.
- Context read/write, approval consequence, persistence/version rule and API/schema.
- Code location, automated test, manual acceptance evidence and reviewer.
- Any deliberate departure from Figma, its rationale and acceptance status.

Start with Page 07 Discover/Understand/Act/Evaluate/Learn/Apply Later and Page 05 mobile counterparts. Include Page 14 lifecycle guards and Page 08 panel behaviour. Do not count a component or a screenshot as an implemented journey.

## Decisions to record before dependent work

| Decision | Current evidence | Required disposition |
|---|---|---|
| ADR-001 / ADR-V01-002/003 | Direct provider currently active; FlowState adapter unqualified | Agree owned runtime boundary and qualify FlowState; any substitute requires equivalent workflow proof and joint approval |
| ADR-005 / ADR-V01-005 | Basic memory/preferences do not meet full NPR contract | Approve minimum physical schema and lifecycle/projection guarantees |
| ADR-006 / ADR-V01-006 | Streaming exists; resumability not established | Pin normalized event/status/error contract and replay/cancel guarantees |
| ADR-V01-007 | Original meeting scenario; later command-centre direction | Adopt exactly one acceptance scenario |
| ADR-003/004 / ADR-V01-004 | Pages + Supabase + Electron/SQLite observed | Record current stack and migration ownership; do not trigger a speculative rewrite |
| ADR-V01-009/010 | AWS proposal and manual release paths | Record hosting/cost boundary, environments, promotion and restore evidence |
| Design exception | 760px implementation vs Figma 960px breakpoint; mobile sheet differences | André/George choose accepted responsive contract and test it |

Record date, status, context, decision, alternatives, consequences, evidence, owner/reviewer and superseded references in each accepted ADR. An index entry is not an accepted ADR.

## Completion evidence

Use [the alignment audit](HANDOVER-ALIGNMENT-AUDIT.md) as the gap register and [the full-stack handover](FULL-STACK-HANDOVER.md) as the current architecture reference. Update both when a gap closes, linking the PR and evidence. A successful test on the author's machine does not establish clean-clone, native-platform or production acceptance.
