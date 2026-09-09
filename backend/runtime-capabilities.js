// Capability discovery describes verified execution, not installed adapters.
export const runtimeCapabilities = Object.freeze({
  direct: Object.freeze({
    available: true,
    tools: Object.freeze(['work.create', 'work.save_version']),
    execution: 'approved_work_actions',
    approvalRequired: true,
    durableReceipts: true,
    backgroundExecution: false,
    browserControl: false,
    cancellation: 'pending_proposals_only',
  }),
  flowstate: Object.freeze({
    available: false,
    reason: 'Awaiting authenticated, isolated FlowState service deployment',
    browserControl: false,
    cancellation: 'upstream_acknowledgement_not_verified',
  }),
  mcp: Object.freeze({available: false, reason: 'No approved MCP service connected'}),
});
