import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { ApiError, createApiClient } from '../app/web/api-client.js';
import { PRIMARY_VIEWS, routeFor, viewFromLocation } from '../app/web/router.js';
import { createShell } from '../app/web/shell.js';
import { createWebStore } from '../app/web/state.js';

function withDom(run) {
  const dom = new JSDOM('<!doctype html><div id="app"></div>', { url: 'https://akilii.example/#/home' });
  const previous = { document: globalThis.document, Node: globalThis.Node, Element: globalThis.Element };
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  globalThis.Element = dom.window.Element;
  try { return run(dom.window); }
  finally {
    globalThis.document = previous.document;
    globalThis.Node = previous.Node;
    globalThis.Element = previous.Element;
    dom.window.close();
  }
}

test('the web store has one explicit observable state boundary', () => {
  const store = createWebStore({ status: 'ready' });
  const seen = [];
  const unsubscribe = store.subscribe(state => seen.push(state.view));
  store.patch({ view: 'chat' });
  store.patch(state => ({ view: state.view === 'chat' ? 'work' : 'home' }));
  unsubscribe();
  store.patch({ view: 'home' });
  assert.deepEqual(seen, ['chat', 'work']);
  assert.equal(store.getState().view, 'home');
});

test('Home Chat and Work are the only primary navigation routes', () => {
  assert.deepEqual([...PRIMARY_VIEWS], ['home', 'chat', 'work']);
  assert.equal(PRIMARY_VIEWS.includes('context'), false);
  assert.equal(routeFor('context'), '#/context');
  assert.equal(viewFromLocation({ hash: '#/context' }), 'context');
  assert.equal(viewFromLocation({ hash: '#/unknown' }), 'home');
});

test('API client exposes useful errors without leaking transport payload shape', async () => {
  const client = createApiClient({
    fetchImpl: async () => new Response(JSON.stringify({ error: { code: 'VERSION_CONFLICT', message: 'Context changed.' } }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    }),
  });
  await assert.rejects(
    client.getContext(),
    error => error instanceof ApiError && error.status === 409 && error.code === 'VERSION_CONFLICT' && error.message === 'Context changed.',
  );
});

test('shell renders three primary destinations and a separate My akilii control', () => withDom(() => {
  const root = document.getElementById('app');
  const store = createWebStore({ status: 'ready', view: 'home' });
  const actions = { navigate() {}, openThread() {}, sendMessage() {}, confirmContext() {}, rejectContext() {}, toggleContext() {}, deleteContext() {} };
  const shell = createShell({ root, store, actions });

  const primary = [...root.querySelectorAll('.primary-nav .nav-item')].map(node => node.textContent);
  assert.deepEqual(primary, ['Home', 'Chat', 'Work']);
  assert.equal(root.querySelector('.secondary-nav .context-link').textContent, 'My akilii');
  assert.equal(root.querySelectorAll('.primary-nav .context-link').length, 0);
  assert.equal(root.querySelector('[data-view="home"]') !== null, true);
  shell.destroy();
}));

test('shell exposes calm loading and truthful error states', () => withDom(() => {
  const root = document.getElementById('app');
  const store = createWebStore();
  const actions = { navigate() {}, openThread() {}, sendMessage() {}, confirmContext() {}, rejectContext() {}, toggleContext() {}, deleteContext() {} };
  const shell = createShell({ root, store, actions });
  assert.match(root.textContent, /Opening your akilii space/i);

  store.patch({ status: 'error', error: new Error('Service unavailable.') });
  assert.match(root.textContent, /could not open this workspace/i);
  assert.match(root.textContent, /Service unavailable/i);
  assert.match(root.textContent, /saved data has not been changed/i);
  shell.destroy();
}));
