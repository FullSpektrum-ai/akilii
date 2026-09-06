# Functional Prototype Build Playbook

## Recommendation

Use the tools sequentially only when each stage has a distinct purpose and a declared output. The recommended default is:

```text
PRD + contracts
→ Figma implementation source
→ Figma Make interaction spike (optional, disposable)
→ Codex canonical application build
→ Lovable only for bounded alternate UX/scaffold experiments
→ Codex integration/hardening
→ verification against Figma + contracts
```

If the team has stronger Lovable expertise or an existing Lovable/Supabase baseline, Lovable may create the initial application scaffold and Codex may harden it. Do not ask both Lovable and Codex to independently build the same canonical application and then attempt a visual merge.

## Tool roles

| Tool | Best role | Not authoritative for |
|---|---|---|
| Figma | Canonical UX, components, variables, responsive states, prototype flows, node-level traceability | Runtime contracts, data policy, production behaviour |
| Figma Make | Rapid interactive design validation from bounded Figma frames | Production architecture, durable backend, security/privacy claims |
| Codex | Repository-aware implementation, contracts, migrations, adapters, tests, refactoring, verification | Unapproved product/design invention |
| Lovable | Fast application/UI scaffold, Supabase-oriented CRUD/auth spike, alternate interaction experiments | Final architecture unless exported, reviewed, tested, and adopted |

## Non-negotiable source-control rule

At any moment, one repository/branch is the canonical implementation authority. Generated outputs enter it through a reviewed commit or patch. Never allow Figma Make, Lovable, and Codex to edit the same files concurrently.

Every generated stage must state one of:

- **Disposable spike:** evidence only; never merged.
- **Candidate implementation:** may be adopted after review.
- **Canonical implementation:** accepted into the repository with tests and traceability.

## Prototype fidelity levels

| Level | Purpose | Backend | FlowState | NPR | Acceptance value |
|---|---|---|---|---|---|
| L0 Clickable | Validate information architecture and language | None | None | Fixtures | Design evidence only |
| L1 Interactive UI | Validate states/responsive flow | Local mock/fake API | Fake normalized events | Synthetic fixture | UX evidence; not runtime proof |
| L2 Integrated walking skeleton | Validate boundaries | Real app API/data | Real pinned runtime for one flow | Minimal canonical store | Gate 2 evidence |
| L3 Closed-loop prototype | Validate thesis | Real product/NPR/outcome paths | Real vertical slice | Governed lifecycle | Gate 3 evidence |
| L4 Pilot candidate | Validate quality/operations | Hardened | Observed/fallback tested | User controls/export/deletion | Gate 4/5 evidence |

## Track A — Figma only

Use when the question is navigation, comprehension, cognitive load, or interaction sequence.

Inputs:

- PRD §§1–7 and requirements catalogue;
- UX/Figma implementation spec;
- synthetic fixtures;
- approved copy and feedback pattern.

Outputs:

- implementation-grade frames and components;
- clickable canonical flow plus exception branches;
- exact node references;
- annotated decisions/open questions;
- usability test script and findings.

Stop here if the unanswered question is still about user comprehension. Code does not resolve unclear product behaviour.

## Track B — Figma → Figma Make

Use for a fast, interactive browser-like prototype of one approved Figma flow.

Procedure:

1. Select exact frames and components; exclude exploration/archive pages.
2. Supply the Figma Make prompt from the prompt pack.
3. Use local synthetic data and `FakeSupportRuntime` event fixtures.
4. Implement all visible run, gate, feedback, context-control, and partial-failure states.
5. Test responsive behaviour and keyboard flow.
6. Record differences from Figma as findings, not silent design updates.
7. Decide: discard, feed findings back to Figma, or adopt as candidate code after engineering review.

Figma Make output cannot prove FlowState orchestration, NPR governance, security, privacy, or production accessibility by itself.

## Track C — Figma → Codex

Use for the canonical engineering prototype when a repository baseline exists.

Procedure:

1. Codex audits the repository, instructions, current changes, tests, stack, and duplicate/stale paths.
2. Import Figma information by exact frame/node references and design tokens.
3. Implement the walking skeleton with fake contracts first.
4. Add canonical product/NPR persistence and migrations.
5. Implement `SupportRuntime` and `FlowStateAdapter` contract tests.
6. Replace the fake adapter on the acceptance path with the real pinned FlowState runtime.
7. Close Outcome→Learn and verify later adaptation.
8. Run contract, isolation, E2E, accessibility, performance, failure, and recovery checks.
9. Update traceability and ADRs with every material choice.

Codex should modify existing healthy patterns rather than generating a parallel application.

## Track D — Figma → Lovable

Use for a fast UI/auth/CRUD prototype when Lovable is the chosen scaffold tool.

Procedure:

1. Create a clean project or explicitly selected existing project.
2. Provide bounded Figma frames, UX spec, entity subset, synthetic fixtures, and “do not build” rules.
3. Build authentication, navigation, conversation shell, project/task UI, My Context, and feedback against a fake runtime.
4. Keep all FlowState and NPR behaviour behind explicit service interfaces.
5. Export/sync the code into a controlled repository.
6. Freeze Lovable changes while engineering reviews architecture, dependencies, permissions, migrations, accessibility, and generated duplication.
7. Adopt via reviewed commits; reject or rewrite weak sections.
8. Use Codex to implement/harden the real FlowState adapter, NPR lifecycle, AIMS-lite, tests, and operations.

Do not expose production secrets or real personal data to prototype prompts or preview deployments.

## Track E — Recommended sequential combination

### Stage 0 — Converge

Owner: technical + product. Inputs: all current code/design assets. Output: canonical asset inventory, vertical slice, named owners, ADRs.

### Stage 1 — Specify in Figma

Owner: design. Output: canonical components, flow, responsive and failure states, node traceability.

### Stage 2 — Validate interaction

Owner: design/product. Tool: Figma prototype or Figma Make. Output: observed findings and revised canonical Figma. Generated code remains disposable unless adopted.

### Stage 3 — Establish application skeleton

Owner: engineering. Tool: choose **one** of Codex or Lovable as scaffold authority.

- Choose Codex when the existing repository and contracts matter most.
- Choose Lovable when rapid UI/auth/Supabase scaffolding matters most and the team accepts a later hardening pass.

Output: authenticated UI with fake typed contracts, tests, and no direct runtime coupling.

### Stage 4 — Integrate with Codex

Owner: engineering. Codex implements or hardens domain services, migrations, NPR, runtime adapter, event normalization, observability, and tests in the canonical repository.

### Stage 5 — Verify

Owner: QA/design/security/privacy. Compare implementation against Figma, requirements, contracts, safety/privacy/accessibility pack, and release gates.

## Context packet supplied to every tool

Include only the relevant sections, but never omit:

```text
Product: akilii Personal Support Intelligence MVP
Proof: one Understand → Support → Act → Outcome → Learn loop
User: individual account only
FlowState: selected runtime behind FullSpektrum SupportRuntime adapter
NPR: canonical structured personal context; separate from runtime memory
AIMS-lite: minimal audit/policy events
External side effects: disallowed in MVP
Do not build: institutions, diagnosis, full FS:One/AIMS/NPR, marketplace, unrestricted agents
Source hierarchy: ADR → PRD → contracts → Figma → backlog → prompt/output
```

Then add exact requirement IDs, frames, fixtures, and acceptance cases for the bounded task.

## Drift-control checklist after each generated stage

- [ ] No new product surface or role was invented.
- [ ] No internal architecture noun became unnecessary user copy.
- [ ] No direct UI-to-FlowState or UI-to-database dependency appeared.
- [ ] No runtime memory became canonical NPR.
- [ ] No high-impact side-effect tool was introduced.
- [ ] All new state has one canonical owner.
- [ ] Loading, failure, denial, retry, cancel, and accessibility states remain.
- [ ] Generated dependencies and licences are reviewed.
- [ ] Synthetic data remains synthetic.
- [ ] Tests and traceability were updated before adoption.

## Prototype definition of done

A functional prototype is complete when a reviewer can:

1. sign in with a synthetic account;
2. skip or complete progressive onboarding;
3. receive visibly adapted support from a bounded context fixture;
4. see a real or clearly labelled fake runtime flow appropriate to the fidelity level;
5. approve or deny a persistent internal action;
6. resume a project/task across sessions at L2+;
7. submit outcome feedback using the approved pattern;
8. review and confirm/correct the proposed learning;
9. see the confirmed learning affect a later interaction at L3+;
10. navigate the core flow by keyboard and recover from an injected partial failure; and
11. identify which evidence is simulated and which is integrated.

