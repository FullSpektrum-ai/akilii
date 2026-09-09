import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdaptiveFlowStateGenerate} from '../backend/adaptive-flowstate.js';

function openAIResponse(text) {
  return new Response(JSON.stringify({output:[{content:[{type:'output_text',text}]}]}), {
    status: 200,
    headers: {'Content-Type':'application/json'},
  });
}

test('FlowState receives the bounded hosted Ollama model while final answer preserves selected model', async () => {
  let assistModel, finalBody;
  const flowstateGenerate = async args => {
    assistModel = args.model;
    return {content:'Sequence the dependencies first.'};
  };
  const fetcher = async (_url, options) => {
    finalBody = JSON.parse(options.body);
    return openAIResponse('Final answer');
  };
  const generate = createAdaptiveFlowStateGenerate({flowstateGenerate, openAIKey:'test', fetcher});
  const result = await generate({
    model:{id:'gpt-4o',provider:'openai',maxOutput:1000,effort:'none'},
    content:'User task',
  });
  assert.equal(assistModel.id, 'akilii-qwen3:0.6b');
  assert.equal(assistModel.provider, 'ollama');
  assert.equal(finalBody.model, 'gpt-4o');
  assert.equal('reasoning' in finalBody, false);
  assert.equal(result.model, 'gpt-4o');
  assert.equal(result.provider, 'openai');
  assert.equal(result.assisted, true);
});

test('FlowState failure fails open to selected direct model', async () => {
  const traces=[];
  const generate = createAdaptiveFlowStateGenerate({
    flowstateGenerate: async () => { throw new Error('offline'); },
    openAIKey:'test',
    fetcher: async () => openAIResponse('Direct fallback answer'),
    trace: event => traces.push(event),
  });
  const result = await generate({
    model:{id:'gpt-4o',provider:'openai',maxOutput:1000,effort:'none'},
    content:'Complex user task',
  });
  assert.equal(result.content, 'Direct fallback answer');
  assert.equal(result.assisted, false);
  assert.ok(traces.some(event => event.runtime === 'direct_fallback'));
});
