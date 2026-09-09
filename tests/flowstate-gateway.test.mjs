import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";

test("gateway keeps FlowState private and dispatches the bounded shape swarm", async (t) => {
  const upstreamPort = 19000 + Math.floor(Math.random() * 1000);
  const gatewayPort = 20000 + Math.floor(Math.random() * 1000);
  let selectedAgent;
  let upstreamAuthHeaders = [];

  const upstream = createServer(async (req, res) => {
    upstreamAuthHeaders.push({ cookie: req.headers.cookie, authorization: req.headers.authorization });
    const json = (value, status = 200) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(value));
    };
    if (req.url === "/health") return json({ status: "ok" });
    if (req.url === "/api/agents") return json([{ id: "akilii-companion" }]);
    if (req.url === "/api/v1/sessions" && req.method === "POST") {
      let body = "";
      for await (const c of req) body += c;
      selectedAgent = JSON.parse(body).agent_id;
      return json({ id: "session-1" });
    }
    if (req.url?.endsWith("/model")) return json({ ok: true });
    if (req.url?.endsWith("/messages")) return json({ turn_id: "turn-1" });
    if (req.url?.endsWith("/turns/turn-1")) return json({
      status: "completed",
      current_provider: "openai",
      current_model: "gpt-4o",
      messages: [{ role: "assistant", content: "One useful next step." }],
    });
    return json({ error: "not_found" }, 404);
  });

  await new Promise((resolve) => upstream.listen(upstreamPort, "127.0.0.1", resolve));
  t.after(() => upstream.close());

  const token = "t".repeat(40);
  const child = spawn(process.execPath, ["runtime/gateway/server.mjs"], {
    env: {
      ...process.env,
      PORT: String(gatewayPort),
      FLOWSTATE_BASE_URL: `http://127.0.0.1:${upstreamPort}`,
      AKILII_FLOWSTATE_TOKEN: token,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => child.kill());

  let healthy = false;
  for (let i = 0; i < 40; i += 1) {
    try {
      healthy = (await fetch(`http://127.0.0.1:${gatewayPort}/health`)).ok;
      if (healthy) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.equal(healthy, true);

  const unauthorised = await fetch(`http://127.0.0.1:${gatewayPort}/v1/capabilities`);
  assert.equal(unauthorised.status, 401);

  const response = await fetch(`http://127.0.0.1:${gatewayPort}/v1/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: "12345678-1234-1234-1234-123456789012",
      conversationId: "12345678-1234-1234-1234-123456789012",
      route: "shape",
      model: { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
      content: "Help me begin",
    }),
  });

  assert.equal(response.status, 200);
  assert.equal((await response.json()).content, "One useful next step.");
  assert.equal(selectedAgent, "shape-next-move");
  assert.ok(upstreamAuthHeaders.every((headers) => !headers.cookie && !headers.authorization));
});
