# akilii — current build and journey gap audit

6 September 2026. Assessment covers local source through alpha.6 plus the new unshipped smart chips. This is a feature/workflow audit, not pixel-perfect visual acceptance or proof of production readiness.

## Evidence

- Live Figma metadata: canonical core section 4581:13035 in KPWqp1q4FYiT2X2sYEw6yY, including Home, Ask, Discover, Context, Act, Outcome, Learn and Apply Later variants. https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-13035
- Saved 5 September full-board audit and traceability: akilii_V0.1_Figma_Audit.md, akilii_V0.1_Figma_Traceability.json and akilii_V0.1_Figma_Canonical_Mapping.json.
- Development plan: G01–G10 acceptance contracts; PRD-V01-01…10 / TRD-V01-01…10 and proposed ADR-V01-* references.
- Current shared UI, API, desktop host, runtime adapter and George review record.

Figma's top-level listing exposed two pages, but direct access to the known canonical core section succeeded. This is not evidence that other pages were deleted. Whole-board completeness is therefore not newly verified. Several current node names still say Legacy inside a canonical section; component identity and authority need reconciliation before declaring exact visual parity.

## Gap register

| Priority / gate | Design or contract | Current evidence | Required next step |
|---|---|---|---|
| P1 G03 | Identity, return and safe expiry | Google cloud and desktop paths exist; proxy response bug corrected. No complete multi-user packaged acceptance record. | Verify fresh login, expiry, sign-out, restart and cross-user isolation on each platform. |
| P1 G04 | Discover → review synthesis → confirm, skip and resume | Maiden voyage and preferences exist; not a fully governed NPR record lifecycle. | Trace skip/resume and synthesis review; add provenance, restriction, expiry and correction evidence. |
| P1 G04 | Context inspect/edit/restrict/delete | Basic preferences and memory deletion exist. Rich eligibility controls are incomplete. | Demonstrate current instruction priority and excluded/restricted items never reaching later prompts. |
| P1 G05 | Chat → explicit Work → editable artefact → resume | Saved Work exists; cloud projects exist. Local workspace route returns no projects and does not implement project CRUD. | Implement local projects or clearly gate those controls; qualify repeat/expired approval and state consistency. |
| P1 G06 | Real specialist/tool execution with recovery | Bounded read-only Work lookup added; Gemma synthetic selection passed. Cloud code deployed, authenticated acceptance pending. FlowState not qualified. | Complete full runtime workflow with receipts, cancellation, retry, cost/latency and ten scenario runs. Read-only lookup does not pass G06. |
| P1 G07 | Outcome → evidence-linked learning proposal → approve/edit/reject → later use | Helpful feedback and manual Remember exist separately. No complete linked learning loop. | Implement outcome-to-proposal linkage and confirm/reject/contradiction handling; demonstrate a later session. |
| P1 G08 | Lifecycle progress/receipt and recovery | Basic export/delete exist. Background job states, restore and operational proof incomplete. | Verify all stores and modes, retention truth, recovery and actionable failures. |
| P1 release | Desktop/web parity and distribution | Shared UI has exceeded local routes repeatedly. Unsigned ZIP app bundles exist locally. | Route/capability matrix; platform acceptance; signing/notarisation and guided installers if retained in scope. |
| P2 G01/G08 | Mobile, keyboard, zoom, calm and dark/light states | Responsive implementation and tokens exist; complete journey-level verification absent. | Test at 390px/1440px, keyboard-only, 200% zoom and reduced motion across required screens. |
| P2 product | Home capacity control, Now/Next and focus action | Explicit capacity-control and Start focus nodes in live Figma; equivalent complete persisted workflow not established in code. | Decide the V0.1 subset; do not invent capacity scores or simulate timers/reminders. |
| P2 product | Adaptive conversation guidance | Existing starters were mostly entry-point prompts. New chips support current question, draft, attachment and selected project. | Visual/keyboard review; observe usefulness with testers. No response-time inference or automatic sending. |
| Later scope | Connections, institutional/team, broad analytics | Some connector code exists, but desktop external OAuth is unfinished. Original Figma audit classified Connections post-V0.1; later user requests expanded scope. | Record scope change explicitly; separate requested integrations from minimum beta gates. |

## Specific missing or incomplete screens/states

- Invalid/expired invite, expired desktop callback, and session-expiry recovery with preserved draft require a coherent accepted journey.
- Context provenance, eligibility/restriction, expiry and correction screens are incomplete.
- Outcome review and learning proposal approve/edit/reject screens are not joined into an evidence-backed later-use journey.
- Local project creation, edit, tasks and resume do not match cloud.
- Desktop Microsoft/Gmail connection, reconnection/revocation and permission failure paths are incomplete.
- Tool approvals/receipts, replay and cancellation are not qualified for FlowState.
- Export/deletion progress and failure receipts, restore/rollback and first-cohort support are not accepted.
- Focus/capacity controls exist in design but require an explicit scope decision and real behaviour.
- Download links and release assets are not publicly published: automatic approval review blocked the GitHub push because workspace credits were exhausted.

## Scope and next sequence

André owns product/design acceptance; George owns engineering acceptance. Keep current package version distinct from ladder gates. Prioritise local route parity and G03/G04 evidence, then complete one G05 workflow, G06 runtime execution, and G07 learning. Capacity/focus and extra integrations must not displace isolation, agency, useful outcomes or recovery. This report does not claim missing designs merely because their runtime behaviour is incomplete, nor treat all Figma reference frames as committed V0.1 scope.
