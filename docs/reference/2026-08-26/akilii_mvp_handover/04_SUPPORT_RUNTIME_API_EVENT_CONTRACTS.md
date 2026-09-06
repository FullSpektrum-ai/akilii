# Support Runtime, API, and Event Contracts

## Contract philosophy

The contracts protect akilii from runtime, provider, and prototyping-tool coupling. They should be implemented as machine-readable schemas with generated or shared types and contract tests.

## SupportRuntime interface

```ts
type RunId = string;
type EventId = string;

interface SupportRuntime {
  startRun(input: SupportRunInput): Promise<{ runId: RunId }>;
  resumeRun(runId: RunId, input?: ResumeInput): Promise<void>;
  stream(runId: RunId, afterEventId?: EventId): AsyncIterable<SupportRunEvent>;
  approveGate(runId: RunId, gateId: string, decision: GateDecision): Promise<void>;
  cancelRun(runId: RunId, reason?: string): Promise<void>;
  getStatus(runId: RunId): Promise<SupportRunStatus>;
}
```

## Run input

```ts
interface SupportRunInput {
  contractVersion: "1.0";
  correlationId: string;
  idempotencyKey: string;
  subjectRef: string;
  conversationRef: string;
  episodeRef: string;
  intent: {
    text: string;
    classification?: string;
    locale: string;
  };
  contextProjection: {
    projectionId: string;
    items: Array<{
      ref: string;
      type: string;
      value: unknown;
      tier: "stable" | "semi_stable" | "dynamic";
      confidence: number;
      confirmation: string;
    }>;
  };
  productContext?: {
    projectRefs?: string[];
    taskRefs?: string[];
    artefactRefs?: string[];
  };
  accessibility: {
    responseLength?: "short" | "medium" | "detailed";
    structure?: "plain" | "bullets" | "steps";
    reducedCognitiveLoad?: boolean;
  };
  policy: {
    policySetId: string;
    policyVersion: string;
    allowedToolIds: string[];
    externalSideEffectsAllowed: false;
  };
}
```

The adapter must reject missing server-derived identity, unsupported contract versions, excessive context payloads, and tool IDs outside the allow-list.

## Normalized event model

```ts
interface BaseRunEvent {
  id: EventId;
  runId: RunId;
  sequence: number;
  occurredAt: string;
  correlationId: string;
  contractVersion: "1.0";
}

type SupportRunEvent =
  | (BaseRunEvent & { type: "run.started"; workflowRef: string })
  | (BaseRunEvent & { type: "run.status"; status: string; userLabel: string })
  | (BaseRunEvent & { type: "response.delta"; text: string })
  | (BaseRunEvent & { type: "response.final"; messageRef?: string })
  | (BaseRunEvent & { type: "agent.delegated"; specialistRef: string; purpose: string })
  | (BaseRunEvent & { type: "tool.proposed"; toolRef: string; purpose: string; gateId?: string })
  | (BaseRunEvent & { type: "tool.started" | "tool.completed" | "tool.failed"; toolRef: string; resultRef?: string; error?: SafeError })
  | (BaseRunEvent & { type: "gate.requested"; gateId: string; summary: string; expiresAt?: string })
  | (BaseRunEvent & { type: "gate.resolved"; gateId: string; decision: "approved" | "denied" | "cancelled" })
  | (BaseRunEvent & { type: "artefact.proposed"; artefactType: string; draftRef: string })
  | (BaseRunEvent & { type: "outcome.requested"; interventionRef: string })
  | (BaseRunEvent & { type: "npr.update.proposed"; proposalRef: string })
  | (BaseRunEvent & { type: "safety.event"; policyRef: string; userMessage: string })
  | (BaseRunEvent & { type: "run.completed"; usage?: UsageSummary })
  | (BaseRunEvent & { type: "run.cancelled"; reason?: string })
  | (BaseRunEvent & { type: "run.failed"; error: SafeError });
```

UI copy must use `userLabel`/safe presentation mapping, not raw internal workflow, provider, tool, or error strings.

## Status model

```text
created → starting → running
                     ├── waiting_for_gate → running
                     ├── cancelling → cancelled
                     ├── degraded → running/completed/failed
                     ├── completed
                     └── failed
```

Status transitions are monotonic except `waiting_for_gate → running` and `degraded → running`. Completed, cancelled, and failed are terminal.

## Gate decision

```ts
interface GateDecision {
  decision: "approve" | "deny" | "cancel";
  idempotencyKey: string;
  decidedAt: string;
  userAcknowledgement?: string;
}
```

Approval authorises only the displayed action for the identified run/tool/input. It is not reusable consent for future actions.

## Error contract

```ts
interface SafeError {
  code:
    | "AUTH_REQUIRED"
    | "FORBIDDEN"
    | "INVALID_INPUT"
    | "CONTRACT_VERSION_UNSUPPORTED"
    | "CONTEXT_UNAVAILABLE"
    | "RUNTIME_UNAVAILABLE"
    | "PROVIDER_TIMEOUT"
    | "TOOL_FAILED"
    | "GATE_EXPIRED"
    | "VERSION_CONFLICT"
    | "RATE_LIMITED"
    | "INTERNAL_ERROR";
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
  correlationId: string;
  detailsRef?: string;
}
```

Errors must not expose secrets, raw provider payloads, stack traces, other users’ identifiers, or sensitive context.

## Product API outline

| Domain | Method and indicative route | Idempotency/concurrency |
|---|---|---|
| Session | `GET /v1/me` | N/A |
| Onboarding | `POST /v1/onboarding/turns` | Idempotent per client turn |
| Onboarding | `POST /v1/onboarding/complete` | Idempotent; synthesis version required |
| Conversation | `POST /v1/conversations` | Idempotent create |
| Message/run | `POST /v1/conversations/{id}/messages` | Idempotency key starts one run |
| Stream | `GET /v1/runs/{id}/events?after=` | Ordered resume token/event ID |
| Run control | `POST /v1/runs/{id}/approve|cancel|retry` | Idempotent per decision/action |
| Context | `GET /v1/context` | Filtered and paginated |
| Context proposal | `POST /v1/context/proposals/{id}/confirm|reject` | Proposal version required |
| Context item | `PATCH /v1/context/{id}` | `If-Match`/version required |
| Context item | `DELETE /v1/context/{id}` | Idempotent deletion request |
| Project/task | CRUD under `/v1/projects` `/v1/tasks` | Version on update |
| Outcome | `POST /v1/interventions/{id}/outcomes` | Idempotent per feedback interaction |
| Export/deletion | `POST /v1/data-exports` `/v1/account-deletion` | Idempotent request; visible status |

Route names can change. Domain operations and guarantees cannot change without a contract ADR.

## NPR proposal contract

```ts
interface NprUpdateProposal {
  proposalId: string;
  subjectRef: string;
  operation: "create" | "update" | "reinforce" | "contradict" | "deprecate";
  targetItemRef?: string;
  proposedItem: {
    itemType: string;
    tier: "stable" | "semi_stable" | "dynamic";
    payload: unknown;
    confidence: number;
    sensitivity: string;
    reviewAfter?: string;
    expiresAt?: string;
  };
  evidenceRefs: string[];
  plainLanguageReason: string;
  confirmationRequired: boolean;
  sourceRunRef: string;
  contractVersion: "1.0";
}
```

## AIMS-lite mapping

| Runtime/product event | AIMS-lite event | Payload rule |
|---|---|---|
| Run begins/ends/fails | `support.run.*` | IDs, workflow/version, timing, outcome; no raw prompt |
| Context projection requested/supplied | `context.requested/supplied` | purpose, counts, item refs or hashed refs as policy permits |
| Agent delegation | `agent.delegated` | specialist ref and purpose |
| Model invocation | `model.invoked` | provider/model ref, latency, token/cost summary; no content by default |
| Tool lifecycle | `tool.proposed/invoked/completed/failed` | allow-listed metadata and result ref |
| Gate lifecycle | `gate.requested/allowed/denied` | action summary and policy ref |
| Product action | `action.proposed/persisted/cancelled` | resource type/ref |
| Outcome | `outcome.recorded` | intervention ref and categorical result; free text excluded by default |
| NPR mutation | `npr.item.*` | item ref/type/tier/policy; value excluded |
| Safety | `safety.gate.triggered` | policy ref and severity category; sensitive text excluded |

## Contract fixtures

Maintain fixtures for:

1. successful concise response with no tool;
2. real specialist delegation and streamed plan;
3. gated persistent action approved;
4. gate denied;
5. tool partial failure with recoverable artefact;
6. runtime timeout and retry;
7. empty NPR projection;
8. conflicting context projection;
9. NPR proposal requiring confirmation;
10. safety-gated run;
11. stream reconnect without duplicate events;
12. unsupported contract version.

## Fake and real adapters

- `FakeSupportRuntime` is allowed for deterministic component, contract, and E2E tests.
- The fake emits the same versioned normalized events and must not introduce extra behaviour.
- MVP acceptance and release smoke tests must use `FlowStateAdapter` with a pinned real runtime.
- Tool prompts and mock labels must make simulated behaviour unmistakable in non-production environments.

## Contract acceptance checklist

- [ ] Machine-readable schemas exist for all external/trust-boundary payloads.
- [ ] Consumer and provider contract tests run in CI.
- [ ] Events are ordered, resumable, and idempotent.
- [ ] Every mutation has authorisation and concurrency control.
- [ ] UI receives no FlowState/provider-native object.
- [ ] Safe errors are stable and tested.
- [ ] AIMS-lite mappings exclude raw sensitive content by default.
- [ ] Fake and real adapter paths are visibly distinguishable.

