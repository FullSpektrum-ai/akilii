import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, "deploy/flowstate/config");
await mkdir(resolve(target, "agents"), { recursive: true });
await mkdir(resolve(target, "swarms"), { recursive: true });
await cp(resolve(root, "runtime/flowstate/agents"), resolve(target, "agents"), { recursive: true, force: true });
await cp(resolve(root, "runtime/flowstate/swarms"), resolve(target, "swarms"), { recursive: true, force: true });
console.log("Prepared four alpha.9 roles and two bounded swarms for deployment.");
