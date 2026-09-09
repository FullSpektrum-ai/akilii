import test from "node:test";
import assert from "node:assert/strict";
import { createFlowStateClient } from "../runtime/flowstate-client.mjs";

test("trusted runtime accepts only the named Railway private FlowState host over HTTP", async () => {
  const calls = [];
  const client = createFlowStateClient({
    baseURL: "http://flowstate.railway.internal:8080",
    allowInsecurePrivate: true,
    trustedInternal: true,
    fetchImpl: async (url) => {
      calls.push(String(url));
      if (String(url).endsWith("/health")) return new Response('{"status":"ok"}', { headers: { "content-type": "application/json" } });
      if (String(url).endsWith("/api/agents")) return new Response('[]', { headers: { "content-type": "application/json" } });
      return new Response('{}', { status: 404, headers: { "content-type": "application/json" } });
    },
  });
  const status = await client.status();
  assert.equal(status.enabled, true);
  assert.deepEqual(calls, [
    "http://flowstate.railway.internal:8080/health",
    "http://flowstate.railway.internal:8080/api/agents",
  ]);

  assert.throws(() => createFlowStateClient({
    baseURL: "http://attacker.railway.internal:8080",
    allowInsecurePrivate: true,
    trustedInternal: true,
  }));
});
