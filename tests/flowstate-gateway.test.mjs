import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";

test("gateway authenticates to FlowState and dispatches the bounded shape swarm", async (t) => {
  const upstreamPort = 19000 + Math.floor(Math.random() * 1000);
  const gatewayPort = 20000 + Math.floor(Math.random() * 1000);
  let selectedAgent;
  const upstream = createServer(async (req, res) => {
    const json = (value, cookie) => { if (cookie) res.setHeader("Set-Cookie", cookie); res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(value)); };
    if (req.url === "/api/auth/csrf") return json({ csrf_token: "prefetch" }, "_csrf=one; Path=/api");
    if (req.url === "/api/auth/login") return json({ csrf_token: "record" }, "flowstate_session=session; Path=/api");
    if (req.url === "/api/auth/session-csrf") return json({ csrf_token: "session-token" });
    if (req.url === "/api/v1/sessions" && req.method === "POST") { let body=""; for await (const c of req) body+=c; selectedAgent=JSON.parse(body).agent_id; return json({ id: "session-1" }); }
    if (req.url?.endsWith("/model")) return json({ ok: true });
    if (req.url?.endsWith("/messages")) return json({ turn_id: "turn-1" });
    if (req.url?.endsWith("/turns/turn-1")) return json({ status: "completed", current_provider: "openai", current_model: "gpt-4o", messages: [{ role: "assistant", content: "One useful next step." }] });
    res.writeHead(404).end();
  });
  await new Promise((resolve) => upstream.listen(upstreamPort, "127.0.0.1", resolve));
  t.after(() => upstream.close());
  const token = "t".repeat(40);
  const child = spawn(process.execPath, ["runtime/gateway/server.mjs"], { env: { ...process.env, PORT: String(gatewayPort), FLOWSTATE_BASE_URL: `http://127.0.0.1:${upstreamPort}`, FLOWSTATE_AUTH_SECRET: "upstream-secret", AKILII_FLOWSTATE_TOKEN: token }, stdio: ["ignore", "pipe", "pipe"] });
  t.after(() => child.kill());
  for (let i=0;i<40;i++) { try { if ((await fetch(`http://127.0.0.1:${gatewayPort}/health`)).ok) break; } catch {} await new Promise(r=>setTimeout(r,25)); }
  const response = await fetch(`http://127.0.0.1:${gatewayPort}/v1/generate`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ subject: "12345678-1234-1234-1234-123456789012", conversationId: "12345678-1234-1234-1234-123456789012", route: "shape", model: { id: "gpt-4o", label: "GPT-4o", provider: "openai" }, content: "Help me begin" }) });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).content, "One useful next step.");
  assert.equal(selectedAgent, "shape-next-move");
});
