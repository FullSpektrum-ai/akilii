const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canonicalOrigin, inspect } = require('./flowstate-runtime.cjs');

test('FlowState origin is loopback HTTP or HTTPS without credentials or paths', () => {
  assert.equal(canonicalOrigin('http://127.0.0.1:8081'), 'http://127.0.0.1:8081');
  assert.equal(canonicalOrigin('https://runtime.example'), 'https://runtime.example');
  for (const value of ['http://runtime.example', 'https://user:pass@runtime.example', 'https://runtime.example/api'])
    assert.throws(() => canonicalOrigin(value));
});

test('qualification reports healthy authentication boundary without enabling execution', async () => {
  const calls = [];
  const fetcher = async url => {
    calls.push(url);
    return url.endsWith('/health')
      ? new Response('{"status":"ok"}', { headers: { 'content-type': 'application/json' } })
      : new Response('{}', { status: 401 });
  };
  const status = await inspect(fetcher, 'http://127.0.0.1:8081');
  assert.deepEqual(calls, ['http://127.0.0.1:8081/health', 'http://127.0.0.1:8081/api/auth/whoami']);
  assert.equal(status.reachable, true);
  assert.equal(status.authentication, 'required');
  assert.equal(status.agenticEnabled, false);
  assert.equal(status.qualification, 'g06-blocked');
});
