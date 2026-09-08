import test from 'node:test';
import assert from 'node:assert/strict';

import {
  compileConversationPolicy,
  compileExecutionSpec,
  compileSupportProfile,
  createThread,
  createWorkItem,
  projectContext,
  proposeLearningFromOutcome,
  recordOutcome,
  transitionThread,
  validateExecutionSpec,
} from '../app/core/index.js';

const baseItem = {
  itemType: 'support_preference',
  tier: 'semi_stable',
  lifecycleState: 'active',
  confirmationState: 'confirmed',
  confidence: 0.9,
  sensitivity: 'standard',
  controls: { useAllowed: true, purposeScopes: ['support'], exportAllowed: true },
};

test('context projection excludes data before it reaches a runtime', () => {
  const projection = projectContext(
    [
      { ...baseItem, id: 'allowed', payload: { strategy: 'whole_map_first' } },
      {
        ...baseItem,
        id: 'proposed',
        confirmationState: 'proposed',
        payload: { strategy: 'one_next_move' },
      },
      {
        ...baseItem,
        id: 'restricted',
        controls: { useAllowed: false, purposeScopes: ['support'] },
        payload: { strategy: 'one_next_move' },
      },
      {
        ...baseItem,
        id: 'sensitive',
        sensitivity: 'sensitive',
        payload: { strategy: 'one_next_move' },
      },
      {
        ...baseItem,
        id: 'expired',
        expiresAt: '2026-01-01T00:00:00.000Z',
        payload: { strategy: 'one_next_move' },
      },
    ],
    {
      purpose: 'support',
      sensitivityAllowance: 'standard',
      now: '2026-09-08T12:00:00.000Z',
    },
  );

  assert.deepEqual(projection.items.map(item => item.itemId), ['allowed']);
  assert.equal(projection.excludedCounts.confirmation, 1);
  assert.equal(projection.excludedCounts.restricted, 1);
  assert.equal(projection.excludedCounts.sensitivity, 1);
  assert.equal(projection.excludedCounts.expired, 1);
});

test('current explicit request outranks an older confirmed support preference', () => {
  const projection = projectContext(
    [{ ...baseItem, id: 'overview', payload: { strategy: 'whole_map_first' } }],
    { purpose: 'support' },
  );

  const learned = compileSupportProfile(projection, { message: 'Help me think about this.' });
  assert.equal(learned.representation, 'meaning_field');

  const overridden = compileSupportProfile(projection, {
    message: 'For this one, just give me one next step.',
  });
  assert.equal(overridden.representation, 'one_next_move');
  assert.equal(overridden.maxOptions, 1);
});

test('text and voice share one support policy spine', () => {
  const supportProfile = compileSupportProfile(
    { items: [] },
    { message: 'Challenge my assumptions and show me the whole picture.' },
  );

  const textPolicy = compileConversationPolicy({
    modality: 'text',
    supportProfile,
    message: 'Challenge my assumptions and show me the whole picture.',
  });
  const voicePolicy = compileConversationPolicy({
    modality: 'voice',
    supportProfile,
    message: 'Challenge my assumptions and show me the whole picture.',
  });

  assert.deepEqual(textPolicy.support, voicePolicy.support);
  assert.deepEqual(textPolicy.constitution, voicePolicy.constitution);
  assert.equal(textPolicy.modality, 'text');
  assert.equal(voicePolicy.modality, 'voice');
  assert.notDeepEqual(textPolicy.modalityGuidance, voicePolicy.modalityGuidance);
});

test('reflective intent does not force a next action', () => {
  const supportProfile = compileSupportProfile(
    { items: [] },
    { message: 'Just listen for now. I need to think aloud.' },
  );
  const policy = compileConversationPolicy({
    modality: 'voice',
    supportProfile,
    message: 'Just listen for now. I need to think aloud.',
  });

  assert.equal(supportProfile.representation, 'reflective_space');
  assert.equal(supportProfile.maxOptions, 0);
  assert.equal(policy.mode, 'explore');
  assert.match(policy.interactionGuidance.join(' '), /Do not force a solution/i);
});

test('durable Work requires explicit approval', () => {
  const input = {
    id: 'work-1',
    subjectId: 'user-1',
    title: 'Beta launch',
    body: 'Ship the next acceptance slice.',
  };

  assert.throws(() => createWorkItem(input), /explicit approval/i);
  const work = createWorkItem({ ...input, approved: true, at: 1 });
  assert.equal(work.status, 'active');
  assert.equal(work.version, 1);
});

test('Thread closure cannot fabricate completion', () => {
  const thread = createThread({
    id: 'thread-1',
    subjectId: 'user-1',
    title: 'Architecture review',
    objective: 'Finish the architecture review.',
    at: 1,
  });

  assert.throws(() => transitionThread(thread, { to: 'closed', at: 2 }), /confirmation/i);
  const held = transitionThread(thread, { to: 'held', nextMove: 'Review the adapter boundary.', at: 2 });
  assert.equal(held.status, 'held');
  assert.equal(held.nextMove, 'Review the adapter boundary.');
});

test('outcome feedback proposes learning but never commits personal context', () => {
  const noFeedback = recordOutcome({
    id: 'outcome-1',
    subjectId: 'user-1',
    episodeId: 'episode-1',
    status: 'completed',
  });
  assert.equal(
    proposeLearningFromOutcome(noFeedback, { id: 'learning-1', statement: 'Use this approach again.' }),
    null,
  );

  const outcome = recordOutcome({
    id: 'outcome-2',
    subjectId: 'user-1',
    episodeId: 'episode-2',
    status: 'completed',
    feedback: 'Seeing the whole structure first helped this time.',
  });
  const proposal = proposeLearningFromOutcome(outcome, {
    id: 'learning-2',
    itemType: 'strategy',
    statement: 'Seeing the whole structure first may help with similar architecture work.',
  });

  assert.equal(proposal.status, 'proposed');
  assert.equal(proposal.requiresConfirmation, true);
  assert.equal(proposal.itemType, 'strategy');
});

test('execution remains engine-neutral and side effects are approval-gated', () => {
  const spec = compileExecutionSpec({
    objective: 'Prepare a reviewed launch checklist.',
    capabilities: ['planning', 'writing', 'review'],
    tools: ['document_writer'],
    externalSideEffectsRequested: true,
  });

  assert.equal(spec.route, 'workflow');
  assert.equal(spec.policy.idempotencyRequired, true);
  assert.equal(spec.policy.humanApprovalRequired, true);
  assert.equal(spec.policy.externalSideEffectsAllowed, false);
  assert.equal('flowstate' in spec, false);
  assert.equal(validateExecutionSpec(spec), spec);
});
