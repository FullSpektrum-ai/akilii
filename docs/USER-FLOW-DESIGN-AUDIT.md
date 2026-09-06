# User-flow ↔ screen ↔ component audit

6 September 2026 · source baseline `07fa925` · package 0.1.0-alpha.8 · audit, not release acceptance.

## Verdict

**Gaps exist on both sides.** The design board is richer than the implementation in governed context, outcomes, learning and recovery. The application is richer than the mapped design contracts in identity/admission, desktop modes, live voice, model selection and adaptive presentation.

The priority is to close connected journeys, not reproduce every frame. Shared web/desktop markup reduces visual divergence but does not establish local/cloud behaviour parity. No completeness percentage is warranted.

## Evidence and limits

Read alongside the [requirements audit](HANDOVER-ALIGNMENT-AUDIT.md), [architecture handover](FULL-STACK-HANDOVER.md) and [engineering sequence](GEORGE-IMPLEMENTATION-SEQUENCE.md).

- [Screen inventory](audit/figma-inventory-2026-09-06.json): live Figma returned 28 pages; Page 05 contains 124 named CORE/STATE/EDGE/ROUTE frames and nine inspected Page 07 sections contain 68 frame children. These include variants and overlapping generations.
- [Component evidence](audit/figma-component-contracts-2026-09-06.json): live Page 02 master index plus selected composer, panel and context state contracts.
- Source review: shared app, auth/admission, mobile shell, voice, GenUI and current architecture/requirements reconciliation. This is structural and behavioural mapping; not an exhaustive pixel comparison or fresh end-to-end qualification.
- Page 04 maps Golden Path, Context Governance, Learning/Memory, Recovery and Navigation. Page 11 includes a withdrawn adversarial QA section; its presence does not certify acceptance.
- “Unmapped” means no accepted screen/component mapping was established in this audit, **not** proof that no relevant frame exists anywhere in Figma. Existing patterns should be searched and reused before drawing additions.

Status: **I** = implementation gap; **D** = design/state mapping gap; **C** = conflicting contract; **V** = acceptance evidence missing. All rows below remain open. P1 means necessary to converge the intended beta journey; P2 is secondary unless it blocks the chosen acceptance scenario.

## Bidirectional journey register

Figma links identify representative sources, not approval of every variant. Source links identify implementation entry points, not proof that the whole flow works.

| ID / priority | Journey: entry → intended exit | Design screen / component | Current implementation and gap | Direction / closure |
|---|---|---|---|---|
| UF01 · P1 | Splash → verified identity → eligible workspace | Auth/admission flow unmapped; reuse [Button](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4352-659) primitives | [auth-entry](../src/auth-entry.js) implements options, email-code and access states; provider configuration and cross-platform return qualification vary | D/V: specify Google/Microsoft/email, code resend/expiry, cancelled return, session expiry, unavailable provider and device-only alternative; test web and native return |
| UF02 · P1 | Request early access → seat or waitlist → admission/withdrawal | Dedicated capacity/admission states unmapped | Same auth source has full/waiting/blocked/withdrawal branches; 30-seat policy exists but operator promotion and user notification journey need mapped acceptance | D/V: distinguish account from seat; demonstrate concurrent final-seat requests and promoted/withdrawn states without using real cohort accounts |
| UF03 · P1 | Maiden voyage → optional discovery → reviewed first context → first useful activity | [Discover](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-13952), [Understand](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-14408) | [app](../src/app.js) and [voice picker](../src/voice-picker.js) provide a different setup flow; interruption, resume and versioned synthesis incomplete | I/C: reconcile MP-04 mandatory review with later optional discovery; preserve usable no-profile path and an editable review before saving |
| UF04 · P2 | Home → orient → choose activity | [Home](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-13036), ContinuationCard / SuggestedActionItem | Home exists but capacity/focus semantics do not map fully | I/C: agree minimum home scope; each suggestion must start/resume the intended activity without inventing capacity scores |
| UF05 · P1 | Ask → compose → send/voice → receive or stop → continue | [ASK](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-13496), [composer](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4612-105821) | [voice-history](../src/voice-history.js) switches empty→voice, text→send, busy→stop; canonical composer names only default/focus/disabled | D/V: add composite voice/send/stop/loading/error/attachment/model states; validate keyboard, accessible names and mobile anchoring |
| UF06 · P1 | Review inferred/proposed context → keep/edit/omit → inspect eligible use | [Understand](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-14408), [ConfirmedContext](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4436-1149) | Preferences/manual memory exist; kept/omitted component semantics are not the complete item lifecycle | I: implement provenance, scope, restriction, expiry and versioned eligibility; rejected/omitted items must not silently become usable |
| UF07 · P1 | Stale or contradictory context → review → reconfirm/replace/omit | [Stale](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1313-6747), [ContextIntegrity](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1800-6670) | No complete governed route found | I: preserve prior item and decision history; skipped review must not count as confirmation |
| UF08 · P1 | Support → editable proposal → approved action → saved/resumable work | [Support](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-14864), [Act](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-15320), WorkPlanStep / ArtefactCard | Response cards, Work and cloud projects exist; local projects and real runtime execution are incomplete | I/V: demonstrate one persisted artefact/task flow; handle duplicate decision, save failure and resume in each supported mode |
| UF09 · P1 | Completed/attempted action → helpful/partial/unhelpful outcome | [Evaluate](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-15802) | Helpful/not-quite message feedback is not action-linked outcome review | I/D: map outcome control family and persist outcome against the intervention/action, with optional explanation |
| UF10 · P1 | Outcome → evidence proposal → approve/edit/reject learning | [Learn](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-16284), EvidenceSourceCard / ConfirmedContext | Manual Remember is not this journey | I: show evidence and proposed interpretation; rejection leaves canonical context unchanged; approval records scope and source |
| UF11 · P1 | New activity → eligible learning used → explanation/correction | [Apply Later](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4581-16740), ContextCue | Context-conditioned chat exists without complete later-use lineage | I: explain the specific eligible item used; correction affects later projection; excluded items stay excluded |
| UF12 · P1 | Context/Memory/Evidence navigation → inspect/control → return | [Routes](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4567-97693), [ReactiveContent](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4523-2160) | Current context tabs/dialogs do not provide full route semantics | I/C: define deep links, provenance, empty/error states, dirty-state protection and return focus; do not equate a tab with route completion |
| UF13 · P1 | Start work → permission → execution → receipt/cancel/recover | [Recovery](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4567-96619), ReactiveContent Processing/Permission/Recovery | Direct bounded Work exists; FlowState remains unqualified | I/C: real run/event IDs, denied/expired gates, partial work, actual cancellation and replay/resume; user-facing process receipts, not hidden reasoning |
| UF14 · P1 | Desktop setup → cloud first → choose local/cloud/hybrid → working capability | Mode/acquisition journey unmapped | [desktop handover](../src/desktop-handoff.js) plus desktop host; local SQLite/Ollama subset; hybrid means workspace choice, not automatic sync | D/I/V: model absent/downloading/failed/unavailable states, explicit data location and cloud consent; no silent cloud fallback |
| UF15 · P1 | Voice choice/preview → permission → conversation → saved transcript | [MicrophonePermission](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1779-126), live voice journey unmapped | [voice picker](../src/voice-picker.js), [voice history](../src/voice-history.js) cover previews and conversation UI | D/V: connect denied/unavailable/reconnecting/interrupted/saved states; verify real device audio and revisit transcript; recommendations remain explainable preferences |
| UF16 · P2 | Upload context → parse → review excerpt → choose use → remove | Full upload/review flow unmapped; reuse evidence primitives | [document tools](../src/document-tools.js) implement review UI | D/V: file type/size/failure/cancel/partial parse and retention states; distinguish uploaded evidence from confirmed personal context |
| UF17 · P1 | Overload support request → choose presentation → continue → reset | ConversationSuggestion exists; complete GenUI/support state mapping absent | [GenUI](../src/generative-ui.js), [smart prompts](../src/smart-prompts.js) provide explicit temporary preferences | D/V: preserve edits/checks across views; easy undo/reset; a pause or typing change must not be presented as detected fatigue or diagnosis |
| UF18 · P1 | Connect account → consent → use bounded integration → revoke/recover | Connector-specific flow unmapped | [Microsoft UI](../src/microsoft-ui.js), [auth](../src/microsoft-auth.js); mode/platform acceptance varies | D/I/V: distinguish login from mailbox consent; scopes, expired consent, offline, uncertain writes and revocation; supported action receipt or honest unavailable state |
| UF19 · P1 | Open mobile workspace → navigate → compose → inspect context → return | [mobile ASK](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1282-8034), [MobileShellHeader](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=4407-1005) | [mobile shell](../src/mobile-shell.js) fixes brand/drawer/composer; 760px switch differs from 960px contract; Peek/Full not qualified | C/I/V: accept breakpoint/status chrome and sheet rules; test 760–959px, keyboard-open, safe areas, focus and landscape |
| UF20 · P1 | Account controls → avatar/export/delete → receipt/return | [DestructiveConfirmation](https://www.figma.com/design/KPWqp1q4FYiT2X2sYEw6yY?node-id=1734-90); avatar/lifecycle receipt mapping incomplete | Generic dialogs and data actions exist | D/I/V: upload/retry/remove state, deletion scope, failed/partial completion and derived/runtime purge; verify isolation and local/cloud scope |
| UF21 · P2 | Download → install → first run → update/recover | Distribution and menu-bar flows unmapped | Published alpha.8 unsigned ZIP bundles; installation docs exist | D/I/V: design honest OS/architecture selection, install guidance and update status; do not call archives guided installers |
| UF22 · P2 | Owner monitors cohort → interprets traction → acts | Operator metrics flow unmapped | Private metrics implementation exists | D/V: role-gate access, distinguish download request from install/activation and active use; missing telemetry must not appear as zero traction |

## Component-level gaps and canonical selection

| Component family | Existing design evidence | Gap to close |
|---|---|---|
| Brand | Brandmark 4337:677 and Wordmark 4337:680; theme/inverse variants | Add a motion contract for slow ambient vs active vs reduced motion; preserve wordmark orientation and contrast. Loading must not imply successful provider connectivity |
| Sidebar | DesktopSidebar **4810:8308**; old UnifiedDesktopSidebar **4398:1092** explicitly legacy | Point handoff at the current master. Map resize limits, collapsed footer/profile/tooltips, active route and phone drawer; avoid mixing old/new masters |
| Messages | UserPill 4507:18164, AssistantResponseCard 4507:74526, UserBlock 4519:1683, AssistantBlock 4519:74612, ActionRow 4516:74618 | Resolve which composition governs prose plus interactive cards; document spacing, long content, code/tables, streaming/error and mobile variants. This audit does not certify bubble pixel parity |
| Composer | 4612:105821: six theme × default/focus/disabled variants | Add orthogonal content, run and voice states rather than an unmanageable combination of duplicate frames; define precedence: active run→stop, drafted content→send, otherwise voice |
| Context panel | 4522:74901 Default/Max/Focus; 4523:2160 eight scenarios per theme | Current three tabs are not all scenarios. Define resizing, mobile sheet, close position, unsaved edits, focus return and route consistency |
| Summary/progress | SummaryChecklistRow 4493:1236, SummaryProgressCard 4494:74097 | Fixture “5 of 5”, “100%” and session summaries must bind to real state; never fabricate completion analytics |
| Personal-context cards | ConfirmedContext 4436:1149 Kept/Omitted; ContextIntegrity 1800:6670 Stale/Contradiction | Implement matching lifecycle controls; map restricted/expired/superseded states without turning every state into a separate full screen |
| Status/feedback | DesktopStatusFooter 1681:4727; InlineFeedback 4420:991 loading/empty/error/offline | Separate connectivity, generation, retrieval and save status. Green “online” is not proof of model, RAG or tool readiness |
| Permission/confirmation | MicrophonePermission 1779:126; DestructiveConfirmation 1734:90 | Reuse visual patterns, but specify distinct microphone, data-use, external-action and deletion consequences; keyboard/failure paths required |
| New product composites | No accepted mapping established for voice chooser, admission, runtime chooser, GenUI views, connector cards or download chooser | Locate existing patterns in Page 02A/other pages, then extend masters only for true gaps; record accepted component IDs and state table |

## Closure order and ownership

1. **Joint contract decisions first:** optional discovery, minimum NPR lifecycle, runtime ownership, responsive geometry and local/cloud capability scope. Link accepted ADR/design exceptions; this audit does not approve them.
2. **André: map existing core designs; George: implement UF06–UF13.** This is the missing differentiated loop: review → act → outcome → learning → later use.
3. **André: regularise newer flows; George: qualify UF01–UF03 and UF14–UF20.** Add concise flow/state contracts for admission, setup, voice, connectors and adaptive presentation; reuse primitives.
4. **Joint release review:** test the single agreed fictional command-centre scenario across web cloud and desktop supported modes, then recovery and accessibility. Finish distribution/operator polish without displacing core gates.

For every gap, close the design side with: canonical node, component master, entry/exit, alternative/error states, copy, keyboard/motion behaviour, persistence consequence and André's review.

Close the engineering side with: route/source, API/schema/event reference, supported-mode matrix, negative-path tests, actual runtime evidence where relevant and George's review. “Implemented”, “designed” and “accepted” must remain separate fields.

## Acceptance packet for each completed journey

- Requirement ID and ladder gate; exact screen/component node and accepted exception.
- Fictional input, intended transition and observable saved result.
- Web cloud / desktop cloud / desktop local availability; hybrid selection semantics.
- Light/dark, phone/tablet/desktop; long text, zoom, keyboard and reduced motion.
- Loading, empty, denied, expired, offline, retry, interrupted and resumed states where applicable.
- Evidence links to PR, release, test and dated human review; unresolved limitations.
- No inference that psychological attributes were confirmed from behaviour; user-chosen support settings remain reversible and explained.

No application or Figma mutations were made by this audit. No runtime, accessibility or release gate is marked passed.

