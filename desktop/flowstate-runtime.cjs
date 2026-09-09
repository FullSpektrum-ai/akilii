const DEFAULT_ORIGIN = 'http://127.0.0.1:8081';

function canonicalOrigin(value = DEFAULT_ORIGIN) {
  const url = new URL(value);
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))
    throw new Error('FlowState requires HTTPS unless it is on this device.');
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash)
    throw new Error('FlowState must be configured as an origin only.');
  return url.origin;
}

async function inspect(fetchImpl = globalThis.fetch, origin = process.env.FLOWSTATE_BASE_URL || DEFAULT_ORIGIN) {
  const base = canonicalOrigin(origin);
  const result = {
    origin: base,
    reachable: false,
    authentication: 'unknown',
    isolated: false,
    agenticEnabled: false,
    qualification: 'g06-blocked',
  };
  try {
    const health = await fetchImpl(base + '/health', { redirect: 'error', signal: AbortSignal.timeout(3000) });
    result.reachable = health.ok && (await health.json()).status === 'ok';
    if (!result.reachable) return result;
    const identity = await fetchImpl(base + '/api/auth/whoami', { redirect: 'error', signal: AbortSignal.timeout(3000) });
    result.authentication = identity.status === 401 || identity.status === 403
      ? 'required'
      : identity.ok ? 'not-enforced' : 'unknown';
    await identity.body?.cancel();
    return result;
  } catch {
    return result;
  }
}

module.exports = { DEFAULT_ORIGIN, canonicalOrigin, inspect };
