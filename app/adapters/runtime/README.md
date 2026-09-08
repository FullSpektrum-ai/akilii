# app/adapters/runtime

Runtime adapters translate the already-compiled akilii interaction contract into provider-specific requests and normalized runtime events.

They do **not** decide how akilii should support a person. By the time a request reaches this layer, `app/core` has already produced the bounded Context Projection, SupportProfile and ConversationPolicy.

## Rules

- one common runtime envelope for every provider;
- no provider-specific system personality;
- no provider-owned memory is treated as NPR;
- no silent fallback between providers or local/cloud modes;
- excluded context never reaches a provider payload;
- provider persistence is disabled where the API supports that control;
- tools are absent unless an explicitly authorized tool contract is supplied;
- adapters normalize output events and never expose chain-of-thought or provider internals to product UI;
- FlowState is a separate execution-engine adapter and is not enabled by this package.

## Providers in this slice

- OpenAI Responses API for streamed text;
- Anthropic Messages API for streamed text;
- Ollama `/api/chat` for local streamed text;
- OpenAI Realtime WebRTC call creation for voice.

Models are injected configuration. Product code does not hard-code a strategic model choice.
