import { emptyState, h, sectionHeading } from '../dom.js';

function renderMessage(message) {
  return h('article', {
    className: `message message-${message.role || 'assistant'}`,
  }, [
    h('span', {
      className: 'message-role',
      text: message.role === 'user' ? 'You' : 'akilii',
    }),
    h('div', {
      className: 'message-content',
      text: message.content || '',
    }),
  ]);
}

export function renderIntegrationChat(state, actions) {
  const root = h('section', {
    className: 'view chat-view',
    dataset: { view: 'chat' },
  });
  root.append(sectionHeading(
    'CHAT',
    'Think with me.',
    'Bring the unfinished thought. The structure can come later.',
  ));

  const contextCount = state.context?.items?.length || 0;
  const contextToggle = h('input', {
    type: 'checkbox',
    checked: state.useContext !== false,
  });
  contextToggle.addEventListener('change', event => {
    actions.setUseContext(event.target.checked);
  });
  root.append(h('div', { className: 'context-strip' }, [
    h('label', {}, [
      contextToggle,
      ' Use my approved context when it is relevant',
    ]),
    h('button', {
      className: 'text-action',
      text: `Review context${contextCount ? ` (${contextCount})` : ''}`,
      onClick: () => actions.navigate('context'),
    }),
  ]));

  const transcript = h('div', {
    className: 'transcript',
    role: 'log',
    'aria-live': 'polite',
  });
  if (state.messages?.length) {
    transcript.append(...state.messages.map(renderMessage));
  } else {
    transcript.append(emptyState(
      'Start with the messy version.',
      'You do not need to organise the thought before bringing it here.',
    ));
  }
  root.append(transcript);

  if (state.capabilities?.voice) {
    const connected = state.voice?.status === 'connected';
    root.append(h('div', { className: 'context-strip' }, [
      h('span', {
        text: connected
          ? 'Voice is connected. Completed turns are saved to this conversation.'
          : 'Prefer to talk it through? Voice uses the same support context and policy as Chat.',
      }),
      h('button', {
        className: connected ? 'danger-action' : 'secondary-action',
        text: connected ? 'End voice' : 'Start voice',
        onClick: () => connected ? actions.stopVoice() : actions.startVoice(),
      }),
    ]));
  }

  const input = h('textarea', {
    className: 'composer-input',
    rows: 3,
    maxLength: 5000,
    placeholder: 'What are you working through?',
    'aria-label': 'Message akilii',
  });
  const form = h('form', { className: 'composer' }, [
    input,
    h('div', { className: 'composer-row' }, [
      h('span', {
        className: 'composer-hint',
        text: 'Say it however it comes out.',
      }),
      h('button', {
        className: 'primary-action',
        type: 'submit',
        text: state.status === 'sending' ? 'Sending…' : 'Send',
        disabled: state.status === 'sending',
      }),
    ]),
  ]);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return input.focus();
    input.value = '';
    actions.sendMessage(message);
  });
  root.append(form);
  return root;
}
