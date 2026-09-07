import icons from '../../assets/icon_exports.json';
/** Move existing controls into one floating dock. Their IDs and handlers survive. */
export function installFloatingComposer(readContext = () => []) {
  const workspace = document.querySelector('.workspace');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const chips = document.getElementById('smart-prompts');
  const controls = form.querySelector('.composer-controls');
  const dock = document.createElement('div');
  dock.className = 'support-composer-dock';
  const options = document.createElement('details');
  options.className = 'support-composer-options';
  const summary = document.createElement('summary');
  summary.innerHTML = icons.close.replaceAll('#171B18', 'currentColor');
  summary.querySelector('svg').setAttribute('aria-hidden', 'true');
  summary.title = 'Add context or change approach';
  summary.setAttribute('aria-label', 'Composer options');
  const panel = document.createElement('div');
  panel.className = 'support-composer-popover';
  panel.append(controls);
  for (const id of [
    'support-checkin',
    'project-scope',
    'smart-prompts-toggle',
  ]) {
    const control = document.getElementById(id);
    if (control) panel.append(control);
  }
  const note = document.querySelector('.composer-note');
  if (note) panel.append(note);
  // One compact action sheet; retain the canonical handlers and control IDs.
  const actionMenu = document.getElementById('plus-menu');
  const legacyPlus = document.getElementById('plus');
  if (actionMenu && legacyPlus) {
    legacyPlus.hidden = true;
    actionMenu.hidden = false;
    const actions = document.createElement('section');
    actions.className = 'composer-action-section';
    actions.setAttribute('aria-label', 'Add to this conversation');
    actions.append(actionMenu);
    panel.prepend(actions);
    options.addEventListener('toggle', () => { actionMenu.hidden = !options.open; });
    // The legacy menu closes itself after actions; the enclosing sheet follows it.
    new MutationObserver(() => {
      if (actionMenu.hidden && options.open) options.open = false;
    }).observe(actionMenu, {attributes:true, attributeFilter:['hidden']});
    panel.addEventListener('click', event => event.stopPropagation());
  }
  const preferences = document.createElement('details');
  preferences.className = 'composer-preferences';
  const preferencesTitle = document.createElement('summary');
  preferencesTitle.textContent = 'Model, context & preferences';
  preferences.append(preferencesTitle, controls);
  for (const id of ['project-scope', 'support-checkin', 'smart-prompts-toggle']) {
    const control = document.getElementById(id);
    if (control) preferences.append(control);
  }
  panel.append(preferences);
  document.addEventListener('pointerdown', event => {
    if (options.open && !options.contains(event.target)) options.open = false;
  });
  options.append(summary, panel);
  const send = controls.querySelector('#send');
  form.prepend(options);
  form.append(send);
  // Reuse dictation's original button so its state, permissions and handler survive.
  const voice = document.getElementById('mic');
  voice.title = 'Dictate a message';
  form.append(voice);
  const shelf = document.createElement('div');
  shelf.className = 'support-composer-context';
  shelf.setAttribute('aria-label', 'Selected message context');
  const tokens = document.createElement('div');
  tokens.className = 'support-composer-tokens';
  shelf.append(tokens);
  const attachment = document.getElementById('attachment-chip');
  if (attachment) shelf.append(attachment);
  form.prepend(shelf);
  let previous = '';
  const refresh = () => {
    const entries = readContext();
    const signature = JSON.stringify(
      entries.map(({ id, label }) => [id, label]),
    );
    if (signature !== previous) {
      previous = signature;
      tokens.replaceChildren(
        ...entries.map((entry) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'support-context-token';
          button.textContent = entry.label + ' ×';
          button.setAttribute('aria-label', 'Remove ' + entry.label);
          button.onclick = () => {
            entry.remove();
            refresh();
            input.focus();
          };
          return button;
        }),
      );
    }
    shelf.hidden = !entries.length && (!attachment || attachment.hidden);
    resize();
  };
  input.rows = 1;
  dock.append(chips, form);
  workspace.append(dock);
  workspace.classList.add('support-floating');
  const resize = () => {
    input.style.height = '0px';
    const height = Math.min(
      Math.max(88, window.innerHeight * 0.22),
      Math.max(44, input.value ? input.scrollHeight : 44),
    );
    input.style.height = height + 'px';
    form.classList.toggle('is-expanded', height > 44 || !shelf.hidden);
  };
  input.addEventListener('input', resize);
  // Read authoritative selections after existing handlers, including dialog choices.
  document.addEventListener('click', () => queueMicrotask(refresh));
  form.addEventListener('change', refresh);
  new MutationObserver(refresh).observe(panel, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  if (attachment)
    new MutationObserver(refresh).observe(attachment, {
      attributes: true,
      childList: true,
    });
  let width = 0;
  new ResizeObserver(([entry]) => {
    if (entry.contentRect.width !== width) {
      width = entry.contentRect.width;
      resize();
    }
  }).observe(form);
  window.addEventListener('resize', resize);
  refresh();
  options.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      options.open = false;
      summary.focus();
      event.stopPropagation();
    }
  });
  // Reserve only enough end padding to reach the final content above the floating objects.
  const measure = () =>
    workspace.style.setProperty(
      '--support-dock-height',
      Math.ceil(dock.getBoundingClientRect().height + 32) + 'px',
    );
  new ResizeObserver(measure).observe(dock);
  measure();
  return { resize };
}
