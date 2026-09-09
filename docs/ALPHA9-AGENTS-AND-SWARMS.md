# akilii alpha.9 agents and swarms

alpha.9 keeps one user-facing akilii companion. Specialists are internal
capabilities, not competing personalities or a menu the person must understand.

## Phase 0 journey

1. **Orient:** akilii reads the current intention and explicitly supplied context.
2. **Shape:** `shape-next-move` asks `next-move-shaper` for one bounded action.
3. **Choose:** the person accepts, edits or ignores the suggestion.
4. **Propose Work:** `proposal-to-work` drafts a Work item only after that choice.
5. **Approve:** akilii, not FlowState, records the person's explicit approval.
6. **Resume:** the thread and Work item remain linked in akilii.
7. **Reflect:** `outcome-reflector` drafts one optional learning proposal.

## Authority boundary

- akilii owns identity, NPR/ActiveContext, Threads, Work, approvals and receipts.
- FlowState runs bounded model turns and internal orchestration.
- Specialists have no tools in alpha.9. They cannot write files, browse, message,
  schedule, persist memory or execute Work.
- No inferred learning is committed without a visible user confirmation.
- Provider selection is a user choice. Runtime fallback must be surfaced rather
  than silently presented as the chosen provider.

## Phase 0 scope decision

The MVP adds four roles and two short sequential swarms. A larger research,
engineering or autonomous-execution swarm would add latency, cost and authority
ambiguity before the core support loop is proven, so those remain operator-only.

The manifests are installed for operator evaluation, but alpha.9 live Chat uses
FlowState's proven strategist turn runner behind the akilii policy projection.
The new companion and swarms stay staged until they meet the completion and
latency SLO; they are not presented to users as active functionality.
