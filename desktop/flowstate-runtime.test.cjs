const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canonicalOrigin, inspect } = require('./flowstate-runtime.cjs');

test('FlowState gateway origin is loopback HTTP or HTTPS without credentials or paths', () => {
  assert.equal(canonicalOrigin('http://127.0.0.1:8788'), 'http://127.0.0.1:8788');
  assert.equal(canonicalOrigin('https://runtime.example'), 'https://runtime.example');
  for (const value of ['http://runtime.example', 'https://user:pass@runtime.example', 'https://runtime.example/api'])
    assert.throws(() => canonicalOrigin(value));
});

test('reachable gateway stays unattached when no service token is configured', async () => {
  const calls = [];
  const fetcher = async url => {
    calls.push(url);
    return new Response('{"status":"ok"}', { headers: { 'content-type': 'application/json' } });
  };
  const status = await inspect(fetcher, 'http://127.0.0.1:8788', '');
  assert.deepEqual(calls, ['http://127.0.0.1:8788/health']);
  assert.equal(status.reachable, true);
  assert.equal(status.authentication, 'gateway-token-required');
  assert.equal(status.agenticEnabled, false);
  assert.equal(status.qualification, 'gateway-reachable');
});

test('accepted gateway token reports the qualified alpha.9 runtime', async () => {
  const calls = [];
  const token = 't'.repeat(40);
  const fetcher = async (url, options = {}) => {
    calls.push({ url, authorization: options.headers?.Authorization });
    return url.endsWith('/health')
      ? new Response('{"status":"ok"}', { headers: { 'content-type': 'application/json' } })
      : new Response('{"status":"ready","routes":["orient","shape","work","reflect"]}', { headers: { 'content-type': 'application/json' } });
  };
  const status = await inspect(fetcher, 'http://127.0.0.1:8788', token);
  assert.equal(calls[1].authorization, `Bearer ${token}`);
  assert.equal(status.reachable, true);
  assert.equal(status.authentication, 'gateway-token-accepted');
  assert.equal(status.agenticEnabled, true);
  assert.equal(status.qualification, 'alpha9-qualified');
});
