# Phase 7 — V0.1 continuity tracer status

7 September 2026 · branch `phase7-v01-tracer` · draft PR #1.

This is an implementation status record, not release acceptance. Product/design acceptance remains André Skepple's responsibility; engineering/technical acceptance remains George Nangle's responsibility. Do not deploy or merge solely because this document exists.

## Current result

Slices **A–E** of the Phase 6 design-to-build ladder are implemented on the branch for the cloud/desktop-cloud product path:

`real input → Home / Chat / Work → Shape → Proposed Action → Approval → Work Receipt → Hold Thread → Return → Resume → Finish → Outcome`

Slices F (governed learning) and G (FlowState qualification) remain deliberately separate.

## Implemented by slice

### A — baseline convergence

- Primary product grammar is Home / Chat / Work.
- Projects remain an execution capability inside Work rather than becoming a fourth primary product experience.
- Historical Support wording is corrected to Chat in the convergence layer.
- New users can choose **Start anywhere**, enter the real message first, review privacy/consent and optionally give a preferred name without completing a working-style/profile questionnaire.
- Working-preference discovery remains an explicit alternative rather than a gate to first value.
- Unsupported local continuity is gated rather than presented as equivalent to cloud capability.

### B — Shape + Move

- Existing generative presentation controls are reused.
- Product labels are One next move / Short plan / Full picture.
- The control changes representation, not the user's diagnosis, profile or fixed capability.

### C — Proposal → Work → Receipt

- Direct runtime advertises `work.create` and `work.save_version`.
- A `work.create` proposal creates a run/action but creates no Work item before approval.
- Explicit approval creates Work version 1 and returns a receipt.
- Replaying the same approved action returns the existing receipt and cannot create a second Work item.
- If an approval response is lost, the UI keeps the action in an explicit reconciliation/retry state rather than claiming it was cancelled or unsaved.
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
- Outcome retries use a deterministic episode key and are idempotent; the same outcome request key cannot replay across another Thread.
- Episode outcome does not create memory or durable Support Context.

## Data lifecycle and migration preflight

- New cloud migrations add `akilii.threads` and `akilii.outcomes` with owner RLS.
- Cloud export includes Threads and outcomes.
- Account-data cleanup deletes outcomes and Threads before dependent records.
- Production currently contains neither new table; Phase 7 has **not** deployed database or Edge Function changes.
- Read-only inspection of the production migration ledger found a pre-existing timestamp drift: production records `20260906022604_early_access_capacity`, while the repository previously named the same applied migration `20260906022023_early_access_capacity.sql`.
- Production `enforce_beta_capacity` and `request_early_access` definitions match the repository migration content, confirming this was ledger/file naming drift rather than a different schema.
- The branch now renames the file to `20260906022604_early_access_capacity.sql`, so the repository history matches the six migrations currently recorded in production before the two V0.1 additions.
- A regression assertion now locks that ledger alignment.
- **No production migration was applied to make this repair.** The two V0.1 migrations still require isolated rehearsal before deployment.

## Automated evidence on the branch

Dedicated tests cover:

- convergence-layer inclusion and ordering in the shared build;
- canonical Home / Chat / Work and Recent vocabulary;
- first-value Start anywhere contract without a profiling questionnaire;
- review-first assistant persistence and uncertain-save recovery copy;
- create/update runtime proposal validation;
- zero Work before approval and exactly one Work item after approval;
- replayed approval returning the same receipt without duplicate Work;
- Thread create/replay/version transitions;
- rejection of unowned Thread links;
- requirement to close through the outcome route;
- terminal closed Thread state;
- atomic outcome + Thread close;
- stale revision rejection;
- cross-Thread outcome idempotency-key misuse;
- Thread/Finish copy remaining separate from diagnosis and automatic memory;
- repository migration history alignment through the current production ledger.

An earlier CI job reached repository build/test execution while the first version of the new fixtures was being corrected. The current dedicated fixtures reflect those corrections. **However, the newest GitHub Actions attempts are returning `startup_failure` before any job starts and expose zero jobs.** Do not claim a green branch until a complete validation workflow runs successfully.

A separate clean-clone run is still required. The current assistant execution container cannot resolve `github.com`, so it cannot substitute for George's independent clean-machine verification.

## GitHub Actions / account blocker

Detailed evidence is in [`GITHUB-ACTIONS-BUILDFAILED-DIAGNOSTIC.md`](GITHUB-ACTIONS-BUILDFAILED-DIAGNOSTIC.md).

Healthy control on `main`:

- run `34092697639`;
- workflow `Validate akilii`;
- workflow id `351104574`;
- path `.github/workflows/ci.yml`;
- conclusion `success`;
- commit `f0679c0590b1c0193a387ba4c39b00fbc957cced`.

Representative broken Phase 7 PR runs resolve to synthetic workflow id `352079463`, path `BuildFailed`, conclusion `startup_failure`, with **zero jobs**. The healthy and failing branches use the exact same `.github/workflows/ci.yml` blob: `e38ecfa58f4f027ef11945456ec137b8131dc98b`.

A second, concrete platform prerequisite has now surfaced: attempts through the connected GitHub identity to update PR metadata/comments return `403 · At least one email address must be verified to do that.` GitHub's official account documentation states that unverified accounts cannot create or use GitHub Actions.

**Resolution order:**

1. Verify at least one email address on the `andreskepple` GitHub account and generate a fresh PR event.
2. If the same synthetic `BuildFailed` / zero-job run persists, escalate the workflow-registration packet to GitHub Support; contemporary GitHub Community reports show the same orphan/deleted-workflow signature.
3. George runs the branch independently from a clean machine regardless, so code acceptance is not conflated with the platform issue.

Do not repeatedly rename workflows or weaken tests in response.

## Known gaps that remain material

1. **CI / clean-clone acceptance is unresolved.** First verify the GitHub account email, then re-test Actions; an independent clean-machine run is still required.
2. **New migrations are not rehearsed or deployed.** Repository-to-production history is aligned, but `threads` and `outcomes` still need an isolated migration rehearsal before any production DDL.
3. **Local parity is incomplete.** Desktop-local does not yet provide cloud structured Projects, Threads and outcomes. The UI must continue to gate those capabilities honestly.
4. **Persistence policy is not universally unified.** Existing manual Work/project editors still have direct product writes; this tracer specifically routes assistant-generated persistence through proposal/approval.
5. **No governed learning yet.** Outcome feedback is intentionally non-learning until Slice F adds evidence proposal → approve/edit/reject → explained later use.
6. **FlowState remains unqualified.** Slice G / G06 is separate from this continuity tracer.
7. **Human acceptance remains required.** Browser/device, keyboard, screen-reader, responsive and exact Figma parity have not been certified by these unit/contract tests.
8. **PR metadata mutation is blocked by GitHub account verification.** File writes to the branch work; PR title/body/comments cannot currently be updated through the connected GitHub identity.

## Current authority

- Figma Page 07: `05 · COMMERCIAL GOLDEN PATH · V0.1 BUILD AUTHORITY` (`5184:13582`).
- Figma Page 08: `00 · PHASE 6 — V0.1 DESIGN → BUILD CONVERGENCE AUTHORITY` (`5238:43`).
- Figma Page 08: `01 · PHASE 7 — V0.1 TRACER IMPLEMENTATION STATUS` (`5242:43`).
- Repository contract: `docs/V01-DESIGN-BUILD-CONVERGENCE.md`.
- CI evidence packet: `docs/GITHUB-ACTIONS-BUILDFAILED-DIAGNOSTIC.md`.

The draft PR should remain draft until account/CI resolution or an accepted temporary equivalent, clean-clone evidence, isolated migration rehearsal, product review and technical review are all explicit.
