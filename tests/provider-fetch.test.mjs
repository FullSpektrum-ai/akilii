import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOpenAIModelFetch,
  sanitizeOpenAIResponseRequest,
  supportsOpenAIReasoning,
} from '../backend/provider-fetch.js';

test('GPT-4o does not receive a reasoning field', () => {
  const body = sanitizeOpenAIResponseRequest({model: 'gpt-4o', reasoning: {effort: 'none'}, input: []});
  assert.equal('reasoning' in body, false);
});

test('GPT-5 family can retain reasoning settings', () => {
  assert.equal(supportsOpenAIReasoning('gpt-5.4'), true);
  const body = sanitizeOpenAIResponseRequest({model: 'gpt-5.4', reasoning: {effort: 'low'}});
  assert.deepEqual(body.reasoning, {effort: 'low'});
});

test('internal agent_choice marker is removed before OpenAI', async () => {
  let captured;
  const mockFetch = async (_url, options) => {
    captured = JSON.parse(options.body);
    return new Response('{}', {status: 200});
  };
  const fetcher = createOpenAIModelFetch(mockFetch);
  await fetcher('https://api.openai.com/v1/responses', {
    method: 'POST',
    body: JSON.stringify({model: 'gpt-4o', agent_choice: true, reasoning: {effort: 'none'}}),
  });
  assert.equal('agent_choice' in captured, false);
  assert.equal('reasoning' in captured, false);
});
