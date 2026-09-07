/** Demonstration modules selected by the user, never inferred as a personal trait. */
export const domainModules = Object.freeze([
  {
    id: 'sport',
    label: 'Sport',
    objective: 'Arrive ready for Saturday’s match',
    next: 'Choose one preparation focus',
    waiting: 'Coach feedback',
    later: 'Next month’s training plan',
    question: 'What would help you feel prepared?',
    prompt:
      'Help me organise match preparation, the coach feedback I am waiting for, and what can wait.',
  },
  {
    id: 'education',
    label: 'Education',
    objective: 'Make progress on the next assignment',
    next: 'Outline the opening paragraph',
    waiting: 'Tutor clarification',
    later: 'Revision for next term',
    question: 'Which part of the brief needs clarification?',
    prompt:
      'Help me start the assignment while I wait for tutor clarification, and keep later revision separate.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    objective: 'Make this week feel more manageable',
    next: 'Choose one household task',
    waiting: 'A shared-calendar reply',
    later: 'The weekend project',
    question: 'What matters most this week?',
    prompt:
      'Help me organise this week’s household tasks, a reply I am waiting for, and a project that can wait.',
  },
  {
    id: 'wellness',
    label: 'Wellness',
    objective: 'Make room for a personally chosen wellbeing routine',
    next: 'Choose a small everyday pause',
    waiting: 'A friend’s availability',
    later: 'A longer routine redesign',
    question: 'What kind of pause would you choose?',
    prompt:
      'Help me plan a small everyday pause and time with a friend, keeping a bigger routine redesign for later.',
  },
]);
export function domainFixture(id) {
  const module = domainModules.find((item) => item.id === id);
  if (!module) throw new Error('Choose a supported domain.');
  return {
    objective: module.objective,
    message: module.prompt,
    items: [
      {
        id: `${id}-next`,
        title: module.next,
        detail: 'A fictional example you can change before taking a next step.',
        relation: 'can_move',
      },
      {
        id: `${id}-waiting`,
        title: module.waiting,
        detail:
          'Waiting in this synthetic scenario; no service or person has been contacted.',
        relation: 'waiting',
      },
      {
        id: `${id}-later`,
        title: module.later,
        detail: 'Explicitly put aside for this demo session.',
        relation: 'later',
      },
      {
        id: `${id}-question`,
        title: module.question,
        detail: 'An open question, not an inferred answer.',
        relation: 'open',
      },
    ],
  };
}
