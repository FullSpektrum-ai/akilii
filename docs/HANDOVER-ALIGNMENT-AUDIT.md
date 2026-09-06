# README, architecture and Figma alignment audit

6 September 2026 · reviewed source `cbdc7009837a91e14431231f8dc7ffd8ebae7cb3` · alpha.8.

## Verdict

**The previous README was insufficient for independent full-stack takeover. The build only partially implements the original PRD/TRD and Figma journeys.** It contains useful implementation, but feature breadth has overtaken contract convergence. A repaired shell is not completion of the governed support/learning product.

This audit recovered the original requirements from the task **Create akilii MVP PRD**, read the NPR/runtime/state/operations contracts, inspected current source and CI, and queried live Figma. It did not test every screen, inspect the AWS account, rerun all live providers or certify deployment security. The README and handover corrections are documentation changes; no Figma designs or application behaviour were changed by this audit.

## Documentation findings

| Priority | Finding | Consequence | Correction / owner |
|---|---|---|---|
| P1 | README called the product a V0.1 beta; actual package is alpha.8 with incomplete gates | George/investors could misread readiness | README now distinguishes release numbering and gate acceptance; joint sign-off still needed |
| P1 | Original PRD and 13 linked specs existed outside the repo | Clean clone lacked the intended engineering contract | Preserved unchanged under `reference/2026-08-26`; source hashes recorded |
| P1 | README said autonomous invocation disabled; later code includes bounded Work selection | Runtime behaviour ambiguous | Document read-only direct-provider loop separately from FlowState |
| P1 | Desktop README described only a launcher; review notes described several incompatible generations | Wrong code path could be extended | New current-state handover identifies shared host, cloud proxy and local subset |
| P1 | AWS proposal mixed with past local health claims | A service could be assumed deployed/operable | Document proposed topology and missing manifest; no current AWS deployment proof |
| P1 | No accepted ADR record set found; two namespaces appear in sources | Architecture changes lack traceable adoption | Preserve ADR-001–010 and ADR-V01-001–010; reconcile, do not silently renumber/accept |
| P1 | No clean-clone deployment/restore evidence or environment manifest | George cannot independently own operations yet | Takeover checklist and source/service map added; live rehearsal still required |
| P2 | README omitted Claude and retained old test counts | Stale operational guidance | Model source linked; current verification stated with limits |
| P2 | Earlier audit said downloads unpublished and chips unshipped | Historical findings looked current | Supersession notice and new baseline required |
| P2 | Browser test files contain author-machine dependencies | CI/George cannot reproduce every UI check | Portable browser test setup and CI registration remain work |

## PRD/TRD reconciliation

The original [PRD](reference/2026-08-26/akilii_definitive_mvp_prd.md) is a requirements baseline, not proof of completion. The [NPR specification](reference/2026-08-26/akilii_mvp_handover/03_NPR_PHASE0_DATA_AND_LIFECYCLE.md) and [runtime contract](reference/2026-08-26/akilii_mvp_handover/04_SUPPORT_RUNTIME_API_EVENT_CONTRACTS.md) define observable guarantees, even where indicative endpoint names change.

| Requirement | Current evidence | Gap / next acceptance |
|---|---|---|
| AK-MVP-AUTH-001 | Supabase verified identity/session, admission, private ownership; native PKCE and email transport | Complete multi-user/provider/platform negative-path acceptance; Microsoft SSO configuration pending |
| AK-MVP-ONB-001 | Guided maiden voyage, voice proposal/review and first conversation | Coherent skip, interruption, resume and synthesis-version lifecycle across modes |
| AK-MVP-NPR-001/002/004 | Profile/workspace preferences, approved memory and paused-context flag | Missing full item tier/provenance/sensitivity/purpose/expiry/supersession semantics and versioned projection with exclusion reasons |
| AK-MVP-NPR-003 | No active FlowState path can write canonical NPR | Absence of runtime is not proof that the real proposal boundary passes; test when integrated |
| AK-MVP-SUP-001/002 | Context-conditioned chat, explicit support preferences, GenUI presentation | Controlled quality/conflict evaluation and policy-grounded context selection still required |
| AK-MVP-RUN-001 | FlowState SSE adapter and investigation | No qualified real FlowState workflow in either application; G06 unmet |
| AK-MVP-RUN-002 | Streaming/stop/error handling and application records | Full start/resume/after-event/gate/status/cancel contract is not established; browser abort is not external-work cancellation |
| AK-MVP-ACT-001 | Work/version handling and cloud projects/tasks | Local project CRUD parity and complete approved action/resume sequence |
| AK-MVP-OUT-001 | Helpful/not-quite feedback exists | Not the complete helpful/partial/unhelpful outcome linked to intervention/action |
| AK-MVP-LRN-001/002 | Manual Remember and saved preferences | Outcome → evidence proposal → approve/edit/reject → eligible later use remains missing as a connected workflow |
| AK-MVP-GATE-001 | Scoped Work proposal checks and internal transport | Qualify real runtime gate decisions, expiry, denial, idempotency and cancellation |
| AK-MVP-AUD-001 / OBS-001 | Application events/usage and private traction report | Full AIMS-lite normalized catalogue, projection lineage and cross-runtime correlation not proven; traction is not AIMS-lite |
| AK-MVP-PRIV-001 | Export/deletion implementations | Store-by-store lifecycle receipts, derived/runtime purge and restore/retention policy acceptance |
| AK-MVP-ACC-001 | Responsive shell, keyboard affordances, reduced motion | Whole-loop keyboard/screen-reader/zoom/browser/device acceptance, not just no overflow |
| AK-MVP-FBK-001 | Basic errors/retries and local/provider unavailable states | Persisted partial work and resumable event recovery across actual runtime failures |
| NFR-REC/REL/OBS | Limited tests and CI | No dated restore drill, SLO/load proof or complete correlation dashboard found |

The original runtime contract requires versioned normalized events and machine-readable schemas. Ad hoc validation/tests do not establish complete consumer/provider contract conformance. Its route names are indicative: `/api` instead of `/v1` alone is not a defect.

The [5 September delivery plan](reference/2026-09-05/akilii_V0.1_Development_Plan.docx) is also preserved for comparison. Its G01–G10 ladder and ADR-V01 namespace are distinct from the original PRD gates and ADR-001–010. Neither namespace should be silently replaced.

## Source and scope conflicts requiring decisions

1. **FlowState ownership:** Page 08 says FlowState owns sessions/permissions/orchestration and the frontend must not create a parallel engine. The 5 September plan instead explicitly proposes a product-owned interchangeable boundary. Current code implements direct-provider behaviour and application state. Resolve ADR-001 with ADR-V01-002/003; do not pretend these agree already.
2. **Mandatory discovery:** Figma MP-04 gates UNDERSTAND → SUPPORT on reviewed context; the later delivery plan allows skipping discovery/no-profile support. Preserve user choice and record the accepted route, rather than copying the old guard blindly.
3. **Scope expansion:** the original plan excludes native apps and email/calendar actions; later user requests add desktop, Microsoft, voice, model choice and early-access metrics. Those requests authorise the work, but their schedule, privacy, tests and gate impact still need a written change record. They do not replace the required learning/runtime loop.
4. **NPR semantics:** memory/profile convenience is not equivalent to the specified personal-context lifecycle. Decide the minimum compliant subset jointly and retain correction/restriction/expiry/provenance, rather than introducing inferred psychological scores.
5. **Responsive authority:** Page 08 specifies mobile shell below 960px, status+app header 108px and a Peek/Full context sheet. Current phone shell switches at 760px with a 60px browser app header and no equivalent qualified Peek/Full sheet. Native status chrome may explain some geometry, but this is an unresolved design exception, not exact parity.
6. **Resizable geometry:** the Figma shell lists specific panel states and 240/64 sidebar widths; the implementation allows resizing. Earlier user requests support adjustability. Document the accepted constraints and dirty-state/focus restoration rather than treating either fixed geometry or arbitrary resizing as automatically authoritative.

No accepted/superseding ADRs are manufactured by this review. Both original decision indexes are proposals or unresolved records. André and George must agree the implementation baseline and exact exceptions.

## Live Figma inventory and coverage

The Plugin API returned **28 pages**. The simpler metadata endpoint exposed only two; that was incomplete visibility, not deletion. Full Page 05 inventory contains **124 named CORE/STATE/EDGE/ROUTE frames**, including desktop/mobile and light/dark variants. Page 07's nine inspected sections contain **68 frame children**, including overlapping first-generation and rebuilt canonical references. These counts are design inventory, not unique features or implementation percentages.

[Captured inventory](audit/figma-inventory-2026-09-06.json) includes seven page-level inventories and the immediate children of nine Page 07 sections. It does not cover every descendant or every one of the 28 pages.

| Design family / representative source | Build assessment | Required reconciliation |
|---|---|---|
| [Page 05 mobile ASK](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1282-8034), [Page 07 ASK](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-13496) | Partial; shared conversation/composer exist and phone layout repaired | Exact components, breakpoints, message/action states, accessibility and device tests |
| [Home](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-13036) | Partial; product home differs from full orient/capacity/focus design | Freeze one useful orient → activity path; decide capacity/focus subset |
| [Discover](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-13952) | Partial; maiden voyage is a different implemented flow | Map skip/resume/review/first value explicitly |
| [Understand](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-14408) | Partial | Reviewed synthesis, edited/omitted items and provenance need lifecycle-backed UI |
| [Support](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-14864) / [Act](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-15320) | Partial; response cards and Work/projects exist | Accept/deny → real work → consistent persisted task/artefact states; local parity |
| [Evaluate](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-15802) | Incomplete connected flow | Helpful/partial/unhelpful outcome with action/intervention linkage |
| [Learn](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-16284), [mobile Learn](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1282-8455) | Missing complete governed journey | Evidence proposal, editable interpretation, keep/reject, exact persistence consequence |
| [Apply Later](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-16740) | Incomplete | Show which eligible confirmed item influenced a later activity and let user correct it |
| [Context / Memory / Evidence routes](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4567-97693) | Context controls partly present; full route semantics absent | Implement evidence lineage, per-item controls, review/reuse links; a context panel tab alone is insufficient |
| [Stale](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1313-6747) / [Contradiction](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1313-6803) | Missing governed states | Reconfirm/replace/omit with no silent promotion or overwrite |
| [Runtime/recovery](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4567-96619) | Partial | Real cancellation/partial failure/resume plus correct retained work |
| [Responsive/accessibility](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=3-6) | Partial | Tablet, mobile sheet, keyboard, screen reader, zoom, contrast and motion matrix |
| [Workflow state contract](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1714-7) | Not implemented end to end | Observed → proposed → confirmed/corrected/omitted → eligible → used → outcome → revalidated/stale/superseded/forgotten |

Do not indiscriminately import all frames. Canonical/reference/legacy authority and later user decisions must be reconciled first. Several frames are alternatives or historical duplicates; an implemented journey may legitimately combine screens, but must preserve their required behaviour.

## Recommended takeover sequence

1. **Converge the contract:** adopt one scenario (original meeting preparation or the requested project command centre), current source manifest and exceptions; preserve existing ADR namespaces.
2. **Close foundation and identity gates:** clean-clone reproduction, auth recovery/isolation, local/cloud capability gating and platform acceptance.
3. **Build the core missing product loop:** synthesis review and NPR control → approved persistent work → outcome → evidence-linked learning → later use. Map PRD ID, exact Figma node, code/API/schema, test and owner for every transition.
4. **Qualify FlowState on the agreed hosting:** record an actual deployable topology, isolation/cancellation/approval evidence and costs. If substituting, use the formal joint decision and equivalent workflow tests.
5. **Harden operations:** staged migrations, restore/rollback, signing, incident ownership, retention, monitoring and a controlled cohort. Extra integrations/visual polish should not displace these gates.

The package version remains alpha.8. No cumulative G01–G10 pass is awarded by this audit. Feature coverage spans parts of G01–G05 and later additions; G06/G07 are substantial product/engineering gaps.
