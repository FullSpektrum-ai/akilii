const fail = (message, status = 502) => {
  throw Object.assign(new Error(message), { status });
};

export function createHostedFlowStateGenerate({ baseUrl, token, fetcher = fetch }) {
  const origin = new URL(baseUrl);
  if (origin.protocol !== "https:" || origin.pathname !== "/" || origin.search || origin.hash)
    throw new Error("Hosted FlowState requires an HTTPS origin.");
  if (!token || token.length < 32) throw new Error("Hosted FlowState requires a service token.");
  return async ({ conversationId, subject, model, content, route = "shape", signal, onActivity = () => {} }) => {
    onActivity("Preparing the right support for this request");
    const response = await fetcher(origin.origin + "/v1/generate", {
      method: "POST",
      redirect: "error",
      signal,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, subject, model, content, route }),
    });
    if (!response.ok) fail(response.status === 504 ? "akilii is taking too long. Please try again." : "akilii could not complete this response.", response.status === 429 ? 429 : 502);
    const result = await response.json();
    if (!result || typeof result.content !== "string" || !result.content.trim()) fail("The support runtime returned no usable response.");
    if (result.model !== model.id || result.provider !== (model.provider || "openai")) fail("The selected AI was not honoured by the support runtime.");
    return result;
  };
}
