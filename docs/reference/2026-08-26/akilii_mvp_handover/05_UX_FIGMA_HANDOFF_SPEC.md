# UX and Figma Implementation Specification

## Purpose

Turn the current akilii Figma direction into an implementation-grade design source for the MVP and a reliable input to Figma Make, Codex, or Lovable.

This specification does not authorise redesigning the product. It defines what the canonical Figma file must contain before generated or hand-written implementation is treated as faithful.

## Canonical Figma file structure

Recommended pages:

```text
00 Cover & status
01 Foundations
02 Components
03 MVP flows
04 Responsive states
05 Prototype
06 Handoff & annotations
90 Exploration — non-canonical
99 Archive — do not implement
```

The cover must identify file owner, version/date, branch/status, PRD version, approved pages, and links to requirements/ADRs. Exploration and archive pages must be visibly non-canonical.

## Foundations

Use Figma variables and styles rather than visually similar one-off values.

### Required variable groups

- Colour: surface, content, border, action, semantic feedback, focus, overlay.
- Typography: family, size, weight, line height, letter spacing where supported.
- Spacing: compact-to-expanded scale.
- Radius and border.
- Elevation/effects.
- Layout: content width, gutters, navigation width, breakpoints as documented reference.
- Motion duration/easing plus reduced-motion behaviour.

Modes should cover light/dark only if both are in MVP. Do not create unimplemented theme modes for future use.

Each variable must have a clear semantic name and appropriate Figma scope. Avoid names tied to a single screen, such as `onboarding-blue`.

### Accessibility annotations

- Text/background contrast target.
- Focus-ring colour and thickness.
- Minimum touch target.
- Reading order and landmark intent.
- Live-region/status announcement intent.
- Reduced-motion substitute.
- Plain-language and cognitive-load notes.

## Component inventory

Required component families:

| Family | Minimum variants/properties |
|---|---|
| Button | primary/secondary/tertiary/destructive; default/hover/focus/pressed/disabled/loading |
| Icon button | labelled tooltip/accessibility name; same states |
| Text input/textarea | empty/filled/focus/error/disabled; helper and error text |
| Choice/control | checkbox/radio/toggle where actually used; focus/error/disabled |
| Navigation | desktop/mobile/current item/collapsed states |
| Conversation message | user/akilii/system; streaming/final/error/retry |
| Run status | starting/running/waiting for approval/degraded/completed/failed/cancelled |
| Tool/action card | proposed/running/approval/completed/partial failure/failed/cancelled |
| Context item | assertion/observation/preference/strategy; proposed/confirmed/restricted/conflicted/expired |
| Feedback | prompt, positive/negative/unsure, optional reason, submitted/dismissed |
| Task/next action | open/in progress/done/blocked |
| Empty/error state | informative, recoverable and terminal variants |
| Dialog/sheet | confirmation, context edit/delete, gate approval, mobile behaviour |
| Toast/inline alert | success/info/warning/error; non-blocking vs blocking |

Components must use auto layout for structurally related children, not brittle absolute positioning. Define component descriptions, intended use, prohibited use, content limits, and accessibility behaviour.

## Required MVP screen/state matrix

| Surface | Required screens/states | Primary requirement refs |
|---|---|---|
| Authentication | sign in/create account, loading, invalid input, auth failure, session expired | AK-MVP-AUTH-001 |
| Welcome/privacy | product promise, memory explanation, consent/control route | AK-MVP-ONB-001, PRIV-001 |
| Onboarding | immediate intent, discovery turn, pause/skip, synthesis loading, synthesis review/edit, resume | AK-MVP-ONB-001, NPR-001 |
| Home | new/returning, current priority, recent work, empty/degraded | ACT-001 |
| Conversation | empty, active, streaming, waiting gate, partial failure, offline/reconnect, completed | SUP-001, RUN-002, FBK-001 |
| Work | project, tasks, next action, artefact, empty, completed | ACT-001 |
| My Context | list/filter, item detail, proposal, edit, restrict, delete, conflict, empty | NPR-002 |
| Outcome feedback | current Figma pattern plus keyboard/focus/submitted/dismissed/error states | OUT-001 |
| Settings/privacy | communication/display, export, deletion, help/safety | PRIV-001, ACC-001 |

## Canonical end-to-end prototype flow

The clickable Figma prototype must demonstrate:

```text
Sign in
→ welcome and memory explanation
→ state immediate intention
→ short discovery
→ review initial understanding
→ receive context-aware support
→ approve internal action
→ view persisted plan/tasks
→ record outcome feedback
→ review learning proposal
→ confirm/correct
→ return later and see changed support
```

Include at least one branch for:

- user skips discovery;
- approval is denied/cancelled;
- runtime or tool partially fails;
- context proposal is corrected or rejected;
- keyboard-only interaction and visible focus.

## Screen annotations required for handoff

Every canonical frame needs:

```text
Screen ID and name
Requirement IDs
Purpose and entry condition
Primary and secondary actions
Data read
Data written
AI/runtime behaviour
Permission/policy checks
Loading/streaming state
Empty state
Partial and terminal failure
Responsive behaviour
Keyboard/focus/screen-reader notes
Analytics/AIMS-lite events
Prototype links
Open decisions
```

Do not encode essential behaviour only in free-floating comments; put stable annotations in the handoff page or linked specification.

## Naming and traceability

Use stable names:

```text
Screen/Conversation/Running/Desktop
Screen/Conversation/WaitingForGate/Mobile
Component/ContextItem/Proposed
Flow/CanonicalLoop/Step-07-Outcome
```

Traceability should record Figma file key, page ID, frame/node ID, component/version, and last verified date. Generated tools should receive exact frame links, not a whole ambiguous file.

## Responsive behaviour

For each core screen, provide at minimum:

- narrow mobile frame at or near 320–390 CSS px;
- desktop frame at representative width;
- documented behaviour between them;
- maximum content width and wrapping rules;
- navigation transformation;
- dialog-to-sheet behaviour where relevant;
- long text, zoom, and dynamic content stress state.

Avoid fixed-height content containers unless clipping/scroll behaviour is intentional. Use auto layout and constraints so content expansion does not overlap.

## Content and copy source

Maintain a small copy table with:

- key/path;
- canonical copy;
- purpose;
- error/safety variant;
- reading-level note;
- owner and approval status.

AI-generated response content can use fixtures, but UI labels, consent, privacy, safety, and error copy require human approval.

## Figma Make readiness packet

Before sending a design to Figma Make, provide:

1. one exact canonical flow/section, not the entire file;
2. approved frame and component node links;
3. the locked product/runtime/NPR statements;
4. sample synthetic data fixtures;
5. expected interaction states and acceptance scenarios;
6. token/variable names;
7. instruction to keep generated data local/mocked unless a backend contract is explicitly supplied;
8. output location and status: disposable spike or candidate implementation;
9. explicit “do not invent” list.

## Handoff quality gate

- [ ] Canonical and exploratory pages are unambiguous.
- [ ] All core frames use components and semantic variables.
- [ ] Structural groups use auto layout and reflow under long content.
- [ ] Required screen states exist, including partial failure and denial.
- [ ] Mobile and desktop behaviours are specified.
- [ ] Outcome feedback is traced to the current approved pattern.
- [ ] All Must requirements have exact node references.
- [ ] Components have descriptions and accessibility notes.
- [ ] Text stress, focus order, keyboard and screen-reader behaviour are documented.
- [ ] Figma Make/Codex/Lovable receive only approved frames plus the same contracts.

