import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { createFlowStateClient } from "../flowstate-client.mjs";

const port = Number(process.env.PORT || 8788);
const upstream = process.env.FLOWSTATE_BASE_URL || "http://flowstate:8080";
const serviceToken = process.env.AKILII_FLOWSTATE_TOKEN || "";
if (serviceToken.length < 32) throw new Error("Gateway service token is not configured.");

const routes = Object.freeze({
  orient: "akilii-companion",
  shape: "shape-next-move",
  work: "proposal-to-work",
  reflect: "outcome-reflector",
});

const client = createFlowStateClient({
  baseURL: upstream,
  allowInsecurePrivate: true,
  trustedInternal: true,
});

const safeEqual = (a, b) => {
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
};

const read = async (req) => {
  let size = 0, chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 48000) throw Object.assign(new Error("Request too large."), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const send = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
};

async function runtimeReady(signal) {
  const status = await client.status("", signal);
  return status.enabled === true && status.reachable === true;
}

createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      const ready = await runtimeReady(AbortSignal.timeout(2500));
      return send(res, ready ? 200 : 503, { status: ready ? "ok" : "degraded" });
    }

    const supplied = req.headers.authorization?.replace(/^Bearer /, "") || "";
    if (!safeEqual(supplied, serviceToken)) return send(res, 401, { error: "unauthorized" });

    if (req.method === "GET" && req.url === "/v1/capabilities") {
      const ready = await runtimeReady(AbortSignal.timeout(2500));
      if (!ready) return send(res, 503, { error: "runtime_unavailable" });
      return send(res, 200, { status: "ready", routes: Object.keys(routes) });
    }

    if (req.method !== "POST" || req.url !== "/v1/generate") return send(res, 404, { error: "not_found" });

    const body = await read(req);
    if (
      !body ||
      !/^[a-f0-9-]{20,80}$/i.test(body.subject || "") ||
      !/^[a-zA-Z0-9-]{10,80}$/.test(body.conversationId || "") ||
      typeof body.content !== "string" ||
      !body.content.trim() ||
      body.content.length > 32000 ||
      !routes[body.route] ||
      !body.model?.id
    ) return send(res, 400, { error: "invalid_request" });

    const key = createHash("sha256").update(body.subject).digest("hex");
    const result = await client.generate({
      conversationId: key + ":" + body.conversationId,
      agentId: routes[body.route],
      model: body.model,
      content: body.content,
      signal: AbortSignal.timeout(65000),
    });
    return send(res, 200, result);
  } catch (error) {
    console.error("gateway_request_failed", error?.status || error?.name || "Error", String(error?.message || "").slice(0, 240));
    return send(res, error?.status || 502, { error: "runtime_unavailable" });
  }
}).listen(port, "0.0.0.0", () => console.log(`akilii FlowState gateway listening on ${port}`));
