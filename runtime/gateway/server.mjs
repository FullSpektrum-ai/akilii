import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { createFlowStateClient } from "../flowstate-client.mjs";

const port = Number(process.env.PORT || 8788);
const upstream = process.env.FLOWSTATE_BASE_URL || "http://flowstate:8080";
const serviceToken = process.env.AKILII_FLOWSTATE_TOKEN || "";
const upstreamSecret = process.env.FLOWSTATE_AUTH_SECRET || "";
const allowedOrigin = process.env.FLOWSTATE_ALLOWED_ORIGIN || "http://127.0.0.1:5173";
if (serviceToken.length < 32 || !upstreamSecret) throw new Error("Gateway secrets are not configured.");

const clients = new Map();
const routes = Object.freeze({ orient: "akilii-companion", shape: "shape-next-move", work: "proposal-to-work", reflect: "outcome-reflector" });
const safeEqual = (a, b) => {
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
};
const cookies = (headers) => (headers.getSetCookie?.() || [headers.get("set-cookie")].filter(Boolean)).map((v) => v.split(";", 1)[0]).join("; ");
async function login() {
  const common = { Origin: allowedOrigin, Referer: allowedOrigin + "/" };
  const pre = await fetch(upstream + "/api/auth/csrf", { headers: common, redirect: "error" });
  if (!pre.ok) throw new Error(`FlowState sign-in preparation failed (${pre.status}).`);
  const preCookie = cookies(pre.headers), csrf = (await pre.json()).csrf_token;
  const auth = await fetch(upstream + "/api/auth/login", { method: "POST", redirect: "error", headers: { ...common, Cookie: preCookie, "X-CSRF-Token": csrf, "Content-Type": "application/json" }, body: JSON.stringify({ secret: upstreamSecret }) });
  if (!auth.ok) {
    const detail = (await auth.text()).slice(0, 120).replace(/[\r\n]+/g, " ");
    throw new Error(`FlowState service sign-in failed (${auth.status}: ${detail}).`);
  }
  const cookie = [preCookie, cookies(auth.headers)].filter(Boolean).join("; ");
  const client = createFlowStateClient({ baseURL: upstream, allowInsecurePrivate: true, fetchImpl: (url, options = {}) => fetch(url, { ...options, headers: { ...options.headers, Origin: allowedOrigin, Referer: allowedOrigin + "/" } }) });
  return [client, cookie];
}
async function clientFor(subject) {
  let entry = clients.get(subject);
  if (!entry || entry.expires < Date.now()) {
    const [client, cookie] = await login();
    entry = { client, cookie, expires: Date.now() + 6 * 60 * 60 * 1000 };
    clients.set(subject, entry);
  }
  return entry;
}
const read = async (req) => {
  let size = 0, chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 48000) throw Object.assign(new Error("Request too large."), { status: 413 }); chunks.push(chunk); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};
const send = (res, status, data) => { res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(data)); };
createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") return send(res, 200, { status: "ok" });
    const supplied = req.headers.authorization?.replace(/^Bearer /, "") || "";
    if (!safeEqual(supplied, serviceToken)) return send(res, 401, { error: "unauthorized" });
    if (req.method === "GET" && req.url === "/v1/capabilities") return send(res, 200, { status: "ready", routes: Object.keys(routes) });
    if (req.method !== "POST" || req.url !== "/v1/generate") return send(res, 404, { error: "not_found" });
    const body = await read(req);
    if (!body || !/^[a-f0-9-]{20,80}$/i.test(body.subject || "") || !/^[a-zA-Z0-9-]{10,80}$/.test(body.conversationId || "") || typeof body.content !== "string" || !body.content.trim() || body.content.length > 32000 || !routes[body.route] || !body.model?.id)
      return send(res, 400, { error: "invalid_request" });
    const key = createHash("sha256").update(body.subject).digest("hex");
    const entry = await clientFor(key);
    const result = await entry.client.generate({ conversationId: key + ":" + body.conversationId, agentId: routes[body.route], cookie: entry.cookie, model: body.model, content: body.content, signal: AbortSignal.timeout(65000) });
    return send(res, 200, result);
  } catch (error) {
    console.error("gateway_request_failed", error?.status || error?.name || "Error", String(error?.message || "").slice(0, 240));
    return send(res, error?.status || 502, { error: "runtime_unavailable" });
  }
}).listen(port, "0.0.0.0", () => console.log(`akilii FlowState gateway listening on ${port}`));
