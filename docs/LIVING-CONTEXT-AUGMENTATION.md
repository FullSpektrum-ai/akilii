# akilii Living Context augmentation

Status: implementation branch `feature/living-context-augmentation`

## Product intent

akilii should become more useful over time because it can use user-authorised context, not because it classifies people into personas, diagnoses, archetypes or fixed psychographic types.

The canonical loop is:

`current intent -> governed context projection -> support policy -> bounded experience composition -> action/work -> outcome -> optional learning proposal -> user decision`

Current explicit instructions always outrank stored preferences.

## Canonical boundaries

### FullSpektrum-owned deterministic control plane

The following are authoritative services, not autonomous agents:

- authentication and tenant isolation;
- NPR lifecycle and ownership;
- purpose/sensitivity filtering;
- context permission controls;
- AIMS policy decisions;
- Thread and Work persistence;
- idempotency and receipts;
- export/deletion;
- runtime/tool/model boundaries.

### Agentic/model-assisted layer

Models may assist with:

- shaping messy input;
- identifying a useful next move;
- drafting possible learning proposals;
- Socratic questioning;
- planning and specialist execution;
- reviewing and verifying complex work.

Model output never gains durable personal-context authority by itself.

## NPR item model

The branch introduces governed NPR items with:

- type;
- stable / semi-stable / dynamic tier;
- lifecycle state;
- confirmation state;
- confidence;
- sensitivity;
- provenance;
- validity / review / expiry fields;
- evidence references;
- use and purpose controls;
- versioning.

Explicit user-authored onboarding/workspace choices can enter NPR as user assertions. Inferred learning remains proposal-gated.

## Context Projection

`ContextProjection` is the only context subset that should be sent into a support or execution decision.

Projection rules:

1. include only active and permitted items;
2. require confirmed / user-asserted eligibility;
3. enforce purpose scopes;
4. enforce sensitivity allowance;
5. exclude expired or restricted context;
6. keep the projection small and ranked;
7. preserve item references and a plain-language relevance reason.

Highly-sensitive context is not projected into cloud model calls in this implementation slice.

## SupportProfile

The compiler converts governed context into bounded interaction policy such as:

- one next move vs bounded workset vs whole-map representation;
- response length;
- decomposition level;
- challenge level;
- initiative level;
- Socratic depth;
- option count;
- verification depth.

This is an interaction policy, not a psychological score or permanent user type.

## Progressive discovery

Discovery continues after onboarding. It is:

- optional;
- one useful question at a time;
- aimed at missing context domains rather than completing a questionnaire;
- stored only through the NPR governance path;
- reversible and inspectable.

The maiden-voyage fields are synchronised into NPR with stable source references so later changes supersede stale values instead of duplicating them.

## Controlled experience composition

`ExperienceSpec` may adapt Home / Chat / Work presentation using real product state and compiled support policy.

It may alter:

- information density;
- dominant-action emphasis;
- whether a resumable Thread is foregrounded;
- whether context transparency or an optional discovery prompt is shown.

It may not:

- invent progress;
- generate arbitrary HTML;
- expose hidden psychographic scores;
- invent readiness/fatigue/motivation state;
- create a new primary product destination beyond Home / Chat / Work.

## Outcome -> learning

A completed Thread can produce a durable learning proposal only when there is explicit user outcome text. A rating alone is insufficient.

The proposal remains unusable until the user confirms it. This prevents episode feedback from silently becoming lasting context.

## Runtime/orchestration boundary

This augmentation does not make FlowState the product ontology and does not qualify FlowState for production traffic.

The current direct runtime remains the V0.1 execution path. Any later FlowState integration must remain behind the FullSpektrum-owned runtime interface and AIMS/Tool/Model gateways.

Most user turns should remain single-agent or deterministic-plus-one-agent. Multi-agent swarms should be reserved for tasks that genuinely benefit from parallelism, specialist disagreement, verification or consequential execution.

## QA approach

The test suite includes behavioural stress scenarios to verify combinations such as:

- complexity collapse;
- whole-map presentation;
- options-first interaction;
- low-pressure microsteps;
- direct challenge;
- resumable short-form support;
- restricted and sensitive context.

These scenarios are regression fixtures only. They are not product personas, segmentation classes or user models, and no runtime branch selects a user type from them.

## Acceptance criteria for this augmentation slice

- same request can be handled differently from confirmed context;
- explicit current request overrides stored preference;
- restricted/expired/sensitive context is filtered correctly;
- Context is inspectable, correctable, restrictable and deletable;
- export/delete includes NPR data;
- onboarding choices synchronise into NPR without duplicates;
- support planning uses Context Projection rather than whole-profile dumps;
- Home/Chat composition is bounded and truthful;
- outcome learning is proposal-gated;
- no persona/archetype classification is required;
- no unrestricted external actions are enabled;
- no production FlowState dependency is introduced.

## Known follow-on work

This branch establishes the Living Context spine. It does not yet claim:

- full production-grade neuropsychographic inference;
- automated contradiction resolution;
- longitudinal confidence calibration from large-scale evidence;
- complete local/cloud NPR parity;
- autonomous cross-connector action;
- distributed durable FlowState execution;
- clinical or diagnostic interpretation.

Those require separate qualification and evidence gates.
