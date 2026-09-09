import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const FLOWSTATE_REPOSITORY = "https://github.com/baphled/FlowState.git";
export const FLOWSTATE_REVISION = "40e022bd4e0c747b9f38a3ab04fa3d7cf75ad42d";
export const FLOWSTATE_IMAGE = "flowstate-backend:alpha9-40e022bd4e0c";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheRoot = resolve(process.env.AKILII_BUILD_CACHE || resolve(root, ".build-cache"), "flowstate-alpha9");
const sourceDir = resolve(cacheRoot, "source");
const contextDir = resolve(cacheRoot, "docker-context");
const backendDir = resolve(contextDir, "backend-src");
const dockerfile = resolve(contextDir, "Dockerfile.alpha9");

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

function capture(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolvePromise() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

capture("git", ["--version"]);
capture("docker", ["version", "--format", "{{.Server.Version}}"]);
await mkdir(cacheRoot, { recursive: true });

if (!(await exists(resolve(sourceDir, ".git")))) {
  await rm(sourceDir, { recursive: true, force: true });
  await run("git", ["clone", "--filter=blob:none", "--no-checkout", FLOWSTATE_REPOSITORY, sourceDir]);
}

await run("git", ["-C", sourceDir, "remote", "set-url", "origin", FLOWSTATE_REPOSITORY]);
await run("git", ["-C", sourceDir, "fetch", "--depth", "1", "origin", FLOWSTATE_REVISION]);
await run("git", ["-C", sourceDir, "checkout", "--detach", "--force", FLOWSTATE_REVISION]);
const actualRevision = capture("git", ["-C", sourceDir, "rev-parse", "HEAD"]);
if (actualRevision !== FLOWSTATE_REVISION) throw new Error(`FlowState revision mismatch: expected ${FLOWSTATE_REVISION}, received ${actualRevision}`);

const goMod = await readFile(resolve(sourceDir, "go.mod"), "utf8");
if (!/^go\s+1\.26(?:\.0)?$/m.test(goMod)) {
  throw new Error("Pinned FlowState no longer declares the expected Go 1.26 toolchain; review the alpha.9 compatibility build before proceeding.");
}

await rm(contextDir, { recursive: true, force: true });
await mkdir(backendDir, { recursive: true });
await cp(sourceDir, backendDir, {
  recursive: true,
  filter: (source) => {
    const relative = source.slice(sourceDir.length).replace(/^[/\\]/, "");
    return relative !== ".git" && !relative.startsWith(`.git${process.platform === "win32" ? "\\" : "/"}`) && relative !== "build" && !relative.startsWith(`build${process.platform === "win32" ? "\\" : "/"}`);
  },
});

const upstreamDockerfile = await readFile(resolve(sourceDir, "Dockerfile.backend"), "utf8");
const expectedBuilder = "FROM golang:1.25-bookworm AS builder";
if (!upstreamDockerfile.includes(expectedBuilder)) {
  throw new Error("Pinned FlowState Dockerfile no longer matches the reviewed alpha.9 compatibility baseline.");
}
const compatibleDockerfile = upstreamDockerfile.replace(expectedBuilder, "FROM golang:1.26-bookworm AS builder");
await writeFile(dockerfile, compatibleDockerfile);
console.log("Applying reviewed alpha.9 FlowState build compatibility shim: Go 1.26 toolchain (upstream Dockerfile pins 1.25 while go.mod requires 1.26).");

await run("docker", [
  "build",
  "--pull",
  "--label", `org.opencontainers.image.source=${FLOWSTATE_REPOSITORY}`,
  "--label", `org.opencontainers.image.revision=${FLOWSTATE_REVISION}`,
  "--label", "ai.fullspektrum.alpha9.flowstate-go-toolchain=1.26",
  "-f", dockerfile,
  "-t", FLOWSTATE_IMAGE,
  contextDir,
]);

capture("docker", ["image", "inspect", FLOWSTATE_IMAGE]);
console.log(`Built ${FLOWSTATE_IMAGE} from FlowState ${FLOWSTATE_REVISION}.`);
