import { access, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const composeFile = resolve(root, "deploy/flowstate/docker-compose.yml");
const envFile = resolve(process.env.AKILII_FLOWSTATE_ENV_FILE || resolve(root, "deploy/flowstate/.env"));
const args = new Set(process.argv.slice(2));
const publicMode = args.has("--public");
const localModels = args.has("--local-models");
const skipBuild = args.has("--skip-build");

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

function run(command, commandArgs, env) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, commandArgs, { cwd: root, env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolvePromise() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

const fileEnv = (await exists(envFile)) ? parseEnv(await readFile(envFile, "utf8")) : {};
const env = { ...fileEnv, ...process.env };
const token = env.AKILII_FLOWSTATE_TOKEN || "";
if (token.length < 32) {
  throw new Error(`AKILII_FLOWSTATE_TOKEN must be at least 32 characters. Copy deploy/flowstate/.env.example to ${envFile} and configure it.`);
}
if (publicMode && !(env.FLOWSTATE_PUBLIC_HOST || "").trim()) {
  throw new Error("--public requires FLOWSTATE_PUBLIC_HOST in deploy/flowstate/.env or the environment.");
}

await run(process.execPath, ["scripts/prepare-flowstate-deployment.mjs"], env);
if (!skipBuild) await run(process.execPath, ["scripts/build-flowstate-alpha9.mjs"], env);

const composeArgs = [];
if (await exists(envFile)) composeArgs.push("--env-file", envFile);
composeArgs.push("-f", composeFile);
if (publicMode) composeArgs.push("--profile", "public");
if (localModels) composeArgs.push("--profile", "local-models");
composeArgs.push("up", "-d", "--build", "flowstate", "gateway");
if (localModels) composeArgs.push("ollama");
if (publicMode) composeArgs.push("caddy");
await run("docker", ["compose", ...composeArgs], env);

const port = Number(env.AKILII_FLOWSTATE_PORT || 8788);
const localOrigin = `http://127.0.0.1:${port}`;
let healthy = false;
let lastStatus = 0;
for (let attempt = 0; attempt < 60; attempt += 1) {
  try {
    const response = await fetch(localOrigin + "/health", { signal: AbortSignal.timeout(1500) });
    lastStatus = response.status;
    if (response.ok) { healthy = true; break; }
  } catch {}
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000));
}
if (!healthy) {
  throw new Error(`alpha.9 runtime did not become healthy${lastStatus ? ` (last HTTP ${lastStatus})` : ""}. Run docker compose -f deploy/flowstate/docker-compose.yml logs flowstate gateway.`);
}

const capabilities = await fetch(localOrigin + "/v1/capabilities", {
  headers: { Authorization: `Bearer ${token}` },
  signal: AbortSignal.timeout(2500),
});
if (!capabilities.ok) throw new Error(`alpha.9 gateway capability check failed (${capabilities.status}).`);
const result = await capabilities.json();
if (result.status !== "ready") throw new Error("alpha.9 gateway is reachable but not ready.");

console.log(`alpha.9 FlowState runtime ready at ${localOrigin}.`);
console.log(`Routes: ${(result.routes || []).join(", ")}.`);
if (publicMode) console.log(`Public TLS profile enabled for ${env.FLOWSTATE_PUBLIC_HOST}.`);
