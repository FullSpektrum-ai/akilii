import test from 'node:test';
import assert from 'node:assert/strict';
import {selectChatRuntime} from '../backend/runtime-router.js';

test('simple conversational turns stay direct', () => {
  const decision = selectChatRuntime({message: 'Can you help me phrase this sentence?', flowstateAvailable: true});
  assert.equal(decision.runtime, 'direct');
  assert.equal(decision.fallback, false);
});

test('Quick mode strongly prefers direct', () => {
  const decision = selectChatRuntime({message: 'Quick: compare these two options and give me one step.', mode: 'Quick', flowstateAvailable: true});
  assert.equal(decision.runtime, 'direct');
});

test('complex planning routes to FlowState assist when qualified', () => {
  const decision = selectChatRuntime({
    message: 'Map out the architecture, dependencies and implementation sequence, then compare the trade-offs.',
    mode: 'Think it through',
    conversationTurns: 9,
    flowstateAvailable: true,
  });
  assert.equal(decision.runtime, 'flowstate_assist');
  assert.ok(decision.reasonCodes.includes('COMPLEX_TASK_LANGUAGE'));
});

test('Work tools route to FlowState assist', () => {
  const decision = selectChatRuntime({message: 'Continue this work.', workTools: true, flowstateAvailable: true});
  assert.equal(decision.runtime, 'flowstate_assist');
});

test('FlowState unavailability fails open to direct', () => {
  const decision = selectChatRuntime({
    message: 'Plan and coordinate a multi-step implementation roadmap.',
    flowstateAvailable: false,
  });
  assert.equal(decision.preferred, 'flowstate_assist');
  assert.equal(decision.runtime, 'direct');
  assert.equal(decision.fallback, true);
  assert.ok(decision.reasonCodes.includes('FLOWSTATE_UNAVAILABLE'));
});

test('NPR does not orchestrate a trivial turn by itself', () => {
  const decision = selectChatRuntime({
    message: 'Hello',
    useContext: true,
    nprItemCount: 12,
    nprTypeCount: 6,
    flowstateAvailable: true,
  });
  assert.equal(decision.runtime, 'direct');
  assert.ok(!decision.reasonCodes.includes('APPROVED_CONTEXT_BREADTH'));
});

test('approved NPR can raise an already complex contextual turn', () => {
  const decision = selectChatRuntime({
    message: 'Help me compare the options.',
    useContext: true,
    nprItemCount: 6,
    nprTypeCount: 3,
    flowstateAvailable: true,
  });
  assert.equal(decision.runtime, 'flowstate_assist');
  assert.ok(decision.reasonCodes.includes('APPROVED_CONTEXT_BREADTH'));
});

test('Use my context off prevents NPR from affecting routing', () => {
  const decision = selectChatRuntime({
    message: 'Help me compare the options.',
    useContext: false,
    nprItemCount: 12,
    nprTypeCount: 6,
    flowstateAvailable: true,
  });
  assert.equal(decision.runtime, 'direct');
  assert.ok(!decision.reasonCodes.some(code => code.startsWith('APPROVED_CONTEXT_')));
});
