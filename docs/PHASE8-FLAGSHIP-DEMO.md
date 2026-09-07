# Phase 8 flagship demo — George's handoff

Baseline: `phase7-v01-tracer`, commit `d78340b689e6d757cdac6542b4d2d2fa65628748`.
Review branch: `codex/phase8-flagship-demo`. PR #1 remains draft and unchanged.

## Run

Use Node 24. Run `npm ci`, `npm run build`, then `npm run dev`.
Open **http://127.0.0.1:4317/?phase8=demo**, enter the space, and choose **Start flagship story**.
No keys, real account, model service or FlowState is needed. Use fictional information.

Explicit demo proposals, approved Work, receipts, Thread and outcomes are held in browser storage under `akilii-phase8-synthetic-v1`. Drafts, support choices and traces stay in page memory. Reload restores approved Work and held Threads but clears the unsaved episode. A stale second tab is rejected before writing. This is a fixture adapter, not production authentication or a transactional cloud database.

## Demo path

1. Start the story: the Meaning Field relates a fictional opening, waiting technical review, deferred workshop and open question to Thursday's meeting.
2. Change the objective to “Make the opening clear”. Bounded Workset foregrounds actionable/open items; waiting and later items remain available in the held disclosure.
3. Use the contextual **One next move** chip or type “One thing please”. Chips only fill the draft; send remains explicit. The view and composer microcopy adapt without inferring a diagnosis. Inspect **Why this?** and override the representation.
4. Choose **Shape a useful draft**. Write “We help people turn a messy intention into one useful next move.” Propose saving to Work. No Work exists before approval. Cancel once, then propose again and approve to receive a truthful version-1 receipt.
5. Choose **Keep my place for later**, set the next move to “Review the why-now sentence”, and hold the Thread. Reload and resume from Home. Confirm that the last state and next move match exactly.
6. Finish and reflect, record the outcome and close the Thread. Review the support suggestion. **Use for this session** is temporary; **No thanks** declines it. Neither creates a lasting memory or NPR learning.
7. Open **Demo trace** for support source, measured latency, cost status and overrides. Zero denotes no provider call; unknown provider cost remains null.

The composer and contextual chips float over Home, Chat and Work. Secondary controls, context choices and privacy information remain in the **··· Composer options** popover. The single input grows only with the draft, up to 112px. Final content can scroll clear of the dock. Chips reflect the supplied objective, open question, next move, draft, saved Work or confirmed Thread; they never silently send or save.

## Flags

| URL | Behaviour |
| --- | --- |
| No `phase8` parameter | Baseline application; augmentation off. |
| `phase8=on` | Rules-first support with the normal application backend. |
| `phase8=demo` | Isolated synthetic adapter; no AI provider calls. Voice, attachments, project scope and provider selection are unavailable. |
| `phase8=on&planner=on` | Call the lightweight authenticated endpoint; fall back to local rules if unavailable. |
| `learning=off` | Suppress the conceptual learning proposal. |

**Turn off** removes flags and reloads. It neither erases demo records nor moves them to a real account.

## Code map

- `src/support/contracts.js`: EpisodeContext, SupportProjection and SupportPlan validation. Only explicit/session/confirmed entries with inclusion enabled survive. Unexpected permission/factual fields are dropped; unknown plan fields/components/references are rejected.
- `src/support/resolver.js`: explicit requests, view overrides, included session preferences and bounded defaults. Waiting/later items do not become next actions.
- `backend/support-planner.js`: rules planner plus an optional provider callback seam with timeout and validation fallback. `POST /api/support/plan` uses existing identity, origin, setup and request-size checks and writes no product state.
- `src/support/renderer.js`: fixed component registry; DOM text rendering, no generated HTML or model-controlled actions.
- `src/support/index.js`: orchestration, explanation, overrides, Home/Work salience, resume and session choice.
- `src/support/bridge.js`: the sole bridge to existing global app functions. Small explicit hooks replace no core runtime or permission model.
- `src/support/composer.js`, `prompts.js`: floating existing composer controls and contextual chip generation. IDs and handlers are retained. The phone context controls remain accessible in the options popover.
- `src/support/demo-store.js`: synthetic adapter reusing baseline proposal/Thread validators. It checks versions, approval identity, expiry, replay, cancel, storage failure and stale-tab writes. It is not evidence of production backend parity.
- `src/support/telemetry.js`: last 100 metadata-only events, in memory; no messages, drafts or psychological data.

The module is bundled before the shared app; the bridge installs after Phase 7. Hosted auth insertion uses a stable build marker. Synthetic mode skips hosted auth initialization; real auth is unchanged. Home/Chat/Work navigation, Thread and Work semantics, explicit approval, receipts and deterministic state remain the baseline's responsibility. Work salience highlights an exact saved-title match without inventing progress.

## Verification

Worker and hosted frontend builds pass. **68 automated tests pass**, including all 53 existing tests. New tests cover context exclusion, plan rejection, precedence, held items, planner failure/timeout, content-free telemetry, endpoint identity/origin, no planner writes, replay, cancel, storage failure, stale versions/tabs, reloadable Threads and contextual chips.

The complete synthetic journey was exercised in the in-app browser, including approval, receipt, hold, reload, resume, close and session-only choice. The revised floating composer was inspected on desktop and at 390 × 844. Contextual chip insertion and sending were exercised. New controls meet the 44px minimum and there is no horizontal viewport overflow. Native labels/dialogs/disclosures, focus styling and reduced-motion rules are retained; this is not a complete assistive-technology audit.

`tests/phase8-browser.cjs` contains a reproducible browser journey and needs Playwright/Chromium (or `CHROME_PATH`). The standalone runner could not launch inside this machine's app sandbox; the in-app browser supplied the recorded journey. Do not claim the standalone runner passed here.

## Known limits and handoff decisions

- The endpoint currently returns deterministic rules. Its tested provider callback is an extension seam, **not a configured live LLM integration**. No provider key or cost schedule was added. Free prose is not reliably converted into semantic graphs; flagship items are explicit synthetic fixtures. Live-provider quality and cloud deployment require separate acceptance.
- Browser fixture storage does not replace Postgres tenancy, locking or production persistence tests. Structured project CRUD, voice, integrations and local/cloud parity are outside the synthetic journey. Existing unsupported actions return an explicit unavailable error.
- No automatic NPR learning, lasting preference promotion, psychological scoring, external sending, background work or FlowState qualification is claimed. No unsaved draft recovery after reload.
- Normal builds and tests are covered; no production deployment, schema migration, merge or release was performed. The new feature is off by default.
- This demonstrates the support-and-continuity hypothesis, not efficacy, protected IP, beta demand or valuation. The supplied internal target is £500k at £6.5m pre-money. Upside needs real usage, outcomes and commercial/IP evidence. Do not present synthetic results or zero-provider demo costs as production evidence.

### Composer refinement
The floating composer rests at 58px and grows upward with wrapped text, bounded by viewport height. Selected approaches, models, Work lookup, project context, reviewed attachments and explicit session support appear inside the input when applicable. Removing a token updates its underlying selection; no NPR learning or plugin connection is implied. The synthetic demo still disables unsupported integrations. Context is read through the legacy bridge, not inferred from typing.

Verified at 980×934 and 390×844: rest, wrapped input, clear, explicit support selection/removal and horizontal overflow. The workspace clips outer focus scrolling while its content panes remain scrollable. This is not a complete screen-reader or device-keyboard audit. Live attachments, project and provider choices require connected beta verification.
