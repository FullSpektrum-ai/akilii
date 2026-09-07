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

## Data lifecycle additions

- New cloud migrations: `akilii.threads` and `akilii.outcomes` with owner RLS.
- Cloud export includes Threads and outcomes.
- Account-data cleanup deletes outcomes and Threads before dependent records.

## Automated evidence on the branch

Dedicated tests cover:

- convergence-layer inclusion in the shared build;
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
- Thread/Finish copy remaining separate from diagnosis and automatic memory.

An earlier CI job reached repository build/test execution while the first version of the new fixtures was being corrected. The current dedicated fixtures reflect those corrections. **However, the newest GitHub Actions attempts are returning `startup_failure` before any job starts and expose zero jobs.** Treat that as unresolved CI infrastructure evidence; do not claim a green branch until a complete validation workflow runs successfully.

A separate clean-clone run is still required. The current assistant execution environment cannot resolve `github.com` from its container, so it cannot substitute for George's independent clean-machine verification.

## GitHub Actions failure is now isolated from repository workflow content

A detailed evidence packet is in [`GITHUB-ACTIONS-BUILDFAILED-DIAGNOSTIC.md`](GITHUB-ACTIONS-BUILDFAILED-DIAGNOSTIC.md).

Healthy control on `main`:

- run `34092697639`;
- workflow `Validate akilii`;
- workflow id `351104574`;
- path `.github/workflows/ci.yml`;
- conclusion `success`;
- commit `f0679c0590b1c0193a387ba4c39b00fbc957cced`.

Representative broken Phase 7 PR run:

- run `34096598394`;
- workflow name empty;
- synthetic workflow id `352079463`;
- path `BuildFailed`;
- conclusion `startup_failure`;
- jobs `0`;
- re-run failed jobs returns `403` because no workflow job exists.

The healthy and failing branches both resolve `.github/workflows/ci.yml` to the exact same blob SHA:

`e38ecfa58f4f027ef11945456ec137b8131dc98b`

The failure therefore occurs before checkout or execution of repository build/test steps. Multiple August–September 2026 GitHub Community reports show the same `BuildFailed` / `startup_failure` / zero-job signature and describe an orphan/deleted workflow registration. This is a strong working infrastructure diagnosis, but it is not an official GitHub root-cause statement.

Do not repeatedly rename workflows or weaken tests in response. Escalate the packet to GitHub Support / the official GitHub Community Actions bug template and request inspection/purge/re-index of the synthetic workflow registration while George runs the branch independently from a clean machine.

## Known gaps that remain material

1. **CI / clean-clone acceptance is unresolved.** The newest Actions runs fail at startup before a job exists; no full green workflow is available for the current head.
2. **Not deployed.** The new migrations and Edge Function code are source changes only; live Supabase has not been changed by this implementation review.
3. **Local parity is incomplete.** Desktop-local does not yet provide cloud structured Projects, Threads and outcomes. The UI must continue to gate those capabilities honestly.
4. **Persistence policy is not universally unified.** Existing manual Work/project editors still have direct product writes; this tracer specifically routes assistant-generated persistence through proposal/approval.
5. **No governed learning yet.** Outcome feedback is intentionally non-learning until Slice F adds evidence proposal → approve/edit/reject → explained later use.
6. **FlowState remains unqualified.** Slice G / G06 is separate from this continuity tracer.
7. **Human acceptance remains required.** Browser/device, keyboard, screen-reader, responsive and exact Figma parity have not been certified by these unit/contract tests.
8. **GitHub write identity is partially blocked.** Attempts to update PR #1 metadata and create a repository tracking issue through the connected GitHub API were rejected because the connected GitHub identity has no verified email available to those mutations. File writes to the branch work normally. Treat this document as the current branch status until PR metadata is updated through a GitHub identity that can edit it.

## Current authority

- Figma Page 07: `05 · COMMERCIAL GOLDEN PATH · V0.1 BUILD AUTHORITY` (`5184:13582`).
- Figma Page 08: `00 · PHASE 6 — V0.1 DESIGN → BUILD CONVERGENCE AUTHORITY` (`5238:43`).
- Figma Page 08: `01 · PHASE 7 — V0.1 TRACER IMPLEMENTATION STATUS` (`5242:43`).
- Repository contract: `docs/V01-DESIGN-BUILD-CONVERGENCE.md`.
- CI evidence packet: `docs/GITHUB-ACTIONS-BUILDFAILED-DIAGNOSTIC.md`.

The draft PR should remain draft until CI or an accepted temporary equivalent, clean-clone evidence, product review and technical review are all explicit.
