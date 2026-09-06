# akilii generative UI — implementation direction

6 September 2026. Proposed direction, not a claim of shipped capability.

## Product principle

The conversation should produce an appropriate working surface, using canonical components. Keep navigation and controls predictable. Adapt the presentation to the current task and explicit user preferences; do not diagnose overload from typing speed, silence or wording.

## Current foundation and gaps

The response schema supports checklist, decision, project, email and reflection objects. The renderer creates trusted application components from structured data. OpenAI currently has the structured-response path; Anthropic rich responses are disabled, and local structured-card parity is not qualified. Most card actions remain transient or require explicit Save to Work. Home respects the chosen presentation density, but this is not a complete generative workspace engine.

## First implementation sequence

1. Establish provider parity: normalise and validate structured outputs for OpenAI, Claude and qualified local models. If validation fails, offer a useful plain-text answer and recoverable retry. Never stream incomplete JSON as a visible card.
2. Strengthen existing surfaces: turn decisions into selectable options, drafts into editable artefacts, and plans into resumable steps. Keep card IDs, source message and artefact version stable across reloads. Avoid adding many new card types before persistence works.
3. Add presentation choices on each object: One step / Overview / Plain text. Honour the user's selection without regenerating content or losing edits. Explicit preferences can set the initial view; changing a view is not automatic permission to update durable personal context.
4. Connect real tool receipts: show Proposed / Awaiting approval / Running / Completed / Failed / Cancelled only from authoritative state. An animation or generated claim cannot mark a task complete.
5. Close the learning loop: ask whether the format helped; propose a specific, evidence-linked preference; let the user confirm, edit or reject it; show its effect in a later session.

## Task-to-surface examples

| Situation | Useful surface | User control |
|---|---|---|
| Unclear starting point | One short question and two or three editable prompt chips | Dismiss, edit, or type freely |
| Compare approaches | Two or three option cards with tradeoffs | Select an option or add another |
| Prepare a workshop | Editable brief and small checklist | Save, revise, mark actual progress |
| Manage role-based projects | A persistent project command centre built from actual records | Choose columns/views and ownership of tasks |
| Draft correspondence | Editable draft with recipient and subject fields | Explicit review before external action |
| Read a report | Source-labelled summary and selectable questions | Control which excerpts enter the conversation |
| Reflect on what helped | Tentative learning proposal with evidence | Confirm, edit or reject |

## Engineering contract

Use a small versioned component catalogue, strict schema validation, text escaping, limits on card count/content and allowlisted actions. The model supplies data and permitted intent, never executable HTML, JavaScript, SQL or arbitrary URLs. Every mutation is checked server-side against identity, version and current permission. A user-approved action does not grant unrelated tools or broad account access.

Persist artefact content separately from transient display state. Keep separate IDs for response objects, artefacts, tool runs and permission receipts. Runtime adapters must not choose arbitrary UI components or bypass product policy. Sensitive documents remain untrusted source material.

Accessibility includes keyboard operation, stable focus during streaming, readable light/dark states, reduced motion, no forced layout rearrangement and a plain-text equivalent. Avoid turning every answer into a dashboard: ordinary conversation may need no object.

## Acceptance examples

- The same synthetic task renders a useful validated object through each supported provider.
- Switching One step to Overview preserves content, edits and completion state.
- Refresh restores saved artefacts; temporary checks are explicitly temporary.
- A proposed external action never renders as completed before its receipt.
- Rejected learning leaves personal context unchanged.
- Keyboard, mobile, dark/light and reduced-motion journeys pass with a plain-text fallback.

Owners: André for canonical patterns and usefulness; George for contracts, persistence and execution guarantees. This work supports G04–G07; it does not substitute for FlowState or release qualification.

## Implemented in alpha.7

Shared web/desktop cards now offer One step, Overview and Plain text without regeneration. Decision options prepare an editable prompt; email cards support editing and saving to Work. In-card checks and unsaved edits remain temporary.

A user-initiated check-in offers focus, gentler pace and an alternative explanation. It changes presentation for the open session and sends an allowlisted response-style instruction on subsequent messages. It does not infer fatigue, distraction or disengagement from timing, typing, camera or microphone, and does not write these states to the profile. Users can undo the change; explicitly chosen card views are retained.

Claude and local providers receive the response schema, with plain-text fallback. Live provider quality and comprehensive native acceptance remain to be verified. This is an alpha review increment, not acceptance of the V0.1 release gates.
