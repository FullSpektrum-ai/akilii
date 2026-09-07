import { test } from 'node:test';
import assert from 'node:assert/strict';
import { episodePrompts } from '../src/support/prompts.js';
import { flagshipFixture } from '../src/support/fixtures.js';
test('contextual chips quote the actual objective and open question', () => {
  const options = episodePrompts({
    context: flagshipFixture,
    plan: { representation: 'meaning_field', nextMove: 'Write the opening' },
  });
  assert(options.every((o) => o.prompt.includes(flagshipFixture.objective)));
  assert(options.some((o) => o.prompt.includes('What is the actual blocker?')));
});
test('chips adapt to narrow support, drafts, Home Thread and Work', () => {
  const context = { objective: 'Workshop' },
    plan = { representation: 'one_next_move', nextMove: 'Choose the audience' };
  assert.match(
    episodePrompts({ context, plan })[0].prompt,
    /Choose the audience/,
  );
  assert.match(
    episodePrompts({ context, plan, draft: true })[0].prompt,
    /draft above/,
  );
  const thread = {
    title: 'Pitch',
    last_confirmed: 'Opening saved',
    next_move: 'Review the ask',
  };
  assert.match(
    episodePrompts({ surface: 'home', thread })[0].prompt,
    /Opening saved/,
  );
  assert.match(
    episodePrompts({ surface: 'work', work: [{ title: 'Workshop' }] })[0]
      .prompt,
    /Workshop/,
  );
  assert.equal(episodePrompts({}), null);
});
