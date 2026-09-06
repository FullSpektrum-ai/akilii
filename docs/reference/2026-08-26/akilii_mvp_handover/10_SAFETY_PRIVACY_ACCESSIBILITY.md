# Safety, Privacy, Security, and Accessibility Pack

## Status

This is an engineering control baseline, not legal advice, clinical assurance, or a compliance certificate. Named safety, privacy, security, and accessibility owners must review the actual deployment and providers before external pilot.

## Data classification

| Class | Examples | Default handling |
|---|---|---|
| Public | Product marketing/help copy | Public by design |
| Internal | ADRs, non-sensitive operational docs | Authenticated workforce access |
| Personal | Account, conversation, projects/tasks | Per-user access; encryption; minimised logs |
| Sensitive personal context | Support needs, observations, friction, relationships | Explicit purpose, restricted projection, confirmation/control, stricter retention |
| Credentials/secrets | Tokens, keys, service credentials | Secret manager only; never prompt/log/database content |
| Audit/security | Auth/gate/deletion/security events | Privileged access; append-only/tamper evidence; minimised payload |

## Data-flow review questions

For every user-data field or event:

1. What visible product purpose requires it?
2. Is it canonical, derived, runtime-only, audit, or analytics data?
3. Who writes and who can read it?
4. Which provider/tool receives it, in which region, under which retention terms?
5. How is it corrected, restricted, exported, and deleted?
6. How long is it retained and why?
7. Could a less sensitive reference or category satisfy the need?
8. Is it accidentally copied into prompts, logs, traces, events, screenshots, fixtures, or support tooling?

## Threat model summary

| Threat | Example | Required controls |
|---|---|---|
| Broken object authorisation | User A requests User B context/project ID | Server-derived identity, scoped queries, isolation tests |
| Prompt injection | Tool content instructs agent to reveal NPR | Treat tool content as data, policy isolation, minimum projection, output checks |
| Excessive context disclosure | Whole NPR sent for a small request | Purpose-scoped bounded projection and payload inspection |
| Runtime persistence drift | FlowState memory becomes hidden profile | Strict adapter boundary, bounded retention, NPR proposal-only writes |
| Tool side effect | Generated workflow sends/deletes externally | MVP deny-list, allow-listed internal tools, explicit gates |
| Secret leakage | Generated code logs provider key | Secret manager, scanning, redaction, safe errors |
| Operator misuse | Staff browse personal data without need | Least privilege, reason-for-access, audit, periodic review |
| Generated-code vulnerability | Lovable/Figma Make scaffold uses permissive policies | Treat output as untrusted; engineering/security review and tests |
| Model/provider retention | User content retained unexpectedly | Provider register, approved configuration, minimisation, no pilot before sign-off |
| Re-identification | Analytics events contain combinations of sensitive facts | Allow-listed event schema, aggregation, subject pseudonymisation |

## Safety behaviour

### Product boundary

- akilii may provide practical and emotional support but does not diagnose, prescribe, treat, or replace professional/emergency services.
- Personalization never overrides safety policy.
- Uncertainty and limitations should be communicated without alarmist or patronising language.
- The MVP must not autonomously contact third parties or emergency services.

### High-risk flow

```text
Potential high-risk content
→ policy classification
→ safe, bounded response
→ appropriate signposting according to approved policy/context
→ no unrestricted tool/action
→ minimal AIMS-lite safety event
→ operational review only when policy permits/requires
```

Exact response copy and regional signposting require safety owner approval and maintenance; do not hard-code unreviewed generated copy.

### Safety evaluation cases

- ambiguous distress without imminent-risk evidence;
- explicit imminent-risk language;
- user asks for diagnosis or medication advice;
- manipulative instruction to ignore policy;
- tool result contains unsafe instructions;
- stored preference requests tone/behaviour conflicting with safety;
- false positive safety classification and graceful return to normal support.

## Privacy and user control

- Explain personal context at onboarding and at material proposal/use points.
- Separate assertions from observations visually and semantically.
- Provide inspect, correct, restrict, delete, export, and account-deletion paths.
- Show meaningful status for asynchronous export/deletion.
- Do not train first- or third-party models on user content without an explicit approved decision and basis.
- Do not use hidden consent bundled into general terms for materially different context use.
- Record policy/version and user action without reproducing sensitive values in events.

## Security engineering checklist

- [ ] Authentication/session expiry and revocation tested.
- [ ] Object-level authorisation on every user resource.
- [ ] Database policies and service-role use reviewed.
- [ ] CSRF/CORS/cookie/token settings match deployment topology.
- [ ] Rate limiting and abuse controls on auth, run, export and deletion operations.
- [ ] Input/schema validation at every trust boundary.
- [ ] Output encoding and content security policy for rendered/generated content.
- [ ] Tool allow-list and minimum credentials/context.
- [ ] Secrets scanning and dependency scanning in CI.
- [ ] No stack traces/provider payloads in user errors.
- [ ] Privileged operator access is least-privilege and audited.
- [ ] Backups, restore, deletion and incident access are documented.

## Accessibility requirements

### Perceivable

- Text and controls meet approved contrast targets.
- Information is not communicated by colour alone.
- Content reflows at zoom/narrow width without loss or two-dimensional scrolling except justified components.
- User-generated/model text respects readable line length and spacing.

### Operable

- Complete canonical loop by keyboard.
- Visible focus and logical order.
- Dialog/sheet focus containment and restoration.
- No essential timed response; gates explain expiry if one exists.
- Reduced motion and no unsafe flashing.
- Touch targets meet the documented minimum.

### Understandable

- Consistent navigation, one dominant action, plain error recovery.
- Explain what is happening during model/tool work without overwhelming announcements.
- Separate “proposed understanding” from confirmed information.
- Preserve drafts and let users pause/resume onboarding/work.
- Avoid coercive feedback, context confirmation, or consent patterns.

### Robust

- Semantic landmarks, headings, labels and descriptions.
- Correct accessible names for icon buttons.
- Status/live regions for run state, not every token delta.
- Validation errors associated with inputs.
- Supported browser/screen-reader matrix documented and tested.

## Cognitive-accessibility review

Evaluate each core screen for:

- number of simultaneous decisions;
- clarity of the immediate next action;
- content density and ability to expand on demand;
- interruption/recovery burden;
- ambiguity of system status;
- pressure to disclose personal context;
- complexity of correction/deletion;
- whether personalization meaningfully reduces rather than increases effort.

## Review artefacts required before pilot

- deployed data-flow diagram;
- data inventory and retention/deletion matrix;
- provider/tool/subprocessor register with configuration;
- threat model and mitigations;
- safety policy and evaluated scenario set;
- accessibility audit and known limitations;
- incident-response contacts and stop conditions;
- signed exceptions with owner, expiry and remediation.

