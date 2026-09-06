# akilii sports: foundation branch

6 September 2026 · preparation only · branch `feature/sports-foundation` · base `599699b`.

## Product boundary

Build a football domain module on the shared akilii shell, identity, governed context, Work and runtime adapter. Do not fork the UI or represent the currently unqualified FlowState path as working. Sports is not enabled in the public app by this branch.

The [recovered discovery brief](DISCOVERY-SOURCE.md) describes the available Keriel/Roger context and its limits. No agreed buyer, club pilot, player data rights or acquisition methodology is established. The original full transcripts/dossiers remain discovery inputs. André owns product/design acceptance; George owns technical delivery. A scout/practitioner and player representative should validate the domain workflow before a real-data pilot.

## First reviewable scenario

Use a fictional adult player. A staff member creates a transition case, records intended playing role and transition goals, imports a fictional scouting observation, distinguishes observation from interpretation, invites a player to review what may be shared, and drafts a 30-day development plan. A human approves three actions with owners and review dates. A later check-in records an outcome and proposes a change the player can accept, correct or reject.

For the initial prototype, role changes are explicitly labelled simulations. Do not make a role switcher a substitute for server-side access control.

## User flow and screen contract

| Step | Proposed sports surface | Reuse from akilii | Completion evidence |
|---|---|---|---|
| 1 | Case orientation: role, objective, stage, missing information | Home, workspace preferences | One clear next action; no invented score |
| 2 | Evidence inbox: source, date, author, observation, uncertainty | EvidenceSourceCard, document excerpt review | Original source remains distinguishable from interpretation |
| 3 | Player review: keep, correct, restrict, decline | Context review / ConfirmedContext | No response is not consent; private care content excluded from recruitment views |
| 4 | Role/environment comparison | Structured response cards | Side-by-side evidence and explicit unknowns; no automatic suitability ranking |
| 5 | Transition plan: actions, owners, dates | WorkPlanStep, ArtefactCard, projects | Human approval precedes saved actions; owner and version retained |
| 6 | Outcome review | Evaluate / learning proposal | Outcome linked to an action; proposed interpretation requires review |
| 7 | Later session / handover | Apply Later, context provenance | Only eligible purpose-bound information appears; recipient and sharing scope visible |

These are proposed mappings, not new accepted Figma nodes. Add exact node IDs during design review. Include empty/loading/error/denied/stale/revoked states, phone layout and light/dark variants for the chosen slice.

## Proposed domain records, before migrations

- Case: organisation, subject, purpose, lifecycle stage, responsible staff, status.
- Evidence: case, source reference, author, observed date, recorded date, statement kind (observation/self-report/interpretation), uncertainty, access scope.
- Sharing decision: subject, recipient/purpose, permitted fields, decision, expiry, withdrawal and version.
- Plan/action: case, evidence references, owner, due date, approval/version, status and outcome.
- Learning proposal: originating outcome, evidence, proposed wording, scope, reviewer decision. It must not directly write canonical personal context.

A player is a distinct subject from the signed-in staff user. Existing single-user memory ownership cannot safely stand in for organisation/subject/recipient authorisation. No production schema is created until these relationships and isolation tests are accepted.

## Access and intelligence rules

Keep player-private support separate from shared development plans and recruitment evidence. A scout must not receive private wellbeing conversations merely because they can access a case. A coach may review assigned development work; this does not grant access to all source documents. Use explicit purpose/recipient checks on the server, including exports and model context.

Neuroinclusive support means using reviewed preferences to shape the interaction and plan. Do not infer a diagnosis, personality, motivation or employability from appearance, voice, footage or writing. Do not collapse uncertainty into an authoritative neuropsychographic score. Acquisition decisions remain human decisions; the initial prototype has no automated ranking, valuation or buy/sell recommendation.

No youth/academy data, medical interpretation, live club imports or external write tools in the initial fictional prototype. Those need their own agreed scope and acceptance.

## Engineering sequence

1. Stabilise shared context review and close the core lifecycle gaps; keep fixes on main and merge them into this branch.
2. Confirm the single buyer/workflow hypothesis and acceptance fixture with André; recover full source evidence before claiming alignment with Keriel or Roger.
3. Storyboard the seven transitions using existing components; get product review before adding screens to canon.
4. Implement a disabled-by-default domain entry point and fictional fixtures. No public launch or real identities.
5. Design and test organisation/subject/purpose isolation before storing real player records.
6. Qualify evidence → approved action → outcome → reviewed learning through the shared adapter. Test direct/local capability boundaries honestly while FlowState remains unqualified.
7. Agree a bounded pilot and evaluation baseline before adding paid integrations or broad scouting coverage.

## Proposed decision records

SPORT-001: shared domain module, no separate shell (proposed).
SPORT-002: adult transition/development as first demonstration; recruitment evidence read-only (proposed).
SPORT-003: player-private context separated from club case data by purpose and recipient (proposed).
SPORT-004: no automated acquisition scoring; human-reviewed evidence and unknowns (proposed).

Record final acceptance, alternatives and consequences jointly; do not treat this list as adopted ADRs.

## Pilot measures

Measure time from evidence to reviewed plan, missing evidence resolved, action completion, repeat use, staff usefulness and player-reported agency against an agreed baseline. Record sample size and failures. Downloads are not installations; installations are not active use. Do not attribute performance or transfer value changes without supporting evaluation.

## First branch gate

A reviewer can walk through the fictional case, inspect every source and decision, reject a proposal without saving it, resume approved work and confirm that restricted information never appears in another role's view. CI and design acceptance must both pass. Preparation documentation alone does not pass this gate or divert the core V0.1 delivery commitment.

## Interactive storyboard

Open [the self-contained storyboard](../../prototypes/sports/index.html) in a browser. Seven chapters demonstrate sharing choices, simulated approval, outcomes and reviewed learning. It uses bundled brand assets/fonts and theme tokens, makes no network calls, and stores choices only in memory. It is not connected to live club data or deployed app functionality. Sharing exclusion, plan approval, outcome selection, learning keep/reject and 390/1280px overflow checks passed on 6 September 2026.
