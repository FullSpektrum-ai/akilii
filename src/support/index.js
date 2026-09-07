import { domainModules, domainFixture } from './domains.js';
import { installFloatingComposer } from './composer.js';
import { episodePrompts } from './prompts.js';
import { episodeContext, validateSupportPlan } from './contracts.js';
import { resolveSupport, explicitRepresentation } from './resolver.js';
import { createTelemetry } from './telemetry.js';
import { renderSupport, button } from './renderer.js';
import { flagshipFixture } from './fixtures.js';
import { createDemoStore } from './demo-store.js';
const params = new URLSearchParams(location.search);
const enabled = ['on', 'demo'].includes(params.get('phase8')) || (window.akiliiPhase8Default === true && params.get('phase8') !== 'off');
const demo = enabled && params.get('phase8') === 'demo';
const flags = Object.freeze({
  enabled,
  demo,
  planner: enabled && !demo && params.get('planner') === 'on',
  learning: enabled && params.get('learning') !== 'off',
});
const telemetry = createTelemetry();
let bridge,
  context = null,
  plan = null,
  draft = '',
  requestNumber = 0,
  sessionProjection = [];
let demoApi;
if (demo) {
  try {
    demoApi = createDemoStore(localStorage);
  } catch (error) {
    demoApi = async () => {
      throw error;
    };
  }
}
function mount() {
  if (!enabled || !context || !plan || !bridge) return;
  document.getElementById('phase8-canvas')?.remove();
  const target =
    bridge.surface() === 'chat'
      ? document.getElementById('messages')
      : document.getElementById('content-view');
  const canvas = renderSupport(context, plan, {
    override,
    why,
    objective: changeObjective,
    draft: editDraft,
    explore: item=>bridge.discuss(item,context.objective),
  });
  canvas.id = 'phase8-canvas';
  target.append(canvas);
  if (bridge.surface() === 'chat')
    target.scrollTop = canvas.offsetTop - target.offsetTop;
  document.getElementById('message-input').placeholder = plan.composer;
}
function apply(input) {
  const start = performance.now();
  context = episodeContext({
    ...input,
    useContext: bridge?.useContext() !== false,
  });
  plan = resolveSupport(context);
  telemetry.record('resolved', {
    source: 'rules',
    representation: plan.representation,
    latencyMs: performance.now() - start,
    costUsd: 0,
    costKind: 'no_provider_call',
  });
  mount();
  bridge?.refreshPrompts();
}
function override(representation) {
  telemetry.record('override', {
    from: plan.representation,
    to: representation,
  });
  apply({ ...context, override: representation });
  document.querySelector(`#phase8-canvas [aria-pressed=true]`)?.focus();
}
function why() {
  bridge.dialog(
    'Why this support?',
    `<p>${bridge.escape(plan.reason)}</p><p>Presentation can change. Your saved Work, permissions and Thread state do not change with it.</p><h3>Context in use</h3><p>${context.projection.length ? context.projection.map((p) => bridge.escape(p.source + ': ' + p.value)).join('<br>') : 'Only the message and items explicitly supplied in this episode.'}</p><p>No profile, health context, passive behaviour or automatic learning is used.</p><button id="phase8-clear-context">Use this episode only</button>`,
  );
  document.getElementById('phase8-clear-context').onclick = () => {
    apply({ ...context, projection: [], override: null });
    bridge.closeDialog();
  };
}
function changeObjective() {
  window.akiliiConversation.action({
    title: 'Let’s choose what matters now',
    initial: { objective: context.objective },
    fields: [
      {
        key: 'objective',
        label: 'Current objective',
        question: 'What would you like to move towards now?',
        max: 300,
      },
    ],
    save: async (value) =>
      apply({
        ...context,
        objective: value.objective,
        override: 'bounded_workset',
      }),
    receipt: 'The focus of this session has changed. Saved Work is unchanged.',
  });
}

function editDraft() {
  const canvas = document.getElementById('phase8-canvas');
  canvas.querySelector('.support-draft')?.remove();
  const section = document.createElement('section');
  section.className = 'support-draft';
  const label = document.createElement('label');
  label.textContent = 'Live draft · not saved';
  const area = document.createElement('textarea');
  area.value = draft;
  area.maxLength = 14000;
  area.placeholder =
    context.items.find((i) => i.id === plan.foregroundIds[0])?.detail ||
    'Write a useful first version…';
  area.oninput = () => {
    draft = area.value;
  };
  label.append(area);
  section.append(
    label,
    button('Propose saving to Work', () =>
      bridge.propose(context.objective || 'Useful draft', area.value),
    ),
  );
  canvas.append(section);
  area.focus();
}
function learningProposal() {
  if (!flags.learning) return;
  bridge.dialog(
    'A support preference to consider',
    `<p>Would you like this view suggested in similar planning moments?</p><p>This is a conceptual governed-learning proposal. There is no automatic NPR learning or lasting preference saved by these controls.</p><button id="phase8-session-preference">Use for this session</button><button id="phase8-decline-preference">No thanks</button>`,
  );
  document.getElementById('phase8-session-preference').onclick = () => {
    if (context && plan) {
      sessionProjection = [
        {
          id: 'chosen-view',
          source: 'session',
          included: true,
          value: plan.representation,
        },
      ];
      apply({ ...context, override: null, projection: sessionProjection });
    }
    telemetry.record('learning_session_choice');
    bridge.closeDialog();
  };
  document.getElementById('phase8-decline-preference').onclick = () => {
    telemetry.record('learning_declined');
    bridge.closeDialog();
  };
}
function install(value) {
  bridge = value;
  installFloatingComposer(() => [
    ...bridge.composerContext(),
    ...(bridge.useContext() ? sessionProjection : []).map((entry) => ({
      id: entry.id,
      label: 'Support: ' + entry.value.replaceAll('_', ' ') + ' · session',
      remove: () => {
        sessionProjection = sessionProjection.filter(
          (item) => item.id !== entry.id,
        );
        if (context) apply({ ...context, projection: sessionProjection });
        telemetry.record('learning_session_removed');
      },
    })),
  ]);
  if (!enabled) return;
  document.getElementById('use-context').addEventListener('change', () => {
    if (context)
      apply({
        ...context,
        projection: bridge.useContext() ? sessionProjection : [],
      });
  });
  if (demo) {
    for (const id of [
      'model-choice',
      'plus',
      'mic',
      'work-tools',
      'project-scope',
    ]) {
      const control = document.getElementById(id);
      if (control) {
        control.disabled = true;
        control.title = 'Unavailable in the synthetic demo';
      }
    }
    document.getElementById('model-choice').textContent = 'Synthetic fixture';
    document.getElementById('send').addEventListener(
      'click',
      (event) => {
        if (!document.getElementById('message-input').value.trim()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true,
    );
  }
  const banner = document.createElement('div');
  banner.className = 'support-banner';
  banner.id = 'phase8-banner';
  const label = document.createElement('span');
  label.textContent = demo
    ? 'Synthetic demo · no provider calls'
    : 'Phase 8 support preview';
  banner.append(label);
  if (demo) {
    const picker = document.createElement('select');
    picker.setAttribute('aria-label', 'Choose a synthetic domain story');
    picker.className = 'support-domain-picker';
    for (const item of [
      { id: '', label: 'Choose a domain story' },
      ...domainModules,
    ]) {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.label;
      picker.append(option);
    }
    picker.onchange = () => {
      if (!picker.value) return;
      const fixture = domainFixture(picker.value);
      bridge.dialog(
        'Start ' +
          domainModules.find((item) => item.id === picker.value).label +
          ' story?',
        '<p>This fictional story replaces the current demo canvas. Saved Work and held Threads remain available. Sport and wellness examples are everyday planning, not assessment or treatment.</p><button id="start-domain-story">Start this story</button>',
      );
      document.getElementById('start-domain-story').onclick = () => {
        requestNumber++;
        draft = '';
        bridge.resetChat();
        apply({
          ...fixture,
          surface: 'chat',
          projection: bridge.useContext() ? sessionProjection : [],
        });
        bridge.addMessage('user', fixture.message);
        mount();
        telemetry.record('domain_selected', { domain: picker.value });
        bridge.closeDialog();
      };
    };
    banner.append(picker);
  }
  if (demo)
    banner.append(
      button('Start flagship story', () => {
        requestNumber++;
        draft = '';
        bridge.resetChat();
        apply({
          ...structuredClone(flagshipFixture),
          surface: 'chat',
          projection: sessionProjection,
        });
        bridge.addMessage('user', flagshipFixture.message);
        mount();
      }),
    );
  banner.append(
    button('Demo trace', () =>
      bridge.dialog(
        'Support trace',
        `<p>Session metadata only. Zero cost denotes no provider call; unknown cost is not estimated.</p><pre style="white-space:pre-wrap">${bridge.escape(JSON.stringify(telemetry.snapshot(), null, 2))}</pre>`,
      ),
    ),
  );
  const off = button('Turn off', () => {
    const url = new URL(location.href);
    url.searchParams.delete('phase8');
    url.searchParams.delete('planner');
    location.href = url.href;
  });
  if (!window.akiliiMobileDemo) banner.append(off);
  if (demo || params.get('debug') === 'on') document.querySelector('.workspace-header').after(banner);
}
function beforeSend(message) {
  if (!enabled) return false;
  if (bridge.surface() !== 'chat') bridge.chat();
  const ticket = ++requestNumber;
  const next = {
    ...(context || {}),
    surface: 'chat',
    message,
    override: explicitRepresentation(message) ? null : context?.override,
    projection: sessionProjection,
    useContext: bridge.useContext(),
    objective: context?.objective || message.slice(0, 300),
    items: context?.items.length
      ? context.items
      : [
          {
            id: 'message',
            title: message.slice(0, 160),
            detail: 'Your explicitly supplied starting point.',
            relation: 'open',
          },
        ],
  };
  if (demo) {
    bridge.addMessage('user', message);
    bridge.clearComposer();
    if (!explicitRepresentation(message)) draft = message;
    apply(next);
    bridge.addMessage('assistant', 'Demo preview only: I have arranged your words into a support view. No AI model was called, so this is not a generated answer. To have a real conversation, open https://akilii.fullspektrum.ai/ without ?phase8=demo and sign in.');
    return true;
  }
  apply(next);
  if (flags.planner) {
    (async () => {
      try {
        const result = await bridge.api('support/plan', 'POST', next);
        if (ticket !== requestNumber) return false;
        plan = validateSupportPlan(result.plan, context);
        telemetry.record('planned', result.trace);
        mount();
      } catch {
        telemetry.record('fallback', {
          source: 'rules',
          failure: 'endpoint_unavailable',
        });
      }
    })();
  }
  return false;
}
function surface(name) {
  if (!bridge) return;
  bridge.refreshPrompts();
  document.querySelector('.support-composer-dock').hidden = ![
    'home',
    'chat',
    'work',
    'projects',
  ].includes(name);
  if (!enabled) return;
  if (name === 'home' && context) {
    const panel = document.createElement('section');
    panel.className = 'support-salience';
    const p = document.createElement('p');
    p.textContent = 'In this session · ' + context.objective;
    panel.append(
      p,
      button('Continue this thought', () => {
        bridge.chat();
        mount();
      }),
    );
    document.getElementById('content-view').prepend(panel);
  }
  if (name === 'work' && context) {
    const panel = document.createElement('p');
    panel.className = 'support-salience';
    panel.textContent =
      'Suggested focus · ' +
      context.objective +
      ' · saved item states are unchanged.';
    document.getElementById('content-view').prepend(panel);
    for (const button of document.querySelectorAll('[data-edit-work]')) {
      const item = bridge
        .workItems()
        .find((w) => w.id === button.dataset.editWork);
      if (item?.title === context.objective)
        button.closest('.content-card')?.classList.add('support-salient');
    }
  }
  if (name === 'chat' && context) mount();
}
function resume(thread) {
  if (!enabled) return;
  requestNumber++;
  draft = '';
  apply({
    objective: thread.objective || thread.title,
    surface: 'resume',
    items: [
      {
        id: thread.id,
        title: thread.next_move || 'Choose the next useful move',
        detail: thread.last_confirmed,
        relation: 'can_move',
      },
    ],
    projection: [],
    override: 'one_next_move',
  });
  telemetry.record('thread_resume', { source: 'confirmed_thread' });
}
function outcome() {
  if (!enabled) return;
  bridge.work();
  if (!flags.learning) return;
  const b = button('Review a support suggestion', learningProposal);
  document.getElementById('dialog-content').append(b);
}
function clear() {
  if (!enabled) return;
  requestNumber++;
  context = null;
  plan = null;
  draft = '';
  document.getElementById('phase8-canvas')?.remove();
}
function promptOptions(options) {
  if (!enabled || !bridge) return null;
  return episodePrompts({
    ...options,
    context,
    plan,
    surface: bridge.surface(),
    thread: bridge.thread(),
    work: bridge.workItems(),
  });
}
window.akiliiSupport = {
  promptOptions,
  clear,
  flags,
  demoApi,
  install,
  beforeSend,
  surface,
  resume,
  outcome,
  telemetry,
};
