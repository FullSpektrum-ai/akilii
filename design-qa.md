# Design QA — akilii alpha.9 / FlowState hybrid

Date: 2026-09-09

## Target and implementation

- Reference: the existing akilii Home / Chat / Work shell running locally at `http://127.0.0.1:4317/`.
- Hybrid shell: the same shared application build used by web and Electron; no second customer-facing FlowState UI was introduced.
- Runtime operator UI: `http://127.0.0.1:5173/`; retained as FlowState developer/operator tooling, in line with the Phase 7 architecture.

## Visual comparison

PASS — the customer-facing shell remains the existing akilii visual target: left navigation, central Chat canvas, right context panel, serif prompt heading, prompt cards and bounded composer. The migration changes the runtime status surface, not the shell hierarchy or visual language.

PASS — no FlowState agent, swarm or session vocabulary was added to primary user navigation. Provider/model choice remains visible and explicit in the composer.

PASS — unauthenticated access to the FlowState operator UI now redirects to its sign-in page instead of leaving the Chat screen in a failed-session state.

## Interaction and architecture checks

PASS — the shell creates and reuses authenticated FlowState sessions without exposing provider credentials to the renderer.

PASS — login, session listing and message creation no longer fail with the earlier Unauthorized/Forbidden CSRF mismatch.

PASS — the Integrations explanation keeps akilii as authority for identity, context, Work, approvals and receipts.

PASS — the selected OpenAI model is applied to the FlowState session and the completed response is returned to the akilii Thread without silently relabelling it as Anthropic.

PASS — a first message and a follow-up completed in the akilii shell, remained in the same Thread, and exposed Save to Work/Remember as review actions rather than automatic writes.

PASS — four Phase 0 specialist manifests and two bounded sequential swarm manifests are source controlled. They remain internal and staged; users continue to interact with one akilii voice.

PASS — responsive shell behaviour is unchanged by this migration.

## Verification evidence

- Full application suite: 86 passed.
- Production bundle: built successfully.
- Focused FlowState authentication suite: passed, including the authenticated session-CSRF handoff.
- Docker services: backend, Qdrant and Ollama healthy; UI running.
- Live OpenAI response: `alpha.9 ready`; warm follow-up: `second ready`.
- UI footer: `Build 0.1.0-alpha.9`.

## Remaining performance gate

The proven FlowState strategist runner completes correctly but is still slower than a direct provider call because it carries generic internal tool discipline. The new no-tool akilii companion reduced authority surface but did not reliably reach terminal state in the current FlowState engine, so it is installed only for operator evaluation and is not used for live alpha.9 Chat. Promoting it requires a bounded completion test and a Phase 0 response-time SLO.

final result: passed
