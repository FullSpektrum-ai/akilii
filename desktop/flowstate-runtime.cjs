const DEFAULT_ORIGIN = 'http://127.0.0.1:8788';

function canonicalOrigin(value = DEFAULT_ORIGIN) {
  const url = new URL(value);
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))
    throw new Error('FlowState requires HTTPS unless it is on this device.');
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash)
    throw new Error('FlowState must be configured as an origin only.');
  return url.origin;
}

async function inspect(
  fetchImpl = globalThis.fetch,
  origin = process.env.FLOWSTATE_BASE_URL || DEFAULT_ORIGIN,
  serviceToken = process.env.AKILII_FLOWSTATE_TOKEN || '',
) {
  const base = canonicalOrigin(origin);
  const result = {
    origin: base,
    reachable: false,
    authentication: 'gateway-token-required',
    isolated: true,
    agenticEnabled: false,
    qualification: 'unreachable',
  };
  try {
    const health = await fetchImpl(base + '/health', { redirect: 'error', signal: AbortSignal.timeout(3000) });
    result.reachable = health.ok && (await health.json()).status === 'ok';
    if (!result.reachable) return result;
    result.qualification = 'gateway-reachable';
    if (serviceToken.length < 32) return result;

    const capabilities = await fetchImpl(base + '/v1/capabilities', {
      headers: { Authorization: `Bearer ${serviceToken}` },
      redirect: 'error',
      signal: AbortSignal.timeout(3000),
    });
    if (capabilities.status === 401 || capabilities.status === 403) {
      await capabilities.body?.cancel();
      result.authentication = 'gateway-token-rejected';
      result.qualification = 'gateway-reachable';
      return result;
    }
    if (!capabilities.ok) {
      await capabilities.body?.cancel();
      return result;
    }
    const value = await capabilities.json();
    if (value?.status === 'ready') {
      result.authentication = 'gateway-token-accepted';
      result.agenticEnabled = true;
      result.qualification = 'alpha9-qualified';
    }
    return result;
  } catch {
    return result;
  }
}

module.exports = { DEFAULT_ORIGIN, canonicalOrigin, inspect };
