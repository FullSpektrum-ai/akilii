import {
  episodeContext,
  validateSupportPlan,
} from '../src/support/contracts.js';
import {
  resolveSupport,
  explicitRepresentation,
} from '../src/support/resolver.js';
/** Optional bounded planner seam. The default path makes zero provider calls. */
export async function planSupport(
  input,
  { planner, timeoutMs = 700, now = () => performance.now() } = {},
) {
  const start = now();
  let context;
  try {
    if (!input || typeof input !== 'object' || Array.isArray(input))
      throw new Error();
    context = episodeContext(input);
  } catch {
    throw Object.assign(new Error('Invalid episode context.'), { status: 400 });
  }
  const fallback = resolveSupport(context);
  let plan = fallback,
    source = 'rules',
    failure = null,
    timer;
  if (
    planner &&
    !context.override &&
    !explicitRepresentation(context.message)
  ) {
    const controller = new AbortController();
    try {
      const result = await Promise.race([
        planner(context, { signal: controller.signal }),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(new Error('timeout'));
          }, timeoutMs);
        }),
      ]);
      plan = validateSupportPlan(result, context);
      source = 'planner';
    } catch {
      failure = 'planner_unavailable_or_invalid';
    } finally {
      clearTimeout(timer);
      controller.abort();
    }
  }
  return {
    plan,
    trace: {
      source,
      failure,
      latencyMs: Math.max(0, now() - start),
      costUsd: source === 'rules' && !planner ? 0 : null,
      costKind: !planner ? 'no_provider_call' : 'not_reported',
    },
  };
}
