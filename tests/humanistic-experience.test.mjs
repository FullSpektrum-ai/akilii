import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("ordinary UI hides internal harness language", () => {
  const app = read("../src/app.js");
  for (const leak of ["<h3>FlowState</h3>", "G06", "View available tools", "Your Work tools", "Execution remains off", "Runtime fallback used"]) {
    assert.equal(app.includes(leak), false, `user-facing technical language leaked: ${leak}`);
  }
  assert.match(app, /This works quietly inside akilii/);
  assert.match(app, /What can akilii see\?/);
});

test("chat and voice share the humanistic language contract", () => {
  const api = read("../src/api.js");
  const voice = read("../src/living.js");
  const agent = read("../runtime/flowstate/agents/akilii-companion.md");
  assert.match(api, /clear, natural, everyday language for the general population/);
  assert.match(voice, /clear, natural, everyday language/);
  assert.match(agent, /never make the person decode system language/i);
  assert.equal(voice.includes('"Voice error" +'), false);
});
