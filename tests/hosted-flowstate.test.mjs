import test from "node:test";
import assert from "node:assert/strict";
import { createHostedFlowStateGenerate } from "../backend/hosted-flowstate.js";

test("hosted FlowState sends bounded identity and preserves the selected model", async () => {
  let request;
  const generate = createHostedFlowStateGenerate({
    baseUrl: "https://runtime.example.test/",
    token: "x".repeat(40),
    fetcher: async (url, options) => {
      request = { url, options, body: JSON.parse(options.body) };
      return Response.json({ content: "A useful next step.", model: "gpt-4o", provider: "openai" });
    },
  });
  const result = await generate({ conversationId: "12345678-1234-1234-1234-123456789012", subject: "12345678-1234-1234-1234-123456789012", model: { id: "gpt-4o", provider: "openai" }, content: "Help", route: "shape" });
  assert.equal(result.content, "A useful next step.");
  assert.equal(request.url, "https://runtime.example.test/v1/generate");
  assert.equal(request.options.headers.Authorization, "Bearer " + "x".repeat(40));
  assert.equal(request.body.route, "shape");
});

test("hosted FlowState refuses silent provider fallback", async () => {
  const generate = createHostedFlowStateGenerate({ baseUrl: "https://runtime.example.test/", token: "x".repeat(40), fetcher: async () => Response.json({ content: "Answer", model: "claude-sonnet-4-6", provider: "anthropic" }) });
  await assert.rejects(() => generate({ conversationId: "12345678-1234-1234-1234-123456789012", subject: "12345678-1234-1234-1234-123456789012", model: { id: "gpt-4o", provider: "openai" }, content: "Help", route: "shape" }), /selected AI was not honoured/);
});
