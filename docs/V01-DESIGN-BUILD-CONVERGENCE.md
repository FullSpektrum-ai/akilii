# akilii V0.1 — Design → Build Convergence Contract

7 September 2026 · Phase 6 product/engineering handoff · current repository baseline: `main`, package `0.1.0-alpha.8`.

This document maps the current Figma V0.1 Product Authority to the code that exists now. It is a build contract, not evidence that the beta gates have passed.

Product/design acceptance: André Skepple. Engineering/technical acceptance: George Nangle. Runtime, privacy, schema and release decisions remain joint decisions.

## 1. Product acceptance fixture

**Product-selected fixture:** a fictional user preparing for a Thursday investor meeting.

The fixture exists only to prove the product loop. It must not contain André's real investor, company, health, family or financial data.

Figma authority: Page `07 — V0.1 Product Authority`, section `05 · COMMERCIAL GOLDEN PATH · V0.1 BUILD AUTHORITY` (`5184:13582`).

The required behavioural loop is:

`real input → Shape → one useful move → explicit persistence proposal → user approval → Work → Hold Thread → leave → return → Resume Point → finish → outcome feedback`

The full governed learning loop remains a follow-on slice. Episode feedback must not silently become lasting personal context.

## 2. Core convergence decisions

1. **Home / Chat / Work remain the only primary product experiences.** Projects are an implementation of structured Work, not a fourth primary destination.
2. **Conversation, Thread, Work and Support Context are separate state classes.** Conversation is what was said. Thread is where the user is. Work is what has been deliberately persisted for execution. Support Context is what the user has allowed akilii to reuse to support them.
3. **Thread is a new product-state object.** Do not model Thread as a chat transcript, memory item or inferred psychological profile.
4. **Cloud and desktop-cloud are the first acceptance path for Thread + structured Work.** Desktop-local must gate unsupported continuity honestly until parity exists; local parity must not block the first closed-beta tracer.
5. **The direct runtime remains the active V0.1 tracer.** FlowState stays behind the owned runtime boundary and remains unavailable to user traffic until G06 qualification passes.
6. **No automatic model-generated persistence.** Consequential persistence follows proposal → explicit approval → processing → receipt.
7. **No fabricated state.** Progress, estimates, sync, external changes, staleness or completion are shown only when backed by observable product state.

## 3. Golden-path implementation map

| GP | Figma state | Disposition | Existing source to reuse | Minimum V0.1 engineering change |
|---|---|---|---|---|
| 01 | Home / Start with a real problem | EXTEND | `src/app.js`, living/home surfaces, smart prompts | Make value-first Home the post-auth default; no profile gate required before first useful input. |
| 02 | Chat / Messy input | REUSE | `src/app.js` chat/composer/streaming; voice path | Keep the existing conversation transport and composer. Preserve stop/error/offline behaviour. |
| 03 | Chat / Shape the thinking | EXTEND | `src/generative-ui.js` one/overview/plain presentation controls | Add the canonical representation contract: One next move / Short plan / Full picture. This is a presentation transformation, not a diagnosis or durable user label. |
| 04 | Chat / One useful next move | EXTEND | structured response objects + one-step presentation | Normalize a `next_move` view so one legitimate move can be foregrounded without hiding the whole map. |
| 05 | Chat / Explicit persistence | EXTEND | `workEditor()` and `backend/runtime.js` proposal/approval pattern | Replace direct-looking save affordances with an inspectable Proposed Action. No Work write until approval. |
| 06 | Work / Saved with receipt | REUSE + EXTEND | existing Work save/versioning; runtime receipt object | Render a durable receipt with what was saved, where, and resulting version/state. Toast alone is insufficient. |
| 07 | Work / One current step | EXTEND | cloud `projects`/tasks in `backend/workspace.js` | Present structured projects/tasks inside Work. One current step is foregrounded; remaining tasks stay available without competing for attention. |
| 08 | Thread / Hold without losing it | NEW | no current canonical Thread object | Create/update Thread status = `held`; save confirmed working state and neutral return cue. Holding is not overdue/failure. |
| 09 | Home / Return without reconstruction | NEW | Home + recent/work data | Query resumable Threads and show the most relevant confirmed state. Do not replay transcript or invent changes. |
| 10 | Thread / Exact resume point | NEW | no current canonical Thread object | Restore objective, last confirmed state, last decision/open question, next useful move and linked Work. |
| 11 | Work / Finish line | EXTEND | project task completion/status | Compute remaining work from real tasks/state only; close explicitly when done condition is met. |
| 12 | Close / Done + reflection | EXTEND | existing message feedback endpoint/pattern | Add outcome feedback linked to Thread/Work episode. Do not promote feedback to lasting support context automatically. |

## 4. Minimum Thread contract

Thread is user-owned product state that spans Chat and Work.

### Required cloud schema

```text
threads
- id                 uuid/text primary key
- user_id            text not null
- title              text not null
- objective          text not null default ''
- status             active | held | ready | closed
- conversation_id    nullable
- project_id         nullable
- work_id            nullable
- last_confirmed     text not null default ''
- last_decision      text not null default ''
- next_move          text not null default ''
- open_questions     jsonb/array not null default []
- version            bigint not null default 1
- created_at         bigint not null
- updated_at         bigint not null
- closed_at          nullable
```

Rules:

- owner isolation/RLS is mandatory;
- updates require optimistic version checking;
- `held` is explicit user choice, not inferred inactivity;
- `ready` means a known resumable state exists, not that the user is psychologically ready;
- no diagnosis, fatigue, motivation or attention score belongs in Thread;
- Thread does not duplicate the full conversation transcript;
- linked Work/Project records remain independently versioned.

## 5. Proposed Thread API

Names are implementation suggestions; observable behaviour is authoritative.

```text
GET  /api/threads
GET  /api/threads/:id
POST /api/threads
POST /api/threads/:id
```

Create body:

```json
{
  "title": "Prepare for Thursday's investor meeting",
  "objective": "Make the opening, why-now case and ask clear",
  "conversation_id": "...",
  "project_id": "...",
  "last_confirmed": "The opening direction is clear.",
  "next_move": "Explain why this matters now."
}
```

Update body must include `version` and one explicit transition/update, for example:

```json
{ "version": 2, "status": "held" }
```

or:

```json
{
  "version": 3,
  "last_confirmed": "The opening and why-now case are complete.",
  "last_decision": "Lead with cognitive continuity.",
  "next_move": "Tighten the ask."
}
```

Repeated/replayed requests must not duplicate Threads or Work.

## 6. Work convergence

The product grammar is **Work**. Existing cloud projects/tasks are the preferred structured execution backend for the golden path.

- Keep versioned free-text Work artefacts where they are useful.
- Surface projects/tasks inside the Work experience rather than promoting `Projects` to primary navigation.
- Thread may link to a project and/or Work artefact.
- Cloud project status `active / paused / complete` remains backend execution state; UI copy may use human language such as Active / On hold / Closed where semantically equivalent.
- Local mode currently lacks project CRUD. Gate the structured-work path honestly instead of silently falling back or pretending parity.

## 7. Runtime boundary

Current direct runtime remains the tracer because `backend/runtime.js` already provides:

- runtime capability declaration;
- idempotent request keys;
- proposed actions;
- explicit approval;
- expiry/conflict checks;
- execution receipts;
- run events;
- cancellation of the current direct proposal state.

FlowState remains outside user traffic until its authenticated deployment, tenancy/isolation, bounded tools, gate expiry, real cancellation, failure recovery and cost/health acceptance are demonstrated.

The frontend consumes normalized product states such as:

```text
working
proposal_ready
awaiting_approval
processing
saved
failed
cancelled
```

It must not expose ordinary product copy such as “agent executing” or “swarm running”.

## 8. Build ladder

### Slice A — baseline convergence

- clean clone / shared UI / cloud path reproduced by George;
- Home/Chat/Work vocabulary matches Figma;
- unsupported local capabilities are gated;
- one fictional acceptance account/data fixture.

### Slice B — Shape + Move

- canonical Representation Switcher in Chat;
- One next move / Short plan / Full picture preserve the same underlying user content;
- one useful move can be accepted without losing access to the whole map.

### Slice C — Proposal → Work → Receipt

- Proposed Action uses existing direct runtime approval semantics;
- approved result creates/updates structured Work;
- retry/replay cannot duplicate Work;
- visible receipt reflects an observable saved result.

### Slice D — Thread Hold + Return + Resume

- Thread schema and API;
- hold current Thread;
- close/reload/new session;
- Home shows resumable Thread;
- Resume restores exact confirmed working state and linked Work.

### Slice E — Finish + Outcome

- real remaining task/state drives Finish Line;
- close Thread explicitly;
- outcome = helpful / partial / unhelpful, linked to the episode/action;
- feedback changes no durable support context by itself.

### Slice F — governed learning

After the continuity tracer is stable:

- evidence-backed support-learning proposal;
- approve/edit/reject;
- scoped later reuse with explanation;
- correction/restriction/expiry semantics.

### Slice G — FlowState qualification

Separate G06 engineering acceptance. Do not make the V0.1 cognitive-continuity demo depend on it.

## 9. Acceptance tests for the commercial tracer

The tracer passes only when all statements below are observable on the supported cloud path:

1. A user can start with unstructured text without completing a profiling questionnaire.
2. akilii can show the same response as One next move / Short plan / Full picture without changing the user's underlying meaning.
3. No persistent Work is written before explicit approval.
4. The approved action creates or updates exactly one Work result and shows a truthful receipt.
5. A Thread can be held deliberately with no overdue/shame state.
6. After reload or new session, Home shows the held/resumable Thread.
7. Resume restores the objective, confirmed state and next move without requiring transcript reconstruction.
8. Work shows a real current step and real remaining work; no fabricated percentage or estimate.
9. Closing the work closes the Thread and produces a truthful completion state.
10. Outcome feedback is linked to the completed episode and does not silently become durable personal context.
11. Two users cannot read or mutate each other's Threads/Work.
12. Expired/replayed/conflicting writes fail safely and do not duplicate persistent state.

## 10. Explicit V0.1 non-goals for this tracer

- no psychographic scoring/archetype UI;
- no passive fatigue/distraction detection;
- no autonomous external-change detection;
- no automatic local/cloud synchronisation;
- no unrestricted tools/actions;
- no requirement to expose FlowState internals;
- no Sports/institutional surfaces in the personal acceptance tracer;
- no requirement to reproduce historical ASK/DISCOVER/SUPPORT screen generations.

## 11. Evidence packet per slice

Each accepted slice links:

- exact Figma node(s);
- code path/API/schema;
- automated test;
- negative-path test;
- supported-mode matrix;
- dated product review by André;
- technical review by George;
- known limitation or deliberate exception.

“Designed”, “implemented”, “tested” and “accepted” remain separate statuses.
