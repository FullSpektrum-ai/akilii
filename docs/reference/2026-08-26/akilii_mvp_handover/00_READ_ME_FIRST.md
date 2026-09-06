# akilii MVP Handover Pack — Read Me First

## Purpose

This pack converts the [definitive MVP PRD](../akilii_definitive_mvp_prd.md) into the minimum supporting material needed for:

- George, Yomi, and other development personnel to estimate, implement, test, operate, and review the MVP;
- designers to turn the current Figma direction into an implementation-grade source of truth;
- Figma Make, Codex, and Lovable to produce useful prototype work without inventing architecture or product scope;
- FullSpektrum to retain traceability from product intent through design, code, data, runtime execution, tests, and diligence evidence.

The pack is deliberately modular. The PRD owns **what and why**. These assets specify **how to hand over, build, verify, and operate**.

## Canonical hierarchy

When documents disagree, resolve them in this order:

1. Approved ADRs for the specific decision.
2. Definitive MVP PRD for product scope, required outcomes, and locked boundaries.
3. Versioned contracts and schemas for system behaviour.
4. Figma implementation specification for approved UX and interaction behaviour.
5. Backlog/work packages for sequencing and ownership.
6. Tool prompts and generated output.

Generated code, Figma Make output, Lovable output, model suggestions, and chat history are **never** canonical merely because they are newer.

## Pack contents

| Asset | Primary audience | Use |
|---|---|---|
| [01 Engineering handover brief](01_ENGINEERING_HANDOVER_BRIEF.md) | George, Yomi, engineering leads | Fast orientation, decisions, ownership, first actions |
| [02 System architecture and state](02_SYSTEM_ARCHITECTURE_AND_STATE.md) | Backend, platform, runtime, security | Components, boundaries, sequences, state ownership, failure modes |
| [03 NPR Phase 0 data and lifecycle](03_NPR_PHASE0_DATA_AND_LIFECYCLE.md) | Backend, data, AI, privacy | Canonical personal-context model and governance rules |
| [04 Runtime, API and event contracts](04_SUPPORT_RUNTIME_API_EVENT_CONTRACTS.md) | Frontend, backend, runtime, QA | Typed boundaries, events, errors, idempotency, AIMS-lite |
| [05 UX and Figma implementation spec](05_UX_FIGMA_HANDOFF_SPEC.md) | Design, frontend, Figma/Figma Make operators | File structure, screens, states, tokens, annotations, handoff criteria |
| [06 Prototype build playbook](06_PROTOTYPE_BUILD_PLAYBOOK.md) | Product, design, prototype engineers | Recommended individual and sequential use of Figma, Figma Make, Codex, Lovable |
| [07 Vibe-coding prompt pack](07_VIBE_CODING_PROMPT_PACK.md) | Tool operators | Bounded prompts for each tool and each stage |
| [08 Build backlog and work packages](08_BUILD_BACKLOG_AND_WORK_PACKAGES.md) | Engineering manager, implementers | Dependency-aware delivery slices and definitions of done |
| [09 Test, evaluation and release pack](09_TEST_EVALUATION_RELEASE_PACK.md) | QA, data/evaluation, release owner | Test strategy, fixtures, UAT, metrics, release evidence |
| [10 Safety, privacy and accessibility](10_SAFETY_PRIVACY_ACCESSIBILITY.md) | Safety, privacy, security, design, QA | Threat/control baseline and blocking review checklists |
| [11 Convergence, traceability and ADRs](11_CONVERGENCE_TRACEABILITY_ADR.md) | Technical owner, diligence reviewer | Asset inventory, traceability schema, decision templates |
| [12 Delivery and operations runbook](12_DELIVERY_AND_OPERATIONS_RUNBOOK.md) | Developers, platform, support | Environments, configuration, deployment, rollback, incidents, handover |

## Locked language for every person and tool

The following statements should be repeated in tickets, prompts, reviews, and handover meetings:

- **akilii is the user-facing product.**
- **The MVP proves one complete Understand → Support → Act → Outcome → Learn loop.**
- **FlowState is the selected MVP orchestration runtime behind a FullSpektrum-owned adapter.**
- **NPR owns canonical longitudinal personal context; FlowState memory owns bounded runtime continuity.**
- **FlowState may propose NPR changes but may not directly mutate NPR.**
- **AIMS-lite is a minimal audit-and-policy event layer, not full governance.**
- **FS:One is a wider infrastructure direction, not the MVP.**
- **FS:Insight is a reusable domain reference, not MVP UX.**
- **The current Figma outcome-feedback pattern is the reference for closing the learning loop.**
- **No mocked orchestration path can satisfy MVP acceptance.**

## Recommended handover sequence

### Session 1 — Product and boundaries (60 minutes)

Read the PRD, this index, and the engineering brief. Agree the vertical slice, named owners, canonical repositories, and unresolved decisions. Record changes as ADRs or PRD amendments.

### Session 2 — Architecture and data (90 minutes)

Review the system/state specification, NPR lifecycle, runtime contract, security/privacy boundaries, and failure behaviour. Produce contract fixtures before feature implementation.

### Session 3 — Design and acceptance (60 minutes)

Review the Figma handoff spec, screen/state matrix, accessibility behaviour, test pack, and traceability columns. Attach exact Figma node references to all core-loop requirements.

### Session 4 — Delivery start (45 minutes)

Select work packages, confirm environments and CI, assign the first walking-skeleton slice, and agree the evidence required to pass each gate.

## Entry checklist for engineering

- [ ] Canonical akilii repository identified and builds locally.
- [ ] FlowState repository/version/integration method identified.
- [ ] Current Figma file, pages, branches, and ownership identified.
- [ ] Named product, technical, design, runtime, NPR, privacy/safety, QA, and release owners assigned.
- [ ] Locked, preferred, and TBD decisions accepted or challenged through ADRs.
- [ ] Vertical-slice scenario chosen.
- [ ] Environment/configuration responsibility assigned.
- [ ] Contract-first test fixtures agreed.
- [ ] Known mock/stale/duplicate implementations tagged in the convergence inventory.
- [ ] No developer is relying on an undocumented ChatGPT conversation as the source of truth.

## Exit checklist for handover

Handover is complete when another competent developer can, without private context:

1. explain the MVP and its exclusions;
2. locate the canonical design, repositories, contracts, schemas, ADRs, and test evidence;
3. run the product and the real FlowState-backed vertical slice;
4. identify the canonical owner of every material state item;
5. make a safe change and prove it with tests and traceability;
6. deploy, observe, roll back, and investigate the build using the runbook; and
7. distinguish prototype evidence from production-ready implementation.

