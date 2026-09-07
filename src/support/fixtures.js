export const flagshipFixture = {
  objective: 'Make Thursday’s meeting clear',
  message:
    'The pitch needs an opening, the technical review is waiting, and the workshop plan can wait. Help me see how it fits.',
  items: [
    {
      id: 'opening',
      title: 'Write the opening value sentence',
      detail: 'What must they understand in the first 30 seconds?',
      relation: 'can_move',
    },
    {
      id: 'review',
      title: 'Technical review',
      detail: 'Waiting for the fictional reviewer’s response.',
      relation: 'waiting',
    },
    {
      id: 'workshop',
      title: 'Workshop plan',
      detail: 'Explicitly put aside for this session.',
      relation: 'later',
    },
    {
      id: 'question',
      title: 'What is the actual blocker?',
      detail: 'An open question, not an inferred answer.',
      relation: 'open',
    },
  ],
};
