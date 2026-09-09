const DEFAULT_ORIGIN = "http://127.0.0.1:8081";

function origin(value = process.env.FLOWSTATE_BASE_URL || DEFAULT_ORIGIN) {
  const url = new URL(value);
  const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback))
    throw new Error("FlowState requires HTTPS unless it is on this device.");
  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("FlowState must be configured as an origin only.");
  return url.origin;
}

async function errorMessage(response) {
  if (response.status === 401) return "Please sign in again so akilii can continue.";
  if (response.status === 403) return "akilii could not continue this request. Please try again.";
  if (response.status === 429) return "akilii is busy right now. Please wait a moment and try again.";
  if (response.status >= 500) return "akilii is having trouble responding right now. Your message is still saved.";
  try {
    const value = await response.json();
    return value.error || value.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

function assistantText(messages = []) {
  const message = [...messages]
    .reverse()
    .find((item) => item?.role === "assistant" && item?.content);
  return message?.content || "";
}

function pause(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason || new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export function createFlowStateClient({
  fetchImpl = globalThis.fetch,
  baseURL,
} = {}) {
  const base = origin(baseURL);
  const sessions = new Map();

  async function request(
    path,
    { cookie = "", csrf = "", method = "GET", body, signal } = {},
  ) {
    const headers = { Accept: "application/json" };
    if (cookie) headers.Cookie = cookie;
    if (csrf) headers["X-CSRF-Token"] = csrf;
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      // FlowState's protected loopback boundary currently trusts its
      // companion UI origin. The adapter is server-side and never exposes
      // this credential-bearing request to the renderer.
      headers.Origin = "http://127.0.0.1:5173";
      headers.Referer = "http://127.0.0.1:5173/";
    }
    const response = await fetchImpl(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "error",
      signal,
    });
    if (!response.ok) {
      const message = await errorMessage(response);
      const error = new Error(
        message || `FlowState request failed (${response.status})`,
      );
      error.status = response.status;
      throw error;
    }
    if (response.status === 204) return null;
    return response.json();
  }

  async function csrf(cookie, signal) {
    const value = await request("/api/auth/session-csrf", { cookie, signal });
    const token = value?.csrf_token || value?.token;
    if (!token)
      throw new Error(
        "FlowState did not provide a request token. Sign in again.",
      );
    return token;
  }

  async function status(cookie = "", signal) {
    try {
      const health = await request("/health", { signal });
      if (health?.status !== "ok")
        return { reachable: false, signedIn: false, enabled: false };
      await request("/api/auth/whoami", { cookie, signal });
      return { reachable: true, signedIn: true, enabled: true, origin: base };
    } catch (error) {
      return {
        reachable: error.status === 401 || error.status === 403,
        signedIn: false,
        enabled: false,
        origin: base,
        reason:
          error.status === 401 || error.status === 403
            ? "Sign in to the local runtime."
            : "Runtime unavailable.",
      };
    }
  }

  async function generate({
    conversationId,
    cookie,
    model,
    content,
    signal,
    onActivity = () => {},
  }) {
    if (!cookie)
      throw Object.assign(
        new Error("Please sign in again so akilii can continue."),
        { status: 401 },
      );
    const token = await csrf(cookie, signal);
    let sessionId = sessions.get(conversationId);
    if (!sessionId) {
      onActivity("Preparing your conversation");
      const session = await request("/api/v1/sessions", {
        cookie,
        csrf: token,
        method: "POST",
        // The alpha.9 application prompt owns the single akilii voice. Use the
        // proven no-delegation runtime profile for the live turn; the new
        // Phase 0 specialist manifests remain available only to explicit,
        // bounded orchestration paths.
        // Use FlowState's proven turn runner for alpha.9. The user-facing
        // identity, context projection and response policy remain owned by
        // akilii; the additional specialist manifests are staged behind the
        // runtime boundary until their completion SLO passes.
        body: { agent_id: "strategist" },
        signal,
      });
      sessionId = session.id;
      sessions.set(conversationId, sessionId);
    }

    onActivity(`Using your chosen AI: ${model.label}`);
    await request(`/api/v1/sessions/${encodeURIComponent(sessionId)}/model`, {
      cookie,
      csrf: token,
      method: "PATCH",
      body: { modelId: model.id, providerId: model.provider || "openai" },
      signal,
    });

    const dispatched = await request(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}/messages`,
      {
        cookie,
        csrf: token,
        method: "POST",
        body: { content },
        signal,
      },
    );
    const turnId = dispatched?.turn_id;
    if (!turnId) {
      const output = assistantText(
        dispatched?.snapshot?.messages || dispatched?.messages,
      );
      if (!output)
        throw new Error(
          "FlowState accepted the message but did not return a response.",
        );
      return {
        content: output,
        provider: model.provider || "openai",
        model: model.id,
        sessionId,
      };
    }

    onActivity("akilii is working on your request");
    // FlowState's long-poll endpoint can hold a completed turn until its 25s
    // timeout when completion does not append another message row. A bounded
    // short poll gives the person the completed answer as soon as status flips.
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const turn = await request(
        `/api/v1/sessions/${encodeURIComponent(sessionId)}/turns/${encodeURIComponent(turnId)}`,
        { cookie, signal },
      );
      if (turn.status === "failed")
        throw new Error(
          "akilii could not finish this response. Please try again.",
        );
      if (turn.status === "completed") {
        const output = assistantText(turn.messages);
        if (!output)
          throw new Error("The runtime completed without a usable response.");
        return {
          content: output,
          provider:
            turn.model?.provider ||
            turn.current_provider ||
            model.provider ||
            "openai",
          model: turn.model?.model || turn.current_model || model.id,
          sessionId,
          turnId,
        };
      }
      onActivity(
        turn.phase === "tool_executing"
          ? "Using an approved capability"
          : "Thinking with your context",
      );
      await pause(500, signal);
    }
    throw new Error(
      "The runtime is taking too long. Your message remains saved in akilii.",
    );
  }

  return { origin: base, generate, status };
}
