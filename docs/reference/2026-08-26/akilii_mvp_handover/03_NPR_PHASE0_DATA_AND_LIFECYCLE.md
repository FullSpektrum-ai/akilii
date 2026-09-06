# NPR Phase 0 — Data and Lifecycle Specification

## Purpose

NPR Phase 0 is the canonical, user-governed personal-context spine for the akilii MVP. It must be useful before it is comprehensive and must remain distinct from conversation history, analytics profiles, embeddings, and FlowState runtime memory.

## Non-negotiable rules

1. NPR represents akilii’s current understanding, not objective truth.
2. Every material item has type, tier, provenance, confidence, confirmation state, lifecycle state, sensitivity, and control metadata.
3. User assertions and system observations remain distinguishable.
4. Stable, semi-stable, and dynamic describe expected persistence, not certainty.
5. A runtime may propose NPR learning but cannot commit it.
6. Semantic/vector indexes are derived and replaceable.
7. User correction must affect the next eligible context projection.
8. Deletion and restriction must propagate to derived/runtime copies according to policy.

## Conceptual aggregate

```text
NPRSubject
├── ContextControl
├── NPRItem
│   ├── UserAssertion
│   ├── Preference
│   ├── Observation
│   ├── Goal
│   ├── Friction
│   ├── Strategy
│   └── RelationshipReference
├── ProjectReference
├── EpisodeReference
├── InterventionReference
├── OutcomeReference
└── Evidence
```

Product-domain entities remain in the product store. NPR stores references and support-relevant interpretations rather than duplicating entire projects, tasks, messages, or artefacts.

## Core item schema

```ts
type NprTier = "stable" | "semi_stable" | "dynamic";
type ConfirmationState =
  | "user_asserted"
  | "proposed"
  | "confirmed"
  | "rejected"
  | "not_required";
type LifecycleState =
  | "captured"
  | "classified"
  | "proposed"
  | "active"
  | "contradicted"
  | "superseded"
  | "deprecated"
  | "expired"
  | "deleted";
type SourceType =
  | "user_statement"
  | "user_edit"
  | "outcome"
  | "system_observation"
  | "import";

interface NprItem<TPayload = Record<string, unknown>> {
  id: string;
  subjectId: string;
  itemType: string;
  tier: NprTier;
  payload: TPayload;
  lifecycleState: LifecycleState;
  confirmationState: ConfirmationState;
  confidence: number; // 0..1; policy interprets, model score alone is insufficient
  sensitivity: "standard" | "sensitive" | "highly_sensitive";
  provenance: {
    sourceType: SourceType;
    sourceRef?: string;
    capturedAt: string;
    capturedBy: "user" | "system" | "operator" | "import";
  };
  validFrom?: string;
  reviewAfter?: string;
  expiresAt?: string;
  supersedesId?: string;
  contradictionRefs?: string[];
  evidenceRefs: string[];
  controls: {
    useAllowed: boolean;
    purposeScopes: string[];
    exportAllowed: boolean;
    restrictionReason?: string;
  };
  createdAt: string;
  updatedAt: string;
  version: number;
  schemaVersion: string;
}
```

The physical schema may normalize payload types into separate tables. The contract above defines the minimum observable semantics.

## Minimum item types

| Type | Required payload | Example | Default confirmation |
|---|---|---|---|
| `user_assertion` | statement, domain | “I find long unstructured responses hard to use.” | `user_asserted` |
| `communication_preference` | dimension, preferred value, context | concise with optional detail | Confirm durable change |
| `support_preference` | strategy/style, context | offer one next action first | Confirm durable change |
| `observation` | hypothesis, scope, limitations | three small steps appeared more effective in two outcomes | Proposed |
| `goal` | title, horizon, status, importance | prepare for Monday meeting | User asserted or confirmed |
| `friction` | description, context, frequency | difficulty beginning ambiguous tasks | Confirm if durable/sensitive |
| `strategy` | description, context, status | three-step decomposition | Confirmed or outcome-supported |
| `relationship_reference` | product entity ref, role label | colleague involved in project | User asserted; minimise data |

## Tier policy

| Tier | Creation | Use | Review | Promotion/demotion |
|---|---|---|---|---|
| Stable | Prefer explicit user assertion/confirmation | May influence eligible runs until restricted/deleted | Periodic review; no arbitrary expiry | Requires user confirmation for inferred promotion |
| Semi-stable | Assertion, confirmed proposal, or repeated evidence | Use when current and context-relevant | Review after contradiction or configured interval | May become stable only with confirmation; may become dynamic if context-specific |
| Dynamic | Current-turn assertion, active episode, deadline, temporary state | Use only in relevant time/scope | Explicit expiry/event closure | Never auto-promote from repeated runtime mentions alone |

## Lifecycle transitions

| From | Event | To | Conditions |
|---|---|---|---|
| Captured | classify | Classified | Type/tier/sensitivity/provenance valid |
| Classified | create proposal | Proposed | Observation or durable inferred update |
| Classified | explicit user assertion | Active | Allowed type; provenance retained |
| Proposed | user confirms | Active | New version and confirmation event |
| Proposed | user rejects | Deprecated/rejected | Candidate no longer eligible for use |
| Active | evidence reinforces | Active | Confidence/review date may change; evidence required |
| Active | evidence conflicts | Contradicted | Do not silently overwrite |
| Active/Contradicted | user/system correction approved | Superseded | Replacement points to prior item |
| Active | expiry | Expired | Dynamic/retention rule reached |
| Any eligible | user deletes | Deleted | Content removed from canonical/derived use paths |

## Proposal policy

An NPR proposal must contain:

- proposed item or change;
- plain-language explanation;
- tier and sensitivity classification;
- evidence references and outcome link where relevant;
- confidence and how it was derived;
- whether confirmation is required;
- expiry/review rule;
- exact consequence of confirm, reject, or restrict.

Do not produce proposals for trivial conversational details, unsupported diagnoses, transient emotion without clear value, or content whose storage benefit is unclear.

## Retrieval contract

```ts
interface ContextProjectionRequest {
  subjectId: string; // server-derived
  purpose: "support" | "planning" | "action" | "outcome_review";
  intentClass: string;
  productRefs?: string[];
  now: string;
  maxItems: number;
  sensitivityAllowance: "standard" | "sensitive";
  policyVersion: string;
}

interface ContextProjection {
  projectionId: string;
  subjectId: string;
  purpose: string;
  items: Array<{
    itemId: string;
    itemType: string;
    tier: NprTier;
    value: unknown;
    confidence: number;
    confirmationState: ConfirmationState;
    relevantBecause: string;
  }>;
  excludedCountsByReason: Record<string, number>;
  generatedAt: string;
  schemaVersion: string;
}
```

Retrieval order:

1. filter by ownership, lifecycle, use control, purpose, sensitivity, and validity;
2. identify product/domain relevance;
3. rank confirmed explicit context above inference;
4. apply bounded structured retrieval;
5. optionally use semantic retrieval only within the already permitted candidate set;
6. return a minimal projection with item references and reasons.

The system must be able to operate with an empty projection.

## Outcome-to-learning rules

- An outcome must reference the intervention/strategy and episode.
- One positive outcome may support a candidate observation, but should not establish an enduring universal preference.
- Repeated consistent outcomes may increase confidence if they are independent enough and contextually comparable.
- Negative outcomes contradict the strategy in that context; they do not prove the opposite strategy universally.
- The user can confirm, narrow, correct, or reject a proposed interpretation.
- Learning records the context in which a strategy helped or failed.

## NPR and memory deletion propagation

```text
User deletes/restricts NPR item
→ NPR item becomes unavailable immediately
→ active projections containing it are invalidated where feasible
→ semantic index entry is deleted/rebuilt
→ future FlowState runs cannot receive it
→ bounded runtime/session purge request is issued when policy requires
→ analytics dimensions are de-identified or removed
→ AIMS-lite records completion without the deleted value
```

Backups, audit events, and provider retention require explicit policy and documented limitations before pilot.

## Seed fixtures for prototype and tests

Use synthetic people only. Do not use founder or real user records as default fixtures.

### Fixture A — concise planner

```json
{
  "subject": "fixture-concise-planner",
  "items": [
    {
      "itemType": "communication_preference",
      "tier": "stable",
      "payload": { "dimension": "response_length", "value": "concise_with_expand" },
      "confirmationState": "confirmed",
      "confidence": 1.0
    },
    {
      "itemType": "support_preference",
      "tier": "semi_stable",
      "payload": { "strategy": "offer_one_next_action_first" },
      "confirmationState": "confirmed",
      "confidence": 0.9
    }
  ]
}
```

### Fixture B — reflective explainer

```json
{
  "subject": "fixture-reflective-explainer",
  "items": [
    {
      "itemType": "communication_preference",
      "tier": "stable",
      "payload": { "dimension": "explanation", "value": "answer_with_rationale" },
      "confirmationState": "confirmed",
      "confidence": 1.0
    },
    {
      "itemType": "support_preference",
      "tier": "semi_stable",
      "payload": { "strategy": "present_options_before_recommendation" },
      "confirmationState": "confirmed",
      "confidence": 0.85
    }
  ]
}
```

### Fixture C — conflict and expiry

Include one stored detailed-response preference, a current explicit request for one short step, an expired dynamic deadline, and a restricted sensitive observation. Expected result: use the short current instruction; exclude expired and restricted items; do not overwrite the stored preference.

## Migration requirements

- Every schema change has forward migration, compatibility window, and rollback/forward-fix plan.
- Migration must preserve provenance, confirmation and user control.
- Imported legacy profile blobs require explicit field mapping; unknown fields remain quarantined rather than inferred.
- Reclassification or confidence recalculation is a versioned batch operation with dry run and audit summary.
- Derived indexes are rebuilt from canonical records after migration.

## NPR acceptance checklist

- [ ] Stable/semi-stable/dynamic are implemented independently of confidence.
- [ ] User assertion and system observation are visibly distinguishable.
- [ ] FlowState cannot directly write canonical items.
- [ ] Every proposal cites evidence and policy.
- [ ] Correction is reflected in the next eligible projection.
- [ ] Restriction/deletion propagates to all defined derived stores.
- [ ] Conflict and expiry tests pass.
- [ ] Empty-context operation remains useful.
- [ ] No diagnostic field or claim has entered the canonical schema.

