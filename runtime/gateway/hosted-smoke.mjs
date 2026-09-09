import { spawn } from "node:child_process";

const token = process.env.AKILII_FLOWSTATE_TOKEN || "";
if (token.length < 32) throw new Error("Hosted smoke requires the gateway service token.");

const port = 9876;
const origin = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["/app/runtime/gateway/server.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
child.stderr.on("data", (chunk) => { stderr += String(chunk).slice(-4000); });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, options = {}) {
  return fetch(origin + path, { ...options, signal: AbortSignal.timeout(120000) });
}

try {
  let healthy = false;
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await request("/health");
      if (response.ok) { healthy = true; break; }
    } catch {}
    if (child.exitCode !== null) throw new Error(`Gateway exited during hosted smoke: ${stderr}`);
    await sleep(500);
  }
  if (!healthy) throw new Error("Gateway did not become healthy for hosted smoke.");

  const denied = await request("/v1/capabilities");
  if (denied.status !== 401) throw new Error(`Gateway auth boundary returned ${denied.status}, expected 401.`);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const capabilities = await request("/v1/capabilities", { headers });
  if (!capabilities.ok) throw new Error(`Gateway capability check failed (${capabilities.status}).`);
  const capabilityBody = await capabilities.json();
  if (capabilityBody.status !== "ready" || !capabilityBody.routes?.includes("shape"))
    throw new Error("Gateway capabilities are not ready.");

  const generated = await request("/v1/generate", {
    method: "POST",
    headers,
    body: JSON.stringify({
      subject: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      conversationId: "alpha9hosted01",
      route: "shape",
      model: { id: "qwen3:0.6b", label: "Qwen3 0.6B", provider: "ollama" },
      content: "Reply briefly that the alpha.9 hosted runtime is working.",
    }),
  });
  if (!generated.ok) throw new Error(`Hosted generation failed (${generated.status}): ${await generated.text()}`);
  const body = await generated.json();
  if (body.provider !== "ollama" || body.model !== "qwen3:0.6b" || typeof body.content !== "string" || !body.content.trim())
    throw new Error("Hosted generation returned an invalid model response.");

  console.log("alpha.9 hosted gateway smoke passed");
} finally {
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(3000).then(() => child.kill("SIGKILL")),
  ]).catch(() => {});
}
