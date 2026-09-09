export function supportsOpenAIReasoning(modelId = '') {
  return /^(?:gpt-5(?:[.\-]|$)|o\d(?:[.\-]|$))/i.test(String(modelId));
}

export function sanitizeOpenAIResponseRequest(input) {
  const body = input && typeof input === 'object' ? structuredClone(input) : input;
  if (!body || typeof body !== 'object') return body;
  // agent_choice is an internal test-harness marker, not an OpenAI Responses field.
  delete body.agent_choice;
  if (!supportsOpenAIReasoning(body.model)) delete body.reasoning;
  return body;
}

export function createOpenAIModelFetch(fetcher = fetch) {
  return async (url, options = {}) => {
    if (
      String(url).startsWith('https://api.openai.com/v1/responses') &&
      typeof options.body === 'string'
    ) {
      const parsed = JSON.parse(options.body);
      return fetcher(url, {
        ...options,
        body: JSON.stringify(sanitizeOpenAIResponseRequest(parsed)),
      });
    }
    return fetcher(url, options);
  };
}
