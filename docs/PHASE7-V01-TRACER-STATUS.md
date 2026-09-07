# Phase 7 — V0.1 continuity tracer status

7 September 2026 · branch `phase7-v01-tracer` · draft PR #1.

This is an implementation status record, not release acceptance. Product/design acceptance remains André Skepple's responsibility; engineering/technical acceptance remains George Nangle's responsibility. Do not deploy or merge solely because this document exists.

## Current result

Slices **A–E** of the Phase 6 design-to-build ladder are implemented on the branch for the cloud/desktop-cloud product path:

`Home / Chat / Work → Shape → Proposed Action → Approval → Work Receipt → Hold Thread → Return → Resume → Finish → Outcome`

Slices F (governed learning) and G (FlowState qualification) remain deliberately separate.

## Implemented by slice

### A — baseline convergence

- Primary product grammar is Home / Chat / Work.
- Projects remain an execution capability inside Work rather than becoming a fourth primary product experience.
- Historical Support wording is corrected to Chat in the convergence layer.
- Unsupported local continuity is gated rather than presented as equivalent to cloud capability.

### B — Shape + Move

- Existing generative presentation controls are reused.
- Product labels are One next move / Short plan / Full picture.
- The control changes representation, not the user's diagnosis, profile or fixed capability.

### C — Proposal → Work → Receipt

- Direct runtime advertises `work.create` and `work.save_version`.
- A `work.create` proposal creates a run/action but creates no Work item before approval.
- Explicit approval creates Work version 1 and returns a receipt.
- Cancel/replay/conflict paths remain guarded.
- Assistant save affordances are relabelled as reviewable persistence proposals on supported cloud paths.

### D — Thread Hold → Return → Resume

- Owner-scoped `threads` table and API added.
- Thread is separate from conversation transcript, Work and personal Support Context.
- User explicitly chooses Keep my place; inactivity is never interpreted as Hold.
- Held/ready Threads can surface on Home.
- Resume restores objective, last confirmed state, last decision and next useful move.
- Linked conversation/project/Work ownership is checked before Thread creation.
- Create/update operations use request-key replay protection and optimistic versions.
- Closed is terminal for V0.1.

### E — Finish + Outcome

- Finish uses actual linked project/task state only.
- If tasks remain, the exact saved remaining count is shown; no synthetic percentage or estimate is produced.
- If a project is marked complete while tasks remain, the state conflict blocks Finish.
- If all tasks are checked but the project is not explicitly complete, Finish remains blocked.
- If a linked structured Work object is unavailable, Finish is blocked rather than guessed.
- Thread close and helpful / partial / unhelpful outcome are written atomically.
- Outcome retries are idempotent and an outcome request key cannot replay across another Thread.
- Episode outcome does not create memory or durable Support Context.

## Data lifecycle additions

- New cloud migrations: `akilii.threads` and `akilii.outcomes` with owner RLS.
- Cloud export includes Threads and outcomes.
- Account-data cleanup deletes outcomes and Threads before dependent records.

## Automated evidence on the branch

Dedicated tests cover:

- create/update runtime proposal validation;
- zero Work before approval and exactly one Work item after approval;
- Thread create/replay/version transitions;
- rejection of unowned Thread links;
- requirement to close through the outcome route;
- terminal closed Thread state;
- atomic outcome + Thread close;
- stale revision rejection;
- cross-Thread outcome idempotency-key misuse.

An earlier CI job successfully completed `npm ci` and `npm run build` before failing in the new test fixtures. The fixture error was reproduced and corrected: tagged-template SQL literals such as version `1`, statuses and runtime names must not be treated as bound parameters. The corrected dedicated tests pass in isolated local execution.

At the time of this status record, the newest GitHub Actions attempts are returning `startup_failure` before jobs start. Treat that as unresolved CI infrastructure evidence; do not claim a green branch until a complete validation workflow runs successfully.

## Known gaps that remain material

1. **First-value onboarding remains incomplete against the product contract.** The cloud facade still requires an existing profile for ordinary chat/Thread routes. The branch does not yet prove “real input before profiling/setup”.
2. **Not deployed.** The new migrations and Edge Function code are source changes only; live Supabase has not been changed by this PR.
3. **Local parity is incomplete.** Desktop-local does not yet provide cloud structured Projects, Threads and outcomes. The UI must continue to gate those capabilities honestly.
4. **Persistence policy is not universally unified.** Existing manual Work/project editors still have direct product writes; this tracer specifically routes assistant-generated persistence through proposal/approval.
5. **No governed learning yet.** Outcome feedback is intentionally non-learning until Slice F adds evidence proposal → approve/edit/reject → explained later use.
6. **FlowState remains unqualified.** Slice G / G06 is separate from this continuity tracer.
7. **Human acceptance remains required.** Browser/device, keyboard, screen-reader, responsive and exact Figma parity have not been certified by these unit tests.

## Current authority

- Figma Page 07: `05 · COMMERCIAL GOLDEN PATH · V0.1 BUILD AUTHORITY` (`5184:13582`).
- Figma Page 08: `00 · PHASE 6 — V0.1 DESIGN → BUILD CONVERGENCE AUTHORITY` (`5238:43`).
- Repository contract: `docs/V01-DESIGN-BUILD-CONVERGENCE.md`.

The draft PR should remain draft until CI, product review and technical review are all explicit.
