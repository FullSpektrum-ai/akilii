/* Guided actions share one review boundary across text, speech and hybrid input. */
let activeConversationCleanup = null;
function conversationAction({
  title,
  fields,
  initial = {},
  save,
  receipt = 'Your choices are saved.',
}) {
  activeConversationCleanup?.();
  if (voiceSession) stopVoice();
  const values = { ...initial };
  let step = 0,
    listening = false,
    speaking = false,
    recognition = null,
    timer = null,
    disposed = false, speechTicket = 0;
  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  function halt() {
    listening = false;
    speaking = false; speechTicket++;
    clearTimeout(timer);
    recognition?.abort();
    recognition = null;
    window.speechSynthesis?.cancel();
  }
  function cleanup() {
    disposed = true;
    halt();
    $('dialog').removeEventListener('close', cleanup);
    if (activeConversationCleanup === cleanup) activeConversationCleanup = null;
  }
  activeConversationCleanup = cleanup;
  $('dialog').addEventListener('close', cleanup);
  function speak(text) {
    if (!listening) return;
    if (!window.speechSynthesis) {
      listen();
      return;
    }
    speaking = true;
    const ticket=++speechTicket;
    recognition?.abort();
    recognition = null;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = utterance.onerror = () => {
      if(disposed||ticket!==speechTicket)return;
      speaking = false;
      if (listening) listen();
    };
    window.speechSynthesis.speak(utterance);
  }
  function listen() {
    if (!listening || speaking || disposed || recognition) return;
    const r = new Recognition();
    recognition = r;
    r.continuous = false;
    r.interimResults = false;
    r.lang = navigator.language || 'en-GB';
    r.onresult = (event) => {
      if(disposed||!listening)return;
      const text = Array.from(event.results)
        .filter((x) => x.isFinal)
        .map((x) => x[0].transcript)
        .join(' ')
        .trim();
      const command = text.toLowerCase().replace(/[.!?]+$/, '');
      if (step === fields.length && command === 'confirm these changes') {
        $('conversation-confirm')?.click();
        return;
      }
      if (command === 'go back') {
        $('conversation-back')?.click();
        return;
      }
      if (step < fields.length && command === 'next') {
        $('conversation-next')?.click();
        return;
      }
      if (step < fields.length && command === 'keep current') {
        $('conversation-keep')?.click();
        return;
      }
      const input = $('conversation-answer');
      if (input) {
        input.value =
          input.dataset.pristine === 'true'
            ? text
            : (input.value + ' ' + text).trim();
        input.dataset.pristine = 'false';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    r.onerror = (event) => {
      if(disposed)return;
      if (
        !['aborted','no-speech'].includes(event.error)
      ) {
        listening = false;
        $('conversation-status').textContent =
          'Microphone or speech recognition unavailable. Your text is retained; you can type or use system dictation.';
        if ($('conversation-speech'))
          $('conversation-speech').textContent = 'Speak and listen';
      }
    };
    r.onend = () => {
      if (recognition === r) recognition = null;
      if (listening && !speaking && !disposed) timer = setTimeout(listen, 250);
    };
    try {
      r.start();
    } catch {
      recognition = null;
      listening = false;
      $('conversation-status').textContent =
        'Speech recognition could not start. Continue with text or system dictation.';
    }
  }
  function draw() {
    const field = fields[step],
      review = !field;
    const question = review
      ? 'Here is what I will change. Does this look right?'
      : field.question;
    dialog(
      title,
      `<section class="conversation-action"><p class="eyebrow">${review ? 'REVIEW BEFORE SAVING' : 'ONE QUESTION AT A TIME · ' + (step + 1) + ' OF ' + fields.length}</p><h3>${esc(question)}</h3><p>Type, speak, or switch between them. Speech recognition may use your browser’s speech service.</p><button type="button" id="conversation-speech" ${Recognition ? '' : 'disabled'}>${listening ? 'Pause microphone' : 'Speak and listen'}</button><p id="conversation-status" role="status">${Recognition ? 'Say “next” to continue, “keep current” to skip, or “go back”.' : 'Browser speech recognition is unavailable here. System dictation or text remains available.'}</p>${review ? '<dl class="conversation-review">' + fields.map((f) => '<div class="conversation-review-item"><dt>' + esc(f.label) + '<small>'+(values[f.key]===initial[f.key]?'Kept as it is':'Your proposed change')+'</small></dt><dd>' + esc(f.choices?.find((c) => c.value === values[f.key])?.label || values[f.key] || 'Not set') + '</dd></div>').join('') + '</dl><p>Nothing has been saved yet. To approve by voice, say “confirm these changes”.</p><button id="conversation-confirm" class="primary">Confirm these changes</button>' : `<form id="conversation-form"><label for="conversation-answer">Your answer</label><textarea id="conversation-answer" data-pristine="true" maxlength="${field.max || 2000}" rows="3">${esc(values[field.key] || '')}</textarea>${field.choices ? '<div class="conversation-choices">' + field.choices.map((c, i) => '<button type="button" data-conversation-choice="' + i + '">' + esc(c.label) + '</button>').join('') + '</div>' : ''}<button id="conversation-next" class="primary">Next</button><button type="button" id="conversation-keep">Keep current</button></form>`}${step ? '<button id="conversation-back">Go back</button>' : ''}<p class="error" id="conversation-error" role="alert"></p></section>`,
    );
    $('dialog').scrollTop = 0;
    $('conversation-speech').onclick = () => {
      listening = !listening;
      if (listening) {
        $('conversation-speech').textContent = 'Pause microphone';
        speak(question);
      } else {
        halt();
        $('conversation-speech').textContent = 'Speak and listen';
      }
    };
    if (step)
      $('conversation-back').onclick = () => {
        if (field) values[field.key] = $('conversation-answer').value;
        step--;
        draw();
      };
    if (review)
      $('conversation-confirm').onclick = async () => {
        const button = $('conversation-confirm');
        button.disabled = true;
        halt();
        try {
          await save({ ...values });
          cleanup();
          dialog(
            title,
            '<p role="status">' +
              esc(receipt) +
              '</p><button id="conversation-done">Done</button>',
          );
          $('conversation-done').onclick = () => $('dialog').close();
        } catch (error) {
          button.disabled = false;
          $('conversation-error').textContent =
            error.message || 'Could not save. Please try again.';
        }
      };
    else {
      $('conversation-answer').oninput = () => {
        $('conversation-answer').dataset.pristine = 'false';
      };
      $('conversation-form').onsubmit = (event) => {
        event.preventDefault();
        let answer = $('conversation-answer').value.trim();
        if (answer.length > (field.max || 2000)) {
          $('conversation-error').textContent =
            'Please shorten this answer before continuing.';
          return;
        }
        if (field.choices) {
          const choice = field.choices.find(
            (c) =>
              c.value === answer ||
              c.label.toLowerCase() === answer.toLowerCase().replace(/[.!?]+$/, ''),
          );
          if (!choice) {
            $('conversation-error').textContent =
              'Choose or say one of the listed options.';
            return;
          }
          answer = choice.value;
        }
        values[field.key] = answer;
        step++;
        draw();
      };
      $('conversation-keep').onclick = () => {
        step++;
        draw();
      };
      document.querySelectorAll('[data-conversation-choice]').forEach(
        (b) =>
          (b.onclick = () => {
            $('conversation-answer').value =
              field.choices[Number(b.dataset.conversationChoice)].label;
          }),
      );
    }
    if (listening)
      speak(
        question +
          (review
            ? ' ' +
              fields
                .map((f) => f.label + ': ' + (values[f.key] || 'not set'))
                .join('. ') +
              '. Say confirm these changes to save.'
            : ''),
      );
  }
  draw();
}

function conversationalWorkspace(initial = {}) {
  conversationAction({
    title: 'Let’s shape your workspace',
    initial: { ...X.settings, ...initial },
    fields: [
      {
        key: 'objective',
        label: 'Current objective',
        question:
          'What would you like your workspace to help you move towards?',
      },
      {
        key: 'needs',
        label: 'What helps',
        question: 'What would make working on that easier for you?',
      },
      {
        key: 'role',
        label: 'Your role',
        question: 'How would you describe your role or current chapter?',
        max: 100,
      },
      {
        key: 'presentation',
        label: 'Presentation',
        question:
          'Would you prefer a balanced view, one step at a time, or the bigger picture?',
        choices: [
          { value: 'balanced', label: 'A balanced view' },
          { value: 'one-step', label: 'One step at a time' },
          { value: 'overview', label: 'The bigger picture' },
        ],
      },
    ],
    save: async (values) => {
      const next = {
        role: values.role,
        objective: values.objective,
        needs: values.needs,
        presentation: values.presentation,
      };
      if (window.akiliiSupport?.flags.demo) {
        Object.assign(X.settings, next);
        document.documentElement.dataset.presentation = next.presentation;
        renderSmartPrompts();
        return;
      }
      await api('workspace', 'POST', next);
      await loadWorkspace();
    },
    receipt: window.akiliiSupport?.flags.demo
      ? 'Applied for this demo session only. No account preferences were saved.'
      : 'Your workspace choices are saved. They are included in AI context only when Use my context is enabled.',
  });
}
function conversationVoiceMenu() {
  dialog(
    'Talk with akilii',
    `<p>Choose a live voice conversation, or speak into a draft you can review. Your existing message draft stays in place.</p><button id="conversation-live">Full live voice · speak and type</button><button id="conversation-workspace-live">Talk freely about my workspace</button><button id="conversation-workspace">Talk through my workspace</button><button id="conversation-dictate">Dictate my message</button><p>Live voice uses the connected cloud service. Browser dictation may use your browser provider. Both require microphone permission.</p><p id="conversation-voice-note" role="status"></p>`,
  );
  $('conversation-workspace-live').onclick = () => {
    if (
      window.akiliiSupport?.flags.demo ||
      window.akiliiAuth?.mode === 'local'
    ) {
      $('conversation-voice-note').textContent =
        'Free-flowing AI voice needs a connected cloud workspace. You can use the spoken walkthrough here.';
      return;
    }
    voiceDialog({ discovery: true, workspace: true });
  };
  $('conversation-workspace').onclick = () => conversationalWorkspace();
  $('conversation-live').onclick = () => {
    if (
      window.akiliiSupport?.flags.demo ||
      window.akiliiAuth?.mode === 'local'
    ) {
      $('conversation-voice-note').textContent =
        'Live AI voice requires a connected cloud workspace. This mode does not provide it. The spoken workspace walkthrough is available when your browser supports speech recognition.';
      return;
    }
    voiceDialog();
  };
  $('conversation-dictate').onclick = () => {
    if ($('mic').disabled) {
      $('conversation-voice-note').textContent =
        'Dictation is unavailable in this mode. Use system dictation, or the spoken workspace walkthrough.';
      return;
    }
    $('dialog').close();
    $('mic').click();
  };
}
window.akiliiConversation = {
  action: conversationAction,
  workspace: conversationalWorkspace,
  voice: conversationVoiceMenu,
};
