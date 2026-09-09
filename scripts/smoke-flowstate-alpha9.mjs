import { access, readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = resolve(process.env.AKILII_FLOWSTATE_ENV_FILE || resolve(root, "deploy/flowstate/.env"));

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

function parseEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

const fileEnv = (await exists(envFile)) ? parseEnv(await readFile(envFile, "utf8")) : {};
const env = { ...fileEnv, ...process.env };
const token = env.AKILII_FLOWSTATE_TOKEN || "";
if (token.length < 32) throw new Error("AKILII_FLOWSTATE_TOKEN must be configured before the live smoke test.");

let provider = env.AKILII_SMOKE_MODEL_PROVIDER || "";
let modelId = env.AKILII_SMOKE_MODEL_ID || "";
let label = env.AKILII_SMOKE_MODEL_LABEL || "";
if (!modelId && env.OPENAI_API_KEY) {
  provider = "openai";
  modelId = "gpt-5.4-mini";
  label = "GPT-5.4 mini";
} else if (!modelId && env.ANTHROPIC_API_KEY) {
  provider = "anthropic";
  modelId = "claude-haiku-4-5-20251001";
  label = "Claude Haiku 4.5";
}
if (!modelId || !provider) {
  throw new Error("Configure OPENAI_API_KEY or ANTHROPIC_API_KEY, or set AKILII_SMOKE_MODEL_ID and AKILII_SMOKE_MODEL_PROVIDER.");
}
if (!label) label = modelId;

const port = Number(env.AKILII_FLOWSTATE_PORT || 8788);
const origin = `http://127.0.0.1:${port}`;
const auth = { Authorization: `Bearer ${token}` };

const health = await fetch(origin + "/health", { signal: AbortSignal.timeout(3000) });
if (!health.ok) throw new Error(`alpha.9 gateway is not healthy (${health.status}).`);
const capabilities = await fetch(origin + "/v1/capabilities", { headers: auth, signal: AbortSignal.timeout(3000) });
if (!capabilities.ok) throw new Error(`alpha.9 gateway is not ready (${capabilities.status}).`);

const response = await fetch(origin + "/v1/generate", {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  signal: AbortSignal.timeout(70000),
  body: JSON.stringify({
    subject: randomUUID(),
    conversationId: randomUUID(),
    route: "orient",
    model: { id: modelId, label, provider },
    content: "This is an alpha.9 runtime smoke test. Give one short sentence confirming you can respond through the akilii support runtime.",
  }),
});

const result = await response.json().catch(() => ({}));
if (!response.ok) throw new Error(`alpha.9 live generation failed (${response.status}: ${result.error || "unknown error"}).`);
if (typeof result.content !== "string" || !result.content.trim()) throw new Error("alpha.9 live generation returned no usable content.");
if (result.model !== modelId || result.provider !== provider) throw new Error(`alpha.9 runtime changed the selected model (${result.provider || "?"}/${result.model || "?"}).`);

console.log("alpha.9 live provider turn passed.");
console.log(`Provider/model: ${provider}/${modelId}`);
console.log(`Response: ${result.content.trim().slice(0, 240)}`);
