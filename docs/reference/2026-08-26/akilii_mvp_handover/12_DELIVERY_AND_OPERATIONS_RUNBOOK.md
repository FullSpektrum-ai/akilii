# Delivery and Operations Runbook

## Purpose

Define the operational material needed so development personnel can run, deploy, observe, recover, and hand over the MVP without private knowledge.

## Required environment matrix

| Environment | Purpose | Data | Runtime/provider | Deployment authority |
|---|---|---|---|---|
| Local | Development and deterministic tests | Synthetic only | Fake by default; real sandbox opt-in | Developer |
| Preview/test | PR/branch review and E2E | Synthetic isolated | Fake plus approved sandbox | CI/project owner |
| Staging | Real-runtime, migration, NFR, release rehearsal | Synthetic/test cohort only | Pinned near-production config | Release/platform owner |
| Pilot/production-like | Approved dogfood/pilot | Real pilot data | Approved provider/runtime | Named release authority |

Do not share databases, buckets, secrets, runtime sessions, or audit stores between environment classes.

## Repository run instructions template

The canonical README must state:

```text
Prerequisites and supported versions
Dependency installation
Environment-variable setup using .env.example
Local data/runtime startup
Migrations and synthetic seed
Application start
Unit/contract/integration/E2E/accessibility commands
Fake versus real FlowState mode
How to inspect safe traces/events
How to stop/clean local services safely
Known platform-specific issues
```

Commands must be verified from a clean checkout by someone other than the primary implementer.

## Configuration inventory

| Category | Examples | Rules |
|---|---|---|
| Public client config | API base URL, build version | No secrets; environment-specific |
| Server config | DB URL, auth audience, event store | Secret/reference management; validated at startup |
| Provider config | model/provider identifiers, region, timeout | No key in source; approved combinations only |
| FlowState config | endpoint/version/workflow IDs, memory mode | Pinned and observable; environment-specific |
| Policy config | tool allow-list, safety policy, retention flags | Versioned, reviewed, included in trace |
| Feature flags | real/fake runtime, optional prototype paths | Safe defaults; no hidden production mock |

The application should fail startup on missing critical configuration and report names, not secret values.

## Deployment checklist

### Before deployment

- [ ] Release commit and dependency lock are identified.
- [ ] Contracts, schemas, prompts/workflows, FlowState and model versions are pinned.
- [ ] CI/static/unit/contract/integration/E2E checks pass.
- [ ] Migration dry run and backup are complete.
- [ ] Secrets/config/provider approvals are valid for target environment.
- [ ] Feature flags do not route canonical acceptance to a fake.
- [ ] Known limitations and rollback owner are recorded.

### During deployment

- Apply migrations using the approved strategy.
- Deploy services in dependency-safe order.
- Record release/build identifiers.
- Run synthetic auth, context, runtime, action, outcome and audit smoke checks.
- Monitor error, latency, auth, database, runtime, tool, gate and event-pipeline signals.

### After deployment

- Confirm canonical-loop trace correlation.
- Confirm no production logs contain fixture secrets or raw sensitive content.
- Confirm backup/restore schedule and alerts.
- Attach release evidence and update traceability.
- Announce release/limitations through the agreed internal channel.

## Migration procedure

Every migration includes:

- schema/data change and owner;
- compatibility with current and previous app version;
- dry-run query/results;
- performance/lock risk;
- backup/checkpoint;
- forward-fix or rollback route;
- derived-index rebuild;
- verification queries that do not expose personal content;
- deletion/retention impact.

Avoid destructive irreversible migrations in the same release that first introduces replacement reads/writes.

## Rollback procedure

1. Name the incident/release and decision owner.
2. Stop or restrict new writes if compatibility is uncertain.
3. Revert application/runtime/config to the last compatible pinned version.
4. Do not reverse a data migration unless its rollback was rehearsed and safe.
5. Prefer forward-fix for additive schema changes.
6. Validate auth, data isolation, NPR retrieval, run streaming, action persistence and event capture.
7. Record affected runs/data and user-impact assessment.

## Observability dashboard

Minimum signals:

- application availability and API error/latency;
- authentication/session failures;
- database saturation/errors/migration version;
- NPR projection latency/count/exclusion reasons without values;
- FlowState run starts/completion/failure/cancel and first-event latency;
- provider/model latency, timeouts, usage and cost;
- agent/tool/gate counts and failure/denial rate;
- stream reconnect/duplicate suppression;
- action persistence and outcome recording failures;
- AIMS-lite event lag/drop/redaction failures;
- export/deletion job state;
- frontend errors and accessibility-critical regressions where instrumented.

## Alerting priorities

| Priority | Examples | Response |
|---|---|---|
| P0 | Cross-user disclosure, unauthorised external side effect, destructive corruption | Immediate containment; pause pilot; incident lead |
| P1 | Auth outage, NPR writes outside policy, canonical loop widely unavailable, audit loss for critical actions | Immediate investigation and likely rollback/restriction |
| P2 | Elevated runtime/provider failures, degraded performance, partial feature unavailable | Owner during support window; communicate degradation |
| P3 | Non-critical UI issue or isolated low-impact failure | Backlog with evidence |

## Incident record template

```text
Incident ID/title
Start/detection/containment/recovery times
Severity and owner
Affected environment/version/users/data classes
Observed symptoms and evidence
Immediate containment
Data/privacy/safety assessment
Root cause and contributing factors
Correction and verification
User/internal communication decision
Follow-up owners/dates
ADRs/tests/runbook changes
```

## Backup and recovery

- Define canonical stores and backup ownership.
- MVP target: RPO ≤ 24 hours and RTO ≤ 4 hours unless superseded by approved NFR.
- Restore into an isolated environment; never use real data in an unapproved environment.
- Verify referential integrity, user isolation, NPR version chains, consent/control state, and product links.
- Rebuild derived semantic/search indexes from canonical records.
- Record a dated restore rehearsal before pilot.

## Developer offboarding/handover checklist

- [ ] All code/config/docs committed or transferred to canonical ownership.
- [ ] No critical knowledge exists only in personal notes or chat.
- [ ] Secrets and privileged access transferred/revoked appropriately.
- [ ] Open branches/preview environments identified.
- [ ] Migrations, providers, runtime workflows, prompts and model versions documented.
- [ ] Known mocks, limitations, debt and incidents recorded.
- [ ] Another developer successfully runs, tests, deploys and investigates a synthetic failure.
- [ ] Traceability and ADRs are current.

