/* The only adapter from Phase 8 modules to the legacy shared application. */
window.akiliiSupport?.install({
  composerContext: () => {
    const entries = [];
    if (S.mode !== 'Auto')
      entries.push({
        id: 'mode',
        label: S.mode,
        remove: () => document.querySelector('[data-mode="Auto"]').click(),
      });
    if (S.model !== 'gpt-5.4-mini' && !window.akiliiSupport.flags.demo)
      entries.push({
        id: 'model',
        label: $('model-choice').textContent,
        remove: () => {
          S.model = 'gpt-5.4-mini';
          $('model-choice').textContent = 'GPT-5.4 mini';
        },
      });
    if ($('work-tools').checked && !$('work-tools').disabled)
      entries.push({
        id: 'work',
        label: 'Work lookup',
        remove: () => {
          $('work-tools').checked = false;
        },
      });
    const project = X.projects.find((p) => p.id === X.projectId);
    if (project && $('use-context').checked)
      entries.push({
        id: 'project',
        label: project.title,
        remove: () => {
          X.projectId = null;
          applyWorkspace();
        },
      });
    if (supportInstruction() !== 'standard')
      entries.push({
        id: 'style',
        label:
          {
            focus: 'One step at a time',
            gentle: 'Gentler pace',
            engage: 'Different approach',
          }[supportInstruction()] + ' · session',
        remove: () => applySupportState('standard'),
      });
    return entries;
  },
  discuss: (item, objective) => {
    if($('message-input').value.trim())return toast('Keep or clear your existing draft first.');
    view('chat');$('message-input').value='Help me think through “'+item.title+'” for “'+objective+'”. The supplied context is: '+item.detail+' Ask one useful question before suggesting a next move.';
    $('message-input').dispatchEvent(new Event('input',{bubbles:true}));$('message-input').focus();
  },
  surface: () => S.view,
  thread: () => phase7ResumableThread(),
  refreshPrompts: () => renderSmartPrompts(),
  workItems: () => S.data?.work || [],
  useContext: () => $('use-context').checked,
  escape: esc,
  dialog,
  closeDialog: () => $('dialog').close(),
  resetChat: () => {
    resetChat();
    $('messages').replaceChildren();
  },
  chat: () => view('chat'),
  work: () => view('work'),
  api,
  propose: (title, body) =>
    phase7ProposeWork(title, body).catch((error) => toast(error.message)),
  addMessage: (role, content) => addMessage({ role, content }),
  clearComposer: () => {
    $('message-input').value = '';
    $('message-input').dispatchEvent(new Event('input', { bubbles: true }));
  },
});

// Commands only navigate or insert a draft. They never send, approve or overwrite it.
window.akiliiDesktop?.onCommand?.((command) => {
  if ($('application').hidden) {
    toast('Continue to your space first, then reopen the quick panel.');
    return;
  }
  if (command.action === 'capture') {
    if ($('message-input').value.trim()) {
      toast(
        'Keep or clear your existing draft first. Your quick capture remains in the menu bar.',
      );
      return;
    }
    view('chat');
    $('message-input').value = command.text;
    $('message-input').dispatchEvent(new Event('input', { bubbles: true }));
    $('message-input').focus();
  } else if (command.action === 'resume') {
    const thread = phase7ResumableThread();
    if (thread)
      phase7ResumeThread(thread.id).catch((error) => toast(error.message));
    else {
      view('home');
      toast('No held Thread to resume yet.');
    }
  } else if (['home', 'work'].includes(command.action)) view(command.action);
});
