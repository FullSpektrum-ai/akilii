# akilii hybrid MVP augmentation

Status: implementation boundary for the alpha Phase 7 baseline. Product owner: André. Engineering owner: George. FlowState qualification support: Yomi.

## Product promise

The MVP must make one loop feel dependable:

> messy intention → useful shape → chosen next move → reviewed Work proposal → explicit approval → resumable Thread → outcome → optional learning proposal

Home means “my world right now”, Chat means “think with me”, Work means “help me do it”, and My akilii is the inspection and correction surface. Users never need to understand agents, swarms, providers or runtime topology.

## Authority boundary

akilii owns identity, ActiveContext/NPR, conversation and Thread state, Work, policy, approvals and receipts. FlowState may execute a bounded specification and return events. It cannot become the authority for personal context or product state. Its standalone UI remains operator/developer tooling.

The current local service is useful qualification evidence, not an enabled product path. The shell may show truthful reachability and authentication status while `agenticEnabled` remains false.

## MVP augmentations

### Must ship before a credible beta

1. Canonical Thread persistence with Hold and Resume Point after restart.
2. Proposal → approval → Work with idempotency and a truthful receipt.
3. Outcome feedback linked to the Thread and intervention that produced it.
4. One modality-neutral conversation policy used by text and voice.
5. One governed context projection; legacy profile/memory fields become migration inputs rather than a competing authority.
6. Honest Cloud, Local and Hybrid workspace selection with separate stores and no implied sync.
7. Recovery states for interruption, retry and uncertain cancellation.
8. Two-user isolation evidence and prompt-injection tests at every context/tool boundary.

### Should follow once the loop is stable

1. Progressive discovery after first value, never a mandatory profiling interview.
2. Governed learning proposals that users can approve, edit, reject, scope and revoke.
3. “Why this support?” explanations derived from the authorised projection.
4. Adaptive representations: One move, Short plan and Full picture describe the same intent at different densities.
5. Avatar regression fixtures for founder under load, burnt-out operator, privacy sceptic, verbose thinker, avoidant starter, high-achieving masker, mobile fragmenter and adversarial edge tester. These are test instruments, not user labels.

### Keep behind G06

1. FlowState agent or swarm dispatch from product traffic.
2. Runtime recall as personal memory.
3. Browser, filesystem, shell, mail or calendar side effects.
4. Automatic model routing or local/cloud synchronisation.
5. Any cancellation claim without upstream acknowledgement.

## Swappable runtime contract

The FullSpektrum-owned contract should accept an owner-bound `ExecutionSpec` containing a run ID, objective, authorised context projection, compiled support policy, allowed capabilities, approval requirements and deadlines. It should return typed progress, proposal, result, receipt reference, recoverable failure and cancellation acknowledgement events.

FlowState-specific agent manifests, swarms, gates and session IDs belong inside the adapter. AIMS decides policy; the runtime enforces the compiled decision. Agents may propose, but product services decide and persist.

## G06 exit evidence

- One canonical HTTPS or protected-loopback origin and one health/readiness contract.
- Machine-to-runtime authentication with secrets outside the renderer.
- Owner-bound runs and a successful two-user isolation test.
- No personal configuration mounts and a deny-by-default capability set.
- Bounded streaming/events, timeout, retry and explicit cancellation acknowledgement.
- One read-only Work-context workflow and one approval-gated Work revision workflow.
- Product-owned receipts reconciled against runtime and database evidence.
- Failure, restart and replay tests that do not duplicate side effects.

Until every item passes, the shell reports FlowState as installed or reachable but not enabled.

## MVP value measures

- Time from first input to a useful next move.
- Percentage of proposals users approve, edit or reject.
- Successful Hold/Resume without reconstructing context.
- Work completion and outcome capture linked to the originating Thread.
- Context correction and revocation success.
- Over-questioning, patronising-tone and “made my life harder” reports.
- Privacy/control confidence and any trust incident.

Agent count, swarm depth and token throughput are operational measures, not MVP value.
