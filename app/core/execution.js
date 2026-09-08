const ROUTES = new Set(['direct', 'specialist', 'workflow', 'reviewed_workflow']);

const text = (value, max = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const list = (value, max = 20, itemMax = 100) =>
  (Array.isArray(value) ? value : [])
    .map(item => text(item, itemMax))
    .filter(Boolean)
    .slice(0, max);

function positiveNumber(value, fallback, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(number, max);
}

function deriveRoute(capabilities, input) {
  if (ROUTES.has(input.route)) return input.route;
  if (input.requiresReviewer === true) return 'reviewed_workflow';
  if (capabilities.length >= 3) return 'workflow';
  if (capabilities.length >= 1) return 'specialist';
  return 'direct';
}

/**
 * Compile an engine-neutral description of work to execute.
 * Product state never stores FlowState manifests or provider-specific objects.
 */
export function compileExecutionSpec(input = {}) {
  const objective = text(input.objective, 1500);
  if (!objective) throw new TypeError('Execution objective is required.');

  const capabilities = list(input.capabilities, 16, 80);
  const tools = list(input.tools, 16, 80);
  const contextRefs = list(input.contextRefs, 30, 100);
  const route = deriveRoute(capabilities, input);
  const externalSideEffectsRequested = input.externalSideEffectsRequested === true;

  return {
    version: 1,
    objective,
    route,
    capabilities,
    tools,
    contextRefs,
    successCriteria: list(input.successCriteria, 12, 400),
    policy: {
      externalSideEffectsAllowed: input.externalSideEffectsAllowed === true,
      humanApprovalRequired:
        externalSideEffectsRequested || input.humanApprovalRequired === true,
      idempotencyRequired: true,
      maxDelegationDepth: Math.round(positiveNumber(input.maxDelegationDepth, 1, 4)),
      requireReviewer: route === 'reviewed_workflow' || input.requiresReviewer === true,
    },
    budget: {
      timeoutMs: Math.round(positiveNumber(input.timeoutMs, 90_000, 900_000)),
      maxModelCalls: Math.round(positiveNumber(input.maxModelCalls, route === 'direct' ? 1 : 6, 30)),
      maxToolCalls: Math.round(positiveNumber(input.maxToolCalls, tools.length ? 8 : 1, 50)),
    },
  };
}

export function validateExecutionSpec(spec) {
  if (!spec || typeof spec !== 'object') throw new TypeError('Execution spec is required.');
  if (spec.version !== 1) throw new TypeError('Unsupported execution spec version.');
  if (!text(spec.objective, 1500)) throw new TypeError('Execution objective is required.');
  if (!ROUTES.has(spec.route)) throw new TypeError('Unsupported execution route.');
  if (!spec.policy || spec.policy.idempotencyRequired !== true) {
    throw new Error('Execution must require idempotency.');
  }
  if (spec.policy.externalSideEffectsAllowed === true && spec.policy.humanApprovalRequired !== true) {
    throw new Error('External side effects require human approval.');
  }
  return spec;
}

export const executionContract = Object.freeze({
  routes: Object.freeze([...ROUTES]),
});
